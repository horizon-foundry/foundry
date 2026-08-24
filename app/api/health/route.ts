import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase";

// Per-request on purpose: the endpoint exists to generate Supabase API
// activity, and a cached response would generate none.
export const dynamic = "force-dynamic";

/**
 * GET /api/health
 *
 * Supabase keep-alive target. Free-tier projects pause after seven days with
 * no API activity, and this project's Supabase (the /reports magic-link auth)
 * sees traffic only when someone signs in, so it pauses between visits and a
 * paused backend greets the next visitor with a broken sign-in. A daily ping
 * (GitHub Action in the Save-Savor repo, which covers every app; that repo
 * is the most actively committed one, and GitHub disables schedules in repos
 * quiet for 60 days) keeps it live for free.
 *
 * The call MUST reach Supabase; a 200 from Next alone proves nothing. Auth
 * is this project's only Supabase surface, so the ping is an anonymous
 * getUser round trip: success means the API answered, not that a user
 * exists. Public and unauthenticated by design; it returns liveness only.
 */
export async function GET() {
  try {
    const supabase = await getSupabaseServer();
    if (!supabase) {
      // Env unset: auth is already gated closed; report unhealthy so the
      // scheduled ping surfaces the misconfiguration instead of masking it.
      return NextResponse.json({ ok: false }, { status: 503 });
    }
    // No session cookie on a curl ping, so this returns an AuthSessionMissing
    // error AFTER a real round trip to the Supabase auth API, which is the
    // activity being generated. Only a transport failure means unreachable.
    const { error } = await supabase.auth.getUser();
    if (error && error.status === 0) {
      console.error("[health] supabase unreachable:", error.message);
      return NextResponse.json({ ok: false }, { status: 503 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[health] failed:", err instanceof Error ? err.message : String(err));
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
