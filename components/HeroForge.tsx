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
// What this replaced: an amber radial glow softened by 28px on a 7s breathe,
// plus a bone spotlight that transitioned a gradient POSITION under the cursor.
// Neither utility is named here, deliberately. Tailwind scans this file's whole
// text, comments included, so naming a utility in a sentence about DELETING it
// regenerates it: the first cut of this comment shipped two such rules, which is
// the defect the source scoping in app/globals.css exists to fix. The full story
// is in NOTES.md under 2026-09-22, where prose costs nothing.
// Both are glows, which DESIGN.md's anti-goals ban, and the amber one put hue
// on the brand layer where only an invocable command belongs. Two rendered
// critics that saw nothing but a screenshot and the anti-goals called it
// decoration, and the kicker measured 2.94:1 against AA's 4.5:1 underneath it.
//
// Everything here writes CSS custom properties that drive `transform` only, so
// the motion composites. The pointer handler performs no layout read of its
// own: every read happens inside the rAF, which is what keeps a synchronous
// layout off the hero's hot path. Scroll and resize schedule that frame and
// measure nothing themselves.

// The lattice fits the band rather than the band fitting a fixed cell, so what
// lives here is how MANY graduations there are, never how many pixels apart
// they sit. The pixels come from the measured box every frame. A hardcoded 56
// here against `3.5rem` in app/globals.css agreed only at a 16px root font
// size; at Chrome's "Large" the two drifted and the reading landed between
// graduations, which is exactly the failure the comment it replaced warned
// about while causing it.
const COLUMNS = 9;
const ROWS = 3;

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
    // The third gate, and the one the first cut forgot: below this the band is
    // display:none, so there is nothing to read. Without it the listeners
    // attached anyway and a zero-width rect made the column zero, which wrote
    // `--cx: NaNpx`. It mirrors the media query in app/globals.css.
    const wide = window.matchMedia("(min-width: 64rem)");
    // The fourth gate, mirroring the last media query in app/globals.css that
    // decides whether the band exists at all. Without it the component measured
    // the band once per frame while hovering, in a mode where it is display:none
    // and can never render.
    const forced = window.matchMedia("(forced-colors: active)");

    let raf = 0;
    let inside = false;
    let px = 0;
    let py = 0;
    let lastCx = "";
    let lastCy = "";

    const apply = () => {
      raf = 0;
      // Measured every frame, deliberately, having tried the alternative. A
      // cached rect with a stale flag set from enter/resize/scroll is one read
      // per frame cheaper and wrong in two ways that a rAF read is not. Coming
      // back across the breakpoint, the last pre-crossing measure had cached
      // the display:none band's ZERO rect and cleared the flag, so the guard
      // below returned on every frame afterwards and the crosshair was dead
      // until a scroll. And a font swap moves the band 8px with no resize and
      // no scroll, so nothing marked the rect stale and the reading sat a whole
      // row from the cursor while still landing on a graduation, which is the
      // worse failure for something whose claim is that it measures. This read
      // is inside the frame, before any write, and only while hovering: the
      // property the first cut broke (a forced layout per scroll event, paid on
      // every visit rather than on hover) is preserved by the scheduling, not
      // by the cache.
      const rect = field.getBoundingClientRect();
      // A zero rect means the band is not rendered, and dividing by it is what
      // produced `--cx: NaNpx` below the breakpoint.
      if (!rect.width || !rect.height) return;
      const x = px - rect.left;
      const y = py - rect.top;
      // Off the surface, there is no scale and so no reading. On it, snap to
      // the nearest graduation: a line that follows the cursor is a
      // cursor-follower, one that lands on a graduation is a measurement.
      //
      // `inside` is why the leave sticks. The flag used to be derived from the
      // coordinate alone, so a pointerleave that shared a task with the last
      // pointermove (every tap on a touch laptop, and a fast mouse exit) set
      // live=false and then this frame recomputed it as true from coordinates
      // that were still in the band. The crosshair latched on with no pointer
      // on the page until the next scroll.
      const on = inside && x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
      crosshair.dataset.live = on ? "true" : "false";
      if (!on) return;
      const column = rect.width / COLUMNS;
      // The row comes from the box, not from a constant. `3.5rem` and a
      // hardcoded 56 agree only at a 16px root font size; at Chrome's "Large"
      // (20px) the band is 210px of three 70px rows while the snap still
      // stepped by 56, putting the reading up to 28px off a drawn line. The
      // band's height is exactly ROWS rows by construction (10.5rem / 3.5rem),
      // so dividing is exact at any font size and there is one source of truth.
      const row = rect.height / ROWS;
      // Unclamped, on purpose. Rounding admits one index past the last lattice
      // line on each axis (9 and 3), and those are real graduations: the panel's
      // right border and its top border, drawn in the same colour the lattice
      // uses. Clamping them away was the first fix for a CLIPPING problem, and
      // it cost the instrument its meaning: the bottom half of the band all
      // reported one value, and a pointer 1px above the panel's border had its
      // reading drawn 56px away from it. The band is no longer clipped
      // (app/globals.css), so the line can land on those two borders and every
      // zone is a half-cell at the ends and a full cell in between, which is
      // what snapping to the NEAREST graduation means.
      const cx = `${Math.round(x / column) * column}px`;
      const cy = `${Math.round(y / row) * row}px`;
      // Only on change: snapping leaves the value identical for 55 of every 56
      // pixels of travel, and each write invalidates style on three children.
      if (cx !== lastCx) {
        crosshair.style.setProperty("--cx", cx);
        lastCx = cx;
      }
      if (cy !== lastCy) {
        crosshair.style.setProperty("--cy", cy);
        lastCy = cy;
      }
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };

    const onMove = (e: PointerEvent) => {
      // A move on the section IS the pointer being inside it, so this does not
      // depend on having seen the pointerenter. It matters after the band is
      // re-attached on the way back across the breakpoint: attach() cannot know
      // whether the pointer is already in the section, no pointerenter is
      // coming for a pointer that never left, and deriving `inside` from the
      // enter alone left the crosshair dead until the visitor exited the whole
      // hero and came back.
      inside = true;
      px = e.clientX;
      py = e.clientY;
      schedule();
    };
    const onEnter = (e: PointerEvent) => {
      // Seeds the coordinate and schedules; it does NOT assert live. The first
      // cut set live unconditionally, which lit the crosshair at the PREVIOUS
      // reading's coordinates before this entry had produced one.
      inside = true;
      px = e.clientX;
      py = e.clientY;
      schedule();
    };
    const onLeave = () => {
      inside = false;
      // Cancelled, not just overwritten: a frame already scheduled would
      // otherwise run after this and decide for itself.
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      crosshair.dataset.live = "false";
    };
    const onViewportChange = () => {
      schedule();
    };

    let attached = false;
    const attach = () => {
      if (
        attached ||
        reduced.matches ||
        coarse.matches ||
        forced.matches ||
        !wide.matches
      )
        return;
      attached = true;
      section.addEventListener("pointerenter", onEnter);
      section.addEventListener("pointermove", onMove);
      section.addEventListener("pointerleave", onLeave);
      // A cancel ends the interaction as surely as a leave does. A real one is
      // followed by pointerleave anyway, so this is for the scripted case, where
      // `inside` would otherwise stay true and the next scheduled frame would
      // light the crosshair with no pointer present.
      section.addEventListener("pointercancel", onLeave);
      window.addEventListener("resize", onViewportChange, { passive: true });
      window.addEventListener("scroll", onViewportChange, { passive: true });
    };
    const detach = () => {
      if (!attached) return;
      attached = false;
      inside = false;
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      crosshair.dataset.live = "false";
      section.removeEventListener("pointerenter", onEnter);
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
      section.removeEventListener("pointercancel", onLeave);
      window.removeEventListener("resize", onViewportChange);
      window.removeEventListener("scroll", onViewportChange);
    };

    // Read once AND listen: the previous version read these at mount only, so
    // turning reduced motion on, or plugging in a mouse, changed nothing until
    // the next navigation.
    const onPreferenceChange = () => {
      if (reduced.matches || coarse.matches || forced.matches || !wide.matches)
        detach();
      else attach();
    };
    reduced.addEventListener("change", onPreferenceChange);
    coarse.addEventListener("change", onPreferenceChange);
    wide.addEventListener("change", onPreferenceChange);
    forced.addEventListener("change", onPreferenceChange);
    onPreferenceChange();

    return () => {
      detach();
      reduced.removeEventListener("change", onPreferenceChange);
      coarse.removeEventListener("change", onPreferenceChange);
      wide.removeEventListener("change", onPreferenceChange);
      forced.removeEventListener("change", onPreferenceChange);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Renders nothing. The band and its crosshair are laid out beside the panel
  // in app/page.tsx, where the geometry can be structural; this component is
  // the behaviour that reads the pointer onto them.
  return <div ref={ref} className="hidden" aria-hidden="true" />;
}
