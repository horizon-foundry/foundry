"use client";

import {
  useEffect,
  useRef,
  type AriaAttributes,
  type AriaRole,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";

// The site's one entrance, per figure: when a figure first enters the viewport
// its children settle in once, in the order the CSS gives them (globals.css,
// "Figure reveal"). It plays once and never on scroll position (DESIGN.md,
// Motion).
//
// The element arms ITSELF, and only when it is still below the fold when the
// page hydrates. One already on screen stays exactly as the server drew it, so
// nothing that was visible ever disappears; without script, under reduced
// motion, or without IntersectionObserver, nothing is ever armed. The server
// HTML carries no data-reveal value at all. Nothing is set on <html>: a root
// class would hide figures that navigation had already put on screen.
export function Reveal({
  as = "div",
  className,
  style,
  children,
  role,
  ...aria
}: {
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  role?: AriaRole;
} & AriaAttributes) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.dataset.reveal === "in") return;

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) return;
    // The observer's bottom margin is 15% of the viewport. A figure that even
    // a fully scrolled page cannot lift above that line would stay hidden
    // for good, so it is left as drawn.
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;
    if (rect.top - (maxScroll - window.scrollY) >= window.innerHeight * 0.85) {
      return;
    }

    el.dataset.reveal = "armed";
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.dataset.reveal = "in";
          io.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -15% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Tag = as;
  return (
    <Tag ref={ref} className={className} style={style} role={role} {...aria}>
      {children}
    </Tag>
  );
}
