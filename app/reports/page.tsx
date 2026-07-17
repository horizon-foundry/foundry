import Link from "next/link";
import {
  listReportsFor,
  listPublicReports,
  getPublicReport,
  type ReportSummary,
} from "@/lib/reports";
import { getSessionEmail, isAdmin } from "@/lib/supabase";
import { VERDICT_LABEL, type VerdictLevel } from "@/lib/report-types";

export const metadata = { title: "Reports" };

const VERDICT_TEXT: Record<VerdictLevel, string> = {
  "safe-to-ship": "text-verdict-safe",
  "ship-with-known-risks": "text-verdict-risk",
  "do-not-ship": "text-verdict-noship",
};

// One owned report: links to the gated detail (/reports/[slug]).
function OwnedRow({ r }: { r: ReportSummary }) {
  return (
    <li>
      <Link
        href={`/reports/${r.slug}`}
        className="group grid gap-3 py-5 transition-colors hover:bg-ink-raised sm:grid-cols-[1fr_auto] sm:items-center"
      >
        <div className="min-w-0">
          <h3 className="break-words font-mono text-lg font-semibold tracking-tight text-bone">
            {r.project}
          </h3>
          <p className="mt-0.5 font-mono text-xs uppercase tracking-wide text-bone-faint">
            {r.date}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <div className="flex items-center gap-2 font-mono text-xs tabular-nums">
            <span className="text-critical">{r.bySeverity.critical}C</span>
            <span className="text-high">{r.bySeverity.high}H</span>
            <span className="text-medium">{r.bySeverity.medium}M</span>
            <span className="text-low">{r.bySeverity.low}L</span>
            <span className="text-informational">
              {r.bySeverity.informational}i
            </span>
          </div>
          <span
            className={`font-mono text-xs uppercase tracking-wide ${VERDICT_TEXT[r.verdictLevel]}`}
          >
            {VERDICT_LABEL[r.verdictLevel]}
          </span>
          <span
            className="font-mono text-bone-faint transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          >
            →
          </span>
        </div>
      </Link>
    </li>
  );
}

// One public example: links to the ungated detail (/example/[slug]).
function ExampleCard({ r }: { r: ReportSummary }) {
  const full = getPublicReport(r.slug);
  const risks =
    full?.findings.filter((f) => (f.kind ?? "risk") === "risk").length ?? 0;
  const improvements = (full?.findings.length ?? 0) - risks;
  const isSelfAudit = r.slug.startsWith("foundry-");
  return (
    <li>
      <Link
        href={`/example/${r.slug}`}
        className="group block border border-line bg-ink-raised p-5 transition-colors hover:border-line-strong sm:p-6"
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h3 className="font-mono text-lg font-semibold text-bone">
            {r.project}
          </h3>
          <span className="border border-line px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-wide text-bone-faint">
            {isSelfAudit ? "Our own audit" : "Illustrative sample"}
          </span>
          <span
            className={`ml-auto font-mono text-xs uppercase tracking-wide ${VERDICT_TEXT[r.verdictLevel]}`}
          >
            {VERDICT_LABEL[r.verdictLevel]}
          </span>
        </div>
        <p className="mt-3 font-mono text-[0.7rem] uppercase tracking-wide text-bone-faint">
          {risks} {risks === 1 ? "risk" : "risks"} · {improvements} improvements
          · audited {r.date}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-bone-dim">
          {isSelfAudit
            ? "Foundry ran /production-audit against its own code. Real findings, no fiction, and the repository is public so you can check the report against the source."
            : "A fictional booking app audited in full, to show the method on a payments-and-concurrency product the self-audit's own surface cannot exercise."}
        </p>
        <span className="mt-4 inline-flex items-center font-mono text-xs uppercase tracking-wide text-bone-dim transition-colors group-hover:text-bone">
          Read the report{" "}
          <span
            className="ml-1 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          >
            →
          </span>
        </span>
      </Link>
    </li>
  );
}

export default async function ReportsIndex() {
  // Public page. email may be null (signed out); ownership filtering is applied
  // per viewer, and only meta.public reports are ever shown to a signed-out
  // visitor (via listPublicReports).
  const email = await getSessionEmail();
  const admin = email ? isAdmin(email) : false;
  const owned = email ? listReportsFor({ email, admin }) : [];
  const examples = listPublicReports();

  return (
    <div className="space-y-14">
      {email && (
        <section>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-bone-faint">
            Report history
          </p>
          <h1 className="mt-2 font-mono text-3xl font-semibold tracking-tight text-bone">
            {admin ? "Audit reports" : "Your audit reports"}
          </h1>
          {owned.length === 0 ? (
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-bone-dim">
              No reports are associated with {email} yet. Run{" "}
              <span className="font-mono text-command">/production-audit</span>{" "}
              on your project; published reports stamped with your email appear
              here.
            </p>
          ) : (
            <ul className="mt-8 divide-y divide-line border-y border-line">
              {owned.map((r) => (
                <OwnedRow key={r.slug} r={r} />
              ))}
            </ul>
          )}
        </section>
      )}

      <section>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-bone-faint">
          Example reports
        </p>
        <h2 className="mt-2 font-mono text-3xl font-semibold tracking-tight text-bone">
          {email ? "Example reports" : "What a Production Audit returns"}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-bone-dim">
          Public examples, rendered by the same template every audit uses:
          Foundry&apos;s own audit of this repository, and an illustrative sample
          of a traditional SaaS product. Each ends in a scope-qualified verdict,
          with risks separated from improvements.
        </p>
        <ul className="mt-8 space-y-4">
          {examples.map((r) => (
            <ExampleCard key={r.slug} r={r} />
          ))}
        </ul>
      </section>

      {!email && (
        <div className="flex flex-col gap-3 border border-line bg-ink px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="font-mono text-sm font-semibold text-bone">
              Your own reports
            </p>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-bone-dim">
              Published audits are private to their owner. Run{" "}
              <span className="font-mono text-command">/production-audit</span>{" "}
              on your project, then sign in to see any reports that belong to
              you.
            </p>
          </div>
          <Link
            href="/unlock"
            className="inline-flex min-h-11 shrink-0 items-center justify-center border border-line-strong bg-bone px-4 py-2 font-mono text-sm font-semibold text-ink transition-opacity hover:opacity-90"
          >
            Sign in
          </Link>
        </div>
      )}
    </div>
  );
}
