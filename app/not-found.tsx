import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto flex min-h-[70vh] max-w-[1180px] flex-col items-start justify-center px-5 sm:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-bone-faint">
          404 · not found
        </p>
        <h1 className="mt-3 font-mono text-3xl font-semibold tracking-tight text-bone">
          No finding here.
        </h1>
        <Link
          href="/"
          className="mt-6 border border-line px-3 py-2 font-mono text-sm text-bone transition-colors hover:border-line-strong"
        >
          ← Home
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
