# Init and list

Read only when invoked as `production-audit init` or `production-audit list`; neither runs an audit.

Reports are the artifact, so the skill that emits them also owns their attribution and history. The auth model, stated plainly: **the skills never require an account.** Sign-in exists for exactly one thing, viewing your published reports on the Foundry site, where each report is visible only to the email it belongs to.

- **Connect an owner (`production-audit init`, optional, once).** Read `~/.claude/foundry.json`; if it already holds an `owner` email, report "connected as <email>" and stop (idempotent; switch only when asked). Otherwise ask for the email (one question), normalize to lowercase, write `{"owner": "<email>"}` to `~/.claude/foundry.json`. From then on every report stamps `meta.owner` with it. Then point at the site's `/unlock` for the one-time magic link, but never block on it: sign-in is not part of `init` succeeding, and no owner file just means no stamp.
- **List local history (`production-audit list`, no sign-in).** Gather `tmp/audit-YYYY-MM-DD.json` files in the current project (plus, for suite maintainers, the site repo's published `reports/`). Print newest first: project, date, verdict, critical/high counts, file path. These files are readable right here without any account; the web rendering is the only surface behind the magic link.
