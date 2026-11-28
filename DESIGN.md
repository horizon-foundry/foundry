---
name: Foundry Skills
description: The dark instrument. A dark tool in the Horizon Foundry language that hands over a White printed verdict
colors:
  # The company's four, inherited (Horizon Foundry BRAND.md, Inheritance).
  ink: "#14191F"
  bone: "#E8ECF0"
  slate: "#334455"
  amber: "#D99A2E"
  # Support values, the company site's own: one light ground, two text tints.
  white: "#FFFFFF"
  fog: "#9AA4B0"
  mist: "#C9D0D8"
  # This product's extension: severity and verdict.
  critical: "#FF5C5C"
  high: "#FF9F45"
  medium: "#F5CE4B"
  low: "#5AB0E6"
  informational: "#8B93A0"
  verdict-safe: "#3FCB7A"
  verdict-risk: "#F5CE4B"
  verdict-noship: "#FF5C5C"
typography:
  title:
    fontFamily: "Zalando Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: "5.25rem"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "-0.015em"
  heading:
    fontFamily: "Zalando Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: "3.5rem"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "-0.015em"
  statement:
    fontFamily: "Zalando Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: "2.625rem"
    fontWeight: 900
    lineHeight: 1.08
    letterSpacing: "-0.015em"
  subheading:
    fontFamily: "Zalando Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  lead:
    fontFamily: "Zalando Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "Zalando Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.5
  small:
    fontFamily: "Zalando Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.96875rem"
    fontWeight: 400
    lineHeight: 1.5
  nav:
    fontFamily: "Zalando Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.25
  label:
    fontFamily: "Zalando Sans, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.14em"
  command:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.4
  meta:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  none: "0px"
spacing:
  unit: "4px"
  gutter: "72px"
  gutter-phone: "20px"
  content: "1296px"
  heading-column: "420px"
  column-gap: "52px"
  header: "64px"
  rule: "2px"
  target: "44px"
---

# Foundry Skills design system

This is the design system of the Foundry Skills site, and the `impeccable` source of truth for it. It describes the site as the code builds it (`app/globals.css`, `app/styles/`, `components/`). Where this file and the code disagree, the code is right and this file is repaired.

**What this file owns, and what it borrows** (decision of record, the company's BRAND.md, Inheritance, 2026-09-21). The identity is Horizon Foundry's: the HF mark and the form of its lockup, the four colors (Ink `#14191F`, Bone `#E8ECF0`, Slate `#334455`, Amber `#D99A2E`), Zalando Sans as the display and wordmark face, the bar, and the rule that amber only ever fills a bar. They are inherited as they are and never redefined here. The company's own files are the authority on them, and `reference/brand-kit.json` pins every path and file this repo copied. White, Fog and Mist are the company site's support values, used here the same way. What this product owns is its extension: the verdict sheet, the mono voice, the command well, and the severity and verdict hues. [BRAND.md](BRAND.md) lists both halves for a reader; this file says how each is built.

The direction is "the dark instrument", chosen by Craig Martin on 2026-11-27: "it's developer tooling and most devs prefer dark mode". The mark, the display face and the color rules that the site carried before that date are retired, and `make validate` fails on any of them (Gates, below).

## Overview

A dark tool that hands you a paper verdict. The site is dark, as developer tools are: two flat grounds, Ink and Slate, with Bone type in one heavy family. On that dark ground lies one light object, the verdict, set as a White printed sheet with Ink type and 2px Ink rules. The largest thing on the first screen of the home page is the real verdict of the published self-audit.

The site is read by a person who builds software with an AI in the loop, often in a terminal, who wants to know what the suite does and whether to trust it. The page answers with the product's own output and not with a claim: a command to run, and the verdict a run ends in.

Two voices share a page and never trade places. **Zalando Sans** speaks: every heading and every sentence. **IBM Plex Mono** prints: a command, a path, a date, a commit, a count, a value from a report. A page from this site is told from a page of the company's by three things the company's site does not have: the White sheet, the mono voice, and the command well behind its amber unit bar. It opens on Slate where the company's opens on Ink.

The page is calm and flat. No gradient, no shadow, no radius, no film grain, no tint of a color. Depth is the change of ground and the rule.

## Colors

Seven values and two product scales. Nothing else is a color on this site.

| Token | Value | Use |
|---|---|---|
| Ink | `#14191F` | A ground. The header and the footer on every page. Every command well. Type on the sheet |
| Slate | `#334455` | The second ground. The rule on Ink. A page opens on it |
| Bone | `#E8ECF0` | Headings and text on both grounds. The rule on Slate. A filled button |
| Amber | `#D99A2E` | Fills a bar: the mark's bar, and the unit bar. Never text, never a border, never an outline, never a wash, never a glow |
| White | `#FFFFFF` | The verdict sheet, and nothing else. A button's hover |
| Mist | `#C9D0D8` | Body text on Ink and on Slate |
| Fog | `#9AA4B0` | Secondary text on Ink only |

**Grounds.** A section states its ground with `data-ground` (`ink`, `slate`, and `white` for the sheet), and the ground sets the text, rule and field colors for everything inside it through `--fg`, `--fg-2`, `--fg-3`, `--rule`, `--ledger`, `--field`, `--focus` and `--on-fg` (`app/globals.css`, "Grounds"). A component written with those reads right on every ground. Sections alternate Ink and Slate, flat, full bleed. Ink is the default. A page opens on Slate under the pinned Ink header.

Contrast, measured (WCAG ratio). This table is the contract: text is 4.5 to 1 or more.

| Pair | Ratio | Where |
|---|---|---|
| Bone on Ink | 14.88 | Headings and text on Ink |
| Mist on Ink | 11.36 | Body on Ink |
| Fog on Ink | 6.99 | Secondary text on Ink |
| Bone on Slate | 8.43 | Headings and text on Slate |
| Mist on Slate | 6.43 | Body on Slate |
| Ink on White | 17.67 | Type on the sheet |
| Slate on White | 10.01 | Secondary type on the sheet |
| Ink on Bone | 14.88 | A filled button's label |
| Ink on the safe green | 8.4 | The sheet's verdict word |
| Ink on the risk yellow | 11.6 | The sheet's verdict word |
| Ink on the no-ship red | 5.6 | The sheet's verdict word |

Known low pairs, each avoided or carried by something other than color:

- Fog on Slate is 3.96, so Fog text never sits on Slate. Slate has no third text color: `--fg-3` is Mist there.
- Slate against Ink is 1.77. A Slate rule on Ink and a Slate unit bar on Ink are told by their place and the word beside them, never by their edge alone. The stage rail's Slate, Amber and Bone bars sit only on Ink, because a Slate bar does not show on Slate.
- Amber on White is 2.44 and amber on Bone is 2.05, which is one reason amber is never text.

**Amber means a command you fire, and the meaning lives on the bar.** A command's type is Bone or Mist mono. Where it is the command to run, an amber unit bar stands in front of it. Amber was the color of command text until 2026-11-27. It only ever fills a bar now.

**Severity and verdict are this product's own extension.** Five severity hues (critical red, high orange, medium yellow, low blue, informational gray) and three verdict hues (safe green, risk yellow, no-ship red). A hue means a severity or a verdict and nothing else, so any saturated color a reader sees, other than the amber bar, is one of the two. On a dark ground a hue is the fill of a cell, or the color of a label inside a report view. On the White sheet a hue is only ever a fill under Ink type, with a 1px Ink edge on a cell, because yellow on White is 1.5 to 1.

**The report-excerpt rule.** Outside the report views, a severity or verdict hue appears only inside an element framed as a report excerpt: the verdict sheet, a `Frame` that excerpts the published self-audit, the report cards on `/reports`, and the specimens on the design-system page. The frame is what licenses the color. A hue on a heading, a label or a badge of a marketing page fails.

Selection is the text color on its ground, inverted. Focus is a 2px ring in `--focus` (Bone on a dark ground, Ink on the sheet) with a 3px offset. Neither is ever amber.

## Typography

**Zalando Sans** is the company's one family, at its natural width. The file is the company's weight-only instance (`app/fonts/ZalandoSans-wght.woff2`, width pinned to 100, weight 200 to 900), so the width axis cannot be set even by accident. `lib/fonts.ts` loads it through `next/font/local` as `--font-zalando`, and the theme's `--font-display` and `--font-sans` both resolve to it. The file carries no italic, so nothing is set in italic.

Four weights, each with one job:

- 900 (Black): display. Headings on the ramp, the lockup's words, the verdict word. Tracking `-0.015em`.
- 800 (Extrabold): mid headings. Tracking `-0.01em`.
- 600 (Semibold): labels, buttons, text links.
- 400 (Regular): running text.

**IBM Plex Mono** is this product's own voice, in 400 and 500. It sets a command, a file path, a date, a commit, a count, a finding ID and a report value: what a terminal or a report would print. It never sets a heading, a label or a sentence. Monospace as a costume for "technical" fails.

The ramp, in rem so it follows the font size a visitor sets. Steps with two values are fluid from the 390 phone to 1440 (`clamp()` in `app/globals.css`).

| Step | Desktop | Phone | Line height | Use |
|---|---|---|---|---|
| title | 84 | 44 | 1 | A page's h1, a stage's word |
| h2 | 56 | 38 | 1 | Section headings, the hub's h1 |
| statement | 42 | 30 | 1.08 | A statement line, a deck slide's heading, a design-system part |
| h3 | 24 | 21 | 1.15 | Mid headings (800) |
| lead | 20 | 18 | 1.5 | The paragraph under a heading |
| body | 17 | 17 | 1.5 | Text, buttons, text links |
| small | 15.5 | 15.5 | 1.5 | Notes, the footer's links |
| nav | 15 | 15 | 1.25 | Header links, tabs |
| label | 14 | 14 | 1.3 | Uppercase, 600, tracked `0.14em` |
| meta | 13 | 13 | 1.4 | Mono: a date, a commit, a count, a token's value |

The verdict word is not a ramp step. It is a drawing sized from its sheet: 18.5 percent of the sheet's width, so "Safe to" sits on one line at every width.

A label names a block (a column, a status, a slide's category in the deck's head row). It is never a kicker above a heading: a heading carries its own weight.

Long text is capped near 75 characters a line: 34rem for a lead, 38rem for a rendered doc.

## Layout

The frame is the company's. Design width is 1440 with a 72px gutter, fluid from 20px on a phone (`--gutter`). Above 1296px of content the content is capped and centered (`.wrap`); grounds run full bleed. Section padding is fluid from 64 to 104px (`--section-y`).

The header is one Ink band, 64px, pinned on every page and every ground. An anchor lands clear of it (`scroll-padding-top`).

Two-column sections are a 420px heading column, a 52px gap, then the content, from 1100 wide (68.75rem). Below that they stack with the heading on top. The hub's doc pages and the design-system page use it.

Rules, by ground: 2px Slate on Ink, 2px Bone on Slate, 2px Ink on the sheet. The line inside a dense figure (a ruled list's rows, a table's rows, a command list) is 1px in `--ledger`. A ruled list opens and closes with the 2px rule and divides its rows with the 1px line.

Targets are 44px or taller, and a target is its own box, never a pseudo-element grown past the control: grown areas overlap their neighbors and the later sibling takes the tap (the deck's dots opened the wrong slide on 7 of 9 that way until v0.2.1). A target that carries no text, such as a deck dot, is sized in px, because text-only zoom scales rem and would push a row of them off a phone. Nothing scrolls sideways at 390.

## Elevation & Depth

Flat. No shadow, no glow, no gradient, no tint and no film grain. Depth is the change of ground and the rule. The one object that lies "on" the page is the verdict sheet, and what puts it there is print, not a shadow: a registration tick stands off each corner in the ground's text color.

## Shapes

Square corners everywhere. Every radius token resolves to zero. The one rounded shape on the site is the browser tab icon's tile, which is the company's file as shipped.

### The mark and the lockup

The mark is the HF monogram (`components/brand/Mark.tsx`): viewBox `0 0 128 100`, the amber bar's path drawn first, then the body's. The body is Bone on a dark ground and Ink on a light one. The amber bar is a literal and is never recolored. The mark is never cropped and never redrawn. The paths in `components/brand/paths.ts` are copies of the company's, held by `reference/brand-kit.json`.

The product lockup (`components/brand/ProductLockup.tsx`) is the untouched mark, then FOUNDRY SKILLS in Zalando Sans Black capitals. It follows the company's one-line lockup: the capitals are 0.4 of the mark's height, the gap is 0.4 of it, the tracking is `0.05em`. It is live text, because its words are this product's. The header sets it with a 34px mark from 1024 wide and a 26px mark below; the footer uses 26px; the deck's cover uses 56px, and 34px on a phone.

The browser tab and home screen icons are the company's own files (an Ink tile, the Bone mark, the amber bar), byte copies under `public/`: `favicon.svg`, `favicon-16.png`, `-32`, `-48`, `apple-touch-icon-180.png`, `icon-192.png`, `icon-512.png`. The 16 is pixel-fitted, so nothing is scaled or generated. There is no `favicon.ico`, no maskable tile and no `mask-icon`: the company supplies none, and a one-color tint cannot keep the amber bar. The product shares the company's icon, so the two sites show the same tab icon.

### The bar

The bar is the company's one graphic device: a rectangle whose right edge is cut on the mark's diagonal, with the cut's run at 0.75 of the bar's height. This site uses only its small form, the unit bar (`components/brand/UnitBar.tsx`, viewBox `0 0 34 22`), at the size of a letter. It never carries text, and it has two jobs:

- Slate, Amber and Bone mark the three stages, Distill, Forge and Deliver, in that order, on Ink.
- Amber marks a command to run: in front of the command in a command well, and in front of a command that heads a section.

A bar added for decoration fails.

## Motion

Motion is a token system. Every duration is named for what the motion DOES, and a value is matched to a token by its job, never by the nearest number. A duration whose job matches no token is left alone and says so.

| Token | Value | What it is for |
| --- | --- | --- |
| `--transition-duration-tick` | 120ms | A press, a hover-out, a tick landing: acknowledgement |
| `--transition-duration-quick` | 220ms | A hover or focus state arriving |
| `--transition-duration-settle` | 420ms | An element arriving: a figure's rows revealing once |
| `--transition-duration-draw` | 600ms | A rule or a bar drawing itself in, once |
| `--ease` | `cubic-bezier(0.2, 0, 0, 1)` | The controls: a button, a copy control, a deck step (240ms) |
| `--ease-entrance` | `cubic-bezier(0.22, 1, 0.36, 1)` | Entrances and settles; the only easing with overshoot |
| `--ease-exit` | `cubic-bezier(0.4, 0, 0.2, 1)` | Exits and hover-outs; no overshoot on the way out |
| `--ease-draw` | `cubic-bezier(0.2, 0.7, 0.2, 1)` | An entrance whose end point is fixed, where overshoot would read as a bounce |
| `--default-transition-duration` | `var(--transition-duration-quick)` | Every bare `transition-*` utility |

The durations sit in the `--transition-duration-*` namespace because that is the one Tailwind v4 resolves the `duration-*` utility against. Named anything else, `class="duration-quick"` emits nothing, silently. Two raw values match no token and say so in the stylesheet: `.stagger-rise` (500ms) and `.glyph-draw` (900ms).

What moves, and why:

- **A figure reveals once.** A figure that starts below the fold arms itself and reveals when it scrolls into view: cells scale in, rows rise 8px, a bar draws to its width, and a stamp lands last because it is the figure's conclusion (`components/Reveal.tsx`). The server HTML is the final state, so with no script nothing is hidden.
- **A deck slide arrives.** Its lines rise in sequence and its glyph draws itself, once per slide change.
- **A control answers.** A button or a copy control changes its fill; a press moves 1px.

**Asymmetry is the default.** A close runs faster and quieter than an open. Overshoot belongs to entrances only. Motion that feels late loses duration before it gains delay, and a hover-out is never delayed.

**Reduced motion drops spatial movement and keeps the meaning.** It is not an off switch: feedback that confirms an action still has to read. Under it a figure does not arm, a slide shows at once, and a press is acknowledged by its border turning White.

### Motion anti-goals

- No ambient loop. Nothing breathes, pulses or drifts forever.
- No motion that animates a layout property or a gradient position.
- No parallax, no scroll-jacking, no cursor follower, no pointer reticle or crosshair.
- No motion carrying information that is not also carried by something static.
- No element that has to be argued for. A measuring band over the old hero was cut on 2026-09-23 for that reason, and the lesson stands: an element that can vanish on a phone with nothing lost was carrying nothing at 1440 either.

## Components

Shared primitives live at the end of `app/globals.css` ("The dark instrument: shared primitives"); a surface's own rules live in its sheet under `app/styles/`.

- **Site header** (`components/SiteHeader.tsx`): the pinned Ink band. The product lockup is the way home; three links at the nav size (the current page underlined 1.5px in Bone) and the Bone button to the repository. Under 48rem the links move into a Menu, a `details` element, so it opens with no script. Open, it is the whole screen under the header band, on Ink: the three links as display rows on 2px Slate rules, then the repository as a full-width button, and the Menu box reads Close. `components/PhoneMenu.tsx` only closes it (Escape, a link, focus leaving, the width passing 48rem) and locks the page's scroll while it is open.
- **Site footer** (`components/SiteFooter.tsx`): Ink, the 26px lockup, the label "A Horizon Foundry suite.", the version in mono, and the secondary links.
- **Button** (`.btn`): one filled box in the text color of its ground, so Bone with Ink type on Ink and Slate. Square, semibold, 52px (44px in the header). Hover is White.
- **States**: one rule for every shared control. Hover brings a control forward: a fill goes White, a line is drawn or thickens, quiet text goes Bone. Pressed sets it back one step, at once and with no movement: a fill goes Mist, text goes to the ground's second color. Focus is the 2px ring.
- **Text link** (`.tl`): body size, semibold, a 1.5px line under the text that thickens to 3px on hover. The anchor is the 44px target.
- **Label** (`.label`): 14px uppercase, 600, tracked `0.14em`. It names a block.
- **Meta** (`.meta`): the mono line of a report: a date, a commit, a count, a path.
- **Command in text** (`.cmd`): mono in the text's own color, a step heavier, with no field.
- **Command well** (`components/CommandField.tsx`, `.cmd-field`): the one way a command to run is set. An Ink field with a 2px Bone border on both grounds, the command in Bone mono, an amber unit bar in front of it, and the copy control joined to its right edge. Below 40rem the control joins under the field and the command wraps at its spaces.
- **Verdict sheet** (`components/VerdictSheet.tsx`, `.sheet`): a verdict as a printed page. White with a 2px Ink edge on every ground, with a registration tick off each corner in the ground's text color. It holds a mono head line (what ran, on what, the date and the commit), the verdict word on a band filled with the verdict's hue, the scope and the posture sentence, and the five severity counts. Every word and number comes from the report. It is the one White object on the site: no other card, panel or field is White.
- **Stage rail** (`components/StageRail.tsx`, `app/styles/stages.css`): three ruled rows on Ink, one per stage, the same on the home page and on `/skills`. The stage's word at the title size behind its unit bar, its skills as mono command links on 1px lines, and the line it hands to the next stage. From 68.75rem a stage is two columns (0.9 to 1.1, a 52px gap): what the stage is on the left, its commands and then its handoff on the right. The closing thread sits on the same two columns.
- **Row link** (`.rows`, `.row-link`): a ruled list of places to go, 2px to open and close. Each row is the place's name in semibold and its address in mono at the right edge. The home page's record and the 404 use it.
- **Readout** (`.readout`): one mono line in an Ink well with a 2px Bone edge, for what the server said: the status and the requested path on the 404, the error's digest on the error page.
- **Install block** (`components/InstallBlock.tsx`): the heading on the left and the instrument on the right. The command well, the line that says what to run next, and one fold (a drawn plus mark) that holds the from-source commands in the same well, the requirements, and what an install touches.
- **Readiness figure** (home, `.home-map`): the whole map as one Ink well with a Bone edge across the content width. Its head is the key, its body one cell per concern by area, its caption the one thing the key cannot say.
- **Skill page** (`app/skills/[slug]/page.tsx`, `app/styles/skill.css`): a Slate hero that holds the command as the h1 behind its amber unit bar, the claim, and the skill's specimen in a frame; then bands that turn Ink and Slate. Two tabs stand on the hero's foot, and the current one is Ink like the panel under it, as in the hub. The SKILL.md panel is the rendered doc's look under `.sk-md`.
- **Report view** (`components/ReportView.tsx`, `components/report-ui.tsx`, `app/styles/report.css`): a report opens on Slate with its name, its mono meta and the verdict sheet (`VerdictStamp` draws the sheet). Everything under it is on Ink, because three severity hues fail as type on Slate: each section's name in a 420px column and its rows beside it. `/reports` and `/unlock` share the sheet's file. The sign-in field is the command well's own: Ink, a 2px Bone edge, mono.
- **Cells** (`components/Cells.tsx`, `.c`): the figures' one atom, a square that is filled, hollow or hatched. Hue appears on a cell only for a severity; an owner or a map state is told by luminance and outline.
- **Frame** (`components/Frame.tsx`, `.frame`): a bordered excerpt with a caption at each end of its head. The edge is the ground's 2px rule and the field is Ink.
- **Hub head and tabs** (`app/behind/layout.tsx`, `components/BehindNav.tsx`): the hub's h1 and lead on Slate, with four tabs standing on the head's lower edge. The current tab is Ink, the ground of the page under it, so the tab and its page are one piece. Selection is a change of ground, never a pill.
- **Overview deck** (`components/SlideDeck.tsx`): a frame on Ink. Its head row holds the slide's place as a mono count, the slide's category as a label, and every control (Prev, nine dots, Next), so the controls never move when one slide is taller than the last. A slide is a statement heading with one line glyph beside it, text, then a ruled list, the three stage words behind their unit bars, commands in mono behind an amber unit bar, or a quote. The cover sets the product lockup. One glyph per slide, never more, and never an illustration (settled 2026-10-08): a slide must not be a wall of text.
- **Rendered doc** (`components/BehindDoc.tsx`): the doc's name and its sections in the heading column, the text beside it. Headings and text are Zalando Sans; code is mono in the heading color with no field; a table is a ledger with 2px rules to open and close and 1px lines between rows.
- **Design-system page** (`app/behind/design-system/page.tsx`): the system in its own parts, each a section on its own ground, Ink and Slate in turn. Every specimen is the shipped component or the shipped token. Amber's swatch is a bar, because amber has no other form.

## The report reads like a triage tool, not a document (codified 2026-07-16)

The audit report is read by a detail-oriented but time-poor senior or principal engineer, or a product lead. They do not read it top to bottom; they triage. So the report is comprehensive but never a wall of text: the default view is the decision and the shape, and all depth is one click away and precise when opened.

- **The first screen is the whole call.** The verdict sheet carries the punch: the verdict word in Ink on a band filled with its level's hue, then the one-line posture as a bold summary on the sheet (it is the headline, so it is the punchiest text on the block, never subdued). The justification is quieter supporting detail below the sheet, folded. Then one scorecard: the severity mix, the count of risks versus improvements, the gate statuses, and what was not assessed. The findings that drive the verdict follow directly under the scorecard, named and linked, not left as bare IDs. A reader who reads nothing else has the decision and the triage, and the scorecard sits on the first screen (settled 2026-10-06; it used to follow the drivers). The sheet stands beside the report's name from 68.75rem and takes the full width below that, with the summary text capped inside it. The scorecard's severity strip abbreviates the two longest names to crit and info at every width, so a narrow cell never clips, and keeps the full name for screen readers.
- **Progressive disclosure below, risks before improvements.** Findings split into two groups: **risks to weigh** (a path to harm, what the verdict rests on) then **improvements** (safe today, robustness over time, which never cap the verdict), each a severity-sorted index of collapsed rows (one-line issue plus location) with the low and informational bulk folded into one disclosure. A report with no risks says so plainly ("no risks surfaced"), so a healthy app reads as healthy with a punch list, not as a wall of problems. Strengths lead as scannable green headlines, the note one click away. Process detail (remediation, not-assessed, mechanical sweeps) sits at the tail, compact.
- **No repetition, no filler.** Identical per-item cards collapse to one line. If a section repeats the same sentence, it is one sentence.
- **Gate and finding notes surface only when they move the decision.** A met gate is a chip; an at-risk or not-met gate shows its reason.

## Gates

The identity is held by two scripts that `make validate` runs, and by the tests that prove they fail on the identity this site retired.

- `scripts/check-brand-assets.mjs` reads source: the copied files against `reference/brand-kit.json` byte for byte, `public/` as a set, the mark's and the unit bar's paths by exact equality, the lockup's words and ratios, the faces, the share card's source (the mark, the lockup, the home page's h1, and the published self-audit's own verdict) and its render's digest, the manifest and the declared icons.
- `scripts/check-built-mark.mjs` reads what the site serves: every prerendered page carries the HF mark whole inside the lockup and the company's icon tags; nothing the build emits carries the retired mountain mark or the retired display face; and amber is the fill of a bar and nothing else, in every stylesheet, chunk and page.
- `scripts/lib/brand-rules.mjs` holds the rules both share, and `scripts/test/brand-rules.test.mjs` feeds each rule the retired identity by every route it could take.

`make check-kit KIT=<path to the company repo>` checks the pin itself against the company's files. The share card (`public/og.png`) is a render of `scripts/og/card.html`: change the source and run `make og-card`, never touch up the PNG.

## Anti-goals

- No amber anywhere except as the fill of a bar. Never text, never a border, never an outline, never a wash, never a glow, never a gradient.
- No White object other than the verdict sheet. No white card, panel, field or band.
- No light ground. The site is dark: Ink and Slate.
- No shadow, glow, gradient, film grain, radius or tint of a color.
- No face but Zalando Sans and IBM Plex Mono. No italic. No wide, condensed or lighter display type.
- Never set a heading, a label or a sentence in mono, and never set a command, a path, a date, a commit or a count in the sans.
- Never crop, recolor or redraw the mark. Never show the retired mountain mark.
- No decorative bar. A unit bar marks a stage or a command to run.
- No color that is not one of the seven values, a severity or a verdict. A severity or verdict hue never sits on plain marketing chrome (a label, a badge, a heading), only inside a report view or a framed excerpt.
- No label used as a kicker above a heading.
- No stacked bordered cards as page structure. Rules divide sections, and a list is one block: 2px to open and close, 1px between rows.
- No filled pill for the current tab or the current page.
- A report page must not bury the verdict. The first screen is the verdict, the one-line summary and the scorecard.
- No long text wider than about 75 characters a line.
- No hype or marketing warmth, and no em dashes in any copy.
- No decorative element that can vanish on a phone with nothing lost. The sheet's registration ticks, a deck slide's glyph and the unit bars are marks, not decoration.
