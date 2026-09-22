import Link from "next/link";

// The Horizon Foundry mark, transcribed from the design kit that lives in the
// parent brand repo at logo/horizon-foundry-kit (kit v1.3, the mark as revised
// 2026-09-19). The kit is the source of truth and these paths are COPIES with
// no build-time link to it, so a kit revision is a change here in the same
// pass. The kit's own web/HfSymbol.tsx carries the canonical path and viewBox
// in exactly this form; reference/brand-kit.json pins what was taken and
// `make validate` fails if either drifts.
//
// Two definitions, rendered once by HfSymbolDefs in the root layout and
// referenced with <use>, so a page with five placements carries one copy of
// each path:
//
//   hf-mark        the canonical cut, for the mark at 48px wide and up
//   hf-mark-small  the small cut (wider channels, heavier echo ridge), the
//                  kit's one permitted second master, required below 48px
//                  wide or the channels close up when rasterized
//
// Each cut has its OWN viewBox. They are not interchangeable: rendering the
// small cut inside the canonical box clips the art.
const MARK_ID = "hf-mark";
const MARK_SMALL_ID = "hf-mark-small";

const MARK_VIEWBOX = "0 0 378.19 246";
const MARK_SMALL_VIEWBOX = "0 0 384.21 246";

export function HfSymbolDefs() {
  return (
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      className="absolute"
      style={{ position: "absolute" }}
    >
      <symbol id={MARK_ID} viewBox={MARK_VIEWBOX}>
        <path d="M0 246 L67.03 170.59 L194.58 142.25 L235.69 96 L378.19 246 L303.7 246 L237.01 175.79 L174.6 246 L102.35 246 L158.27 183.1 L120.75 191.43 L72.25 246 Z M82.92 152.72 L218.67 0 L255.99 39.29 L172.95 132.71 Z M245.02 85.5 L286.1 39.29 L378.19 136.23 L328.53 136.23 L286.98 92.49 L269.9 111.69 Z" />
      </symbol>
      <symbol id={MARK_SMALL_ID} viewBox={MARK_SMALL_VIEWBOX}>
        <path d="M0 246 L65.55 172.26 L200.6 142.25 L241.71 96 L384.21 246 L309.72 246 L243.03 175.79 L180.62 246 L108.37 246 L159.75 188.2 L114.73 198.21 L72.25 246 Z M92.78 141.62 L218.67 0 L255.99 39.29 L182.82 121.61 Z M257.71 78 L292.12 39.29 L384.21 136.23 L323.52 136.23 L293.19 104.31 L288.12 110.01 Z" />
      </symbol>
    </svg>
  );
}

// `small` selects the kit's small cut, and the rule is the rendered WIDTH, not
// the class name: the mark is 1.54 times as wide as it is tall, so the kit's
// 48px floor for the canonical cut falls between h-7 (43px wide, small) and
// h-8 (49px, canonical). Every call site states which cut it is asking for.
export function BrandMark({
  className = "",
  small = false,
}: {
  className?: string;
  small?: boolean;
}) {
  return (
    <svg
      viewBox={small ? MARK_SMALL_VIEWBOX : MARK_VIEWBOX}
      className={`fill-current ${className}`}
      role="img"
      aria-label="Horizon Foundry"
    >
      <use href={`#${small ? MARK_SMALL_ID : MARK_ID}`} />
    </svg>
  );
}

// The lockup used in site chrome: the mark + the "Foundry" wordmark, set
// uppercase with slightly open tracking to match the studio site's lockup
// treatment (Horizon-Foundry's components/Wordmark.tsx). Foundry is the
// suite; Horizon Foundry is the parent brand (see BRAND.md). This is a
// sub-brand lockup the kit does not contain, so the kit's own HORIZON FOUNDRY
// lockup is never substituted here; only the mark inside it comes from the
// kit. The text takes its size from the caller's className on the Link
// (text-sm in the header, text-xs in the footer): no font-size utility here,
// so it inherits.
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2.5 text-bone transition-opacity hover:opacity-80 ${className}`}
      aria-label="Foundry, by Horizon Foundry, home"
    >
      {/* h-5 is 20px tall, 31px wide: under the kit's 48px floor, so the
          small cut. */}
      <BrandMark small className="h-5 w-auto" />
      <span className="font-display uppercase tracking-[0.02em]">
        Foundry
      </span>
    </Link>
  );
}
