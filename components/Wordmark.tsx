import Link from "next/link";

// The Horizon Foundry symbol path (canonical clean vector, 21 points; see the
// brand repo's logo/hf-symbol.svg + logo/MARK.md). Defined once as an SVG
// <symbol> via HfSymbolDefs (rendered once in the root layout); BrandMark
// references it with <use> so every placement shares one definition.
const SYMBOL_ID = "hf-mark";

export function HfSymbolDefs() {
  return (
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      className="absolute"
      style={{ position: "absolute" }}
    >
      <symbol id={SYMBOL_ID} viewBox="0 0 414 274">
        <path fillRule="evenodd" d="M98 165.5 L235 9.5 L277.5 45 L187 146.5Z M275.5 110 L323.5 54 L400.5 54 L314 149.5Z M326 263.5 L258.5 193 L255.5 193 L191.5 263 L117 261.5 L176.5 197 L137.5 205 L84 263.5 L9.5 262 L79 185.5 L210 156.5 L255 107.5 L402 263.5Z" />
      </symbol>
    </svg>
  );
}

export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 414 274"
      className={`fill-current ${className}`}
      role="img"
      aria-label="Horizon Foundry"
    >
      <use href={`#${SYMBOL_ID}`} />
    </svg>
  );
}

// The lockup used in site chrome: the mark + the "Foundry" wordmark, set
// uppercase with slightly open tracking to match the studio site's lockup
// treatment (Horizon-Foundry's components/Wordmark.tsx). Foundry is the
// suite; Horizon Foundry is the parent brand (see BRAND.md). The text takes
// its size from the caller's className on the Link (text-sm in the header,
// text-xs in the footer): no font-size utility here, so it inherits.
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2.5 text-bone transition-opacity hover:opacity-80 ${className}`}
      aria-label="Foundry, by Horizon Foundry, home"
    >
      <BrandMark className="h-5 w-auto" />
      <span className="font-display uppercase tracking-[0.02em]">
        Foundry
      </span>
    </Link>
  );
}
