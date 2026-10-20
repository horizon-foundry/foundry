// The readiness map's shapes, and the owner-group vocabulary the filters share.
// Pure types and constants, no node imports, so a client component can import
// this file where it could not import readiness-owners.ts (which reads the map
// from disk).

export type ReadinessRow = {
  id: string;
  concern: string;
  owner: string;
  appliesWhen: string;
  evidence: string;
};

export type ReadinessArea = {
  name: string;
  slug: string;
  rows: ReadinessRow[];
};

// The three owner groups the cell grids and filters speak in: production-audit
// (any part of it), every other skill, and a role outside Foundry's skills.
export type OwnerGroup = "pa" | "sk" | "out";

export const ownerGroup = (owner: string): OwnerGroup => {
  const head = owner.split("/")[0];
  if (head === "outside") return "out";
  return head === "production-audit" ? "pa" : "sk";
};

// What `?owner=` accepts. "team" is the page's word for the outside group and
// "outside" is accepted as its alias; "skills" is every skill except
// production-audit. Anything else is read as a skill name, and an unknown one
// resolves to null so the page shows everything.
export type OwnerFilter =
  | { kind: "group"; group: OwnerGroup }
  | { kind: "skill"; skill: string };

const GROUP_ALIAS = new Map<string, OwnerGroup>([
  ["production-audit", "pa"],
  ["skills", "sk"],
  ["team", "out"],
  ["outside", "out"],
]);

export function parseOwnerFilter(
  raw: string | null | undefined,
  knownSkills: ReadonlySet<string>,
): OwnerFilter | null {
  const value = raw?.trim().toLowerCase();
  if (!value) return null;
  const group = GROUP_ALIAS.get(value);
  if (group) return { kind: "group", group };
  return knownSkills.has(value) ? { kind: "skill", skill: value } : null;
}
