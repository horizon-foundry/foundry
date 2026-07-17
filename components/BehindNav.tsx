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

// Tab bar. Active tab gets a signal underline rule, not a filled pill: action
// is not selection (DESIGN.md).
export function BehindNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap items-center gap-x-1 gap-y-2 font-mono text-xs uppercase tracking-wide">
      {LINKS.map((l) => {
        const active = pathname === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={[
              "border-b-2 px-2.5 py-1.5 transition-colors",
              active
                ? "border-signal text-bone"
                : "border-transparent text-bone-faint hover:text-bone",
            ].join(" ")}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
