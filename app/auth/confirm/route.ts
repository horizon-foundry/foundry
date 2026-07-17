import { type EmailOtpType, type User } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseForRequest, publicOrigin } from "@/lib/supabase";
import { aliasServer, captureServer } from "@/lib/posthog-server";

/*
  Lands the magic-link click and establishes the session cookie, then sends the
  user into /reports. Two link shapes are accepted:

  - token_hash + type (primary): the Supabase email template links straight
    here and verifyOtp() exchanges the hash server-side. This shape is not
    PKCE-bound, so the link works even when opened in a different browser than
    the one that requested it (email opened on a phone, requested on a laptop).
  - code (fallback): the default Supabase template routes through its own
    /auth/v1/verify and redirects here with a PKCE code; exchangeCodeForSession
    covers that shape so an unconfigured template still signs in same-browser.

  The request-scoped client buffers the session cookies the auth call writes
  and applyCookies() stamps them onto the redirect response we return (a
  cookies()-store write is not reliably merged onto a self-built NextResponse).
  Any failure redirects to /unlock?error=expired; never half-establishes a session.
*/

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");

  // Redirects must carry the PUBLIC origin; request.url holds the container
  // bind address behind the Fly proxy (see publicOrigin).
  const origin = publicOrigin(request);
  const failure = new URL("/unlock?error=expired", origin);
  const success = new URL("/reports", origin);

  const ctx = getSupabaseForRequest(request);
  if (!ctx) {
    // Loud, not silent: a missing/broken Supabase client locks every user out
    // of /reports, so it must show up in the logs, not just fail closed (OPS).
    console.error(
      "Auth confirm: Supabase unavailable (env missing or client init failed); sign-in gated closed.",
    );
    captureServer(crypto.randomUUID(), "sign_in_failed", {
      reason: "unavailable",
    });
    return NextResponse.redirect(new URL("/unlock?error=unavailable", origin));
  }
  const { supabase, applyCookies } = ctx;

  // Funnel B auth stage. Success is keyed on the Supabase user id (THE
  // distinct id) and aliases the email id so magic_link_requested joins.
  // Failure identity is unknown, so a throwaway id just counts it.
  const track = (user: User | null, method: "token_hash" | "code") => {
    if (user) {
      if (user.email) aliasServer(user.id, user.email.toLowerCase());
      captureServer(user.id, "sign_in_completed", { method });
    } else {
      captureServer(crypto.randomUUID(), "sign_in_failed", {
        reason: "expired",
      });
    }
  };

  if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (error) console.error("Auth confirm: verifyOtp failed:", error.message);
    track(error ? null : data.user, "token_hash");
    return applyCookies(NextResponse.redirect(error ? failure : success));
  }

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error)
      console.error("Auth confirm: exchangeCodeForSession failed:", error.message);
    track(error ? null : data.user, "code");
    return applyCookies(NextResponse.redirect(error ? failure : success));
  }

  return NextResponse.redirect(failure);
}
