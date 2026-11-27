import type { ReactNode } from "react";
import type { AuditReport, Finding, Severity } from "@/lib/report-types";
import {
  SEVERITY_ORDER,
  SHIP_GATE_LABEL,
  SHIP_GATE_STATUS_LABEL,
  SHIP_GATE_STATUS_COLOR,
} from "@/lib/report-types";
import { SeverityChip, VerdictStamp } from "./report-ui";
import { ReportScorecard } from "./ReportScorecard";

const SEV_TEXT: Record<Severity, string> = {
  critical: "text-critical",
  high: "text-high",
  medium: "text-medium",
  low: "text-low",
  informational: "text-informational",
};

const CONFIDENCE_LABEL: Record<Finding["confidence"], string> = {
  "runtime-reproduced": "Runtime reproduced",
  "code-traced": "Code traced",
  "configuration-confirmed": "Configuration confirmed",
  "high-confidence": "High confidence",
  "needs-verification": "Needs verification",
};

const VERIFY_LABEL: Record<Finding["verification"]["status"], string> = {
  confirmed: "Verified · survived refutation",
  downgraded: "Downgraded on verification",
  "not-verified": "Not verified",
};

const VERIFY_METHOD_LABEL: Record<
  NonNullable<Finding["verification"]["method"]>,
  string
> = {
  "fresh-subagent": "fresh subagent",
  "different-model": "different model",
  "repro-script": "repro script",
  "runtime-test": "runtime test",
  human: "human",
};

function loc(l: Finding["location"]): string {
  const base = l.line ? `${l.file}:${l.line}` : l.file;
  return l.symbol ? `${base} · ${l.symbol}` : base;
}

function FindingRow({ f }: { f: Finding }) {
  return (
    <details
      id={`finding-${f.id}`}
      data-severity={f.severity}
      className="rp-finding"
    >
      {/* Wide, the ID, the severity and the issue are three columns that hold
          across rows. On a phone the ID and severity sit ABOVE the issue:
          sharing one row squeezed the finding text to a ~18ch measure, the
          product's core artifact at its worst. */}
      <summary className="rp-toggle">
        <span className={`rp-fid ${SEV_TEXT[f.severity]}`}>{f.id}</span>
        <SeverityChip severity={f.severity} />
        <span className="rp-what">
          <span className="rp-issue">{f.issue}</span>
          <span className="rp-where">
            {f.dimension} · {loc(f.location)}
          </span>
        </span>
      </summary>

      <div className="rp-detail">
        <Field label="Impact">{f.impact}</Field>
        <Field label="Evidence" mono>
          {f.evidence}
        </Field>
        <Field label="Recommended fix">{f.recommendedFix}</Field>
        {f.assumption && (
          <Field label="Unverified assumption">{f.assumption}</Field>
        )}
        {f.reproduction && <Field label="Reproduction">{f.reproduction}</Field>}
        {f.instances && f.instances.length > 0 && (
          <Field label={`Other instances (${f.instances.length})`} mono>
            {f.instances.map((i) => loc(i)).join("  ·  ")}
          </Field>
        )}
        <div className="rp-conf">
          <span className="rp-k">Confidence: {CONFIDENCE_LABEL[f.confidence]}</span>
          <span className="rp-k">
            {VERIFY_LABEL[f.verification.status]}
            {f.verification.method &&
              ` (${VERIFY_METHOD_LABEL[f.verification.method]})`}
          </span>
        </div>
        {f.verification.refutationNotes && (
          <p className="rp-refute">{f.verification.refutationNotes}</p>
        )}
      </div>
    </details>
  );
}

function Field({
  label,
  children,
  mono = false,
}: {
  label: string;
  children: ReactNode;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="rp-k">{label}</div>
      <div className={`rp-field-v${mono ? " rp-field-mono" : ""}`}>
        {children}
      </div>
    </div>
  );
}

// Renders a set of findings (already severity-sorted). When collapseMinor is on,
// the low + informational bulk folds into one disclosure so a long improvement
// list does not read as a wall; risks are always shown in full.
function FindingList({
  items,
  collapseMinor,
}: {
  items: Finding[];
  collapseMinor: boolean;
}) {
  const isMinor = (f: Finding) =>
    f.severity === "low" || f.severity === "informational";
  const shown = collapseMinor ? items.filter((f) => !isMinor(f)) : items;
  const folded = collapseMinor ? items.filter(isMinor) : [];
  return (
    <div className="rp-list">
      {shown.map((f) => (
        <FindingRow key={f.id} f={f} />
      ))}
      {folded.length > 0 && (
        <details className="rp-fold">
          <summary className="rp-toggle">
            <span>{folded.length} more · hygiene and polish</span>
          </summary>
          <div className="rp-fold-rows">
            {folded.map((f) => (
              <FindingRow key={f.id} f={f} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

// A section of the report: its name (and the line under it) in the left
// column, its rows in the right, under one 2px rule.
function Block({
  label,
  intro,
  children,
  id,
}: {
  label: ReactNode;
  intro?: ReactNode;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="rp-block">
      <div className="rp-block-head">
        <h2 className="rp-h">{label}</h2>
        {intro && <p className="rp-intro">{intro}</p>}
      </div>
      <div>{children}</div>
    </section>
  );
}

// `back` is the page's way back to the list of reports, and `note` the page's
// line about where this report comes from; both sit in the head, beside the
// sheet.
export function ReportView({
  report,
  back,
  note,
}: {
  report: AuditReport;
  back?: ReactNode;
  note?: ReactNode;
}) {
  const { meta, verdict, stats, findings } = report;
  // Findings split by kind: risks (a path to harm, these drive the verdict) and
  // improvements (safe today, robustness over time). Each sorted by severity. A
  // missing kind defaults to risk so an older report never hides a finding under
  // the softer heading.
  const riskFindings = SEVERITY_ORDER.flatMap((sev) =>
    findings.filter((f) => (f.kind ?? "risk") === "risk" && f.severity === sev),
  );
  const improvementFindings = SEVERITY_ORDER.flatMap((sev) =>
    findings.filter((f) => f.kind === "improvement" && f.severity === sev),
  );
  const hasGates =
    report.shipGates.length > 0 ||
    (meta.scope.excludedDimensions?.length ?? 0) > 0;

  return (
    // break-word is inherited: a report carries paths, URLs and identifiers,
    // and one of them at large text sizes pushed the page sideways.
    <article className="rp">
      {/* The head, on Slate: what was audited on the left, and the verdict as
          the sheet on the right. The sheet's top line leads with the product
          version when the report carries one, so a public report is stamped
          to a release (v0.1.0) rather than a date that reads stale as commits
          pile up; the audit date drops to the facts row. The sheet carries
          the punch (the verdict and the posture); the long-form justification
          collapses into a details nobody has to read to get the call. */}
      <header className="rp-head" data-ground="slate">
        <div className="wrap rp-head-grid">
          <div className="rp-ident">
            {back && <p className="rp-back">{back}</p>}
            <h1 className="d-h2">{meta.project}</h1>
            <p className="rp-facts">
              {meta.auditedCommit && <span>commit {meta.auditedCommit}</span>}
              {meta.version && <span>audited {meta.date}</span>}
              {meta.loc && <span>{meta.loc.toLocaleString()} loc</span>}
              <span>
                {meta.scope.dimensions.length} dimensions ·{" "}
                {meta.scope.runtimePass ? "static + runtime" : "static only"}
              </span>
            </p>
            {note && <p className="rp-note">{note}</p>}
          </div>
          <VerdictStamp
            ticks
            head={
              <span>
                Audit report
                {meta.version ? ` · v${meta.version}` : ` · ${meta.date}`}
              </span>
            }
            level={verdict.level}
            posture={verdict.posture}
            assessedScope={verdict.assessedScope}
          />
          {verdict.justification && (
            <details className="rp-why">
              <summary className="rp-toggle">
                <span>Why this verdict</span>
              </summary>
              <p>{verdict.justification}</p>
            </details>
          )}
        </div>
      </header>

      <div className="wrap rp-body">
        {/* Scorecard: the triage view. Severity mix, gate statuses, and what
            was not assessed, in one glance under the verdict. Everything below
            is detail the reader drills into; this is the part they must be
            able to read in seconds. Gate notes appear only when a gate is
            at-risk or not-met, because only those move the decision. */}
        <section className="rp-block">
          <div>
            <h2 className="sr-only">Scorecard</h2>
            <ReportScorecard
              bySeverity={stats.bySeverity}
              riskCount={riskFindings.length}
              improvementCount={improvementFindings.length}
              verification={stats.verification}
            />
          </div>
          {hasGates && (
            <div>
              {report.shipGates.length > 0 && (
                <p className="rp-gates">
                  <span className="rp-k">Gates</span>
                  {report.shipGates.map((g) => (
                    <span key={g.gate}>
                      {SHIP_GATE_LABEL[g.gate]}{" "}
                      <b className={SHIP_GATE_STATUS_COLOR[g.status]}>
                        {SHIP_GATE_STATUS_LABEL[g.status]}
                      </b>
                    </span>
                  ))}
                </p>
              )}
              {report.shipGates
                .filter((g) => g.status === "not-met" || g.status === "at-risk")
                .map((g) => (
                  <p key={g.gate} className="rp-gate-note">
                    <span className={`rp-k ${SHIP_GATE_STATUS_COLOR[g.status]}`}>
                      {SHIP_GATE_LABEL[g.gate]}:
                    </span>{" "}
                    {g.note}
                  </p>
                ))}
              {meta.scope.excludedDimensions &&
                meta.scope.excludedDimensions.length > 0 && (
                  <p className="rp-k rp-left-out">
                    Not assessed this run:{" "}
                    <span>
                      {meta.scope.excludedDimensions
                        .map((d) => d.dimension)
                        .join(", ")}
                    </span>
                  </p>
                )}
            </div>
          )}
        </section>

        {/* Drivers follow the scorecard, so the scorecard stays on the first
            screen (DESIGN.md Interaction, settled 2026-10-06). */}
        {verdict.blockingFindingIds.length > 0 && (
          <Block label="What drives this verdict">
            <ul className="rp-list">
              {verdict.blockingFindingIds.map((id) => {
                const f = findings.find((x) => x.id === id);
                return (
                  <li key={id} className="rp-driver">
                    <a
                      href={`#finding-${id}`}
                      className={`rp-fid ${f ? SEV_TEXT[f.severity] : "text-fg-3"}`}
                    >
                      {id}
                    </a>
                    {f && <span>{f.issue}</span>}
                  </li>
                );
              })}
            </ul>
          </Block>
        )}

        {/* Strengths: lead with what's solid (green = safe). Collapsed to
            scannable headlines, the reassurance at a glance for a reader who
            will not read five paragraphs; the note is one click away. */}
        {report.strengths && report.strengths.length > 0 && (
          <Block label={`What's solid (${report.strengths.length})`}>
            <ul className="rp-list">
              {report.strengths.map((s) => (
                <li key={s.area}>
                  <details className="rp-strength">
                    <summary className="rp-toggle">
                      <i className="c rp-ok" aria-hidden="true" />
                      <span className="rp-title">{s.area}</span>
                    </summary>
                    <p>{s.note}</p>
                  </details>
                </li>
              ))}
            </ul>
          </Block>
        )}

        {/* Risks first: the findings with a path to harm, the ones the verdict
            weighs. A report with none says so plainly, so a healthy app reads
            as healthy rather than as a wall of problems. */}
        <Block
          id="risks"
          label={`Risks to weigh (${riskFindings.length})`}
          intro="Findings with a path to harm in production. These are what the verdict weighs."
        >
          {riskFindings.length === 0 ? (
            <p className="rp-empty">
              No risks surfaced. Nothing here has a path to harm in production.
            </p>
          ) : (
            <FindingList items={riskFindings} collapseMinor={false} />
          )}
        </Block>

        {/* Improvements: safe today, robustness over time. Never cap the
            verdict. The low + informational bulk folds so the list reads as a
            punch list, not a body count. */}
        {improvementFindings.length > 0 && (
          <Block
            id="improvements"
            label={`Improvements (${improvementFindings.length})`}
            intro="Safe today. Ways to make the app more robust, observable, and consistent over time. These do not affect the verdict."
          >
            <FindingList items={improvementFindings} collapseMinor={true} />
          </Block>
        )}

        {report.remediationPlan.length > 0 && (
          <Block label="Prioritised remediation plan">
            <ol className="rp-list">
              {report.remediationPlan.map((step, i) => (
                <li key={step.title} className="rp-row rp-step">
                  <span className="rp-step-n">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="rp-title">{step.title}</p>
                    {step.detail && <p className="rp-text">{step.detail}</p>}
                    {step.findingIds.length > 0 && (
                      <p className="rp-ids">{step.findingIds.join(", ")}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </Block>
        )}

        {report.quickWins.length > 0 && (
          <Block label="Quick wins: low regression risk">
            <ul className="rp-list">
              {report.quickWins.map((w) => (
                <li key={w.title} className="rp-row">
                  <div className="rp-win-head">
                    <p className="rp-title">{w.title}</p>
                    {w.findingId && <span className="rp-ids">{w.findingId}</span>}
                  </div>
                  <p className="rp-text">Blast radius: {w.blastRadius}</p>
                </li>
              ))}
            </ul>
          </Block>
        )}

        {report.deeperInvestigation.length > 0 && (
          <Block label="Requires deeper investigation">
            <ul className="rp-list">
              {report.deeperInvestigation.map((d) => (
                <li key={d.title} className="rp-row">
                  <p className="rp-title">{d.title}</p>
                  {d.detail && <p className="rp-text">{d.detail}</p>}
                  {d.findingIds && d.findingIds.length > 0 && (
                    <p className="rp-ids">{d.findingIds.join(", ")}</p>
                  )}
                </li>
              ))}
            </ul>
          </Block>
        )}

        {report.notAssessed.length > 0 && (
          <Block label="Not assessed: runtime-only checks skipped">
            <ul className="rp-list">
              {report.notAssessed.map((n) => (
                <li key={n.check} className="rp-row">
                  <p className="rp-title">{n.check}</p>
                  <p className="rp-text">
                    <span className="rp-k">To verify:</span> {n.howToVerify}
                  </p>
                </li>
              ))}
            </ul>
          </Block>
        )}

        {/* Mechanical sweeps: the pre-audit tool passes. Tail detail for the
            reader who wants it, compact rows rather than cards. */}
        {report.mechanicalSweeps.length > 0 && (
          <Block label="Mechanical sweeps">
            <ul className="rp-list">
              {report.mechanicalSweeps.map((s) => (
                <li key={s.name} className="rp-sweep">
                  <span className="rp-sweep-name">{s.name}</span>
                  <span className="rp-sweep-out">{s.outcome}</span>
                  {s.summary && <span className="rp-text">{s.summary}</span>}
                </li>
              ))}
            </ul>
          </Block>
        )}
      </div>
    </article>
  );
}
