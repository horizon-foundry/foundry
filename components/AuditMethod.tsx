// How production-audit works: the method, the dimensions, the principles and
// the run flags. These lived on the homepage until 2026-10-19, where they
// made the front page a second production-audit page; the skill's own page is
// where a reader who wants the method goes looking for it. It sits below the
// sell as one more band of the skill page (app/styles/skill.css): the phases
// as a ruled list, the dimensions and the principles as ruled items in three
// columns, and the ways to run it in an Ink well, each command behind the
// amber unit bar.
import { UnitBar } from "@/components/brand/UnitBar";

const DIMENSIONS = [
  {
    k: "Security",
    d: "An authorization matrix for every read and write, plus sign-in, where sensitive data goes, tenant isolation, injection, and model output.",
  },
  {
    k: "Concurrency",
    d: "Idempotency on every write, check-then-write races (TOCTOU), effect cleanup, and state that stays correct across multiple tabs.",
  },
  {
    k: "Reliability",
    d: "A failure-path table per dependency: timeout, retry, user-visible failure, partial success, rollback.",
  },
  {
    k: "Accessibility",
    d: "Primitives first: focus traps, labels, roles, and keyboard paths, checked against WCAG 2.2 AA as far as static review can reach.",
  },
  {
    k: "UI consistency",
    d: "Token conformance, component divergence, state coverage, and copy drift across the whole surface.",
  },
  {
    k: "Infra",
    d: "Deploy config, security headers, CSP, env handling, and a dependency audit triaged by real exposure.",
  },
];

const PHASES = [
  {
    n: "00",
    t: "Context",
    d: "Read the docs, map the stack, build the flow inventory and trust-boundary map. The audit works flow by flow, not file by file.",
  },
  {
    n: "01",
    t: "Sweep",
    d: "Mechanical passes first: dependency audit, secret scan, typecheck, lint. That way the deeper review never spends time on something a tool could have caught.",
  },
  {
    n: "02",
    t: "Fan out",
    d: "One reviewer per dimension, each producing its required artifact. Every finding cites a file and line, or it is not a finding.",
  },
  {
    n: "03",
    t: "Refute",
    d: "Every critical, high, and verdict-driving finding goes to a fresh skeptic who tries to disprove it against the code. The ones that survive make the report.",
  },
];

const PRINCIPLES = [
  {
    t: "Flows, not files",
    d: "A bug lives in the seam between two files more often than inside one. The unit of work is a flow traced end to end.",
  },
  {
    t: "Artifacts, not vibes",
    d: "An authorization matrix and a failure-path table can be finished, and a blank cell is a finding. 'Look harder' can't be finished, so it finds nothing.",
  },
  {
    t: "Adversarial verification",
    d: "The default failure of an AI audit is the confident, wrong finding. So every finding that drives the verdict has to survive someone trying to refute it.",
  },
  {
    t: "Evidence classes",
    d: "Runtime-reproduced means observed live. Code-traced means the full path was read. High-confidence names its one assumption. If a finding fits none of these, it isn't reported.",
  },
  {
    t: "The kill list",
    d: "The predictable false positives are named and forbidden. Before calling a control missing, check every layer it could live at.",
  },
  {
    t: "The honest boundary",
    d: "Anything that needs a running browser is labeled needs-verification or listed as not assessed. The verdict names the evidence it stands on: a static-only run is clear within the scope it checked, never a flat safe-to-ship.",
  },
];

const RUNS = [
  ["/production-audit", "full audit: core and applicable dimensions"],
  ["/production-audit security", "one dimension, scoped posture"],
  ["/production-audit --quick", "security and reliability triage"],
  ["/production-audit --runtime", "add a live browser pass"],
] as const;

export function AuditMethod({ ground }: { ground: "ink" | "slate" }) {
  return (
    <section
      id="method"
      aria-labelledby="method-heading"
      className="sk-band sk-method scroll-mt-24"
      data-ground={ground}
    >
      <div className="wrap">
        <h2 id="method-heading" className="d-h2">
          How it works
        </h2>

        <ol className="sk-me-phases">
          {PHASES.map((p) => (
            <li key={p.n}>
              <span className="sk-me-n">{p.n}</span>
              <div>
                <h3 className="sk-h3">{p.t}</h3>
                <p className="sk-me-p">{p.d}</p>
              </div>
            </li>
          ))}
        </ol>

        <h3 className="sk-h3 sk-me-h">
          Eleven dimensions, resolved per project
        </h3>
        <div className="sk-me-grid">
          {DIMENSIONS.map((dim) => (
            <div key={dim.k}>
              <h4>{dim.k}</h4>
              <p>{dim.d}</p>
            </div>
          ))}
        </div>
        <p className="sk-me-note">
          These six usually apply. Five more resolve per project: operability,
          testing confidence, data and migration safety, release safety, and
          performance. Even these six drop out where there is no surface.
          Anything left out is named with a reason, never quietly skipped.
        </p>

        <h3 className="sk-h3 sk-me-h">What makes the findings trustworthy</h3>
        <div className="sk-me-grid">
          {PRINCIPLES.map((pr) => (
            <div key={pr.t}>
              <h4>{pr.t}</h4>
              <p>{pr.d}</p>
            </div>
          ))}
        </div>
        <p className="sk-me-note">
          You set the scope, not the bar. Which dimensions apply comes from what
          your product is, and which risks you accept is your call, on the
          record. The severity rubric and the meaning of the verdict are fixed
          on purpose. A bar you could lower until it turns green is the false
          comfort this exists to replace.
        </p>

        <h3 className="sk-h3 sk-me-h">Ways to run it</h3>
        <ul className="sk-runs" role="list">
          {RUNS.map(([cmd, note]) => (
            <li key={cmd}>
              <UnitBar fill="amber" />
              <code>{cmd}</code>
              <span>{note}</span>
            </li>
          ))}
        </ul>
        <p className="sk-me-note sk-me-after">
          The audit is read-only. It never changes your code, and it tells you
          what it did not look at. It reads code and traces flows; it is not a
          penetration test.
        </p>
      </div>
    </section>
  );
}
