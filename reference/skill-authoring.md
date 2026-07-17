# Skill Authoring

How the Foundry skills are written so they resist being ignored. This is a suite standard: every skill here follows it, and any skill added to the suite must. It is the companion to `doc-set-spec.md`, that one governs the docs, this one governs the skills.

## The problem it solves

A skill is easy to bypass. Told to "run /foundry" or "do an audit," an agent can read it two ways: *invoke this skill* or *produce something like its output*. The second path throws away the exact thing the skill exists for, its protocol, its gates, its guardrails, and reproduces a hollow version of the outcome. A skill whose worth lives only in its output is one shortcut away from being useless.

So the standard has two halves: a rule for the caller, and a construction rule for the author.

## For the caller: a named skill is invoked, not reproduced

When a user names a skill or slash command ("run /harden", "do an X audit", "/foo"), invoking it and following it exactly, including its mandatory prep and gates, is required. A named skill is a command to run that skill, never a description of an outcome to hand-reproduce. If several are named, invoke each. Announce "Using [skill]" and make a todo per checklist item.

This rule ships with the suite (stated in the README and installable into an adopter's config) so an adopting agent inherits it. But a rule the model can rationalize past is not enough on its own, which is why the author's half exists.

## For the author: make the worth require the process

Author every skill so it cannot be satisfied by jumping to the output. Three mechanisms, used together:

1. **An observable opening gate.** The skill opens by making itself visible: announce "Using [skill]", create a todo per step. An agent that skipped the skill cannot produce these, so the gate is a tell.

2. **A required early artifact.** The skill's value is bound to an artifact the shortcut cannot fake: the audit's scored report and authz matrix, `document`'s truth-checklist run reported against the actual files, `phase-plan`'s written-and-indexed plan file. No artifact, skill not run.

3. **A confirmation gate before expensive or irreversible work.** For skills whose misfire is costly, require a user decision before acting: `brand-voice` drafts `BRAND.md` but it binds only after the human signs off; `foundry check` proposes a release policy and gets confirmation before scoring against it; `foundry prepare` closes gaps but hands the verdict to an independent audit rather than judging its own work. The gate is a hard stop the outcome-shortcut cannot cross.

A skill with none of these is a suggestion. A skill with all three is hard to fake and cheap to verify.

## Honest limits: gates improve compliance, they do not guarantee it

An opening gate is a strong prompt, and a prompt can be rationalized past. Do not oversell it. The invariants that must *never* break get **deterministic enforcement** outside the prompt: a schema the artifact must validate against, a `make validate` (or CI) check that fails the build, a hook that runs regardless of what the model decided. This suite practices it on its own contract: the report schema is enforced by ajv, and the cross-field hard rules (no unverified verdict-driving finding, scope honesty, stats accuracy, no personal paths, no em dashes) are enforced by `scripts/validate-report-invariants.mjs` in `make validate`, not by trusting that Phase 3 was honored. When you author a skill, sort each rule: judgment calls live in the prompt; invariants get a machine check. A hard rule that only exists as prose is a hope.

## Independent evaluation beats self-grading

An agent grades its own work generously; no one lets their kid mark their own homework. A skill that judges quality, a review, a critique, a ship decision, does not evaluate in the same pass that produced the thing. It hands the judgment to an independent reviewer and synthesizes. The audit practices this: every critical, high, and verdict-driving finding goes to a fresh skeptic whose only job is to refute it against the code, and a blocking finding that cannot survive is dropped or downgraded. Two blind reads beat one confident guess. A related trap when a skill mixes deterministic checks with model judgment: do not prime the judge with the detector's raw output. A noisy detector makes the model condemn a sound result over fixable nits; a silent one makes it rubber-stamp a weak one. Run the mechanical checks and the judgment independently, then weave the two, rather than letting one anchor the other.

## Portability: name the capability, design for the weakest model

A skill that leans on a harness capability names the assumption and degrades when it is absent. Two bite in practice: spawning sub-agents (some harnesses require explicit user permission, or cannot in the current mode) and asking the user a structured question (not every harness can, outside a planning mode). A skill that fans out or asks should state what it needs and what to do without it, run the passes sequentially in one context, or stop and ask, rather than failing silently or skipping the work. And weaker models compress multi-step flows and skip steps a frontier model would infer are mandatory, so a step that must happen is written as a hard stop, not a suggestion, and an invariant that must hold is machine-enforced (see Honest limits), never left to the model's discretion. Author for the weakest model the skill will actually run on, not the one you tested with.

## Artifact value: every artifact earns its existence

A skill that emits artifacts must be able to say what each one is *for*. The test: an artifact supports a **decision** (the audit report feeds ship/no-ship), an **execution handoff** (the plan file a next session resumes from), an **operational responsibility** (the event plan a named owner reviews), or a **user outcome**. An artifact that supports none of these is ritual output; cut it. And artifacts that outlive their moment carry a lifecycle: plan files open with `Status: active | completed | superseded | abandoned`, so a stale artifact reads as closed instead of ambiently authoritative.

## The pattern every suite skill opens with

Each SKILL.md carries this near the top, so the gate is the first thing read:

> **Using this skill:** announce "Using [name]", make a todo per step below, and do not skip the gates. This skill's worth is its process, not a hand-reproduced outcome. If you were told to "run [name]", run it, do not improvise its result.

## "Gate" has four senses here (glossary)

The suite uses one word for four distinct mechanisms; when authoring, say which you mean:

1. **Opening gate**: the announce-and-todo block at the top of every SKILL.md, the anti-bypass tell.
2. **Release gate**: a pre-ship requirement a project's release policy names (mobile, instrumentation, the audit), scored by `foundry check` and enforced by the audit's verdict.
3. **Confirmation gate**: a required human decision before expensive or binding work (a policy confirmed before scoring, `BRAND.md` signed off before it binds).
4. **Access gate**: an authenticated surface (the Foundry site's `/reports` sign-in), which is about who may see something, not about process.

## Deeper method

For a full test-driven method of writing and hardening a skill (baseline the failure, write the minimal skill, close the loopholes), the `superpowers` skill collection's `writing-skills` is a good companion if you use it; it is an optional reference, not a dependency of this suite. This standard is the suite's house rule: it fixes the specific failure of skills being bypassed when named.
