import Link from "next/link";
import type { CSSProperties } from "react";
import { Cells, type CellVariant } from "@/components/Cells";
import { Frame } from "@/components/Frame";
import { Reveal } from "@/components/Reveal";
import { Specimen } from "@/components/Specimen";
import { VERDICT_LABEL, type VerdictLevel } from "@/lib/report-types";
import { auditFacts, selfAudit, type AuditFacts } from "@/lib/self-audit";
import {
  FRAME_AUDIT,
  FRAME_PAIR,
  FRAME_SECURITY,
  frameCaption,
  frameEntries,
  numberWord,
  type FigureSpec,
} from "@/lib/skill-figures";
import type { SkillCopy } from "@/lib/skills";

// The figures of a skill page, in the site's frame grammar. Every figure is
// complete in the server HTML and arms its own once-on-entry reveal only when
// it starts below the fold (Reveal.tsx). Hue appears only inside a frame that
// excerpts the real report (the verdict trio); everything else is luminance.
// Every number about the self-audit is read through auditFacts(), never typed.

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

function Verdicts({ facts }: { facts: AuditFacts }) {
  const levels = Object.keys(VERDICT_LABEL) as VerdictLevel[];
  return (
    <Frame
      reveal
      left="Three possible verdicts"
      right={`self-audit, ${facts.date}`}
      caption="Every full run ends in exactly one, and names the evidence it stands on."
      className="sk-trio"
    >
      <ol className="sk-trio-list">
        {levels.map((level, i) =>
          level === facts.level ? (
            <li
              key={level}
              data-stamp
              className={`stamp hue-${facts.hue} sk-trio-on`}
            >
              <span className="tk tk-tl" aria-hidden="true" />
              <span className="tk tk-tr" aria-hidden="true" />
              <span className="tk tk-bl" aria-hidden="true" />
              <span className="tk tk-br" aria-hidden="true" />
              <strong className="hue-text">{VERDICT_LABEL[level]}</strong>
              <span>where Foundry landed</span>
              <span className="sk-trio-scope">{facts.scope}</span>
            </li>
          ) : (
            <li key={level} data-rv style={delay(i * 80)}>
              <strong>{VERDICT_LABEL[level]}</strong>
            </li>
          ),
        )}
      </ol>
    </Frame>
  );
}

function FrameGrid() {
  const entries = frameEntries();
  return (
    <Frame
      reveal
      left="The one-page frame"
      right={`frame audit, ${FRAME_AUDIT.date}`}
      caption={frameCaption(entries)}
      className="sk-ent"
    >
      <ol className="sk-ent-grid">
        {entries.map((e, i) => (
          <li
            key={e.n}
            data-rv
            style={delay(i * 60)}
            className={e.flag ? `sk-flag sk-flag-${e.flag.kind}` : undefined}
          >
            <span className="sk-en">{e.n}</span>
            <span className="sk-et">{e.name}</span>
            {e.flag ? (
              <>
                <span className="sk-ef">{e.flag.word}</span>
                <span className="sk-ew">{e.flag.why}</span>
              </>
            ) : (
              <span className="sk-ok" role="img" aria-label="passed">
                ✓
              </span>
            )}
          </li>
        ))}
      </ol>
    </Frame>
  );
}

// production-audit's hero is the verdict trio, read from the published
// self-audit. Without a report there is no hero: its specimen quotes the
// self-audit by a typed date, which would outlive the report it names.
export function hasHeroFigure(slug: string): boolean {
  return slug !== "production-audit" || selfAudit() !== null;
}

export function HeroFigure({ slug, copy }: { slug: string; copy: SkillCopy }) {
  if (slug === "frame") return <FrameGrid />;
  if (slug === "production-audit") {
    const audit = selfAudit();
    return audit ? <Verdicts facts={auditFacts(audit.report)} /> : null;
  }
  return <Specimen specimen={copy.specimen} />;
}

// ---------------------------------------------------------------------------
// highlight figures
// ---------------------------------------------------------------------------

function Skeptic({ facts }: { facts: AuditFacts }) {
  const s = facts.skeptic;
  const items: CellVariant[] = [
    ...Array.from({ length: s.confirmed }, () => "confirmed" as const),
    ...Array.from({ length: s.downgraded }, () => "downgraded" as const),
    ...Array.from({ length: s.refuted }, () => "refuted" as const),
  ];
  return (
    <Reveal as="figure" className="sk-fig">
      <ul className="sk-nums">
        {(
          [
            ["Confirmed", s.confirmed],
            ["Downgraded", s.downgraded],
            ["Refuted", s.refuted],
          ] as const
        ).map(([k, n]) => (
          <li key={k}>
            <b>{n}</b>
            <span>{k}</span>
          </li>
        ))}
      </ul>
      <Cells
        size="xl"
        items={items}
        stagger={50}
        label={`${s.checked} findings checked: ${s.confirmed} confirmed, ${s.downgraded} downgraded, ${s.refuted} refuted`}
      />
      <figcaption>
        {s.checked} findings sent to a skeptic in the {facts.date} self-audit
      </figcaption>
    </Reveal>
  );
}

function Dimensions({ facts }: { facts: AuditFacts }) {
  const max = facts.dimensions[0]?.count || 1;
  return (
    <Reveal as="figure" className="sk-fig sk-bars">
      <ul>
        {facts.dimensions.map((d, i) => (
          <li key={d.name}>
            <span className="sk-bl">{d.label}</span>
            <span className="sk-bt" aria-hidden="true">
              <i
                data-rv="bar"
                style={
                  {
                    "--w": (d.count / max).toFixed(3),
                    "--d": `${i * 45}ms`,
                  } as CSSProperties
                }
              />
            </span>
            <span className="sk-bn">{d.count}</span>
          </li>
        ))}
      </ul>
      <figcaption>
        Findings per dimension, {facts.date} self-audit
        {facts.loc ? ` of ${facts.loc.toLocaleString("en-US")} lines` : ""}
      </figcaption>
    </Reveal>
  );
}

// A check's name is the words before its first colon or bracket, so a long
// "Supabase Auth dashboard state: Site URL and ..." reads as a short item.
const shortName = (check: string) => check.split(/[:(]/)[0].trim();

function Skipped({ facts }: { facts: AuditFacts }) {
  const { count, names } = facts.notAssessed;
  const short = names.map(shortName);
  const fits = short.filter((n) => n.length <= 44);
  const named = (fits.length >= 3 ? fits : short).slice(0, 3);
  const more = count - named.length;
  return (
    <Reveal as="figure" className="sk-fig sk-na">
      <div className="sk-na-top">
        <b>{count}</b>
        <Cells
          size="big"
          items={Array.from({ length: count }, () => "na" as const)}
          stagger={30}
          label={`${count} checks not assessed`}
        />
      </div>
      <ul className="sk-na-list">
        {named.map((n, i) => (
          <li key={n} data-rv style={delay(i * 70)}>
            {n}
          </li>
        ))}
        {more > 0 && (
          <li className="sk-more" data-rv style={delay(named.length * 70)}>
            and {more} more, each with how to verify it
          </li>
        )}
      </ul>
      <figcaption>Not assessed, in the {facts.date} self-audit</figcaption>
    </Reveal>
  );
}

function Pair() {
  const { from, relation, to, note } = FRAME_PAIR;
  return (
    <Reveal as="figure" className="sk-fig sk-pair">
      <div className="sk-pair-row">
        <div className="sk-pt" data-rv>
          <span className="sk-en">{from.n}</span>
          {from.name}
        </div>
        <div className="sk-pl" data-rv style={delay(120)}>
          <span>{relation}</span>
          <i aria-hidden="true" />
        </div>
        <div className="sk-pt" data-rv style={delay(240)}>
          <span className="sk-en">{to.n}</span>
          {to.name}
        </div>
      </div>
      <p className="sk-pair-cap">{note}</p>
      <figcaption>Illustrative</figcaption>
    </Reveal>
  );
}

function Security() {
  const blank = FRAME_SECURITY.flatMap((l, i) => (l.value ? [] : [i + 1]));
  return (
    <Frame
      reveal
      left="PRODUCT.md · security frame"
      right="illustrative"
      className="sk-sec"
    >
      <ol className="sk-sec-list">
        {FRAME_SECURITY.map((l, i) => (
          <li
            key={l.label}
            data-rv
            style={delay(i * 80)}
            className={l.value ? undefined : "sk-blank"}
          >
            <span className="sk-en">{i + 1}</span>
            <span className="sk-sk">{l.label}</span>
            <span className="sk-sv">{l.value || "blank"}</span>
          </li>
        ))}
      </ol>
      <p className="sk-sec-to">
        <span aria-hidden="true">↓</span>
        <span>
          read by{" "}
          <Link href="/skills/production-audit" className="text-command">
            /production-audit
          </Link>{" "}
          before it reads the code
        </span>
        <span className="sk-sec-out">
          {blank.length === 1
            ? `line ${blank[0]} blank · one finding`
            : `${numberWord(blank.length)} lines blank`}
        </span>
      </p>
    </Frame>
  );
}

export function HighlightFigure({ figure }: { figure: FigureSpec }) {
  switch (figure.kind) {
    case "stat":
      return (
        <Reveal as="figure" className="sk-fig sk-stat">
          <p className="sk-stat-n">{figure.value}</p>
          <figcaption>{figure.label}</figcaption>
        </Reveal>
      );
    case "states":
      return (
        <Reveal as="figure" className="sk-fig">
          <ul aria-label="States it reports" className="sk-states">
            {figure.items.map((s, i) => (
              <li key={s} data-rv style={delay(i * 70)}>
                {s}
              </li>
            ))}
          </ul>
        </Reveal>
      );
    case "pair":
      return <Pair />;
    case "security":
      return <Security />;
    case "verification":
    case "skeptic":
    case "dimensions":
    case "skipped": {
      const audit = selfAudit();
      if (!audit) return null;
      const facts = auditFacts(audit.report);
      if (figure.kind === "dimensions") return <Dimensions facts={facts} />;
      if (figure.kind === "skipped") return <Skipped facts={facts} />;
      return <Skeptic facts={facts} />;
    }
  }
}
