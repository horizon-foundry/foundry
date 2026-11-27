import type { ReactNode } from "react";
import type {
  Severity,
  VerdictLevel,
  AssessedScope,
} from "@/lib/report-types";
import { SEVERITY_ORDER, VERDICT_LABEL } from "@/lib/report-types";

// Literal class maps so Tailwind's scanner sees every class. Hue is the only
// saturated color in the system and it always means a severity or a verdict
// (DESIGN.md). As type it sits on Ink only, where all five severity hues and
// the three verdict hues clear 4.5 to 1 (app/styles/report.css has the
// numbers). On the White sheet a hue is a fill under Ink type.
const SEV_TEXT: Record<Severity, string> = {
  critical: "text-critical",
  high: "text-high",
  medium: "text-medium",
  low: "text-low",
  informational: "text-informational",
};

// The suffix of a verdict's `hue-*` class in globals.css.
const VERDICT_HUE: Record<VerdictLevel, "safe" | "risk" | "noship"> = {
  "safe-to-ship": "safe",
  "ship-with-known-risks": "risk",
  "do-not-ship": "noship",
};

// A severity named in its hue: the cell filled with the hue, then the word in
// it. No box and no tint: the cell is the site's one visual atom, and it is
// what the verdict sheet puts beside each count.
export function SeverityChip({ severity }: { severity: Severity }) {
  return (
    <span className={`rp-sev ${SEV_TEXT[severity]}`}>
      <i className={`c s-${severity}`} aria-hidden="true" />
      {severity}
    </span>
  );
}

// Visual labels for the sheet's severity row. The full name stays for screen
// readers beside each one.
const SEV_LABEL: Record<Severity, string> = {
  critical: "crit",
  high: "high",
  medium: "med",
  low: "low",
  informational: "info",
};

// The verdict of a report, as the sheet: a White page with a 2px Ink edge,
// the release recommendation in Ink on a band filled with the verdict's hue,
// then the evidence base and the posture. It is the one light object on the
// page (globals.css, "The sheet"; components/VerdictSheet.tsx draws the same
// sheet for the home page from the self-audit's facts). It fills its
// container's width, and the word is sized from that width.
export function VerdictStamp({
  level,
  posture,
  assessedScope,
  severityRow,
  head,
  ticks = false,
  className = "",
}: {
  level: VerdictLevel;
  posture?: string;
  assessedScope?: AssessedScope;
  // Opt-in: the five severity counts as a row under the posture. A caller that
  // already shows the counts (ReportView's scorecard) leaves it off.
  severityRow?: Record<Severity, number>;
  // Opt-in: the line across the top of the sheet, which says what it is.
  head?: ReactNode;
  // Opt-in: the registration ticks, which stand 18px off each corner on the
  // ground. A caller sets them only where the sheet has that room.
  ticks?: boolean;
  className?: string;
}) {
  // Plain, human recommendation. The evidence base (static vs runtime) is stated
  // in its own line right below, so a static run is never mistaken for a
  // runtime-verified one without resorting to a jargon headline.
  const label = VERDICT_LABEL[level];
  return (
    <div
      className={`sheet rp-sheet hue-${VERDICT_HUE[level]} ${className}`.trim()}
      data-ground="white"
      data-level={level}
    >
      {ticks && (
        <>
          <span className="sheet-tk sheet-tk-tl" aria-hidden="true" />
          <span className="sheet-tk sheet-tk-tr" aria-hidden="true" />
          <span className="sheet-tk sheet-tk-bl" aria-hidden="true" />
          <span className="sheet-tk sheet-tk-br" aria-hidden="true" />
        </>
      )}
      {head != null && <div className="sheet-head meta">{head}</div>}
      <div className="sheet-verdict">
        <p className="label">Release recommendation</p>
        <p className="sheet-word">{label}</p>
      </div>
      {(assessedScope || posture) && (
        <div className="sheet-body">
          {assessedScope && (
            <p className="label">
              {assessedScope === "static"
                ? "Static review · runtime not exercised"
                : "Static review + runtime pass"}
            </p>
          )}
          {posture && <p className="sheet-posture">{posture}</p>}
        </div>
      )}
      {severityRow && (
        <dl className="sheet-sev">
          {SEVERITY_ORDER.map((sev) => (
            <div key={sev}>
              <dt>
                <i className={`c s-${sev}`} aria-hidden="true" />
                <span aria-hidden="true">{SEV_LABEL[sev]}</span>
                <span className="sr-only select-none">{sev}</span>
              </dt>
              <dd data-zero={severityRow[sev] ? undefined : ""}>
                {severityRow[sev]}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
