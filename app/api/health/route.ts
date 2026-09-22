import { NextResponse } from "next/server";
import { getSupabaseAnonymous } from "@/lib/supabase";

// Per-request on purpose: the endpoint exists to generate Supabase database
// activity, and a cached response would generate none. `force-dynamic` governs
// Next's cache; the no-store header below governs everyone else's.
export const dynamic = "force-dynamic";

/**
 * GET /api/health
 *
 * Supabase keep-alive target, pinged ONCE A DAY by the scheduled workflow in
 * the Save-Savor repo (that repo covers every app, because GitHub disables
 * schedules in repos quiet for 60 days and a keep-alive lives in quiet repos).
 *
 * NOT the Fly health check target. fly.toml checks `/` every 30 seconds; point
 * that at this route and it would fire a Postgres query 2,880 times a day,
 * forever, on a free-tier project. Frequency is the whole design here: daily.
 *
 * Because the URL is public, unauthenticated, and uncacheable, frequency
 * cannot be left to the caller's good manners: a loop against it would drive
 * sustained load through a free-tier PostgREST pool that real /reports
 * sign-ins share. THROTTLE_MS bounds that to one real query per minute per
 * machine, and requests inside the window are answered from the last verdict.
 * The daily ping is many orders of magnitude outside the window, so the
 * keep-alive itself always performs a real query; only abuse gets the cache.
 * A shared-secret header would be tighter, but it needs a secret set in two
 * repos, and the cheap bound that ships today beats the tight one that waits.
 *
 * Free-tier projects pause after seven days of inactivity, and Supabase
 * documents the criterion as "user database activity", so a query that reaches
 * Postgres is the reading that cannot be wrong. This project's Supabase is
 * auth-only (no tables; reports are JSON files), so the target is a SQL
 * function that stores nothing:
 *
 *   create function public.ping() returns timestamptz language sql
 *     as $$ select now() $$;
 *   grant execute on function public.ping() to anon;
 *
 * The DDL has no other home in this repo, so keep this comment authoritative.
 *
 * The health contract is deliberately strict: healthy means Postgres RETURNED
 * A PARSEABLE TIMESTAMP, which nothing but a real execution of that function
 * produces. It is not "the route did not throw", and it is not "an error came
 * back carrying an error code". Both of those were satisfied by the previous
 * implementation, which called `auth.getUser()` with no session; supabase-js
 * resolves that from local state and never opens a socket, so eight
 * consecutive green pings generated zero Supabase activity and the project was
 * paused anyway. An assertion a broken system satisfies is not an assertion.
 *
 * Anything short of that timestamp returns 503 so the scheduled ping fails
 * loudly rather than masking a dead heartbeat. That includes the deploy window
 * before the function exists: PostgREST answers PGRST202 for an unknown
 * function, which generates no database activity, so a red job during that
 * window is correct and means the DDL above still needs running.
 *
 * Public and unauthenticated by design; it returns liveness only, and every
 * diagnostic goes to the server log rather than the response body. The client
 * reads no cookies (see getSupabaseAnonymous) so no caller can steer it.
 */

const NO_STORE = { "Cache-Control": "no-store" } as const;

// Upstream strings reach this log, so flatten newlines and cap the length:
// a log line must not be forgeable into looking like several.
function logSafe(value: unknown, limit = 200): string {
  const text = typeof value === "string" ? value : JSON.stringify(value) ?? String(value);
  // Flatten whitespace AND strip C0 controls: escape sequences must not reach
  // a log viewer, and one log line must not be forgeable into looking like two.
  return text.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").slice(0, limit);
}

function unhealthy(reason: string) {
  console.error(`[health] ${reason}`);
  return NextResponse.json({ ok: false }, { status: 503, headers: NO_STORE });
}

function healthy() {
  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}

// One real database query per minute per machine. Module scope, so it resets
// when Fly auto-stops the machine; a cold start therefore always probes for
// real, which is the behaviour the daily ping needs anyway.
const THROTTLE_MS = 60_000;
let lastVerdict: { at: number; ok: boolean } | null = null;

export async function GET() {
  const now = Date.now();
  if (lastVerdict && now - lastVerdict.at < THROTTLE_MS) {
    // Deliberately silent: the whole point is that a flood costs nothing, and
    // logging per request would just move the amplification into the log.
    return lastVerdict.ok
      ? healthy()
      : NextResponse.json({ ok: false }, { status: 503, headers: NO_STORE });
  }

  const record = (ok: boolean) => {
    lastVerdict = { at: Date.now(), ok };
  };

  try {
    const supabase = getSupabaseAnonymous();
    if (!supabase) {
      // Env unset: /reports auth is already gated closed. Report unhealthy so
      // the scheduled ping surfaces the misconfiguration instead of masking it.
      record(false);
      return unhealthy("Supabase env missing; no ping was sent.");
    }

    const { data, error } = await supabase.rpc("ping");

    if (error) {
      // A missing EXECUTE grant (42501) IS a real round trip, since Postgres
      // raises it; a transport failure and PGRST202 are not. All three are
      // misconfigurations worth failing on, so the log names the code rather
      // than claiming which side of that line this one fell on.
      record(false);
      return unhealthy(
        `ping failed: ${logSafe(error.code || "no-code", 40)} ${logSafe(error.message)}`,
      );
    }

    // Truthiness is not enough: `[]` and `{}` are truthy, and a `returns void`
    // redefinition of ping() would yield one of them from a perfectly healthy
    // database. Parse the timestamp, which only the real function can produce.
    if (typeof data !== "string" || Number.isNaN(Date.parse(data))) {
      record(false);
      return unhealthy(`ping returned no timestamp: ${logSafe(data)}`);
    }

    record(true);
    return healthy();
  } catch (err) {
    record(false);
    return unhealthy(`failed: ${logSafe(err instanceof Error ? err.message : String(err))}`);
  }
}
