---
name: phase-plan
version: 0.2.0
description: Use when a unit of work is closing (a PR about to merge, a phase complete) and the next unit needs a plan, when a close has no next unit and the chain needs an honest terminal entry, or when writing any plan file. Writes the handoff while context is warm and indexes it so the next session can resume. Not for whole-product master planning or mid-execution task tracking.
---

# phase-plan

> **Using this skill:** announce "Using phase-plan", make a todo per numbered step in `## Steps`, and do not skip the gates. This skill's worth is its process, not a hand-reproduced outcome. If you were told to "run phase-plan", run it, do not improvise its result. (Suite standard: https://github.com/horizon-foundry/foundry/blob/main/reference/skill-authoring.md)

## Overview

A unit of work is not done when it is merged. It is done when it is merged and what happens next is written down and indexed: usually the next unit's plan, and when there is honestly no next unit, an explicit terminal entry. This skill writes that record. It runs at a **meaningful handoff**, not after every PR. A handoff is where context loss would be expensive: a phase completing, a long interruption, work the next session has to resume cold. A routine one-file PR that leaves nothing to resume does not need a permanent plan artifact; manufacturing one for it just adds files the next session has to sort through. When there is no handoff, an honest terminal entry (or nothing) is the right output, not a filler plan. The reading half is a standing instruction: a scaffolded project's `CLAUDE.md` carries it, and a session-start hook can enforce it. On a terse continuation prompt, read the indexed plan before acting, then reconcile it against the repo (below).

## Why plan at the end, not the start

Most planning happens when context is weakest: at the start of a fresh session, reconstructed cold. Plan the next unit when context is strongest instead, right after finishing the last one. The next session then opens on a plan written while the work was warm, not a cold guess, and the user never has to ask whether the next plan exists.

## When NOT to use

- Planning a whole product or its phase set from scratch: that is the master plan, a different artifact this skill links to but does not author.
- Tracking tasks mid-execution: the harness's own todo list owns in-flight work; the plan chain records handoffs between sessions.
- A routine PR that leaves nothing to resume: the honest output is no plan or a terminal entry, never a filler artifact.
- Recording decisions or product truth: NOTES.md and the forever spec own those; a plan is a handoff, not a record of why.

## The rule: write and index atomically

A plan file is written **and** its path is added to the project's `TODOS.md` Master Plan / Phase Plans index **in the same action**. An unindexed plan is invisible after a `/clear`, so writing without indexing is the same as not writing it.

Plans live in one project-declared directory, named in the project's `CLAUDE.md` (a maintainer may keep a global plans directory outside the repo; a project with no declaration defaults to `<project>/plans/`). The index line's path is written exactly as the next session should open it.

## Steps

1. **Locate the index.** Open `TODOS.md`'s `### Phase Plans` list. It is the authoritative map of which file holds which plan; note whether the unit being planned already has an entry, because that decides the next step.
2. **Choose the file, safely.** New phase, new file, with a clear name, in the project's plan directory (above). Before writing to any existing path, read it: if it holds a different phase's plan, stop and pick a new file, never overwrite a plan. Plan files are permanent records.
3. **Write the handoff.** The plan is a handoff to a cold reader. Copy the bundled template, `plan.template.md` next to this SKILL.md in the installed skill directory (if that copy is somehow missing, fetch https://raw.githubusercontent.com/horizon-foundry/foundry/main/reference/templates/plan.md), and fill every section. The shape:

   ```
   Status: active
   Written: YYYY-MM-DD

   ## Goal
   ## Kickoff decisions
   ## Steps
   ## Acceptance criteria
   ## Dependencies
   ## Non-goals
   ## Risks
   ## Current state
   ```

   Current state is the **objective anchor**: the base commit and branch the plan was written from, the verification state at that point (build, tests, and any audit passing or not), what is done, and what is next. The anchor is what lets the next session reconcile the plan against `git` (below) instead of trusting the narrative. A missing section is a defect: fill it or write "none", never drop the heading.
4. **Stamp the status and the date.** The plan file carries the template's two header lines: `Status: active` and `Written: YYYY-MM-DD`, the absolute date the plan was authored (never a relative date, and never updated afterward). The other status values are `completed`, `superseded (by <file>)`, and `abandoned (<why>)`. Update the status line when the plan transitions, so a reader never executes a plan that has already been replaced; when it transitions, mirror the change to the index entry in the same action (next step).
5. **Index it in the same action.** The form is `- [ ] YYYY-MM-DD Phase N, <name> -> <path>`, the date copied from the plan's `Written:` line. Which of the two branches from step 1 applies decides where it goes: a unit with no entry yet is APPENDED to the END of the list, and a unit that already has one is UPDATED IN PLACE, never appended a second time, because a unit appears exactly once. Appending keeps the list in chronological order of writing, so the last line is the most recently written plan and a cold session sees the current frontier without opening a single file. The checkbox means the plan is closed, for any reason: check it when the phase's PR merges, and also when the status leaves `active`, with a short annotation naming why (`(superseded by <file>)`, `(abandoned: <why>)`). An unchecked entry therefore always means live work, which is what a resume reads (below); the newest line and the newest LIVE line are different lines whenever the latest plan has already closed, and both readings are wanted.

## Honest terminal outcomes

Not every close has a next unit. A vacuous plan written just to satisfy the rule is worse than none: the next session trusts it and starts fake work. When there is genuinely nothing to plan, index one of these terminal entries in the Phase Plans list instead:

- **Decision required.** Work is blocked on a call only a human can make. Name the decision, the options as understood, and who decides.
- **Awaiting evidence.** The next unit depends on something not yet observable (user behavior, a metric maturing, an external reply). Name the evidence and where it will arrive.
- **No next work selected.** A deliberate stop (project complete, paused, or handed off). Say which.

A terminal entry has no plan file, so it takes its date from the day it is written and carries no path: `- [ ] YYYY-MM-DD Decision required, <the decision> (<who decides>)`. The checkbox follows the same meaning as everywhere else, live work is unchecked. Decision required and Awaiting evidence stay UNCHECKED, because each is blocked work still waiting on something. No next work selected is written CHECKED, because a deliberate stop is not pending work and must not read as live forever.

The chain never goes empty and never goes vacuous: the reading side always finds either a real plan or an honest statement of why there is none.

## Meeting an index that predates these rules

Most existing indexes have no dates, sit in no particular order, and carry closed work still unchecked. That is a file written under the older rules, not a defect to repair on sight, and a Phase Plans list is a permanent record: never mass-reformat one, and never reorder history to manufacture chronology, which destroys the sequence the entries were actually written in.

Apply the rules going forward instead. New entries are dated and appended; an entry you touch for another reason gets its date backfilled when the date is recoverable from the entry's own text, the plan file's `Written:` line, or the merge that closed it, and gets its checkbox corrected when the entry plainly describes closed work. Never invent a date that no evidence supports, and leave the rest alone. A whole-index backfill is real work: plan it as its own unit rather than smuggling it into an unrelated commit. Until then a mixed index is expected, and the red flags below apply to entries written under these rules.

## Resuming: reconcile the plan against the repo

When the continuation prompt names no phase ("resume", "pick up where we left off"), the default candidate is the last unchecked entry in the dated index, because the list is chronological and unchecked means live. Confirm against the entries above it before acting: an older unchecked entry may be the real blocker.

The written plan explains intent. The repo proves current state, and the repo wins. Before acting on a resumed plan, check `git status`, the current branch, and the recent commits, then reconcile: steps that already merged get checked off, work the plan does not mention gets surfaced, and a plan that reality has diverged from is amended before any new work starts. A handoff is a map, not the territory. Never execute it against a repo you have not looked at.

## Red flags

Symptoms that you skipped something above, not new rules: a plan file written without touching `TODOS.md`; an existing plan file about to be written over; a meaningful handoff closed with neither an indexed plan nor a terminal entry; a filler plan written because "the chain must not go empty"; a plan resumed without checking git state; a plan file with no status line, or one still marked active after being replaced; an index entry with no date, or entries out of chronological order; a status change stamped in the plan file but never mirrored to its index entry.

## Version check

At most once a day, a run of this skill checks whether a newer suite exists. The command enforces the whole contract: the `FOUNDRY_NO_VERSION_CHECK` opt-out, the daily stamp-file rate limit, a 10s timeout, and silence on any failure. Never block or fail a run over this check.

```sh
[ -n "${FOUNDRY_NO_VERSION_CHECK:-}" ] || find "$HOME/.claude/.foundry-version-checked" -mmin -1440 2>/dev/null | grep -q . || { mkdir -p "$HOME/.claude" 2>/dev/null; curl -m 10 -fsS "https://foundry.thehorizonfoundry.com/api/version?skill=phase-plan&v=0.2.0"; touch "$HOME/.claude/.foundry-version-checked" 2>/dev/null; } || true
```

If the response carries a version newer than this file's `version:` frontmatter, tell the user once: a newer Foundry suite is out; update with `npx skills@latest add horizon-foundry/foundry`, or `git pull && make install` for a source install. If it prints nothing, fails, or the versions match, say nothing and proceed. What it sends: this skill's name and installed version, nothing else; it writes `~/.claude/.foundry-version-checked` as the rate-limit stamp (full disclosure: the README section "Version check").
