---
name: phase-plan
description: Use when a unit of work is finishing (a PR is about to merge, a phase is complete) and the next unit needs a plan, or when writing any plan file. Writes the next unit's plan while context is warm and indexes it so the next session can resume from it; when there is genuinely no next unit, indexes an honest terminal entry (decision required, awaiting evidence, or no next work selected) instead of a vacuous plan.
---

# phase-plan

> **Using this skill:** announce "Using phase-plan", make a todo per step below, and do not skip the gates. This skill's worth is its process, not a hand-reproduced outcome. If you were told to "run phase-plan", run it, do not improvise the result. (Suite standard: https://github.com/horizon-foundry/foundry/blob/main/reference/skill-authoring.md)

## Overview

A unit of work is not done when it is merged. It is done when it is merged and what happens next is written down and indexed: usually the next unit's plan, and when there is honestly no next unit, an explicit terminal entry. This skill writes that record. It runs at a **meaningful handoff**, not after every PR. A handoff is where context loss would be expensive: a phase completing, a long interruption, work the next session has to resume cold. A routine one-file PR that leaves nothing to resume does not need a permanent plan artifact; manufacturing one for it just adds files the next session has to sort through. When there is no handoff, an honest terminal entry (or nothing) is the right output, not a filler plan. The reading half is a standing instruction: a scaffolded project's `CLAUDE.md` carries it, and a session-start hook can enforce it. On a terse continuation prompt, read the indexed plan before acting, then reconcile it against the repo (below).

## Why plan at the end, not the start

Most planning happens when context is weakest: at the start of a fresh session, reconstructed cold. Plan the next unit when context is strongest instead, right after finishing the last one. The next session then opens on a plan written while the work was warm, not a cold guess, and the user never has to ask whether the next plan exists.

## The rule: write and index atomically

A plan file is written **and** its path is added to the project's `TODOS.md` Master Plan / Phase Plans index **in the same action**. An unindexed plan is invisible after a `/clear`, so writing without indexing is the same as not writing it.

## Steps

1. **Locate the index.** Open `TODOS.md`'s `### Phase Plans` list. It is the authoritative map of which file holds which plan.
2. **Choose the file, safely.** New phase, new file, with a clear name. Before writing to any existing path, read it: if it holds a different phase's plan, stop and pick a new file, never overwrite a plan. Plan files are permanent records.
3. **Write the handoff.** The plan is a handoff to a cold reader. Its fields: the goal and why now; kickoff decisions already made; the steps; **acceptance criteria** (how the next session knows the unit is done, checkable); **dependencies** (what must merge, exist, or be answered first); **non-goals** (what this unit deliberately does not touch); the risks; and the current state, **anchored to the repo objectively**, not just prose: the base commit and branch the plan was written from, the verification state at that point (build, tests, and any audit passing or not), what is done, and what is next. The objective anchor is what lets the next session reconcile the plan against `git` (below) instead of trusting the narrative. Enough that a fresh agent can act without re-deriving.
4. **Stamp the status.** The plan file opens with a status line: `Status: active`. The other values are `completed`, `superseded (by <file>)`, and `abandoned (<why>)`. Update the line when the plan transitions, so a reader never executes a plan that has already been replaced.
5. **Index it in the same action.** Add `- [ ] Phase N, <name> -> <path>` to the Phase Plans list. Keep the checkboxes current: check the box when that phase's PR merges. A superseded plan's entry points at its successor.

## Honest terminal outcomes

Not every close has a next unit. A vacuous plan written just to satisfy the rule is worse than none: the next session trusts it and starts fake work. When there is genuinely nothing to plan, index one of these terminal entries in the Phase Plans list instead:

- **Decision required.** Work is blocked on a call only a human can make. Name the decision, the options as understood, and who decides.
- **Awaiting evidence.** The next unit depends on something not yet observable (user behavior, a metric maturing, an external reply). Name the evidence and where it will arrive.
- **No next work selected.** A deliberate stop (project complete, paused, or handed off). Say which.

The chain never goes empty and never goes vacuous: the reading side always finds either a real plan or an honest statement of why there is none.

## Resuming: reconcile the plan against the repo

The written plan explains intent. The repo proves current state, and the repo wins. Before acting on a resumed plan, check `git status`, the current branch, and the recent commits, then reconcile: steps that already merged get checked off, work the plan does not mention gets surfaced, and a plan that reality has diverged from is amended before any new work starts. A handoff is a map, not the territory. Never execute it against a repo you have not looked at.

## Red flags

- Wrote a plan file but did not touch `TODOS.md` -> it is invisible; index it now.
- About to write over an existing plan file -> read it first; if it is a different plan, use a new file.
- Closing a meaningful handoff (a phase, a resumable unit) with no indexed plan and no terminal entry -> the chain just went empty; write one before you move on. (A routine PR that leaves nothing to resume needs neither.)
- Writing a filler plan because "the chain must not go empty" -> the chain accepts honest terminal entries; a vacuous plan poisons the next session.
- Resuming from a plan without checking git state -> the plan may predate merged or abandoned work; reconcile first.
- A plan file with no status line, or one still marked active after being replaced -> stamp it; a stale active plan is a trap.
