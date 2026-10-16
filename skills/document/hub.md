# The public hub

Read this at `public` step 2, when establishing or reconciling the public hub.

A `/behind` (or "insider") route with a tab bar. The kicker is "Behind the Build", the heading "How this was made". Curated, external-facing tabs only:

- **Overview**, the slide deck (`deck.md` in this skill's directory).
- **Design system**, `DESIGN.md`, ideally rendered from the tokens themselves so it cannot disagree with them.
- **Product**, `PRODUCT.md`, the forever spec (present-tense truth, written for a reader).
- **Brand**, `BRAND.md`, if it reads as outward brand rather than internal strategy.

No placeholders, no empty sections, no internal voice. If a doc still has template scaffolding or empty headings, either fill it for a reader or leave it out. Read docs through a whitelist (fixed filenames, no user input reaching the filesystem, secrets never in the set), and ensure the deploy artifact includes repo-root files if the framework's standalone output omits them; they are read at runtime.

If the project has **no rendering surface** (a CLI, a library, a backend-only service), the public hub is out of scope: the internal portal is the repo itself on a private host, and the truth layer in `SKILL.md` is the whole job. Say so and stop. Do not invent a web surface to render into.
