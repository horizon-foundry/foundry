# Foundry

**An open-source project from Horizon Foundry, created and maintained by [Craig Martin](https://github.com/cjmartin2).**

Software delivery integrity, delivered as Claude Code skills, for people who build products with an AI in the loop. The suite makes five promises between an idea and its release. Product intent is declared and audited (`frame`). Execution context survives every session (`phase-plan`). The intended outcome is instrumented (`instrumentation`). The documentation matches reality (`document`). Technical readiness is audited before real users arrive (`foundry` + `production-audit`). Documentation is built to be the agent's memory, so a cold start cannot go wrong. The flagship is `production-audit`: a whole-application pre-launch audit that ends in a scope-qualified ship/no-ship verdict. When a project is nearing release, `foundry` resolves the release gates its launch actually requires and checks them in one command.

Foundry is the outer loop: the release gate at the end of the build cycle. It composes with the inner-loop skills you already use to write and review code, rather than replacing them, and it installs through the same `npx skills add` channel. It is opinionated where opinion is the product. You set the release policy: which gates apply, the risk tier, and the risks you accept on the record. The severity rubric and the meaning of the verdict are fixed on purpose. A bar you can lower until it reads green is the false comfort an audit exists to replace.

## The skills

**User-invoked (orchestration you type):**

| Skill | What it does |
| --- | --- |
| `foundry` | The pre-ship pass over a project's release gates. It resolves the release policy first: which gates this launch requires, given project type, risk tier, and audience. Then `foundry check` (read-only) scores each policy gate (met, not-met, not-applicable, waived, blocked, accepted-risk), and `foundry prepare` invokes the modifying skills (document, mobile, instrumentation) to close the gaps. The authoritative verdict is one independent production-audit run afterward, never a duplicate, so assessment, modification, and judgment stay separate. It is a conductor: it invokes each real skill and never reproduces it. Report identity (`init`/`list`) lives with production-audit. |
| `production-audit` | A whole-application audit across a standing set of eleven dimensions (security, concurrency, reliability, accessibility, UI, infra, plus operability, testing confidence, data and migration safety, release safety, performance and capacity), applicability resolved per project. It separates risks (a path to harm, which drive the verdict) from improvements (safe today, which never cap it), and ends in a verdict that names its evidence base: a static-only run states "runtime not exercised" beneath the recommendation rather than overclaiming a runtime-verified result. It emits a JSON report against a versioned schema. |
| `frame` | The builder declares a one-page product frame (user, problem, alternatives, outcomes, evidence and assumptions, success measure, non-goals, risks, learn before investing) plus a four-line security frame (data classification, trust boundaries, authn/authz, secret handling). The skill audits that declaration the way the suite audits code, and blank or vague entries become findings. It never runs discovery and never invents answers. The rest of the work is checked against it. |
| `scaffold` | Declare the project's profile (experiment, internal-tool, web-product, service, library), then stand up the doc set, security frame, and ship shape that profile needs. It is self-contained, with no template repo required. It never defaults a license, and it respects a repo's existing CI/deploy/doc standards. |
| `document` | Keep the docs true to the code and current across every surface. The truth layer repairs a stale doc to match observed behavior, or flags a suspected regression when a test or an intent claim says the code changed. The presentation layer depends on the project type: public-facing projects get the authored overview deck and "Behind the Build" hub (nothing invented, every claim traces to something real), and internal ones get the truth layer only. It is idempotent, so a clean re-run is a no-op. |
| `mobile` | Pressure-test a surface to a good mobile experience. Reproduce and instrument before fixing (the layout traps are diagnostic candidates, not blanket rules), then verify core flows across the matrix: three device widths, landscape, text zoom, software keyboard, keyboard-only, and a real iOS Safari + Android Chrome pass. Products with no mobile surface declare the gate not-applicable. |
| `instrumentation` | Instrument a funnel and the activation moment. Define events before building. Use one identity model across client and server (each event keyed on the right entity). Capture reliably on the server. Add operational governance (versioned schemas, dedup, a named owner). Measure activation over vanity. |

**Model-invoked (disciplines the agent applies itself):**

| Skill | What it does |
| --- | --- |
| `phase-plan` | Write and index the next unit's plan while context is warm (acceptance criteria, dependencies, and non-goals included), so a later session continues from a real handoff. When there is no next unit, index an honest terminal entry instead. On resume, the plan is reconciled against git state before work starts. |
| `brand-voice` | Enforce one voice from `BRAND.md` across all copy. The standard binds only after human sign-off (drafted from approved inputs, never invented). Clarity outranks it: comprehension, accessibility, and error recovery come before stylistic consistency. |

Shared references: [`reference/doc-set-spec.md`](reference/doc-set-spec.md) (the documentation architecture the skills enforce) and [`reference/skill-authoring.md`](reference/skill-authoring.md) (how the skills are written to resist being ignored). A named skill is invoked and followed, never hand-reproduced.

## Tech Stack

| Layer | Technology |
| ----- | ---------- |
| Skills | Claude Code skills (Markdown), installed user-global via symlink |
| Report contract | JSON Schema |
| Site | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 |
| Deploy | Fly.io, Node 22 standalone Docker image |

## Requirements

- Claude Code (to run the skills)
- Node (for `npx skills`), or git + make (for the from-source install)
- Node 22+ only if you want to run this site

## Install

The quickest path adds the skills to Claude Code with one command:

```bash
npx skills@latest add horizon-foundry/foundry
```

Pick the skills you want; they install as top-level commands (`/foundry`, `/production-audit`, and so on). Then run them:

```bash
claude
/foundry check
```

Or install from source, which symlinks every skill so it tracks the repo:

```bash
git clone https://github.com/horizon-foundry/foundry
cd foundry
make install
```

Update from source with `git pull && make install`; remove with `make uninstall`.

## Local Development

```bash
# Install every skill user-global (symlinks into ~/.claude/skills)
make install

# Validate the sample report and any published reports against the schema
make validate

# Site
npm install
npm run dev          # localhost:3000
npm run lint
npm run build

# Local /reports testing needs the Supabase env (see .env.example); copy it to
# .env.local and add http://localhost:3000/auth/confirm to the Supabase
# project's redirect URL allowlist.
```

## Usage

```
/production-audit                # full audit: applicable dimensions from eleven, risks separated from improvements
/production-audit security       # one dimension (scoped posture, not a release verdict)
/production-audit --quick        # security + reliability triage
/production-audit --runtime      # add a live browser pass (verdict scope: static-plus-runtime)
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
