import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SubmitButton } from "@/components/SubmitButton";
import { requestMagicLink } from "./actions";

export const metadata = { title: "Reports access" };

const ERRORS: Record<string, string> = {
  invalid: "Enter a valid email address.",
  unavailable: "Sign-in is not configured. Contact the maintainer.",
  failed: "The sign-in email could not be sent. Try again in a minute.",
  expired: "That sign-in link is invalid or has expired. Request a fresh one.",
};

export default async function Unlock({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const { error, sent } = await searchParams;
  const message = error ? ERRORS[error] : null;

  if (sent) {
    return (
      <>
        <SiteHeader />
        <main id="main" className="mx-auto flex min-h-[70vh] max-w-[1180px] items-center px-5 sm:px-8">
          <div className="w-full max-w-md">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-bone-faint">
              Access · check your inbox
            </p>
            <h1 className="mt-3 font-mono text-2xl font-semibold tracking-tight text-bone">
              Sign-in link sent.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-bone-dim">
              We emailed a one-time sign-in link to{" "}
              <span className="font-mono text-bone">{sent}</span>. Open it on
              this device to view your reports. The link expires after a short
              window; if it lapses, request a fresh one.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-bone-faint">
              Nothing after a minute? Check your spam folder, then request a
              fresh link.
            </p>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto flex min-h-[70vh] max-w-[1180px] items-center px-5 sm:px-8">
        <div className="w-full max-w-md">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-bone-faint">
            Report history
          </p>
          <h1 className="mt-3 font-mono text-2xl font-semibold tracking-tight text-bone">
            Sign in to view your reports.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-bone-dim">
            The skills never require an account. Signing in exists for one
            thing only: viewing your audit reports, which carry findings and
            are never public. Enter your email and we send a one-time sign-in
            link.
          </p>

          <form action={requestMagicLink} className="mt-7 space-y-3">
            <div>
              <label
                htmlFor="email"
                className="font-mono text-xs uppercase tracking-wide text-bone-faint"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                aria-describedby={message ? "gate-error" : undefined}
                className="mt-1.5 w-full border border-line bg-ink-raised px-3 py-2.5 font-mono text-sm text-bone outline-none transition-colors placeholder:text-bone-faint focus:border-signal"
              />
            </div>
            {message && (
              <p
                id="gate-error"
                role="alert"
                className="border border-critical/40 bg-critical/5 px-3 py-2 text-sm text-critical"
              >
                {message}
              </p>
            )}
            <SubmitButton
              label="Email me a sign-in link"
              pendingLabel="Sending the link…"
            />
          </form>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
