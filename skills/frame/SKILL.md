---
name: frame
description: Use before scaffolding or building anything new, or when a project cannot answer who it is for and why it will matter. The builder declares a one-page product frame (user, problem, alternatives, outcomes, evidence and assumptions, success measure, non-goals, risks, learn before investing) plus a four-line security frame (data classification, trust boundaries, authn/authz, secret handling); the skill audits the declaration the way the suite audits code, with blank or vague entries reported as findings. It never runs discovery, never questionnaires the builder, and never invents answers.
---

# frame

> **Using this skill:** announce "Using frame", make a todo per step below, and do not skip the gates. The frame is the builder's declaration: NEVER invent users, evidence, or outcomes, and never turn this into a questionnaire. This skill's worth is its process, not a hand-reproduced outcome. If you were told to "run frame", run it, do not improvise the result. (Suite standard: https://github.com/horizon-foundry/foundry/blob/main/reference/skill-authoring.md)

## Overview

The most disciplined delivery pipeline can still ship a production-shaped,
documented, instrumented solution to the wrong problem. Every other skill in
this suite assumes the thing being built is worth building; this one is where
that assumption gets written down and audited. The frame is a one-page
declaration of intent: who this is for, what it fixes, what success measurably
looks like, and what would prove the idea wrong. The skill's job is the same
job the suite does everywhere else: hold a declared artifact up to checkable
criteria and report what is blank, vague, or asserted without evidence.
Discovery, research, and structured elicitation are other tools' work. frame
audits what the builder already believes. It does not extract it.

## The gate: the builder declares, the skill audits

The human authors the frame's content, one of two ways. They write it
directly against the entry list below. Or they ask for a draft assembled ONLY
from what already exists (the README, existing docs and notes, what they have
said in the session), with every drafted entry explicitly marked "assumed,
unconfirmed" for them to correct. Either way, nothing enters the frame that
the human did not state or confirm. Do not proceed to scaffolding or building
until the audited frame is confirmed.

## The frame (one page, nine entries)

1. **User.** A named kind of person or team. "Everyone" is a blank cell.
2. **Problem.** What they struggle with today, in their words.
3. **Alternatives.** How they handle it now, and where that fails them.
4. **Outcomes.** What improves for the user if this works; what improves for
   the builder or business.
5. **Evidence and assumptions.** What supports building this, with every
   assumption labeled as one. "None yet, building to find out" is a valid,
   honest entry; an unlabeled assumption is not.
6. **Success measure.** The one observable signal that says it is working.
   It feeds the `instrumentation` plan, but it is not automatically the activation definition. A product's primary measure might be retention, transaction completion, reduced cycle time, or revenue; activation (the first value moment) is a related signal `instrumentation` derives separately.
7. **Non-goals.** What this deliberately will not do or serve.
8. **Risks.** What could invalidate the idea itself, not the code.
9. **Learn before investing.** What must be true, or learned, before building
   past the first slice.

## The security frame (four declarations, same page)

Security posture is cheapest to state before anything exists, and a late audit
should be checking a declared model, not reconstructing one. So the frame
carries four one-line security declarations, held to the same standard as the
nine entries. The builder states them. The skill records and audits them. This
is never threat-modeling facilitation.

- **Data classification.** What classes of data the product will hold (public,
  user-private, regulated/PII, payments, none). "No sensitive data" is a
  valid declared entry; an unstated one is a blank.
- **Trust boundaries.** Where untrusted input enters and who the untrusted
  parties are (anonymous visitors, signed-in users, third-party webhooks,
  model output).
- **Authn/authz model.** Who signs in, how, and who may do what, one line
  each. "No accounts" is a valid entry.
- **Secret handling.** Where secrets will live and what never gets committed.

These four lines become the seed of `production-audit`'s trust-boundary map
later. The audit then checks the built system against the declared model
instead of guessing what the model was.

## The audit: what counts as a finding

Like the audit's matrices, the frame is checkable and blanks are findings:

- A missing or empty entry.
- "Everyone" (or an unnamed segment) as the user.
- A problem stated as a feature request rather than a struggle.
- An outcome with no observable change in it.
- Evidence entries that are assumptions without the label.
- A success measure that cannot be observed, or that lists several signals.
- Risks that are all technical (idea risk absent is itself a finding).
- A blank or unconsidered security declaration (a considered "no sensitive
  data, no accounts" is fine; silence is not).
- Any entry the human did not author or confirm.

Report findings as a short list against the entry numbers. The human resolves
them by revising the frame or by explicitly accepting the gap ("user segment
still vague, accepted for now"), which stays visible in the frame.

## Where the frame lives

The opening `## The frame` section of `PRODUCT.md`, dated. If no `PRODUCT.md`
exists yet, create one containing just the frame; `scaffold` and the doc set
grow around it. One file holds two kinds of writing. The frame records intent
and assumptions, and may be revised as learning lands (date each revision).
The rest of `PRODUCT.md` records shipped, present-tense truth. An assumption
graduates into the truth sections only with the evidence that promoted it.

## Steps

1. **Check for an existing frame.** If `PRODUCT.md` already opens with one,
   audit it as it stands and report; do not duplicate it.
2. **Obtain the declaration.** The human writes it, or asks for the
   assembled-from-existing-materials draft with every entry marked assumed.
3. **Audit it.** Findings per the list above, reported against entry numbers.
4. **Human resolves and confirms.** Revisions or explicitly accepted gaps;
   only then does scaffolding or building proceed.
5. **Hand off.** `scaffold` fills the doc set around it; `instrumentation`
   takes the success measure as an input to its plan, deriving the activation
   moment separately; a release decision later checks the risks and non-goals
   still hold.

## What this skill is not (non-goals)

The boundary is deliberate and stays where it is. frame is an **auditor of
already-declared intent**, nothing more:

- **Not guided discovery.** It never interviews the builder, runs a question
  sequence, or extracts intent step by step. Structured elicitation is other
  products' work.
- **Not strategy facilitation.** It does not help decide what to build, rank
  opportunities, or generate positioning. It checks that whatever was decided
  is stated completely enough to build against.
- **Not an ongoing product operating system.** It runs at the moments intent
  is declared or revised; it is not a standing planning cadence, a roadmap
  tool, or a substitute for user research.

If the builder cannot fill an entry, the honest output is a finding that says
so, not a workshop to produce the answer.

## Red flags

- Asking the builder a sequence of discovery questions -> wrong mechanism and
  wrong product: this skill audits a declaration, it does not run discovery.
- Filling any entry the human did not state or confirm -> an invented user is
  worse than a blank cell; blanks are honest findings.
- A frame longer than a page -> it has become a research document; the frame
  is the declaration, not the investigation.
- Scaffolding or building started before the audited frame is confirmed -> the
  suite's own failure mode: disciplined delivery of an unexamined idea.
- Editing the frame to match what got built -> the frame records intent; when
  reality diverges, the divergence is a finding to discuss, not to erase.
