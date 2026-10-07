<!-- Plan-file template: the handoff a next session resumes from. Copy, fill every section, and index the path in TODOS.md (the phase-plan skill owns the mechanics). -->

Status: active
Written: YYYY-MM-DD
<!-- Status enum: active | completed | superseded (by <file>) | abandoned (<why>) -->
<!-- Written is the absolute date the plan was authored. It never changes after that; the same date leads the plan's index entry in TODOS.md. -->

## Goal

*What this unit delivers, and why now.*

## Kickoff decisions

*Decisions already made; carry them forward, do not re-litigate them.*

## Decisions needed

*What the human must decide, set apart so it is read first and answered in one shape. Each decision is a numbered item whose first bold run is the question, followed by a sentence of context. Options are sub-bullets: `[x]` marks the recommended default (exactly one) and `[ ]` the others, with a note after the first `: `. A decision with no options takes a free-text answer. A settled decision gets a line starting `Decided YYYY-MM-DD:`. With nothing to decide, write `None open.` A decision the human did not answer is not agreement: work may go ahead on the `[x]` default, recorded as unanswered, unless the item says the work waits on it; work that depends on an unanswered free-text decision waits.*

## Open questions

*What is still undecided and owed by someone other than the human, each tagged with who owes the answer (a named review, an external party, a measurement). An unowned question is how a plan stalls without anyone noticing.*

## Steps

*The work in order, each step ending in something checkable.*

## Acceptance criteria

*How the next session knows the unit is done. Each criterion checkable, not vibes.*

## Dependencies

*What must merge, exist, be answered, or be proven before this unit can start. A dependency may be a named hypothesis plus the proof that would clear it.*

## Non-goals

*What this unit deliberately does not touch.*

## Risks

*What could go wrong, and what to watch for.*

## Current state

*Objective anchor at time of writing: base commit, branch, and verification state (build, tests, any audit passing or not).*
