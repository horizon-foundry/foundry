"use client";

import { useState, type KeyboardEvent } from "react";
import { ProductLockup } from "./brand/ProductLockup";
import { UnitBar } from "./brand/UnitBar";
import { SlideGlyph, type GlyphName } from "./SlideGlyph";

export type Slide = {
  category: string;
  heading: string;
  body: string;
  items?: string[];
  chips?: string[];
  // What the chips are, which decides how they are set: the three stage
  // words behind their unit bars, or commands to run in mono.
  chipKind?: "stages" | "commands";
  quote?: { text: string; attribution: string };
  glyph?: GlyphName;
};

type Props = {
  slides: Slide[];
  title: string;
  tagline: string;
  statChips: string[];
};

// The stage bars' order on Ink, the stage rail's own (components/StageRail).
const STAGE_FILL = ["slate", "amber", "bone"] as const;

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
    >
      {dir === "left" ? <path d="M10 3 5 8l5 5" /> : <path d="M6 3l5 5-5 5" />}
    </svg>
  );
}

// The Behind-the-Build overview deck: a cover + content slides, driven by
// buttons, dot indicators, or Left/Right arrows WHEN FOCUS IS INSIDE THE DECK.
// (A window-level listener hijacked arrows page-wide, and Up/Down fought the
// page scroll, so keys are scoped to the region and limited to Left/Right.)
//
// It is a frame on Ink (globals.css, "The frame"). The head row holds the
// slide's place (a mono count), its category (a label that names the slide,
// in the frame's head, never a line above the heading) and every control, so
// the controls stay put when one slide is taller than the last. Styles live
// in app/styles/behind.css.
export function SlideDeck({ slides, title, tagline, statChips }: Props) {
  const total = slides.length + 1;
  const [current, setCurrent] = useState(0);

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setCurrent((c) => Math.min(c + 1, total - 1));
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setCurrent((c) => Math.max(c - 1, 0));
    }
  }

  const prev = () => setCurrent((c) => Math.max(c - 1, 0));
  const next = () => setCurrent((c) => Math.min(c + 1, total - 1));

  const heading = current === 0 ? title : slides[current - 1].heading;
  const category = current === 0 ? null : slides[current - 1].category;

  return (
    <div
      role="region"
      aria-label={`${title}: overview deck`}
      onKeyDown={onKeyDown}
      className="frame dk"
    >
      {/* Announces slide changes to assistive tech without moving focus. */}
      <p aria-live="polite" className="sr-only">
        Slide {current + 1} of {total}: {heading}
      </p>

      <div className="dk-head">
        <p className="dk-place" aria-hidden="true">
          <span className="meta dk-count">
            {current + 1} / {total}
          </span>
          {category && <span className="label">{category}</span>}
        </p>
        <div className="dk-ctl">
          <button
            type="button"
            onClick={prev}
            disabled={current === 0}
            className="dk-step"
          >
            <Chevron dir="left" />
            {/* Icon-only below sm: nine 24px dots and two 44px buttons make
                304px, which fits the row a 360 phone leaves. */}
            <span className="sr-only sm:not-sr-only">Prev</span>
          </button>
          {/* Each dot's button IS its target: 24px wide (WCAG 2.5.8) and 44px
              tall, side by side with no gap, so no two targets can overlap. An
              expanded ::before hit area overlapped its neighbour here and sent
              7 of 9 taps to the next slide. */}
          <div className="dk-dots" role="group" aria-label="Go to slide">
            {Array.from({ length: total }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                className="dk-dot"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === current ? "true" : undefined}
              >
                <span aria-hidden="true" />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={next}
            disabled={current === total - 1}
            className="dk-step"
          >
            <span className="sr-only sm:not-sr-only">Next</span>
            <Chevron dir="right" />
          </button>
        </div>
      </div>

      <div className="dk-body">
        {/* The cover: the product lockup stands where a title would. */}
        <div className="dk-slide dk-cover stagger-rise" hidden={current !== 0}>
          <h2 className="dk-cover-title">
            <span className="hidden sm:inline-flex">
              <ProductLockup ground="dark" markHeight={56} />
            </span>
            <span className="inline-flex sm:hidden">
              <ProductLockup ground="dark" markHeight={34} />
            </span>
          </h2>
          <p className="d-statement">{tagline}</p>
          <ul className="dk-stats">
            {statChips.map((chip) => (
              <li key={chip} className="label">
                {chip}
              </li>
            ))}
          </ul>
        </div>

        {slides.map((slide, i) => (
          <div
            key={slide.heading}
            className="dk-slide stagger-rise"
            hidden={current !== i + 1}
          >
            <div className="dk-top">
              <h3 className="d-statement">{slide.heading}</h3>
              {slide.glyph && (
                <div className="dk-glyph">
                  <SlideGlyph name={slide.glyph} />
                </div>
              )}
            </div>
            <p className="dk-text">{slide.body}</p>
            {slide.items && (
              <ul className="dk-items">
                {slide.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            )}
            {slide.chips && slide.chipKind === "stages" && (
              <ul className="dk-stages">
                {slide.chips.map((c, n) => (
                  <li key={c}>
                    <UnitBar fill={STAGE_FILL[n % STAGE_FILL.length]} />
                    {c}
                  </li>
                ))}
              </ul>
            )}
            {slide.chips && slide.chipKind !== "stages" && (
              <ul className="dk-cmds">
                {slide.chips.map((c, n) => (
                  <li key={c}>
                    {n === 0 && <UnitBar fill="amber" />}
                    {c}
                  </li>
                ))}
              </ul>
            )}
            {slide.quote && (
              <figure className="dk-quote">
                <blockquote>&ldquo;{slide.quote.text}&rdquo;</blockquote>
                <figcaption className="label">
                  {slide.quote.attribution}
                </figcaption>
              </figure>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
