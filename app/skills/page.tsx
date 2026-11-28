import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { StageRail } from "@/components/StageRail";
import { CommandField } from "@/components/CommandField";
import { REPO_SLUG } from "@/lib/site";

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
      <main id="main" data-ground="ink">
        <section
          className="skills-head"
          data-ground="slate"
          aria-labelledby="skills-heading"
        >
          <div className="wrap">
            <h1 id="skills-heading" className="d-title">
              Eleven skills, from the idea to the release.
            </h1>
            <div className="skills-head-grid">
              <p className="t-lead">
                Each one keeps a single discipline that fast building tends to
                skip. Type its name in Claude Code, or let Claude start it when the
                work fits.
              </p>
              <CommandField
                command={`npx skills@latest add ${REPO_SLUG}`}
                surface="skills-index"
              />
            </div>
          </div>
        </section>

        <section className="skills-list" aria-label="The skills, by stage">
          <div className="wrap home-stages-wrap">
            <StageRail taglines headingLevel={2} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
