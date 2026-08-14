---
name: readout
version: 0.1.0
description: Use when building or reviewing a surface that DISPLAYS measurements (a dashboard, a report, an experiment read-out, a metrics email), when someone doubts the numbers a surface is showing, or when a surface is accurate but nobody reads or acts on it. Not for adding events or wiring capture, that is instrumentation; not for choosing what to measure, that is frame.
---

# readout

> **Using this skill:** announce "Using readout", make a todo per numbered step in `## Steps`, and do not skip the gates. This skill's worth is its process, not a hand-reproduced outcome. If you were told to "run readout", run it, do not improvise its result. (Suite standard: https://github.com/horizon-foundry/foundry/blob/main/reference/skill-authoring.md)

## Overview

`instrumentation` makes numbers exist. This skill makes them safe to read.

The two fail differently. Instrumentation fails loudly: an event never fires, a funnel is empty, someone notices. A read-out fails quietly and confidently. Every number is individually correct, every query returns, every test passes, and the surface still tells a reader something untrue, because a right number in the wrong row is still wrong. A ninety-day rate beside a twenty-four-hour count passes every consistency check ever written and misleads on sight.

This class is not findable in data. A payload is identical whether a comparison renders above or below the line it depends on. A card's height is not a field. A throttled source and a genuinely empty week are the same `null` unless something made them different. So the discipline is not another correctness pass: it is a composition pass and a rendered review, and it ends with someone looking at the pixels who did not build them.

There is a second failure that survives every correctness fix: a surface can be accurate, legible, and still not tell anyone anything. Numbers accumulate because they can be computed rather than because a reader needs them, every block states a fact and none states a conclusion, and the same measure appears across the product wearing four different numbers. That surface is not wrong. It is just unread, and being unread is the outcome most dashboards actually reach.

The bar is not "the numbers are right". The bar is **a named reader acts on this, at the depth they need, and is not misled**.

## When NOT to use

- Adding events, wiring capture, identity and stitching: `instrumentation` owns the emit side; this skill starts once numbers reach a surface.
- Choosing the product's success measure or its activation moment: the frame declares it (`frame`), this skill displays it honestly.
- System observability (errors, latency, saturation, alerting): a different discipline, assessed by `production-audit`'s operability dimension.
- The visual design language of a page, or its small-screen behaviour as such: `frontend-design` and `mobile`. This skill governs what a number claims, not what it looks like, though step 7 will surface layout defects that make a number lie.
- Marketing or landing copy about a metric: `brand-voice`.

## Steps

1. **Name each surface's reader, the decision they make, and the elevation that implies** (see "Name the reader, then pitch the elevation"). Check: every surface declares reader, decision, and elevation, and every block on it maps to that decision or is listed for cutting.
2. **Trace the drill path.** Every headline number reaches its breakdown in one obvious step, and the breakdown reaches the grain it is computed from. Check: each headline traced to its detail, or the missing link named.
3. **Run the three gates over every block on primary real estate** (see "The three gates"). Check: each block reported as keep, fold, or cut, with the failing gate named.
4. **Put the window and the population on every face** (see "Every number carries its window and its population"). Check: no row mixes windows without saying so on its own face; report each row.
5. **Force every source to fail and look at what renders** (see "A gap is not a zero"). Check: for each source, the failed, empty, and stale renders are named, and none of them is a zero or a raw error.
6. **State the evidence floor for every rate.** Check: each rate names its denominator, and a rate below its floor withholds rather than prints.
7. **List every deploy and config change inside every window on display** (see "When the measured surface changes"). Check: each is classified as changing what is measured or not, and any window spanning such a change is either split or labelled.
8. **Render and review, independently.** Screenshot every surface at a desktop and a phone width, then have someone who did not build it review the IMAGES against steps 1 to 7. Check: findings reported per surface, ranked, or an explicit statement that no independent reviewer was available (see "Read the render, not the payload").
9. **Read the set as one story** (see "The set tells one story"). Check: the arc is stated in order, its breaks are named, and every surface either ends in a decision or is reported as not doing so.
10. **Close with what remains unverified**, each with the exact check to run. Check: the closing report lists them.

## Name the reader, then pitch the elevation

A surface with no declared reader gets built for everyone and lands for no one. Name the reader and the decision they make, and the elevation follows from it. The same measurement supports several, and they are not the same surface:

- **A leader** needs the conclusion, the one number the conclusion rests on, and what to do. Working detail on this surface is noise that pushes the conclusion below the fold.
- **An operator** needs the working detail: which segment, which day, which cohort moved, and enough to act this week.
- **An analyst** needs the grain: the rows, the definitions, the query, enough to reconstruct the number and argue with it.

**Elevation is layering, not deletion.** A surface pitched high is not one with the detail removed; it is one where the detail is a click away rather than in the way. Every headline number reaches its breakdown, and the breakdown reaches the grain it was computed from, so a reader can descend exactly as far as their doubt requires and no further. A summary with no path down is an assertion, and a wall of grain with no summary is homework: both fail, in opposite directions.

The two mismatches to hunt, because they are the common ones:

- **Too low for the reader.** Instrumentation health, source freshness, governance vocabulary, or reconciliation between two sources occupying prime real estate on a surface built for a decision. These are real and they belong on the surface that owns them, or one layer down, not in the space the conclusion needs.
- **Too high for the reader.** A conclusion with nothing behind it, so the reader who asks "which segment?" has nowhere to go and stops trusting the conclusion rather than finding its basis.

## The set tells one story

Surfaces are read as a sequence, not in isolation, so the set carries a burden no single surface does.

- **Order them along the path the business actually runs**, as the frame declares it (typically reach, then activation, then value, then what it costs and whether it holds up). Where the order does not match the path, say why or reorder.
- **One fact, one number.** Where a measure appears on several surfaces, one canonical spelling leads everywhere a summary speaks and the variants are demoted to labelled lenses on their own surfaces. The same measure wearing several numbers across a product is the fastest way to lose a reader's trust in all of them, and each instance being individually correct is exactly why it survives review.
- **Every surface ends in a so-what.** A surface whose every block states a fact and none states a conclusion or an action is a report nobody acts on. Where the surface computes the list a reader would act on, say so and link it, rather than leaving them to derive it.
- **Cut what only reconciles.** A block that self-describes as never being read against the main story is a diagnostic wearing narrative clothes. It is often correct and worth keeping; it belongs behind a fold, not in the arc.

## The three gates

Every block on primary real estate passes three gates, in order. Most surfaces answer only the fourth question, which is why they read as walls of text.

1. **Does this matter?** If its movement would not change anyone's week, it gets no face real estate. This gate kills things good writing cannot save: itemised ledgers of an immaterial spend, tiles that read zero because nobody has used the feature, cross-checks that exist to reconcile two sources. Fold or cut them; do not rewrite them.
2. **What does it say?** One plain reading, in a sentence, not a paragraph.
3. **What do we do?** The action or the watch-instruction, linked. A surface whose every block ends in a fact and none in a decision is a report nobody acts on.

**Validity is the fourth thing and it is never primary.** How a number is computed, which population it counts, why it can be trusted: that belongs in chips and fold-outs, reachable in one click and out of the way. A reader who doubts a number will click; a reader who trusts it should never have to wade. Each caveat gets exactly one home per surface, and text that can be derived from a definition is derived, never restated, because a restatement drifts and a derivation cannot.

Face copy earns a vocabulary allowlist: no raw identifiers or column names, no vendor names as the primary label for a source, no internal governance dialect, no shouting caps, no environment variable names, and no sentences about the surface itself (its edit history, its layout reasoning, its defences against a misreading it already stated once).

## Every number carries its window and its population

Two numbers side by side are read as comparable. If they are not, say so on the face, not in a footnote.

- Every figure states its window and its population where it renders, as a chip if the label is long.
- **No row mixes windows without saying so.** A row of cards whose windows differ is the most common lie on a dashboard, and it survives every automated check because each card is individually true.
- Where one fact appears on more than one surface, either it is the same number, or the two are labelled distinctly enough that no reader tries to reconcile them. Enumerate the repeats and check them against each other (see "The set tells one story" for the canonical-spelling rule this feeds).

## A gap is not a zero, and a stale read is not a fresh one

A measurement can be absent for three reasons, and collapsing them is how a surface states something false with total confidence.

- **Not measured** (the source failed, timed out, was throttled, is unconfigured). Renders as an absence with a plain sentence naming the source and that it is retryable. It is never a zero, and it never renders a raw error payload on a face.
- **Measured, and nothing happened.** Renders as a real zero, and may say so.
- **Measured earlier** (a cached or last-known value serving because the fresh read failed). Renders WITH its age and the reason, always. **A stale value rendered without saying so is a lie, and it is the convincing kind, because every number on it still looks measured.**

The same rule governs series: a day with no row is a gap in the line, never a point at zero, or a chart draws a straight line across an outage and reports a collapse that never happened. Watch for rows that exist and measure nothing (a probe, a health check, a seeded record); those are absences wearing a measurement's clothes.

One failure idiom, everywhere: degrade at the smallest unit the failure actually touches (a tile, a band, a section), and let the rest of the surface keep working. A page that dies whole because one of its sources blinked discards the numbers that were fine.

## Below the floor, withhold

A rate needs a denominator big enough to mean something. State the floor per measure, and below it show the counts and withhold the rate: "1 of 1" is honest, "100%" is not. Never lower a floor to make a window look fuller. When a narrowed window makes several rates withhold at once, that is the surface telling the truth about how much evidence exists, and it is a finding rather than a defect.

Watch for the inverse too: a saturated rate can be an absence seen from the other side. If nothing was ever rejected, an acceptance rate of 100% measures silence, not approval, and the face should say which it is.

## When the measured surface changes, the metric changes meaning

The deepest failure in this class: a window that spans a change to the thing being measured blends two different things under one name. A funnel measured across a release that altered the page it describes is not one funnel. An experiment whose control changed mid-run no longer has a control.

- **Enumerate the changes inside every window on display**, from the deploy log and the flag or config change history, and classify each as changing what is measured or not.
- **Where a window spans such a change, split it into periods and let the reader choose one.** Each period states what its terms MEAN inside it, because the same label can denote different things on either side of the boundary, and that restatement is the whole value of the split.
- **Boundaries are declared, never derived.** They come from the deploy log and the change history, never from where the numbers happen to move. Choosing a boundary by inspecting the data is cherry-picking with extra steps, and a machine check should assert that a planted swing in the data produces no new boundary.
- **Quantify the contamination rather than only naming it.** If a control changed, measure how much of its result comes from subjects who saw the change; "some contamination" is not actionable, "two fifths of its conversions" is.
- **Coverage is a precondition, not a footnote.** If a large share of subjects never entered the measurement at all, every rate on the surface describes the covered share only, and the face says so. An experiment reaching a third of its traffic has not produced a result yet, whatever its numbers look like.
- Periods that exist mainly as a hole in the data are not offered as choices; state usable periods against calendar periods so a mostly-unmeasured window cannot pass as a full one.

## Read the render, not the payload

**This is the step teams skip and the one that finds the defects.** Reviews that read payloads, queries, and source code pass surfaces that a person then finds wrong within seconds of looking, because the entire defect class lives in composition: what sits next to what, in what order, at what size, under which heading.

- Screenshot every surface at a desktop and a phone width, full page, and review the images.
- The reviewer must not be the builder. An agent that just produced a surface grades it generously; a fresh reader does not. Where sub-agents are available, fan the review out and give each reviewer a different lens rather than the same checklist. Where they are not, say so in the closing report rather than skipping the step.
- Shoot the states nobody demos: a failed source, a stale read, an empty result, a narrow window, a long label. Happy-path-only screenshots hide most of this class.
- Watch for the composition tells: uneven card bottoms in a row, a comparison rendered above the number it qualifies, a bar whose full width means something different in the group beside it, an unlabelled scale, a control that looks live but governs nothing, text clipped without a scroll affordance.
- A control's scope must match its position. A page-level control that moves one block reads as broken; scope it to what it governs, or make it govern the page.

## Judgments carry a basis they can die on

A surface may state a judgment ("this is not a constraint", "this is healthy"), and it is more useful than a bare number. But a judgment with no threshold behind it is a slogan that will still be rendering long after it stopped being true. Give every stated judgment an explicit basis, so it changes when the world does, and say what would have to happen for it to flip.

## Red flags

Symptoms that you skipped something above, not new rules: a surface with no named reader; a headline number with no path to its detail, or a page of grain with no summary over it; a surface whose every block is a fact and none is a decision; source freshness or reconciliation occupying the space a conclusion needs; a row of cards whose windows differ; a zero that nobody has proven is not a failed read; a cached value with no age on it; a rate printed on a denominator of one; a chart with no y-axis or a second series on a hidden scale; an error payload rendered as body text; a surface reviewed only from its data; a control whose scope does not match its position; a period boundary chosen because the numbers moved there; the same fact wearing two different numbers on two surfaces.
