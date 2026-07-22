---
name: document
description: Use to keep a project's documentation true to the code and current across every surface, or to turn the repo's own docs into a product surface. Covers docs-versus-code drift (repair the doc, flag a suspected regression) and presentation drift (deck, hub, showcase copy). Modes, public (curated external hub), internal (raw docs behind a gate), reconcile (idempotent, pull every surface and the docs-versus-code layer current). Safe to run as often as you like.
---

# document

> **Using this skill:** announce "Using document" and the mode (`public`, `internal`, or `reconcile`), make a todo per numbered step of the chosen mode in `## Steps`, and do not skip the gates. This skill's worth is its process, not a hand-reproduced outcome. If you were told to "run document", run it, do not improvise its result. (Suite standard: https://github.com/horizon-foundry/foundry/blob/main/reference/skill-authoring.md)

## Overview

Documenting a project is a lifecycle stage, not a favor you do when asked. The build sequence is scaffold, build, **document**, audit, ship. The document step is the one that silently gets skipped, because nobody is blocked without it. The cost lands later: a cold-start agent has no map, a stakeholder cannot see what was built, and worst, a wrong doc gets trusted and built on.

This skill owns the project's words on two layers. **Truth**: the docs must agree with the running code (a wrong doc is worse than no doc). **Presentation**: the docs become a live surface (the overview deck, the "Behind the Build" hub) so they cannot rot unseen. User-invoked and idempotent: a run that finds everything current changes nothing. Assumes the doc set from `doc-set-spec`.

## Steps

The sections after this one are the reference each step points at.

### public

0. Confirm an external audience is declared or confirmed by the human. When in doubt the mode is `internal`, never `public`. Check: the audience confirmation, named in the report.
1. Run the truth checklist. Artifact: the per-item report, each item pass, repaired, or regression-flagged.
2. Establish or reconcile the public hub and the overview deck (see those sections). Check: one hub, one deck, established or reconciled, never a second.
3. Run the sanitization sweep (the pre-publish checklist under "What sanitized means"). Check: zero marker hits, and every publicly rendered section listed with its public-or-private call.
4. Close with the convergence statement: what was already current, what changed, and that on a re-run of an unchanged project the touched-surface diff is empty and the report says so.

### internal

1. Run the truth checklist. Artifact: the per-item report.
2. Establish or reconcile the internal portal (see that section). Check: the full raw doc set renders behind a gate or on a private host.
3. Confirm no public surface was created or exposed by this run. Check: that confirmation stated in the report.
4. Close with the convergence statement (as in `public` step 4).

### reconcile

1. Run the truth checklist. Artifact: the per-item report.
2. Pull every existing presentation surface current (see "Reconcile: what a re-run checks"). Check: a per-surface line in the report, current or updated.
3. Run the cold-start drill (see that section). Artifact: the drill result, pass or a doc-set finding per failed check.
4. End with the convergence check: on an unchanged project the touched-surface diff is empty, and the report says so.

## Keep the docs true to the code

The failure this prevents: an agent reads a stale doc, believes it, and acts on a false premise. So on every run, and before any unit of work closes, reconcile the docs against what the code actually does.

**The authority model.** Code is the truth for *what the system does*: when a doc describes behavior the code no longer has, repair the doc to match observed behavior. But code is **not** automatically the truth for what the system *should* do. Five sources carry authority over different things: **code** (current behavior), **tests** (expected behavior), **product requirements / the forever spec** (intended behavior), **decision records** (accepted constraints), **docs** (the communicated contract). When they disagree, classify before repairing:

- **Deterministic mismatch** (a renamed flag, a wrong path, a stale count, a moved file): repair the doc directly. This is the common case and it is safe.
- **Suspected regression** (the doc-vs-code disagreement coincides with a failing test, a contradicted decision record in `NOTES.md`, or a doc that states the behavior as *designed intent*): do **not** silently rewrite the doc to document the new behavior. That would turn a bug into the product's contract. Flag it as a suspected regression and let a human decide which side is wrong.

Never change working behavior to satisfy a wrong doc; runtime changes require explicit instruction.

## Prohibited drift

Never let documentation:

- Invent components, routes, or services not present in the code.
- Mark a required config field optional, or optional required, against what the code does.
- Describe an unshipped feature as present (the forever-spec invariant: `PRODUCT.md` is present-tense truth only; roadmaps, proposals, and plan files are exempt because they are forward-looking by declaration).
- Introduce CLI flags or arguments the parser does not have.
- Leave a runtime artifact (log, cache, temp file the code creates) undocumented and un-gitignored.
- Contradict a sibling doc: the same fact in `CLAUDE.md`, `README.md`, and `TODOS.md` must agree, in order and in count.

## The truth checklist

Run against the documentation and the externally-meaningful contracts a change touched (the CLI/API surface, config, schema, runtime artifacts, the display strings docs actually quote), not every source file read during a large session; scope to what the change altered and to what the docs claim. The per-item report (step 1 of every mode) states pass, the repair made, or the regression flagged:

1. **CLI/API surface**, documented flags, args, and endpoints exist in the parser/router; examples use realistic values of the right type.
2. **Runtime artifacts**, anything the code writes at runtime is documented and gitignored.
3. **Config semantics**, `.env.example` comments match runtime optionality and the actual loading mechanism (auto-load vs manual source).
4. **Display values**, hardcoded strings quoted in docs match the source, including the visual result of any CSS transform.
5. **Cross-document**, counts, orderings, and lists agree across every doc that repeats them. When a fact is duplicated, prefer removing it and leaving a pointer over normalizing the same fact in many places.
6. **Forever spec**, `PRODUCT.md` describes only what exists; unshipped work lives in `TODOS.md` and plan files.
7. **Registry (only where one is claimed)**, if the docs maintain a file or component registry, every listed entry exists and every file is listed. Do not impose a filesystem-mirror registry on a project whose docs never claimed one.

## Three modes: public, internal, reconcile

A documentation *surface* serves one of two audiences, and those audiences want opposite things. The mode names which you are building.

- **`document public`** builds and maintains the **public** hub: a curated, external-facing surface for someone who does not know the project. It renders only the finished, sanitized docs (the overview deck, the design system, the forever spec, the brand); it **never** renders raw session logs, decision records, or friction notes. Written for a reader, not for continuity.
- **`document internal`** builds and maintains the **internal** portal: the raw source docs rendered directly (including `PROMPTS.md`, `NOTES.md`, `FRICTION.md`), optimized for continuity and inspection. Private or authenticated, never a public URL. Because it is gated, rendering raw internal docs here is fine.
- **`document reconcile`** is the idempotent update pass over both the truth layer (docs versus code, above) and whichever presentation surfaces exist: pull each back up to date with what shipped, change nothing already current.

**The showcase is conditional on the project type.** A public product, an OSS tool, a portfolio piece, or consulting output wants the deck and the public hub. An internal service, a private repo, or an experiment gets the truth layer and (at most) the internal portal. Building a marketing surface for a project with no external audience is drift of a different kind.

**Establish, then reconcile.** The first time you run `public` or `internal`, no hub exists, so you establish it. Every run after is a reconcile: one hub per mode, never a second. If the doc set itself does not exist yet, that is `scaffold`'s job, not this skill's. Do not fabricate docs to render.

**The rule shared with `brand-voice`:** raw internal logs never reach a public URL, and `brand-voice` defers to this skill for that rule; the modes enforce it by construction (the public hub is curated, the internal portal is gated).

### What "sanitized" means: project at the section level

File-level whitelisting is not enough. A file that is safe to render publicly (`PRODUCT.md`, `BRAND.md`) can still open with a section that is not, so dumping the whole file leaks whatever it leads with (`PRODUCT.md` opens with the frame: intent, assumptions, open findings, security declarations). So "sanitized" is a **section-level projection**:

- **Public-by-default** (safe to render externally): present-tense product truth (what it is, who it serves, core flows, non-goals), positioning and outward brand, design tokens, and a stated security *posture* summary.
- **Private-by-default** (curated OUT of a public render even when the containing file is public): the security frame's specifics (trust-boundary enumeration, authn/authz internals, secret-handling detail) beyond a posture summary; any entry still marked `assumed, unconfirmed`; open findings and unresolved blanks (`(finding: not yet declared)`); idea-risk and internal decision rationale; anything a hostile reader could turn into an attack map.

The test: if a line reads as intent, a hedge, an open question, or an attack hint, it belongs to the internal portal, not the public hub. `public` mode therefore renders a file's public sections only, never a raw dump.

**The pre-publish checklist enforces it.** Before anything publishes, the sweep (public mode, step 3) requires:

- Grep every publicly rendered doc for the markers `(finding:` and `(assumed,` and for the internal file names (`PROMPTS`, `NOTES`, `FRICTION`). Any hit fails the sweep.
- The run report lists every section rendered publicly with its public-or-private call, one line each. An unlisted section fails the sweep.

## The public hub

A `/behind` (or "insider") route with a tab bar. The kicker is "Behind the Build", the heading "How this was made". Curated, external-facing tabs only:

- **Overview**, the slide deck (below).
- **Design system**, `DESIGN.md`, ideally rendered from the tokens themselves so it cannot disagree with them.
- **Product**, `PRODUCT.md`, the forever spec (present-tense truth, written for a reader).
- **Brand**, `BRAND.md`, if it reads as outward brand rather than internal strategy.

No placeholders, no empty sections, no internal voice. If a doc still has template scaffolding or empty headings, either fill it for a reader or leave it out. Read docs through a whitelist (fixed filenames, no user input reaching the filesystem, secrets never in the set), and ensure the deploy artifact includes repo-root files if the framework's standalone output omits them; they are read at runtime.

If the project has **no rendering surface** (a CLI, a library, a backend-only service), the public hub is out of scope: the internal portal is the repo itself on a private host, and the truth layer above is the whole job. Say so and stop. Do not invent a web surface to render into.

## The internal portal

The same rendering machinery, pointed at the full raw doc set (`PRODUCT`, `BRAND`, `DESIGN`, `PROMPTS`, `NOTES`, `FRICTION`) for continuity and inspection. It is gated: an authenticated route, or simply the repo itself on a private host. Placeholders and empty sections are fine here; they are honest state, not a marketing surface. Never expose the internal portal at a public URL.

## The overview deck

The deck is the project's story on the public hub: authored, not just rendered. A typed `Slide[]` array drives a keyboard-navigable deck: a title slide (name, tagline, a few stat chips) plus content slides, each with `category` (a kicker), `heading`, `body`, optional evidence `items`, a hairline `glyph` (a small monochrome geometric mark, never an illustration), and a curated `quote` from the project's domain. The template is fixed (top-aligned header, bottom-anchored quote) so nothing jumps between slides. Author the arc first, one slide per core idea, in order: the problem, what it is, who it is for, the method, the payoff or the gate, getting started. Cut any slide you cannot name a lesson for.

**Authored, never invented.** Every claim traces to something real: the frame, the forever spec, the instrumented funnel, shipped code. Never invent impact numbers, market positioning, customer quotes, or adoption evidence. A deck that says "built to find out" where evidence does not exist yet is honest.

## Reconcile: what a re-run checks

A run with nothing to change produces no diff; if a second run of an unchanged project churns, you were rewriting, not reconciling.

The presentation surfaces, from least to most drift-prone:

- **The doc-set tabs** render from source, so they are inherently current. Confirm the whitelist still covers the intended docs (and, for the public hub, that it excludes the raw logs).
- **The overview deck** is hand-authored, so it is where drift lives. Check each slide against shipped capability: a shipped feature with no beat, or a slide describing something removed or renamed, is drift. Add the missing beat, fix or cut the stale one, leave accurate slides untouched.
- **The showcase copy**, any hardcoded enumeration of the product: landing demos, command lists, skill counts ("N skills"), feature lists. A new or renamed skill rots exactly here. Reconcile every count and list against reality.
- **Cross-surface agreement**: the same fact (a count, an ordering, a name) reads the same on every surface that repeats it.

### The cold-start drill

A fresh-context subagent is given only the repo and a terse continuation prompt ("continue", "start the next phase") and must: (1) locate the Master Plan index, (2) open the plan file it names, (3) reconcile that plan against git state, (4) name the correct next action. A failure at any step is a doc-set finding, exactly like drift. Where subagents are unavailable, do not skip silently: state the manual drill (the operator runs the same four checks by hand in a fresh session) and open the run's report with a declaration naming the degradation and its reason, per the suite standard's declared-degradation rule.

## Idempotence rules

- **Detect before you create.** A re-run reconciles the existing hub, portal, and deck; it never spawns a second.
- **Update in place, add the missing, remove the stale.** Never duplicate a slide or a tab to "add" content that belongs in an existing one.
- **Preserve accurate prose.** Re-running only touches what drifted; never rewrite a slide, doc, or copy that still tells the truth.
- **Report the reconciliation.** Name what was current, what changed, and any regression flagged; "all surfaces current" is a valid and common outcome.

## Red flags

- A doc-vs-code disagreement rewritten silently when it might be a regression -> classify first; a failing test or an intent claim means flag it, do not document the bug as the contract.
- Rendering `PROMPTS.md`, `NOTES.md`, or `FRICTION.md` on a public page -> wrong mode; raw logs are `internal` only.
- A placeholder or empty section on the public hub -> fill it for a reader or leave it out.
- Adding or renaming a skill and not re-running `document` -> the deck and showcase copy are where that rots; re-run to reconcile them.
- Reading an arbitrary filename from a param -> whitelist the doc set; never let input reach the filesystem.
- Imposing a filesystem-mirror registry on a repo that never claimed one -> document architectural boundaries, not every file.
- Inventing impact, positioning, or customer evidence for the deck or showcase copy -> every claim traces to something real; absence of evidence is stated, not filled.
- Building a public hub for an internal service or private repo -> the showcase is conditional; truth layer + internal portal is the complete job there.
