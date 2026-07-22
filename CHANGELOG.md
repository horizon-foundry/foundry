# Changelog

All notable changes to Foundry are recorded here. The format follows [Keep a Changelog](https://keepachangelog.com/), and the project aims to follow semantic versioning once it reaches 1.0.

## [Unreleased]

- Docs: reworded one NOTES.md decision entry and one skill-authoring phrase; added a house style rule to CLAUDE.md.
- Skills: an execution-quality pass over all nine skills. Every skill now carries a numbered procedure its opening gate points at, with each step ending in a named check or artifact, because an unanchored "todo per step" gate was ceremony in the four skills that had no steps. `foundry check` is rewritten as prepare's read-only preview: it cites existing records and reports staleness instead of re-inspecting what the audit inspects, and `prepare` gains an authority envelope. production-audit adds a risk/improvement decision table, a verbatim subagent brief, a quote-the-motivating-line rule, a verification floor (every risk is verified), and release-safety depth (artifact identity, post-deploy verification). mobile now leaves a filled verification matrix as its artifact; instrumentation's plan table carries the guardrail and owner; frame's confirmation is a dated stamp; brand-voice branches modes off the approval header and leaves a per-surface apply report; scaffold verifies its own placeholders before finishing; document gains per-mode procedures, a mechanical sanitization sweep, and a cold-start drill.
- Reference: skill-authoring adds anchored gates, evidence-per-step, declared degradation, retrieval honesty, and requalification; doc-set-spec adds the lesson-promotion ladder and defers plan-chain mechanics to phase-plan; new reference/templates/plan.md.
- Site and README: the value prop simplified to one definition sentence used verbatim on every surface, with the receipt beside it. The README leads with install above the pitch and one-line skill pitches; the homepage hero drops the stacked framings and the five promises move below the install block; the deck unpacks its suite slide into promise items and keeps two quotes instead of eight; check's copy reads as prepare's read-only preview everywhere; the audit's honest limit (not a penetration test) is stated on the run-it section and the README.

## [0.1.0]

Initial public release. The suite is nine Claude Code skills:

- **foundry**, a one-command pre-ship conductor that resolves the project's release policy, scores its gates (check) or closes them (prepare), and defers the authoritative verdict to one independent production-audit run.
- **production-audit** (flagship), a whole-application audit across six core dimensions plus the conditional dimensions the project's surface implies, ending in a scope-qualified ship or no-ship verdict, emitted as JSON against a versioned schema.
- **frame**, the one-page product frame (plus a four-line security frame) the builder declares and the skill audits before anything gets built.
- **scaffold**, **document**, **mobile**, and **instrumentation**, the user-invoked disciplines that get a product to production-ready.
- **phase-plan** and **brand-voice**, the model-invoked disciplines that keep the plan chain unbroken across sessions and one voice across every surface.

Ships with the marketing site, a Behind-the-Build hub, and a sign-in-gated reports section (Supabase magic link, per-owner visibility) that renders every published audit through one template.
