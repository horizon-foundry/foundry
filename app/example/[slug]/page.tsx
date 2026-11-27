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
      <main id="main" data-ground="ink">
        {/* Provenance: this one report is public; the full history is gated.
            One plain line in the report's head, not a bordered banner, so the
            sheet and the scorecard keep the first screen on a phone
            (DESIGN.md Anti-goals). */}
        <ReportView
          report={report}
          back={
            <Link href="/reports" className="rp-link">
              All reports
            </Link>
          }
          note={
            isSelfAudit ? (
              <>
                <strong>Our own audit.</strong> We ran{" "}
                <span className="cmd">/production-audit</span> on Foundry&apos;s
                own public repo. Check it against the source.
              </>
            ) : (
              <>
                <strong>Illustrative example.</strong> Perch is a fictional
                sample application, audited in full to show the method on a
                payments-and-concurrency product.
              </>
            )
          }
        />
      </main>
      <SiteFooter />
    </>
  );
}
