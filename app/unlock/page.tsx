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

  // One Slate page: the heading on the left, the words and the form on the
  // right (app/styles/report.css, "sign-in").
  if (sent) {
    return (
      <>
        <SiteHeader />
        <main id="main" className="ul" data-ground="slate">
          <div className="wrap ul-grid">
            <h1 className="d-h2">Sign-in link sent.</h1>
            <div className="ul-body">
              <p className="t-lead">
                We emailed a one-time sign-in link to{" "}
                <span className="ul-sent">{sent}</span>. Open it on this device
                to view your reports. The link expires after a short window; if
                it lapses, request a fresh one.
              </p>
              <p className="t-lead">
                Nothing after a minute? Check your spam folder, then request a
                fresh link.
              </p>
            </div>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main id="main" className="ul" data-ground="slate">
        <div className="wrap ul-grid">
          <h1 className="d-h2">Sign in to view your reports.</h1>
          <div className="ul-body">
            <p className="t-lead">
              The skills never require an account. Signing in exists for one
              thing only: viewing your audit reports, which carry findings and
              are never public. Enter your email and we send a one-time sign-in
              link.
            </p>

            <form action={requestMagicLink} className="ul-form">
              <div>
                <label htmlFor="email" className="label">
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
                  aria-invalid={message ? true : undefined}
                  className="ul-input"
                />
              </div>
              {message && (
                <p id="gate-error" role="alert" className="ul-error">
                  <i className="c s-critical" aria-hidden="true" />
                  {message}
                </p>
              )}
              <SubmitButton
                label="Email me a sign-in link"
                pendingLabel="Sending the link…"
              />
            </form>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
