---
name: scaffold
description: Use when starting a new project, or when an existing project still has placeholder markers in its docs. Declares the project's profile (experiment, internal-tool, web-product, service, or library), then stands up the doc set, posture, and deploy or publish shape that profile actually needs, filled from the builder's answers, not a blank prototype.
---

# scaffold

> **Using this skill:** announce "Using scaffold", make a todo per numbered step in `## Steps`, and do not skip the gates. This skill's worth is its process, not a hand-reproduced outcome. If you were told to "run scaffold", run it, do not improvise its result. (Suite standard: https://github.com/horizon-foundry/foundry/blob/main/reference/skill-authoring.md)

## Overview

A project starts in the shape it will need at the end of its life. That shape depends on what the project is. This skill first declares the project's **profile**. Then it stands up the doc set, posture, and deploy or publish path that profile needs, filled from a few setup answers the builder supplies. User-invoked. The doc set is defined by `reference/doc-set-spec.md`. The skill is self-contained: no external template repo is required (the skeletons below are the normative fallback).

An existing project is also in a "scaffold needed" state if its docs still contain `{placeholder}` markers. The same flow applies.

## Profiles

One question decides most of the rest: **what is this?**

| Profile | It exists to | Doc set | License posture | Ship shape |
|---|---|---|---|---|
| experiment | Answer a question | README (the question, how to run, what was learned) + NOTES; TODOS if it runs more than a week | None yet; decided at graduation | None required |
| internal-tool | Serve teammates | CLAUDE, README, PRODUCT (short), NOTES, PROMPTS, FRICTION, TODOS; DESIGN/BRAND only if it has a real UI surface | Usually none (org-owned); ask, never assume | Wherever the team runs internal things; respect what exists |
| web-product | Serve users | Core docs (CLAUDE, README, PRODUCT, ARCHITECTURE, DESIGN, BRAND, NOTES, TODOS) + a LICENSE or ownership declaration as appropriate; PROMPTS/FRICTION as optional workflow conventions | Per the interview; never silently defaulted | Real build + deploy config, security headers, env validation, a testing + CI baseline, from the first commit |
| service | Serve callers (API, backend, job) | Full set including ARCHITECTURE, minus DESIGN/BRAND (unless it ships a console or has an outward voice) | Per the interview | Container or host of choice; a health endpoint and log story are part of the shape |
| library | Be consumed as code | README **is** the product surface (install, API, examples) + CLAUDE, NOTES, PROMPTS, TODOS, LICENSE; no DESIGN | Load-bearing: consumers need one; always ask | No deploy config; a publish path instead (registry, semver, changelog) |

**The rigor is "never accidentally promote a prototype", not "never prototype."** An experiment is allowed to be light. What it is not allowed to do is quietly gain users and features while still shaped like an experiment. Its README says what it is. Graduation is explicit: re-run scaffold with the real profile. That is when the license, the deploy path, and the full doc set arrive.

## Build like it ships (for the profiles that ship)

For web-product and service, the scaffold is production-shaped from the first commit, because calling something a "prototype" is how software ships insecure. That means: a real build and deploy path, security headers and env validation, a testing and CI baseline (even a single smoke test that runs on every push, so the pipeline exists before there is anything to test), a license where one is owned (or an explicit ownership declaration where an open-source license does not apply), and the doc set in place, before any feature. There is no separate "make it production-ready later" step. Later never comes.

## Respect what already exists

When you scaffold into an existing team, org, or repo context, the existing standards win: their CI, their branch protection, their deploy targets, their documentation conventions. scaffold fills what is missing. It does not replace a working shape with this suite's preferences. If the org deploys on something other than containers, the deploy shape is theirs, not this skill's.

## Steps

1. **Declare the profile.** Ask which of the five this is (or confirm the obvious one). The profile selects the doc subset, license posture, and ship shape for every later step.
2. **Establish the base.** If the team maintains its own scaffold template repo, clone that. Otherwise create the files directly from the skeletons below. No template is needed. Either way the result is the profile's doc subset plus its build/deploy or publish config, with `{placeholder}` markers where answers go.
3. **Interview.** Name; one-line purpose; tech stack; dev/build/deploy (or publish) commands; whether it needs a design system and a brand voice now or later; license. Never auto-choose a license. Propose one only when ownership is unambiguous (a personal project under the builder's own account). When ownership is unclear (employer, client, collaborators), ask. A permissive default on someone else's IP is not a safe guess.
4. **Record the security frame.** The four declarations are data classification, trust boundaries, authn/authz model, and secret handling; their definitions are owned by the `frame` skill. If `frame` has run, `PRODUCT.md` already opens with them: carry them forward. If not, ask the builder to declare the four lines now and record them in `PRODUCT.md` (experiment profile: in the README). Declarative only: the builder states them. A considered "no sensitive data, no accounts" is a complete answer.
5. **Fill the placeholders** in every doc in the profile's subset and in `LICENSE` (year, holder) where one exists. Add stack-specific ignore rules (tool and linter caches for the chosen toolchain). Delete `DESIGN.md`/`BRAND.md` only if the project genuinely has no visual or outward-voice surface, and remove them from the structure tree if so.
6. **Seed the plan chain and the resume discipline** (all profiles except experiment, where NOTES carries the thread). Put a Master Plan block in `TODOS.md` with a `### Phase Plans` index, so a later session that picks the project back up has a plan to read. Then seed the resume rule as a standing instruction, copy this into `CLAUDE.md`:

   ```
   On a terse continuation prompt ("start phase N", "continue", "resume"), read the
   `### Phase Plans` index in TODOS.md, open the specific plan file it links, and
   reconcile it against git state before acting. Never act from the phase name alone.
   ```

   This is the reading half of the plan chain that `phase-plan` writes. It lives as an instruction (and, where the harness supports it, a session-start hook) rather than a skill, because "read the plan first" is an invariant, not a judgment call.
7. **First commit.** On a fresh repo, this lands on its default branch: "Fill scaffold placeholders for <name>", and after this one commit you switch to feature branches. In an existing repo, follow its branch policy instead (if it protects the default branch, open the scaffold as a branch and PR, do not push straight to it). Respecting an existing team's rules (above) outranks this default.
8. **Stand up the docs surface.** If the project has a site, hand off to `document` now to build the "Behind the Build" hub, even near-empty. A near-empty or internal project hands to `document internal` (reconcile only, no public hub). Standing it up at scaffold means every later phase renders into a live surface, so documenting never becomes a thing someone has to remember to ask for.
9. **Verify the scaffold.** Run `grep -r "{placeholder}"` across the created doc set and confirm zero markers remain, or list the deliberate remainders and why each stays. Confirm `TODOS.md` opens with the Master Plan block and `CLAUDE.md` carries the resume rule. Leftover placeholders are this skill's own trigger condition, so it checks its defining failure before finishing. End by reporting the list of files created.

## Doc-set skeletons (normative fallback)

When no template repo exists, create each file with these sections. The one-line ownership rule per file comes from `reference/doc-set-spec.md`. These skeletons are the minimum viable shape, not a ceiling. Use `{placeholder}` markers for anything the interview has not answered yet.

- **`CLAUDE.md`**: project heading; Additional Context pointer ("Read README.md and TODOS.md for backlog and planned work"); Project Overview; Tech Stack table; Project Structure tree; Development Commands block; Deployment; the resume rule (step 6 above); Commit Workflow notes.
- **`README.md`**: heading + one-line description; Tech Stack table; Requirements; Local Development commands; Building and Deployment (or Publishing); Project Structure; License line.
- **`PRODUCT.md`**: what the product is (present tense), who it serves, why it exists; the security frame (step 4); core flows; explicit non-goals. Opens with the frame if `frame` has run.
- **`ARCHITECTURE.md`** (web-product and service profiles): stack, topology, data model, decisions. Other profiles omit it and fold the data model into `PRODUCT.md` or `CLAUDE.md`, per `reference/doc-set-spec.md`.
- **`DESIGN.md`**: token table (color, type, spacing), component inventory, motion rules. Only if the project has a visual surface.
- **`BRAND.md`**: purpose, positioning, personality, voice and tone, glossary, copy rules. Only if the project has an outward voice.
- **`NOTES.md`**: dated decision entries: the decision, the reasoning, the rejected alternative(s).
- **`PROMPTS.md`** (this suite's session-narrative convention, not a universal requirement; a team with its own history log can drop it): Summary paragraph; Phases (chronological narrative); Origin and direction.
- **`FRICTION.md`** (same status: the suite's process-friction convention, optional where a team logs friction elsewhere): dated entries with three fields: What happened, Likely cause, Candidate improvement.
- **`TODOS.md`**: `## Master Plan` block with a pointer to the master plan file and a `### Phase Plans` checklist index; `## Backlog`.
- **`LICENSE`**: per the interview answer (see step 3; never silently defaulted).

## Red flags

- Scaffolding the full web-product shape onto an experiment or a library -> wrong profile; the doc set and deploy path should match what the thing is.
- An experiment quietly gaining users and features without graduating -> re-run scaffold with the real profile; promotion is explicit, never accidental.
- Defaulting a permissive license because "MIT is normal" -> ownership decides; ask when it is not the builder's own.
- Imposing this suite's CI, branching, or deploy shapes on a repo that already has working ones -> existing standards win; fill gaps only.
- Filling docs but leaving no ship path (deploy for products/services, publish for libraries) -> it is a prototype wearing product docs; add the path or use the experiment profile honestly.
- Skipping `PRODUCT.md` because "it's obvious what this is" -> the forever spec is the first thing the next agent reads; fill it.
- No security frame anywhere -> four declarative lines, recorded where the profile keeps them; silence is the only wrong answer.
- No Master Plan block in `TODOS.md`, or no resume rule in `CLAUDE.md` -> a later session has nothing to read or no instruction to read it; seed both.
- Treating the in-product docs hub as a later request -> stand it up at scaffold via `document`; a hub added months in is a hub that already drifted.
