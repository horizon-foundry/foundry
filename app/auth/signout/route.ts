import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseForRequest, publicOrigin } from "@/lib/supabase";

// POST-only sign-out (a GET link could be triggered by prefetch). Uses the
// request-scoped client so the cookie clears land on the returned redirect.
// The redirect carries the public origin, never request.url (see publicOrigin).
export async function POST(request: NextRequest) {
  const redirect = () =>
    NextResponse.redirect(new URL("/unlock", publicOrigin(request)), {
      status: 303,
    });

  const ctx = getSupabaseForRequest(request);
  if (!ctx) return redirect();

  await ctx.supabase.auth.signOut();
  return ctx.applyCookies(redirect());
}
