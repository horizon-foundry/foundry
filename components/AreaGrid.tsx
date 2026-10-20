import type { CSSProperties } from "react";
import { Reveal } from "@/components/Reveal";
import { areaCells } from "@/lib/readiness-owners";
import type { OwnerGroup } from "@/lib/readiness-types";

// The homepage's readiness figure: every area on the map as a labeled row, one
// square per concern, shaded by who owns it. One figure, so the rows are not
// links (the page's one link is the button beside it), and every area shows at
// every width: the phone gets a single compact column, never a shorter list.
// The cells come from the parsed map (lib/readiness-owners.ts), so the grid
// cannot disagree with /readiness.
//
// The cells settle in once, left to right and top to bottom, when the figure
// first enters the viewport (Reveal; DESIGN.md, Motion). --d is each cell's
// delay, spread over the whole figure rather than restarting per row.

const SPREAD_MS = 640;

// How a group is said aloud: the legend's own words, in the legend's order.
const SAID: Record<OwnerGroup, string> = {
  pa: "production-audit",
  sk: "other skills",
  out: "your team",
};
const ORDER: OwnerGroup[] = ["pa", "sk", "out"];

// "Access control: 9 concerns, 7 production-audit, 2 other skills". The cells
// are decoration for a screen reader; this is the figure.
function said(name: string, groups: OwnerGroup[]) {
  const n = groups.length;
  const mix = ORDER.map((g) => [g, groups.filter((x) => x === g).length] as const)
    .filter(([, count]) => count > 0)
    .map(([g, count]) => `${count} ${SAID[g]}`);
  return `${name}: ${n} ${n === 1 ? "concern" : "concerns"}, ${mix.join(", ")}`;
}

export function AreaGrid() {
  const areas = areaCells();
  const total = areas.reduce((n, a) => n + a.groups.length, 0);
  let seen = 0;

  return (
    <Reveal
      as="ol"
      role="list"
      className="home-agrid"
      aria-label={`Readiness map: ${total} concerns in ${areas.length} areas`}
    >
      {areas.map((area) => (
        <li key={area.slug} className="home-ag-row">
          <span className="home-ag-name" aria-hidden="true">
            {area.name}
          </span>
          <span className="home-ag-cells" aria-hidden="true">
            {area.groups.map((group, i) => {
              const delay = Math.round(
                (seen++ / Math.max(1, total - 1)) * SPREAD_MS,
              );
              return (
                <i
                  key={i}
                  className={`c c-${group}`}
                  style={{ "--d": `${delay}ms` } as CSSProperties}
                />
              );
            })}
          </span>
          <span className="sr-only">{said(area.name, area.groups)}</span>
        </li>
      ))}
    </Reveal>
  );
}
