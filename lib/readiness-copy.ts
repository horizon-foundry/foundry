// Visitor-facing words for /readiness. The map's own preface stays written for
// the skills and the parser (reference/readiness-map.md), so the page speaks
// through this layer instead. DRAFT copy, for Craig's approval. Every count is
// passed in from the map, never typed here.
const AUDIT = "production-audit";
const TEAM = "Your team signs off";
const concerns = (n: number) => `${n} ${n === 1 ? "concern" : "concerns"}`;

export const READINESS_COPY = {
  headline: (total: number) => `${total} concerns decide whether it is ready.`,
  // DRAFT: the second sentence is new; the first is the approved prototype lede.
  lead: (outside: number) =>
    `Each is true or false of your product, and names who can show it. ${outside} are yours to sign off.`,
  owner: {
    audit: AUDIT,
    skills: (n: number) => `${n} other ${n === 1 ? "skill" : "skills"}`,
    team: TEAM,
  },
  // The whole-map block read aloud: counts first, then who owns them.
  blockLabel: (
    total: number,
    audit: number,
    other: number,
    otherSkillCount: number,
    team: number,
  ) =>
    `${total} concerns: ${audit} owned by ${AUDIT}, ${other} by ${otherSkillCount} other ${otherSkillCount === 1 ? "skill" : "skills"}, ${team} ${TEAM.toLowerCase()}`,
  // An area's button, read aloud: all of its concerns, or the ones a filter
  // leaves.
  areaConcerns: concerns,
  areaShown: (shown: number, n: number) => `${shown} of ${concerns(n)}`,
  evidenceHeading: "Evidence that settles it",
  // What each kind of evidence means, read aloud after its count.
  evidence: {
    code: "the code shows it",
    config: "a setting shows it",
    runtime: "only a live run shows it",
    record: "a written record shows it",
  } as Record<string, string>,
  // DRAFT: the hint, the active-filter line and the empty state are new copy.
  hint: "Select an area to read its concerns.",
  shown: (n: number, total: number) => `${n} of ${total} concerns shown.`,
  showAll: "Show all",
  empty: "No concern matches every filter.",
  signedOffBy: "signed off by:",
};
