// How production-audit works: the method, the dimensions, the principles and
// the run flags. These lived on the homepage until 2026-10-19, where they
// made the front page a second production-audit page; the skill's own page is
// where a reader who wants the method goes looking for it.

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

export function AuditMethod() {
  return (
    <section id="method" aria-labelledby="method-heading" className="mt-16 scroll-mt-20">
      <h2 id="method-heading" className="font-display text-2xl tracking-normal text-bone sm:text-3xl">
        How it works
      </h2>

      <ol className="mt-6 divide-y divide-line border-y border-line">
        {PHASES.map((p) => (
          <li key={p.n} className="grid gap-2 py-5 sm:grid-cols-[5rem_minmax(0,1fr)] sm:gap-8">
            <span className="font-mono text-2xl font-semibold tabular-nums text-bone-faint">
              {p.n}
            </span>
            <div>
              <h3 className="font-mono text-sm font-semibold uppercase tracking-wide text-bone">
                {p.t}
              </h3>
              <p className="mt-1.5 max-w-measure text-sm leading-relaxed text-bone-dim">
                {p.d}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <h3 className="mt-12 font-mono text-sm font-semibold text-bone">
        Eleven dimensions, resolved per project
      </h3>
      <div className="mt-4 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {DIMENSIONS.map((dim) => (
          <div key={dim.k} className="bg-ink p-5">
            <h4 className="font-mono text-xs font-semibold uppercase tracking-wide text-bone">
              {dim.k}
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-bone-dim">{dim.d}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 max-w-measure text-sm leading-relaxed text-bone-dim">
        These six usually apply. Five more resolve per project: operability,
        testing confidence, data and migration safety, release safety, and
        performance. Even these six drop out where there is no surface. Anything
        left out is named with a reason, never quietly skipped.
      </p>

      <h3 className="mt-12 font-mono text-sm font-semibold text-bone">
        What makes the findings trustworthy
      </h3>
      <div className="mt-4 grid gap-px border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
        {PRINCIPLES.map((pr) => (
          <div key={pr.t} className="bg-ink p-5">
            <h4 className="text-sm font-semibold text-bone">{pr.t}</h4>
            <p className="mt-2 max-w-measure text-sm leading-relaxed text-bone-dim">{pr.d}</p>
          </div>
        ))}
      </div>
      <p className="mt-6 max-w-measure text-sm leading-relaxed text-bone-dim">
        You set the scope, not the bar. Which dimensions apply comes from what
        your product is, and which risks you accept is your call, on the record.
        The severity rubric and the meaning of the verdict are fixed on purpose.
        A bar you could lower until it turns green is the false comfort this
        exists to replace.
      </p>

      <h3 className="mt-12 font-mono text-sm font-semibold text-bone">Ways to run it</h3>
      <div className="mt-4 max-w-2xl space-y-2 border border-line bg-ink-raised p-5 font-mono text-sm">
        {RUNS.map(([cmd, note]) => (
          <div key={cmd} className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
            <span className="text-command">{cmd}</span>
            <span className="text-bone-faint">{note}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 max-w-measure text-sm leading-relaxed text-bone-dim">
        The audit is read-only. It never changes your code, and it tells you what
        it did not look at. It reads code and traces flows; it is not a
        penetration test.
      </p>
    </section>
  );
}
