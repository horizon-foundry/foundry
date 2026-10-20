import { getPublicReport, listPublicReports } from "@/lib/reports";
import type {
  AssessedScope,
  AuditReport,
  Dimension,
  Severity,
  VerdictLevel,
} from "@/lib/report-types";
import { VERDICT_LABEL } from "@/lib/report-types";
import type { SpecimenData } from "@/lib/specimen-types";

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

// The suffix of a verdict's `hue-*` class in globals.css, which is the token
// name without its "verdict-" prefix.
const VERDICT_HUE: Record<VerdictLevel, "safe" | "risk" | "noship"> = {
  "safe-to-ship": "safe",
  "ship-with-known-risks": "risk",
  "do-not-ship": "noship",
};

const SCOPE_LABEL: Record<AssessedScope, string> = {
  static: "static review, runtime not exercised",
  "static-plus-runtime": "static review + runtime pass",
};

export type AuditFacts = {
  level: VerdictLevel;
  label: string;
  hue: "safe" | "risk" | "noship";
  scope: string;
  posture: string | undefined;
  severity: Record<Severity, number>;
  findings: number;
  skeptic: {
    confirmed: number;
    downgraded: number;
    refuted: number;
    checked: number;
  };
  notAssessed: { count: number; names: string[] };
  // Findings per dimension, largest first (ties keep the report's order).
  dimensions: { name: Dimension; label: string; count: number }[];
  dimensionsInScope: number;
  // Null when the report does not state its size; a caller must handle it.
  loc: number | null;
  date: string;
  commit: string | undefined;
};

// Every number the homepage's run frame and the production-audit page show,
// derived once so the two surfaces cannot disagree with each other or with the
// report. No literal figure or date lives in a page.
export function auditFacts(report: AuditReport): AuditFacts {
  const { meta, verdict, stats } = report;
  const v = stats.verification;
  return {
    level: verdict.level,
    label: VERDICT_LABEL[verdict.level],
    hue: VERDICT_HUE[verdict.level],
    scope: SCOPE_LABEL[verdict.assessedScope],
    posture: verdict.posture,
    severity: stats.bySeverity,
    findings: report.findings.length,
    skeptic: {
      confirmed: v.confirmed,
      downgraded: v.downgraded,
      refuted: v.refuted,
      checked: v.confirmed + v.downgraded + v.refuted,
    },
    notAssessed: {
      count: report.notAssessed.length,
      names: report.notAssessed.map((n) => n.check),
    },
    dimensions: (Object.entries(stats.byDimension) as [Dimension, number][])
      .map(([name, count]) => ({ name, label: name.replace(/-/g, " "), count }))
      .sort((a, b) => b.count - a.count),
    dimensionsInScope: meta.scope.dimensions.length,
    loc: meta.loc ?? null,
    date: meta.date,
    commit: meta.auditedCommit,
  };
}
