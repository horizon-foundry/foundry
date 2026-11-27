"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Header nav link with a current-page state: without it every link renders
// identically on every page and interior pages lose "where am I" (Nielsen 6,
// recognition over recall). The link carries aria-current, and the stylesheet
// draws the current page from that one fact (.hdr-link in globals.css), so
// what a screen reader hears and what the eye sees cannot disagree.
export function NavLink({
  href,
  label,
  match,
  className = "",
}: {
  href: string;
  label: string;
  // Optional pathname prefix that counts as "here" (e.g. /example for the
  // example-audit link). Hash links never count as a page of their own.
  match?: string;
  className?: string;
}) {
  const pathname = usePathname();
  const active = href.includes("#")
    ? false
    : match
      ? pathname === match || pathname.startsWith(`${match}/`) || pathname === href
      : href === "/"
        ? pathname === "/"
        : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={className}
    >
      {label}
    </Link>
  );
}
