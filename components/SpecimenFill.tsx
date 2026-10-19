"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

// The specimen's one motion: when a specimen first enters the viewport, its
// rows land in order and the flag arrives last, like output being written and
// then read. It plays once and never on scroll position (DESIGN.md, Motion).
//
// The fill is armed only for a specimen that is still below the fold when the
// page hydrates. One already on screen stays exactly as the server drew it,
// so nothing that was visible ever disappears, and without script the rows are
// simply there. Reduced motion keeps the order and drops the movement (the CSS
// owns that, under prefers-reduced-motion).
export function SpecimenFill({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    el.dataset.fill = "armed";
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.dataset.fill = "run";
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <figure ref={ref} className={className} style={style}>
      {children}
    </figure>
  );
}
