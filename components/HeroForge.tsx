"use client";

import { useEffect, useRef } from "react";

// The signature moment: the forge reacts to your presence. The ambient amber
// glow drifts toward the cursor and a soft light warms the hairline grid under
// it. Pointer moves are rAF-throttled and only write CSS custom properties, so
// the actual motion is GPU-composited (transform + a gradient position). Under
// prefers-reduced-motion the tracking never attaches and the CSS falls back to
// the static ambient glow (see globals.css).
export function HeroForge() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = ref.current;
    const section = layer?.parentElement;
    if (!layer || !section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Skip on coarse pointers: there is no hovering cursor to react to, and it
    // avoids needless work on phones (see the mobile skill).
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let raf = 0;
    let px = 50;
    let py = 40;

    const apply = () => {
      raf = 0;
      const rect = section.getBoundingClientRect();
      // Glow drift: a fraction of the cursor's offset from the layer centre,
      // capped so it stays an ambient drift, not a cursor-follower.
      const gx = ((px - 50) / 100) * rect.width * 0.18;
      const gy = ((py - 44) / 100) * rect.height * 0.18;
      layer.style.setProperty("--gx", `${gx.toFixed(1)}px`);
      layer.style.setProperty("--gy", `${gy.toFixed(1)}px`);
      layer.style.setProperty("--mx", `${px.toFixed(1)}%`);
      layer.style.setProperty("--my", `${py.toFixed(1)}%`);
    };

    const onMove = (e: PointerEvent) => {
      const rect = section.getBoundingClientRect();
      px = ((e.clientX - rect.left) / rect.width) * 100;
      py = ((e.clientY - rect.top) / rect.height) * 100;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      px = 50;
      py = 40;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    section.addEventListener("pointermove", onMove);
    section.addEventListener("pointerleave", onLeave);
    return () => {
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div className="grid-field absolute inset-0" />
      <div className="hero-spotlight" />
      <div className="forge-glow" />
    </div>
  );
}
