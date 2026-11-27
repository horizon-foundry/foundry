"use client";

import { useEffect, useRef } from "react";
import { NavLink } from "./NavLink";

// The header's Menu under 48rem. It is a <details>, so it opens and closes
// with no script, and every link in it works with none. Open, it is the whole
// screen under the header band (globals.css, "The open phone menu").
//
// The script only ever closes it, in the four cases a full-screen panel has
// to answer: Escape (focus goes back to the box that opened it), a link
// inside it (a route change must not leave the panel over the new page),
// focus leaving it (the page behind is covered, so a Tab must never land
// there unseen), and the window passing 48rem, where the row of links takes
// over. The condition is the stylesheet's own.
const WIDE = "(width >= 48rem)";

export function PhoneMenu({
  items,
  repoUrl,
}: {
  items: { href: string; label: string; match?: string }[];
  repoUrl: string;
}) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const menu = ref.current;
    if (!menu) return;
    const close = () => {
      menu.open = false;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || !menu.open) return;
      close();
      menu.querySelector("summary")?.focus();
    };
    const onClick = (e: MouseEvent) => {
      if (e.target instanceof Element && e.target.closest("a")) close();
    };
    const onFocusOut = (e: FocusEvent) => {
      if (e.relatedTarget instanceof Node && !menu.contains(e.relatedTarget)) {
        close();
      }
    };
    const wide = window.matchMedia(WIDE);
    const onWide = () => {
      if (wide.matches) close();
    };
    document.addEventListener("keydown", onKey);
    menu.addEventListener("click", onClick);
    menu.addEventListener("focusout", onFocusOut);
    wide.addEventListener("change", onWide);
    return () => {
      document.removeEventListener("keydown", onKey);
      menu.removeEventListener("click", onClick);
      menu.removeEventListener("focusout", onFocusOut);
      wide.removeEventListener("change", onWide);
    };
  }, []);

  return (
    <details ref={ref} className="hdr-menu">
      <summary>
        <span className="hdr-menu-open">Menu</span>
        <span className="hdr-menu-close">Close</span>
      </summary>
      <nav aria-label="Primary" className="hdr-menu-panel">
        {items.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            match={item.match}
          />
        ))}
        <a href={repoUrl} target="_blank" rel="noreferrer" className="btn">
          GitHub
        </a>
      </nav>
    </details>
  );
}
