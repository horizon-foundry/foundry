import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { HeroInstall, InstallBlock } from "@/components/InstallBlock";
import { Cells, type CellVariant } from "@/components/Cells";
import { Frame } from "@/components/Frame";
import { StageRail } from "@/components/StageRail";
import { AreaGrid } from "@/components/AreaGrid";
import { VerdictSheet } from "@/components/VerdictSheet";
import { UnitBar } from "@/components/brand/UnitBar";
import { auditFacts, selfAudit } from "@/lib/self-audit";
import { SEVERITY_ORDER } from "@/lib/report-types";
import { listSkills } from "@/lib/skills";
import { readinessOwnership } from "@/lib/readiness-owners";
import { RESUME_URL, REPO_URL } from "@/lib/site";

/*
  One story, in seven beats (plan: foundry-site-overhaul, Decision 2): the
  hero, the problem, the cornerstone (production-audit), the skills by stage,
  what ready means, install, and who built this. The method, dimensions and
  principles live on /skills/production-audit. Every number below is read from
  the published self-audit or the readiness map, never typed here.

  The page is a dark tool that hands you a paper verdict (rebrand rough D,
  "the dark instrument"): sections alternate Ink and Slate, the type is Bone,
  and the first screen's largest object is the real verdict of the published
  self-audit as a White sheet, the one light thing on the screen.
*/

const LINK =
  "font-semibold text-fg underline decoration-[1.5px] underline-offset-[5px] hover:decoration-[3px] active:text-fg-2";

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
  const owned = readinessOwnership();

  return (
    <>
      <SiteHeader />
      <main id="main">
        {/* 1. Hero. The h1 and the command on the left; on the right the
            published self-audit's verdict as a sheet, the largest object on
            the first screen. The words on the sheet are the report's. */}
        <section
          className="home-hero"
          data-ground="slate"
          aria-labelledby="hero-heading"
        >
          <div className="wrap home-hero-grid">
            <div className="home-hero-copy">
              <h1 id="hero-heading" className="d-title">
                Forge shippable software from AI-built code.
              </h1>
              {/* DRAFT body, for Craig. */}
              <p className="t-lead">
                Eleven Claude Code skills for building with an AI in the
                loop. The flagship reads your whole application and ends in
                one verdict you can act on.
              </p>
              <HeroInstall />
            </div>
            {example && facts && (
              <VerdictSheet
                className="home-hero-sheet"
                facts={facts}
                head={
                  <span>
                    <span className="cmd">/production-audit</span> on Foundry
                  </span>
                }
                foot={
                  <>
                    <span className="meta">
                      Foundry, audited by Foundry. The repository is public, so
                      every finding can be read against its source.
                    </span>
                    {featured && (
                      <Link href={`/example/${featured.slug}`} className="tl">
                        Read the self-audit
                      </Link>
                    )}
                  </>
                }
              />
            )}
          </div>
        </section>

        {/* 2. The problem: the one claim, on Ink. */}
        <section
          className="home-band"
          data-ground="ink"
          aria-labelledby="problem-heading"
        >
          <div className="wrap home-band-grid">
            <h2 id="problem-heading" className="d-h2">
              Software built fast ships confident and unverified.
            </h2>
            <p className="t-lead">
              A security review looks at security. A diff review looks at a
              diff. Neither tells you if it is safe to ship.
            </p>
          </div>
        </section>

        {/* 3. The cornerstone: production-audit, and the run behind the
            verdict above. The frame is the published self-audit in its own
            cells (findings by severity, what the skeptics ruled, what could
            not be run). Hue lives only inside the frame, which excerpts the
            real report, and only as a fill. */}
        <section
          className="home-sub"
          data-ground="slate"
          aria-labelledby="audit-heading"
        >
          <div className="wrap home-sub-grid">
            <div>
              <p className="home-sub-cmd">
                <UnitBar fill="amber" />
                /production-audit
              </p>
              <h2 id="audit-heading" className="d-title">
                Evidence or it doesn&rsquo;t ship.
              </h2>
              <p className="t-lead">
                It reads the whole app, tries to disprove its own findings,
                then makes one call.
              </p>
              <div className="home-actions">
                {featured && (
                  <Link href={`/example/${featured.slug}`} className="btn">
                    Read the self-audit
                  </Link>
                )}
                <Link href="/skills/production-audit" className="tl">
                  How it works
                </Link>
              </div>
            </div>

            {example && facts && (
              <Frame
                reveal
                className="home-run"
                left={
                  <>
                    <span className="cmd">/production-audit</span> on Foundry
                  </>
                }
                right={facts.commit ? `${facts.date} · ${facts.commit}` : facts.date}
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
              </Frame>
            )}
          </div>
        </section>

        {/* 4. The skills, by stage. The rail is shared with /skills; this page
            sets its heading over it and the closing thread on its columns. */}
        <section
          id="stages"
          className="home-stages-sec"
          data-ground="ink"
          aria-labelledby="skills-heading"
        >
          <div className="wrap home-stages-wrap">
            <h2 id="skills-heading" className="d-h2">
              {spell(skillCount)} skills, from the idea to the release.
            </h2>
            <StageRail />
          </div>
        </section>

        {/* 5. What ready means: the whole map as one figure, an Ink well on
            the Slate ground. Its head is the key (who owns a cell, and how
            many), its body one cell per concern by area, and its caption the
            one thing the key cannot say. */}
        <section
          className="home-ready"
          data-ground="slate"
          aria-labelledby="ready-heading"
        >
          <div className="wrap home-ready-grid">
            <h2 id="ready-heading" className="d-h2">
              {owned.total} concerns decide whether it is ready.
            </h2>
            <p className="t-lead home-ready-lede">
              Each one names who can show it, including the ones no skill can.
            </p>
            <figure className="home-map" data-ground="ink">
              <ul className="home-map-key" role="list" aria-label="Owner">
                <li>
                  <i className="c c-pa" aria-hidden="true" />
                  <span className="cmd">production-audit</span>
                  <b>{owned.auditRows}</b>
                </li>
                <li>
                  <i className="c c-sk" aria-hidden="true" />
                  {spell(skillCount - 1)} other skills
                  <b>{owned.otherSkillRows}</b>
                </li>
                <li>
                  <i className="c c-out" aria-hidden="true" />
                  Your team signs off
                  <b>{owned.outsideRows}</b>
                </li>
              </ul>
              <AreaGrid />
              <figcaption>
                <i className="c c-out" aria-hidden="true" />
                <span>
                  No skill can prove these: billing, legal, support, staffing.
                  The map names who signs off.
                </span>
              </figcaption>
            </figure>
            <div className="home-ready-link">
              <Link href="/readiness" className="tl">
                Open the readiness map
              </Link>
            </div>
          </div>
        </section>

        {/* 6. Install. The heading is this page's, passed into the shared block
            so #install lands on it and the section has one h2. */}
        <InstallBlock
          heading={
            <>
              <h2 className="d-h2">
                One command. {spell(skillCount)} skills.
              </h2>
              <p className="t-lead">
                Pick the skills you want. Each one installs as a command.
              </p>
            </>
          }
        />

        {/* 7. Who built this. DRAFT, for Craig: Horizon Foundry's voice, with
            Craig named. The record is three addresses, set as a ledger: what
            each one is, and where it lives. */}
        <section
          className="home-who"
          data-ground="slate"
          aria-labelledby="who-heading"
        >
          <div className="wrap home-who-grid">
            <h2 id="who-heading" className="d-h2">
              Built the way it tells you to build.
            </h2>
            <div>
              <p className="t-lead">
                Foundry is made by Horizon Foundry, the studio of{" "}
                <a href={RESUME_URL} target="_blank" rel="noreferrer" className={LINK}>
                  Craig Martin
                </a>
                . This site was built with Foundry: framed, planned, documented and
                audited by its own skills, and the record is public.
              </p>
              <ul className="rows home-record" role="list">
                {featured && facts && (
                  <li>
                    <Link href={`/example/${featured.slug}`} className="row-link">
                      <span className="row-name">The self-audit</span>
                      <span className="row-meta">
                        {facts.commit ? `${facts.date} · ${facts.commit}` : facts.date}
                      </span>
                    </Link>
                  </li>
                )}
                <li>
                  <Link href="/behind" className="row-link">
                    <span className="row-name">How it was built</span>
                    <span className="row-meta">/behind</span>
                  </Link>
                </li>
                <li>
                  <a
                    href={REPO_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="row-link"
                  >
                    <span className="row-name">The source</span>
                    <span className="row-meta">
                      {REPO_URL.replace("https://", "")}
                    </span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
