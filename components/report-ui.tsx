import type {
  Severity,
  VerdictLevel,
  AssessedScope,
  AuditReport,
} from "@/lib/report-types";
import { VERDICT_LABEL } from "@/lib/report-types";

// Literal class maps so Tailwind's JIT sees every class. Color is the ONLY
// saturated ink in the system and it always means a severity or a verdict
// (DESIGN.md). text + border are the severity hue; the row rail uses the same.
const SEV_TEXT: Record<Severity, string> = {
  critical: "text-critical",
  high: "text-high",
  medium: "text-medium",
  low: "text-low",
  informational: "text-informational",
};
const SEV_BORDER: Record<Severity, string> = {
  critical: "border-critical",
  high: "border-high",
  medium: "border-medium",
  low: "border-low",
  informational: "border-informational",
};
// Translucent fill for chips: the severity hue at 12% so the label (same hue
// at full strength) stays readable on it. A solid severity bg under severity
// text was invisible (same-color-on-same-color); the tint keeps the chip's
// identity without killing the text.
const SEV_FILL: Record<Severity, string> = {
  critical: "bg-critical/12",
  high: "bg-high/12",
  medium: "bg-medium/12",
  low: "bg-low/12",
  informational: "bg-informational/12",
};

const VERDICT_TEXT: Record<VerdictLevel, string> = {
  "safe-to-ship": "text-verdict-safe",
  "ship-with-known-risks": "text-verdict-risk",
  "do-not-ship": "text-verdict-noship",
};
const VERDICT_BORDER: Record<VerdictLevel, string> = {
  "safe-to-ship": "border-verdict-safe",
  "ship-with-known-risks": "border-verdict-risk",
  "do-not-ship": "border-verdict-noship",
};

export function SeverityChip({ severity }: { severity: Severity }) {
  return (
    <span
      className={`inline-flex items-center border-l-2 ${SEV_FILL[severity]} ${SEV_BORDER[severity]} border-y border-r border-y-line border-r-line px-2 py-0.5 font-mono text-[0.65rem] font-medium uppercase tracking-widest ${SEV_TEXT[severity]}`}
    >
      {severity}
    </span>
  );
}

export function VerdictStamp({
  level,
  posture,
  assessedScope,
  className = "",
}: {
  level: VerdictLevel;
  posture?: string;
  assessedScope?: AssessedScope;
  className?: string;
}) {
  // Plain, human recommendation. The evidence base (static vs runtime) is stated
  // in its own line right below, so a static run is never mistaken for a
  // runtime-verified one without resorting to a jargon headline.
  const label = VERDICT_LABEL[level];
  // A stamped block: bordered all the way around in the verdict color, with
  // corner registration ticks. Not a card with a colored side tab (DESIGN.md:
  // "the verdict presents as a stamped block... never a pill"). It fills its
  // container width; the summary text inside is capped for readable line length.
  return (
    <div
      className={`relative border ${VERDICT_BORDER[level]} bg-ink-raised p-5 sm:p-7 ${className}`}
    >
      <span
        className={`pointer-events-none absolute -left-px -top-px h-3 w-3 border-l-2 border-t-2 ${VERDICT_BORDER[level]}`}
        aria-hidden="true"
      />
      <span
        className={`pointer-events-none absolute -bottom-px -right-px h-3 w-3 border-b-2 border-r-2 ${VERDICT_BORDER[level]}`}
        aria-hidden="true"
      />
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-bone-faint">
        Release recommendation
      </p>
      <p
        className={`mt-1.5 font-mono text-3xl font-semibold uppercase tracking-tight sm:text-4xl ${VERDICT_TEXT[level]}`}
      >
        {label}
      </p>
      {assessedScope && (
        <p className="mt-2 font-mono text-[0.65rem] uppercase tracking-wide text-bone-dim">
          {assessedScope === "static"
            ? "Static review · runtime not exercised"
            : "Static review + runtime pass"}
        </p>
      )}
      {posture && (
        <p className="mt-4 max-w-3xl text-lg font-semibold leading-snug text-bone sm:text-xl">
          {posture}
        </p>
      )}
    </div>
  );
}

// Tabular counts by severity: each number in its severity color, labels in
// faint mono (DESIGN.md stat strip).
export function StatStrip({
  bySeverity,
}: {
  bySeverity: AuditReport["stats"]["bySeverity"];
}) {
  const order: Severity[] = [
    "critical",
    "high",
    "medium",
    "low",
    "informational",
  ];
  return (
    <div className="grid grid-cols-5 divide-x divide-line border border-line">
      {order.map((sev) => (
        <div key={sev} className="px-2 py-3 text-center">
          <div
            className={`font-mono text-2xl font-semibold tabular-nums ${SEV_TEXT[sev]}`}
          >
            {bySeverity[sev]}
          </div>
          <div className="mt-1 font-mono text-[0.65rem] uppercase tracking-wide text-bone-faint">
            {sev === "informational" ? "info" : sev}
          </div>
        </div>
      ))}
    </div>
  );
}
