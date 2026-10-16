import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Inline, ReadinessMap } from "@/components/ReadinessMap";
import { loadReadinessMap } from "@/lib/readiness-map.mjs";
import { listSkills } from "@/lib/skills";

export const metadata = {
  title: "Readiness map",
  description:
    "Every concern that decides whether a product is ready for real users, with the skill that owns it, when it applies, and the kind of evidence that settles it.",
};

// The page renders the map's own preface and invents no copy. The first two
// sentences lead; the rest (the evidence kinds and the line that says a row
// carries no status) follow as a plain note. If the preface ever has fewer than
// three sentences, all of it leads.
function splitPreface(preface: string): { lead: string; note: string } {
  const sentences = preface.replace(/\s+/g, " ").split(/(?<=[.!?])\s+(?=[A-Z])/);
  if (sentences.length < 3) return { lead: sentences.join(" "), note: "" };
  return {
    lead: sentences.slice(0, 2).join(" "),
    note: sentences.slice(2).join(" "),
  };
}

export default function ReadinessPage() {
  const map = loadReadinessMap();
  const skills = listSkills().map((s) => s.slug);
  const { lead, note } = splitPreface(map.preface);

  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="border-b border-line">
          <div className="mx-auto max-w-[1180px] px-5 py-14 sm:px-8">
            <h1 className="max-w-3xl font-display text-3xl tracking-normal text-bone sm:text-4xl">
              {map.title}
            </h1>
            <p className="mt-4 max-w-measure leading-relaxed text-bone-dim">
              <Inline text={lead} />
            </p>
            {note && (
              <p className="mt-3 max-w-measure text-sm leading-relaxed text-bone-faint">
                <Inline text={note} />
              </p>
            )}
          </div>
        </section>

        <div className="mx-auto max-w-[1180px] px-5 pb-16 pt-10 sm:px-8">
          <ReadinessMap areas={map.areas} skills={skills} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
