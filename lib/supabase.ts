import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";

/*
  Supabase is used for AUTH ONLY (magic-link identity for /reports). Reports
  stay as JSON files in reports/; there is no database storage behind this.

  Fail-closed: if the Supabase env is missing, getSupabaseServer() returns null
  and every caller must treat that as "no session", so the reports routes deny
  access rather than open up. Same posture as the HMAC gate this replaced.

  Env (all read server-side only; deliberately NOT NEXT_PUBLIC_, which Next
  inlines at build time and the Docker image is built without secrets):
    SUPABASE_URL       Supabase project URL
    SUPABASE_ANON_KEY  publishable anon key (public by design; auth is
                       enforced by Supabase, not by hiding the key)
    ADMIN_EMAILS       comma-separated; sees ALL reports
*/

// Log the missing-env lockout once per server instance so a total, fail-closed
// lockout of every user is visible in the logs rather than silent (OPS).
let warnedMissingEnv = false;

export async function getSupabaseServer() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    if (!warnedMissingEnv) {
      console.error(
        "Supabase env (SUPABASE_URL / SUPABASE_ANON_KEY) missing; /reports auth is gated closed for every user.",
      );
      warnedMissingEnv = true;
    }
    return null;
  }

  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Components cannot write cookies; middleware.ts persists
          // refreshed tokens for the /reports routes instead.
        }
      },
    },
  });
}

// The public origin of a request, used to build the magic-link redirect target.
// Prefer a pinned, server-only origin so that target is never derived from a
// client-influenceable forwarded host (SEC: a spoofed X-Forwarded-Host could
// otherwise poison the emailed link). Set SITE_ORIGIN in production. Only when
// it is unset (local dev) does it fall back to the forwarded host, where the
// host is trusted and request.url carries the container bind address behind a
// proxy rather than the real host.
export function publicOrigin(request: {
  headers: { get(name: string): string | null };
}): string {
  const pinned = process.env.SITE_ORIGIN;
  if (pinned) return pinned.replace(/\/+$/, "");
  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    "localhost:3000";
  const proto = request.headers.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

// Route Handler variant. Auth calls (verifyOtp, exchangeCodeForSession,
// signOut) rotate session cookies mid-call; a handler that then returns its
// own NextResponse cannot count on cookies()-store mutations being merged onto
// that response, so this client buffers every cookie write and applyCookies()
// stamps them onto the exact response the handler returns. Deterministic,
// framework-version-proof.
export function getSupabaseForRequest(request: NextRequest) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const pending: {
    name: string;
    value: string;
    options?: Record<string, unknown>;
  }[] = [];

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        pending.push(...cookiesToSet);
      },
    },
  });

  const applyCookies = (response: NextResponse) => {
    pending.forEach(({ name, value, options }) =>
      response.cookies.set(name, value, options),
    );
    return response;
  };

  return { supabase, applyCookies };
}

// The verified signed-in user (id + normalized email), or null. Uses getUser()
// (validates the JWT with Supabase) rather than trusting the session cookie
// contents. The id doubles as the analytics distinct id (CLAUDE.md
// Instrumentation).
export async function getSessionUser(): Promise<{
  id: string;
  email: string;
} | null> {
  const supabase = await getSupabaseServer();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;
  return { id: user.id, email: user.email.toLowerCase() };
}

export async function getSessionEmail(): Promise<string | null> {
  return (await getSessionUser())?.email ?? null;
}

export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdmin(email: string | null): boolean {
  return !!email && adminEmails().includes(email);
}
