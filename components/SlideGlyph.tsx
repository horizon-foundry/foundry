// Hairline glyphs, one per overview slide. Monochrome, geometric, square-cut to
// match the mark and the instrument aesthetic. Stroke inherits the text color;
// on entry each draws itself (see .glyph-draw in globals.css, reduced-motion
// safe). Kept abstract, a quiet visual anchor, not an illustration.

export type GlyphName =
  | "problem"
  | "suite"
  | "memory"
  | "workflow"
  | "gates"
  | "verdict"
  | "guardrail"
  | "start";

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.25,
  strokeLinejoin: "miter" as const,
  strokeLinecap: "square" as const,
};

function Glyph({ name }: { name: GlyphName }) {
  switch (name) {
    case "problem": // hazard: a triangle with a gap in its base
      return (
        <>
          <path d="M24 7 L43 41 L28 41" {...stroke} />
          <path d="M20 41 L5 41 L24 7" {...stroke} />
          <line x1="24" y1="20" x2="24" y2="30" {...stroke} />
          <line x1="24" y1="35" x2="24" y2="35.5" {...stroke} />
        </>
      );
    case "suite": // three offset panels, a set of practices
      return (
        <>
          <rect x="6" y="14" width="20" height="20" {...stroke} />
          <rect x="16" y="9" width="20" height="20" {...stroke} />
          <rect x="24" y="19" width="18" height="18" {...stroke} />
        </>
      );
    case "memory": // stacked strata behind a bracket, the record
      return (
        <>
          <line x1="12" y1="14" x2="40" y2="14" {...stroke} />
          <line x1="12" y1="22" x2="40" y2="22" {...stroke} />
          <line x1="12" y1="30" x2="34" y2="30" {...stroke} />
          <path d="M12 10 L8 10 L8 34 L12 34" {...stroke} />
        </>
      );
    case "workflow": // two nodes, an arrow, a pipeline
      return (
        <>
          <rect x="6" y="16" width="14" height="14" {...stroke} />
          <line x1="20" y1="23" x2="34" y2="23" {...stroke} />
          <path d="M30 19 L34 23 L30 27" {...stroke} />
          <rect x="34" y="16" width="8" height="14" {...stroke} />
        </>
      );
    case "gates": // two posts and a lintel, a gate
      return (
        <>
          <line x1="12" y1="10" x2="12" y2="40" {...stroke} />
          <line x1="36" y1="10" x2="36" y2="40" {...stroke} />
          <line x1="8" y1="12" x2="40" y2="12" {...stroke} />
          <path d="M20 40 L20 24 L28 24 L28 40" {...stroke} />
        </>
      );
    case "verdict": // a stamped block with a check, the decision
      return (
        <>
          <rect x="8" y="8" width="32" height="32" {...stroke} />
          <path d="M16 25 L22 31 L33 17" {...stroke} />
        </>
      );
    case "guardrail": // a shield, the guardrail
      return (
        <path d="M24 7 L40 13 L40 26 C40 34 33 39 24 42 C15 39 8 34 8 26 L8 13 Z" {...stroke} />
      );
    case "start": // a terminal prompt, run it
      return (
        <>
          <rect x="6" y="12" width="36" height="26" {...stroke} />
          <path d="M13 22 L18 26 L13 30" {...stroke} />
          <line x1="22" y1="30" x2="32" y2="30" {...stroke} />
        </>
      );
  }
}

export function SlideGlyph({ name }: { name: GlyphName }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className="glyph-draw h-full w-full text-bone-faint"
      role="img"
      aria-hidden="true"
    >
      <Glyph name={name} />
    </svg>
  );
}
