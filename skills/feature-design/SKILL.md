---
name: feature-design
version: 0.1.0
description: Use when a substantial feature is being designed inside a codebase that already exists, before any implementation plan is written. The builder declares the feature (behavior, surface area, decisions with the alternative each beat, non-goals, verification, scope); the skill audits that declaration against the repository and reports what the code contradicts or already provides, with file and line cited on every code-grounded finding. Blanks are findings. It never interviews the builder toward a design, never writes the implementation plan (that is phase-plan), and never issues a release verdict (that is production-audit).
---

# Feature Design

> **Using this skill:** announce "Using feature-design", make a todo per numbered step in `## Steps` and one per declaration entry audited, and do not skip the gates. The declaration is the builder's: NEVER invent behavior, call sites, or decisions, and never turn this into a design interview. This skill's worth is its process, not a hand-reproduced outcome. If you were told to "run feature-design", run it, do not improvise its result. (Suite standard: https://github.com/horizon-foundry/foundry/blob/main/reference/skill-authoring.md)

## Overview

The second feature, and every feature after it, is designed inside a codebase that already has opinions. A design written from memory of that codebase carries a specific, repeatable failure: it proposes behavior the code already has (sometimes built and merely unreachable), names call sites that do not exist, and depends on values nothing produces. No interview catches these, because the answers are not in anyone's head. They are in the repository.

So this skill is "check my thinking against the code", never "help me think". The builder declares the feature in six entries; the skill grounds every proposed behavior and every named path in the actual repository and audits the declaration the way the suite audits code. The single highest-value outcome is the contradiction check no other moment performs: discovering before the plan is written that the feature is a reachability fix, not a build, or that a declared dependency has no producer.

## When NOT to use

- Deciding whether the product or the idea is worth building, or who it serves: `frame` owns product intent; this skill assumes a product already framed and audits one change inside it.
- Writing the implementation plan, its steps, or its index entry: `phase-plan` owns the handoff. A run that emits a Steps list has become that skill and must stop.
- Judging whether the built system is safe to ship: `production-audit` is the suite's only inspector and the only source of a verdict.
- Docs disagreeing with present-tense code: `document` owns drift; this skill audits a forward-looking declaration, not the doc set.
- A one-file change or a bug fix: there is no declaration worth auditing, and the overhead exceeds the change. Design it directly.

## The declaration, six entries

The builder declares; the skill audits. Entries the builder did not state are either drafted ONLY from what already exists (the backlog entry, the issue, prior notes, what the builder said this session) with every drafted entry marked "assumed, unconfirmed", or left blank. A blank is a finding, never a question fired at the builder.

1. **Behavior.** What changes for the user or caller, as observable behavior, not implementation.
2. **Surface area.** Every call site, module, route, table, or job the change touches, each named as a path.
3. **Decisions.** Each significant choice with the alternative it beat and why. A decision with no rejected alternative is an assertion, and is reported as one.
4. **Non-goals.** What this deliberately does not do, including the adjacent thing a reader would assume it does. A non-goal without a reason is a finding.
5. **Verification.** What observation would show it works, and what observation would show the design is wrong. Both, or the entry is half-filled.
6. **Scope.** That this is one unit of work, and what was cut to make it one.

## Steps

1. **Confirm the moment and the ground.** An existing codebase this run can read, and a substantial change to design inside it. Note whether a confirmed product frame exists (in this suite's doc set, PRODUCT.md's frame): its absence is the run's first finding, with `frame` named as the earlier skill, and the audit proceeds either way. Check: the run names the repository read and the frame's status.
2. **Obtain the declaration.** The builder provides it against the six entries, or asks for a draft assembled only from existing materials, every drafted entry marked "assumed, unconfirmed". Check: no entry exists that the builder did not state and the draft did not mark assumed.
3. **Ground it in the code.** For every proposed behavior and every named path in the declaration, search the repository and record what is actually there. **Artifact: the grounding table**, one row per proposed behavior and per named path, columns: proposed item; what the code has today, with `file:line` or "not found"; resolution as one of **absent / partial / already present / present but unreachable**. Then the reverse pass: surfaces the grounding shows the change must touch that entry 2 does not name, each added as a row marked **unrequested**. Blank cells are findings. Without this table the skill did not run. Where subagents are available, one read-only search pass may be delegated; where they are not, run the searches sequentially and say so (declared degradation, per the suite standard). Never fan out further: a feature whose surface demands parallel sub-audits has already failed entry 6, and that finding must surface rather than be absorbed by parallelism.
4. **Audit the declaration.** Findings against the entry numbers and the grounding table. Every code-grounded finding quotes the line that motivated it; a finding that cannot quote its line is returned as a question, stated exactly, not as a finding. The code-grounded core, in the order it pays: the code already does this (highest-value sub-case: built but unreachable, which makes the change a reachability fix and the declared scope wrong); a named call site does not exist; a touched surface is missing from entry 2; a declared dependency has no producer, or a produced value no consumer. Then the declaration-quality findings: assertion-decisions, unfalsifiable verification, blank or trivial non-goals, multi-unit scope. Check: every finding carries its entry number, and every code-grounded one its quote.
5. **The builder resolves and confirms.** Revisions, or explicitly accepted gaps that stay visible in the declaration. On confirmation, the declaration is stamped `Confirmed: <date>`; where no human can answer this session, it is stamped `Audited, unconfirmed: <date>` and the handoff does not proceed on it. Check: the stamp exists and matches what actually happened.
6. **Hand off, writing nothing this skill does not own.** The run's own artifact is the findings report in the run output. The confirmed declaration lands where the TARGET project's docs say design records live; a project with no declared home gets that reported as a finding, and this skill never invents a default path (that failure is this skill's origin story). From there: `phase-plan` folds the confirmed declaration into the next unit's plan, decisions with their rejected alternatives go to the project's decision record, and the feature's success signal goes to `instrumentation` where it has one. Check: this run wrote no plan file and touched no plan index.

## Red flags

Symptoms that you skipped something above, not new rules: a findings list with no `file:line` citations (the grounding table did not run, and a design audit with no code in it is a proofread); asking the builder a sequence of design questions; writing a plan file, a Steps list, or an index entry; severity ratings, finding IDs, JSON output, or a verdict; the declaration surviving unchanged after the table found the behavior already present; inventing an artifact path the target project never declared.

## Version check

At most once a day, a run of this skill checks whether a newer suite exists. The command enforces the whole contract: the `FOUNDRY_NO_VERSION_CHECK` opt-out, the daily stamp-file rate limit, a 10s timeout, and silence on any failure. Never block or fail a run over this check.

```sh
[ -n "${FOUNDRY_NO_VERSION_CHECK:-}" ] || find "$HOME/.claude/.foundry-version-checked" -mmin -1440 2>/dev/null | grep -q . || { mkdir -p "$HOME/.claude" 2>/dev/null; curl -m 10 -fsS "https://foundry.thehorizonfoundry.com/api/version?skill=feature-design&v=0.1.0"; touch "$HOME/.claude/.foundry-version-checked" 2>/dev/null; } || true
```

If the response carries a version newer than this file's `version:` frontmatter, tell the user once: a newer Foundry suite is out; update with `npx skills@latest add horizon-foundry/foundry`, or `git pull && make install` for a source install. If it prints nothing, fails, or the versions match, say nothing and proceed. What it sends: this skill's name and installed version, nothing else; it writes `~/.claude/.foundry-version-checked` as the rate-limit stamp (full disclosure: the README section "Version check").
