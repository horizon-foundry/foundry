---
name: document
description: Use to keep a project's documentation true to the code and current across every surface, or to turn the repo's own docs into a product surface. Covers docs-versus-code drift (repair the doc, flag a suspected regression) and presentation drift (deck, hub, showcase copy). Modes, public (curated external hub), internal (raw docs behind a gate), reconcile (idempotent, pull every surface and the docs-versus-code layer current). Safe to run as often as you like.
---

# document

> **Using this skill:** announce "Using document" and the mode (`public`, `internal`, or `reconcile`), make a todo per step below, and do not skip the gates. This skill's worth is its process, not a hand-reproduced outcome. If you were told to "run document", run it, do not improvise the result. (Suite standard: https://github.com/horizon-foundry/foundry/blob/main/reference/skill-authoring.md)

## Overview

Documenting a project is a lifecycle stage, not a favor you do when asked. The build sequence is scaffold, build, **document**, audit, ship. The document step is the one that silently gets skipped, because nobody is blocked without it. The cost lands later. A cold-start agent has no map. A stakeholder cannot see what was built. Worst of all, a doc states the wrong thing confidently, and the next agent trusts it and builds on it.

This skill owns the project's words on two layers. **Truth**: the docs must agree with the running code (a wrong doc is worse than no doc). **Presentation**: the docs become a live surface (the overview deck, the "Behind the Build" hub) so they cannot rot unseen. User-invoked and idempotent: run it as often as you like, and a run that finds everything current changes nothing. Assumes the doc set from `doc-set-spec`.

## Keep the docs true to the code

The failure this prevents: an agent reads a stale doc, believes it, and acts on a false premise. So on every run, and before any unit of work closes, reconcile the docs against what the code actually does.

**The authority model (do not skip this nuance).** Code is the truth for *what the system does*: when a doc describes behavior the code no longer has, repair the doc to match observed behavior. But code is **not** automatically the truth for what the system *should* do. Five sources carry authority over different things: **code** (current behavior), **tests** (expected behavior), **product requirements / the forever spec** (intended behavior), **decision records** (accepted constraints), **docs** (the communicated contract). When they disagree, classify before repairing:

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

Run against the documentation and the externally-meaningful contracts a change touched, the CLI/API surface, config, schema, runtime artifacts, and the display strings docs actually quote, not literally every source file read during a large session. A broad read for context should not trigger a proportionally broad reconciliation; scope the check to what the change altered and to what the docs claim. Report each item (pass, or the mismatch found and the repair made, or the regression flagged):

1. **CLI/API surface**, documented flags, args, and endpoints exist in the parser/router; examples use realistic values of the right type.
2. **Runtime artifacts**, anything the code writes at runtime is documented and gitignored.
3. **Config semantics**, `.env.example` comments match runtime optionality and the actual loading mechanism (auto-load vs manual source).
4. **Display values**, hardcoded strings quoted in docs match the source, including the visual result of any CSS transform.
5. **Cross-document**, counts, orderings, and lists agree across every doc that repeats them. When a fact is duplicated, prefer removing it and leaving a pointer over normalizing the same fact in many places.
6. **Forever spec**, `PRODUCT.md` describes only what exists; unshipped work lives in `TODOS.md` and plan files.
7. **Registry (only where one is claimed)**, if the docs maintain a file or component registry, every listed entry exists and every file is listed. Do not impose a filesystem-mirror registry on a project whose docs never claimed one.

## Three modes: public, internal, reconcile

A documentation *surface* serves one of two audiences, and those audiences want opposite things. The mode names which you are building.

- **`document public`** builds and maintains the **public** hub: a curated, external-facing surface for someone who does not know the project. It renders only the finished, sanitized docs (the overview deck, the design system, the forever spec, the brand). It **never** renders raw session logs, decision records, or friction notes, and it never shows a placeholder or an empty section. Written for a reader, not for continuity.
- **`document internal`** builds and maintains the **internal** portal: the raw source docs rendered directly (including `PROMPTS.md`, `NOTES.md`, `FRICTION.md`), optimized for continuity and inspection. Private or authenticated, never a public URL. Because it is gated, rendering raw internal docs here is fine.
- **`document reconcile`** is the idempotent update pass over both the truth layer (docs versus code, above) and whichever presentation surfaces exist: pull each back up to date with what shipped, change nothing already current.

**The showcase is conditional on the project type.** Decide whether a public hub should exist at all before any rendering. A public product, an OSS tool, a portfolio piece, or consulting output wants the deck and the public hub, because strangers will judge it by whether it can explain itself. An internal service, a private repo, or an experiment gets the truth layer and (at most) the internal portal. Building a marketing surface for a project with no external audience is drift of a different kind. When in doubt, ask which audiences exist. Do not default to public.

**Establish, then reconcile.** The first time you run `public` or `internal`, no hub exists, so you establish it. Every run after is a reconcile. Detect which case you are in before acting: one hub per mode, never a second. If the doc set itself does not exist yet, that is `scaffold`'s job, not this skill's. Do not fabricate docs to render.

### Why the split exists (the brand-voice resolution)

`document` renders the repo's docs; `brand-voice` forbids rendering internal strategy, specs, or decision logs verbatim on a user-facing surface. Both are right, and the mode is what reconciles them: **the public hub is curated and never shows raw internal logs; the internal portal shows them but is gated.** The prohibition is about *public* surfaces, and `public` mode honors it by construction. If you catch yourself about to render `PROMPTS.md` or `NOTES.md` on a public page, you are in the wrong mode.

### What "sanitized" means: project at the section level

File-level whitelisting is not enough. A file that is safe to render publicly (`PRODUCT.md`, `BRAND.md`) can still open with a section that is not, so a `public` surface that dumps the whole file leaks whatever the file happens to lead with (`PRODUCT.md`, for instance, opens with the frame: its intent, its unconfirmed assumptions, its open findings, and the security declarations). So "sanitized" is a **section-level projection**, and it is checkable:

- **Public-by-default** (safe to render externally): present-tense product truth (what it is, who it serves, core flows, non-goals), positioning and outward brand, design tokens, and a stated security *posture* summary (for example, "reports are private to their owner; the skills hold no user data").
- **Private-by-default** (curated OUT of a public render even when the containing file is public): the security frame's specifics (trust-boundary enumeration, authn/authz internals, secret-handling detail) beyond a posture summary; any entry still marked `assumed, unconfirmed`; open findings and unresolved blanks (`(finding: not yet declared)`); idea-risk and internal decision rationale; anything a hostile reader could turn into an attack map.

The test: if a line reads as intent, a hedge, an open question, or an attack hint, it belongs to the internal portal, not the public hub. So `public` mode renders a file's public sections only, or a deliberately sanitized projection of it; it never dumps a raw file that opens with a frame. Catching a `(finding:` or `(assumed,` marker on a public page is the same failure as catching `NOTES.md` there.

## The public hub

A `/behind` (or "insider") route with a tab bar. The kicker is "Behind the Build", the heading "How this was made". Curated, external-facing tabs only:

- **Overview**, the slide deck (below).
- **Design system**, `DESIGN.md`, ideally rendered from the tokens themselves so it cannot disagree with them.
- **Product**, `PRODUCT.md`, the forever spec (present-tense truth, written for a reader).
- **Brand**, `BRAND.md`, if it reads as outward brand rather than internal strategy.

No placeholders, no empty sections, no internal voice. If a doc still has template scaffolding or empty headings, either fill it for a reader or leave it out. Read docs through a whitelist (fixed filenames, no user input reaching the filesystem, secrets never in the set). If the framework's standalone output omits repo-root files, ensure the deploy artifact includes them, because they are read at runtime.

If the project has **no rendering surface** (a CLI, a library, a backend-only service), the public hub is out of scope: the internal portal is the repo itself on a private host, and the truth layer above is the whole job. Say so and stop. Do not invent a web surface to render into.

## The internal portal

The same rendering machinery, pointed at the full raw doc set (`PRODUCT`, `BRAND`, `DESIGN`, `PROMPTS`, `NOTES`, `FRICTION`) for continuity and inspection. It is gated: an authenticated route, or simply the repo itself on a private host. Placeholders and empty sections are fine here. They are honest state, not a marketing surface. Never expose the internal portal at a public URL.

## The overview deck

This is the project's story: authored, not just rendered, and it belongs on the public hub. Authoring the narrative is the heart of the presentation layer. The doc tabs render themselves. The deck is a written argument for why the project exists and what it does, and no renderer writes that for you.

A typed `Slide[]` array (one reference implementation) drives a keyboard-navigable deck: a title slide (name, tagline, a few stat chips) plus content slides. Each content slide has `category` (a kicker), `heading`, `body`, optional evidence `items`, a hairline `glyph` (a small monochrome geometric mark per slide, an abstract anchor, never an illustration), and a curated `quote` from the project's domain. The template is fixed, with a top-aligned header and a bottom-anchored quote, so nothing jumps between slides.

**Author the arc, then the slides.** Decide the story first, one slide per core idea, in order: the problem, the approach or what it is, who it is for, the method, the payoff or the gate, getting started. Each slide earns its place; if you cannot name what a slide teaches, cut it. Then write each slide tight and give it a glyph. The deck is the pitch; the doc tabs are the detail.

**Authored, never invented.** The deck forces you to explain what was built, for whom, and why it matters. Every one of those claims must be backed by something real: the frame, the forever spec, the instrumented funnel, shipped code. Never invent impact numbers, market positioning, customer quotes, or adoption evidence to make the story land. A deck that says "built to find out" where evidence does not exist yet is honest. One that manufactures traction is marketing fraud wearing a documentation skill.

## Reconcile: what a re-run checks

A re-run walks the truth layer and every presentation surface and brings them current. A run with nothing to change produces no diff. **End every reconcile with that convergence check**: on an unchanged project the touched-surface diff must be empty, and the report says so. If a second run of an unchanged project churns, you were rewriting, not reconciling.

The presentation surfaces, from least to most drift-prone:

- **The doc-set tabs** render from source, so they are inherently current. Confirm the whitelist still covers the intended docs (and, for the public hub, that it excludes the raw logs).
- **The overview deck** is hand-authored, so it is where drift lives. Check each slide against shipped capability: a shipped feature with no beat, or a slide describing something removed or renamed, is drift. Add the missing beat, fix or cut the stale one, leave accurate slides untouched.
- **The showcase copy**, any hardcoded enumeration of the product: landing demos, command lists, skill counts ("N skills"), feature lists. A new or renamed skill rots exactly here. Reconcile every count and list against reality.
- **Cross-surface agreement**: the same fact (a count, an ordering, a name) reads the same on every surface that repeats it.

## Idempotence rules

- **Detect before you create.** One public hub, one internal portal, one deck. A re-run reconciles them; it never spawns a second.
- **Update in place, add the missing, remove the stale.** Never duplicate a slide or a tab to "add" content that belongs in an existing one.
- **Preserve accurate prose.** Re-running only touches what drifted. Do not rewrite a slide, a doc, or copy that still tells the truth just because you are running the skill again.
- **Report the reconciliation.** Say what was already current, what you updated, added, removed, and any suspected regression you flagged. "All surfaces current" is a valid and common outcome.

## Red flags

- A doc-vs-code disagreement rewritten silently when it might be a regression -> classify first; a failing test or an intent claim means flag it, do not document the bug as the contract.
- Rendering `PROMPTS.md`, `NOTES.md`, or `FRICTION.md` on a public page -> wrong mode; raw logs are `internal` only.
- A placeholder or empty section on the public hub -> fill it for a reader or leave it out; never ship template scaffolding to a marketing surface.
- Treating `document` as create-once -> it is idempotent; re-run it any time, and a clean re-run is a no-op.
- A re-run that churns accurate slides, docs, or copy -> only touch what drifted.
- Adding or renaming a skill and not re-running `document` -> the deck and showcase copy are where that rots; re-run to reconcile them.
- Reading an arbitrary filename from a param -> whitelist the doc set; never let input reach the filesystem.
- Imposing a filesystem-mirror registry on a repo that never claimed one -> document architectural boundaries, not every file.
- Inventing impact, positioning, or customer evidence for the deck or showcase copy -> every claim traces to the frame, the spec, the funnel, or shipped code; absence of evidence is stated, not filled.
- Building a public hub for an internal service or private repo -> the showcase is conditional; truth layer + internal portal is the complete job there.
