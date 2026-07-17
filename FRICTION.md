# Friction Log

Points of friction during the Production Audit build, places where the user got stuck, where the process itself needed improvement, or where the tooling introduced unnecessary cost. The purpose is to identify and fix process problems over time, not to catalog bugs in the product.

See [NOTES.md](NOTES.md) for architectural decisions and [PROMPTS.md](PROMPTS.md) for the session narrative.

## How This File Gets Populated

Two paths add entries:

1. **Agent-observed.** When the user iterates three or more times on the same prompt, rejects consecutive drafts for overlapping reasons, or otherwise signals that a task is costing more than it should, the agent adds a friction entry describing what went wrong and a candidate improvement.
2. **Explicit via `/friction`.** The user types `/friction <one-liner>` and the agent appends a dated entry with the text. Use this for friction the user wants captured immediately without narrative overhead.

Entries are facts about the process, not blame. Each entry documents:

- **What happened**, the observable friction (many iterations, unclear spec, tool failure, lost context, misaligned agent output).
- **Likely cause**, the best-available hypothesis for the root cause.
- **Candidate improvement**, a specific change to how the user and the agent work together that would have prevented the friction. Stays concrete; a friction entry without a candidate improvement is a complaint, not a log.

## Maintainer-Identified Entries

_(none yet, added by the maintainer, typically via `/friction <one-liner>`)_

## AI-Identified Entries

### 2026-07-14: Odd-count "broken tile" recurs across grids

**What happened:** The `grid gap-px border border-line bg-line` + `bg-ink` cell pattern (hairlines drawn by the slate backdrop showing through 1px gaps) leaves the backdrop exposed as a solid slate block in the empty trailing cell whenever the item count is odd. It was fixed once on the homepage principles grid, then reappeared on two grids of the example report (dimensions-resolved-out, strengths), both caught only by the maintainer eyeballing the live page.

**Likely cause:** The grid technique is copied ad hoc at each call site (homepage, /skills, ReportView x4), and the odd-count filler guard has to be remembered and re-added by hand each time. Nothing structural prevents the next new grid from shipping the same defect.

**Candidate improvement:** Extract one shared grid primitive (e.g. `<HairlineGrid cols={2}>`) that bakes in the `hidden sm:block` blank-ink filler for odd counts, and use it everywhere the pattern appears, so a new grid cannot reintroduce the broken cell. The `GridFiller` helper added to ReportView this session is a partial step; consolidating the three call sites onto one primitive is the durable fix.

## Template

```
### YYYY-MM-DD: <short title>

**What happened:** <one or two sentences>

**Likely cause:** <one sentence>

**Candidate improvement:** <one specific, actionable change>
```
