import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { listSkills } from "@/lib/skills";

export const metadata = {
  title: "Skills",
  description:
    "Software delivery integrity, as Claude Code skills: declared intent, preserved context, an instrumented outcome, docs that match reality, and an audited release.",
};

// One tile shape for the whole directory: a full-surface link, an amber
// heading that underlines on hover, the tagline, and a "View" affordance that
// warms to amber on hover. No directional arrow: these are peers, not a
// left-to-right sequence. Every clickable cell renders through this so they
// stay identical.
function Tile({
  href,
  heading,
  body,
  className = "",
}: {
  href: string;
  heading: string;
  body: string;
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
      <p className="mt-2 text-sm leading-relaxed text-bone-dim">{body}</p>
      <span className="mt-4 pt-1 font-mono text-[0.7rem] uppercase tracking-wide text-bone-faint transition-colors group-hover:text-command">
        View
      </span>
    </Link>
  );
}

export default function SkillsIndex() {
  const skills = listSkills();
  const user = skills.filter((s) => s.invocation === "user");
  const model = skills.filter((s) => s.invocation === "model");

  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="border-b border-line">
          <div className="mx-auto max-w-[1180px] px-5 py-14 sm:px-8">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-bone-faint">
              The Foundry suite
            </p>
            <h1 className="mt-3 max-w-3xl font-display text-3xl tracking-normal text-bone sm:text-4xl">
              Software delivery integrity, as Claude Code skills.
            </h1>
            <p className="mt-4 max-w-2xl leading-relaxed text-bone-dim">
              For people who build products with an AI in the loop. The suite
              makes five promises between an idea and its release. Product
              intent is declared and audited. Execution context survives every
              session. The intended outcome is instrumented. The documentation
              matches reality. Technical readiness is audited before real users
              arrive. Each promise is kept by a skill you can run.
            </p>
            <div className="mt-7 inline-flex items-center gap-3 border border-line bg-ink-raised px-4 py-2.5">
              <span className="font-mono text-xs uppercase tracking-wide text-bone-faint">
                Install
              </span>
              <code className="font-mono text-sm text-command">npx skills@latest add horizon-foundry/foundry</code>
            </div>
          </div>
        </section>

        <section className="border-b border-line">
          <div className="mx-auto max-w-[1180px] px-5 py-12 sm:px-8">
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-bone-faint">
              User-invoked · commands you type
            </h2>
            {/* An odd count would leave an empty grid slot where the bg-line
                backdrop shows through as a broken cell. The slot is filled by
                a real tile (same component, full-surface link, arrow): the
                gated report history, which otherwise lives only in the footer.
                Hidden below sm, where a single column has no gap. */}
            <div className="mt-5 grid gap-px border border-line bg-line sm:grid-cols-2">
              {user.map((s) => (
                <Tile
                  key={s.slug}
                  href={`/skills/${s.slug}`}
                  heading={`/${s.name}`}
                  body={s.tagline}
                />
              ))}
              {user.length % 2 === 1 && (
                <Tile
                  href="/unlock"
                  heading="Your reports"
                  body="Published reports are private to their owner. Sign in to see any that belong to you."
                  className="hidden sm:flex"
                />
              )}
            </div>
          </div>
        </section>

        <section className="border-b border-line">
          <div className="mx-auto max-w-[1180px] px-5 py-12 sm:px-8">
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-bone-faint">
              Model-invoked · applied automatically by the agent
            </h2>
            <div className="mt-5 grid gap-px border border-line bg-line sm:grid-cols-2">
              {model.map((s) => (
                <Tile
                  key={s.slug}
                  href={`/skills/${s.slug}`}
                  heading={`/${s.name}`}
                  body={s.tagline}
                />
              ))}
              {/* Odd count: a plain ink cell keeps the backdrop from showing
                  through as a broken slot. */}
              {model.length % 2 === 1 && (
                <div className="hidden bg-ink sm:block" aria-hidden="true" />
              )}
            </div>
          </div>
        </section>

        <section className="border-b border-line">
          <div className="mx-auto max-w-[1180px] px-5 py-12 sm:px-8">
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-bone-faint">
              Where it fits
            </h2>
            <p className="mt-5 max-w-2xl leading-relaxed text-bone-dim">
              Foundry is the release gate at the end of the build loop. The
              inner-loop skills you already use to write and review code stay
              where they are; Foundry is the pass that decides whether the
              result is safe to ship. It composes with them rather than
              replacing them, and installs through the same{" "}
              <code className="font-mono text-sm text-command">
                npx skills add
              </code>{" "}
              channel, so it joins your workflow instead of asking for a new
              one.
            </p>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-[1180px] px-5 py-14 sm:px-8">
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-bone-faint">
              What they share
            </h2>
            <div className="mt-5 grid gap-px border border-line bg-line sm:grid-cols-2">
              <div className="bg-ink p-5">
                <h3 className="font-mono text-sm font-semibold text-bone">
                  A documentation architecture
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-bone-dim">
                  The skills enforce one doc set, engineered as the agent&apos;s
                  memory so a cold start can&apos;t go wrong. One owner per fact,
                  a forever spec, an unbroken plan chain.
                </p>
              </div>
              <div className="bg-ink p-5">
                <h3 className="font-mono text-sm font-semibold text-bone">
                  Skills that resist being ignored
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-bone-dim">
                  Each skill opens with a mandatory gate. A named skill is
                  invoked and followed, never hand-reproduced, so the discipline
                  is explicit and hard to skip. Where an invariant must truly
                  hold, a schema, script, or CI check enforces it.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
