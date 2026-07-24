# Brand

Status: approved
Approved by: Craig Martin
Approved on: 2026-07-16

The identity and voice source of truth for Foundry. Distinct from [DESIGN.md](DESIGN.md) (how it looks) and [PRODUCT.md](PRODUCT.md) (what it is and who for). Copy, marketing, and UI strings reference this file.

The three lines above are the machine-readable sign-off the `brand-voice` skill reads: this brand is `approved`, so its glossary and copy rules are enforced, not merely suggested.

Inherits the Horizon Foundry parent brand (the horizon-foundry/horizon-foundry repo's BRAND.md); Archivo Black display, decided 2026-07-24 (revised from the initial Big Shoulders pick on 2026-07-23, reversed on letterform grounds before any merge). Type is [DESIGN.md](DESIGN.md)'s fact, not duplicated here.

## Purpose

Foundry turns fast, messy, AI-built code into something you can ship. It is a suite of Claude Code skills, a way of building turned into tools. The parent brand is Horizon Foundry. It distills complexity into clarity and forges ideas into impact. Foundry does the same for a codebase.

## Positioning

Three verbs carry the brand: **Distill. Forge. Deliver.** Distill messy context into clear, current truth. Forge it with the discipline that survives a cold start. Deliver on a verdict, not a hope. Foundry stands for craft and rigor in how software is built. It stands against the confident but unverified code that fast building tends to produce. The parent brand's metaphor is metalworking: a foundry that melts raw material into finished parts. Foundry applies it to code.

## Personality

- **Crafted.** It reads like a working foundry, industrial and exact. Made with care, not announced with hype.
- **Confident.** It states what it does and the reason, and stops. It does not oversell.
- **Builder-first.** It speaks to the person doing the building, in their terms, about outcomes.
- **Precise.** Every claim is earned. The flagship (Production Audit) goes further: its reports use a forensic, evidence-only voice.

## Voice and tone

Plain, declarative, and warm toward the craft. Lead with the making: distill, forge, deliver, melt down, ship. Short sentences. On the suite surfaces, the tone is a studio that builds. On the instrument surfaces (audit reports), it narrows to a lab readout: technical and plain. The two registers share the same restraint.

Hard rules:

- **No em dashes**, anywhere. Restructure with commas, colons, periods, or parentheses. En dashes in numeric ranges are fine. (The parent-brand marketing copy uses them; the product surfaces do not.)
- **Sentence case** for buttons and UI labels.
- **Lead with health, not problems.** A report about a well-built app reads as well-built with a punch list, never a body count.
- **Severity and verdict speak for themselves.** Do not editorialize a finding's importance; the rubric already ranked it.

## Glossary

| Use | Never | Why |
| --- | --- | --- |
| Foundry | the suite, the toolkit | The suite has a name |
| Horizon Foundry | the company, the brand | The parent brand's full name; Foundry is its product |
| skill | tool, plugin, command | The unit is a Claude Code skill |
| verdict | score, grade, rating | The audit output is a decision, not a number |
| finding | issue, problem, bug | A report's items are findings: evidence-backed and severity-ranked. This rule governs report and audit terminology; general prose about how defects occur may still say "bug" |
| ready to ship, risks noted | conditional pass, yellow, "ship with known risks" | The middle verdict leads with the go and names its risks as a conscious call to accept on purpose, never a scolding. ("known risks" alone reads as a warning; warm the tone, keep the honesty.) |

## Anti-goals

- Never a marketing tone on a report surface. Reports are instruments. They do not persuade.
- Never dramatize severity. Critical is a rubric level with a definition, not a headline.
- Never claim a capability a skill does not have. The audit reads code and traces flows. It is not a penetration test.
- Never publish a live product's exploitable specifics on an ungated surface. Credibility comes from one full example the owner chose to publish.
