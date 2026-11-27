import Link from "next/link";
import type { ReactNode } from "react";
import { Mark } from "@/components/brand/Mark";
import { ProductLockup } from "@/components/brand/ProductLockup";
import { UnitBar } from "@/components/brand/UnitBar";
import { CopyButton } from "@/components/CopyButton";
import { VerdictSheet } from "@/components/VerdictSheet";
import { SeverityChip } from "@/components/report-ui";
import { auditFacts, selfAudit } from "@/lib/self-audit";
import {
  SEVERITY_ORDER,
  VERDICT_LABEL,
  type Severity,
  type VerdictLevel,
} from "@/lib/report-types";
import { STAGES } from "@/lib/skills";
import { REPO_SLUG } from "@/lib/site";

export const metadata = { title: "Design system" };

/*
  The design system, shown in its own parts: the lockup, the palette, the bar,
  the type, the command well, the verdict sheet, the severity and verdict
  hues, and motion. Each part is a section on its own ground, Ink and Slate in
  turn, so the page is also a specimen of the two grounds. Every specimen is
  the shipped component or the shipped token, never a drawing of one: the
  swatches are filled from the theme's own variables, the sheet is the
  published self-audit's verdict, and the type lines are set in the steps
  they name.

  The hex labels and the motion values mirror app/globals.css @theme. When a
  token changes, change the label in the same commit: a swatch always shows
  the truth, and a label that disagrees with it is doc drift on a public page.
*/

// The four values the company owns and this product inherits.
const INHERITED = [
  ["Ink", "#14191F", "var(--color-ink)", "A ground. The header, the footer and every command well."],
  ["Slate", "#334455", "var(--color-slate)", "The second ground. The rule on Ink."],
  ["Bone", "#E8ECF0", "var(--color-bone)", "Headings and text on both grounds. The rule on Slate."],
] as const;

// The support values: one light ground and two text tints for dark grounds.
const SUPPORT = [
  ["White", "#FFFFFF", "var(--color-white)", "The verdict sheet, and nothing else."],
  ["Mist", "#C9D0D8", "var(--color-mist)", "Body text on Ink and on Slate."],
  ["Fog", "#9AA4B0", "var(--color-fog)", "Secondary text on Ink only. It fails on Slate."],
] as const;

const SEVERITY_HEX: Record<Severity, string> = {
  critical: "#FF5C5C",
  high: "#FF9F45",
  medium: "#F5CE4B",
  low: "#5AB0E6",
  informational: "#8B93A0",
};

const VERDICTS: [VerdictLevel, "safe" | "risk" | "noship", string][] = [
  ["safe-to-ship", "safe", "#3FCB7A"],
  ["ship-with-known-risks", "risk", "#F5CE4B"],
  ["do-not-ship", "noship", "#FF5C5C"],
];

// The stage rail's fills, in its order on Ink (components/StageRail.tsx).
const STAGE_FILL = { distill: "slate", forge: "amber", deliver: "bone" } as const;

const WEIGHTS = [
  ["ds-type-900", "Zalando Sans Black", "900 · -0.015em", "Headings on the ramp, and the lockup's words."],
  ["ds-type-800", "Zalando Sans Extrabold", "800 · -0.01em", "Mid headings."],
  ["ds-type-600", "Zalando Sans Semibold", "600", "Labels, buttons and text links."],
  ["ds-type-400", "Zalando Sans Regular", "400", "Running text."],
] as const;

// Mirrors the @theme block and DESIGN.md's Motion section.
const MOTION = [
  ["duration-tick", "120ms", "A press, a hover-out, a tick landing"],
  ["duration-quick", "220ms", "A hover or focus state arriving. Every bare transition utility runs on it"],
  ["duration-settle", "420ms", "An element arriving: a figure's rows revealing once"],
  ["duration-draw", "600ms", "A rule or a bar drawing itself in, once"],
  ["ease", "cubic-bezier(0.2, 0, 0, 1)", "A button, a copy control, a deck step"],
  ["ease-entrance", "cubic-bezier(0.22, 1, 0.36, 1)", "Entrances. The only easing with overshoot"],
  ["ease-exit", "cubic-bezier(0.4, 0, 0.2, 1)", "Exits and hover-outs"],
  ["ease-draw", "cubic-bezier(0.2, 0.7, 0.2, 1)", "An entrance whose end point is fixed"],
] as const;

function Part({
  id,
  ground,
  title,
  note,
  children,
}: {
  id: string;
  ground: "ink" | "slate";
  title: string;
  note: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="bh-sec" data-ground={ground} aria-labelledby={id}>
      <div className="wrap ds-grid">
        <div>
          <h2 id={id} className="d-statement">
            {title}
          </h2>
          <p className="ds-note">{note}</p>
        </div>
        <div className="ds-spec">{children}</div>
      </div>
    </section>
  );
}

function Swatch({
  name,
  hex,
  role,
  children,
}: {
  name: string;
  hex: string;
  role: string;
  children: ReactNode;
}) {
  return (
    <li className="ds-swatch">
      {children}
      <p className="ds-swatch-name">{name}</p>
      <p className="meta">{hex}</p>
      <p className="ds-swatch-role">{role}</p>
    </li>
  );
}

export default function DesignSystem() {
  const audited = selfAudit();
  const facts = audited ? auditFacts(audited.report) : null;
  const install = `npx skills@latest add ${REPO_SLUG}`;

  return (
    <>
      <Part
        id="ds-lockup"
        ground="ink"
        title="The lockup"
        note="The Horizon Foundry mark, untouched, then the product's name in Zalando Sans Black capitals. The capitals are 0.4 of the mark's height, the gap is 0.4 of it and the tracking is 0.05em. The amber bar belongs to the mark and is never recolored."
      >
        <div className="ds-rows">
          <div className="ds-row">
            <ProductLockup ground="dark" markHeight={34} />
            <p className="ds-cap">The header from 1024 wide, with a 34px mark.</p>
          </div>
          <div className="ds-row">
            <ProductLockup ground="dark" markHeight={26} />
            <p className="ds-cap">The header below 1024 and the footer, with a 26px mark.</p>
          </div>
          <div className="ds-row">
            <span role="img" aria-label="The Horizon Foundry mark" className="inline-flex">
              <Mark ground="dark" style={{ width: 82, height: 64 }} />
            </span>
            <p className="ds-cap">The mark alone. It is never cropped and never redrawn.</p>
          </div>
        </div>
      </Part>

      <Part
        id="ds-palette"
        ground="slate"
        title="The palette"
        note="Four values are the company's and are inherited as they are. White, Mist and Fog are support values: one light ground and two text tints. The site is dark, so the grounds are Ink and Slate, flat, in turn."
      >
        <p className="label">Inherited from Horizon Foundry</p>
        <ul className="ds-swatches ds-caption">
          {INHERITED.map(([name, hex, value, role]) => (
            <Swatch key={name} name={name} hex={hex} role={role}>
              <span className="ds-chip" style={{ background: value }} />
            </Swatch>
          ))}
          <Swatch
            name="Amber"
            hex="#D99A2E"
            role="Fills a bar. Never text, a border or a wash."
          >
            <UnitBar fill="amber" className="ds-chip-bar" />
          </Swatch>
        </ul>
        <p className="label" style={{ marginTop: 44 }}>
          Support values
        </p>
        <ul className="ds-swatches ds-caption">
          {SUPPORT.map(([name, hex, value, role]) => (
            <Swatch key={name} name={name} hex={hex} role={role}>
              <span className="ds-chip" style={{ background: value }} />
            </Swatch>
          ))}
        </ul>
      </Part>

      <Part
        id="ds-bar"
        ground="ink"
        title="The bar"
        note="The company's one graphic device: a rectangle whose right edge is cut on the mark's diagonal, with the cut's run at 0.75 of the bar's height. This site uses its small form, the unit bar. It marks the three stages in Slate, Amber and Bone, and in amber it marks a command to run. It carries no text and it is never decoration."
      >
        <div className="ds-bars">
          {STAGES.map((stage) => (
            <p key={stage.id} className="ds-bar">
              <UnitBar fill={STAGE_FILL[stage.id]} />
              <span className="ds-bar-word">{stage.label}</span>
            </p>
          ))}
        </div>
        <p className="meta ds-caption">
          viewBox 0 0 34 22 · M0 0H34L17.5 22H0Z
        </p>
      </Part>

      <Part
        id="ds-type"
        ground="slate"
        title="The type"
        note="Zalando Sans is the company's one family and sets every heading and all running text, at its natural width, in four weights. IBM Plex Mono is this product's own voice. It sets what a terminal or a report would print, and never a heading or a sentence."
      >
        <div className="ds-rows">
          {WEIGHTS.map(([cls, name, value, job]) => (
            <div key={name} className="ds-row">
              <p className={cls}>{name}</p>
              <div>
                <p className="meta">{value}</p>
                <p className="ds-type-400">{job}</p>
              </div>
            </div>
          ))}
          <div className="ds-row">
            <p className="ds-type-mono">IBM Plex Mono</p>
            <div>
              <p className="meta">400 · 500</p>
              <p className="ds-type-400">
                A command, a path, a date, a commit, a count, a report value.
              </p>
            </div>
          </div>
        </div>
        <dl className="ds-mono-list">
          <dt className="label">Command</dt>
          <dd>/production-audit</dd>
          <dt className="label">Path</dt>
          <dd>skills/production-audit/SKILL.md</dd>
          {facts && (
            <>
              <dt className="label">Date</dt>
              <dd>{facts.date}</dd>
              {facts.commit && (
                <>
                  <dt className="label">Commit</dt>
                  <dd>{facts.commit}</dd>
                </>
              )}
              <dt className="label">Count</dt>
              <dd>{facts.findings} findings</dd>
            </>
          )}
        </dl>
      </Part>

      <Part
        id="ds-command"
        ground="ink"
        title="The command well"
        note="The one way a command to run is set: an Ink field with a 2px Bone border, on Ink and on Slate alike. The command is Bone mono, the amber unit bar in front of it marks it as a command you fire, and the copy control joins the field's edge."
      >
        <div className="cmd-field">
          <div className="cmd-field-line">
            <UnitBar fill="amber" className="cmd-field-bar" />
            <code>{install}</code>
          </div>
          <CopyButton joined text={install} label="the install command" />
        </div>
        <p className="ds-note">
          In a line of text a command is mono in the text&rsquo;s own color, a
          step heavier, with no field: <span className="cmd">/foundry check</span>.
        </p>
      </Part>

      {audited && facts && (
        <Part
          id="ds-sheet"
          ground="slate"
          title="The verdict sheet"
          note="The one light object on the site: a White page with Ink type and 2px Ink rules, lying on a dark ground with a registration tick off each corner. The verdict's hue fills the band under the word and the type stays Ink. Every word and number on it is read from the published report."
        >
          <VerdictSheet
            className="ds-sheet"
            facts={facts}
            head={
              <span>
                <span className="cmd">/production-audit</span> on Foundry
              </span>
            }
            foot={
              <Link href={`/example/${audited.slug}`} className="tl">
                Read the self-audit
              </Link>
            }
          />
        </Part>
      )}

      <Part
        id="ds-hues"
        ground="ink"
        title="Severity and verdict"
        note="The product's own extension of the palette: five severity hues and three verdict hues. A hue means a severity or a verdict and nothing else. On a dark ground it is a cell, or the color of a label inside a report. On the sheet it is a fill under Ink type."
      >
        <ul className="ds-rows">
          {SEVERITY_ORDER.map((sev) => (
            <li key={sev} className="ds-row">
              <p className="ds-hue-id">
                <i className={`c s-${sev}`} aria-hidden="true" />
                <span className="ds-hue-name">{sev}</span>
                <span className="meta">{SEVERITY_HEX[sev]}</span>
              </p>
              <p>
                <SeverityChip severity={sev} />
              </p>
            </li>
          ))}
        </ul>
        <p className="ds-cap ds-caption">
          Left, the hue as a cell. Right, the label a report sets in it.
        </p>
        <ul className="ds-verdicts">
          {VERDICTS.map(([level, hue, hex]) => (
            <li key={level} className={`ds-verdict hue-${hue}`}>
              <p className="ds-verdict-word">{VERDICT_LABEL[level]}</p>
              <p className="meta">{hex}</p>
            </li>
          ))}
        </ul>
      </Part>

      <Part
        id="ds-motion"
        ground="slate"
        title="Motion"
        note="A value is matched to a token by what the motion does, never by the nearest number. A close runs faster and quieter than an open. Under reduced motion the movement drops and the state change stays: a press still confirms, in color."
      >
        <div className="ds-rows">
          {MOTION.map(([name, value, job]) => (
            <div key={name} className="ds-row">
              <div>
                <p className="cmd">{name}</p>
                <p className="meta">{value}</p>
              </div>
              <p className="ds-type-400">{job}</p>
            </div>
          ))}
        </div>
      </Part>
    </>
  );
}
