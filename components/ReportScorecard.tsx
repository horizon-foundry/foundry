"use client";

import type { AuditReport, Severity } from "@/lib/report-types";
import { SEV_SHORT } from "@/lib/report-types";

// The scorecard is a jump table into the report, not a static readout: every
// non-zero count scrolls to the detail it summarizes. Clicking a severity finds
// the first finding of that severity, opens any collapsed group around it (the
// folded low/informational disclosure), and scrolls to it. Risks and
// improvements jump to their sections. Counts with no detail (a zero, or the
// verification tallies) are inert.

const SEV_TEXT: Record<Severity, string> = {
  critical: "text-critical",
  high: "text-high",
  medium: "text-medium",
  low: "text-low",
  informational: "text-informational",
};
const ORDER: Severity[] = [
  "critical",
  "high",
  "medium",
  "low",
  "informational",
];

function scrollToEl(el: Element | null) {
  if (!el) return;
  // Open every collapsed <details> ancestor so the target is on screen.
  let node: Element | null = el.parentElement;
  while (node) {
    if (node instanceof HTMLDetailsElement) node.open = true;
    node = node.parentElement;
  }
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function ReportScorecard({
  bySeverity,
  riskCount,
  improvementCount,
  verification,
}: {
  bySeverity: AuditReport["stats"]["bySeverity"];
  riskCount: number;
  improvementCount: number;
  verification: AuditReport["stats"]["verification"];
}) {
  const goSeverity = (sev: Severity) => {
    if (bySeverity[sev] === 0) return;
    scrollToEl(document.querySelector(`[data-severity="${sev}"]`));
  };
  const goSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <>
      {/* The grid opts out of the report's inherited break-word: every label
          here is a fixed short token, and splitting one ("MEDIU/M" at 320) is
          worse than its sub-pixel overhang. */}
      <div className="rp-score">
        {ORDER.map((sev) => {
          const n = bySeverity[sev];
          return (
            <button
              key={sev}
              type="button"
              onClick={() => goSeverity(sev)}
              aria-disabled={n === 0}
              className="rp-score-cell"
            >
              <span className={`rp-score-n ${SEV_TEXT[sev]}`}>{n}</span>
              <span className="rp-k">
                {SEV_SHORT[sev] ? (
                  <>
                    <span aria-hidden="true">{SEV_SHORT[sev]}</span>
                    <span className="sr-only select-none">{sev}</span>
                  </>
                ) : (
                  sev
                )}
              </span>
            </button>
          );
        })}
      </div>
      <div className="rp-tally">
        <button type="button" onClick={() => goSection("risks")}>
          {riskCount} {riskCount === 1 ? "risk" : "risks"}
        </button>
        {improvementCount > 0 && (
          <button type="button" onClick={() => goSection("improvements")}>
            {improvementCount} improvements
          </button>
        )}
        <span>{verification.confirmed} verified</span>
        {verification.downgraded > 0 && (
          <span>{verification.downgraded} downgraded</span>
        )}
      </div>
    </>
  );
}
