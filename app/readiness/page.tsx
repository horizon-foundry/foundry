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

// The page opens on Slate with the headline, then on Ink a side column (the
// whole map as one block of cells, and the filters) sits beside the 24 areas
// as an accordion. It stays static:
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
      <main id="main" data-ground="ink">
        <section className="rd-head" data-ground="slate" aria-labelledby="rd-h">
          <div className="wrap">
            <h1 id="rd-h" className="d-title">
              {c.headline(owned.total)}
            </h1>
            <p className="t-lead">{c.lead(owned.outsideRows)}</p>
          </div>
        </section>
        <div className="rd">
          <div className="wrap rd-grid">
            <div className="rd-side">
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
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
