# The public hub

Read this at `public` step 2, when establishing or reconciling the public hub.

The hub is an option. Build it only when the builder asked for a public docs surface (`SKILL.md`, "Three modes"). A tab earns its place when it shows a reader something the rest of the site does not: leave out a tab that repeats the README or the landing page.

A route with a tab bar. The route and its name are the project's own. Curated, external-facing tabs only:

- **Overview**, the slide deck (`deck.md` in this skill's directory), where the builder wants one.
- **Design system**, `DESIGN.md`, ideally rendered from the tokens themselves so it cannot disagree with them.
- **Product**, `PRODUCT.md`, the forever spec (present-tense truth, written for a reader).
- **Brand**, `BRAND.md`, if it reads as outward brand rather than internal strategy.

No placeholders, no empty sections, no internal voice. If a doc still has template scaffolding or empty headings, either fill it for a reader or leave it out. Read docs through a whitelist (fixed filenames, no user input reaching the filesystem, secrets never in the set), and ensure the deploy artifact includes repo-root files if the framework's standalone output omits them; they are read at runtime.

If the project has **no rendering surface** (a CLI, a library, a backend-only service), the public hub is out of scope: the internal portal is the repo itself on a private host, and the truth layer in `SKILL.md` is the whole job. Say so and stop. Do not invent a web surface to render into.
