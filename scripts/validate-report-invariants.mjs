#!/usr/bin/env node
// Cross-field report invariants that JSON Schema cannot express. Run by
// `make validate` after ajv structural validation. These are the hard rules
// the production-audit SKILL.md states; enforcing them here means a report
// that breaks one fails the build deterministically instead of relying on
// the prompt gate having been honored.
//
// Usage: node scripts/validate-report-invariants.mjs <report.json> [...]

import { readFileSync } from "node:fs";

const PREFIX_FOR_DIMENSION = {
  security: "SEC",
  concurrency: "CON",
  reliability: "REL",
  accessibility: "A11Y",
  ui: "UI",
  infra: "INF",
  operability: "OPS",
  "testing-confidence": "TEST",
  "data-migration-safety": "DATA",
  "release-safety": "SHIP",
  "performance-capacity": "PERF",
};

let failed = false;

function fail(file, msg) {
  console.error(`FAIL ${file}: ${msg}`);
  failed = true;
}

for (const file of process.argv.slice(2)) {
  const raw = readFileSync(file, "utf8");
  const report = JSON.parse(raw);
  const findings = new Map(report.findings.map((f) => [f.id, f]));

  // The verification rule: a verdict is only as trustworthy as the findings
  // it rests on, so nothing in blockingFindingIds may be unverified. And only a
  // risk (a path to harm) may drive the verdict: an improvement never caps it.
  for (const id of report.verdict.blockingFindingIds) {
    const f = findings.get(id);
    if (!f) fail(file, `blocking finding ${id} does not exist in findings[]`);
    else {
      if (f.verification.status === "not-verified")
        fail(file, `blocking finding ${id} is not-verified; every verdict-driving finding must survive adversarial verification`);
      if (f.kind !== "risk")
        fail(file, `blocking finding ${id} has kind "${f.kind}"; only a risk may drive the verdict, an improvement never caps it`);
    }
  }

  // A static run may not claim a runtime-verified verdict, and vice versa.
  const expectedScope = report.meta.scope.runtimePass ? "static-plus-runtime" : "static";
  if (report.verdict.assessedScope !== expectedScope)
    fail(file, `verdict.assessedScope is "${report.verdict.assessedScope}" but scope.runtimePass=${report.meta.scope.runtimePass} implies "${expectedScope}"`);

  // A not-met ship gate caps the verdict below safe-to-ship.
  if (report.verdict.level === "safe-to-ship") {
    for (const g of report.shipGates)
      if (g.status === "not-met")
        fail(file, `verdict is safe-to-ship while ship gate "${g.gate}" is not-met; a not-met gate caps the verdict`);
  }

  for (const f of report.findings) {
    // high-confidence means exactly one named unverified assumption.
    if (f.confidence === "high-confidence" && !f.assumption)
      fail(file, `${f.id} is high-confidence but names no assumption`);
    // Finding IDs carry their dimension prefix.
    const prefix = PREFIX_FOR_DIMENSION[f.dimension];
    if (prefix && !f.id.startsWith(`${prefix}-`))
      fail(file, `${f.id} has dimension "${f.dimension}" but not its prefix "${prefix}-"`);
  }

  // Severity stats must match the actual findings.
  const counts = { critical: 0, high: 0, medium: 0, low: 0, informational: 0 };
  for (const f of report.findings) counts[f.severity]++;
  for (const [sev, n] of Object.entries(counts))
    if (report.stats.bySeverity[sev] !== n)
      fail(file, `stats.bySeverity.${sev}=${report.stats.bySeverity[sev]} but findings[] contains ${n}`);

  // Suite-wide content rules: no em dashes, no personal machine paths.
  if (raw.includes("\u2014")) fail(file, "report text contains an em dash");
  if (/~\/code\/|\/Users\/[a-z]/.test(raw)) fail(file, "report text contains a personal machine path");

  if (!failed) console.log(`ok ${file}`);
}

process.exit(failed ? 1 : 0);
