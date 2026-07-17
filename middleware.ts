import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/*
  Session refresh for the gated /reports routes. Server Components cannot write
  cookies, so an expired access token could never be rotated by the layout's
  auth check alone; this middleware runs getUser() with request/response cookie
  wiring so refreshed tokens persist. If the Supabase env is missing the
  middleware is a no-op and the routes themselves fail closed.
*/

export async function middleware(request: NextRequest) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;

  let response = NextResponse.next({ request });
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Refreshes an expired access token as a side effect; the result itself is
  // not an access decision (the /reports layout and pages make that call).
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ["/reports/:path*"],
};
