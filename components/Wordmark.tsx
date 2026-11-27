import Link from "next/link";
import { Mark } from "./brand/Mark";
import { ProductLockup } from "./brand/ProductLockup";

// The HF monogram where an older surface still asks for "the mark" (the
// overview deck, the design-system page). Both sit on Ink, so the body is
// Bone. `small` chose between the retired mark's two cuts and means nothing
// now: the monogram has one drawing. It stays in the signature so those
// surfaces compile until the rebrand reaches them.
export function BrandMark({
  className = "",
}: {
  className?: string;
  small?: boolean;
}) {
  return (
    <span role="img" aria-label="Horizon Foundry" className="inline-flex">
      <Mark ground="dark" className={className} />
    </span>
  );
}

// The way home in the site chrome: the product lockup, which is the untouched
// HF mark and FOUNDRY SKILLS in Zalando Sans Black capitals
// (components/brand/ProductLockup.tsx). The header and the footer are Ink on
// every page, so the ground is dark. The mark is 34px tall from 1024 wide and
// 26px below, the parent header's own sizes.
export function Wordmark({ size = "header" }: { size?: "header" | "footer" }) {
  return (
    <Link href="/" className="hdr-home" aria-label="Foundry Skills, home">
      {size === "header" ? (
        <>
          <span className="hidden lg:inline-flex">
            <ProductLockup ground="dark" markHeight={34} />
          </span>
          <span className="inline-flex lg:hidden">
            <ProductLockup ground="dark" markHeight={26} />
          </span>
        </>
      ) : (
        <ProductLockup ground="dark" markHeight={26} />
      )}
    </Link>
  );
}
