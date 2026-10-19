import { getPublicReport, listPublicReports } from "@/lib/reports";
import type { AuditReport } from "@/lib/report-types";
import type { SpecimenData } from "@/components/Specimen";

// The published self-audit, and everything the marketing pages quote from it.
// Every number and row is read from the report at build time, so regenerating
// the report (CLAUDE.md, "The public self-audit tracks the suite") updates the
// pages with it and no page can contradict the report it links to.

export function selfAudit(): { slug: string; report: AuditReport } | null {
  const reports = listPublicReports();
  const featured = reports.find((r) => r.slug.startsWith("foundry-")) ?? reports[0];
  if (!featured) return null;
  const report = getPublicReport(featured.slug);
  return report ? { slug: featured.slug, report } : null;
}

// A few findings the skeptics ruled on, with one downgrade flagged: the
// "it argues with itself" claim, shown in the report's own rows.
export function verificationSpecimen(report: AuditReport): SpecimenData | null {
  const ruled = report.findings.filter(
    (f) => f.verification.status === "confirmed" || f.verification.status === "downgraded",
  );
  const downgraded = ruled.find((f) => f.verification.status === "downgraded");
  if (!downgraded) return null;
  const confirmed = ruled.filter((f) => f.verification.status === "confirmed").slice(0, 3);
  const rows = [...confirmed.slice(0, 1), downgraded, ...confirmed.slice(1)].map((f) => ({
    cells: [f.id, f.dimension, f.severity, f.verification.status],
    flag: f === downgraded ? "DOWNGRADED" : undefined,
  }));
  return {
    title: "How the skeptics ruled",
    provenance: `from the ${report.meta.date} self-audit`,
    columns: ["Finding", "Area", "Severity", "Skeptic"],
    rows,
  };
}
