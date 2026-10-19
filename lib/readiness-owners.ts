import { loadReadinessMap } from "@/lib/readiness-map.mjs";
import type { ReadinessArea } from "@/components/ReadinessMap";

// Who owns what on the readiness map, derived from the map on every build, so
// no count on a page is ever typed by hand. The owner grammar is the map's own
// (reference/readiness-map.md preface): a skill, a skill and one of its parts
// ("production-audit/security"), or a role outside Foundry ("outside/finance").

export type OwnedRow = {
  id: string;
  concern: string;
  area: string;
  part?: string;
};

export type Ownership = {
  total: number;
  skillRows: number;
  auditRows: number;
  otherSkillRows: number;
  outsideRows: number;
  bySkill: Map<string, OwnedRow[]>;
  byAuditPart: { part: string; count: number }[];
  byEvidence: { kind: string; count: number }[];
};

// "phase-1" is the audit's context phase, not a dimension; it reads as words.
const PART_LABEL: Record<string, string> = { "phase-1": "context" };

export const plainPart = (p: string) => PART_LABEL[p] ?? p.replace(/-/g, " ");

export function readinessOwnership(): Ownership {
  // The parser is plain JS, so its rows are typed here by their known shape.
  const areas = loadReadinessMap().areas as unknown as ReadinessArea[];
  const bySkill = new Map<string, OwnedRow[]>();
  const parts = new Map<string, number>();
  const evidence = new Map<string, number>();
  let total = 0;
  let outside = 0;

  for (const area of areas) {
    for (const row of area.rows) {
      total += 1;
      evidence.set(row.evidence, (evidence.get(row.evidence) ?? 0) + 1);
      const [head, ...rest] = row.owner.split("/");
      const part = rest.join("/") || undefined;
      if (head === "outside") {
        outside += 1;
        continue;
      }
      const list = bySkill.get(head) ?? [];
      list.push({ id: row.id, concern: row.concern, area: area.name, part });
      bySkill.set(head, list);
      if (head === "production-audit") {
        const key = part ?? "whole audit";
        parts.set(key, (parts.get(key) ?? 0) + 1);
      }
    }
  }

  const auditRows = bySkill.get("production-audit")?.length ?? 0;
  const skillRows = total - outside;
  return {
    total,
    skillRows,
    auditRows,
    otherSkillRows: skillRows - auditRows,
    outsideRows: outside,
    bySkill,
    byAuditPart: [...parts]
      .map(([part, count]) => ({ part, count }))
      .sort((a, b) => b.count - a.count),
    byEvidence: [...evidence]
      .map(([kind, count]) => ({ kind, count }))
      .sort((a, b) => b.count - a.count),
  };
}
