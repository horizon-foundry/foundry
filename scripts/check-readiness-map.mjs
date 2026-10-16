#!/usr/bin/env node
// Gate for reference/readiness-map.md: the table shape, the IDs, and the owner
// vocabulary. It reads the map through lib/readiness-map.mjs, the same parser
// the site uses, so a row the gate accepts is a row the site can render.
//
// What it enforces:
//   * five cells per row (the parser throws, naming the line)
//   * unique, kebab-case IDs
//   * Evidence is one of code, config, runtime, record
//   * Owner is a real skill (read from skills/), a real audit dimension or
//     production-audit/phase-1, or outside/<owner role>
//   * no em dash anywhere in the file, and none of the banned word
//
// The skill list comes from the skills/ directory, so a new skill is a valid
// owner the moment it exists. The eleven dimensions are fixed by the audit
// contract (schema/audit-report.schema.json, `category`).
//
// Usage: node scripts/check-readiness-map.mjs [repoRoot]
import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { MAP_PATH, parseReadinessMap } from "../lib/readiness-map.mjs";

const ROOT = process.argv[2] ? resolve(process.argv[2]) : process.cwd();

const DIMENSIONS = [
  "security",
  "concurrency",
  "reliability",
  "accessibility",
  "ui",
  "infra",
  "operability",
  "testing-confidence",
  "data-migration-safety",
  "release-safety",
  "performance-capacity",
];
const EVIDENCE = ["code", "config", "runtime", "record"];
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const ROLE = /^[a-z][a-z ]*[a-z]$/;

// Built from parts and code points so this file never carries either literal
// it forbids in the map.
const EM_DASH = String.fromCharCode(0x2014);
const BANNED = new RegExp(["r", "i", "t", "u", "a", "l"].join(""), "i");

const errors = [];
const fail = (msg) => errors.push(msg);

const skills = readdirSync(join(ROOT, "skills"), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

function ownerError(owner) {
  if (skills.includes(owner)) return null;
  if (owner.startsWith("production-audit/")) {
    const sub = owner.slice("production-audit/".length);
    return DIMENSIONS.includes(sub) || sub === "phase-1"
      ? null
      : `"${owner}" is not an audit dimension (${DIMENSIONS.join(", ")}) or phase-1`;
  }
  if (owner.startsWith("outside/")) {
    const role = owner.slice("outside/".length);
    return ROLE.test(role) ? null : `"${owner}" needs a lower-case owner role after "outside/"`;
  }
  return `"${owner}" is not a skill (${skills.join(", ")}), production-audit/<dimension>, or outside/<owner role>`;
}

let raw;
try {
  raw = readFileSync(join(ROOT, MAP_PATH), "utf8");
} catch (e) {
  console.error(`Readiness map check FAILED:\n  - ${MAP_PATH} could not be read: ${e.message}`);
  process.exit(1);
}

raw.split(/\r?\n/).forEach((line, i) => {
  if (line.includes(EM_DASH)) fail(`${MAP_PATH} line ${i + 1}: contains an em dash.`);
  if (BANNED.test(line)) fail(`${MAP_PATH} line ${i + 1}: contains the banned word.`);
});

let map = null;
try {
  map = parseReadinessMap(raw);
} catch (e) {
  fail(e.message);
}

const counts = { skill: 0, audit: 0, outside: 0 };
const byOwner = {};
let rowTotal = 0;

if (map) {
  const seen = new Map();
  for (const area of map.areas) {
    for (const row of area.rows) {
      rowTotal++;
      const where = `area "${area.name}", row "${row.id}"`;
      if (!KEBAB.test(row.id)) fail(`${where}: the ID is not kebab-case.`);
      if (seen.has(row.id)) fail(`${where}: duplicate ID (also in area "${seen.get(row.id)}").`);
      else seen.set(row.id, area.name);
      if (!EVIDENCE.includes(row.evidence)) {
        fail(`${where}: Evidence "${row.evidence}" is not one of ${EVIDENCE.join(", ")}.`);
      }
      const oe = ownerError(row.owner);
      if (oe) fail(`${where}: owner ${oe}.`);
      else {
        byOwner[row.owner] = (byOwner[row.owner] || 0) + 1;
        if (row.owner.startsWith("outside/")) counts.outside++;
        else if (row.owner.startsWith("production-audit")) counts.audit++;
        else counts.skill++;
      }
    }
  }
}

if (errors.length) {
  console.error(`Readiness map check FAILED:\n${errors.map((e) => `  - ${e}`).join("\n")}`);
  process.exit(1);
}

const owners = Object.entries(byOwner)
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  .map(([o, n]) => `${o} ${n}`)
  .join(", ");
console.log(
  `Readiness map OK: ${map.areas.length} areas, ${rowTotal} rows (audit ${counts.audit}, skill ${counts.skill}, outside ${counts.outside}). Owners: ${owners}.`,
);
