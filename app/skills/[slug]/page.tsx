import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MarkdownDoc } from "@/components/MarkdownDoc";
import { getSkill } from "@/lib/skills";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const skill = getSkill(slug);
  return {
    title: skill ? skill.name : "Skill",
    description: skill?.tagline,
  };
}

// The page leads with the authored "why should I care" layer (tagline, the
// pain and payoff, the moments to reach for it) and demotes the canonical
// SKILL.md below a labeled rule. The verbatim render stays: what the agent
// actually follows IS the product, but it is the spec, not the pitch.
export default async function SkillPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const skill = getSkill(slug);
  if (!skill) notFound();

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

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-2xl font-semibold tracking-tight text-command">
            /{skill.name}
          </h1>
          <span className="border border-line px-2 py-0.5 font-mono text-[0.68rem] uppercase tracking-widest text-bone-dim">
            {skill.invocation === "user"
              ? "user-invoked · you type it"
              : "model-invoked · the agent applies it"}
          </span>
        </div>

        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-bone">
          {skill.tagline}
        </p>

        {(skill.why || skill.when) && (
          <div className="mt-8 grid gap-px border border-line bg-line md:grid-cols-[1.15fr_0.85fr]">
            {skill.why && (
              <div className="bg-ink p-5 sm:p-6">
                <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-bone-faint">
                  Why it matters
                </h2>
                <p className="mt-3 max-w-xl leading-relaxed text-bone-dim">
                  {skill.why}
                </p>
              </div>
            )}
            {skill.when && skill.when.length > 0 && (
              <div className="bg-ink p-5 sm:p-6">
                <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-bone-faint">
                  Reach for it when
                </h2>
                <ul className="mt-3 space-y-2.5">
                  {skill.when.map((w) => (
                    <li
                      key={w}
                      className="flex gap-2.5 text-sm leading-relaxed text-bone-dim"
                    >
                      <span
                        className="mt-2.5 h-px w-3 shrink-0 bg-command/70"
                        aria-hidden="true"
                      />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* The spec itself, clearly framed as what the agent runs. */}
        <div className="mt-12 flex items-center gap-3">
          <h2 className="shrink-0 font-mono text-xs uppercase tracking-[0.2em] text-bone-faint">
            The skill, verbatim
          </h2>
          <span className="h-px flex-1 bg-line" aria-hidden="true" />
        </div>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-bone-faint">
          This is the exact SKILL.md your agent follows when you invoke{" "}
          <span className="font-mono text-command">/{skill.name}</span>. No
          separate docs to drift: the spec is the product.
        </p>
        <div className="mt-6">
          <MarkdownDoc content={skill.body} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
