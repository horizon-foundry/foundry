import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Terminal } from "@/components/Terminal";
import { ReportSpecimen } from "@/components/ReportSpecimen";
import { HeroInstall, InstallBlock } from "@/components/InstallBlock";
import { OwnershipBar } from "@/components/OwnershipBar";
import { getPublicReport, listPublicReports } from "@/lib/reports";
import { VERDICT_LABEL } from "@/lib/report-types";
import { listSkills, STAGES } from "@/lib/skills";
import { readinessOwnership } from "@/lib/readiness-owners";
import { RESUME_URL, REPO_URL } from "@/lib/site";

/*
  One story, in seven beats (plan: foundry-site-overhaul, Decision 2):
  the hero, the problem, the cornerstone (production-audit, the largest
  moment on the page), the skills by stage, what ready means, install, and
  who built this. The method, dimensions and principles live on
  /skills/production-audit. Copy marked DRAFT below is for Craig's approval.
*/

const LINK =
  "text-bone underline decoration-line-strong underline-offset-4 transition-colors hover:text-signal hover:decoration-bone";

const STEPS = [
  ["Context", "maps every flow and trust boundary"],
  ["Sweep", "runs the tools first"],
  ["Fan out", "one reviewer per dimension"],
  ["Refute", "a skeptic tries to disprove each finding"],
] as const;

export default function Home() {
  const publicReports = listPublicReports();
  const featured =
    publicReports.find((r) => r.slug.startsWith("foundry-")) ?? publicReports[0];
  const example = featured ? getPublicReport(featured.slug) : null;
  const skills = listSkills();
  const owned = readinessOwnership();

  return (
    <>
      <SiteHeader />
      <main id="main">
        {/* 1. Hero */}
        <section className="relative overflow-hidden border-b border-line">
          <div className="relative mx-auto max-w-[1180px] px-5 pb-20 pt-16 sm:px-8 sm:pt-24">
            <div className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center">
              <div className="stagger-rise">
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-bone-faint">
                  A Horizon Foundry suite · Distill. Forge. Deliver.
                </p>
                <h1 className="mt-5 font-display text-4xl leading-[1.05] tracking-normal text-bone sm:text-6xl">
                  Forge shippable software <br />
                  from <span className="text-signal">AI-built code</span>.
                </h1>
                {/* DRAFT body, for Craig. */}
                <p className="mt-6 max-w-measure text-lg leading-relaxed text-bone-dim">
                  Eleven Claude Code skills for building with an AI in the
                  loop. The flagship reads your whole application and ends in
                  one verdict you can act on.
                </p>
                <HeroInstall />
              </div>
              {/* The terminal is the hero's only moving part: it types a real
                  run and ends on a verdict (DESIGN.md, Motion). */}
              <div className="stagger-rise">
                <Terminal />
              </div>
            </div>
          </div>
        </section>

        {/* 2. The problem */}
        <section className="border-b border-line">
          <div className="mx-auto grid max-w-[1180px] gap-6 px-5 py-16 sm:px-8 md:grid-cols-[0.9fr_1.1fr] md:gap-8">
            <h2 className="font-display text-2xl tracking-normal text-bone sm:text-3xl">
              Software built fast ships confident and unverified.
            </h2>
            {/* DRAFT, shortened from the earlier two paragraphs. */}
            <p className="max-w-measure text-lg leading-relaxed text-bone-dim">
              A security review looks at security. A diff review looks at a
              diff. None of them answers the question you ask the night before
              real users arrive: is this safe to ship?
            </p>
          </div>
        </section>

        {/* 3. The cornerstone */}
        <section aria-labelledby="audit-heading" className="border-b border-line bg-ink-raised">
          <div className="mx-auto max-w-[1180px] px-5 py-20 sm:px-8">
            <p className="font-mono text-sm text-command">/production-audit</p>
            <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
              <div>
                {/* DRAFT headline and line, for Craig. */}
                <h2
                  id="audit-heading"
                  className="max-w-[16ch] font-display text-3xl leading-[1.08] tracking-normal text-bone sm:text-5xl"
                >
                  One verdict. Every finding backed by evidence.
                </h2>
                <p className="mt-5 max-w-measure text-lg leading-relaxed text-bone-dim">
                  It reads the whole app, traces each flow from end to end, and
                  sends every serious finding to a skeptic before it reaches
                  the report. Then it decides.
                </p>

                <figure className="mt-8 flex max-w-sm flex-col gap-2 border border-line bg-ink p-3">
                  <figcaption className="font-mono text-[0.6875rem] text-bone-faint">
                    The three verdicts a report returns
                  </figcaption>
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
                </figure>
              </div>

              <div>
                {example && <ReportSpecimen report={example} showLink={false} />}
                <p className="mt-3 font-mono text-xs leading-relaxed text-bone-faint">
                  Foundry, audited by Foundry. The repository is public, so you
                  can read every finding against its source.
                </p>
              </div>
            </div>

            <ol className="mt-14 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map(([t, d], i) => (
                <li key={t} className="bg-ink-raised p-4">
                  <span className="font-mono text-[0.6875rem] text-bone-faint">0{i}</span>
                  <p className="mt-1 font-mono text-sm font-semibold text-bone">{t}</p>
                  <p className="mt-1 text-sm leading-snug text-bone-dim">{d}</p>
                </li>
              ))}
            </ol>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {featured && (
                <Link
                  href={`/example/${featured.slug}`}
                  className="inline-flex min-h-11 items-center border border-line-strong bg-bone px-3 py-2 font-mono text-sm font-semibold text-ink transition-opacity hover:opacity-90"
                >
                  Read the self-audit →
                </Link>
              )}
              <Link
                href="/skills/production-audit"
                className="inline-flex min-h-11 items-center border border-line px-3 py-2 font-mono text-sm text-bone-dim transition-colors hover:border-line-strong hover:text-bone"
              >
                How it works →
              </Link>
            </div>
          </div>
        </section>

        {/* 4. The skills, by stage */}
        <section aria-labelledby="skills-heading" className="border-b border-line">
          <div className="mx-auto max-w-[1180px] px-5 py-16 sm:px-8">
            <h2 id="skills-heading" className="font-display text-2xl tracking-normal text-bone sm:text-3xl">
              Eleven skills, from the idea to the release.
            </h2>
            <div className="mt-8 grid gap-px border border-line bg-line md:grid-cols-3">
              {STAGES.map((stage) => (
                <div key={stage.id} className="bg-ink p-5 sm:p-6">
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
                    {stage.label}
                  </p>
                  <p className="mt-1 font-mono text-[0.6875rem] text-bone-faint">
                    {stage.caption}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-bone-dim">{stage.line}</p>
                  <ul className="mt-5 divide-y divide-line border-y border-line">
                    {skills
                      .filter((s) => s.stage === stage.id)
                      .map((s) => (
                        <li key={s.slug}>
                          <Link
                            href={`/skills/${s.slug}`}
                            className="group flex min-h-11 flex-col justify-center py-2"
                          >
                            <span className="font-mono text-sm text-command">/{s.name}</span>
                            <span className="text-xs leading-snug text-bone-faint transition-colors group-hover:text-bone-dim">
                              {s.copy?.headline ?? s.tagline}
                            </span>
                          </Link>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. What ready means */}
        <section aria-labelledby="ready-heading" className="border-b border-line">
          <div className="mx-auto grid max-w-[1180px] gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-end">
            <div>
              <h2 id="ready-heading" className="font-display text-2xl tracking-normal text-bone sm:text-3xl">
                What ready means, written down.
              </h2>
              {/* DRAFT, for Craig. */}
              <p className="mt-4 max-w-measure leading-relaxed text-bone-dim">
                {owned.total} concerns decide whether a product is ready for
                real users. The readiness map names who checks each one,
                including the {owned.outsideRows} that no skill can.
              </p>
              <Link href="/readiness" className={`mt-5 inline-flex min-h-11 items-center font-mono text-sm ${LINK}`}>
                Open the readiness map →
              </Link>
            </div>
            <OwnershipBar owned={owned} />
          </div>
        </section>

        {/* 6. Install */}
        <InstallBlock />

        {/* 7. Who built this. DRAFT, for Craig: Horizon Foundry's voice, with
            Craig named. */}
        <section aria-labelledby="who-heading">
          <div className="mx-auto max-w-[1180px] px-5 py-16 sm:px-8">
            <h2 id="who-heading" className="font-display text-2xl tracking-normal text-bone sm:text-3xl">
              Built the way it tells you to build.
            </h2>
            <p className="mt-4 max-w-measure leading-relaxed text-bone-dim">
              Foundry is made by Horizon Foundry, the studio of{" "}
              <a href={RESUME_URL} target="_blank" rel="noreferrer" className={LINK}>
                Craig Martin
              </a>
              . Every skill was used to build this site: it was framed, planned,
              documented and audited with Foundry, and the record is public.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-mono text-sm">
              <Link href="/behind" className={`inline-flex min-h-11 items-center ${LINK}`}>
                How it was built
              </Link>
              {featured && (
                <Link href={`/example/${featured.slug}`} className={`inline-flex min-h-11 items-center ${LINK}`}>
                  The self-audit
                </Link>
              )}
              <a href={REPO_URL} target="_blank" rel="noreferrer" className={`inline-flex min-h-11 items-center ${LINK}`}>
                The source
              </a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
