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
      className="group scroll-mt-24 border border-line bg-ink-raised open:border-line-strong"
    >
      {/* Below sm the id/chip row stacks ABOVE the issue text; sharing one
          row squeezed the finding text to a ~18ch measure on phones, the
          product's core artifact at its worst. */}
      <summary className="flex cursor-pointer list-none flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-start sm:gap-4 [&::-webkit-details-marker]:hidden">
        <span className="flex shrink-0 items-center gap-2.5 sm:pt-0.5">
          <span
            className={`font-mono text-xs font-semibold tabular-nums ${SEV_TEXT[f.severity]}`}
          >
            {f.id}
          </span>
          <SeverityChip severity={f.severity} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium leading-snug text-bone">
            {f.issue}
          </span>
          <span className="mt-1 block break-words font-mono text-[0.65rem] uppercase tracking-wide text-bone-faint">
            {f.dimension} · {loc(f.location)}
          </span>
        </span>
        <span
          className="hidden shrink-0 pt-0.5 font-mono text-bone-faint transition-transform group-open:rotate-90 sm:block"
          aria-hidden="true"
        >
          ›
        </span>
      </summary>

      <div className="space-y-4 border-t border-line px-4 py-4 text-sm">
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
        <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-3 font-mono text-[0.65rem] uppercase tracking-wide text-bone-faint">
          <span>Confidence: {CONFIDENCE_LABEL[f.confidence]}</span>
          <span>
            {VERIFY_LABEL[f.verification.status]}
            {f.verification.method &&
              ` (${VERIFY_METHOD_LABEL[f.verification.method]})`}
          </span>
        </div>
        {f.verification.refutationNotes && (
          <p className="border-l-2 border-line-strong pl-3 text-xs italic leading-relaxed text-bone-faint">
            {f.verification.refutationNotes}
          </p>
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
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="font-mono text-[0.65rem] uppercase tracking-wide text-bone-faint">
        {label}
      </div>
      <div
        className={`mt-1 leading-relaxed text-bone-dim ${
          mono
            ? "whitespace-pre-wrap break-words rounded-sm bg-ink-raised-2 p-2 font-mono text-[0.78rem]"
            : ""
        }`}
      >
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
    <div className="space-y-2">
      {shown.map((f) => (
        <FindingRow key={f.id} f={f} />
      ))}
      {folded.length > 0 && (
        <details className="group border border-line bg-ink-raised">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-mono text-xs uppercase tracking-wide text-bone-dim [&::-webkit-details-marker]:hidden">
            <span>{folded.length} more · hygiene and polish</span>
            <span className="text-bone-faint transition-transform group-open:rotate-90">
              ›
            </span>
          </summary>
          <div className="space-y-2 border-t border-line px-4 py-4">
            {folded.map((f) => (
              <FindingRow key={f.id} f={f} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function Block({
  label,
  children,
  id,
}: {
  label: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className={`mt-12 ${id ? "scroll-mt-24" : ""}`}>
      <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-bone-faint">
        {label}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function ReportView({ report }: { report: AuditReport }) {
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

  return (
    <div>
      {/* Header. Leads with the product version when the report carries one, so
          a public report is stamped to a release (v0.1.0) rather than a date
          that reads stale as commits pile up; the audit date drops to the quiet
          meta row. */}
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-bone-faint">
        Audit report{meta.version ? ` · v${meta.version}` : ` · ${meta.date}`}
      </p>
      <h1 className="mt-2 font-mono text-3xl font-semibold tracking-tight text-bone sm:text-4xl">
        {meta.project}
      </h1>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[0.7rem] uppercase tracking-wide text-bone-faint">
        {meta.auditedCommit && <span>commit {meta.auditedCommit}</span>}
        {meta.version && <span>audited {meta.date}</span>}
        {meta.loc && <span>{meta.loc.toLocaleString()} loc</span>}
        <span>
          {meta.scope.dimensions.length} dimensions ·{" "}
          {meta.scope.runtimePass ? "static + runtime" : "static only"}
        </span>
      </div>

      {/* Verdict. Full-width stamp so the top matches the scorecard below it,
          no half-then-full jump. The stamp carries the punch (human verdict +
          punchy posture); the long-form justification collapses into a details
          nobody has to read to get the call. */}
      <div className="mt-8">
        <VerdictStamp
          level={verdict.level}
          posture={verdict.posture}
          assessedScope={verdict.assessedScope}
        />
        {verdict.justification && (
          <details className="group mt-3 max-w-3xl">
            <summary className="flex cursor-pointer list-none items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-wide text-bone-faint transition-colors hover:text-bone-dim [&::-webkit-details-marker]:hidden">
              Why this verdict
              <span
                className="inline-block transition-transform group-open:rotate-90"
                aria-hidden="true"
              >
                ›
              </span>
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-bone-dim">
              {verdict.justification}
            </p>
          </details>
        )}
      </div>
      {verdict.blockingFindingIds.length > 0 && (
        <div className="mt-6">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-bone-faint">
            What drives this verdict
          </p>
          <ul className="mt-2.5 space-y-2">
            {verdict.blockingFindingIds.map((id) => {
              const f = findings.find((x) => x.id === id);
              return (
                <li key={id} className="flex flex-col gap-1 sm:flex-row sm:gap-3">
                  <a
                    href={`#finding-${id}`}
                    className={`shrink-0 font-mono text-xs font-semibold hover:underline ${
                      f ? SEV_TEXT[f.severity] : "text-bone-faint"
                    }`}
                  >
                    {id}
                  </a>
                  {f && (
                    <span className="text-sm leading-snug text-bone-dim">
                      {f.issue}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Scorecard: the triage view. Severity mix, gate statuses, and what was
          not assessed, in one glance under the verdict. Everything below is
          detail the reader drills into; this is the part they must be able to
          read in seconds. Gate notes appear only when a gate is at-risk or
          not-met, because only those move the decision. */}
      <div className="mt-8 border border-line bg-ink-raised">
        <div className="px-4 py-4">
          <ReportScorecard
            bySeverity={stats.bySeverity}
            riskCount={riskFindings.length}
            improvementCount={improvementFindings.length}
            verification={stats.verification}
          />
        </div>
        {(report.shipGates.length > 0 ||
          (meta.scope.excludedDimensions?.length ?? 0) > 0) && (
          <div className="space-y-2.5 border-t border-line px-4 py-3.5">
            {report.shipGates.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 font-mono text-[0.7rem] uppercase tracking-wide">
                <span className="text-bone-faint">Gates</span>
                {report.shipGates.map((g) => (
                  <span key={g.gate} className="text-bone-dim">
                    {SHIP_GATE_LABEL[g.gate]}{" "}
                    <span className={SHIP_GATE_STATUS_COLOR[g.status]}>
                      {SHIP_GATE_STATUS_LABEL[g.status]}
                    </span>
                  </span>
                ))}
              </div>
            )}
            {report.shipGates
              .filter((g) => g.status === "not-met" || g.status === "at-risk")
              .map((g) => (
                <p key={g.gate} className="text-xs leading-relaxed text-bone-dim">
                  <span
                    className={`font-mono uppercase ${SHIP_GATE_STATUS_COLOR[g.status]}`}
                  >
                    {SHIP_GATE_LABEL[g.gate]}:
                  </span>{" "}
                  {g.note}
                </p>
              ))}
            {meta.scope.excludedDimensions &&
              meta.scope.excludedDimensions.length > 0 && (
                <p className="font-mono text-[0.7rem] uppercase tracking-wide text-bone-faint">
                  Not assessed this run:{" "}
                  <span className="normal-case text-bone-dim">
                    {meta.scope.excludedDimensions
                      .map((d) => d.dimension)
                      .join(", ")}
                  </span>
                </p>
              )}
          </div>
        )}
      </div>

      {/* Strengths: lead with what's solid (green = safe). Collapsed to
          scannable headlines, the reassurance at a glance for a reader who will
          not read five paragraphs; the note is one click away. */}
      {report.strengths && report.strengths.length > 0 && (
        <Block label={`What's solid (${report.strengths.length})`}>
          <ul className="space-y-2">
            {report.strengths.map((s) => (
              <li key={s.area}>
                <details className="group border border-line bg-ink-raised open:border-line-strong">
                  <summary className="flex cursor-pointer list-none items-center gap-2.5 px-4 py-3 [&::-webkit-details-marker]:hidden">
                    <span
                      className="shrink-0 font-mono text-sm text-verdict-safe"
                      aria-hidden="true"
                    >
                      +
                    </span>
                    <span className="min-w-0 flex-1 font-mono text-xs font-semibold uppercase tracking-wide text-bone">
                      {s.area}
                    </span>
                    <span
                      className="shrink-0 font-mono text-bone-faint transition-transform group-open:rotate-90"
                      aria-hidden="true"
                    >
                      ›
                    </span>
                  </summary>
                  <p className="border-t border-line px-4 py-3 text-sm leading-relaxed text-bone-dim">
                    {s.note}
                  </p>
                </details>
              </li>
            ))}
          </ul>
        </Block>
      )}

      {/* Risks first: the findings with a path to harm, the ones the verdict
          weighs. A report with none says so plainly, so a healthy app reads as
          healthy rather than as a wall of problems. */}
      <Block id="risks" label={`Risks to weigh (${riskFindings.length})`}>
        <p className="-mt-2 mb-4 max-w-2xl text-sm leading-relaxed text-bone-dim">
          Findings with a path to harm in production. These are what the verdict
          weighs.
        </p>
        {riskFindings.length === 0 ? (
          <p className="border border-line bg-ink-raised px-4 py-3.5 text-sm text-bone-dim">
            No risks surfaced. Nothing here has a path to harm in production.
          </p>
        ) : (
          <FindingList items={riskFindings} collapseMinor={false} />
        )}
      </Block>

      {/* Improvements: safe today, robustness over time. Never cap the verdict.
          The low + informational bulk folds so the list reads as a punch list,
          not a body count. */}
      {improvementFindings.length > 0 && (
        <Block id="improvements" label={`Improvements (${improvementFindings.length})`}>
          <p className="-mt-2 mb-4 max-w-2xl text-sm leading-relaxed text-bone-dim">
            Safe today. Ways to make the app more robust, observable, and
            consistent over time. These do not affect the verdict.
          </p>
          <FindingList items={improvementFindings} collapseMinor={true} />
        </Block>
      )}

      {report.remediationPlan.length > 0 && (
      <Block label="Prioritised remediation plan">
        <ol className="space-y-2">
          {report.remediationPlan.map((step, i) => (
            <li
              key={step.title}
              className="flex gap-4 border border-line bg-ink-raised p-3.5"
            >
              <span className="font-mono text-sm font-semibold tabular-nums text-bone-faint">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="text-sm font-medium text-bone">{step.title}</p>
                {step.detail && (
                  <p className="mt-1 text-sm leading-relaxed text-bone-dim">
                    {step.detail}
                  </p>
                )}
                {step.findingIds.length > 0 && (
                  <p className="mt-1.5 font-mono text-[0.65rem] uppercase tracking-wide text-bone-faint">
                    {step.findingIds.join(", ")}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </Block>
      )}

      {report.quickWins.length > 0 && (
      <Block label="Quick wins: low regression risk">
        <ul className="space-y-2">
          {report.quickWins.map((w) => (
            <li key={w.title} className="border border-line bg-ink-raised p-3.5">
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-sm font-medium text-bone">{w.title}</p>
                {w.findingId && (
                  <span className="shrink-0 font-mono text-[0.65rem] uppercase text-bone-faint">
                    {w.findingId}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-bone-faint">
                Blast radius: {w.blastRadius}
              </p>
            </li>
          ))}
        </ul>
      </Block>
      )}

      {report.deeperInvestigation.length > 0 && (
      <Block label="Requires deeper investigation">
        <ul className="space-y-2">
          {report.deeperInvestigation.map((d) => (
            <li key={d.title} className="border border-line bg-ink-raised p-3.5">
              <p className="text-sm font-medium text-bone">{d.title}</p>
              {d.detail && (
                <p className="mt-1 text-sm leading-relaxed text-bone-dim">
                  {d.detail}
                </p>
              )}
              {d.findingIds && d.findingIds.length > 0 && (
                <p className="mt-1.5 font-mono text-[0.65rem] uppercase tracking-wide text-bone-faint">
                  {d.findingIds.join(", ")}
                </p>
              )}
            </li>
          ))}
        </ul>
      </Block>
      )}

      {report.notAssessed.length > 0 && (
      <Block label="Not assessed: runtime-only checks skipped">
        <ul className="space-y-2">
          {report.notAssessed.map((n) => (
            <li key={n.check} className="border border-line bg-ink-raised p-3.5">
              <p className="text-sm font-medium text-bone">{n.check}</p>
              <p className="mt-1 text-xs leading-relaxed text-bone-dim">
                <span className="font-mono uppercase tracking-wide text-bone-faint">
                  To verify:
                </span>{" "}
                {n.howToVerify}
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
          <ul className="divide-y divide-line border-y border-line">
            {report.mechanicalSweeps.map((s) => (
              <li
                key={s.name}
                className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-2.5"
              >
                <span className="font-mono text-xs uppercase tracking-wide text-bone">
                  {s.name}
                </span>
                <span className="font-mono text-[0.65rem] uppercase tracking-wide text-bone-faint">
                  {s.outcome}
                </span>
                {s.summary && (
                  <span className="w-full text-xs leading-relaxed text-bone-dim sm:w-auto sm:flex-1">
                    {s.summary}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Block>
      )}
    </div>
  );
}
