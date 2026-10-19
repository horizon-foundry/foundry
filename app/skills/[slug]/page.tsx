import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MarkdownDoc } from "@/components/MarkdownDoc";
import { Specimen } from "@/components/Specimen";
import { SkillSpecDisclosure } from "@/components/SkillSpecDisclosure";
import { Figure } from "@/components/SkillFigure";
import { AuditMethod } from "@/components/AuditMethod";
import { getSkill, stageOf, type SkillCopy } from "@/lib/skills";
import { plainPart, readinessOwnership } from "@/lib/readiness-owners";

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

const LINK =
  "text-bone underline decoration-line-strong underline-offset-4 transition-colors hover:text-signal hover:decoration-bone";

const words = (s: string) => s.split(/\s+/).filter(Boolean).length;

// The page is the sell: what the skill is for, in human terms, with a specimen
// of what it produces. The full SKILL.md, which is what the agent runs, is one
// click away at the bottom, closed.
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
  const owned = readinessOwnership();
  const rows = owned.bySkill.get(slug) ?? [];

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto min-h-[70vh] max-w-[1180px] px-5 py-10 sm:px-8">
        <Link
          href="/skills"
          className="font-mono text-xs uppercase tracking-wide text-bone-faint transition-colors hover:text-bone"
        >
          ← All skills
        </Link>

        <div className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <h1 className="font-mono text-2xl font-semibold tracking-tight text-command [overflow-wrap:anywhere]">
            /{skill.name}
          </h1>
          {stage && (
            <span className="font-mono text-xs text-bone-faint">
              <span className="text-bone">{stage.label}</span> · {stage.caption}
            </span>
          )}
        </div>

        {copy ? <Sell copy={copy} name={skill.name} /> : (
          <p className="mt-4 max-w-measure text-lg leading-relaxed text-bone">
            {skill.tagline}
          </p>
        )}

        {slug === "production-audit" && <AuditMethod />}

        {rows.length > 0 && (
          <section aria-labelledby="readiness-heading" className="mt-16">
            <h2 id="readiness-heading" className="font-mono text-sm font-semibold text-bone">
              On the readiness map
            </h2>
            {slug === "production-audit" ? (
              <AuditOwnership owned={owned} />
            ) : (
              <>
                <p className="mt-2 max-w-measure text-sm leading-relaxed text-bone-dim">
                  The{" "}
                  <Link href="/readiness" className={LINK}>
                    readiness map
                  </Link>{" "}
                  lists what decides whether a product is ready for real users.
                  This skill owns {rows.length === 1 ? "this concern" : "these concerns"}:
                </p>
                <ul className="mt-4 max-w-3xl divide-y divide-line border-y border-line">
                  {rows.map((r) => (
                    <li key={r.id}>
                      <Link
                        href={`/readiness#${r.id}`}
                        className="flex min-h-11 items-baseline gap-4 py-2.5 text-sm leading-relaxed text-bone-dim transition-colors hover:text-bone"
                      >
                        <span className="w-24 shrink-0 font-mono text-[0.6875rem] text-bone-faint">
                          {r.area}
                        </span>
                        <span>{r.concern.replace(/`/g, "")}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        )}

        <section aria-labelledby="run-heading" className="mt-16">
          <h2 id="run-heading" className="font-mono text-sm font-semibold text-bone">
            Run it
          </h2>
          <p className="mt-2 max-w-measure text-sm leading-relaxed text-bone-dim">
            <Link href="/#install" className={LINK}>
              Install Foundry
            </Link>
            , then type <span className="font-mono text-command">/{skill.name}</span>{" "}
            in Claude Code. Claude can also start it on its own when the work fits.
          </p>
        </section>

        <div className="mt-16">
          <SkillSpecDisclosure
            summary={
              <span>
                Read the full SKILL.md
                <span className="text-bone-faint"> · {words(skill.body).toLocaleString("en-US")} words</span>
              </span>
            }
          >
            <p className="mb-6 max-w-measure text-sm leading-relaxed text-bone-faint">
              The exact file your agent follows when it runs{" "}
              <span className="font-mono text-command">/{skill.name}</span>. The
              spec is the product, so there are no separate docs to drift.
            </p>
            <MarkdownDoc content={skill.body} anchors />
          </SkillSpecDisclosure>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function Sell({ copy, name }: { copy: SkillCopy; name: string }) {
  return (
    <>
      <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-start">
        <div>
          <p className="max-w-[18ch] font-display text-3xl leading-[1.08] tracking-normal text-bone sm:text-5xl">
            {copy.headline}
          </p>
          <p className="mt-5 max-w-measure text-lg leading-relaxed text-bone-dim">
            {copy.sub}
          </p>
        </div>
        <Specimen specimen={copy.specimen} />
      </div>

      <ol className="mt-14 grid gap-px border border-line bg-line md:grid-cols-3">
        {copy.highlights.map((h, i) => (
          <li key={h.title} className="flex flex-col bg-ink p-5 sm:p-6">
            <span className="font-mono text-[0.6875rem] text-bone-faint">
              0{i + 1}
            </span>
            <h2 className="mt-3 font-mono text-sm font-semibold text-bone">
              {h.title}
            </h2>
            <p className="mt-2 leading-relaxed text-bone-dim">{h.line}</p>
            {h.figure && <Figure figure={h.figure} />}
          </li>
        ))}
      </ol>

      <section aria-labelledby="moments-heading" className="mt-14 grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <h2 id="moments-heading" className="font-mono text-sm font-semibold text-bone">
            When it helps
          </h2>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {copy.moments.map((m) => (
              <li key={m} className="py-2.5 text-sm leading-relaxed text-bone-dim">
                {m}
              </li>
            ))}
          </ul>
        </div>
        {copy.notFor && (
          <div>
            <h2 className="font-mono text-sm font-semibold text-bone">Not for</h2>
            <p className="mt-3 border-y border-line py-2.5 text-sm leading-relaxed text-bone-dim">
              {copy.notFor.text}{" "}
              <Link href={`/skills/${copy.notFor.skill}`} className={`font-mono ${LINK}`}>
                /{copy.notFor.skill}
              </Link>
            </p>
          </div>
        )}
      </section>
      <span className="sr-only">End of the {name} summary.</span>
    </>
  );
}

function AuditOwnership({
  owned,
}: {
  owned: ReturnType<typeof readinessOwnership>;
}) {
  const max = owned.byAuditPart[0]?.count ?? 1;
  return (
    <>
      <p className="mt-2 max-w-measure text-sm leading-relaxed text-bone-dim">
        The{" "}
        <Link href="/readiness" className={LINK}>
          readiness map
        </Link>{" "}
        lists {owned.total} concerns that decide whether a product is ready for
        real users. This skill owns {owned.auditRows} of them, checked across
        these parts of every audit:
      </p>
      <ul className="mt-4 max-w-3xl divide-y divide-line border-y border-line">
        {owned.byAuditPart.map((p) => (
          <li
            key={p.part}
            className="grid grid-cols-[9rem_minmax(0,1fr)_2.5rem] items-center gap-4 py-2 font-mono text-xs text-bone-dim sm:grid-cols-[12rem_minmax(0,1fr)_2.5rem]"
          >
            <span>{plainPart(p.part)}</span>
            <span aria-hidden="true" className="h-1.5 bg-line">
              <span
                className="block h-full bg-bone-dim"
                style={{ width: `${(p.count / max) * 100}%` }}
              />
            </span>
            <span className="text-right text-bone">{p.count}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm">
        <Link href="/readiness?owner=production-audit" className={LINK}>
          See all {owned.auditRows} on the map
        </Link>
      </p>
    </>
  );
}
