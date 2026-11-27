"use client";

import Link from "next/link";
import { useEffect } from "react";
import { SiteHeader } from "@/components/SiteHeader";

// Root error boundary. An unexpected server or render error degrades to a
// recoverable page (retry + a link home) instead of an unstyled 500. The report
// readers already skip a malformed file (lib/reports.ts), so this is the
// defense-in-depth backstop for anything else that throws.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error rendering a page:", error);
  }, [error]);

  // The header is here because an error replaces the whole page, header
  // included, and a visitor needs the way out. The footer is not: it reads
  // the version from disk, which a client component cannot do.
  return (
    <>
      <SiteHeader />
      <main id="main" className="fstate" data-ground="slate">
        <div className="wrap">
          <h1 className="d-h2">This page hit an unexpected error.</h1>
          <div className="fstate-grid">
            <div>
              <p className="readout">
                <span>Something broke</span>
                {error.digest && (
                  <span className="readout-detail">{error.digest}</span>
                )}
              </p>
              <p className="t-lead">
                The error was logged. You can retry, or head back to the start.
                Nothing you did is stuck.
              </p>
              <div className="home-actions">
                <button type="button" onClick={reset} className="btn">
                  Try again
                </button>
                <Link href="/" className="tl">
                  Back to start
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
