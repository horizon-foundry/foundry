# Product

Foundry is **software delivery integrity** for people who build products with an AI in the loop. It ships as Claude Code skills. It is not product strategy. It is not org facilitation. It is the integrity of the path between an idea and its release. This document is its forever spec: what exists, in the present tense.

The suite makes five promises, each kept by a skill:

1. **Product intent is declared and audited** before building (frame).
2. **Execution context survives every session** (phase-plan and the plan chain).
3. **The intended user outcome is instrumented** (instrumentation).
4. **The documentation matches reality** (document).
5. **Technical readiness is audited before real users arrive** (foundry + production-audit).

## Where Foundry fits

Foundry is the outer loop. Other skill suites sharpen how you build: tests, reviews, refactors, bug hunts, the inner loop of writing code with an agent. Foundry is the gate at the end of that loop, the pass that decides whether what you built is safe to put in front of real users. It works alongside the inner-loop skills instead of replacing them. It installs through the same channel (`npx skills add`), so it joins a workflow you already have instead of asking for a new one.

## The frame

Declared 2026-07-13, first `/frame` run (Phase 12.9 dogfood). Assembled from this repo's existing human-authored docs; entries not directly traceable to them are marked *(assumed, unconfirmed)*. The first run's audit findings are recorded at the end of this section; resolution is the maintainer's.

1. **User.** People who build software products with an AI agent in the loop: product-engineering hybrids who own the whole path from idea to release without a supporting org (no security team, no PM, no ops).
2. **Problem.** The night before real users arrive, nothing answers "is this safe to put in front of people" for the whole application. And across sessions, agent-built projects lose intent, execution context, and documentation truth faster than one person can police.
3. **Alternatives.** Point tools each answer a smaller question: a security review covers security, a diff review covers a diff, a frontend audit covers the frontend. Ad-hoc CLAUDE.md conventions decay across sessions *(assumed, unconfirmed)*. None ends in a whole-product verdict or an enforced delivery discipline.
4. **Outcomes.** For the user: a release decision they can trust, work that resumes cleanly across sessions, docs that match reality. For the builder: a public, credible body of work demonstrating the delivery method *(assumed, unconfirmed)*.
5. **Evidence and assumptions.** The suite was extracted from the maintainer's own delivery practice across shipped projects and is dogfooded on this repo itself. The method was reviewed and revised across several adversarial passes. That anyone beyond the maintainer adopts it is an assumption, stated plainly: external adoption is unproven, building to find out.
6. **Success measure.** A stranger installs the suite and completes one full `/production-audit` run on their own project. *(Declared 2026-07-16.)*
7. **Non-goals.** Not product strategy or discovery, not org facilitation, not a linter, not a penetration test; the audit never modifies code; no skill elicits by questionnaire.
8. **Risks (idea risk, not code risk).** *(all assumed, unconfirmed)* Strangers may not install skills from an individual's repo; the Claude Code skill format may churn under the suite; an AI-issued verdict may not be trusted enough to gate anyone's launch; the discipline may be heavier than the target user wants.
9. **Learn before investing further.** Whether anyone beyond the maintainer runs a skill in the first weeks after the public flip. *(Declared 2026-07-16.)*

**Security frame.**

- **Data classification:** published audit reports carry vulnerability findings for live products (confidential to their owner); sign-in emails; the skills themselves hold no user data and run locally.
- **Trust boundaries:** anonymous web visitors, magic-link signed-in users, Supabase as identity provider; skill execution happens inside the user's own Claude Code, nothing phones home.
- **Authn/authz:** Supabase magic link proves the email; a report is visible only to its `meta.owner` or an admin (`ADMIN_EMAILS`); non-owner slugs 404; the skills never require an account.
- **Secret handling:** Fly secrets and `.env.local`, fail-closed when unset, never committed; the PostHog browser key is public by design.

### Frame audit, 2026-07-13 (first run)

- PRODUCT.md had no frame at all until this run: the suite shipped a framing skill without its own frame.
- Entry 1: "people who build with an AI in the loop" bordered on an unnamed segment; the narrower launch positioning (product-engineering hybrids) is now stated above, pending confirmation.
- Entry 6 is a blank: no single observable success signal was ever declared. The site instruments proxies (`install_copied`, `example_report_viewed`), but true activation (a skill run) is outside the site's reach and has no declared signal.
- Entry 8: every previously documented risk was technical or process risk; idea risk was absent from the whole doc set.
- Entry 9 is a blank: no learn-before-investing threshold was declared before the build grew to nine skills and a site.
- Security frame: fully covered by existing declarations (the access model and secret rules in CLAUDE.md); no blanks.

The maintainer resolves these by confirming or correcting the assumed entries, declaring entries 6 and 9, or explicitly accepting the gaps (the acceptance stays visible here).

**Resolution, 2026-07-16.** Entries 6 and 9 are now declared (above): the success measure is a stranger completing one full `/production-audit` run on their own project, and the learn-before-investing threshold is whether anyone beyond the maintainer runs a skill in the first weeks after the public flip. Both are the same signal at two moments (activation, then early retention), and both are honest about the standing assumption that external adoption is unproven. The two findings from the first run are closed.

## The suite

Each practice is a skill. The flagship is the pre-launch gate; the rest are the disciplines that get a product there.

- **foundry** is the pre-ship pass over a project's release gates. It first resolves the project's **release policy**: which gates apply, given the project's type, risk tier, and launch audience. (The policy block lives in that project's PRODUCT.md.) Then it runs one of two modes, preview and apply. `check` is the read-only preview of prepare: it assesses nothing itself, fills each gate row by citing the records that already exist (the latest audit report's ship gates, the event plan, the brand approval header, the last reconcile outcome), reports staleness (whether those records still describe the current repo), and names what prepare would do; a gate with no record to cite is not-assessed, with the run that would produce one. `prepare` invokes the modifying skills (document, mobile, instrumentation) to close the gaps, inside a stated authority envelope: docs, instrumentation, and gate surfaces, never runtime behavior, checks, or deploy configuration. The suite has one inspector, production-audit, and the authoritative verdict comes from one independent run of it, never a duplicate. That keeps preview, apply, and judgment separate. foundry conducts: it invokes each skill and never reproduces it. Report attribution and history live with production-audit (`init`/`list`), the skill that emits reports. The skills never require an account. Sign-in exists only to view your published reports on the web, and each report is visible only to the email it belongs to.
- **production-audit** (flagship) audits a whole application: six core dimensions plus the conditional ones the project's surface implies. It ends in a ship/no-ship verdict that names its own evidence base beneath the recommendation (static review, runtime not exercised), so a static run never overclaims a runtime-verified result. It also owns report identity. `init` (optional) connects the operator email so published reports carry an owner. `list` shows local report history with no sign-in.
- **frame** audits the builder's declared one-page product frame before anything gets built: user, problem, alternatives, outcomes, evidence and assumptions, success measure, non-goals, risks, learn before investing, plus a four-line security frame (data classification, trust boundaries, authn/authz, secret handling). Blank or vague entries are findings, like the audit's empty matrix cells. Nothing enters the frame that the builder did not state or confirm. The frame opens PRODUCT.md, and the rest of the work is checked against it. Discovery and structured elicitation are other tools' work. frame evaluates; it does not extract.
- **scaffold** declares what the project is (experiment, internal-tool, web-product, service, or library) and starts it in the shape that kind of project needs: the right doc subset, the security frame recorded, a real ship path where one belongs, and never a silently defaulted license. The rigor is "never accidentally promote a prototype", not "never prototype".
- **document** keeps the docs true to the code and current across every surface. The truth layer repairs a stale doc to match observed behavior, or flags a suspected regression when a test or intent claim says the code changed. The presentation layer, where the project has an external audience, authors the overview deck and renders the repo's own docs as an in-product hub, so they cannot drift unseen. Nothing is invented: every claim traces to something real. Idempotent.
- **mobile** pressure-tests a surface to a good mobile experience where one exists: diagnose the real mechanism first, then verify across the matrix (widths, landscape, text zoom, keyboard, real devices). No mobile surface means not-applicable, stated.
- **instrumentation** instruments the funnel and the activation moment on one identity model, with each event keyed on the right entity, so you can tell whether a feature works. It runs like production code: versioned schemas, dedup, a named owner.
- **phase-plan** and **brand-voice** cover two disciplines. phase-plan keeps the plan chain unbroken across sessions (or honestly terminal: decision required, awaiting evidence, or a deliberate stop). brand-voice keeps one voice from `BRAND.md` across every surface, a voice that binds only after human sign-off and never outranks clarity. (The reading half of the plan chain, read the indexed plan and reconcile it against git state before acting on a terse continuation, is a standing instruction that a scaffolded `CLAUDE.md` carries, not a separate skill.)

Two of these, **mobile** and **instrumentation**, are the common release gates. For a product people hold in their hands and need to know is working, you do not ship without them, and the audit's verdict enforces it. Their applicability is resolved per project, not assumed. A headless service's mobile gate is not-applicable, with a reason. A privacy-sensitive tool satisfies instrumentation with a documented trust-boundary waiver. The release policy names which gates a given project's launch requires. What is never acceptable is skipping a gate silently.

Every skill is authored to resist being ignored: it opens with a mandatory gate, and a named skill is invoked and followed, never hand-reproduced.

## The flagship: Production Audit

What it is, who it is for, how it reasons, and where it refuses to guess.

### What it is

Production Audit is a pre-launch gate. It is a Claude Code skill (`/production-audit`) that audits a whole application across a standing set of eleven dimensions, applicability resolved per project. Six are usually applicable: security, concurrency, reliability, accessibility, UI consistency, and infrastructure. Five need a more deliberate applicability call: operability, testing confidence, data and migration safety, release safety, and performance and capacity. It ends in a single decision: safe to ship; ready to ship, risks noted; or do not ship. A dimension the product has no surface for (accessibility on a headless service, migration safety with no datastore) is excluded with a reason, never silently skipped.

It exists because the tools around it each answer a smaller question. A security review looks at security. A diff review looks at a diff. A frontend audit looks at the frontend. None of them answer the question a builder actually asks the night before an invite wave: is this safe to put in front of real people. That question spans the whole app, and it wants a verdict, not a list.

## Who it is for

People shipping products that were built fast, often with an AI in the loop, who need an honest second read before real users arrive. The audience is not a security team with weeks to spend. It is the person who built the thing, knows it mostly works, and wants to know what will actually bite under real traffic, unreliable networks, concurrent actions, and hostile input, before it does.

## The method

**Flows, not files.** The unit of work is a flow traced end to end (signup, invite, upload, payment, cron, an LLM call), not a file reviewed in isolation. Categories like security and reliability are lenses applied to each flow. A bug lives in the seam between two files far more often than inside one, and only a flow crosses the seam.

**Artifacts, not vibes.** "Look for missing permission checks" is a vibe. It cannot be finished. So the audit produces artifacts that can. The security pass builds an authorization matrix: every mutation, who can invoke it, where the check lives, how it was verified. A blank cell is a finding. The reliability pass builds a failure-path table per dependency: timeout, retry, user-visible failure, idempotency. A blank cell is a finding. You cannot hand-wave your way to a full table.

**A defined severity rubric.** Five words with no definitions guarantee severity inflation, so severity is earned: impact times reach times exploitability, tempered by detectability and recoverability. Critical means an unacceptable outcome reachable today. The catastrophic classes are named, not just auth: remote code execution, credential compromise, irrecoverable data destruction, systemic payment corruption, privacy breach, total loss of availability. High means an authenticated user can damage other users or bypass a business control. A finding that cannot name the control it bypasses or the concrete harm is not a High.

**Confidence tied to evidence, not to feeling.** Runtime-reproduced means the behavior was observed live. Code-traced means the path was read end to end in source. The two are deliberately separate claims. Configuration-confirmed means verified in config or infrastructure state. High-confidence means the path was traced with exactly one named, unverified assumption, and the finding states it. Needs-verification means it requires a running app to observe. A finding that fits no evidence class is not reported, and a static run's strongest honest claim is code-traced.

## Adversarial verification

The default failure mode of an AI audit is the plausible-but-wrong finding: a confident paragraph about a bug that a later migration already fixed, or a test already covers, or that is guarded one layer down. So every critical and high finding, and every finding that drives the verdict, is handed to a fresh reviewer whose only job is to refute it against the actual code. Is it mitigated elsewhere? Fixed later? Reachable at all? Findings that cannot survive the attempt are dropped or downgraded, and the refutation is recorded in the report. A finding you can read on the report survived someone trying to kill it.

## The false-positive kill list

Audits embarrass themselves in predictable ways, so those ways are named and forbidden. Do not report secrets stored in environment variables, that is where secrets belong. Do not report "missing rate limiting" without checking every layer it could live at. Do not report "client validation insufficient" when the server validates. Do not report a gap a later migration closed. Before calling a control missing, look for it at every layer it could live: middleware, handler, database policy, platform. The rule is boring on purpose. Boring is what keeps a report trustworthy.

## The honest boundary

Some things cannot be known from source. Rendered color contrast, whether a focus ring is actually visible, how a screen reader announces a live region, whether two tabs race in practice: these need a running browser. A static audit that asserts them anyway is manufacturing confidence. So it does not. Those checks are either reported as needs-verification with the exact runtime check to run, or listed plainly as not assessed. The report tells you what it did not look at. That honesty is the point of a verdict you can trust.

## The verdict

Every audit ends with one: safe to ship; ready to ship, risks noted; or do not ship. Findings split two ways: **risks**, which have a path to harm and are what the verdict weighs, and **improvements**, which are safe today and make the system more robust, observable, consistent, or accessible over time. Only risks move the verdict; a report with none is safe to ship even with a long improvement list, because a punch list of betterments is not a reason to hold a release. A quality tool has to be able to say "good, and here is how to make it better" without that reading as "broken." The justification cites the specific findings driving it and opens by naming the assessed scope. The verdict carries its evidence base: a static-only run states "static review, runtime not exercised" in the line beneath the recommendation and lists the skipped runtime checks, so it never overclaims a runtime-verified result. And only the full invocation issues a whole-product release verdict at all. The middle verdict, ready to ship with its risks noted, is not a hedge. It names its risks so they can be accepted on purpose rather than discovered later, and it leads with the go rather than a scolding. The verdict is the product. Everything above it exists to make it honest.

## Release policy

This repo's own declaration, in the shape `foundry check` resolves (the block every project's PRODUCT.md carries):

```
project_type: web-product        # the suite's site; the skills themselves ship as source
risk_tier: standard
launch_audience: public
gates:
  document: required
  mobile: required
  instrumentation: required
  production-audit: required
```

## What you tune, and what you do not

Two questions decide a release, and you own one of them.

You set the scope. The release policy is yours: which gates a launch requires, the project's risk tier, its audience, and every risk you accept on the record. What the product actually is decides which audit dimensions apply, and a dimension with no surface is excluded with a reason. A CLI is not a web product, an internal tool is not a public launch, and the policy says so in your words.

You do not set the bar. The severity rubric, the evidence classes, and the meaning of the verdict are fixed, on purpose. A standard you can loosen until everything reads green is the self-serving "looks fine to me" that a second read exists to replace. Foundry is opinionated where opinion is the product: what "safe to ship" means does not bend to the person shipping. What bends is the scope you declare and the risks you accept, both on the record.

## Anti-goals

- It is not a linter. Style and formatting are a solved problem with other tools.
- It is not a penetration test. It reads code and traces flows; it does not attack a running system.
- It never modifies code. The audit is read-only, always. Remediation is a separate, human decision.
- It does not speculate. A concern without evidence is either informational or nothing, never a headline.
