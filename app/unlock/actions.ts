"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseServer, publicOrigin } from "@/lib/supabase";
import { captureServer } from "@/lib/posthog-server";

/*
  Magic-link sign-in for /reports. The action asks Supabase to email a one-time
  sign-in link; clicking it lands on /auth/confirm which establishes the session
  cookie. Identity is proven by receiving the email, so there is no allowlist
  here: anyone can sign in, and the reports routes then show only the reports
  they own (meta.owner match; ADMIN_EMAILS sees all).

  Redirects are the control flow, same shape as the old gate action.
*/

export async function requestMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!email || !email.includes("@")) {
    redirect("/unlock?error=invalid");
  }

  const supabase = await getSupabaseServer();
  if (!supabase) {
    // Supabase env missing, fail closed rather than pretend a link was sent.
    redirect("/unlock?error=unavailable");
  }

  // The emailed link must return to the same public host (Fly proxies, hence
  // the x-forwarded-* headers inside publicOrigin).
  const origin = publicOrigin({ headers: await headers() });
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/auth/confirm` },
  });

  if (error) {
    redirect("/unlock?error=failed");
  }
  // Funnel B intent stage, keyed on the email; sign_in_completed aliases this
  // id to the Supabase user id so the stages join. Not awaited (see
  // lib/posthog-server.ts reliability posture).
  captureServer(email, "magic_link_requested");
  redirect(`/unlock?sent=${encodeURIComponent(email)}`);
}
