import { MARK_BAR, MARK_BODY, MARK_VIEWBOX } from "./paths";

// The HF monogram, inline. The paths are the parent's, untouched: the amber
// bar is drawn first and the body over it. The body is Bone on a dark ground
// and Ink on a light one. The amber bar is the one literal: it is the brand's
// and is never recolored. Always decorative: the name comes from the lockup
// or the link around it.
export function Mark({
  ground,
  className,
  style,
}: {
  ground: "dark" | "light";
  className?: string;
  style?: React.CSSProperties;
}) {
  const body = ground === "dark" ? "var(--color-bone)" : "var(--color-ink)";
  return (
    <svg
      viewBox={MARK_VIEWBOX}
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      <path d={MARK_BAR} fill="#D99A2E" />
      <path d={MARK_BODY} fill={body} />
    </svg>
  );
}
