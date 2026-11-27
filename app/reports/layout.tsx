import { getSessionUser, isAdmin } from "@/lib/supabase";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PostHogIdentify } from "@/components/PostHogIdentify";
import { SignOutButton } from "@/components/SignOutButton";

// /reports is public: signed-out visitors see the public example audits and a
// sign-in prompt, signed-in visitors additionally see the reports they own. The
// index page filters what each viewer may see, and the per-report DETAIL route
// (/reports/[slug]) gates itself independently (redirect when signed out, 404
// for a non-owner), so this layout is chrome only, not the gate: the Ink strip
// that says who is signed in, over pages that draw their own grounds
// (app/styles/report.css). force-dynamic
// keeps the session read per-request rather than statically cached.
export const dynamic = "force-dynamic";

export default async function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  const email = user?.email ?? null;

  return (
    <>
      {/* Stitches this browser to the Supabase user id, THE distinct id. */}
      {user && <PostHogIdentify userId={user.id} email={user.email} />}
      <SiteHeader />
      <main id="main" data-ground="ink">
        {email && (
          <div className="wrap rps-who">
            <p>
              Signed in as <b>{email}</b>
              {isAdmin(email) && <i>admin</i>}
            </p>
            <SignOutButton />
          </div>
        )}
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
