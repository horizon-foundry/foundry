import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { StageRail } from "@/components/StageRail";

export const metadata = {
  title: "Skills",
  description:
    "Eleven Claude Code skills, grouped by when they help: before you build, while you build, and before you ship.",
};

// The directory in the homepage's grammar: the h1, the lede and the install
// command, then the same stage rail with each skill's tagline under its
// command. The rail sits straight under the h1, so its stage titles are h2.
export default function SkillsIndex() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="home-hero" aria-labelledby="skills-heading">
          <div className="home-wrap">
            <h1 id="skills-heading" className="home-d-lg max-w-3xl">
              Eleven skills, from the idea to the release.
            </h1>
            <p className="home-lede mt-7">
              Each one keeps a single discipline that fast building tends to
              skip. Type its name in Claude Code, or let Claude start it when the
              work fits.
            </p>
            <div className="mt-7 inline-flex max-w-full items-center gap-3 border border-line bg-ink-raised px-4 py-2.5">
              <span className="font-mono text-xs uppercase tracking-wide text-bone-faint">
                Install
              </span>
              <code className="min-w-0 font-mono text-sm text-command [overflow-wrap:anywhere]">
                npx skills@latest add horizon-foundry/foundry
              </code>
            </div>
          </div>
        </section>

        <section className="home-stages-sec" aria-label="The skills, by stage">
          <div className="home-wrap">
            <StageRail taglines headingLevel={2} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
