import { Mark } from "./Mark";

// The product lockup: the untouched HF mark, then FOUNDRY SKILLS in Zalando
// Sans Black capitals. It follows the parent's one-line lockup: the cap height
// is 0.4 of the mark's height, the gap is 0.4 of it, the tracking is 0.05em.
// The parent's own lockup is outlined paths; this one is live text because
// its words are this product's, and Zalando's cap height is 0.714em, which
// gives the font size below. One accessible name for the whole thing.
const CAP = 0.714;

export function ProductLockup({
  ground,
  markHeight,
}: {
  ground: "dark" | "light";
  markHeight: number;
}) {
  const markWidth = (markHeight * 128) / 100;
  return (
    <span
      role="img"
      aria-label="Foundry Skills, by Horizon Foundry"
      className="inline-flex shrink-0 items-center"
      style={{ gap: markHeight * 0.4 }}
    >
      <Mark
        ground={ground}
        className="shrink-0"
        style={{ width: markWidth, height: markHeight }}
      />
      <span
        aria-hidden="true"
        className="lockup-word"
        style={{ fontSize: (markHeight * 0.4) / CAP }}
      >
        Foundry Skills
      </span>
    </span>
  );
}
