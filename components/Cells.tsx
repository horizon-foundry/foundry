import type { CSSProperties } from "react";

// A row of cells, the one visual atom the figures share (globals.css, "Cells").
// Each entry names a variant: an owner group (pa, sk, out), a map state (lit,
// off), a severity, or a skeptic ruling (confirmed, downgraded, na). Color
// means severity or verdict only, so the owner and map variants are luminance.
const VARIANT = {
  pa: "c-pa",
  sk: "c-sk",
  out: "c-out",
  lit: "c-lit",
  off: "c-off",
  critical: "s-critical",
  high: "s-high",
  medium: "s-medium",
  low: "s-low",
  informational: "s-informational",
  confirmed: "v-confirmed",
  downgraded: "v-downgraded",
  na: "v-na",
} as const;

export type CellVariant = keyof typeof VARIANT;

const SIZE = { big: "cells-big", xl: "cells-xl" } as const;

// `label` is the figure's one text alternative (the cells are decorative, so
// the numbers must also be in the page's text). Without a label the row is
// hidden from assistive tech. `stagger` is the delay in ms between one cell
// and the next; it only matters inside a revealing figure (Reveal).
export function Cells({
  items,
  size,
  stagger,
  label,
  className = "",
  style,
}: {
  items: CellVariant[];
  size?: keyof typeof SIZE;
  stagger?: number;
  label?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const classes = ["cells", size ? SIZE[size] : "", className]
    .filter(Boolean)
    .join(" ");
  return (
    <div
      className={classes}
      style={style}
      {...(label
        ? { role: "img", "aria-label": label }
        : { "aria-hidden": true })}
    >
      {items.map((item, i) => (
        <i
          key={i}
          className={`c ${VARIANT[item]}`}
          style={
            stagger ? ({ "--d": `${i * stagger}ms` } as CSSProperties) : undefined
          }
        />
      ))}
    </div>
  );
}
