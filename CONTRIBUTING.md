# Contributing to Foundry

Foundry is a suite of Claude Code skills for turning fast, AI-built code into a real product. Contributions are welcome: a new skill, a sharper version of an existing one, a bug in the site, or a gap in the docs.

## Reporting issues

Open an issue on GitHub. For a bug, include what you ran, what you expected, and what happened. For a skill that misfired, include the skill name and the prompt that triggered it. For a site bug, include the page and your browser.

## Proposing a skill

A skill earns its place by being a reusable discipline, not a one-off or a personal preference. Before proposing one, read [`reference/skill-authoring.md`](reference/skill-authoring.md), the suite standard. In short, every skill:

- Opens with a mandatory "Using this skill" gate, so it resists being reproduced by hand instead of invoked.
- Has a trigger-only `description` (when to use it, not a summary of its steps).
- Documents a discipline that generalizes beyond one project or one stack.

Skills that prescribe a personal or team-specific workflow (for example, a particular git or deploy pipeline) are intentionally out of scope. The suite is a set of practices you adopt, not a workflow you inherit.

## Working in this repo

```bash
git clone https://github.com/horizon-foundry/foundry
cd foundry
make install        # symlink the skills into ~/.claude/skills
npm install         # site dependencies (only needed to run the site)
npm run dev         # site at localhost:3000
npm run typecheck && npm run lint && npm run build
make validate       # validate reports against the schema
```

The site reads the skills and docs from disk, so adding a skill (`skills/<name>/SKILL.md`) and classifying it in `lib/skills.ts` makes it appear on the `/skills` pages automatically. A new skill is not done until the site, `README.md`, and `CLAUDE.md` all show it.

## House rules

- **No em dashes** in any authored content (docs, site copy, skill text, commit messages). Use commas, colons, periods, or parentheses. En dashes in numeric ranges (5 to 10) are fine.
- **Docs track the build.** If a change alters shipped capability, update the docs and outward surfaces in the same change, not as a follow-up.
- **Reports are sensitive.** Never commit an audit report for a real product you do not own, and never surface report specifics on an ungated page.

## Pull requests

Work on a feature branch and open a PR. Keep each PR to one coherent unit of work. Describe what changed and why. If you added or changed a skill, note how you verified it behaves as the skill describes.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
