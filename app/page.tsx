import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { HeroForge } from "@/components/HeroForge";
import { Terminal } from "@/components/Terminal";
import { ReportSpecimen } from "@/components/ReportSpecimen";
import { getPublicReport, listPublicReports } from "@/lib/reports";
import { VERDICT_LABEL } from "@/lib/report-types";
import { InstallBlock } from "@/components/InstallBlock";

/*
  Section-opening cadence (a deliberate, named system; not one reflex):
  - The KICKER (tracked mono caps) appears exactly once, on the hero.
  - RULE + TITLE (the draw-rule hairline gesture + heading) opens the
    sequence-flavored sections: the flagship divider, the method, run it.
  - A bare display h2 opens the prose sections: problem, dimensions,
    principles, worked example.
  Scroll entrances alternate .reveal (rise) and .reveal-fade so the page
  breathes instead of repeating one move (globals.css).
*/

const DIMENSIONS = [
  {
    k: "Security",
    d: "An authorization matrix for every mutation, plus tenant isolation, injection surfaces, secret exposure, and how model output is handled.",
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

export default function Home() {
  // Two public examples: the self-audit (Foundry auditing its own repo, the
  // real credibility anchor) is featured; Perch is the illustrative
  // traditional-SaaS sample. The self-audit tracks the suite (see CLAUDE.md):
  // regenerate it when the suite changes so this proof stays true to what ships.
  const publicReports = listPublicReports();
  const featured =
    publicReports.find((r) => r.slug.startsWith("foundry-")) ?? publicReports[0];
  const illustrative = publicReports.find((r) => r.slug !== featured?.slug);
  // The full featured report backs the worked-example specimen further down.
  const example = featured ? getPublicReport(featured.slug) : null;

  return (
    <>
      <SiteHeader />
      <main id="main">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-line">
          <HeroForge />
          <div className="relative mx-auto max-w-[1180px] px-5 pb-20 pt-16 sm:px-8 sm:pt-24">
            <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="stagger-rise">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-bone-faint">
                A Horizon Foundry suite · Distill. Forge. Deliver.
              </p>
              <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-bone sm:text-6xl">
                Forge shippable software{" "}
                <br />
                from <span className="text-signal">AI-built code</span>.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-bone-dim">
                Foundry is nine Claude Code skills that turn fast, AI-built
                code into something you can ship. The flagship audits the whole
                application and ends in one verdict that names its evidence:
                safe to ship; ready to ship, risks noted; or do not ship.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="#install"
                  className="press inline-flex min-h-11 items-center border border-line-strong bg-bone px-3.5 py-2 font-mono text-sm font-semibold text-ink transition-opacity hover:opacity-90"
                >
                  Install Foundry →
                </Link>
                <Link
                  href="/skills"
                  className="inline-flex min-h-11 items-center border border-line px-3 py-2 font-mono text-sm text-bone-dim transition-colors hover:border-line-strong hover:text-bone"
                >
                  See the skills →
                </Link>
              </div>
            </div>
            <div className="stagger-rise">
              <Terminal />
            </div>
            </div>

            {/* Distill / Forge / Deliver, the brand triad mapped to the arc. */}
            <div className="stagger-rise mt-14 grid gap-px border border-line bg-line sm:grid-cols-3">
              {(
                [
                  ["Distill", "Melt messy context down to what is clear and current."],
                  ["Forge", "Build with the discipline that survives a cold start."],
                  ["Deliver", "Ship on a verdict, not a hope."],
                ] as const
              ).map(([verb, line]) => (
                <div key={verb} className="bg-ink px-5 py-5">
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
                    {verb}
                  </span>
                  <p className="mt-2 text-sm leading-relaxed text-bone-dim">
                    {line}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </section>

        <InstallBlock />

        {/* The five promises: the suite's whole claim, each kept by a named
            skill. Placed after the install so the pitch never outranks the
            quick start. Delivery integrity, not product strategy. */}
        <section className="reveal border-b border-line">
          <div className="mx-auto max-w-[1180px] px-5 py-12 sm:px-8">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-bone-faint">
              Five promises, each kept by a skill
            </p>
            <ol className="mt-4 divide-y divide-line border-y border-line">
              {(
                [
                  ["Product intent is declared and audited", "/frame"],
                  ["Execution context survives every session", "/phase-plan"],
                  ["The intended outcome is instrumented", "/instrumentation"],
                  ["The documentation matches reality", "/document"],
                  ["Technical readiness is audited before real users", "/foundry + /production-audit"],
                ] as const
              ).map(([promise, cmd], i) => (
                <li
                  key={cmd}
                  className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                >
                  <span className="text-sm leading-relaxed text-bone-dim">
                    <span className="mr-3 font-mono text-xs tabular-nums text-bone-faint">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {promise}
                  </span>
                  <span className="pl-8 font-mono text-xs text-command sm:pl-0">
                    {cmd}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* The flagship divider */}
        <section className="reveal border-b border-line bg-ink-raised">
          <div className="mx-auto grid max-w-[1180px] gap-8 px-5 py-12 sm:px-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="flex items-center gap-3">
                <span className="draw-rule h-px w-8 bg-signal" aria-hidden="true" />
                <h2 className="font-display text-2xl font-semibold tracking-tight text-bone sm:text-3xl">
                  Production Audit
                </h2>
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-bone-dim">
                The deliver step of the suite: a whole-application pre-launch
                audit across the dimensions your product calls for, from a
                standing set of eleven, separating risks from improvements. It
                ends in a ship or no-ship verdict that names the evidence it
                stands on.
              </p>
              {featured && (
                <Link
                  href={`/example/${featured.slug}`}
                  className="mt-4 inline-flex min-h-11 items-center font-mono text-xs uppercase tracking-wide text-bone-dim transition-colors hover:text-bone"
                >
                  See our audit of this repo →
                </Link>
              )}
            </div>
            {/* The three verdicts it can return. Color = the decision. */}
            <div className="flex flex-col gap-2">
              {(
                [
                  ["safe-to-ship", "text-verdict-safe", "border-verdict-safe"],
                  ["ship-with-known-risks", "text-verdict-risk", "border-verdict-risk"],
                  ["do-not-ship", "text-verdict-noship", "border-verdict-noship"],
                ] as const
              ).map(([level, color, border]) => (
                <div
                  key={level}
                  className={`flex items-center gap-2.5 border-l-2 ${border} bg-ink px-3 py-1.5`}
                >
                  <span className={`font-mono text-xs uppercase tracking-wide ${color}`}>
                    {VERDICT_LABEL[level]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* The problem */}
        <section className="reveal-fade border-b border-line">
          <div className="mx-auto grid max-w-[1180px] gap-8 px-5 py-16 sm:px-8 md:grid-cols-[0.9fr_1.1fr]">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-bone sm:text-3xl">
              Software built fast ships confident and unverified.
            </h2>
            <div className="space-y-4 text-bone-dim">
              <p className="leading-relaxed">
                A security review looks at security. A diff review looks at a
                diff. A frontend audit looks at the frontend. None of them
                answer the question you actually ask the night before an invite
                wave: is this safe to put in front of real people.
              </p>
              <p className="leading-relaxed">
                That question covers the whole app, and it needs a verdict, not a
                list. Production Audit traces the flows that cross file
                boundaries, produces artifacts a reviewer can finish, and refuses
                to report anything it cannot back with evidence.
              </p>
            </div>
          </div>
        </section>

        {/* Dimensions */}
        <section id="dimensions" className="reveal border-b border-line">
          <div className="mx-auto max-w-[1180px] px-5 py-16 sm:px-8">
            <h2 className="max-w-2xl font-display text-2xl font-semibold tracking-tight text-bone sm:text-3xl">
              Eleven dimensions, resolved per project.
            </h2>
            <div className="mt-6 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
              {DIMENSIONS.map((dim) => (
                <div key={dim.k} className="bg-ink p-5">
                  <h3 className="font-mono text-sm font-semibold uppercase tracking-wide text-bone">
                    {dim.k}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-bone-dim">
                    {dim.d}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-bone-dim">
              These six usually apply. Five more resolve per project, operability,
              testing confidence, data and migration safety, release safety, and
              performance, and even these six drop out where there is no surface,
              accessibility or UI on a headless service. Anything left out is
              named with a reason, never quietly skipped.
            </p>
          </div>
        </section>

        {/* The method, numbered ledger. The nav's "Method" link lands here
            (it previously anchored to the dimensions section). */}
        <section id="method" className="reveal-fade border-b border-line">
          <div className="mx-auto max-w-[1180px] px-5 py-16 sm:px-8">
            <div className="flex items-center gap-3">
              <span className="draw-rule h-px w-8 bg-signal" aria-hidden="true" />
              <h2 className="font-display text-2xl font-semibold tracking-tight text-bone sm:text-3xl">
                The method
              </h2>
            </div>
            <div className="mt-6 divide-y divide-line border-y border-line">
              {PHASES.map((p) => (
                <div
                  key={p.n}
                  className="grid gap-3 py-6 sm:grid-cols-[auto_1fr] sm:gap-8"
                >
                  <div className="font-mono text-3xl font-semibold tabular-nums text-bone-faint sm:w-24">
                    {p.n}
                  </div>
                  <div>
                    <h3 className="font-mono text-base font-semibold uppercase tracking-wide text-bone">
                      {p.t}
                    </h3>
                    <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-bone-dim">
                      {p.d}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Principles */}
        <section className="reveal border-b border-line">
          <div className="mx-auto max-w-[1180px] px-5 py-16 sm:px-8">
            <h2 className="max-w-2xl font-display text-2xl font-semibold tracking-tight text-bone sm:text-3xl">
              What makes the findings trustworthy.
            </h2>
            <div className="mt-6 grid gap-px border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
              {PRINCIPLES.map((pr) => (
                <div key={pr.t} className="bg-ink p-5">
                  <h3 className="text-sm font-semibold text-bone">{pr.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-bone-dim">
                    {pr.d}
                  </p>
                </div>
              ))}
            </div>
            {/* The tune-vs-fixed answer, given its own line rather than buried
                as one principle among many: it is the sharpest trust claim. */}
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-bone-dim">
              You set the scope, not the bar. Which dimensions apply comes from
              what your product is, and which risks you accept is your call, on
              the record. The severity rubric and the meaning of the verdict are
              fixed on purpose. A bar you could lower until it turns green is the
              false comfort this exists to replace.
            </p>
          </div>
        </section>

        {/* First run: case study, aggregate only */}
        {featured && (
          <section className="reveal-fade border-b border-line">
            <div className="mx-auto max-w-[1180px] px-5 py-16 sm:px-8">
              <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
                <div>
                  <h2 className="font-display text-2xl font-semibold tracking-tight text-bone sm:text-3xl">
                    We audited Foundry with Foundry.
                  </h2>
                  <p className="mt-4 leading-relaxed text-bone-dim">
                    The same {"/production-audit"} this suite ships, run against
                    Foundry&apos;s own repository. Real code, real findings,
                    nothing fictional. The core access controls, fail-closed
                    auth, and security headers verified clean; the open risks are
                    named and fixable. The repository is public, so you can read
                    the report against its source and see exactly what the method
                    checked and what it found.
                  </p>
                  <p className="mt-4 font-mono text-sm text-bone-dim">
                    Verdict:{" "}
                    <span className="text-verdict-risk">
                      {VERDICT_LABEL[featured.verdictLevel]}
                    </span>
                  </p>
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <Link
                      href={`/example/${featured.slug}`}
                      className="inline-flex min-h-11 items-center border border-line-strong bg-bone px-3 py-2 font-mono text-sm font-semibold text-ink transition-opacity hover:opacity-90"
                    >
                      Read the full report →
                    </Link>
                    {illustrative && (
                      <span className="font-mono text-xs text-bone-faint">
                        Prefer a traditional SaaS shape? See the{" "}
                        <Link
                          href={`/example/${illustrative.slug}`}
                          className="text-bone-dim underline decoration-line-strong underline-offset-4 transition-colors hover:text-bone"
                        >
                          {illustrative.project} example
                        </Link>
                        , a fictional booking app audited in full.
                      </span>
                    )}
                  </div>
                </div>
                {/* The real artifact, where evidence belongs: the specimen
                    renders the actual report (stamp, ledger, trust line) via
                    the report components. Its footer link is off; the section
                    already carries the primary CTA. */}
                {example && <ReportSpecimen report={example} showLink={false} />}
              </div>
            </div>
          </section>
        )}

        {/* Usage */}
        <section className="reveal">
          <div className="mx-auto max-w-[1180px] px-5 py-16 sm:px-8">
            <div className="flex items-center gap-3">
              <span className="draw-rule h-px w-8 bg-signal" aria-hidden="true" />
              <h2 className="font-display text-2xl font-semibold tracking-tight text-bone sm:text-3xl">
                Run it
              </h2>
            </div>
            <div className="mt-6 max-w-2xl space-y-2 border border-line bg-ink-raised p-5 font-mono text-sm">
              {[
                ["/production-audit", "full audit: core + applicable dimensions"],
                ["/production-audit security", "one dimension, scoped posture"],
                ["/production-audit --quick", "security + reliability triage"],
                ["/production-audit --runtime", "add a live browser pass"],
              ].map(([cmd, note]) => (
                <div
                  key={cmd}
                  className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                >
                  <span className="text-command">{cmd}</span>
                  <span className="text-bone-faint">{note}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-bone-dim">
              The audit is read-only. It never changes your code. It produces a
              structured report and a verdict, and it tells you what it did not
              look at. It reads code and traces flows; it is not a penetration
              test.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
