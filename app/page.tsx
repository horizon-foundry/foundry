import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Terminal } from "@/components/Terminal";
import { HeroInstall, InstallBlock } from "@/components/InstallBlock";
import { Cells, type CellVariant } from "@/components/Cells";
import { Frame } from "@/components/Frame";
import { Reveal } from "@/components/Reveal";
import { StageRail } from "@/components/StageRail";
import { AreaGrid } from "@/components/AreaGrid";
import { VerdictStamp } from "@/components/report-ui";
import { auditFacts, selfAudit } from "@/lib/self-audit";
import { SEVERITY_ORDER } from "@/lib/report-types";
import { listSkills } from "@/lib/skills";
import { readinessOwnership } from "@/lib/readiness-owners";
import { RESUME_URL, REPO_URL } from "@/lib/site";

/*
  One story, in seven beats (plan: foundry-site-overhaul, Decision 2, and the
  approved Instrument prototype): the hero, the problem, the cornerstone
  (production-audit, the largest moment on the page), the skills by stage,
  what ready means, install, and who built this. The method, dimensions and
  principles live on /skills/production-audit. Every number below is read from
  the published self-audit or the readiness map, never typed here.
*/

const LINK =
  "text-bone underline decoration-line-strong underline-offset-4 transition-colors hover:text-signal hover:decoration-bone";

// A count as the word a sentence wants. Counts come from the directory and the
// map; this only spells them.
const NUMBER_WORD = [
  "Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight",
  "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
  "Sixteen", "Seventeen", "Eighteen", "Nineteen", "Twenty",
];
const spell = (n: number) => NUMBER_WORD[n] ?? String(n);

const repeat = (variant: CellVariant, n: number): CellVariant[] =>
  Array.from({ length: n }, () => variant);

export default function Home() {
  const audited = selfAudit();
  const example = audited?.report ?? null;
  const facts = example ? auditFacts(example) : null;
  const featured = audited ? { slug: audited.slug } : null;
  const skillCount = listSkills().length;
  const risks = example?.findings.filter((f) => f.kind === "risk").length ?? 0;
  const audit = {
    verdict: facts?.label ?? "",
    safe: facts?.level === "safe-to-ship",
    risks,
    improvements: (example?.findings.length ?? 0) - risks,
  };
  const owned = readinessOwnership();

  return (
    <>
      <SiteHeader />
      <main id="main">
        {/* 1. Hero: the kept copy, the prototype's scale. */}
        <section className="home-hero" aria-labelledby="hero-heading">
          <div className="home-wrap home-hero-grid">
            <div className="home-hero-copy stagger-rise">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-bone-faint">
                A Horizon Foundry suite · Distill. Forge. Deliver.
              </p>
              <h1 id="hero-heading" className="home-d-xl mt-7">
                Forge shippable software from{" "}
                <span className="text-signal">AI-built code</span>.
              </h1>
              {/* DRAFT body, for Craig. */}
              <p className="home-lede mt-7">
                Eleven Claude Code skills for building with an AI in the
                loop. The flagship reads your whole application and ends in
                one verdict you can act on.
              </p>
              <HeroInstall />
            </div>
            {/* The terminal is the hero's only moving part: it types a real
                run and ends on a verdict (DESIGN.md, Motion). */}
            <div className="stagger-rise min-w-0">
              <Terminal audit={audit} />
            </div>
          </div>
        </section>

        {/* 2. The problem */}
        <section className="home-band" aria-labelledby="problem-heading">
          <div className="home-wrap home-band-grid">
            <h2 id="problem-heading" className="home-d-md">
              Software built fast ships confident and unverified.
            </h2>
            <p className="home-lede">
              A security review looks at security. A diff review looks at a
              diff. Neither tells you if it is safe to ship.
            </p>
          </div>
        </section>

        {/* 3. The cornerstone: production-audit as a sub-hero. The run frame is
            the published self-audit in its own cells (findings by severity,
            what the skeptics ruled, what could not be run), and the verdict
            lands last. Hue lives only inside the frame, which excerpts the
            real report (DESIGN.md, the report-excerpt exception). */}
        <section className="home-sub" aria-labelledby="audit-heading">
          <div className="home-wrap home-sub-grid">
            <div>
              <p className="font-mono text-base text-command">/production-audit</p>
              <h2 id="audit-heading" className="home-d-lg mt-5">
                Evidence or it doesn&apos;t ship.
              </h2>
              <p className="home-lede mt-6">
                It reads the whole app, tries to disprove its own findings,
                then makes one call.
              </p>
              <div className="home-actions">
                {featured && (
                  <Link
                    href={`/example/${featured.slug}`}
                    className="home-btn home-btn-solid"
                  >
                    Read the self-audit <span aria-hidden="true">→</span>
                  </Link>
                )}
                <Link href="/skills/production-audit" className="home-btn">
                  How it works <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>

            {example && facts && (
              <Frame
                reveal
                className="home-run"
                left={
                  <>
                    <span className="text-command">/production-audit</span> on
                    Foundry
                  </>
                }
                right={facts.commit ? `${facts.date} · ${facts.commit}` : facts.date}
                caption="Foundry, audited by Foundry. The repository is public, so every finding can be read against its source."
              >
                <div className="home-run-row">
                  <div className="home-run-lab">
                    <b>{facts.findings}</b> findings
                    <span>
                      {facts.severity.critical} critical, {facts.severity.high} high
                    </span>
                  </div>
                  <Cells
                    items={SEVERITY_ORDER.flatMap((sev) =>
                      repeat(sev, facts.severity[sev]),
                    )}
                    stagger={520 / Math.max(1, facts.findings)}
                    label={`${facts.findings} findings: ${facts.severity.critical} critical, ${facts.severity.high} high, ${facts.severity.medium} medium, ${facts.severity.low} low, ${facts.severity.informational} informational`}
                  />
                </div>
                <div className="home-run-row">
                  <div className="home-run-lab">
                    <b>{facts.skeptic.checked}</b> sent to a skeptic
                    <span>
                      {facts.skeptic.confirmed} confirmed,{" "}
                      {facts.skeptic.downgraded} downgraded,{" "}
                      {facts.skeptic.refuted} refuted
                    </span>
                  </div>
                  <Cells
                    size="big"
                    items={[
                      ...repeat("confirmed", facts.skeptic.confirmed),
                      ...repeat("downgraded", facts.skeptic.downgraded),
                      ...repeat("refuted", facts.skeptic.refuted),
                    ]}
                    stagger={50}
                    label={`${facts.skeptic.confirmed} confirmed, ${facts.skeptic.downgraded} downgraded, ${facts.skeptic.refuted} refuted`}
                  />
                </div>
                <div className="home-run-row">
                  <div className="home-run-lab">
                    <b>{facts.notAssessed.count}</b> checks it could not run
                    <span>listed by name</span>
                  </div>
                  <Cells
                    size="big"
                    items={repeat("na", facts.notAssessed.count)}
                    stagger={30}
                    label={`${facts.notAssessed.count} checks not assessed`}
                  />
                </div>
                <div data-stamp className="home-stamp">
                  <VerdictStamp
                    level={facts.level}
                    posture={facts.posture}
                    assessedScope={example.verdict.assessedScope}
                    severityRow={facts.severity}
                  />
                </div>
              </Frame>
            )}
          </div>
        </section>

        {/* 4. The skills, by stage. */}
        <section
          id="stages"
          className="home-stages-sec"
          aria-labelledby="skills-heading"
        >
          <div className="home-wrap">
            <Reveal className="home-sec-head">
              <span className="home-rule" aria-hidden="true" />
              <h2 id="skills-heading" className="home-d-md">
                {spell(skillCount)} skills, from the idea to the release.
              </h2>
            </Reveal>
            <StageRail />
          </div>
        </section>

        {/* 5. What ready means: the map as one figure. */}
        <section className="home-ready" aria-labelledby="ready-heading">
          <div className="home-wrap home-ready-grid">
            <Reveal className="home-ready-copy">
              <span className="home-rule" aria-hidden="true" />
              <h2 id="ready-heading" className="home-d-md">
                {owned.total} concerns decide whether it is ready.
              </h2>
              <p className="home-lede mt-6">
                Each one names who can show it, including the ones no skill can.
              </p>
            </Reveal>
            <div className="home-ready-vis">
              <ul className="home-legend" role="list" aria-label="Owner">
                <li>
                  <i className="c c-pa" aria-hidden="true" />
                  production-audit <b>{owned.auditRows}</b>
                </li>
                <li>
                  <i className="c c-sk" aria-hidden="true" />
                  {spell(skillCount - 1)} other skills <b>{owned.otherSkillRows}</b>
                </li>
                <li>
                  <i className="c c-out" aria-hidden="true" />
                  Your team signs off <b>{owned.outsideRows}</b>
                </li>
              </ul>
              <p className="home-legend-note">
                No skill can prove these: billing, legal, support, staffing.
                The map names who signs off.
              </p>
              <AreaGrid />
            </div>
            <div className="home-ready-btn">
              <Link href="/readiness" className="home-btn">
                Open the readiness map <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 6. Install. The heading is this page's, passed into the shared block
            so #install lands on it and the section has one h2. */}
        <InstallBlock
          heading={
            <Reveal className="home-sec-head">
              <span className="home-rule" aria-hidden="true" />
              <h2 className="home-d-md">
                One command. {spell(skillCount)} skills.
              </h2>
              <p className="home-lede mt-5">
                Pick the skills you want. Each one installs as a command.
              </p>
            </Reveal>
          }
        />

        {/* 7. Who built this. DRAFT, for Craig: Horizon Foundry's voice, with
            Craig named. */}
        <section className="home-who" aria-labelledby="who-heading">
          <div className="home-wrap home-who-grid">
            <h2 id="who-heading" className="home-d-md">
              Built the way it tells you to build.
            </h2>
            <div>
              <p className="home-lede">
                Foundry is made by Horizon Foundry, the studio of{" "}
                <a href={RESUME_URL} target="_blank" rel="noreferrer" className={LINK}>
                  Craig Martin
                </a>
                . This site was built with Foundry: framed, planned, documented and
                audited by its own skills, and the record is public.
              </p>
              <div className="home-actions">
                {featured && (
                  <Link href={`/example/${featured.slug}`} className="home-btn">
                    The self-audit <span aria-hidden="true">→</span>
                  </Link>
                )}
                <Link href="/behind" className="home-btn">
                  How it was built <span aria-hidden="true">→</span>
                </Link>
                <a
                  href={REPO_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="home-btn home-btn-q"
                >
                  The source <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
