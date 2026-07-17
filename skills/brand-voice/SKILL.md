---
name: brand-voice
description: Use when writing or reviewing any user-facing copy, marketing, landing pages, UI labels, error messages, empty states, docs prose, or when a project needs its brand voice defined. Enforces one voice from a single source of truth instead of ad-hoc tone per surface.
---

# brand-voice

> **Using this skill:** announce "Using brand-voice", make a todo per step below, and do not skip the gates. This skill's worth is its process, not a hand-reproduced outcome. If you were told to "run brand-voice", run it, do not improvise the result. (Suite standard: https://github.com/horizon-foundry/foundry/blob/main/reference/skill-authoring.md)

## Overview

Copy drifts when every surface invents its own tone. This skill keeps one voice by making `BRAND.md` the single source of truth for identity, voice, glossary, and copy rules, then applying it. Model-invoked (runs when copy changes) or user-invoked. `BRAND.md` is defined by `doc-set-spec`; it owns voice the way `DESIGN.md` owns visuals.

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

A **public, user-facing** surface is hand-written in brand voice. Never drop an internal doc onto it verbatim, not a spec, a session log, or a decision record. Timestamps, internal labels, and working notes do not belong in front of users. Rewrite the substance in the brand's voice.

This is scoped to **public** surfaces on purpose. A gated internal portal (see `document`'s `internal` mode) may render the raw docs directly, that is its job, continuity and inspection for people who already have access. The rule `document`'s `public` mode and this skill share: raw internal logs never reach a public URL. If a "Behind the Build" hub is public, it shows only curated, sanitized docs (the deck, the design system, the forever spec, the brand); the raw logs live in the internal portal.

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
