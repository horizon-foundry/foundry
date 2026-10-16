---
name: feature-design
version: 0.2.1
description: Use when a substantial feature is being designed inside an existing codebase, before any implementation plan is written. The builder declares the feature; the skill audits the declaration against the repository. Not an interview, not the implementation plan (phase-plan), not a verdict (production-audit).
---

# feature-design

> **Using this skill:** announce "Using feature-design", then make a todo per numbered step in `## Steps` and one per declaration entry audited. The declaration is the builder's: NEVER invent behavior, call sites, or decisions, and never turn this into a design interview.

## Overview

The second feature, and every feature after it, is designed inside a codebase that already has opinions. A design written from memory of that codebase carries a specific, repeatable failure: it proposes behavior the code already has (sometimes built and merely unreachable), names call sites a search cannot find, and depends on values nothing appears to produce. No interview catches these, because the answers are not in anyone's head. They are in the repository.

So this skill is "check my thinking against the code", never "help me think". The builder declares the feature in six entries; the skill grounds every proposed behavior and every named path in the actual repository and audits the declaration the way the suite audits code. The single highest-value outcome is the contradiction check no other moment performs: discovering before the plan is written that the feature is a reachability fix, not a build, or that a declared dependency has no producer the search can find.

## When NOT to use

- Deciding whether the product or the idea is worth building, or who it serves: `frame` owns product intent; this skill assumes a product already framed and audits one change inside it.
- Writing the implementation plan, its steps, or its index entry: `phase-plan` owns the handoff. A run that emits a Steps list has become that skill and must stop.
- Judging whether the built system is safe to ship: `production-audit` is the suite's only inspector and the only source of a verdict.
- Docs disagreeing with present-tense code: `document` owns drift; this skill audits a forward-looking declaration, not the doc set.
- A small change: no new behavior, no new surface, and no decision with a real alternative means there is no declaration worth auditing, and the overhead exceeds the change. Design it directly. (A one-file change or a bug fix is the common case of this.)

## The declaration, six entries

The builder declares; the skill audits. One page is the norm, as with the product frame; a declaration that keeps growing is usually failing entry 6. Entries the builder did not state are either drafted ONLY from what already exists (the backlog entry, the issue, a design document, prior notes, what the builder said this session), each drafted entry marked "assumed, unconfirmed" AND naming its source material, or left blank. A blank is a finding, never a question fired at the builder.

1. **Behavior.** What changes for the user or caller, as observable behavior, not implementation.
2. **Surface area.** Every call site, module, route, table, or job the change touches, each named as a path.
3. **Decisions.** Each significant choice with the alternative it beat and why. A decision with no rejected alternative is an assertion, and is reported as one.
4. **Non-goals.** What this deliberately does not do, including the adjacent thing a reader would assume it does. A non-goal without a reason is a finding.
5. **Verification.** What observation would show it works, and what observation would show the design is wrong. Both, or the entry is half-filled. When a named customer supplies the acceptance criteria, the entry names that source.
6. **Scope.** That this is one unit of work, and what was cut to make it one.

## Steps

Two paths run through these steps. Step 1 decides which.

- **Design run (the normal path).** Starts at step 1 and runs steps 1 to 6. It ends at the hand-off, and only on a `Confirmed` stamp.
- **Divergence audit.** Starts at step 1 when the code has already caught up with the declaration. It runs steps 2 to 4 and ends at the step 4 findings report: no step 5, no step 6, no hand-off. For this path, read `divergence-audit.md` in this skill's directory.

1. **Confirm the moment and the ground.** An existing codebase this run can read, and a substantial change to design inside it. Name two facts before anything else: whether declared product intent exists, and the declaration's tense (both defined in "Reading the ground" below). A declaration the code has already caught up with makes this a divergence audit. Check: the run names the repository read, the intent-record status, and the declaration's tense.
2. **Obtain the declaration.** The builder provides it against the six entries, or the draft path runs: assemble the entries ONLY from existing materials, marked and sourced per the rules above. A run pointed at a design document with no builder present this session takes the draft path in full, mapping that document's sections onto the six entries and stating the mapping as part of the draft. Check: no entry exists that the builder did not state and the draft did not mark assumed with its source named.
3. **Ground it in the code.** For every proposed behavior and every named path in the declaration, search the repository and record what is actually there, as the grounding table specified below. Searching directly and sequentially is always compliant; a single read-only search pass MAY instead be delegated where subagents exist; either way, say which happened. Never fan out further: a feature whose surface demands parallel sub-audits has already failed entry 6, and that finding must surface rather than be absorbed by parallelism. Check: the table exists with both sections and a stated search mode.
4. **Audit the declaration.** Report findings against the entry numbers and the grounding table, under the quoting, ordering and questions rules in "Findings" below. Check: every finding carries its entry number and its quotes, and the questions section is labeled.
5. **The builder resolves and confirms.** Revisions, or explicitly accepted gaps that stay visible in the declaration. On confirmation, the declaration is stamped `Confirmed: <date>`; where no human can answer this session, it is stamped `Audited, unconfirmed: <date>`. Confirmation is a lookup, never a memory: a later consumer trusts the stamp in the document, not a recollection that someone approved it. Check: the stamp exists and matches what actually happened.
6. **Hand off, writing nothing this skill does not own.** The run's own artifact is the findings report in the run output. Land the confirmed declaration by the rules in "Hand-off destinations" below; `phase-plan` then folds it into the next unit's plan. An `Audited, unconfirmed` declaration does not hand off (it waits for the builder). Check: this run wrote no plan file, touched no plan index, created no file in an undeclared location, and handed off only on a `Confirmed` stamp.

## Reading the ground

Step 1's two facts:

- **Declared product intent.** In this suite's doc set that is PRODUCT.md's confirmed frame; outside it ANY project document answering who this is for and why counts (a brief, a PRD). The finding is for silence, never for format, and the audit proceeds either way.
- **The declaration's tense.** Whether work implementing it has already merged or is in flight. Branch names, recent commits, and the declaration's own date are the evidence.

## The grounding table

Step 3's artifact. One row per proposed behavior and per named path, with these columns:

- **Proposed item.**
- **What the code has today**, with `file:line` or "not found by search".
- **Resolution**, one of **absent / partial / already present / present but unreachable / present, diverged** (the code does something materially different from the declared shape).

A "not found by search" is strong evidence, not proof of absence: dynamic dispatch, config-driven wiring, and generated code hide from grep, and the table says "found no X" rather than "there is no X".

The table then carries a mandatory **reverse pass** section, even when empty ("reverse pass: none found"): what the grounding shows the change must touch that entry 2 does not name, at the granularity the declaration itself chose (a declaration naming symbols is audited symbol by symbol, one naming files, file by file), each a row marked **unrequested**.

Blank cells are findings. Without this table, including its reverse section, the skill did not run.

## Findings

Step 4's rules. Every code-grounded finding quotes what motivated it: the code line, and for a contradiction, the declaration line beside it. A candidate finding that cannot quote its line is not reported as a finding; it becomes a question, stated exactly, and questions live in a labeled section of the findings report, never posed to the builder conversationally. A report with more questions than code-grounded findings is itself a red flag.

The code-grounded core, in the order it pays:

1. The code already does this (highest-value sub-case: built but unreachable, which makes the change a reachability fix and the declared scope wrong).
2. A named call site is not found by search.
3. A touched surface is missing from entry 2.
4. A declared dependency has no producer the search finds, or a produced value no consumer.

Then the declaration-quality findings: assertion-decisions, unfalsifiable verification, blank or trivial non-goals, multi-unit scope.

## Hand-off destinations

Step 6's rule: this skill never invents a home. The confirmed declaration lands where the TARGET project's docs say design records live, and an undeclared home is reported as a finding. Decisions with their rejected alternatives go to the project's decision record where the project declares one; absent that, they stay inside the confirmed declaration. The feature's success signal goes to `instrumentation` where the project carries one; absent that, the declaration's verification entry already records it.

## Red flags

- Severity ratings, finding IDs, JSON output, or a verdict in the report.
- A pre-build declaration surviving unchanged after the table found the behavior already present.

## Version check

At most once a day, run this command. It enforces the `FOUNDRY_NO_VERSION_CHECK` opt-out, the daily rate limit, a 10s timeout, and silence on any failure, so it never blocks the run.

```sh
[ -n "${FOUNDRY_NO_VERSION_CHECK:-}" ] || find "$HOME/.claude/.foundry-version-checked" -mmin -1440 2>/dev/null | grep -q . || { mkdir -p "$HOME/.claude" 2>/dev/null; curl -m 10 -fsS "https://foundry.thehorizonfoundry.com/api/version?skill=feature-design&v=0.2.1"; touch "$HOME/.claude/.foundry-version-checked" 2>/dev/null; } || true
```

If it prints a version newer than this file's `version:` frontmatter, tell the user once: update with `npx skills@latest add horizon-foundry/foundry`, or `git pull && make install` for a source install. Otherwise say nothing. It sends only this skill's name and installed version, and writes `~/.claude/.foundry-version-checked` as the rate-limit stamp (README, "Version check").
