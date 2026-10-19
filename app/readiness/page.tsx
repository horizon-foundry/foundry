import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ReadinessMap } from "@/components/ReadinessMap";
import { ReadinessFilter } from "@/components/ReadinessFilter";
import { OwnershipBar } from "@/components/OwnershipBar";
import { loadReadinessMap } from "@/lib/readiness-map.mjs";
import { readinessOwnership } from "@/lib/readiness-owners";
import { READINESS_COPY } from "@/lib/readiness-copy";
import { listSkills } from "@/lib/skills";

export const metadata = {
  title: "Readiness map",
  description:
    "Every concern that decides whether a product is ready for real users, with the skill that owns it, when it applies, and the kind of evidence that settles it.",
};

// The page leads with words written for visitors (lib/readiness-copy.ts) and
// a bar of who owns what, both derived from the map, then the map itself. It
// stays static: the owner filter hides rows in the browser and never asks the
// server for a different page.
export default function ReadinessPage() {
  const map = loadReadinessMap();
  const owned = readinessOwnership();
  const skills = listSkills().map((s) => s.slug);
  const c = READINESS_COPY;

  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="border-b border-line">
          <div className="mx-auto max-w-[1180px] px-5 py-14 sm:px-8">
            <h1 className="max-w-3xl font-display text-3xl tracking-normal text-bone sm:text-5xl">
              {c.title}
            </h1>
            <p className="mt-5 max-w-measure text-lg leading-relaxed text-bone-dim">
              {c.lead(owned.total, owned.outsideRows)}
            </p>

            <div className="mt-10">
              <OwnershipBar owned={owned} />
            </div>

            <p className="mt-8 max-w-measure text-sm leading-relaxed text-bone-faint">
              {c.status} Evidence:{" "}
              {owned.byEvidence
                .map((e) => `${c.evidence[e.kind] ?? e.kind} (${e.count})`)
                .join(", ")}
              .
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-[1180px] px-5 pb-16 pt-10 sm:px-8">
          <ReadinessFilter
            options={[
              { value: "all", label: "All", count: owned.total },
              { value: "production-audit", label: "Production Audit", count: owned.auditRows },
              { value: "skills", label: "Other skills", count: owned.otherSkillRows },
              { value: "outside", label: "Outside Foundry", count: owned.outsideRows },
            ]}
          />
          <div className="mt-8">
            <ReadinessMap areas={map.areas} skills={skills} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
