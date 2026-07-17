// Single source of truth for outward-facing product facts: the public repo,
// version, and the marquee example. Everything that shows a repo URL, clone
// command, GitHub link, star button, or version reads from here, so the repo
// rename (production-audit -> foundry) and version bumps are one-line changes.

// NOTE: the repo lives under the Horizon Foundry GitHub org (horizon-foundry/foundry);
// the private archive with pre-launch history stays at cjmartin2/foundry-archive.
export const REPO_OWNER = "horizon-foundry";
export const REPO_NAME = "foundry";
export const REPO_SLUG = `${REPO_OWNER}/${REPO_NAME}`;
export const REPO_URL = `https://github.com/${REPO_SLUG}`;
export const REPO_ISSUES_URL = `${REPO_URL}/issues`;
export const REPO_LICENSE_URL = `${REPO_URL}/blob/main/LICENSE`;
export const REPO_CHANGELOG_URL = `${REPO_URL}/blob/main/CHANGELOG.md`;
export const REPO_CONTRIBUTING_URL = `${REPO_URL}/blob/main/CONTRIBUTING.md`;

export const VERSION = "0.1.0";

// The reports hub. Public: signed-out visitors see the public example audits
// (Foundry's self-audit + the illustrative sample) and a sign-in prompt;
// signed-in visitors also see the reports they own. Nav and CTAs link here so
// there is one consistent destination for both states. Individual public
// reports still render ungated at /example/<slug>.
export const REPORTS_HREF = "/reports";
