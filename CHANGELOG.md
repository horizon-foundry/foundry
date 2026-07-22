# Changelog

All notable changes to Foundry are recorded here. The format follows [Keep a Changelog](https://keepachangelog.com/), and the project aims to follow semantic versioning once it reaches 1.0.

## [Unreleased]

- Docs: reworded one NOTES.md decision entry and one skill-authoring phrase; added a house style rule to CLAUDE.md.

## [0.1.0]

Initial public release. The suite is nine Claude Code skills:

- **foundry**, a one-command pre-ship conductor that resolves the project's release policy, scores its gates (check) or closes them (prepare), and defers the authoritative verdict to one independent production-audit run.
- **production-audit** (flagship), a whole-application audit across six core dimensions plus the conditional dimensions the project's surface implies, ending in a scope-qualified ship or no-ship verdict, emitted as JSON against a versioned schema.
- **frame**, the one-page product frame (plus a four-line security frame) the builder declares and the skill audits before anything gets built.
- **scaffold**, **document**, **mobile**, and **instrumentation**, the user-invoked disciplines that get a product to production-ready.
- **phase-plan** and **brand-voice**, the model-invoked disciplines that keep the plan chain unbroken across sessions and one voice across every surface.

Ships with the marketing site, a Behind-the-Build hub, and a sign-in-gated reports section (Supabase magic link, per-owner visibility) that renders every published audit through one template.
