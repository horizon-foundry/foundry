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
// The cell beside a verdict, filled with the same hue.
const VERDICT_FILL: Record<VerdictLevel, string> = {
  "safe-to-ship": "bg-verdict-safe",
  "ship-with-known-risks": "bg-verdict-risk",
  "do-not-ship": "bg-verdict-noship",
};

// A verdict named in its hue: the cell, then the words. On Ink only.
function Verdict({ level }: { level: VerdictLevel }) {
  return (
    <span className={`rp-sev ${VERDICT_TEXT[level]}`}>
      <i className={`c ${VERDICT_FILL[level]}`} aria-hidden="true" />
      {VERDICT_LABEL[level]}
    </span>
  );
}

// One owned report: links to the gated detail (/reports/[slug]).
function OwnedRow({ r }: { r: ReportSummary }) {
  return (
    <li>
      <Link href={`/reports/${r.slug}`} className="rps-row rps-owned">
        <div>
          <div className="rps-name">
            <h2>{r.project}</h2>
          </div>
          <p className="rps-facts">{r.date}</p>
        </div>
        <div className="rps-state">
          <div className="rps-counts">
            <span className="text-critical">{r.bySeverity.critical}C</span>
            <span className="text-high">{r.bySeverity.high}H</span>
            <span className="text-medium">{r.bySeverity.medium}M</span>
            <span className="text-low">{r.bySeverity.low}L</span>
            <span className="text-informational">
              {r.bySeverity.informational}i
            </span>
          </div>
          <Verdict level={r.verdictLevel} />
        </div>
      </Link>
    </li>
  );
}

// One public example: links to the ungated detail (/example/[slug]). Its
// title sits one level under the section heading, which is the page h1 when
// signed out and an h2 under the report history when signed in.
function ExampleCard({
  r,
  titleAs: Title,
}: {
  r: ReportSummary;
  titleAs: "h2" | "h3";
}) {
  const full = getPublicReport(r.slug);
  const risks =
    full?.findings.filter((f) => (f.kind ?? "risk") === "risk").length ?? 0;
  const improvements = (full?.findings.length ?? 0) - risks;
  const isSelfAudit = r.slug.startsWith("foundry-");
  return (
    <li>
      <Link href={`/example/${r.slug}`} className="rps-row">
        <div className="rps-name">
          <Title>{r.project}</Title>
          <span className="label">
            {isSelfAudit ? "Our own audit" : "Illustrative sample"}
          </span>
        </div>
        <Verdict level={r.verdictLevel} />
        <p className="rps-facts">
          {risks} {risks === 1 ? "risk" : "risks"} · {improvements} improvements
          · audited <span className="whitespace-nowrap">{r.date}</span>
        </p>
        <p className="rps-what">
          {isSelfAudit
            ? <>Foundry ran <span className="cmd">/production-audit</span> against its own code, and the repository is public so you can check the report against the source.</>
            : "A fictional booking app audited in full, to show the method on a payments-and-concurrency product the self-audit's own surface cannot exercise."}
        </p>
        <span className="rp-link rps-go">Read the report</span>
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

  const examplesLead = (
    <p className="t-lead">
      Public examples, rendered by the same template every audit uses:
      Foundry&apos;s own audit of this repository, and an illustrative sample
      of a traditional SaaS product. Each ends in a scope-qualified verdict,
      with risks separated from improvements.
    </p>
  );

  // The page opens on Slate with its one h1: the report history when signed
  // in, the examples when signed out. The lists are on Ink, where a severity
  // or a verdict hue is legible as type.
  return (
    <>
      <section className="rps-head" data-ground="slate">
        <div className="wrap">
          {email ? (
            <h1 className="d-title">
              {admin ? "Audit reports" : "Your audit reports"}
            </h1>
          ) : (
            <>
              <h1 className="d-title">What a Production Audit returns</h1>
              {examplesLead}
            </>
          )}
        </div>
      </section>

      {email && (
        <section className="rps-sec">
          <div className="wrap">
            {owned.length === 0 ? (
              <p className="rps-empty">
                No reports are associated with {email} yet. Run{" "}
                <span className="cmd">/production-audit</span> on your project;
                published reports stamped with your email appear here.
              </p>
            ) : (
              <ul className="rps-list">
                {owned.map((r) => (
                  <OwnedRow key={r.slug} r={r} />
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      <section className="rps-sec">
        <div className="wrap">
          {/* Signed out, the examples are the page and the h1 above names
              them; signed in, the report history owns the h1 and this is its
              second section. */}
          {email && (
            <>
              <h2 className="d-h2">Example reports</h2>
              {examplesLead}
            </>
          )}
          <ul className="rps-list">
            {examples.map((r) => (
              <ExampleCard key={r.slug} r={r} titleAs={email ? "h3" : "h2"} />
            ))}
          </ul>

          {!email && (
            <div className="rps-own">
              <div>
                <p className="rp-h">Your own reports</p>
                <p>
                  Published audits are private to their owner. Run{" "}
                  <span className="cmd">/production-audit</span> on your
                  project, then sign in to see any reports that belong to you.
                </p>
              </div>
              <Link href="/unlock" className="btn">
                Sign in
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
