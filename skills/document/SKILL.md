---
name: document
version: 0.2.1
description: Use to keep a project's documentation true to the code and current across every surface, or to turn the repo's own docs into a product surface (the public hub, the overview deck, showcase copy). Modes: public, internal, reconcile. Not for creating a doc set from nothing (that is scaffold) or judging release readiness (that is production-audit).
---

# document

> **Using this skill:** announce "Using document" and the mode (`public`, `internal`, or `reconcile`), then make a todo per numbered step of the chosen mode in `## Steps`.

## Overview

Documenting a project is a lifecycle stage, not a favor you do when asked. The build sequence is scaffold, build, **document**, audit, ship. The document step is the one that silently gets skipped, because nobody is blocked without it. The cost lands later: a cold-start agent has no map, a stakeholder cannot see what was built, and worst, a wrong doc gets trusted and built on.

This skill owns the project's words on two layers. **Truth**: the docs must agree with the running code (a wrong doc is worse than no doc). **Presentation**: the docs become a live surface (the overview deck, the "Behind the Build" hub) so they cannot rot unseen. User-invoked and idempotent: a run that finds everything current changes nothing. Assumes the doc set defined by the suite's doc-set spec, `reference/doc-set-spec.md` in the repo; an install ships only this skill's directory, so from anywhere else read it at https://raw.githubusercontent.com/horizon-foundry/foundry/main/reference/doc-set-spec.md.

## When NOT to use

- The doc set does not exist yet: that is `scaffold`; this skill reconciles what exists and never fabricates docs to render.
- The question is whether the product is safe to ship: `production-audit` issues verdicts; this skill maintains truth and surfaces.
- The work is defining or enforcing voice and tone: `brand-voice` owns the words' sound; this skill owns where docs render and whether they are true.
- A doc disagrees with runtime behavior and the fix would change the code: never from here; flag the suspected regression and let a human decide.

## Steps

The sections after this one are the reference each step points at.

### public

0. Confirm an external audience is declared or confirmed by the human. When in doubt the mode is `internal`, never `public`. Check: the audience confirmation, named in the report.
1. Run the truth checklist. Artifact: the per-item report, each item pass, repaired, or regression-flagged.
2. Establish or reconcile the public hub and the overview deck. For the hub, read `hub.md` in this skill's directory; for the deck, read `deck.md`. Check: one hub, one deck, established or reconciled, never a second.
3. Run the sanitization sweep. For what sanitized means and the pre-publish checklist, read `sanitization.md` in this skill's directory. Check: zero marker hits, and every publicly rendered section listed with its public-or-private call.
4. Close with the convergence statement: what was already current, what changed, and that on a re-run of an unchanged project the touched-surface diff is empty and the report says so.

### internal

1. Run the truth checklist. Artifact: the per-item report.
2. Establish or reconcile the internal portal. For the portal, read `portal.md` in this skill's directory. Check: the full raw doc set renders behind a gate or on a private host.
3. Confirm no public surface was created or exposed by this run. Check: that confirmation stated in the report.
4. Close with the convergence statement (as in `public` step 4).

### reconcile

1. Run the truth checklist. Artifact: the per-item report.
2. Pull every existing presentation surface current (see "Reconcile: what a re-run checks"; for the public hub read `hub.md`, for the deck read `deck.md`, and run the `sanitization.md` checklist on any public section that changes, all in this skill's directory). Check: a per-surface line in the report, current or updated.
3. Run the cold-start drill (see that section). Artifact: the drill result, pass or a doc-set finding per failed check.
4. End with the convergence check: on an unchanged project the touched-surface diff is empty, and the report says so.

## Keep the docs true to the code

The failure this prevents: an agent reads a stale doc, believes it, and acts on a false premise. So on every run, and before any unit of work closes, reconcile the docs against what the code actually does.

**The authority model.** Code is the truth for *what the system does*: when a doc describes behavior the code no longer has, repair the doc to match observed behavior. But code is **not** automatically the truth for what the system *should* do. Five sources carry authority over different things: **code** (current behavior), **tests** (expected behavior), **product requirements / the forever spec** (intended behavior), **decision records** (accepted constraints), **docs** (the communicated contract). When they disagree, classify before repairing:

- **Deterministic mismatch** (a renamed flag, a wrong path, a stale count, a moved file): repair the doc directly. This is the common case and it is safe.
- **Suspected regression** (the doc-vs-code disagreement coincides with a failing test, a contradicted decision record in `NOTES.md`, or a doc that states the behavior as *designed intent*): do **not** silently rewrite the doc to document the new behavior. That would turn a bug into the product's contract. Flag it as a suspected regression and let a human decide which side is wrong.
- **Recalled memory versus the record** (the harness surfaces a fact from an earlier session that the docs contradict): memory is not one of the five authorities. It is per-user, machine-local, and unreviewable, so it never outranks a declared record and never justifies a repair on its own. Treat the disagreement as a signal that one of the two is stale, and surface it rather than silently reconciling either side.

Never change working behavior to satisfy a wrong doc; runtime changes require explicit instruction.

## The truth checklist

Run against the documentation and the externally-meaningful contracts a change touched (the CLI/API surface, config, schema, runtime artifacts, the display strings docs actually quote), not every source file read during a large session; scope to what the change altered and to what the docs claim. The per-item report (step 1 of every mode) states pass, the repair made, or the regression flagged:

1. **CLI/API surface and components**, documented flags, args, endpoints, components, routes, and services exist in the code (the parser/router for flags, args, and endpoints); examples use realistic values of the right type.
2. **Runtime artifacts**, anything the code writes at runtime (log, cache, temp file) is documented and gitignored.
3. **Config semantics**, `.env.example` comments match runtime optionality and the actual loading mechanism (auto-load vs manual source); a field the code requires is documented as required, and one it treats as optional is documented as optional.
4. **Display values**, hardcoded strings quoted in docs match the source, including the visual result of any CSS transform.
5. **Cross-document**, counts, orderings, and lists agree across every doc that repeats them, in order and in count (the same fact in `CLAUDE.md`, `README.md`, and `TODOS.md` must agree). When a fact is duplicated, prefer removing it and leaving a pointer over normalizing the same fact in many places.
6. **Forever spec**, `PRODUCT.md` describes only what exists, so an unshipped feature is never described as present; unshipped work lives in `TODOS.md` and plan files. Roadmaps, proposals, and plan files are exempt because they are forward-looking by declaration.
7. **Registry (only where one is claimed)**, if the docs maintain a file or component registry, every listed entry exists and every file is listed. Do not impose a filesystem-mirror registry on a project whose docs never claimed one.

## Self-maintenance: NOTES.md, PROMPTS.md, and FRICTION.md

This is an ongoing cadence during work, not a step of any mode. For what each of `NOTES.md`, `PROMPTS.md`, and `FRICTION.md` records and in what shape, read `self-maintenance.md` in this skill's directory.

The cadence: a decision worth preserving updates `NOTES.md` before moving on; a finished unit of work appends a `PROMPTS.md` phase entry; observed friction lands in `FRICTION.md` when observed, not at session end; and finalizing any unit of work verifies all three are current (the truth-checklist run is the natural moment).

## Three modes: public, internal, reconcile

A documentation *surface* serves one of two audiences, and those audiences want opposite things. The mode names which you are building.

- **`document public`** builds and maintains the **public** hub: a curated, external-facing surface for someone who does not know the project. It renders only the finished, sanitized docs (the overview deck, the design system, the forever spec, the brand); it **never** renders raw session logs, decision records, or friction notes. Written for a reader, not for continuity.
- **`document internal`** builds and maintains the **internal** portal: the raw source docs rendered directly (including `PROMPTS.md`, `NOTES.md`, `FRICTION.md`), optimized for continuity and inspection. Private or authenticated, never a public URL. Because it is gated, rendering raw internal docs here is fine.
- **`document reconcile`** is the idempotent update pass over both the truth layer (docs versus code, above) and whichever presentation surfaces exist: pull each back up to date with what shipped, change nothing already current.

**The showcase is conditional on the project type.** A public product, an OSS tool, a portfolio piece, or consulting output wants the deck and the public hub. An internal service, a private repo, or an experiment gets the truth layer and (at most) the internal portal. Building a marketing surface for a project with no external audience is drift of a different kind.

**Establish, then reconcile.** The first time you run `public` or `internal`, no hub exists, so you establish it. Every run after is a reconcile: one hub per mode, never a second. If the doc set itself does not exist yet, that is `scaffold`'s job, not this skill's. Do not fabricate docs to render.

**The rule shared with `brand-voice`:** raw internal logs never reach a public URL, and `brand-voice` defers to this skill for that rule; the modes enforce it by construction (the public hub is curated, the internal portal is gated).

## Reconcile: what a re-run checks

A run with nothing to change produces no diff; if a second run of an unchanged project churns, you were rewriting, not reconciling.

The presentation surfaces, from least to most drift-prone:

- **The doc-set tabs** render from source, so they are inherently current. Confirm the whitelist still covers the intended docs (and, for the public hub, that it excludes the raw logs).
- **The overview deck** is hand-authored, so it is where drift lives. Check each slide against shipped capability: a shipped feature with no beat, or a slide describing something removed or renamed, is drift. Add the missing beat, fix or cut the stale one, leave accurate slides untouched.
- **The showcase copy**, any hardcoded enumeration of the product: landing demos, command lists, skill counts ("N skills"), feature lists. A new or renamed skill rots exactly here. Reconcile every count and list against reality.
- **The changelog**, where the project keeps one: every entry traces to shipped work, and no shipped user-visible change is missing.
- **Cross-surface agreement**: the same fact (a count, an ordering, a name) reads the same on every surface that repeats it.

### The cold-start drill

A fresh-context subagent is given only the repo and a terse continuation prompt ("continue", "start the next phase") and must: (1) locate the Master Plan index, (2) open the plan file it names, (3) reconcile that plan against git state, (4) name the correct next action, (5) follow the README's setup steps in a fresh checkout to a running app, naming any step that needs a secret as a declared degradation, and (6) say, from the docs alone, how to run, deploy, and roll back the system. A failure at any step is a doc-set finding, exactly like drift. Where subagents are unavailable, do not skip silently: state the manual drill (the operator runs the same checks by hand in a fresh session) and open the run's report with a declaration naming the degradation and its reason, per the suite standard's declared-degradation rule.

## Idempotence rules

- **Detect before you create.** A re-run reconciles the existing hub, portal, and deck; it never spawns a second.
- **Update in place, add the missing, remove the stale.** Never duplicate a slide or a tab to "add" content that belongs in an existing one.
- **Preserve accurate prose.** Re-running only touches what drifted; never rewrite a slide, doc, or copy that still tells the truth.
- **Report the reconciliation.** Name what was current, what changed, and any regression flagged; "all surfaces current" is a valid and common outcome.

## Version check

At most once a day, run this command. It enforces the `FOUNDRY_NO_VERSION_CHECK` opt-out, the daily rate limit, a 10s timeout, and silence on any failure, so it never blocks the run.

```sh
[ -n "${FOUNDRY_NO_VERSION_CHECK:-}" ] || find "$HOME/.claude/.foundry-version-checked" -mmin -1440 2>/dev/null | grep -q . || { mkdir -p "$HOME/.claude" 2>/dev/null; curl -m 10 -fsS "https://foundry.thehorizonfoundry.com/api/version?skill=document&v=0.2.1"; touch "$HOME/.claude/.foundry-version-checked" 2>/dev/null; } || true
```

If it prints a version newer than this file's `version:` frontmatter, tell the user once: update with `npx skills@latest add horizon-foundry/foundry`, or `git pull && make install` for a source install. Otherwise say nothing. It sends only this skill's name and installed version, and writes `~/.claude/.foundry-version-checked` as the rate-limit stamp (README, "Version check").
