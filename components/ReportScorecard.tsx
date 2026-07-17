"use client";

import type { AuditReport, Severity } from "@/lib/report-types";

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
      <div className="grid grid-cols-5 divide-x divide-line border border-line">
        {ORDER.map((sev) => {
          const n = bySeverity[sev];
          const clickable = n > 0;
          return (
            <button
              key={sev}
              type="button"
              onClick={() => goSeverity(sev)}
              aria-disabled={!clickable}
              className={`px-2 py-3 text-center transition-colors ${
                clickable
                  ? "cursor-pointer hover:bg-ink-raised-2"
                  : "cursor-default"
              }`}
            >
              <div
                className={`font-mono text-2xl font-semibold tabular-nums ${SEV_TEXT[sev]}`}
              >
                {n}
              </div>
              <div className="mt-1 font-mono text-[0.65rem] uppercase tracking-wide text-bone-faint">
                {sev === "informational" ? "info" : sev}
              </div>
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 font-mono text-[0.7rem] uppercase tracking-wide text-bone-faint">
        <button
          type="button"
          onClick={() => goSection("risks")}
          className="cursor-pointer transition-colors hover:text-bone-dim"
        >
          {riskCount} {riskCount === 1 ? "risk" : "risks"}
        </button>
        {improvementCount > 0 && (
          <button
            type="button"
            onClick={() => goSection("improvements")}
            className="cursor-pointer transition-colors hover:text-bone-dim"
          >
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
