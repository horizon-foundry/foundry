# What "sanitized" means: project at the section level

Read this at `public` step 3, the sanitization sweep, and before anything renders on the public hub.

File-level whitelisting is not enough. A file that is safe to render publicly (`PRODUCT.md`, `BRAND.md`) can still open with a section that is not, so dumping the whole file leaks whatever it leads with (`PRODUCT.md` opens with the frame: intent, assumptions, open findings, security declarations). So "sanitized" is a **section-level projection**:

- **Public-by-default** (safe to render externally): present-tense product truth (what it is, who it serves, core flows, non-goals), positioning and outward brand, design tokens, and a stated security *posture* summary.
- **Private-by-default** (curated OUT of a public render even when the containing file is public): the security frame's specifics (trust-boundary enumeration, authn/authz internals, secret-handling detail) beyond a posture summary; any entry still marked `assumed, unconfirmed`; open findings and unresolved blanks (`(finding: not yet declared)`); idea-risk and internal decision rationale; anything a hostile reader could turn into an attack map.

The test: if a line reads as intent, a hedge, an open question, or an attack hint, it belongs to the internal portal, not the public hub. `public` mode therefore renders a file's public sections only, never a raw dump.

**The pre-publish checklist enforces it.** Before anything publishes, the sweep (public mode, step 3) requires:

- Grep every publicly rendered doc for the markers `(finding:` and `(assumed,` and for the internal file names (`PROMPTS`, `NOTES`, `FRICTION`). Any hit fails the sweep.
- The run report lists every section rendered publicly with its public-or-private call, one line each. An unlisted section fails the sweep.
