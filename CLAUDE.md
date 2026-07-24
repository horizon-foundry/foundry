# Foundry

## Additional Context

DESIGN.md is the canonical design system for the site. BRAND.md is the identity and voice source of truth (distinct from DESIGN, which is looks, and PRODUCT, which is what/who). PRODUCT.md is the review philosophy and the forever spec: what the audit is, in the present tense. `reference/doc-set-spec.md` is the canonical documentation architecture the suite's skills enforce. `NOTES.md` holds decisions with reasoning, `PROMPTS.md` the session log, `FRICTION.md` the process-friction log.

## Project Overview

This repo is a **skills suite** whose flagship is Production Audit. The unifying thesis: **software delivery integrity** for people who build products with an AI in the loop, five promises between an idea and its release (intent declared and audited; execution context preserved; the outcome instrumented; docs aligned with reality; readiness audited before real users), with documentation engineered as the agent's memory so a cold start cannot go wrong.

**Production Audit** (`skills/production-audit/`) runs a whole-application production-readiness audit across six dimensions (security, concurrency, reliability, accessibility, UI consistency, infra) and ends in a ship/no-ship verdict, emitting a JSON report against `schema/audit-report.schema.json`. It exists because nothing else audited a complete application: security review covers security, diff review covers a diff, frontend audit covers the frontend.

**foundry** (`skills/foundry/`) is the pre-ship conductor. It first resolves the project's release policy (a block in that project's PRODUCT.md naming project_type, risk_tier, launch_audience, and per-gate required/optional; see this repo's PRODUCT.md "Release policy" for the shape), then runs its two deliberately separate modes: `check` (read-only gate discovery + a scorecard with states met / not-met / not-applicable / waived / blocked / accepted-risk) and `prepare` (invokes the modifying skills, document, mobile, instrumentation, to close the gaps). The authoritative verdict is one independent `production-audit` run afterward, never a duplicate full audit. It is a conductor, not a doer: it invokes each real skill (honoring that skill's own gate) and never reproduces the work inline. Report identity moved to production-audit: `production-audit init` records the operator email in `~/.claude/foundry.json` so reports stamp `meta.owner`, and `production-audit list` shows local report history with no sign-in (the web view is the only surface that needs the magic link).

**The other skills** (`skills/{frame,phase-plan,brand-voice,scaffold,document,mobile,instrumentation}/`) operationalize the disciplines: frame the product before building (the builder declares a one-page frame that opens PRODUCT.md; the skill audits it, blanks are findings), scaffold production-ready, keep the docs true to the code and rendered as a live in-product surface (document, which absorbed the docs-vs-code drift check), maintain the plan chain that makes work resumable, enforce brand voice, pressure-test mobile, and instrument the funnel. (Two skills were retired in the 2026-07-13 consolidation: doc-drift merged into document, and resume became a scaffolded CLAUDE.md instruction rather than a standalone skill, since "read the plan before acting" is an invariant, not a judgment call.) Every skill opens with a mandatory gate (see `reference/skill-authoring.md`) so it resists being bypassed when named.

The **site** on Fly presents the suite: a marketing landing, a `/skills` directory, a Behind-the-Build hub, and a public `/reports` hub (signed-out visitors see the public example audits and a sign-in prompt; signed-in visitors also see the reports they own, Supabase magic link, per-owner filtering) rendering every published audit through one template. Individual per-report DETAIL pages under `/reports/[slug]` stay owner-gated (signed-out redirect, non-owner 404); public example reports render ungated at `/example/[slug]`. The master plan and phase plans are indexed in TODOS.md's Master Plan block; read them there.

## Tech Stack

| Layer | Technology |
| ----- | ---------- |
| Skills | Claude Code skills (Markdown, agent-orchestrated), installed user-global via symlink |
| Doc architecture | `reference/doc-set-spec.md` + `reference/templates/` |
| Report contract | JSON Schema (`schema/audit-report.schema.json`) |
| Site | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 |
| Deploy | Fly.io, Node 22 standalone Docker image |

## Project Structure

```
foundry/
├── CLAUDE.md              # Agent working instructions (this file)
├── PRODUCT.md             # The review philosophy, the forever spec (present-tense truth)
├── BRAND.md               # Identity + voice source of truth
├── DESIGN.md              # Canonical design spec for the site
├── NOTES.md               # Decisions with reasoning + rejected alternatives
├── PROMPTS.md             # Session summary, phases, origin (no raw prompt log; see below)
├── FRICTION.md            # Friction log, process problems + candidate improvements
├── TODOS.md               # Master Plan block + backlog
├── README.md              # Public-facing project doc
├── LICENSE                # MIT
├── Makefile               # install (symlink all skills) + validate (schema + invariants + sync check) + sync-schema
├── scripts/
│   └── validate-report-invariants.mjs  # cross-field report rules make validate enforces
├── reference/
│   ├── doc-set-spec.md      # Canonical documentation architecture the skills enforce
│   ├── skill-authoring.md   # Suite standard: how skills are written to resist bypass
│   └── templates/BRAND.md   # BRAND.md template for scaffolded projects
├── skills/                # The suite, 9 skills (each dir symlinks into ~/.claude/skills/<name>)
│   ├── foundry/SKILL.md    (one-command pre-ship conductor)
│   ├── production-audit/SKILL.md  (flagship)
│   ├── frame/SKILL.md      (one-page product frame before building)
│   ├── phase-plan · brand-voice
│   └── scaffold · document · mobile · instrumentation
│   #  document absorbed doc-drift (docs-vs-code truth); resume was cut (its
│   #  read-the-plan rule is a scaffolded CLAUDE.md instruction, not a skill)
│   #  every SKILL.md opens with the mandatory "Using this skill" gate
├── schema/
│   ├── audit-report.schema.json   # Versioned report contract (source of truth; a bundled
│   │                              # copy ships inside skills/production-audit/, kept in
│   │                              # sync by `make sync-schema`, checked by `make validate`)
│   └── examples/sample-report.json # Hand-built sample; validated by `make validate`
├── reports/
│   └── <project-slug>-<date>.json # Published audit reports (schema-valid); public ones at /example, owned at /reports
├── app/                   # Next.js App Router site
│   ├── layout.tsx         # root layout, IBM Plex fonts, metadata
│   ├── error.tsx          # root error boundary (recoverable page on an unexpected throw)
│   ├── page.tsx           # marketing landing
│   ├── globals.css        # Instrument design tokens (@theme) + doc-prose + grain
│   ├── behind/            # Behind-the-Build hub (deck + doc tabs)
│   │   ├── layout.tsx     # header + BehindNav tab bar
│   │   ├── page.tsx       # Overview slide deck (slide data inline)
│   │   └── {product,brand,design-system}/  # curated public tabs (raw logs are internal-only)
│   ├── skills/            # public suite directory + per-skill SKILL.md render
│   │   ├── page.tsx       # /skills index
│   │   └── [slug]/        # renders skills/<slug>/SKILL.md
│   ├── reports/           # PUBLIC index (examples + sign-in CTA; owned reports when signed in)
│   │   ├── page.tsx       # report index, filtered to meta.owner (admins see all)
│   │   └── [slug]/        # ReportView renderer; non-owner slugs 404 (never 403)
│   ├── example/[slug]/    # ungated public example report (meta.public only)
│   ├── auth/              # confirm/ (magic-link landing) + signout/ (POST-only)
│   └── unlock/            # public sign-in form + requestMagicLink server action
├── components/            # Wordmark (H/F mark), SiteHeader/Footer, NavLink, SlideDeck,
│   │                      # SlideGlyph, BehindNav, MarkdownDoc, report-ui, ReportView,
│   │                      # Terminal (the homepage hero, product-in-use), HeroForge
│   │                      # (pointer-reactive hero backdrop), ReportSpecimen (the
│   │                      # worked-example report excerpt), InstallBlock, CopyButton,
│   │                      # SubmitButton, SignOutButton, PostHogIdentify, CaptureView,
│   │                      # ConsoleSignature (devtools easter egg)
├── lib/                   # fonts, docs (md reader), skills (SKILL.md reader),
│   │                      # reports (json reader + ownership filters), report-types,
│   │                      # supabase (server client, fail-closed; admin check),
│   │                      # posthog-server (env-gated capture, flush-immediate)
├── middleware.ts          # Supabase session refresh, scoped to /reports
├── instrumentation-client.ts  # posthog-js bootstrap (no-op without key)
├── Dockerfile             # Next standalone on Node 22 (docs + skills + reports COPY'd in)
├── fly.toml               # Fly app config; Supabase secrets set separately
├── next.config.ts         # standalone output + security headers (dogfooded)
└── tmp/                   # User-provided staging area (gitignored)
```

Friction entries land in `FRICTION.md` per the self-maintenance rules below (the maintainer also has a user-scoped `/friction` shortcut that appends to it).

## Development Commands

```bash
make install          # symlink every skills/*/ into ~/.claude/skills/<name>
make validate         # schema-validate reports + sample, check the bundled schema copy
                      # is in sync, and enforce the cross-field report invariants
make sync-schema      # re-copy the canonical schema into skills/production-audit/
npm install           # site deps
npm run dev           # dev server at localhost:3000
npm run typecheck     # tsc --noEmit
npm run lint          # eslint (native flat config; see note below)
npm run build         # production standalone build

# Local /reports testing needs the Supabase env in .env.local (see .env.example:
# SUPABASE_URL, SUPABASE_ANON_KEY, ADMIN_EMAILS) and
# http://localhost:3000/auth/confirm in the Supabase redirect URL allowlist.
```

**ESLint config:** `eslint.config.mjs` imports `eslint-config-next`'s native flat-config array directly and spreads it. Do NOT wrap it in `FlatCompat`, FlatCompat's schema validator hits a circular-reference bug on the plugin objects and crashes lint.

**Deploy:** Fly app `foundry-skills` (foundry-skills.fly.dev), Node 22 standalone Docker image. (Repo and Fly app both carry the Foundry name now. The old `production-audit` Fly app is stopped, scaled to 0, and can be destroyed once the new URL is confirmed.) `foundry-skills.fly.dev` is the live, reachable origin today; site metadata (`SITE_URL` in `app/layout.tsx`, so OG/canonical/JSON-LD) points at the intended production domain, `https://foundry.thehorizonfoundry.com`, ahead of DNS. `fly.toml`'s `SITE_ORIGIN` (the Supabase magic-link redirect target) stays on the fly.dev origin until DNS and the Supabase redirect allowlist move together (see TODOS.md's Phase 13 launch-tail checklist), so auth keeps working in the meantime. The docs (`PRODUCT/BRAND/DESIGN/NOTES/PROMPTS/FRICTION.md`), the `skills/*/SKILL.md` files, and `reports/*.json` are read at runtime via fs, so the Dockerfile COPYs them explicitly (Next's standalone trace omits them). Three Fly secrets gate `/reports`: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `ADMIN_EMAILS` (fail closed if unset). The names are deliberately NOT `NEXT_PUBLIC_`: Next inlines `NEXT_PUBLIC_*` at build time and the Docker image builds without secrets, so runtime-set secrets under those names would never be read. Access model: the `/reports` INDEX is public, a signed-out visitor sees only the `meta.public` example reports plus a sign-in prompt (never a private report). Supabase magic-link sign-in proves the email; a signed-in visitor additionally sees reports whose `meta.owner` matches it, `ADMIN_EMAILS` see all. The per-report DETAIL route `/reports/[slug]` gates itself (signed-out redirect to `/unlock`, non-owner 404), independent of the now-ungated layout. `/example/[slug]` (meta.public) stays ungated.

## Instrumentation (PostHog)

The event plan is defined here FIRST; capture code conforms to this table, never the other way around (instrumentation skill discipline). Two funnels, one identity.

**Funnel A, suite adoption (anonymous):** view -> intent -> value proxy. True activation (running a skill in Claude Code) is outside the site's reach.

| Stage | Event | Where | Properties |
| ----- | ----- | ----- | ---------- |
| view | `$pageview` | client, auto | (SDK defaults) |
| intent | `install_copied` | client, CopyButton | `command_kind` ("npx" or "clone"), `surface` |
| value proxy | `example_report_viewed` | client, /example/[slug] mount | `slug` |

**Funnel B, reports access (identified; activation = report_viewed):**

| Stage | Event | Where | Properties |
| ----- | ----- | ----- | ---------- |
| intent | `magic_link_requested` | server action, /unlock | distinct id = normalized email |
| auth | `sign_in_completed` | server, /auth/confirm | `method` ("token_hash" or "code"); distinct id = Supabase user id, aliased to the email id so the intent event joins |
| auth failure | `sign_in_failed` | server, /auth/confirm | `reason` ("expired" or "unavailable"); random distinct id (identity unknown at failure) |
| activation | `report_viewed` | client, /reports/[slug] mount | `slug`, `access` ("owner" or "admin") |

**Identity rule:** the Supabase user id is THE distinct id. Client-side, the gated layout renders `PostHogIdentify` (posthog.identify(userId, { email })) so browser pageviews stitch to server events. Pre-auth, `magic_link_requested` is keyed on the email; `sign_in_completed` aliases that email id to the user id. Never key an event on anything else.

**Reliability:** server capture uses a posthog-node singleton with `flushAt: 1, flushInterval: 0` (send immediately; Fly machines auto-stop) and is never awaited in a request path. Client and server both no-op when their key env is unset (local, tests); analytics being down must never break a flow.

**Env:** `NEXT_PUBLIC_POSTHOG_KEY` is required at BUILD time for the browser bundle, so it lives in `fly.toml [build.args]` and the Dockerfile (a phc key is public by design, it ships in the served JS regardless). The server reads `POSTHOG_KEY` (falls back to the NEXT_PUBLIC value) at runtime.

## Working in This Repo

### Keep the docs out of each other

This repo follows its own `reference/doc-set-spec.md`. The one-owner-per-fact split:

- **CLAUDE.md** (this file): how to work in this repo. Procedure and conventions. Reference the others; never copy from them.
- **PRODUCT.md**: the forever spec. What the product is, in the present tense. Never aspirational.
- **BRAND.md**: identity and voice. Purpose, positioning, voice, glossary, copy rules. The voice source of truth.
- **DESIGN.md**: the visual system. Tokens, type, components. The looks source of truth.
- **NOTES.md**: why. Decisions and rejected alternatives.
- **PROMPTS.md**: what happened, in order.
- **FRICTION.md**: where the process hurt.

Duplication between any of these is drift. If the same fact appears in two, remove it from the less-authoritative one and leave a pointer.

### Source-of-truth rules

- `schema/audit-report.schema.json` is the report contract. `skills/production-audit/SKILL.md` (which emits reports) and the site's `ReportView` renderer (which consumes them) both conform to it. Changing the schema means updating both in the same commit, and bumping `schemaVersion`.
- `skills/*/SKILL.md` in this repo are the canonical skills. Each user-global copy at `~/.claude/skills/<name>` is a symlink to its `skills/<name>/` directory, never a diverging copy. `make install` recreates any missing symlink.
- PRODUCT.md describes the audit philosophy; `skills/production-audit/SKILL.md` operationalizes it. When the method changes, both change in the same commit. PRODUCT.md explains why, SKILL.md instructs how.
- `reference/doc-set-spec.md` is the canonical doc architecture the suite's skills enforce; when the doc rules change, they change there first.
- **The marketing site tracks every skill.** The `/skills` pages render from the `skills/` dir + `lib/skills.ts`, so adding a skill means dropping its `skills/<name>/SKILL.md` (with the `reference/skill-authoring.md` gate) AND classifying it in `lib/skills.ts` (`USER_INVOKED` + `ORDER`) in the same commit; it then appears on the site automatically. Also add it to the `README.md` skills table and this CLAUDE.md tree. A new skill is not done until the site, README, and this file show it. (Marketing-tracks-product, applied to the suite.)
- **The public self-audit tracks the suite.** Foundry publishes a real audit of its own repo at `/example/foundry-<date>` (the `reports/foundry-<date>.json` report with `meta.public: true`) as the credibility anchor: real, inspectable code, real findings, no third-party disclosure risk. Because the tool audits itself, this report is not a static artifact. When the suite changes in a way that alters what an audit of this repo would find, a skill added, removed, or materially changed; a new route, gate, or trust boundary; a dependency or header change, **regenerate the self-audit under the current method and replace the published report in the same phase.** A self-audit that describes a prior version of the suite is the same drift as stale marketing copy: the proof surface must stay true to the product that ships. This is enforced in the Phase-13 release checklist and re-checked whenever `/skills` gains or loses a card. (The illustrative Perch report, `reports/perch-2026-07-12.json`, is a constructed traditional-SaaS example that demonstrates the payments/concurrency dimensional range the self-audit's thin surface cannot; it is labeled as illustrative, not a real audit.)

### Project-specific conventions

- Published reports are named `reports/<project-slug>-<YYYY-MM-DD>.json`. The slug becomes the `/reports/[slug]` URL.
- Reports contain vulnerability findings for live products. They are only ever surfaced behind the sign-in gate, to their owner (`meta.owner`) or an admin; nothing under `reports/` may be linked from or summarized on ungated pages beyond aggregate counts and verdict level.
- No em dashes in any authored content, including SKILL.md, docs, site copy, and generated report text.
- One word is banned from all authored content in this repo, in any casing: the common noun for a repeated ceremonial practice, spelled r-i-t-u-a-l (spelled out here so the rule itself never contains a searchable occurrence). Where the concept is needed, write "ceremony", "rite", or "routine" instead. House style rule, applied the same way as the em-dash rule.

## Self-Maintenance: NOTES.md, PROMPTS.md, and FRICTION.md

These three files are **agent-maintained**. Keep them current as work happens, do not wait for an end-of-session cleanup.

### NOTES.md

Update when a judgment call is made that a future agent would otherwise have to re-derive. Examples: choosing a placement for a new spec section, picking a component pattern over an alternative, deciding what NOT to do and why. Each entry documents **the decision, the reasoning, and the rejected alternative(s)**. If a decision is reversed later, leave the original entry in place and append the reversal with its own reasoning, the history is part of the value.

Do not log routine work (file created, function written) in NOTES.md, that belongs in git history. NOTES.md is for decisions, not changes.

### PROMPTS.md

PROMPTS.md has three sections that must stay in sync:

1. **Summary**, one-paragraph framing of what this project is and how it's being built. Update when the framing changes.
2. **Phases**, chronological phase-by-phase narrative of the work. When a phase completes, add a new `## Phase N: <name>` section with what was built, what was decided, and what was deferred. Do not edit prior phases except to fix errors.
3. **Origin and direction**, the decisions that shaped the build, in the project's own voice.

This repo's PROMPTS.md intentionally carries NO raw verbatim prompt log: the de-personalization pass before the public flip removed it (this file may render publicly once the repo is public, and the doc-set spec's raw-log guidance yields to that). Do not reintroduce verbatim prompts; record what happened in the Phases narrative instead.

The Phases section is the curated narrative. The Summary is the one-sentence elevator pitch. All sections must stay truthful to each other.

### FRICTION.md

FRICTION.md captures process problems, not product bugs. Entries land through two paths:

1. **Agent-observed.** If the user iterates three or more times on the same prompt, rejects consecutive drafts for overlapping reasons, or otherwise signals that a task is costing more than it should, add a friction entry. Do not wait for the user to ask. Flag the entry to them when you add it so they can revise or remove.
2. **Explicit via `/friction`.** The user invokes `/friction <one-liner>` (a user-scoped slash command in their own Claude Code config) and it appends a dated entry.

Every entry has three fields: **What happened** (factual observation), **Likely cause** (best hypothesis), **Candidate improvement** (specific, actionable change to the process). A friction entry without a candidate improvement is a complaint, not a log, reject those or ask the user to provide one.

Entries are facts, not blame. Keep the tone neutral.

### When to update these files

- **After any decision worth preserving** → update NOTES.md in the same turn, before moving on.
- **After a phase of work finishes** (a coherent unit: a feature shipped, a spec supplemented, a refactor completed) → add a Phases entry to PROMPTS.md.
- **After observing friction** (iteration loops, drafts rejected for overlapping reasons, tool failures costing session time) → add a FRICTION.md entry or prompt the user with `/friction` context.
- **During the commit workflow** → verify all four docs (CLAUDE.md, NOTES.md, PROMPTS.md, FRICTION.md) are current before the commit message step.

## Commit Workflow

The maintainer's standard workflow applies: all work on feature branches (never commit to main after the initial commits), commit messages written to a temp file and passed with `git commit -F` so special characters cannot break the shell, and every unit of work ends in a PR. Project-specific steps:

1. **Build and verify (root Step 2):** No build tooling until Phase 3. Once the site lands: `npm run typecheck && npm run lint && npm run build`. For skill/schema changes: validate the sample report against the schema (`npm run validate:reports` once available; until then `npx ajv-cli validate -s schema/audit-report.schema.json -d "reports/*.json"`).

2. **Update CLAUDE.md (root Step 5):** Only for changes to agent-facing working conventions or repo structure. Never copy design content from DESIGN.md into here.

3. **Update NOTES.md, PROMPTS.md, and FRICTION.md (in parallel with root Step 5):** Per the self-maintenance rules above. If any are out of date, bring them current before staging the commit.

4. **README.md (root Step 6)** and **TODOS.md (root Step 7):** Already present, update per the workspace format specs when counts, descriptions, or backlog items change.
