<!-- Authored in a remote session that cannot write to ~/.claude/plans/, so this file rides in the repo. If you want it under the workspace convention, move it to ~/.claude/plans/ and update the index path in TODOS.md in the same edit. -->

Status: active
Written: 2026-09-18

## Goal

Close the four real gaps a 20-point "is this site actually production ready" checklist found on foundry.thehorizonfoundry.com (landing page plus the `/skills` pages), and record why the rest of that list is already met or deliberately skipped, so the question is not re-asked next launch cycle.

The audit that produced this plan (2026-09-18, on `ebe3ae6`) checked every item against the code, not the list. Twelve of twenty are already met: custom 404, a title on every route, a root description plus per-page descriptions on `/skills` routes, a CTA above the fold (Install Foundry, See the skills), the favicon set, `robots.txt`, a 1200x630 OG image with alt text, alt text (the site has no raster images; every SVG is decorative and `aria-hidden`), mobile breakpoints, form error states on the one form, a thank-you state (the magic-link "sent" page), analytics (PostHog, env-gated), loading state (the submit button's pending label; nothing else is async client-side), and image compression (one 83 KB PNG). Four are real gaps and are this plan's work. Four are skipped on purpose, see Non-goals.

Why now: the site is public, the suite is at v0.2.0, and the site collects email addresses and analytics without a page that says so. That is the one gap with a trust cost, and it is cheap.

## Kickoff decisions

Carried forward, do not re-litigate:

1. **Cookie-free analytics instead of a cookie banner.** posthog-js defaults to `localStorage+cookie` persistence, which is what creates the consent question. Setting `persistence: "localStorage"` removes the analytics cookie at the source; the Supabase session cookies that remain are strictly necessary for the sign-in gate and need no consent. A banner on a developer-tool docs site is friction that exists to satisfy a problem the site can remove. Confidence on the legal framing is moderate (US-hosted free tool, no advertising, no cross-site tracking, not legal advice); confidence that it is the right product call is high.
2. **A privacy page, not terms and conditions.** The software's terms are the MIT license, already linked in the footer. Terms become necessary only if `/reports` becomes a paid or contracted service. Revisit then.
3. **A contact email, not a postal address.** A free open-source tool needs a reachable human, not a mailing address. Vulnerability disclosure stays on GitHub private reporting via `SECURITY.md`.
4. **The self-audit is not regenerated for this unit.** The published self-audit rule says a new route triggers regeneration. `/privacy` is a static page with no inputs, no data access, and no trust boundary, and the analytics change narrows the surface rather than widening it. Recommendation: fold the regeneration into the next release roll-up (Phase 17 or v0.3.0) and record this deferral in NOTES.md so it is not silent. Craig may overrule and regenerate in-phase.
5. **No sticky mobile CTA, no loading skeletons.** The conversion action is copying an install command into a terminal, which nobody does on a phone; a sticky bar on a reading-heavy site costs more than it earns. Nothing on the site takes long enough to skeleton.

## Steps

Order matters only where a later step reads an earlier one's output. Each step ends in something checkable. Sub-agents per step where available (workspace policy: plan, decompose, review each step before the next).

1. **Cookie-free analytics.** In `instrumentation-client.ts`, add `persistence: "localStorage"` to `posthog.init`. Verify in a real browser (Playwright, screenshot and cookie dump to `tmp/`) that no `ph_*` cookie is set after a pageview and that `install_copied` still captures. Confirm `sign_in_completed` aliasing still resolves (identify reads the distinct id from localStorage now). Update the README "Site analytics" paragraph and the CLAUDE.md PostHog gotcha with one line: the persistence choice is what keeps the site banner-free, so never revert it to a cookie mode without adding consent. Check: cookie dump shows only Supabase cookies, and only after sign-in.
2. **Privacy page at `/privacy`.** New route `app/privacy/page.tsx` with `SiteHeader` and `SiteFooter`, its own `metadata` title and description. Sections, in this order, written for a reader not a lawyer: what the skills send (only the daily version check: skill name and version, no identity, opt-out via `FOUNDRY_NO_VERSION_CHECK`, the stamp file); what the site collects (anonymous pageviews and install-copy events in PostHog, localStorage only, no cookie; the email you enter to request a sign-in link, held by Supabase for auth only; the Supabase session cookie after sign-in; the owner email stamped in a private report's `meta.owner`); what is never collected (no ads, no cross-site tracking, no selling); retention and deletion (state what is true: PostHog retention per plan, Supabase auth user deletable on request, reports removed on request); who to contact (the email from step 4); the date the page was last changed. Run the page through the `brand-voice` skill before it merges; the voice is the site's, not boilerplate. Add "Privacy" to the footer's secondary nav after "License (MIT)". Add a one-line link under the `/unlock` form ("How your email is used" -> `/privacy`). No Dockerfile change: a TSX route is traced by Next, only fs-read files need a COPY. Check: `/privacy` renders at 400px width with no horizontal scroll, is reachable from the footer on every page and from `/unlock`, and every factual claim on it is verified against the code or the vendor config, not assumed.
3. **Sitemap.** Add `app/sitemap.ts` (Next's file convention, served at `/sitemap.xml`) listing the ungated public routes: `/`, `/skills`, every `/skills/[slug]` from `listSkills()`, `/behind`, `/behind/product`, `/behind/brand`, `/behind/design-system`, every `/example/[slug]` from `listPublicReports()`, and `/privacy`. Exclude `/reports`, `/unlock`, `/auth/*`, and `/api/*` (robots already disallows the first two). Base URL from the same `SITE_URL` constant `app/layout.tsx` uses; lift it into `lib/site.ts` beside `REPO_URL` so the two cannot drift. Append `Sitemap: https://foundry.thehorizonfoundry.com/sitemap.xml` to `public/robots.txt`. Check: `curl /sitemap.xml` after `npm run build && npm start` lists exactly the ungated routes, none of the gated ones, and `robots.txt` names it.
4. **Contact email.** Decision required from Craig before this step merges: which address (a Horizon Foundry mailbox, or a forwarding alias). Never invent one. Once named: footer secondary nav gains "Contact" as a `mailto:` link, the privacy page uses the same address from one constant in `lib/site.ts`, and `SECURITY.md` is not changed (disclosure stays on GitHub). Check: one constant, two consumers, grep confirms no second literal.
5. **Per-page descriptions.** Give a specific `description` to the routes that today inherit the root one: `/example/[slug]` (project name plus verdict level from `report.verdict.level`, both already public on the page, nothing from findings), `/behind` and its three children, `/reports` index, `/unlock`, and `not-found` (a `metadata` export with title "Not found"). Check: `curl` each route and grep the `<meta name="description">` for a route-specific string.
6. **Verification and review.** `npm run typecheck && npm run lint && npm run build`. Playwright pass at 400px and 1280px over `/privacy`, the footer, and `/unlock` (screenshots to `tmp/`). Adversarial diff review with fresh sub-agents per the workspace "review the diff, not your intent" rule; angles that apply here: every page's footer renders the new links (one shared component, confirm no page bypasses it), the sitemap cannot leak a gated slug by any path, the analytics change does not double-count or split identities across the localStorage migration for returning visitors, and the privacy page's claims match `instrumentation-client.ts`, `lib/posthog-server.ts`, and `fly.toml`. Report what the pass found even when it found nothing.
7. **Surfaces.** `CHANGELOG.md` `[Unreleased]` entries under Added (privacy page, sitemap, contact) and Changed (cookie-free analytics, per-page descriptions). `NOTES.md` entry dated the day it lands recording the four kickoff decisions and the self-audit deferral. `PROMPTS.md` phase narrative line. `TODOS.md`: check this plan's index entry when the PR merges, and add the self-audit regeneration to the Backlog self-audit section if it was deferred. No skill changes, so `lib/skills.ts`, PRODUCT.md, and the README skills table are untouched.

## Acceptance criteria

- A real browser session on the deployed site sets no `ph_*` cookie; PostHog still records `$pageview` and `install_copied` (verified in the PostHog live events view after deploy, not assumed).
- `/privacy` exists, is linked from the footer on every page and from `/unlock`, passes a 400px no-horizontal-scroll check, and every factual claim on it was verified against code or vendor config.
- `/sitemap.xml` lists every ungated route and no gated one; `robots.txt` carries the `Sitemap:` line; Google Search Console accepts the sitemap (Craig, post-deploy).
- The footer carries a Contact link to an address Craig chose, sourced from one constant.
- Every route returns a route-specific `<meta name="description">`.
- `npm run typecheck && npm run lint && npm run build` pass; the adversarial review pass ran and its findings are recorded in the PR.
- CHANGELOG, NOTES, PROMPTS updated; this entry's checkbox in TODOS.md checked on merge.

## Dependencies

- Craig names the contact email (step 4). Everything else can proceed without it; the footer link and the privacy page's contact line are the last edits.
- Craig confirms or overrules kickoff decision 4 (self-audit deferral). Default is defer.
- `posthog-js` version in `package.json` supports `persistence: "localStorage"` (confirmed: posthog-js 1.399.2 is installed, `@posthog/types` declares `persistence` as `localStorage | cookie | memory | localStorage+cookie | sessionStorage`, and the bundled runtime default is `localStorage+cookie`).

## Non-goals

- **Cookie banner.** Removed at the source by step 1.
- **Terms and conditions.** MIT is the terms; revisit only if `/reports` becomes a paid service.
- **Sticky mobile CTA.** Wrong for a terminal-install conversion on a reading-heavy site.
- **Loading skeletons.** Nothing on the site is slow enough to need one.
- **Postal address.** Not needed for a free tool with a contact email.
- **The Horizon Foundry parent studio site** (`horizon-foundry/horizon-foundry`). It was not in the session that wrote this plan and was not audited. Run the same 20-point pass there as its own unit; the findings will not be the same, because it is a different codebase with different forms.
- **The self-audit's open medium findings** (no alerting receiver, zero application tests, no branch ruleset on main, private reports stored in a public repo, the version endpoint's PostHog amplification). They are the real production-readiness backlog and outrank this list, but they are tracked in TODOS.md Backlog and are not this unit.
- Any skill, schema, or report change.

## Risks

- **Privacy page drift.** A page that states what the site collects is a doc that rots the moment capture code changes. Mitigation: the CLAUDE.md gotcha added in step 1 names `/privacy` as a surface that must change with the event plan, and the `document` skill's truth pass covers it.
- **Persistence migration splits identities.** A returning visitor whose distinct id lived in a cookie gets a fresh localStorage id after the change. For an anonymous funnel this is a one-time uniques bump, not a loss; for identified users, `sign_in_completed` re-aliases on next sign-in. Note it in NOTES so the bump is not read as growth.
- **Sitemap leaks a slug.** The only way is if `listPublicReports()` returns a non-public report. It filters on `meta.public`; the review pass in step 6 asserts this by test, not by reading.
- **Claiming something on the privacy page that is not true** (retention periods, deletion paths). Mitigation: every claim is verified against the vendor dashboard or config, and anything unverifiable is stated as unverified or left out.
- **Contact address becomes a spam sink.** Accept it; an alias Craig can rotate beats no contact.

## Current state

- Base: `5b3fa4f` (main, 2026-09-18) on branch `claude/foundry-production-readiness-u0msul`; the branch carries only this plan, its index entry, and the NOTES and PROMPTS entries at the time of writing. The 20-point audit itself was run on `ebe3ae6`; the four commits between touch BRAND.md, NOTES.md, TODOS.md, and `lib/docs.ts`, none of the surfaces this plan changes.
- Verification at the anchor: `npm run typecheck` passes on `ebe3ae6` (run in the authoring session after `npm ci`; not re-run after the rebase, which changed no TypeScript this plan touches); lint and build were not run there. No application tests exist (self-audit TEST-01).
- Done: the 20-point audit against the code; this plan; the TODOS.md index entry; the NOTES.md decision entry.
- Next: step 1 (cookie-free analytics), which has no dependency on Craig's contact-email decision. Ask for the address at kickoff so step 4 is not the long pole.
