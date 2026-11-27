import { UNIT_BAR, UNIT_BAR_VIEWBOX } from "./paths";

// Amber is the one literal: it is the brand's, never a token and never
// recolored.
const FILL = {
  slate: "var(--color-slate)",
  amber: "#D99A2E",
  ink: "var(--color-ink)",
  bone: "var(--color-bone)",
} as const;

// The small bar: the parent's one graphic device at the size of a letter. It
// never carries text and always stands beside the word it marks. On this
// site it has two jobs: Slate, Amber and Ink mark the three stages (the
// parent's own order on a light ground), and Amber marks a command field,
// which is where this product's "amber means a command you fire" now lives.
export function UnitBar({
  fill,
  className,
}: {
  fill: keyof typeof FILL;
  className?: string;
}) {
  return (
    <svg
      viewBox={UNIT_BAR_VIEWBOX}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d={UNIT_BAR} fill={FILL[fill]} />
    </svg>
  );
}
