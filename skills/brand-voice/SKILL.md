---
name: brand-voice
description: Use when writing or reviewing any user-facing copy, marketing, landing pages, UI labels, error messages, empty states, docs prose, or when a project needs its brand voice defined. Enforces one voice from a single source of truth instead of ad-hoc tone per surface.
---

# brand-voice

> **Using this skill:** announce "Using brand-voice" and the resolved mode, make a todo per numbered step in `## Steps` for the resolved path, and do not skip the gates. This skill's worth is its process, not a hand-reproduced outcome. If you were told to "run brand-voice", run it, do not improvise its result. (Suite standard: https://github.com/horizon-foundry/foundry/blob/main/reference/skill-authoring.md)

## Steps

0. **Resolve the mode.** Read `BRAND.md`'s approval header. If the file is
   absent or `Status: draft`, run the Define path; if `Status: approved`,
   run the Apply path. Check: the announced mode names the header state that
   selected it.

**Define path:**

1. **Draft `BRAND.md` from what exists.** Fill the suite template
   (`reference/templates/BRAND.md`, bundled in the repo; fallback:
   https://raw.githubusercontent.com/horizon-foundry/foundry/main/reference/templates/BRAND.md)
   from what the builder already has or has approved, per "Define the voice
   first" below. Artifact: a draft `BRAND.md` opening with the approval
   header at `Status: draft`.
2. **Run the completeness check.** Every template section is present and
   either filled, marked "assumed, unconfirmed", or visibly blank as a
   finding.
3. **Stop at the sign-off gate.** `Status` flips to `approved` only by the
   human, who sets all three header fields in one action. Check: an empty
   `Approved by` under `approved` status is a finding; until approved, the
   file guides and never blocks.

**Apply path:**

1. **List the surfaces.** Name every surface the copy change touches, before
   judging any of it. Artifact: the surface list.
2. **Check each surface** against the four checks in "Applying the voice"
   below. Check: every listed surface gets all four, none skipped.
3. **Leave the report.** Artifact: a per-surface check report, one line per
   surface touched, each of the four checks pass or violation-with-fix.
   "Checked" without the report is not a run.

## Overview

Copy drifts when every surface invents its own tone. This skill keeps one voice by making `BRAND.md` the single source of truth for identity, voice, glossary, and copy rules, then applying it. Model-invoked (runs when copy changes) or user-invoked. `BRAND.md` is defined by the doc set spec (`reference/doc-set-spec.md`, bundled in the repo; fallback: https://raw.githubusercontent.com/horizon-foundry/foundry/main/reference/doc-set-spec.md); it owns voice the way `DESIGN.md` owns visuals.

## Define the voice first (from what already exists)

You cannot enforce a voice no one has written down, so when there is no `BRAND.md` the first job is to help define one. This part is additive: you draft a positive voice, not a list of bans.

Draft the `BRAND.md` from what the builder already has or has approved: the frame, the forever spec, copy they have written and liked, preferences they have stated. Fill its shape (purpose, positioning, personality, voice and tone, glossary, anti-goals) from those sources. Mark anything you inferred rather than heard as "assumed, unconfirmed." Leave blanks the builder has not filled visibly blank.

Two limits keep the draft honest. **Do not invent brand rules the builder never approved:** no made-up personality, no manufactured positioning, and no discovery interview to pull them out of the builder. And **the draft binds only after the builder signs off.** Until then it is a proposal, and copy is not enforced against it.

Make that sign-off **machine-readable**, so "is this approved?" is a lookup, not a judgment. `BRAND.md` opens with an approval header the agent reads before enforcing anything:

```
Status: draft            # draft | approved
Approved by:             # who signed off (blank while draft)
Approved on:             # YYYY-MM-DD (blank while draft)
```

While `Status: draft`, the file is a proposal: apply it as guidance and flag copy against it, but never block on it. Enforcement (glossary violations, copy rules treated as non-negotiable) turns on only at `Status: approved`. When the builder signs off, set the three fields in the same action. An empty `Approved by` under an `approved` status is itself a finding.

## Applying the voice

When writing or reviewing copy, check it against `BRAND.md`:

1. **Personality and tone.** Does it sound like the product's defined personality on this surface? Tone shifts by surface (a hero is not an error message), but all shifts stay within the same voice.
2. **Glossary.** Every product term uses the approved word, never a forbidden synonym. This is where terminology drift is caught: one word per concept, app-wide.
3. **Copy rules.** Apply the rules this project chose and wrote into `BRAND.md`. A project might pick: no em dashes, sentence case for buttons, the AI stays unnamed on user surfaces. These are the project's own rules, not a universal set, and within the project they are non-negotiable.
4. **Anti-goals.** The copy makes no move the brand rejects (for example: never adversarial toward competitors; never markets an unshipped feature).

## Clarity outranks the brand

The priority order is fixed: **comprehension, accessibility, and error recovery come before style.** A brand rule never outranks a user understanding what happened or how to recover. If on-brand phrasing makes an error message unclear, the plain version wins. If a glossary term is jargon at the moment a user is stuck, explain first and be on-brand second. When a rule and clarity truly conflict, keep the clear copy and flag the rule for revision. Do not silently break the rule, and do not silently obey it.

## Product surfaces get brand prose, not raw internal docs

A **public, user-facing** surface is hand-written in brand voice. Never drop an internal doc onto it verbatim, not a spec, a session log, or a decision record. Timestamps, internal labels, and working notes do not belong in front of users. Rewrite the substance in the brand's voice. The underlying boundary rule (raw internal logs never reach a public URL; a gated internal portal may render them directly) is owned by the `document` skill.

## Keep outward copy in sync with the product

Marketing and UI copy track shipped reality. When a feature ships, changes, or is superseded, update the copy in the same change. Never describe an unshipped capability as available. Lead with the friendliest currently-shipped path.

## Red flags

- Writing copy with no `BRAND.md` to check against -> draft the standard from approved inputs and get sign-off first.
- Inventing personality or positioning to fill a blank `BRAND.md` -> the standard is declared by the human; unconfirmed entries are marked assumed and do not bind.
- Enforcing copy against a `BRAND.md` the human never signed off -> it is a proposal, not a standard.
- An error message that is on-brand but unclear -> clarity outranks the brand; fix the message, flag the rule.
- Two surfaces use different words for the same thing -> glossary violation; pick the approved term.
- Pasting a spec or notes doc onto a user-facing page -> rewrite in brand voice.
- Copy describes a feature that is planned, not shipped -> remove it until it ships.
