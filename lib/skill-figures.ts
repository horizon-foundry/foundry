import { selfAudit } from "@/lib/self-audit";
import type { SkillCopy, SkillFigure } from "@/lib/skills";

// The figures only two skill pages draw, and the rule for which highlight gets
// which figure. Pure data and pure functions: Tailwind does not scan lib/, so
// no class name lives here, and no number about the self-audit either (the
// production-audit figures read those from the report, lib/self-audit.ts).

// A highlight's figure on a skill page: one of the three kinds SKILL_COPY
// already names, or one of the bespoke figures below.
export type FigureSpec =
  | SkillFigure
  | { kind: "skeptic" }
  | { kind: "dimensions" }
  | { kind: "skipped" }
  | { kind: "pair" }
  | { kind: "security" };

export type Highlight = { title: string; line: string; figure?: FigureSpec };

const NUMBER_WORD = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
];

// A small count written as a word, as the site's prose does.
export const numberWord = (n: number) => NUMBER_WORD[n] ?? String(n);

// ---------------------------------------------------------------------------
// frame
// ---------------------------------------------------------------------------

// The nine entries of the one-page frame, in the order skills/frame/SKILL.md
// lists them ("The frame (one page, nine entries)").
const FRAME_ENTRY_NAMES = [
  "User",
  "Problem",
  "Alternatives",
  "Outcomes",
  "Evidence and assumptions",
  "Success measure",
  "Non-goals",
  "Risks",
  "Learn before investing",
];

// REAL DATA. The findings of the first /frame run on this repo, recorded in
// PRODUCT.md under "Frame audit, 2026-07-13 (first run)": entry 1 bordered on
// an unnamed segment, entry 6 had no observable success signal (a blank),
// entry 8 had no idea risk, entry 9 had no learn-before-investing threshold (a
// blank). The security frame was fully covered. Entries 6 and 9 were declared
// on 2026-07-16 and the findings closed, which is why the figure is captioned
// as the first run.
export const FRAME_AUDIT = { date: "2026-07-13", source: "PRODUCT.md" };

const FRAME_FLAGS: Record<number, { kind: "finding" | "blank"; why: string }> = {
  1: { kind: "finding", why: "bordered on an unnamed segment" },
  6: { kind: "blank", why: "no single observable success signal" },
  8: { kind: "finding", why: "idea risk was absent" },
  // DRAFT: a short form of PRODUCT.md's "no learn-before-investing threshold
  // was declared before the build grew".
  9: { kind: "blank", why: "no threshold declared" },
};

export type FrameEntry = {
  n: number;
  name: string;
  flag?: { kind: "finding" | "blank"; word: string; why: string };
};

export function frameEntries(): FrameEntry[] {
  return FRAME_ENTRY_NAMES.map((name, i) => {
    const f = FRAME_FLAGS[i + 1];
    return {
      n: i + 1,
      name,
      flag: f && {
        kind: f.kind,
        word: f.kind === "blank" ? "Blank" : "Finding",
        why: f.why,
      },
    };
  });
}

// "Foundry's own frame, first run: four of nine entries came back. ..."
export function frameCaption(entries: FrameEntry[]): string {
  const flagged = entries.filter((e) => e.flag).length;
  return `Foundry's own frame, first run: ${numberWord(flagged)} of ${numberWord(entries.length)} entries came back. From ${FRAME_AUDIT.source}, frame audit of ${FRAME_AUDIT.date}.`;
}

// ILLUSTRATIVE, and captioned so. A non-goal that excludes the declared user
// is the contradiction pair frame reports (its SKILL.md, "The audit").
export const FRAME_PAIR = {
  from: { n: 7, name: "Non-goals" },
  relation: "excludes",
  to: { n: 1, name: "User" },
  note: "cites both entries · the call stays yours",
};

// ILLUSTRATIVE. Four example lines with one left blank, to show what the
// later audit does with them: production-audit reads all four before it reads
// the code, and a blank line is a finding (its SKILL.md, phase 0). The labels
// are the names of the four declarations in skills/frame/SKILL.md ("Data
// classification", "Trust boundaries", "Authn/authz model", "Secret handling");
// the values are made up.
export const FRAME_SECURITY: { label: string; value: string }[] = [
  { label: "Data classification", value: "email, saved recipes" },
  { label: "Trust boundaries", value: "browser to API, API to database" },
  { label: "Authn/authz model", value: "magic link, no passwords" },
  { label: "Secret handling", value: "" },
];

// ---------------------------------------------------------------------------
// which highlight gets which figure
// ---------------------------------------------------------------------------

// A highlight is matched by its title in SKILL_COPY. If Craig rewords a title
// the figure is simply not attached and the highlight joins the unfigured row:
// nothing breaks and nothing is lost.
const FIGURES: Record<string, Record<string, FigureSpec>> = {
  frame: {
    "Contradictions come in pairs": { kind: "pair" },
    "Four security lines, stated early": { kind: "security" },
  },
  "production-audit": {
    "It argues with itself": { kind: "skeptic" },
    "Read-only, and says what it skipped": { kind: "skipped" },
  },
};

// Highlights the hero figure already is, so the page does not say them twice:
// frame's hero is the nine-entry grid of blanks and findings, and
// production-audit's is the three verdicts.
const SHOWN_BY_HERO: Record<string, string[]> = {
  frame: ["Blanks are findings"],
  "production-audit": ["One decision, not a pile"],
};

// The dimension bars need a highlight of their own: SKILL_COPY has none for
// them. The prototype's highlight with its numeral ("Eleven dimensions")
// removed so the line cannot drift from the report. DRAFT, placed second as in
// the prototype.
const AUDIT_DIMENSIONS: Highlight = {
  title: "The whole app, not a diff",
  line: "Every dimension that applies to your product, resolved per project. Every finding cites the file and line behind it.",
  figure: { kind: "dimensions" },
};

// The figures that read the published self-audit. Without a report they have
// nothing to draw, so the highlight falls back to the numbered row, and the
// hero (the verdict trio) is not drawn either (SkillFigure.tsx, HeroFigure).
const AUDIT_FIGURES: FigureSpec["kind"][] = [
  "verification",
  "skeptic",
  "dimensions",
  "skipped",
];

export function highlightsFor(slug: string, copy: SkillCopy): Highlight[] {
  const hasAudit = slug !== "production-audit" || selfAudit() !== null;
  // The hero stands in for a highlight only when the hero is drawn.
  const hidden = hasAudit ? (SHOWN_BY_HERO[slug] ?? []) : [];
  const figures = FIGURES[slug] ?? {};
  const out: Highlight[] = copy.highlights
    .filter((h) => !hidden.includes(h.title))
    .map((h) => {
      // production-audit's "verification" figure is the skeptic figure.
      let own: FigureSpec | undefined =
        figures[h.title] ??
        (h.figure?.kind === "verification" ? { kind: "skeptic" } : h.figure);
      if (!hasAudit && own && AUDIT_FIGURES.includes(own.kind)) own = undefined;
      return { title: h.title, line: h.line, figure: own };
    });
  if (slug === "production-audit" && hasAudit) {
    const at = out.findIndex((h) => h.figure?.kind === "skeptic");
    out.splice(at === -1 ? out.length : at + 1, 0, AUDIT_DIMENSIONS);
  }
  return out;
}

// "Not for auditing code that already exists. production-audit does that."
// reads as "Auditing code that already exists? That is /production-audit."
// Returns null when the copy does not follow the pattern, and the page then
// prints the sentence as written.
export function notForParts(
  text: string,
): { question: string; target: string } | null {
  const m = text.match(/^Not for (.+?)\.\s+(.+?) (?:does|owns) that\.?$/);
  if (!m) return null;
  return {
    question: m[1].replace(/^./, (c) => c.toUpperCase()),
    target: m[2],
  };
}
