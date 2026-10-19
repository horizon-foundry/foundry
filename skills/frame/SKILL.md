---
name: frame
version: 0.2.1
description: Use before scaffolding or building anything new, or when a project cannot answer who it is for and why it matters. The builder declares a one-page product frame plus a four-line security frame; this skill audits it and reports blank or vague entries as findings. Not for running discovery with the builder or inventing answers: it audits what is declared.
---

# frame

> **Using this skill:** announce "Using frame" and make a todo per numbered step in `## Steps` and one per frame entry audited.

## Steps

1. **Check for an existing frame.** If `PRODUCT.md` already opens with one,
   audit that frame as it stands; the run's artifact is the finding report,
   never a duplicate frame.
2. **Obtain the declaration** from the human, one of the two ways in "The
   gate". If step 1 found no frame, open with one request: the nine entries
   and four security lines by name only, as a template, never rephrased as
   questions; under an entry, quote anything the human already stated that
   seems to answer it (a `scaffold` answer, a line in this session), marked
   assumed, unconfirmed; then ask them to write the entries or paste their
   source material for a draft. Then stop: draft and audit nothing until
   they reply. If no way to ask exists this session, draft from existing
   material as the gate's second way would, without a request, and open
   the report by saying the request could not be sent. Check: where step 1
   found no frame, the request went out before any draft, or the report
   says why it could not; and no entry exists that the human did not state
   and the draft did not mark assumed.
3. **Audit it.** Artifact: a findings list against the entry numbers, per
   "The audit" section below. Check: the list covers every entry, plus one
   pass across entries for contradictions, which a per-entry pass cannot
   see.
4. **Human resolves and confirms.** Revisions or explicitly accepted gaps.
   On confirmation, write a `Confirmed: <date>` line at the top of the frame
   section in `PRODUCT.md`. If no way to ask the human exists this session,
   stamp `Audited, unconfirmed: <date>` instead, and the build handoff does
   not proceed on it.
5. **Hand off.** `scaffold` fills the doc set around the frame;
   `instrumentation` takes the success measure as an input to its plan,
   deriving the activation moment separately; a release decision later
   checks the risks and non-goals still hold. Check: the frame section
   carries the `Confirmed` stamp; an `Audited, unconfirmed` stamp does not
   hand off to a build.

## Overview

The most disciplined delivery pipeline can still ship a production-shaped,
documented, instrumented solution to the wrong problem. Every other skill in
this suite assumes the thing being built is worth building; this one is where
that assumption gets written down and audited. The frame is a one-page
declaration of intent: who this is for, what it fixes, what success measurably
looks like, and what would prove the idea wrong. The skill's job is the same
job the suite does everywhere else: hold a declared artifact up to checkable
criteria and report what is blank, vague, or asserted without evidence. It
audits what the builder already believes.

## When NOT to use

- Auditing built code or a release candidate: `production-audit`; frame audits intent before anything exists.
- Standing up the repo and doc set: `scaffold`, after the frame carries its `Confirmed` stamp.

## The gate: the builder declares, the skill audits

The human authors the frame's content, one of two ways. They write it
directly against the entry list below. Or they ask for a draft assembled ONLY
from what already exists (the README, existing docs and notes, what they have
said in the session), with every drafted entry explicitly marked "assumed,
unconfirmed" for them to correct. Either way, nothing enters the frame that
the human did not state or confirm. Audit what is written; a blank is a
finding. Never interview the builder, run a question sequence, send a
questionnaire, or extract intent step by step, and never invent users,
evidence, or outcomes. Step 2's single opening request, the entry names
as a template, is how the builder learns what to write, not a
questionnaire; a follow-up ask about any one entry is. Do not proceed to
scaffolding or building until the frame section in `PRODUCT.md` carries a `Confirmed: <date>` line;
confirmation is a lookup, never a memory.

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
  user-private, regulated/PII, payments, none). A regulated class names its
  regime (for example HIPAA, PCI, GDPR). "No sensitive data" is a valid
  declared entry; an unstated one is a blank.
- **Trust boundaries.** Where untrusted input enters and who the untrusted
  parties are (anonymous visitors, signed-in users, third-party webhooks,
  model output).
- **Authn/authz model.** Who signs in, how (the factors and the account
  recovery path), and who may do what, one line each. "No accounts" is a
  valid entry.
- **Secret handling.** Where secrets will live and what never gets committed.

These four lines become the seed of `production-audit`'s trust-boundary map
later. The audit then checks the built system against the declared model
instead of guessing what the model was.

## The audit: what counts as a finding

Like the audit's matrices, the frame is checkable and blanks are findings:

- A missing or empty entry.
- "Everyone" (or an unnamed segment) as the user.
- A problem stated as a feature request rather than a struggle. "Needs a
  dashboard" is a finding; "cannot tell which client is unprofitable until
  quarter end" passes.
- An outcome with no observable change in it.
- Evidence entries that are assumptions without the label.
- A success measure that cannot be observed, or that lists several signals.
- Risks that are all technical (idea risk absent is itself a finding). A
  risk list that is all "scaling, refactors, tech debt" is a finding; a real
  risk list names at least one way the product thesis itself could be wrong.
- A blank or unconsidered security declaration (a considered "no sensitive
  data, no accounts" is fine; silence is not).
- Any entry the human did not author or confirm.
- **Two entries that disagree**, cited as a pair. Coherence is a property of
  the page, not of any single line, so entry-by-entry checks pass a frame
  that contradicts itself: a non-goal that excludes the user entry 1 names,
  a success measure that cannot move even if the problem in entry 2 is
  solved, an alternative described as adequate while the problem says people
  are stuck, a learn-before-investing entry asking for evidence entry 5
  already claims. Report the pair and what would resolve it, never pick a
  winner: which entry is wrong is the builder's call, not the auditor's.

Report findings as a short list against the entry numbers. The human resolves
them by revising the frame or by explicitly accepting the gap ("user segment
still vague, accepted for now"), which stays visible in the frame.

## Where the frame lives

The opening `## The frame` section of `PRODUCT.md`, dated, with the
confirmation stamp (`Confirmed: <date>`, or `Audited, unconfirmed: <date>`)
as its first line. If no `PRODUCT.md` exists yet, create one containing just
the frame; `scaffold` and the doc set grow around it. One file holds two
kinds of writing. The frame records intent and assumptions, and may be
revised as learning lands (date each revision). The rest of `PRODUCT.md`
records shipped, present-tense truth. An assumption graduates into the truth
sections only with the evidence that promoted it.

## What this skill is not (non-goals)

The boundary is deliberate and stays where it is. frame is an **auditor of
already-declared intent**, nothing more:

- **Not strategy facilitation.** It does not help decide what to build, rank
  opportunities, or generate positioning. It checks that whatever was decided
  is stated completely enough to build against.
- **Not an ongoing product operating system.** It runs at the moments intent
  is declared or revised; it is not a standing planning cadence, a roadmap
  tool, or a substitute for user research.

## Red flags

- A frame longer than a page -> it has become a research document; the frame
  is the declaration, not the investigation.
- Editing the frame to match what got built -> the frame records intent; when
  reality diverges, the divergence is a finding to discuss, not to erase.

## Version check

At most once a day, run this command. It enforces the `FOUNDRY_NO_VERSION_CHECK` opt-out, the daily rate limit, a 10s timeout, and silence on any failure, so it never blocks the run.

```sh
[ -n "${FOUNDRY_NO_VERSION_CHECK:-}" ] || find "$HOME/.claude/.foundry-version-checked" -mmin -1440 2>/dev/null | grep -q . || { mkdir -p "$HOME/.claude" 2>/dev/null; curl -m 10 -fsS "https://foundry.thehorizonfoundry.com/api/version?skill=frame&v=0.2.1"; touch "$HOME/.claude/.foundry-version-checked" 2>/dev/null; } || true
```

If it prints a version newer than this file's `version:` frontmatter, tell the user once: update with `npx skills@latest add horizon-foundry/foundry`, or `git pull && make install` for a source install. Otherwise say nothing. It sends only this skill's name and installed version, and writes `~/.claude/.foundry-version-checked` as the rate-limit stamp (README, "Version check").
