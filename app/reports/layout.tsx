import { getSessionUser, isAdmin } from "@/lib/supabase";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PostHogIdentify } from "@/components/PostHogIdentify";
import { SignOutButton } from "@/components/SignOutButton";

// /reports is public: signed-out visitors see the public example audits and a
// sign-in prompt, signed-in visitors additionally see the reports they own. The
// index page filters what each viewer may see, and the per-report DETAIL route
// (/reports/[slug]) gates itself independently (redirect when signed out, 404
// for a non-owner), so this layout is chrome only, not the gate. force-dynamic
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
      <main id="main" className="mx-auto min-h-[70vh] max-w-[1180px] px-5 py-10 sm:px-8">
        {email && (
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <p className="min-w-0 break-words font-mono text-xs text-bone-faint">
              Signed in as <span className="text-bone-dim">{email}</span>
              {isAdmin(email) && (
                <span className="ml-2 border border-line px-1.5 py-0.5 uppercase tracking-wide">
                  admin
                </span>
              )}
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
