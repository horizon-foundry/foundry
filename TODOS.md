# TODOs

## Master Plan

> **Always look here first for project context.** The master development plan covers all phases:
> `~/.claude/plans/i-came-across-this-keen-gadget.md`

### Phase Plans

- [x] Phase 0: Bootstrap repo from scaffold (master plan)
- [x] Phase 1: Skill + report schema (master plan)
- [x] Phase 2: First run: first full application audit (master plan)
- [x] Phase 3: Docs, marketing site, deck, /reports, deploy (master plan)
- [x] Phase 4: Grow into a skills suite, doc-set spec, BRAND, seven skills, /skills site (master plan)
- [x] Phase 5: Foundry rebrand -> `~/.claude/plans/foundry-rebrand.md`
- [x] Phase 6: Rename behind-the-build to document (conversational; see PROMPTS Phase 6)
- [x] Phase 7: Add foundry, the one-command pre-ship conductor (conversational; see PROMPTS Phase 7)
- [x] Phase 8: document idempotent + public/internal modes; foundry check/prepare; /pr + /ship split; public-adoption + safety pass; npx install; blocker pass (conversational; see PROMPTS Phases 8-11)
- [x] Phase 12: Supabase magic-link auth for /reports (+ PostHog, foundry init/list) -> `~/.claude/plans/foundry-reports-supabase-magic-link.md` (merged PRs #20-#21, live)
- [x] Phase 12.5: Consolidation 11 -> 9 skills (cut resume, merge doc-drift into document, keep brand-voice) -> see NOTES 2026-07-13 (merged PR #29, live)
- [x] **Phase 12.9: Pre-public skills hardening** (merged PR #30, deployed 2026-07-13) -> `~/.claude/plans/okay-take-your-critique-clever-gadget.md` (ABSORBS the old 12.9 quality pass AND the 12.10 lifecycle expansion into one everything-before-flip phase, per Craig. Covers: 2 launch-blockers; production-audit conditional dimensions + verdict scope qualifier + severity/evidence-class depth; full scaffold profiles; instrumentation multi-actor + governance; phase-plan honest outcomes + git reconcile; foundry project-specific policy gates + init/list moved to production-audit; document conditional showcase + intent preservation; mobile heuristics + device matrix; brand-voice approved-inputs + clarity-first; security-earlier; artifact-value + deterministic enforcement; and ALL marketing surfaces reconciled. Positioned as delivery integrity, five promises. Workstreams A-N in the plan.)
  - superseded plan files (all live items folded into the plan above; doc-drift-authority + resume already DONE via 12.5): `~/.claude/plans/foundry-skills-quality-pass.md`, `~/.claude/plans/foundry-phase-12-10-lifecycle.md`
- [ ] Phase 12.10: Positioning copy, "what you tune vs what's fixed" + "where Foundry fits" (outer-loop / composes with inner-loop skills) across PRODUCT/README/homepage/skills/deck/skill-cards (conversational; see PROMPTS Phase 12.10 + NOTES 2026-07-14). From colleague feedback ("can I tune what is production ready, or is it your own recipe?" + "have you seen Matt Pocock's work?"). Copy-only; deployed for reviewer eyes pre-flip.
- [ ] Phase 12.11: Clarity pass, make the copy live up to BRAND.md's plain-voice standard across every user-facing surface (conversational; see PROMPTS Phase 12.11 + NOTES 2026-07-16). From a design/product friend's "too dense, CEO language" read. Includes the brand-voice additive reframe and the /skills tile arrow-implies-order IA fix. Copy-only; deployed.
- [ ] Phase 12.12: Report reads as a triage tool, not a wall of text (ReportView redesign, persona = time-poor senior/principal eng or product lead; conversational, see NOTES + DESIGN 2026-07-16). Top scorecard (verdict + severity mix + gate status + not-assessed in one glance), strengths collapsed to headlines, repeated dimension cards to one line, mechanical sweeps compacted to tail. Deployed.
- [ ] Phase 13.0: Self-audit as public proof, two examples + the "self-audit tracks the suite" invariant -> `~/.claude/plans/foundry-phase-13-self-audit-public-proof.md` (regenerate Foundry's own audit under the current method, publish it public alongside a relabeled illustrative Perch)
- [ ] Phase 12.13: Pre-publish cleanup from two audits (adversarial 4-agent sweep + external reviewer; conversational, see NOTES + PROMPTS 2026-07-16). SHIPPED: removed tracked `.impeccable/` critique logs (a Phase-13 plan gap), 3 report edge-case bugs (empty-findings, posture-fallback, specimen assessedScope), BRAND "skill is a command" contradiction, install-command drift, frame nine-vs-eight drift, stale CLAUDE component registry, mobile (no-autofocus-on-coarse + Pointer Events) and instrumentation (durable outbox for un-loseable events + funnel-not-universal) technical corrections. The external audit was ~90% stale (all 9 "blockers" already fixed in 12.9/12.10). Remaining pre-flip items below.

### Pre-publish, still open (from the 2026-07-16 audits)

- [ ] **[Security]** Supabase redirect-allowlist: pre-flip, confirm no wildcard AND add `https://foundry.thehorizonfoundry.com/auth/confirm` (the new custom domain; without it magic-link sign-in breaks on the new host). Craig does this in the Supabase dashboard.
- [x] **[Blocker]** `SECURITY.md` created (PR #58): private disclosure via GitHub's built-in vulnerability reporting (Security tab), so no email is published and it does not depend on the Workspace mailbox. Enable Private Vulnerability Reporting in repo settings at the flip.
- [x] **[Release]** CI on main (PR #58): `.github/workflows/ci.yml` runs typecheck/lint/build/`make validate` on PRs+pushes to main. First run GREEN (SHIP-01 closed). Once public, main is not an ungated install channel.
- [ ] **[Decision]** The proof is one fictional app (Perch) staged three ways; the frame's own success-measure entry is blank. Highest-leverage pre-launch move: run `/production-audit` on one real public repo and publish it alongside Perch. (Craig's call)
- [ ] **[Decision]** The "Horizon Foundry suite/project" chrome on a solo v0.1.0 repo: earn it or soften to a maker's toolkit for launch. (Craig's call; HF is real, this is launch-optics)
- [ ] **[Polish]** Minor positioning: /skills leads with the abstraction vs the concrete hero line; the "not product strategy, not org facilitation" negations; the eight-epigraph /behind deck (Aristotle twice)
- [ ] **[Skill]** document public mode should curate specific PRODUCT.md sections, not assume the whole file is publish-safe; reconcile "a broken mobile flow is automatically High" with the earned-severity rubric
### From the 2026-07-16 fresh external audit (the substantive, queued items)

That audit was much fresher than the prior one; its #1 "blocker" (retired /commit, /doc-drift, /resume, /behind/{prompts,notes,friction} pages "still live") was FALSE (all 404, verified) and internal links to them are clean (verified). Surgical copy fixes it got right are DONE (Terminal "provisional verdict" -> "read-only release-gate scorecard"; Perch "exactly-once" -> "effectively-once"; scaffold "production-ready" -> "in the shape its profile requires"; "guardrails actually run" softened; "external critiques judged the method sound" -> honest; "Your reports"/"Yours are waiting" -> no implied self-service hosting; PA "six apply to every product" -> applicability-resolved for all 11; brand-voice glossary "bug" rule scoped to report terminology). Remaining, genuinely worth a dedicated skill-precision pass:

- [ ] **[Skill]** `--runtime` enum rename (deferred): the SKILL prose now scopes `--runtime` to a browser pass and leaves real-device/infra/capacity/migration `not-assessed`, so the overclaim is fixed in behavior. The remaining option, renaming the `static-plus-runtime` assessedScope enum to something narrower, is a schema change held for the next `schemaVersion` bump.
- [x] **[Skill/Consistency]** Second external audit (2026-07-16) consistency pass, one PR (PR7). Fixed the drift between #42-47's stronger definitions and the surfaces that lagged: verdict terminology normalized to "ready to ship, risks noted" everywhere (lib/skills.ts, PRODUCT.md x2, PA SKILL); PA description/table/Phase-0 aligned to "every applicable dimension among the eleven"; PA mobile/instrumentation gate weighting now follows the required/optional/waived release policy instead of "not optional/always caps"; stray Perch "exactly-once" -> "effectively-once" with a delivery-semantics note; phase-plan Red Flag scoped to meaningful handoffs; /skills "guardrails actually run" softened to explicit-and-hard-to-skip + schema/CI for true invariants; scaffold profile table row reflects optional PROMPTS/FRICTION + license-as-appropriate. Item 7 ("Yours are waiting") and the "six core apply to every product" / old-Perch claims were already fixed (verified, stale in the audit).
- [x] **[Decision/Bug]** /behind/product PUBLICLY rendered the raw frame (found live 2026-07-16): security-frame enumeration, `(assumed, unconfirmed)` hedges, two open `(finding: not yet declared)` markers, violating both `document public`'s rule and PR4's new section-level rule. RESOLVED PR5: Craig chose "render truth sections only"; added `stripSection` to lib/docs.ts and the public product tab now strips `## The frame`, leaving present-tense truth. The frame stays in the gated internal portal (the repo).
- [x] **[Skill]** Public-doc projection rule: `document` now defines public-by-default vs private-by-default at the SECTION level, so "sanitized" is enforceable, not prose (a `(finding:`/`(assumed,` marker on a public page is the same failure as `NOTES.md` there). (Done PR4.)
- [x] **[Example]** Regenerate the Perch report under the CURRENT method: assess the applicable conditional dimensions (it has deploy/db/testing/ops/capacity surfaces, currently all excluded as "introduced after this run"), and fix the mobile ship-gate from "met" to at-risk/not-assessed (device checks are runtime; a static run cannot "meet" it). The example is the credibility asset and should demonstrate today's method, not July 12's. (Done PR2 #43: 11 dims assessed, 0 excluded, added OPS-01/DATA-01/TEST-01/SHIP-01/PERF-01, mobile gate -> not-assessed, stats 0/0/6/8/4.)
- [x] **[Skill]** Normalize the release-state contract across foundry + production-audit: add `not-assessed` to foundry check's scorecard states; split `blocked` (tooling failed) from `not-assessed` (lacked evidence); make gate optionality respect the policy (optional/waived) instead of mobile/instrumentation always capping; define `optional` behavior (assessed and reported, does not independently cap the verdict). (Done PR1 #42.)
- [x] **[Skill]** Separate gate failure from finding severity: a broken mobile flow can block a mobile-required launch without automatically being High. (Done PR1 #42.)
- [x] **[Skill]** Per-skill refinements: foundry (define optional; prepare may leave human verification outstanding); production-audit (real secret scanner not just grep; Common Mistakes should say Critical+High+verdict-driving; qualify "unpinned critical dependency") [PR1]; frame (success measure informs the instrumentation plan, is not automatically the activation definition); scaffold (testing/CI baseline in production-shaped; first-commit-on-default-branch conditional on a new repo; resolve the LICENSE-required vs LICENSE-where-one-exists contradiction; PROMPTS/FRICTION optional not universal); document (tighten truth-check scope from "every file touched/read" to docs + externally-meaningful contracts); mobile (a screenshot cannot confirm gestures/keyboard/focus, require an interaction pass; iOS+Android follow the declared support matrix); instrumentation (add a guardrail/countermetric field; qualify identify/alias as vendor-specific); phase-plan (do not require a plan for every routine PR, trigger at meaningful handoffs; add base commit/branch/verification state); brand-voice (machine-readable approval metadata in BRAND.md: Status draft|approved, approved-by, approved-on) [PR3 #44].
- [x] **[Decision]** Resolve the frame's own blanks (success measure, learn-before-investing) before publishing. RESOLVED 2026-07-16 (PR6): Craig confirmed both candidates, so entry 6 (a stranger completes one full `/production-audit` run on their own project) and entry 9 (does anyone beyond the maintainer run a skill in the first weeks after the flip) are now declared, the `(finding: not yet declared)`/unconfirmed markers removed, and the first-run findings closed with a dated resolution. Docs-only (the frame renders on no public surface after PR5), so no deploy. The frame skill's pre-flip gate is now satisfied.

- [x] Phase 13: Publish, LAUNCHED 2026-07-17 as `horizon-foundry/foundry` (fresh orphan repo, custom domain live) -> `~/.claude/plans/foundry-phase-13-publish.md` (top section holds the remaining launch-tail checklist: Supabase allowlist + SITE_ORIGIN flip, www DNS, GitHub presentation, branch protection)
- [ ] Phase 14: Post-launch learning (the one lifecycle item that needs launched users, so it is correctly post-flip) -> seeded in the Phase 12.9 plan's workstream N; write its own plan file when Phase 13 completes. Did users reach the outcome, which assumptions died, expand/change/stop; closes the loop instrumentation opens.
- [ ] Phase 15: v0.1.1, first version bump + suite improvements from the 2026-07-22 comparative audits -> `~/.claude/plans/foundry-v0-1-1-release-hardening.md` (scope law: improve existing skills only, no new skills/artifacts/schemas; wall scrub PR #1; skill execution pass + check-as-preview rewrite PR #2; value-prop simplification PR #3; remaining: release protocol with CI-enforced changelog rigor, full doc sweep, regenerated self-audit, tag v0.1.1)

## Launch sequence (do in this order)

The public flip now comes AFTER the reports auth (Craig, 2026-07-12) AND after
the skills quality pass (Craig, 2026-07-13: "make it better before we push it
public... make sure the skills and documentation are truly valuable to people
who come across them").

0. [x] **Pre-public skills hardening (Phase 12.9).** DONE: merged PR #30 and
   deployed to foundry-skills.fly.dev 2026-07-13. BUILT on branch
   `pre-public-hardening` (workstreams A-L + J all committed: launch-blockers,
   schema v3 scope-qualified verdict + conditional dimensions, per-skill
   honesty passes, foundry release policy, deterministic enforcement, and the
   delivery-integrity positioning across every surface; fresh-install sim +
   route-parity walk verified). Dogfood DONE 2026-07-13: `/frame` wrote and
   audited the suite's own frame into PRODUCT.md (entries 6 and 9 are blanks
   awaiting Craig), and the full `/production-audit` self-run validated clean
   against schema v3 (`tmp/audit-2026-07-13.json`: 0 critical, 0 high; verdict
   clear within assessed scope; findings folded back: CHANGELOG nine-skill fix,
   em-dash sweep; remediation backlogged under "From the 2026-07-13
   self-audit"). Remaining: PR + merge.
   Plan: `~/.claude/plans/okay-take-your-critique-clever-gadget.md`.

1. [x] **Supabase magic-link auth for /reports.** DONE: Phase 12, merged PRs #20-#21, live and verified across all four access cases. Anyone signs in by magic link and sees only their own reports (owner match); admin sees all; public example stays ungated. Only remainder: remove the old `REPORT_ACCESS_EMAILS`/`REPORTS_GATE_SECRET` Fly secrets if still set, folded into Phase 13 step 7. Full plan: `~/.claude/plans/foundry-reports-supabase-magic-link.md`.
2. [ ] **Positioning copy (Phase 12.10).** Deployed 2026-07-14 for reviewer eyes before the flip: "what you tune vs what's fixed" and "where Foundry fits" (outer-loop / composes with inner-loop skills) across every surface. Answers a colleague's "is it your own recipe?" + "have you seen Matt Pocock's work?". Copy-only; repo stays private.
3. [ ] **Publish (fresh-repo swap + flip public).** Phase 13; full plan: `~/.claude/plans/foundry-phase-13-publish.md`. The repo is `horizon-foundry/foundry` but still private, so every GitHub link on the live site 404s and `npx skills add` fails. Mechanism CHANGED (hardened 2026-07-13): NOT squash-in-place (GitHub keeps `refs/pull/*` refs that leak old history) but a fresh-repo swap: rename the current repo to `foundry-archive` (stays private), create a new `horizon-foundry/foundry` with one clean commit, verify, then flip public. Two hard gates (repo swap, visibility flip) + local-clone neutralization + archive guard + branch-protection + green-CI. IRREVERSIBLE / outward-facing: explicit go-ahead required.

## Backlog

### From the 2026-07-22 harness audit (deferred beyond v0.1.1)

- [ ] **[Eval]** Seeded-target eval for production-audit (v0.2.0 candidate): a fixture repo with planted true positives AND planted refutation-bait (findings that look real but are mitigated at another layer, i.e. the false-positive kill list as test cases); score recall on the plants and kill-rate on the bait. Turns "the audit works" from a claim into evidence. See the Phase 15 plan's kickoff decisions for context.
- [ ] **[Skill]** Post-ship closure artifact: a lightweight record of what was verified live after deploy (URL, checks run, what was not verified), consumable by ship-style workflows. The v0.1.1 release-safety dimension edit covers the audit side; this is the emitting side.
- [ ] **[Skill]** production-audit progressive disclosure (v0.2.0 candidate): the flagship is 2.5x the suite's median length with everything inline. Split the per-dimension specs, severity rubric, evidence classes, and kill list into reference files bundled next to the SKILL.md (the schema already ships that way), consumed by the Phase 2 subagents; the orchestrator's hot path shrinks and each fan-out agent loads exactly one dimension's spec.
- [ ] **[Skill]** Runtime skill machinery (v0.2.0 candidate, new artifact class so it needs its own decision): bundled scripts whose output is the next instruction (environment-aware setup, staleness checks computed rather than prose-directed) and edit-time hooks that enforce the report and doc invariants passively. Today the suite's deterministic enforcement is repo-side only (make validate, CI); a hook fires whether or not anyone invoked a skill.
- [ ] **[Portability]** Harness build step (v0.2.0+ candidate): the skills are authored for Claude Code with prose degradation paths for missing capabilities. A compile step (one source, per-harness builds: question mechanics, command prefixes, per-model corrections) is the durable version; prose portability is the v0.1.x answer.

### From the 2026-07-13 self-audit (Phase 12.9 dogfood)

The full `/production-audit` run on this repo: verdict clear within assessed scope (static), 0 critical, 0 high, 7 medium; report at `tmp/audit-2026-07-13.json`. Two refuted highs and five downgrades are recorded in the report's verification notes. CHANGELOG reconciliation and the em-dash sweep were fixed on the branch; the rest is backlogged here for an explicit pre-flip vs post-flip decision (SHIP-01 is the audit's top recommendation).

- [ ] **[Release]** CI workflow on main: npm ci, typecheck, lint, build, make validate (SHIP-01; at the flip, main becomes the live `npx skills add` install channel with no automated gate)
- [ ] **[Release]** Extend `make validate` to gate SKILL.md content: frontmatter parses, mandatory gate paragraph present, no em dashes (SHIP-02)
- [ ] **[Testing]** Four pure-function gate tests: canView ownership matrix, slug traversal guard, meta.public gate, adminEmails parsing (TEST-01; ~1 hour, no mocking)
- [ ] **[Reliability]** AbortSignal.timeout on the Supabase fetch (all three client constructions) + console.error with context on magic-link send and confirm failures (REL-01, OPS-01, OPS-02)
- [ ] **[Security]** Pin `emailRedirectTo` to SITE_URL instead of header-derived origin; confirm the Supabase redirect allowlist carries no wildcard (SEC-01, downgraded to low but the pin is one line)
- [ ] **[Perf]** `generateStaticParams` on /skills/[slug] + /example/[slug]; React.cache on getSessionUser (PERF-01, REL-04)
- [ ] **[A11y]** 16px unlock input at mobile widths; role=status on the copy confirmation; min target heights on SlideDeck prev/next + SignOutButton (A11Y-01, A11Y-02, A11Y-03)
- [ ] **[Ops]** Operations section in CLAUDE.md: rollback command, the two known auth failure modes and their checks, alerting confirmation, priority order (OPS-03, OPS-04, SHIP-04)
- [ ] **[Infra]** USER node in Dockerfile; `.env` in .dockerignore; digest-pinned base image (INF-01, INF-05, INF-02)

### Reports / auth

The auth model, stated plainly (Craig, 2026-07-12): the skills never require auth; sign-in exists ONLY to view your report history on the web; each report is visible only to the email it belongs to.

- [x] **`/foundry init`**: built 2026-07-13 (foundry SKILL.md). Records the operator email in `~/.claude/foundry.json`; `/production-audit` stamps it as `meta.owner`. Cookie check first (already signed in on the site = done), else point at the magic link. Never a blocker for using the skills.
- [x] **`/foundry list`**: built 2026-07-13 (foundry SKILL.md). No-auth local report history (project `tmp/audit-*.json` + published `reports/*.json` filtered to owner). The web view is the only surface that needs sign-in.
- [ ] **Supabase magic link** (Phase 12; built + locally verified, checkbox closes when the PR merges; see Launch sequence).

### Next product pass (from the external audit, 2026-07-12): Done in Phase 12.9

All four items landed on branch `pre-public-hardening` (2026-07-13); one
remainder from the presentation-split idea stays open below.

- [ ] **[Skill]** Move `/document`'s prescriptive presentation specifics (layout, quotes, typography, glyphs) into a Foundry template/theme; the skill prescribes information architecture + narrative, not the exact visual treatment. (The rest of the doc-drift authority item shipped in 12.5; this presentation split is the surviving remainder.)
- [x] **[Skill]** Gate applicability + scoped-audit semantics: release policy in PRODUCT.md, `/foundry check` resolves applicability, scoped audits report scoped posture not release verdicts, check vs prepare de-duplicated, homepage/deck ship-gate law reframed to policy-resolved (deliberate softening, recorded in NOTES).
- [x] **[Skill]** production-audit method depth: severity rubric broadened with catastrophic classes named; evidence classes split (runtime-reproduced / code-traced / configuration-confirmed / high-confidence / needs-verification); all `~/code/foundry` paths removed (schema bundled in the skill dir); `/code-review` + `/security-review` described as optional installs.
- [x] **[Skill]** doc-drift authority model (shipped in 12.5 via the document merge) + `document` reconcile inherits it; filesystem-mirror registry rule dropped.
- [x] **[Skill]** Per-skill depth: scaffold profiles (5, incl. internal-tool) + no-default license + document-internal handoff; mobile diagnostic patterns + full verification matrix; instrumentation governance + identity model + pageviews softened; phase-plan acceptance criteria/dependencies/non-goals/status + honest terminal outcomes; resume rigor folded into phase-plan's git-reconcile rule.

### Site + brand polish (next pass, non-blocking)
- [ ] **[Design]** Open question from the 2026-07-13 critique: should the homepage BE the example report, with marketing copy as margin annotations? (The specimen hero is the first step in that direction.)
- [ ] **[Design]** Open question: medium/verdict-risk yellow (#F5CE4B) sits one hue-step from command amber (#D99A2E) and they share viewports; decide whether that rhyme is accepted or the severity ramp needs a colder mid-tone.
- [ ] **[Site]** Three near-identical hairline card grids remain on the home scroll (dimensions, principles, install details); differentiate one if the template feel bothers.
- [ ] **[Brand]** brand-voice surface matrix (Product UI / Marketing / Public docs = strict; Technical reports = terminology strict, syntax flexible; Code comments = guidance; Internal logs = not enforced). Reconcile glossary "skill" vs the homepage line "a skill is a command Claude Code runs" [live contradiction].
- [ ] **[Site]** Skills directory: compact per-card metadata (Changes code / Invocation / Produces / Applicable to). Do not add more skills yet.
- [ ] **[Site]** Reduce quote overuse in the Behind-the-Build deck (1-2, not one per slide).
- [ ] **[Debt]** Automated route-inventory test so deleted public routes cannot survive as stale static pages.
- [x] **[Site]** Move the example report's static-only boundary up near the verdict: done in Phase 12.9, the verdict stamp now carries the "Evidence base: static analysis" line via `verdict.assessedScope`.
- [x] **[Debt]** Schema-validation script: done in Phase 12.9, `scripts/validate-report-invariants.mjs` in `make validate` (blocking findings must be verified, plus scope honesty, stats accuracy, no em dashes, no personal paths).
- [ ] **[Brand]** Sweep remaining em dashes from code comments (rendered surfaces are clean; comments are not).
- [ ] **[Site]** Per-skill richer pages (production-audit currently shares the generic SKILL render).

### Next proof pass (post-launch credibility)
- [ ] **[Proof]** Publish 2+ more example audits across meaningfully different app types (not just a web SaaS). Show repeatability across independent runs on the same commit. Publish approximate repo size, audit duration, model config per run. Demonstrate one complete before-and-after: `/foundry check` -> `/foundry prepare` -> final `/production-audit`. Eventually publish known false positives and how the verifier eliminated them. Synthetic / permissioned targets only.

### Brand / infra
- [ ] **[Brand]** Point a custom domain (e.g. foundry.horizonfoundry.com) at the Fly app once the domain is set up.
- [x] **[Brand]** Rename the Fly app to a Foundry URL (foundry-skills.fly.dev)
- [x] **[Docs]** Public install path (npx skills add + from-source make install)

## Done this session (2026-07-12): see PROMPTS Phases 6-11 for detail
- [x] Removed /commit from the public suite; rebuilt privately as /pr (stop at PR) and /ship (merge + deploy); global CLAUDE.md points at them
- [x] Renamed behind-the-build -> document; added document public/internal/reconcile modes; curated the public /behind hub (raw logs removed)
- [x] Added foundry check (read-only) / prepare (modifying); verdict is an independent production-audit
- [x] Safety pass: real report swapped for the synthetic Perch audit; docs de-personalized
- [x] Adoption: install section (npx-first), nav restructure, CTA, CONTRIBUTING, CHANGELOG, version/license surfaced
- [x] Added shipGates to the report contract (schemaVersion 2), rendered under the verdict; unified the verification contract; scrubbed rendered em dashes; fixed the "fictional sample" provenance
