import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Cells, type CellVariant } from "@/components/Cells";
import { Reveal } from "@/components/Reveal";
import { ReadinessMap } from "@/components/ReadinessMap";
import { ReadinessFilter, type RowFacts } from "@/components/ReadinessFilter";
import { loadReadinessMap } from "@/lib/readiness-map.mjs";
import { readinessOwnership } from "@/lib/readiness-owners";
import { READINESS_COPY } from "@/lib/readiness-copy";
import { ownerGroup } from "@/lib/readiness-types";
import type { ReadinessArea } from "@/lib/readiness-types";
import { listSkills } from "@/lib/skills";

export const metadata = {
  title: "Readiness map",
  // ?owner=, ?evidence= and ?area= only act in the browser, so every variant
  // is this one page.
  alternates: { canonical: "/readiness" },
  description:
    "Every concern that decides whether a product is ready for real users, with the skill that owns it, when it applies, and the kind of evidence that settles it.",
};

// The page is a side column (the headline, the whole map as one block of
// cells, the filters) beside the 24 areas as an accordion. It stays static:
// the filters are links, ReadinessFilter hides rows in the browser, and no
// request ever asks the server for a different page (no searchParams, no
// cookies, no headers). Every count is derived from the map.
export default function ReadinessPage() {
  const map = loadReadinessMap();
  const areas = map.areas as ReadinessArea[];
  const owned = readinessOwnership();
  const skills = listSkills().map((s) => s.slug);
  const c = READINESS_COPY;

  // Skills other than production-audit that own at least one row.
  const otherSkillCount = [...owned.bySkill.keys()].filter(
    (k) => k !== "production-audit",
  ).length;

  // What each filter needs to count a concern: its group, skill and evidence.
  const rows: RowFacts[] = areas.flatMap((a) =>
    a.rows.map((r) => ({
      g: ownerGroup(r.owner),
      s: r.owner.split("/")[0],
      e: r.evidence,
    })),
  );

  // The whole map as one block, sorted by owner group.
  const block: CellVariant[] = [
    ...Array<CellVariant>(owned.auditRows).fill("pa"),
    ...Array<CellVariant>(owned.otherSkillRows).fill("sk"),
    ...Array<CellVariant>(owned.outsideRows).fill("out"),
  ];
  const blockLabel = c.blockLabel(
    owned.total,
    owned.auditRows,
    owned.otherSkillRows,
    otherSkillCount,
    owned.outsideRows,
  );

  return (
    <>
      <SiteHeader />
      <main id="main">
        <section
          aria-labelledby="rd-h"
          className="rd pb-[88px] pt-10 min-[601px]:pb-[120px] min-[601px]:pt-16"
        >
          <div className="mx-auto grid max-w-[1228px] items-start gap-9 px-4 min-[601px]:px-6 min-[901px]:grid-cols-[minmax(0,380px)_minmax(0,1fr)] min-[901px]:gap-[72px]">
            <div className="rd-side">
              <h1
                id="rd-h"
                className="font-display text-[38px] leading-[1.02] tracking-normal text-bone min-[601px]:text-[clamp(36px,3.8vw,54px)]"
              >
                {c.headline(owned.total)}
              </h1>
              <p className="mt-5 max-w-[46ch] text-lg leading-[1.5] text-bone-dim">
                {c.lead(owned.outsideRows)}
              </p>
              <Reveal>
                <Cells
                  items={block}
                  stagger={3.6}
                  label={blockLabel}
                  className="rd-block"
                />
              </Reveal>
              <ReadinessFilter
                skills={skills}
                evidence={owned.byEvidence}
                rows={rows}
                counts={{
                  audit: owned.auditRows,
                  otherSkills: owned.otherSkillRows,
                  otherSkillCount,
                  team: owned.outsideRows,
                }}
              />
            </div>
            <ReadinessMap areas={areas} skills={skills} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
