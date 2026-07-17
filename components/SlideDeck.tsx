"use client";

import { useState, type KeyboardEvent } from "react";
import { BrandMark } from "./Wordmark";
import { SlideGlyph, type GlyphName } from "./SlideGlyph";

export type Slide = {
  category: string;
  heading: string;
  body: string;
  items?: string[];
  chips?: string[];
  quote?: { text: string; attribution: string };
  glyph?: GlyphName;
};

type Props = {
  slides: Slide[];
  title: string;
  tagline: string;
  statChips: string[];
};

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className="size-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {dir === "left" ? <path d="M10 3 5 8l5 5" /> : <path d="M6 3l5 5-5 5" />}
    </svg>
  );
}

// The Behind-the-Build overview deck: a title slide + content slides, driven by
// buttons, dot indicators, or Left/Right arrows WHEN FOCUS IS INSIDE THE DECK.
// (A window-level listener hijacked arrows page-wide, and Up/Down fought the
// page scroll, so keys are scoped to the region and limited to Left/Right.)
// Fixed template (top-aligned header, bottom-anchored quote) so nothing jumps
// between slides.
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

  return (
    <div
      role="region"
      aria-label={`${title}: overview deck`}
      onKeyDown={onKeyDown}
      className="flex min-h-[460px] flex-1 select-none flex-col border border-line bg-ink-raised"
    >
      {/* Announces slide changes to assistive tech without moving focus. */}
      <p aria-live="polite" className="sr-only">
        Slide {current + 1} of {total}: {heading}
      </p>
      <div className="flex min-h-0 flex-1 overflow-y-auto px-6 py-9 sm:px-10">
        {/* Title slide (centered: a cover page) */}
        <div
          className={`mx-auto w-full max-w-2xl flex-col justify-center ${current !== 0 ? "hidden" : "flex"}`}
        >
          <div className="stagger-rise space-y-5 text-center">
            <div className="flex justify-center text-bone">
              <BrandMark className="h-12 w-auto" />
            </div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-bone-faint">
              Behind the Build · Overview
            </p>
            <h2 className="font-display text-4xl font-semibold tracking-tight text-bone">
              {title}
            </h2>
            <p className="mx-auto max-w-xl leading-relaxed text-bone-dim">
              {tagline}
            </p>
            <div className="flex flex-wrap justify-center gap-2 pt-1">
              {statChips.map((chip) => (
                <span
                  key={chip}
                  className="inline-flex items-center border border-line bg-ink px-2.5 py-1 font-mono text-xs text-bone-dim"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Content slides */}
        {slides.map((slide, i) => (
          <div
            key={slide.heading}
            className={`mx-auto min-h-full w-full max-w-3xl flex-col ${current !== i + 1 ? "hidden" : "flex"}`}
          >
            <div className="stagger-rise flex min-h-full flex-1 flex-col space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 pt-1">
                  <span className="draw-rule h-px w-8 bg-signal" />
                  <span className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-bone">
                    {slide.category}
                  </span>
                </div>
                {slide.glyph && (
                  <div className="h-10 w-10 shrink-0 sm:h-12 sm:w-12">
                    <SlideGlyph name={slide.glyph} />
                  </div>
                )}
              </div>
              <h3 className="font-mono text-2xl font-semibold leading-tight tracking-tight text-bone sm:text-3xl">
                {slide.heading}
              </h3>
              <p className="max-w-2xl leading-relaxed text-bone-dim">
                {slide.body}
              </p>
              {slide.items && (
                <ul className="space-y-2 pt-1">
                  {slide.items.map((it) => (
                    <li
                      key={it}
                      className="flex gap-2.5 text-sm leading-relaxed text-bone-dim"
                    >
                      <span
                        className="mt-2 h-px w-3 shrink-0 bg-line-strong"
                        aria-hidden="true"
                      />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              )}
              {slide.chips && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {slide.chips.map((c) => (
                    <span
                      key={c}
                      className="border border-line px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-wide text-bone-dim"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              )}
              {slide.quote && (
                <figure className="mt-auto border-t border-line pt-4">
                  <blockquote className="font-serif text-sm italic leading-relaxed text-bone-dim">
                    &ldquo;{slide.quote.text}&rdquo;
                  </blockquote>
                  <figcaption className="mt-1.5 font-mono text-[0.65rem] uppercase tracking-wide text-bone-faint">
                    {slide.quote.attribution}
                  </figcaption>
                </figure>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Nav bar */}
      <div className="flex items-center justify-between border-t border-line px-4 py-3">
        <button
          type="button"
          onClick={prev}
          disabled={current === 0}
          className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-bone-dim transition-colors hover:text-bone disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Chevron dir="left" />
          Prev
        </button>
        <div
          className="flex items-center gap-1.5"
          role="group"
          aria-label="Go to slide"
        >
          {Array.from({ length: total }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              className={`relative h-1.5 transition-all before:absolute before:-inset-2.5 before:content-[''] ${
                i === current
                  ? "w-5 bg-signal"
                  : "w-1.5 bg-line-strong hover:bg-bone-faint"
              }`}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === current ? "true" : undefined}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={next}
          disabled={current === total - 1}
          className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-bone-dim transition-colors hover:text-bone disabled:cursor-not-allowed disabled:opacity-30"
        >
          Next
          <Chevron dir="right" />
        </button>
      </div>
    </div>
  );
}
