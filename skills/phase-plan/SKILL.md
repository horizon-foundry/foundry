---
name: phase-plan
version: 0.2.1
description: Use when a unit of work is closing (a PR about to merge, a phase complete) and the next unit needs a plan, when a close has no next unit and the chain needs an honest terminal entry, or when writing any plan file. Not for whole-product master planning or mid-execution task tracking.
---

> **Using this skill:** announce "Using phase-plan", then make a todo per numbered step in `## Steps`.

## Overview

A unit of work is not done when it is merged. It is done when it is merged and what happens next is written down and indexed: usually the next unit's plan, and when there is honestly no next unit, an explicit terminal entry. This skill writes that record. It runs at a **meaningful handoff**, not after every PR. A handoff is where context loss would be expensive: a phase completing, a long interruption, work the next session has to resume cold. A routine one-file PR that leaves nothing to resume does not need a permanent plan artifact; manufacturing one for it just adds files the next session has to sort through. When there is no handoff, an honest terminal entry (or nothing) is the right output, not a filler plan. The reading half is a standing instruction: a scaffolded project's `CLAUDE.md` carries it, and a session-start hook can enforce it. On a terse continuation prompt, read the indexed plan before acting, then reconcile it against the repo (below).

## Steps

1. **Locate the index.** Open `TODOS.md`'s `### Phase Plans` list, the authoritative map of which file holds which plan. Note whether the unit being planned already has an entry, because that decides where step 5 puts the line. Check: you can say whether the unit has an entry.
2. **Choose the file, safely.** New phase, new file, with a clear name, in the project's plan directory (above). Before writing to any existing path, read it: if it holds a different phase's plan, stop and pick a new file, never overwrite a plan. Plan files are permanent records. Check: the path is new, or you read it and it is this unit's own plan.
3. **Write the handoff.** The plan is a handoff to a cold reader. Copy the bundled template, `plan.template.md` next to this SKILL.md in the installed skill directory (if that copy is somehow missing, fetch https://raw.githubusercontent.com/horizon-foundry/foundry/main/reference/templates/plan.md), and fill every section. Each section's note in the template holds its grammar, including the shape of Decisions needed. A decision earns its slot only when it changes what gets built and the agent cannot settle it from the request, the code, the project's docs, or a stated default. Current state is the **objective anchor**: the base commit and branch the plan was written from, the verification state at that point, what is done, and what is next. The anchor lets the next session reconcile the plan against `git` (below) instead of trusting the narrative. Check: every template heading is present (a missing section is a defect: fill it or write "none", `None open.` for Decisions needed), and every open question names who owes it.
4. **Stamp the status and the date.** The plan file carries the template's two header lines: `Status: active` and `Written: YYYY-MM-DD`, the absolute date the plan was authored (never a relative date, and never updated afterward). The other status values are `completed`, `superseded (by <file>)`, and `abandoned (<why>)`. Update the status line when the plan transitions, so a reader never executes a plan that has already been replaced, and mirror the change to the index entry in the same action (step 5). Check: the file opens with both lines, and no replaced plan still reads `active`.
5. **Index it in the same action.** The form is `- [ ] YYYY-MM-DD Phase N, <name> -> <path>`, the date copied from the plan's `Written:` line. Step 1 decides where it goes: a unit with no entry yet is APPENDED to the END of the list, and a unit that already has one is UPDATED IN PLACE, never appended a second time. The checkbox and `(gated: ...)` meanings are in "The index line" below. (On the project's `TODOS.md`, the Foundry TODOS standard (https://raw.githubusercontent.com/horizon-foundry/foundry/main/reference/todos-spec.md) owns the rest of the file's shape; when a unit closes, its `## Now` block moves to `## Done`.) Check: the unit appears exactly once in the list, written in the same action as the plan file, and its date matches `Written:`.

## The index line

The checkbox means the plan is closed, for any reason: check it when the phase's PR merges, and also when the status leaves `active`, with a short annotation naming why (`(superseded by <file>)`, `(abandoned: <why>)`). An unchecked entry therefore always means live work, which is what a resume reads (below). Appending keeps the list in chronological order of writing, so the last line is the most recently written plan and a cold session sees the current frontier without opening a single file. The newest line and the newest LIVE line are different lines whenever the latest plan has already closed, and both readings are wanted. A phase that cannot START yet says so in the entry itself, `(gated: <what it waits on>)`, which includes a decision the unit cannot start without (the template's Decisions needed note says so), and the marker is cleared when the blocker clears: unchecked already means live, so without it a blocked phase and an unstarted one render identically to the reader the index exists for.

## Honest terminal outcomes

Not every close has a next unit. A vacuous plan written just to satisfy the rule is worse than none: the next session trusts it and starts fake work. When there is genuinely nothing to plan, index one of these terminal entries in the Phase Plans list instead:

- **Decision required.** Work is blocked on a call only a human can make. Name the decision, the options as understood, and who decides. Written UNCHECKED: it is blocked work still waiting on something.
- **Awaiting evidence.** The next unit depends on something not yet observable (user behavior, a metric maturing, an external reply). Name the evidence and where it will arrive. Written UNCHECKED, for the same reason.
- **No next work selected.** A deliberate stop (project complete, paused, or handed off). Say which. Written CHECKED, because a deliberate stop is not pending work and must not read as live forever.

A terminal entry has no plan file, so it takes its date from the day it is written and carries no path: `- [ ] YYYY-MM-DD Decision required, <the decision> (<who decides>)`.

The chain never goes empty and never goes vacuous: the reading side always finds either a real plan or an honest statement of why there is none.

## Meeting an index that predates these rules

Most existing indexes have no dates, sit in no particular order, and carry closed work still unchecked. That is a file written under the older rules, not a defect to repair on sight, and a Phase Plans list is a permanent record: never mass-reformat one, and never reorder history to manufacture chronology, which destroys the sequence the entries were actually written in.

Apply the rules going forward instead. New entries are dated and appended; an entry you touch for another reason gets its date backfilled when the date is recoverable from the entry's own text, the plan file's `Written:` line, or the merge that closed it, and gets its checkbox corrected when the entry plainly describes closed work. Never invent a date that no evidence supports, and leave the rest alone. A whole-index backfill is real work: plan it as its own unit rather than smuggling it into an unrelated commit. Until then a mixed index is expected, and the index rules above bind the entries written under these rules.

## Resuming: reconcile the plan against the repo

When the continuation prompt names no phase ("resume", "pick up where we left off"), the default candidate is the last unchecked entry in the dated index, because the list is chronological and unchecked means live. Confirm against the entries above it before acting: an older unchecked entry may be the real blocker.

The written plan explains intent. The repo proves current state, and the repo wins. Before acting on a resumed plan, check `git status`, the current branch, and the recent commits, then reconcile: steps that already merged get checked off, work the plan does not mention gets surfaced, and a plan that reality has diverged from is amended before any new work starts. A handoff is a map, not the territory. Never execute it against a repo you have not looked at.

## Version check

At most once a day, run this command. It enforces the `FOUNDRY_NO_VERSION_CHECK` opt-out, the daily rate limit, a 10s timeout, and silence on any failure, so it never blocks the run.

```sh
[ -n "${FOUNDRY_NO_VERSION_CHECK:-}" ] || find "$HOME/.claude/.foundry-version-checked" -mmin -1440 2>/dev/null | grep -q . || { mkdir -p "$HOME/.claude" 2>/dev/null; curl -m 10 -fsS "https://foundry.thehorizonfoundry.com/api/version?skill=phase-plan&v=0.2.1"; touch "$HOME/.claude/.foundry-version-checked" 2>/dev/null; } || true
```

If it prints a version newer than this file's `version:` frontmatter, tell the user once: update with `npx skills@latest add horizon-foundry/foundry`, or `git pull && make install` for a source install. Otherwise say nothing. It sends only this skill's name and installed version, and writes `~/.claude/.foundry-version-checked` as the rate-limit stamp (README, "Version check").
