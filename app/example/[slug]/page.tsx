import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicReport } from "@/lib/reports";
import { ReportView } from "@/components/ReportView";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CaptureView } from "@/components/CaptureView";

// Ungated public example. Serves ONLY reports flagged meta.public=true (see
// getPublicReport), so this route cannot be used to read a private report by
// guessing its slug. The /reports index is public, but owned-report DETAIL
// pages under /reports/[slug] stay behind the sign-in gate.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const report = getPublicReport(slug);
  return {
    title: report ? `${report.meta.project} audit: example report` : "Example",
  };
}

export default async function ExampleReport({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const report = getPublicReport(slug);
  if (!report) notFound();

  // Two kinds of public example, framed honestly. The self-audit is the real
  // one (Foundry auditing its own repo); everything else is an illustrative
  // constructed sample. Keyed on projectSlug so the distinction is explicit.
  const isSelfAudit = report.meta.projectSlug === "foundry";

  return (
    <>
      {/* Funnel A value proxy: the worked example actually read. */}
      <CaptureView event="example_report_viewed" properties={{ slug }} />
      <SiteHeader />
      <main id="main" className="mx-auto min-h-[70vh] max-w-[1180px] px-5 py-10 sm:px-8">
        {/* Banner: this one report is public; the full history is gated. */}
        <div className="mb-8 flex flex-col gap-2 border border-line bg-ink-raised px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs uppercase tracking-wide text-bone-dim">
            {isSelfAudit ? (
              <>
                <span className="text-signal">Our own audit.</span> We ran{" "}
                <span className="text-command">/production-audit</span>{" "}
                on Foundry&apos;s own public repo. Check it against the source.
              </>
            ) : (
              <>
                <span className="text-signal">Illustrative example.</span> Perch
                is a fictional sample application, audited in full to show the
                method on a payments-and-concurrency product.
              </>
            )}
          </p>
          <Link
            href="/reports"
            className="font-mono text-xs uppercase tracking-wide text-bone-faint transition-colors hover:text-bone"
          >
            All reports →
          </Link>
        </div>
        <ReportView report={report} />
      </main>
      <SiteFooter />
    </>
  );
}
