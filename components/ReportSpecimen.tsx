import Link from "next/link";
import type { AuditReport } from "@/lib/report-types";
import { VerdictStamp, StatStrip } from "@/components/report-ui";

/*
  A REAL excerpt of the published example report, rendered by the same
  components that render every report. Lives in the worked-example section,
  where evidence belongs: it briefly led the hero, but a full-strength verdict
  stamp as the first thing a stranger reads was too loud and read negative
  (Craig, 2026-07-13); the terminal represents the product better up top.
  Framed as a report excerpt (DESIGN.md), which is what licenses the verdict
  and severity hues on a marketing surface.
*/

export function ReportSpecimen({
  report,
  showLink = true,
}: {
  report: AuditReport;
  showLink?: boolean;
}) {
  const { verification } = report.stats;
  const slug = `${report.meta.projectSlug}-${report.meta.date}`;

  return (
    <figure className="border border-line bg-ink-raised/70">
      <figcaption className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-line px-4 py-2.5">
        <span className="min-w-0 break-words font-mono text-[0.65rem] uppercase tracking-[0.18em] text-bone-faint">
          Report · {report.meta.project} · {report.meta.date}
        </span>
        <span className="font-mono text-[0.65rem] uppercase tracking-wide text-bone-faint">
          Worked example
        </span>
      </figcaption>

      <div className="space-y-3 p-4">
        <VerdictStamp
          level={report.verdict.level}
          assessedScope={report.verdict.assessedScope}
        />

        <StatStrip bySeverity={report.stats.bySeverity} />

        {/* The trust line: these numbers survived refutation. */}
        <p className="font-mono text-xs leading-relaxed text-bone-dim">
          <span className="text-bone">{verification.confirmed} confirmed</span>{" "}
          · {verification.downgraded} downgraded on verification ·{" "}
          {verification.refuted} refuted and dropped
        </p>
      </div>

      {showLink && (
        <div className="border-t border-line px-4 py-2.5">
          <Link
            href={`/example/${slug}`}
            className="-mx-2 flex min-h-11 items-center gap-2 px-2 font-mono text-xs uppercase tracking-wide text-bone-dim transition-colors hover:text-bone"
          >
            Read the full report
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      )}
    </figure>
  );
}
