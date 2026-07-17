# The Doc-Set Spec

The documentation architecture these skills assume and enforce. It is the shared reference that `scaffold`, `document`, and `phase-plan` all point at, so none of them re-derive the structure.

## The thesis: documentation is the agent's memory

Software built with an AI in the loop has a failure mode nothing else in the toolchain addresses: **context loss across sessions.** A fresh or post-`/clear` agent acts on stale, duplicated, or missing context and goes wrong, confidently. Every rule below exists to defeat that. The doc set is engineered so a cold start cannot go wrong and the truth cannot rot.

The set covers three tenses:

- **Past**, how the code got here, and why. `NOTES.md` (decisions, with the alternatives that were rejected) and `PROMPTS.md` (what happened, in order).
- **Present**, what is true right now. `PRODUCT.md` (the product), `ARCHITECTURE.md` (the technical shape), `DESIGN.md` (the visual system), `BRAND.md` (the identity and voice). These are always current or they are broken.
- **Next**, what happens after this. `TODOS.md` (the plan index and backlog) plus the plan files it points at.

`CLAUDE.md` sits outside the tenses: it is how to work in the repo, procedure not content. `FRICTION.md` records where the process itself hurt.

## The files, and the one thing each owns

Each file owns exactly one responsibility. Duplication between any two is drift waiting to happen; if the same fact appears in two files, it is removed from the less authoritative one and replaced with a pointer.

| File | Owns | Never |
| --- | --- | --- |
| `PRODUCT.md` | The forever spec: what the product is, who it serves, why it exists | Aspirational or stale; unshipped features |
| `BRAND.md` | Identity: purpose, positioning, personality, voice and tone, glossary, copy rules | Visual tokens (that is DESIGN) |
| `DESIGN.md` | The visual system: tokens, type, components, motion | Voice or product scope |
| `ARCHITECTURE.md` | Technical truth: stack, topology, data model, decisions | Design or product framing |
| `CLAUDE.md` | How to work in this repo: procedure and conventions | Content copied from the others |
| `NOTES.md` | Why: decisions and the alternatives rejected | Routine change logs (that is git) |
| `PROMPTS.md` | What happened, in order: summary, phases, and (optionally) a raw log | Curated narrative masquerading as history |
| `FRICTION.md` | Where the process hurt: friction and candidate fixes | Product bugs |
| `TODOS.md` | The plan index (Master Plan / Phase Plans) and backlog | Vague wishes without an owner |

Smaller projects can omit `ARCHITECTURE.md` (fold the data model into `PRODUCT.md` or `CLAUDE.md`) and `BRAND.md` (only if the project genuinely has no outward voice). Everything else is load-bearing for a shipping product. **The full set is the web-product shape, not a universal mandate:** `scaffold`'s profiles (experiment, internal-tool, web-product, service, library) each select the subset that project kind actually needs; an experiment carries a README and NOTES, a library's README is its product surface and it has no DESIGN. The ownership rules above apply to whichever files exist.

## Source-of-truth rules

- **One owner per fact.** When docs and running behavior conflict, implementation is the source of truth; documentation is repaired to match, never the reverse without explicit instruction.
- **DESIGN.md's frontmatter is the token source.** Code references tokens; it never hardcodes a value that a token already names.
- **ARCHITECTURE.md precedes the migration.** A data-model change updates ARCHITECTURE first, then the schema.
- **BRAND.md is the voice source.** Copy, marketing, and UI strings reference it; they do not each invent their own tone.
- **Reference, never copy.** CLAUDE.md points at DESIGN/BRAND/PRODUCT; it does not paste their content.

## The forever spec (PRODUCT.md)

Living specifications have always failed for one reason: humans would not keep them current. An AI removes that excuse. The cost of updating the spec drops to near-zero, and currency can be *enforced* whenever a unit of work is finalized. So `PRODUCT.md` is not a one-time brief that goes stale. It is the single always-true description of the product, and it carries one hard invariant:

> **PRODUCT.md describes what exists, in the present tense, and is updated in the same commit as the change that makes it true.**

- Never aspirational. A feature that is planned but not built lives in `TODOS.md` and the plan files, not in `PRODUCT.md`. When it ships, it moves into `PRODUCT.md` in the same commit, and out of the backlog.
- Never stale. If code and spec disagree, that is a drift violation `document` must resolve (repair the doc to match observed behavior, or flag a suspected regression when a test or an intent claim says the code, not the doc, is what changed).
- The always-current north star. A person or an agent reads `PRODUCT.md` first to understand what the product is now; the history of how it got there lives in `NOTES.md` and `PROMPTS.md`.

This is what lets one spec survive from greenfield exploration to a new feature two years later: it is always present-tense truth, and the logs behind it carry the timeline.

## Intent preservation (NOTES.md as the decision record)

A present-tense spec answers *what*; a future agent (or maintainer) also needs *why*, or they will re-derive it wrong and "fix" a deliberate choice. That is `NOTES.md`'s formal role: it is the project's lightweight decision record (ADR-shaped without the ceremony). Each entry is dated and carries:

- **The decision** and the context it was made in.
- **The reasoning**, including constraints that forced it (a platform limit, a legal posture, a cost ceiling).
- **The rejected alternative(s)** and why they lost. This is the highest-value line: it is what stops the next session from proposing the rejected option as an improvement.

A reversal later gets its own entry; the original stays, because the history is part of the record. `document`'s authority model treats these entries as the "accepted constraints" source: a doc-vs-code disagreement that contradicts a NOTES.md decision is a suspected regression, not a doc repair.

## The plan chain (never close work without planning the next)

The resume rule (a standing instruction in a scaffolded `CLAUDE.md`: read the indexed plan before acting on a terse continuation) solves cold starts from the reading side. This rule solves them from the writing side:

> **A unit of work is not done when it is merged. It is done when it is merged and what happens next is written down and indexed: the next unit's plan, or an honest terminal entry.**

- **Plan while warm.** The next unit is planned at the moment context is maximal, right after the last one finishes, not cold-reconstructed at the start of a fresh session. Most planning happens when context is weakest; this inverts it.
- **Write and index atomically.** A plan file is written and its path is added to `TODOS.md`'s Master Plan / Phase Plans index in the same action. An unindexed plan is invisible after a `/clear`.
- **The chain never goes empty, and never goes vacuous.** When there is genuinely no next unit, the index gets an explicit terminal entry (decision required, awaiting evidence, or no next work selected) instead of a filler plan. The resume side always finds either a real plan or an honest statement of why there is none.
- **Plans carry a status.** Every plan file opens with `Status: active | completed | superseded (by <file>) | abandoned (<why>)`, so a reader never executes a plan that has already been replaced. An artifact that no longer supports a decision or a handoff is closed, not left ambient.
- **The repo wins on resume.** The plan explains intent; `git status`, the branch, and recent commits prove current state. A resumed plan is reconciled against the repo before any new work starts.

`TODOS.md` holds the index; the plan files hold the handoff (kickoff decisions, steps, acceptance criteria, dependencies, non-goals, risks, current state). Together they are the "next" tense of the memory.

## Self-maintenance cadence

These files are maintained as work happens, not in an end-of-session cleanup:

- **A decision worth preserving** -> `NOTES.md`, in the same turn, with its reasoning and the rejected alternative.
- **A prompt arrives** -> append to the `PROMPTS.md` log before doing the work, in projects that keep a raw log. A repo whose docs may render publicly can deliberately keep no verbatim log (the phases narrative carries the history instead); that is a valid, declared choice, not drift.
- **A unit of work finishes** -> a `PROMPTS.md` phase entry, and the next plan written and indexed (the plan chain).
- **The product changes** -> `PRODUCT.md` in the same commit (the forever-spec invariant).
- **Process friction observed** -> `FRICTION.md`.
- **When finalizing a unit of work** -> verify all of the above are current before the change lands.

## Rendering the docs proves they are maintained

Self-documentation needs a forcing function, or the docs quietly rot. The strongest one is to render the repo's own docs as a product surface (a "Behind the Build" hub). If the docs are the live site, staleness is visible, so it gets fixed. The `document` skill both enforces the docs-versus-code invariants (repair the doc, flag a suspected regression) and builds that surface and authors the overview deck: truth and presentation in one place.
