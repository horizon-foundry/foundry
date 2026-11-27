import Link from "next/link";
import { ProductLockup } from "./brand/ProductLockup";

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
