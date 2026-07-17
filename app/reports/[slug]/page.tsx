import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getReportFor } from "@/lib/reports";
import { getSessionEmail, isAdmin } from "@/lib/supabase";
import { ReportView } from "@/components/ReportView";
import { CaptureView } from "@/components/CaptureView";
import type { AuditReport } from "@/lib/report-types";

// Resolves the report ONLY if the signed-in viewer may see it (owner match or
// admin). Both the page and generateMetadata go through this, so a forbidden
// slug leaks nothing, not even a project name in the title. Non-owners get a
// 404, not a 403: the gate must not confirm that a report exists for a slug
// someone is guessing at.
async function accessibleReport(slug: string): Promise<AuditReport | null> {
  const email = await getSessionEmail();
  if (!email) return null;
  return getReportFor(slug, { email, admin: isAdmin(email) });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const report = await accessibleReport(slug);
  return { title: report ? `${report.meta.project} audit` : "Report" };
}

export default async function ReportPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const email = await getSessionEmail();
  if (!email) redirect("/unlock");

  const admin = isAdmin(email);
  const report = getReportFor(slug, { email, admin });
  if (!report) notFound();

  return (
    <div>
      {/* Funnel B activation: a gated report actually viewed (client-side so
          link prefetch cannot fire it). */}
      <CaptureView
        event="report_viewed"
        properties={{ slug, access: admin ? "admin" : "owner" }}
      />
      <Link
        href="/reports"
        className="font-mono text-xs uppercase tracking-wide text-bone-faint transition-colors hover:text-bone"
      >
        ← All reports
      </Link>
      <div className="mt-6">
        <ReportView report={report} />
      </div>
    </div>
  );
}
