import type { ReactNode } from "react";
import type { AuditFacts } from "@/lib/self-audit";
import { SEVERITY_ORDER, type Severity } from "@/lib/report-types";

// A verdict as a printed sheet: the release recommendation at the size of a
// headline, the evidence base, the posture sentence, and the five severity
// counts. Every word and number comes from the report (lib/self-audit.ts
// derives them), so the sheet cannot disagree with the page it links to.
//
// It is White with a 2px Ink edge on every ground, and on this dark site it
// is the one light object. The verdict hue fills the band under the word and
// the small cell beside each severity; the type is Ink throughout
// (globals.css, "The sheet").

const SEV_LABEL: Record<Severity, string> = {
  critical: "crit",
  high: "high",
  medium: "med",
  low: "low",
  informational: "info",
};

const SCOPE: Record<string, string> = {
  "static review, runtime not exercised": "Static review · runtime not exercised",
  "static review + runtime pass": "Static review + runtime pass",
};

export function VerdictSheet({
  facts,
  head,
  foot,
  className = "",
}: {
  facts: AuditFacts;
  // The line across the top: what ran, and on what.
  head: ReactNode;
  // The closing row: a caption and the link to the full report.
  foot?: ReactNode;
  className?: string;
}) {
  return (
    <figure
      className={`sheet hue-${facts.hue} ${className}`.trim()}
      data-ground="white"
    >
      <span className="sheet-tk sheet-tk-tl" aria-hidden="true" />
      <span className="sheet-tk sheet-tk-tr" aria-hidden="true" />
      <span className="sheet-tk sheet-tk-bl" aria-hidden="true" />
      <span className="sheet-tk sheet-tk-br" aria-hidden="true" />
      <div className="sheet-head meta">
        {head}
        <span>{facts.commit ? `${facts.date} · ${facts.commit}` : facts.date}</span>
      </div>
      <div className="sheet-verdict">
        <p className="label">Release recommendation</p>
        <p className="sheet-word">{facts.label}</p>
      </div>
      <div className="sheet-body">
        <p className="label">{SCOPE[facts.scope] ?? facts.scope}</p>
        {facts.posture && <p className="sheet-posture">{facts.posture}</p>}
      </div>
      <dl className="sheet-sev">
        {SEVERITY_ORDER.map((sev) => (
          <div key={sev}>
            <dt>
              <i className={`c s-${sev}`} aria-hidden="true" />
              <span aria-hidden="true">{SEV_LABEL[sev]}</span>
              <span className="sr-only select-none">{sev}</span>
            </dt>
            <dd data-zero={facts.severity[sev] ? undefined : ""}>
              {facts.severity[sev]}
            </dd>
          </div>
        ))}
      </dl>
      {foot && <figcaption className="sheet-foot">{foot}</figcaption>}
    </figure>
  );
}
