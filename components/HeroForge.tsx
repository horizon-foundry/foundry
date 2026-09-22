"use client";

import { useEffect, useRef } from "react";

// The hero's grid is a measuring surface, and this is what makes it measure:
// the pointer's position on it, snapped to the nearest graduation, drawn as a
// crosshair with a registration tick at the crossing.
//
// Snapping is the idea, not an implementation detail. A line that follows the
// cursor is a cursor-follower, which every generated page ships; a line that
// jumps to the nearest graduation is an instrument reading a coordinate, which
// is what this product is about. The motion is a settle, not a chase.
//
// What this replaced: an amber radial glow with a 28px blur on a 7s breathe,
// plus a bone spotlight that transitioned a gradient POSITION under the cursor.
// Both are glows, which DESIGN.md's anti-goals ban, and the amber one put hue
// on the brand layer where only an invocable command belongs. Two rendered
// critics that saw nothing but a screenshot and the anti-goals called it
// decoration, and the kicker measured 2.94:1 against AA's 4.5:1 underneath it.
//
// Everything here writes CSS custom properties that drive `transform` only, so
// the motion composites. The pointer handler performs no layout read: the
// rect is cached on enter and refreshed on resize and scroll, because reading
// it per event forced a synchronous layout on the hero's hot path.

// The lattice fits the band rather than the band fitting a fixed cell: nine
// columns across its width, rows of one module (app/globals.css). Both numbers
// live here too, and the crosshair lands on nothing if they drift apart.
const COLUMNS = 9;
const ROW = 56;

export function HeroForge() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = ref.current;
    const section = layer?.parentElement;
    // The field is the element the reading is taken ON, so it is what the
    // pointer is measured against: the surface bounds the coordinate space,
    // which is why the crosshair can simply stop reporting off-field instead
    // of drawing lines across a page with no scale on it.
    // The band is rendered beside the panel it measures (app/page.tsx), not by
    // this component: its geometry is the layout's, so nothing here positions
    // anything. This only reads the pointer and reports a coordinate.
    const field = section?.querySelector<HTMLElement>(".hero-field");
    // The custom properties ride the layer (they inherit down to the lines),
    // but visibility is the CROSSHAIR's own state, and setting it on the layer
    // instead is a bug a build cannot see: everything renders, nothing appears.
    const crosshair = section?.querySelector<HTMLElement>(".grid-crosshair");
    if (!layer || !section || !field || !crosshair) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    // No hovering cursor to read on a touch screen, so there is no coordinate
    // to report and no work worth doing (see the mobile skill).
    const coarse = window.matchMedia("(pointer: coarse)");

    let raf = 0;
    let rect: DOMRect | null = null;
    let px = 0;
    let py = 0;

    const measure = () => {
      rect = field.getBoundingClientRect();
    };

    const apply = () => {
      raf = 0;
      if (!rect) return;
      const x = px - rect.left;
      const y = py - rect.top;
      // Off the surface, there is no scale and so no reading. On it, snap to
      // the nearest graduation: a line that follows the cursor is a
      // cursor-follower, one that lands on a graduation is a measurement.
      // Off the band there is no scale, so there is no reading.
      const on = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
      crosshair.dataset.live = on ? "true" : "false";
      if (!on) return;
      const column = rect.width / COLUMNS;
      crosshair.style.setProperty("--cx", `${Math.round(x / column) * column}px`);
      crosshair.style.setProperty("--cy", `${Math.round(y / ROW) * ROW}px`);
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };

    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      schedule();
    };
    const onEnter = () => {
      measure();
      crosshair.dataset.live = "true";
    };
    const onLeave = () => {
      crosshair.dataset.live = "false";
    };
    const onViewportChange = () => {
      measure();
      schedule();
    };

    let attached = false;
    const attach = () => {
      if (attached || reduced.matches || coarse.matches) return;
      attached = true;
      section.addEventListener("pointerenter", onEnter);
      section.addEventListener("pointermove", onMove);
      section.addEventListener("pointerleave", onLeave);
      window.addEventListener("resize", onViewportChange, { passive: true });
      window.addEventListener("scroll", onViewportChange, { passive: true });
    };
    const detach = () => {
      if (!attached) return;
      attached = false;
      crosshair.dataset.live = "false";
      section.removeEventListener("pointerenter", onEnter);
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onViewportChange);
      window.removeEventListener("scroll", onViewportChange);
    };

    // Read once AND listen: the previous version read these at mount only, so
    // turning reduced motion on, or plugging in a mouse, changed nothing until
    // the next navigation.
    const onPreferenceChange = () => {
      if (reduced.matches || coarse.matches) detach();
      else attach();
    };
    reduced.addEventListener("change", onPreferenceChange);
    coarse.addEventListener("change", onPreferenceChange);
    onPreferenceChange();

    return () => {
      detach();
      reduced.removeEventListener("change", onPreferenceChange);
      coarse.removeEventListener("change", onPreferenceChange);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Renders nothing. The band and its crosshair are laid out beside the panel
  // in app/page.tsx, where the geometry can be structural; this component is
  // the behaviour that reads the pointer onto them.
  return <div ref={ref} className="hidden" aria-hidden="true" />;
}
