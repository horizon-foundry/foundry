import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { listSkills, STAGES } from "@/lib/skills";

export const metadata = {
  title: "Skills",
  description:
    "Eleven Claude Code skills, grouped by when they help: before you build, while you build, and before you ship.",
};

// One tile shape for the whole directory: a full-surface link, an amber
// heading that underlines on hover, the tagline, and a "View" affordance that
// brightens to bone on hover (amber stays reserved for the command name). No directional arrow: these are peers, not a
// left-to-right sequence. Every clickable cell renders through this so they
// stay identical.
function Tile({
  href,
  heading,
  body,
  detail,
  className = "",
}: {
  href: string;
  heading: string;
  body: string;
  detail?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`lift group flex flex-col bg-ink p-5 hover:bg-ink-raised ${className}`}
    >
      <span className="font-mono text-sm font-semibold text-command underline-offset-4 group-hover:underline">
        {heading}
      </span>
      <p className="mt-2 max-w-measure leading-snug text-bone">{body}</p>
      {detail && (
        <p className="mt-2 max-w-measure text-sm leading-relaxed text-bone-dim">{detail}</p>
      )}
      <span className="mt-4 pt-1 font-mono text-[0.7rem] uppercase tracking-wide text-bone-faint transition-colors group-hover:text-bone">
        View
      </span>
    </Link>
  );
}

export default function SkillsIndex() {
  const skills = listSkills();

  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="border-b border-line">
          <div className="mx-auto max-w-[1180px] px-5 py-14 sm:px-8">
            {/* DRAFT lead, for Craig. */}
            <h1 className="max-w-3xl font-display text-3xl tracking-normal text-bone sm:text-5xl">
              Eleven skills, from the idea to the release.
            </h1>
            <p className="mt-4 max-w-measure text-lg leading-relaxed text-bone-dim">
              Each one keeps a single discipline that fast building tends to
              skip. Type its name in Claude Code, or let Claude start it when the
              work fits.
            </p>
            <div className="mt-7 inline-flex max-w-full items-center gap-3 border border-line bg-ink-raised px-4 py-2.5">
              <span className="font-mono text-xs uppercase tracking-wide text-bone-faint">
                Install
              </span>
              <code className="min-w-0 font-mono text-sm text-command [overflow-wrap:anywhere]">npx skills@latest add horizon-foundry/foundry</code>
            </div>
          </div>
        </section>

        {STAGES.map((stage) => {
          const inStage = skills.filter((s) => s.stage === stage.id);
          return (
            <section key={stage.id} aria-labelledby={`stage-${stage.id}`} className="border-b border-line">
              <div className="mx-auto max-w-[1180px] px-5 py-12 sm:px-8">
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <h2 id={`stage-${stage.id}`} className="font-display text-xl tracking-normal text-bone sm:text-2xl">
                    {stage.label}
                  </h2>
                  <span className="font-mono text-xs text-bone-faint">{stage.caption}</span>
                </div>
                <p className="mt-2 max-w-measure text-sm leading-relaxed text-bone-dim">
                  {stage.line}
                </p>
                <div className="mt-5 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
                  {inStage.map((s) => (
                    <Tile
                      key={s.slug}
                      href={`/skills/${s.slug}`}
                      heading={`/${s.name}`}
                      body={s.copy?.headline ?? s.tagline}
                      detail={s.copy ? s.tagline : undefined}
                    />
                  ))}
                  {Array.from({ length: (3 - (inStage.length % 3)) % 3 }, (_, i) => (
                    <div key={i} className="hidden bg-ink lg:block" aria-hidden="true" />
                  ))}
                  {inStage.length % 2 === 1 && (
                    <div className="hidden bg-ink sm:block lg:hidden" aria-hidden="true" />
                  )}
                </div>
              </div>
            </section>
          );
        })}
      </main>
      <SiteFooter />
    </>
  );
}
