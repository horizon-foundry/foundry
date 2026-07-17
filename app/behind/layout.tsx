import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BehindNav } from "@/components/BehindNav";

export default function BehindLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <div className="border-b border-line">
        <div className="mx-auto max-w-[1180px] px-5 pb-4 pt-10 sm:px-8">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-bone-faint">
            Behind the Build
          </p>
          <h1 className="mt-2 font-mono text-3xl font-semibold tracking-tight text-bone">
            How this was made
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-bone-dim">
            The project&apos;s own curated artifacts, rendered in product: the
            overview, the design system, the review philosophy, and the brand.
          </p>
          <div className="mt-6">
            <BehindNav />
          </div>
        </div>
      </div>
      <main id="main" className="mx-auto flex min-h-[60vh] max-w-[1180px] flex-col px-5 py-10 sm:px-8">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
