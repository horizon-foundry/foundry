import Link from "next/link";
import type { CSSProperties, ElementType } from "react";
import { Reveal } from "@/components/Reveal";
import { UnitBar } from "@/components/brand/UnitBar";
import { HANDOFF, STAGES, THREAD, listSkills } from "@/lib/skills";

// The skills by stage: three ruled rows, one per stage. Each has the stage's
// word at display size behind a unit bar, its skills as command links in
// rows, and the line the stage hands to the next. After the last stage comes
// the thread that ties the three together. Shared by the homepage and /skills.
//
// The unit bars are Slate, Amber and Ink, the parent's order on a light
// ground, and they mark the same three words the parent's method marks.
//
// Nothing here is tied to scroll position. A stage's command rows and handoff
// fade in and rise 8px once, when that stage first enters the viewport
// (Reveal). The stage's own words (title, caption, line) never fade or move.
// Without script, under reduced motion and in print the stage is simply
// there, with no movement.
//
// headingLevel is the level of each stage's title. The homepage sits the rail
// under an h2, so the default is h3; a page that puts it directly under its h1
// passes 2, so no level is skipped.

// A skill's command as a reader types it. foundry's skill page is about its
// `check` mode, so its command carries it.
const COMMAND: Record<string, string> = { foundry: "foundry check" };
const command = (s: { slug: string; name: string }) =>
  `/${COMMAND[s.slug] ?? s.name}`;

// The widest command in a list, in characters. The two-column list sizes its
// columns from it (home.css, .home-cmds-2), so a command is never split.
const longest = (list: { slug: string; name: string }[]) =>
  Math.max(...list.map((s) => command(s).length));

const STAGE_BAR = { distill: "slate", forge: "amber", deliver: "ink" } as const;

export function StageRail({
  taglines = false,
  headingLevel = 3,
}: {
  taglines?: boolean;
  headingLevel?: 2 | 3 | 4;
}) {
  const skills = listSkills();
  const Title = `h${headingLevel}` as ElementType;

  return (
    <>
      <div className="home-stages">
        {STAGES.map((stage, i) => {
          const list = skills.filter((s) => s.stage === stage.id);
          const handoff = HANDOFF[stage.id];
          const last = i === STAGES.length - 1;
          return (
            <Reveal
              as="section"
              key={stage.id}
              className="home-stage"
              aria-labelledby={`stage-${stage.id}`}
            >
              <div className="home-stage-grid">
                <div>
                  <Title id={`stage-${stage.id}`} className="home-stage-title">
                    <UnitBar fill={STAGE_BAR[stage.id]} />
                    {stage.label}
                  </Title>
                  <p className="home-stage-n label">{stage.caption}</p>
                  <p className="home-stage-line">{stage.line}</p>
                </div>
                <ul
                  role="list"
                  className={`home-cmds${list.length > 3 ? " home-cmds-2" : ""}${taglines ? " home-cmds-tag" : ""}`}
                  style={{ "--cmd-ch": longest(list) } as CSSProperties}
                >
                  {list.map((s, k) => (
                    <li
                      key={s.slug}
                      data-rv
                      style={{ "--d": `${k * 60}ms` } as CSSProperties}
                    >
                      <Link href={`/skills/${s.slug}`} className="home-cmd-link">
                        <span className="home-cmd-name">
                          {command(s)}
                        </span>
                        {taglines && (
                          <span className="home-cmd-tag">{s.tagline}</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <p
                data-rv
                style={{ "--d": "240ms" } as CSSProperties}
                className={`home-handoff${last ? " home-handoff-end" : ""}`}
              >
                <span className="home-ho-k">{handoff.to}</span>
                <span className="home-ho-v">{handoff.what}</span>
              </p>
            </Reveal>
          );
        })}
      </div>
      <p className="home-thread">{THREAD.line}</p>
      <p className="home-thread-sub">
        {THREAD.lead}{" "}
        <Link href={`/skills/${THREAD.skill}`} className="home-thread-link">
          {THREAD.command}
        </Link>{" "}
        {THREAD.tail}
      </p>
    </>
  );
}
