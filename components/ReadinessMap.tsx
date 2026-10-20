import Link from "next/link";
import type { CSSProperties } from "react";
import { Reveal } from "@/components/Reveal";
import { plainPart } from "@/lib/readiness-owners";
import { READINESS_COPY } from "@/lib/readiness-copy";
import { ownerGroup } from "@/lib/readiness-types";
import type { ReadinessArea, ReadinessRow } from "@/lib/readiness-types";

// The readiness map as an accordion: one row per area, its cells shaded by
// owner group, and a panel that lists each concern with its owner, when it
// applies and the evidence that settles it. A server component with no state.
// Every concern is in the static HTML and every panel is open there; the
// collapse is CSS under the .js class (data-panel, globals.css), and
// ReadinessFilter owns the behavior: opening, filtering, the hash.
//
// The map shows no status because it holds none: a concern's state comes from
// running its owner. Cells arrive exactly as written in
// reference/readiness-map.md, backticks included, and render through Inline.

// The types live in lib/ so data files can import them; re-exported here for
// the callers that already read them from the component.
export type { ReadinessRow, ReadinessArea };

// Backticks in a cell render as inline code. Bone, not amber: amber is the
// invocable command (DESIGN.md), and a code span in a concern is not one.
export function Inline({ text }: { text: string }) {
  const parts = text.split(/`([^`]+)`/);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <code key={i} className="font-mono text-[0.9em] text-bone">
            {part}
          </code>
        ) : (
          part
        ),
      )}
    </>
  );
}

const areaId = (slug: string) => `area-${slug}`;

// The owner is a skill, a production-audit part, or a role that signs off
// outside the skills. A skill with no page falls back to plain text, so a link
// never points at a 404.
function Owner({
  owner,
  skills,
}: {
  owner: string;
  skills: ReadonlySet<string>;
}) {
  const [head, ...rest] = owner.split("/");
  const tail = plainPart(rest.join("/"));

  if (head === "outside") {
    return (
      <span>
        {READINESS_COPY.signedOffBy} {tail}
      </span>
    );
  }

  return (
    <span>
      {skills.has(head) ? (
        <Link href={`/skills/${head}`} className="rd-cmd">
          /{head}
        </Link>
      ) : (
        <span className="font-mono text-bone">{head}</span>
      )}
      {tail && <span> · {tail}</span>}
    </span>
  );
}

function Row({
  row,
  skills,
}: {
  row: ReadinessRow;
  skills: ReadonlySet<string>;
}) {
  return (
    <li
      id={row.id}
      className="rd-row"
      data-g={ownerGroup(row.owner)}
      data-s={row.owner.split("/")[0]}
      data-e={row.evidence}
    >
      <p className="rd-concern">
        <Inline text={row.concern} />
      </p>
      <p className="rd-meta">
        <Owner owner={row.owner} skills={skills} />
        <span>
          <span className="sr-only">Evidence: </span>
          {row.evidence}
        </span>
        <span>
          <span className="sr-only">Applies when: </span>
          <Inline text={row.appliesWhen} />
        </span>
        <a href={`#${row.id}`} className="rd-id">
          #{row.id}
        </a>
      </p>
    </li>
  );
}

export function ReadinessMap({
  areas,
  skills,
}: {
  areas: ReadinessArea[];
  skills: string[];
}) {
  const known = new Set(skills);
  // One stagger across all the cells, so the list lands as a single figure.
  let n = 0;

  return (
    <div>
      <Reveal className="rd-areas-wrap">
        <ol className="rd-areas" data-areas>
          {areas.map((area) => {
            const panel = `panel-${area.slug}`;
            return (
              <li key={area.slug} id={areaId(area.slug)} className="rd-area" data-area>
                <h2 className="rd-area-h">
                  {/* Rendered expanded, like the panel: with no script every
                      panel is open. ReadinessFilter syncs it to the real
                      state once the page hydrates. */}
                  <button
                    type="button"
                    className="rd-area-btn"
                    aria-expanded="true"
                    aria-controls={panel}
                  >
                    <span className="rd-area-name">{area.name}</span>
                    <span className="rd-area-cells" aria-hidden="true">
                      {area.rows.map((row) => (
                        <i
                          key={row.id}
                          className={`c c-${ownerGroup(row.owner)}`}
                          data-g={ownerGroup(row.owner)}
                          data-s={row.owner.split("/")[0]}
                          data-e={row.evidence}
                          style={{ "--d": `${3 * n++}ms` } as CSSProperties}
                        />
                      ))}
                    </span>
                    <span
                      className="sr-only"
                      data-count
                      data-n={area.rows.length}
                    >
                      {READINESS_COPY.areaConcerns(area.rows.length)}
                    </span>
                  </button>
                </h2>
                <div className="rd-panel" id={panel} data-panel>
                  <ol>
                    {area.rows.map((row) => (
                      <Row key={row.id} row={row} skills={known} />
                    ))}
                  </ol>
                </div>
              </li>
            );
          })}
        </ol>
      </Reveal>
      <p className="rd-empty" data-empty hidden>
        {READINESS_COPY.empty}
      </p>
    </div>
  );
}
