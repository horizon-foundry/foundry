"use client";

import Link from "next/link";
import { useEffect } from "react";

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

  return (
    <main
      id="main"
      className="mx-auto flex min-h-[70vh] max-w-[720px] flex-col justify-center px-5 py-16 sm:px-8"
    >
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-bone-faint">
        Something broke
      </p>
      <h1 className="mt-2 font-mono text-2xl font-semibold tracking-tight text-bone sm:text-3xl">
        This page hit an unexpected error.
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-bone-dim">
        The error was logged. You can retry, or head back to the start. Nothing
        you did is stuck.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 items-center border border-line-strong bg-bone px-4 py-2 font-mono text-sm font-semibold text-ink transition-opacity hover:opacity-90"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center border border-line px-4 py-2 font-mono text-sm text-bone transition-colors hover:border-line-strong"
        >
          Back to start
        </Link>
      </div>
    </main>
  );
}
