---
name: mobile
description: Use when building or fixing a mobile, touch, or small-screen experience, when a layout breaks on a phone, or when a feature was designed on desktop and needs to hold up on a real device. Covers touch vs pointer, the keyboard, overscroll, safe areas, viewport units, and the pressure-test loop that gets to a good mobile result.
---

# mobile

> **Using this skill:** announce "Using mobile", make a todo per step below, and do not skip the gates. This skill's worth is its process, not a hand-reproduced outcome. If you were told to "run mobile", run it, do not improvise the result. (Suite standard: https://github.com/horizon-foundry/foundry/blob/main/reference/skill-authoring.md)

## Overview

This is a ship gate where a mobile surface exists. You do not ship a product people will hold in their hands until the mobile experience is solved. `production-audit` treats a core flow that breaks on a phone as a launch blocker.

**Not every product has a mobile surface.** A headless service, a CLI, a desktop-only internal tool: for those, the honest gate status is `not-applicable` with a one-line reason (the same status `production-audit`'s shipGates carry). Do not invent work. Declare the status and move on.

Desktop-designed UI does not degrade gracefully to a phone. It breaks in specific, repeatable ways. The core discipline is not a list of CSS fixes. It is a loop: **reproduce the exact reported state and instrument it before you change anything.** The most common mobile failure is not the bug itself. It is misdiagnosing the bug and fixing the wrong mechanism. Everything below the loop is a catalog of **diagnostic candidates**: the usual suspects the probe confirms or clears, never fixes to apply blind.

## The pressure-test loop

1. **Reproduce the exact state, untouched.** Load the surface at a real device width and look before you touch. If the report is "on first load X happens", capture first-load-untouched, not the state after you interact.
2. **Instrument before diagnosing.** Read the actual mechanism, not the symptom. `document.activeElement` (is something autofocused?), scroll position (did the page scroll to an input?), `getComputedStyle`, and `matchMedia('(pointer: coarse)').matches`. A white bar or a scrolled page has several possible causes. Confirm which one before fixing. Fixing the plausible cause instead of the real one is the biggest mobile time sink.
3. **Verify at a real device width.** 393px (a Pixel-class width) is the working verification width. Check **zero horizontal overflow** (`document.documentElement.scrollWidth <= innerWidth`) on every state, including any fullscreen/overlay.
4. **Close the loop on a real device.** Headless Chromium cannot emulate a real soft keyboard or a coarse pointer. Force `matchMedia` to exercise the coarse branches in automation. But treat anything involving the keyboard, autofill, or touch gestures as unverified until a real device confirms it. A real-device screenshot only confirms a captured layout state; it cannot confirm a gesture, the software keyboard's behavior, autofill, or a focus transition, which need a real interaction pass. Match the evidence to the claim: say what a screenshot actually proved, and say what still needs hands on a device, rather than claiming it works.

## Touch is not mouse

Branch behavior on input capability. Do not assume one input model. `(pointer: coarse)` is the working probe, with a caveat: it detects the primary pointer, not "a phone". Touch laptops and tablets with keyboards carry both input kinds. So treat it as "touch is likely", confirm with the instrumentation step, and never use it to hide functionality:

- **Never grab focus unsolicited on a coarse pointer.** Autofocusing an input on mount pops the keyboard and autofill and scrolls the page before the user acts. On a coarse pointer, do not autofocus at all: let the keyboard open on the user's tap. `focus({ preventScroll: true })` stops the scroll jump but not the keyboard pop, so it is a mitigation for the rare justified autofocus, not a blanket rule.
- **Desktop-only event bindings silently break on touch.** `wheel`, `mouseenter`, `hover` never fire the same way (or at all) on touch. Prefer Pointer Events (`pointerdown`/`pointermove`), which unify mouse, touch, and pen so one path covers all of them. Where a legacy `wheel`/`mouse*` binding is unavoidable, add a parallel `touchstart`/`touchmove` path feeding the same logic and keep the two in sync.
- **Put hover states in CSS, not JS**, or touch devices get stuck in hover.
- **Gestures differ by input.** A precise pointer can afford a deliberate two-step gesture. A thumb wants a single decisive swipe. Tune per input type.

## The usual suspects (diagnose, then fix)

Each of these is a candidate cause to check against the probe, with its tradeoff named. None is a rule to apply unprompted:

- **Overscroll / rubber-band:** when an overlay or gesture surface misbehaves, suspect scroll chaining. The fix is `overscroll-behavior: none` on the relevant scroll container (plus a body-lock class during overlays). It has a real cost: on `html`/`body` it also kills pull-to-refresh, which users expect on content pages. Contain it to the surfaces that need it. Only go global deliberately.
- **The keyboard occluding bottom-docked controls:** prefer the no-JS path. Set `interactive-widget=resizes-content` in the viewport meta, so the keyboard shrinks the layout viewport and your `bottom: 0` controls ride above it. Reach for a `visualViewport` height sync only if that is not enough.
- **Treat `100vw` as a suspect, not an automatic bug.** It overflows when a classic scrollbar gutter exists (desktop, some Android settings), because it measures the viewport including the scrollbar. When the probe shows `scrollWidth > innerWidth`, check for it. Where it is confirmed as the mechanism, `left: 0; right: 0` (or `100%`) is the fix.
- **Fixed heights clip content** on small screens. Prefer `height: auto` (or `min-height`) below your breakpoint.
- **Viewport height:** `100vh` is inconsistent on mobile (browser chrome is counted differently across browsers and scroll states). Where a full-viewport height is genuinely needed, use `100dvh`. Often the better fix is to not need a full-viewport height.
- **Safe areas:** on notched devices, pad with `env(safe-area-inset-*)` and set `viewport-fit=cover` when content goes edge to edge.

## Touch targets

Interactive controls target **44px** (the iOS minimum). For a small visual glyph, keep the glyph small and expand the hit area with padding plus negative margin (or a `::before { position:absolute; inset:-N }`). The tap target is then 44px while the visible pixels stay small, and it is snapshot-safe.

## Prefer mechanisms that stay out of fragile code

When a fix touches a surface with animation, FLIP, or gesture physics, prefer the CSS-only or declarative mechanism (a body-lock class, `interactive-widget`, `overscroll-behavior`) over JS that threads into the physics. The mobile fix should be additive and removable, not entangled.

## iOS Safari caveats

Where the product supports iOS, verify separately on it. Android + Chromium is not a proxy, so a product that ships to both platforms checks both; one scoped to a single managed platform checks that one and says so. Known differences: `overscroll-behavior` is Safari 16+; `body { overflow: hidden }` does not fully lock iOS (you may need a `position: fixed` body lock that preserves scroll position); `interactive-widget` support varies; `100dvh` and a `visualViewport` sync are often needed where Android was fine.

## The verification matrix

One width is a spot check, not verification. When mobile is a release gate, walk the **core flows** through:

| Axis | Check |
|---|---|
| Widths | Narrow (~360px), standard (~393px), large (~430px); zero horizontal overflow at each |
| Orientation | Landscape on the standard width; nothing clipped, overlays still usable |
| Text zoom | OS/browser text size raised (~200%); layouts reflow, nothing truncates into meaninglessness |
| Software keyboard | Open on every input in the flow; the focused field and the submit affordance both visible |
| Keyboard-only | The flow completes without touch (external keyboard users, switch access) |
| Real devices | Follow the product's declared support matrix: for a product that supports both, one pass on real iOS Safari AND one on real Android Chrome; a product scoped to one managed platform verifies that one and records the scope. Emulators do not exercise the soft keyboard, autofill, or scroll physics |

Anything the run could not cover is reported as unverified, with the check to run. This is the same honesty rule the audit uses. "Works on mobile" with an untested matrix row is a claim, not a result.

## Red flags

- Fixing a symptom before reading `document.activeElement` / scroll position -> you are probably fixing the wrong mechanism.
- Applying the suspect catalog as blanket rules (global `overscroll-behavior: none`, mechanical `100vw` bans) -> diagnose first; each fix has a named tradeoff and needs its mechanism confirmed.
- A gesture or exit bound to `wheel`/`mouseover` only -> it is a trap on touch; add the parallel touch path.
- Autofocus on mount -> keyboard-pop and page-scroll on coarse pointers.
- "Works on mobile" after testing only headless Chromium or one width -> the matrix is the bar; say what was not covered.
- Inventing mobile work for a product with no mobile surface -> declare the gate not-applicable with the reason.
