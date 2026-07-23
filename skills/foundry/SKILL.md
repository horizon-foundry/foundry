---
name: foundry
description: Use when a project is approaching a release decision and you want one pass over its pre-ship gates instead of remembering each one. Resolves the project's release policy (which gates apply, given what the project is), then runs `check` (the read-only preview of prepare: cites the existing gate records, reports staleness, names what prepare would do) or `prepare` (invokes the modifying skills to close the gaps). The suite's only inspector is production-audit, and the authoritative verdict is one independent production-audit run afterward, never a duplicate.
---

# foundry

> **Using this skill:** announce "Using foundry" and the mode (`check` or `prepare`), make a todo per gate the resolved policy names, and do not skip the gates. This skill's worth is its process, not a hand-reproduced outcome. If you were told to "run foundry", run it, do not improvise its result. (Suite standard: https://github.com/horizon-foundry/foundry/blob/main/reference/skill-authoring.md)

## Overview

`foundry` is the pre-ship pass over a project's release gates. It exists because the disciplines are easy to skip one at a time. Nobody is blocked without them, so each one gets asked for by name, or not at all.

It has **two modes, preview and apply, and they are deliberately separate** so a readiness pass never silently rewrites the repo:

- **`foundry check`** (default) is **read-only, and it assesses nothing itself**. It is the dry-run of `prepare`: it resolves which gates this project's release actually requires, fills each gate row by citing the records that already exist (the latest audit report, the event plan, the brand approval header, the last reconcile outcome), reports the one fact no record states about itself (staleness), and names exactly what `prepare` would do. Safe to run any time, as often as you like.
- **`foundry prepare`** is **modifying**. It invokes the gate skills that fix things (`document`, `mobile`, `instrumentation`) to close the gaps `check` previewed. It does not issue a verdict.

The suite has **one inspector: `production-audit`**. `check` never re-inspects what the audit inspects; two assessors of the same properties is one product too many, and the shallower one wins by being cheaper, which is backwards. The authoritative verdict is a separate step: **one independent `/production-audit` run after `prepare`'s changes pass tests.** Preview (`check`), apply (`prepare`), and judgment (the audit) are three distinct runs. That makes the before-and-after measurable, and it keeps the release decision away from the same pass that just changed the code.

`foundry` is a **conductor, not a doer**. Each gate is a real skill; `foundry` invokes it as that skill (announce it, follow it, honor its own gate) and never reproduces its work inline. If a gate skill cannot run, that is a finding, not a thing to fake.

Report attribution and local report history belong to the skill that emits reports: see `production-audit`'s "Report ownership and local history" section (`production-audit init` / `list`). foundry is purely check, prepare, and the handoff to the verdict.

## The release policy: gates are project-specific

There is no universal gate list. A CLI has no mobile surface; a privacy-sensitive tool must not carry in-product telemetry; an internal dashboard for five colleagues does not need what a public launch needs. So the gates come from a **release policy** the project declares, not from this file.

The policy lives in the project's `PRODUCT.md` as a short block:

```
## Release policy
project_type: web-product        # scaffold profile: experiment | internal-tool | web-product | service | library
risk_tier: standard              # low | standard | high (regulated data, payments, safety)
launch_audience: public          # personal | internal | invite | public
gates:
  document: required
  mobile: required               # or: waived (<reason>) | optional
  instrumentation: required
  production-audit: required     # the authoritative verdict; required for any real audience
```

**Resolving the policy is `check`'s first step.** If the block exists, run against it. If it does not, derive a proposal from what the project is (its scaffold profile, its surfaces, its audience), present it, and get the human's confirmation before scoring against it. Where no human can answer this session (no question mechanism is exposed), proceed against the derived proposal and stamp the scorecard's first line "policy: proposed, unconfirmed"; a scorecard against an unconfirmed policy is provisional, never silently authoritative. The scorecard always reproduces the policy block it ran against, verbatim, so persisting a confirmed policy into `PRODUCT.md` is a paste, not a reconstruction; `prepare` (or the human) writes it. Never score a project against gates it never agreed to, and never skip a gate the policy requires.

Higher risk tiers and wider audiences tighten the policy. They never loosen it. A `high` risk tier or `public` audience makes `production-audit` and its runtime pass hard requirements. A `personal` experiment may legitimately run with everything optional.

## `foundry check` (read-only preview)

The default. The dry-run of `prepare`: it cites records, it does not assess. Steps:

1. **Confirm the moment.** The project is at a release decision (a deploy path, a real surface, features to ship). If not, name the right earlier skill and stop (a bare repo needs `scaffold`; an unframed idea needs `frame`).
2. **Resolve the release policy** (above): existing block, or proposed and confirmed (or provisionally proposed, stamped as such).
3. **Fill each gate row by citing an existing record, never by inspecting the code yourself.** Where each record lives: mobile and instrumentation from the latest audit report's `shipGates` entries; the instrumentation plan from the project's event-plan table (this suite keeps it in a CLAUDE.md section); brand from `BRAND.md`'s approval header; document from the last reconcile outcome where one is recorded. A gate with no record to cite is `not-assessed: run <the skill or audit that would produce the record>`, honestly, because nothing has assessed it. A cited `at-risk` summarizes as not-met on the scorecard (a gap exists), with the record's nuance kept in the row.
4. **Report staleness, the one fact no record states about itself.** Compare the latest audit report's `auditedCommit` to the repo's current state: if the suite's trust surface changed since (skills, routes, gates, dependencies), say the records describe a previous version of the project and the audit is due, whatever the rows say.
5. **Synthesize the scorecard and name what `prepare` would do.** Use this shape, then end by naming the next move (gaps -> `foundry prepare`; clean and current -> the final `/production-audit`):

```text
Policy: <the policy block, verbatim> (confirmed | proposed, unconfirmed)
Staleness: <auditedCommit vs now, and what changed>
| gate | policy | state | record cited | what prepare would do |
Gaps, prioritized: ...
```

**Gate states.** met / not-met are not enough to be honest:

| State | Meaning |
|---|---|
| met | A cited record shows the gate satisfied, and the record is current |
| not-met | A cited record shows it failing; the specifics are listed |
| not-applicable | The project has no such surface; the reason is stated |
| waived | The policy pre-accepted skipping this gate, with the recorded reason |
| not-assessed | The gate needs evidence this run could not gather (a real-device check, a runtime observation); stated with the exact check to run, never counted as a pass |
| blocked | The record could not be read or the producing skill could not run at all; an un-run gate is an open risk, never a pass |
| accepted-risk | Failing on the record, and the human explicitly accepts shipping anyway; recorded on the scorecard so the acceptance is a decision, not a drift |

These seven are scorecard states. The audit report's `shipGates` field carries its own factual status enum (defined in `production-audit`); `waived`, `blocked`, and `accepted-risk` are policy and run dispositions that live here and in the policy block, not in the report.

Policy strength governs how a gate weighs. A **required** gate that is not-met (or not-assessed, or blocked) holds the release. An **optional** gate is assessed and reported the same way, but a failing optional gate does not by itself cap the verdict; it is information the human weighs, not a stop. **waived** and **not-applicable** are settled before scoring and are left alone.

## `foundry prepare` (modifying)

Invoked explicitly, never as the default. Closes the gaps `check` found.

1. **Take the check scorecard** (run `check` first if you do not have a current one).
2. **For each not-met required gate, invoke its skill** to close the gap: `document`, `mobile`, `instrumentation`, in that order (docs first, so the later gates and the audit read current docs). Each runs as its own skill, honoring its own gate and process. Waived, not-applicable, and accepted-risk gates are left alone.
3. **Verify what code can verify.** Run the project's build and tests; `prepare` is not done until its changes pass. But some gates cannot be closed by changing code and running unit tests: a real-device mobile check, a live activation funnel, a runtime observation. `prepare` does the code work and then leaves those as `not-assessed` with the human check to run. An agent cannot "close" a real-device gate from a headless run; say what remains outstanding rather than marking it met.
4. **Stop before the verdict.** `prepare` does not judge its own work. Hand off to an independent `/production-audit` for the authoritative decision.

**Prepare's authority envelope.** `prepare` may modify documentation, instrumentation, and the gate surfaces, through the gate skills. Absent explicit instruction, it must not alter runtime product behavior, weaken any check or validation to make a gate pass, or touch deploy configuration. A gap whose closure sits outside this envelope is reported as outstanding with the change it needs, never quietly made.

## The final verdict is independent, and singular

After `prepare` and a passing build, run `/production-audit` as a fresh, read-only pass. It is the authoritative verdict, and because it did not do the fixing, it can honestly assess it. Comparing the check scorecard (and its baseline, if any) to this final audit measures what `prepare` bought. Run it once: if nothing changed since a full audit that already exists, that audit **is** the verdict, and re-running it identically adds cost, not confidence.

## Red flags

- Scoring gates from a hardcoded list instead of the project's release policy -> resolve the policy first; a CLI is not a web product.
- Inspecting the code in `check` mode -> `check` cites records and previews `prepare`; `production-audit` is the suite's only inspector. An inspecting check is a second, shallower assessor, which is the failure this design removed.
- Modifying anything in `check` mode -> `check` is read-only; if a gate needs work, that is `prepare`.
- Letting `prepare` issue the verdict -> the pass that changed the code does not get to judge it; run an independent `/production-audit`.
- Running `prepare` by default from a bare "run foundry" -> the default is `check`; modification is opt-in.
- Running two identical full audits with nothing changed between them -> check cites the existing report as its record; the full audit runs once, as the verdict.
- Reproducing a gate's work inline instead of invoking the skill -> you lose the sub-skill's process; invoke it as itself.
- Emitting "ready" while a gate is blocked -> an un-run gate is an open risk, not a pass; say so.
- Recording a failing gate as anything but not-met without the human's explicit acceptance -> accepted-risk is the human's call, on the record.
- Turning the scorecard into an artifact -> it is a preview table in the run output, built from cited records; the audit's JSON is the suite's only report contract, and the scorecard never replaces or duplicates it.
