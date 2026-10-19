// Visitor-facing words for /readiness. The map's own preface stays written for
// the skills and the parser (reference/readiness-map.md), so the page leads
// with this layer instead. DRAFT copy, for Craig's approval. Counts are passed
// in from the map, never typed here.
export const READINESS_COPY = {
  title: "What ready means",
  lead: (total: number, outside: number) =>
    `Everything that decides whether a product is ready for real users, in one list. ${total} concerns, each with who checks it, when it applies, and what evidence settles it. ${outside} sit outside Foundry, and the map names who owns them.`,
  status:
    "The map lists what to check. Running the skill tells you where you stand.",
  evidence: {
    code: "the code shows it",
    config: "a setting shows it",
    runtime: "only a live run shows it",
    record: "a written record shows it",
  } as Record<string, string>,
};
