# Foundry

**An open-source project from Horizon Foundry, created and maintained by [Craig Martin](https://github.com/cjmartin2).**

Foundry is nine Claude Code skills that turn fast, AI-built code into something you can ship. The flagship, `production-audit`, audits the whole application across eleven dimensions and ends in one verdict: safe to ship; ready to ship, risks noted; or do not ship. Every finding cites the code that motivated it, and a static run never claims a runtime result.

The proof is public: we audited Foundry with Foundry, fixed the risks the report found, and published it. Read the [self-audit](https://foundry.thehorizonfoundry.com/reports) against this source.

## Install

```bash
npx skills@latest add horizon-foundry/foundry
```

Pick the skills you want; they install as top-level commands. Then run one:

```bash
claude
/foundry check          # preview your release gates, read-only
/production-audit       # the whole-application audit and verdict
```

Or install from source, which symlinks every skill so it tracks the repo:

```bash
git clone https://github.com/horizon-foundry/foundry
cd foundry
make install
```

Update from source with `git pull && make install`; remove with `make uninstall`. Requirements: Claude Code, and Node for `npx skills` (or git + make for the source path).

## The skills

**User-invoked (orchestration you type):**

| Skill | What it does |
| --- | --- |
| `foundry` | One pre-ship pass over the release gates your launch actually requires. `check` previews read-only, citing the records that exist; `prepare` closes the gaps; one independent audit delivers the verdict. |
| `production-audit` | Audits the whole application, separates risks (which drive the verdict) from improvements (which never cap it), and ends in a verdict that names its evidence. |
| `frame` | You declare the one-page product frame; the skill audits it like code. Blanks are findings, so a disciplined build cannot ship an unexamined idea. |
| `scaffold` | Starts a project in the shape its profile needs, experiment through web product, and verifies no placeholder survives. |
| `document` | Keeps the docs true to the code: repairs drift, flags suspected regressions, and renders the docs as a live surface so they cannot rot unseen. |
| `mobile` | Reproduces the broken state before fixing anything, then walks a real device matrix and leaves the filled matrix as the record. |
| `instrumentation` | Defines the funnel before the feature, keys every event on one identity model, and measures activation with a guardrail beside it. |

**Model-invoked (disciplines the agent applies itself):**

| Skill | What it does |
| --- | --- |
| `phase-plan` | Writes the next unit's plan while context is warm and indexes it, so the next session resumes instead of reconstructing. |
| `brand-voice` | One voice from one approved source across every surface. Clarity outranks it. |

Shared references: [`reference/doc-set-spec.md`](reference/doc-set-spec.md) (the documentation architecture the skills enforce) and [`reference/skill-authoring.md`](reference/skill-authoring.md) (how the skills are written to resist being ignored). A named skill is invoked and followed, never hand-reproduced.

## How it fits

Foundry is the outer loop: the release gate at the end of the build cycle. It composes with the inner-loop skills you already use to write and review code, and installs through the same channel. Five promises carry the suite, each kept by a skill: intent is declared and audited (`frame`), context survives every session (`phase-plan`), the outcome is instrumented (`instrumentation`), the docs match reality (`document`), and readiness is audited before real users arrive (`foundry` + `production-audit`).

You set the scope, not the bar. Which gates apply, the risk tier, and the risks you accept are your call, on the record. The severity rubric and the meaning of the verdict are fixed on purpose: a bar you could lower until it reads green is the false comfort an audit exists to replace.

Honest limits, stated plainly: the audit reads code and traces flows; it is not a penetration test, and anything it could not verify is listed in the report as not assessed.

## Usage

```
/production-audit                # full audit: applicable dimensions from eleven, risks separated from improvements
/production-audit security       # one dimension (scoped posture, not a release verdict)
/production-audit --quick        # security + reliability triage
/production-audit --runtime      # add a live browser pass
```

## Tech Stack

| Layer | Technology |
| ----- | ---------- |
| Skills | Claude Code skills (Markdown), installed user-global via symlink |
| Report contract | JSON Schema |
| Site | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 |
| Deploy | Fly.io, Node 22 standalone Docker image |

## Local Development

```bash
# Install every skill user-global (symlinks into ~/.claude/skills)
make install

# Validate the sample report and any published reports against the schema
make validate

# Site (Node 22+)
npm install
npm run dev          # localhost:3000
npm run lint
npm run build

# Local /reports testing needs the Supabase env (see .env.example); copy it to
# .env.local and add http://localhost:3000/auth/confirm to the Supabase
# project's redirect URL allowlist.
```

## Building & Deployment

The site deploys to Fly.io as a Node 22 standalone Docker image (`fly deploy`). Audit reports live in `reports/*.json` and render through one shared template. The `/reports` index is public: a signed-out visitor sees the public example audits and a sign-in prompt, and a signed-in visitor also sees the reports whose `meta.owner` matches their email (`ADMIN_EMAILS` see all). Owned-report detail pages under `/reports/[slug]` are gated server-side (signed-out redirect, non-owner 404); public examples render ungated at `/example/<slug>`. Set three Fly secrets before sign-in works (fail-closed without them):

```bash
fly secrets set SUPABASE_URL="https://<ref>.supabase.co"
fly secrets set SUPABASE_ANON_KEY="<anon key>"
fly secrets set ADMIN_EMAILS="you@example.com"
```

Publishing a new audit: run `/production-audit`, copy the emitted JSON into `reports/<project>-<date>.json`, and deploy.

Site analytics (PostHog) are optional and off by default: without a key every capture no-ops. The browser key is a build arg (`fly.toml [build.args] NEXT_PUBLIC_POSTHOG_KEY`, public by design); the server reads `POSTHOG_KEY` at runtime. The event plan lives in CLAUDE.md.

## Project Structure

```
foundry/
├── PRODUCT.md · BRAND.md · DESIGN.md   # forever spec · voice · looks
├── NOTES.md · PROMPTS.md · FRICTION.md # why · what happened · friction
├── CLAUDE.md · TODOS.md · README.md · LICENSE
├── reference/     # doc-set-spec.md + skill-authoring.md + templates/
├── skills/        # the suite (each dir symlinks into ~/.claude/skills/<name>;
│                  # production-audit bundles its schema copy)
├── schema/        # audit-report.schema.json (canonical) + examples/
├── scripts/       # validate-report-invariants.mjs (run by make validate)
├── reports/       # published audit JSON; public ones at /example, owned at /reports (public index)
├── app/ · components/ · lib/           # Next.js site
├── Dockerfile · fly.toml
└── Makefile
```

## License

MIT, see [LICENSE](LICENSE).
