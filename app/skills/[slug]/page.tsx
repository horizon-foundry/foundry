import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MarkdownDoc } from "@/components/MarkdownDoc";
import {
  HeroFigure,
  HighlightFigure,
  hasHeroFigure,
} from "@/components/SkillFigure";
import { SkillTabs } from "@/components/SkillTabs";
import { OwnedBand } from "@/components/OwnedBand";
import { AuditMethod } from "@/components/AuditMethod";
import { CommandField } from "@/components/CommandField";
import { UnitBar } from "@/components/brand/UnitBar";
import { Reveal } from "@/components/Reveal";
import {
  highlightsFor,
  notForParts,
  type Highlight,
} from "@/lib/skill-figures";
import { rowsOwnedBy } from "@/lib/readiness-owners";
import { REPO_SLUG } from "@/lib/site";
import { getSkill, listSkills, stageOf, type SkillCopy } from "@/lib/skills";

// The eleven pages prerender, so the built-HTML gates see every one of them;
// a name that is not a skill is a 404, not a render.
export const dynamicParams = false;

export function generateStaticParams() {
  return listSkills().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const skill = getSkill(slug);
  return {
    title: skill ? skill.name : "Skill",
    description: skill?.copy?.sub ?? skill?.tagline,
  };
}

type FiguredHighlight = Highlight & { figure: NonNullable<Highlight["figure"]> };

const num = (i: number) => String(i + 1).padStart(2, "0");

// The same command InstallBlock shows (npx is the front door); a skill page is
// where a reader decides to adopt, so the way in sits at its close.
const NPX_CMD = `npx skills@latest add ${REPO_SLUG}`;

// A band's ground. The hero is Slate and the bands under it alternate, Ink
// first, so the selected tab (an Ink box on the hero's foot) runs into the
// band it opens.
type Ground = "ink" | "slate";
const groundAt = (i: number): Ground => (i % 2 ? "slate" : "ink");

// The page is the sell: what the skill is for, one hero figure, highlights as
// figures, the moments it is built for, and the share of the readiness map it
// owns. The full SKILL.md, which is what the agent runs, is the second tab.
export default async function SkillPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const skill = getSkill(slug);
  if (!skill) notFound();
  const copy = skill.copy;
  const stage = stageOf(slug);

  const lead = (
    <>
      <p className="sk-crumb">
        <Link href="/skills">All skills</Link>
        {stage && (
          <span className="label">
            {stage.label} · {stage.caption}
          </span>
        )}
      </p>
      <h1 id="sk-h" className="sk-cmd">
        <UnitBar fill="amber" />
        /{skill.name}
      </h1>
      {copy ? (
        <>
          <p className="sk-headline">{copy.headline}</p>
          <p className="t-lead sk-lede">{copy.sub}</p>
        </>
      ) : (
        <p className="t-lead sk-lede">{skill.tagline}</p>
      )}
    </>
  );

  // The bands in the order they are drawn, so each takes the next ground.
  const all = copy ? highlightsFor(slug, copy) : [];
  const figured = all.filter(
    (h): h is FiguredHighlight => h.figure !== undefined,
  );
  const plain = all.filter((h) => !h.figure);
  const owns = rowsOwnedBy(slug).length > 0;
  const iPlain = figured.length;
  const iMoments = iPlain + (plain.length > 0 ? 1 : 0);
  const iOwned = iMoments + (copy ? 1 : 0);
  const iMethod = iOwned + (owns ? 1 : 0);

  const sell = (
    <>
      {copy && <Highlights figured={figured} plain={plain} />}
      {copy && <Moments copy={copy} ground={groundAt(iMoments)} />}
      <OwnedBand slug={slug} ground={groundAt(iOwned)} />
      {slug === "production-audit" && (
        <AuditMethod ground={groundAt(iMethod)} />
      )}
    </>
  );

  const md = (
    <div className="wrap sk-md-wrap">
      <p className="sk-md-src">skills/{slug}/SKILL.md, as installed</p>
      <MarkdownDoc content={skill.body} anchors className="sk-md" />
    </div>
  );

  return (
    <>
      <SiteHeader />
      <main id="main" className="sk-page" data-ground="ink">
        <SkillTabs
          lead={lead}
          figure={
            copy && hasHeroFigure(slug) ? (
              <HeroFigure slug={slug} copy={copy} />
            ) : null
          }
          sell={sell}
          md={md}
        />
      </main>
      <SiteFooter />
    </>
  );
}

// Highlights with a figure each take a band, alternating text and figure.
// Highlights without one sit together in one numbered row, never as stacked
// full-width text bands. Numbers run in the order they are shown.
function Highlights({
  figured,
  plain,
}: {
  figured: FiguredHighlight[];
  plain: Highlight[];
}) {
  return (
    <>
      {figured.map((h, i) => (
        <section
          key={h.title}
          className={`sk-band sk-hl${i % 2 ? " sk-hl-flip" : ""}`}
          data-ground={groundAt(i)}
          aria-labelledby={`sk-hl-${i}`}
        >
          <div className="wrap sk-hl-grid">
            <div className="sk-hl-copy">
              <p className="sk-n">{num(i)}</p>
              <h2 id={`sk-hl-${i}`} className="d-statement">
                {h.title}
              </h2>
              <p className="t-lead sk-hl-line">{h.line}</p>
            </div>
            <div className="sk-hl-fig">
              <HighlightFigure figure={h.figure} />
            </div>
          </div>
        </section>
      ))}
      {plain.length > 0 && (
        <div
          className="sk-band sk-plain"
          data-ground={groundAt(figured.length)}
        >
          <div className="wrap">
            <ol className={`sk-plain-grid sk-cols-${Math.min(plain.length, 3)}`}>
              {plain.map((h, i) => (
                <li key={h.title}>
                  <p className="sk-n">{num(figured.length + i)}</p>
                  <h2 className="sk-h3">{h.title}</h2>
                  <p className="sk-hl-line">{h.line}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </>
  );
}

function Moments({ copy, ground }: { copy: SkillCopy; ground: Ground }) {
  const notFor = copy.notFor;
  const parts = notFor ? notForParts(notFor.text) : null;
  return (
    <section
      className="sk-band sk-moments"
      data-ground={ground}
      aria-labelledby="sk-mo-h"
    >
      <div className="wrap sk-mo-grid">
        <h2 id="sk-mo-h" className="d-h2">
          Built for these moments.
        </h2>
        <Reveal as="div">
          <ol className="sk-mo-list">
            {copy.moments.map((m, i) => (
              <li key={m} data-rv style={{ "--d": `${i * 70}ms` } as CSSProperties}>
                <span className="sk-mo-n">{num(i)}</span>
                <span>{m}</span>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
      <div className="wrap sk-notfor">
        {notFor && (
          <p>
            {parts ? (
              <>
                {parts.question}? That is{" "}
                <Link href={`/skills/${notFor.skill}`} className="sk-cmdlink">
                  /{parts.target}
                </Link>
                .
              </>
            ) : (
              notFor.text
            )}
          </p>
        )}
        <a href="#skill-md" className="tl">
          Read the full SKILL.md
        </a>
      </div>
      <div className="wrap sk-install">
        <CommandField command={NPX_CMD} surface="skill-page" />
        <Link href="/#install" className="tl">
          Other ways to install
        </Link>
      </div>
    </section>
  );
}
