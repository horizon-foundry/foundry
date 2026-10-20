import Link from "next/link";
import type { ReactNode } from "react";
import type { ReadinessArea, ReadinessRow } from "@/lib/readiness-types";

// The readiness map as a read-only reference: an index of areas, then one
// ruled list per area. Server component, no client state. It shows no status
// because the map holds none: a concern's state comes from running its owner.
//
// Cells arrive exactly as written in reference/readiness-map.md, backticks
// included, and are rendered through Inline below.

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

// "data-migration-safety" reads as "data migration safety".
const plain = (s: string) => s.replace(/-/g, " ");

const LINK =
  "text-bone underline decoration-line-strong underline-offset-4 transition-colors hover:text-signal hover:decoration-bone";

// The owner is a skill, a production-audit dimension, or a role outside
// Foundry's skills. A skill that has no page falls back to plain text, so a
// link never points at a 404.
function Owner({ owner, skills }: { owner: string; skills: ReadonlySet<string> }) {
  const [head, ...rest] = owner.split("/");
  const tail = rest.join("/");

  if (head === "outside") {
    return (
      <>
        <span className="text-bone">{plain(tail)}</span>
        <span className="block text-bone-faint">outside Foundry&apos;s skills</span>
      </>
    );
  }

  const name = skills.has(head) ? (
    <Link href={`/skills/${head}`} className={`font-mono ${LINK}`}>
      {head}
    </Link>
  ) : (
    <span className="font-mono text-bone">{head}</span>
  );

  return (
    <>
      {name}
      {tail && <span className="block text-bone-faint">{plain(tail)}</span>}
    </>
  );
}

// Same four tracks in the header row and in every row, so the columns line up.
const LG_COLUMNS = "lg:grid-cols-[minmax(0,1fr)_13rem_14rem_5rem]";

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  // Below sm each field is a label and a value on one line. From sm up the
  // label sits above its value, and from lg up the column header says it, so
  // the label stays only for assistive technology.
  return (
    <div className="flex gap-x-4 sm:block">
      <dt className="w-[6.5rem] shrink-0 font-mono text-[0.6875rem] leading-5 text-bone-faint sm:mb-0.5 sm:w-auto lg:sr-only">
        {label}
      </dt>
      <dd className="min-w-0 text-sm leading-5 text-bone-dim [overflow-wrap:anywhere]">
        {children}
      </dd>
    </div>
  );
}

function Row({ row, skills }: { row: ReadinessRow; skills: ReadonlySet<string> }) {
  return (
    <li
      id={row.id}
      data-owner={row.owner.split("/")[0]}
      className={`group/row grid scroll-mt-28 gap-x-6 gap-y-3 py-4 target:bg-ink-raised lg:items-baseline ${LG_COLUMNS}`}
    >
      <p className="max-w-measure leading-relaxed text-bone">
        <Inline text={row.concern} />{" "}
        <a
          href={`#${row.id}`}
          className="font-mono text-[0.6875rem] text-bone-faint opacity-60 transition-opacity hover:text-bone hover:opacity-100 focus-visible:opacity-100 group-hover/row:opacity-100"
        >
          {row.id}
        </a>
      </p>
      <dl className="grid gap-y-2 sm:grid-cols-3 sm:gap-x-6 lg:contents">
        <Field label="Owner">
          <Owner owner={row.owner} skills={skills} />
        </Field>
        <Field label="Applies when">
          <Inline text={row.appliesWhen} />
        </Field>
        <Field label="Evidence">
          <span className="font-mono">
            <Inline text={row.evidence} />
          </span>
        </Field>
      </dl>
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

  return (
    <>
      <nav aria-label="Areas">
        {/* A hairline grid, not cards: 1px gaps over the line colour. The 24
            areas divide evenly by 2 and by 3, so no cell is left blank. */}
        <ul className="grid grid-cols-2 gap-px border border-line bg-line md:grid-cols-3">
          {areas.map((area) => (
            <li key={area.slug} className="bg-ink">
              <a
                href={`#${areaId(area.slug)}`}
                className="flex min-h-11 items-baseline justify-between gap-3 px-3 py-2.5 text-sm leading-snug text-bone-dim transition-colors hover:bg-ink-raised hover:text-bone"
              >
                <span className="min-w-0 [overflow-wrap:anywhere]">{area.name}</span>
                <span className="font-mono text-[0.6875rem] text-bone-faint">
                  {area.rows.length}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {areas.map((area) => (
        <section
          key={area.slug}
          aria-labelledby={areaId(area.slug)}
          data-area
          className="mt-14"
        >
          <h2
            id={areaId(area.slug)}
            className="scroll-mt-28 font-display text-xl tracking-normal text-bone sm:text-2xl"
          >
            {area.name}
          </h2>
          <div className="mt-5 border-y border-line">
            <div
              aria-hidden="true"
              className={`hidden gap-x-6 border-b border-line py-2 font-mono text-[0.6875rem] text-bone-faint lg:grid ${LG_COLUMNS}`}
            >
              <span>Concern</span>
              <span>Owner</span>
              <span>Applies when</span>
              <span>Evidence</span>
            </div>
            <ul className="divide-y divide-line">
              {area.rows.map((row) => (
                <Row key={row.id} row={row} skills={known} />
              ))}
            </ul>
          </div>
        </section>
      ))}
    </>
  );
}
