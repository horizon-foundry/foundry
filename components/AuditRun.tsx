import type { CSSProperties } from "react";
import type { AuditReport } from "@/lib/report-types";
import { VerdictStamp, StatStrip } from "@/components/report-ui";
import { SpecimenFill } from "@/components/SpecimenFill";

// The homepage's sub-hero: the published self-audit replayed as a run. Each
// phase lands in order, with the numbers that phase produced, and the verdict
// arrives last. It is the specimen fill at full size (DESIGN.md, Motion), so
// the page has one motion idea, not two. Every number is read from the
// report, and the frame is a report excerpt, which licenses the verdict hue.
export function AuditRun({ report }: { report: AuditReport }) {
  const { meta, stats, findings, mechanicalSweeps, notAssessed } = report;
  const v = stats.verification;
  const rows: [string, string, string][] = [
    [
      "00",
      "context",
      `${meta.loc?.toLocaleString("en-US") ?? "the whole"} lines, ${meta.scope.dimensions.length} dimensions in scope${meta.scope.runtimePass ? ", a live runtime pass" : ""}`,
    ],
    ["01", "sweep", `${mechanicalSweeps.length} tool sweeps before any judgment`],
    ["02", "fan out", `${findings.length} findings, each cited to a file and line`],
    ["03", "refute", `${v.confirmed} confirmed, ${v.downgraded} downgraded, ${v.refuted} refuted`],
    ["04", "boundary", `${notAssessed.length} things it could not check, listed by name`],
  ];

  return (
    <SpecimenFill
      className="border border-line-strong bg-ink"
      style={{ "--rows": rows.length } as CSSProperties}
    >
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line px-4 py-3 font-mono text-[0.6875rem] text-bone-faint sm:px-5">
        <span>
          <span className="text-command">/production-audit</span> on Foundry
        </span>
        <span>
          {meta.date} · commit {meta.auditedCommit}
        </span>
      </figcaption>

      <ol className="px-4 py-2 font-mono text-xs leading-5 sm:px-5 sm:text-sm sm:leading-6">
        {rows.map(([n, phase, result], i) => (
          <li
            key={n}
            className="specimen-row grid grid-cols-[2rem_5.5rem_minmax(0,1fr)] gap-x-3 border-b border-line py-2.5 last:border-b-0 sm:grid-cols-[2.5rem_6.5rem_minmax(0,1fr)]"
            style={{ "--i": i } as CSSProperties}
          >
            <span className="text-bone-faint">{n}</span>
            <span className="text-bone">{phase}</span>
            <span className="text-bone-dim">{result}</span>
          </li>
        ))}
      </ol>

      <div className="specimen-flag space-y-3 border-t border-line p-4 sm:p-5">
        <VerdictStamp
          level={report.verdict.level}
          posture={report.verdict.posture}
          assessedScope={report.verdict.assessedScope}
        />
        <StatStrip bySeverity={stats.bySeverity} />
      </div>
    </SpecimenFill>
  );
}
