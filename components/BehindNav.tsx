"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Public hub tabs only. These are curated, external-facing surfaces (the deck,
// the design system, the forever spec, the brand). The raw session logs
// (PROMPTS, NOTES, FRICTION) are internal continuity docs, not marketing
// surfaces, so they are not rendered here (see /document's public vs internal
// modes and brand-voice). They live in the repo for anyone who clones.
const LINKS = [
  { href: "/behind", label: "Overview" },
  { href: "/behind/design-system", label: "Design system" },
  { href: "/behind/product", label: "Product" },
  { href: "/behind/brand", label: "Brand" },
];

// The tab row stands on the lower edge of the hub's Slate head. The current
// tab is Ink, the ground of the page under it (app/styles/behind.css). The
// nav carries the hub's name, which the page no longer sets as a line above
// its h1.
export function BehindNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Behind the Build" className="bh-tabs">
      {LINKS.map((l) => {
        const active = pathname === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className="bh-tab"
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
