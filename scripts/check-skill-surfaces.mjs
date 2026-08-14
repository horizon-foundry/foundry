#!/usr/bin/env node
// Every skill must be visible on every public surface, and every count claim
// about the suite must match how many skills there actually are.
//
// This exists because prose did not hold. CLAUDE.md already said "the marketing
// site tracks every skill", and PR #11 followed it: it added skills/readout,
// wired lib/skills.ts, and added the README table row. It still shipped a
// README and a homepage both opening "Foundry is nine Claude Code skills" with
// ten skills in the tree, because the rule enumerated three surfaces and said
// nothing about the numbers in the prose. A rule that only exists as prose is a
// hope (reference/skill-authoring.md, "Honest limits").
//
// Scope is deliberate: STRUCTURAL presence and NUMERIC agreement, both fully
// deterministic. Whether a tagline still *describes* a skill after its body
// changed is a judgment call, and it belongs to the commit workflow's recorded
// answer, not to a script that would only pretend to check it.
//
// Usage: node scripts/check-skill-surfaces.mjs [repoRoot]

import fs from "node:fs";
import path from "node:path";

const ROOT = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
const errors = [];
const notes = [];

const read = (rel) => {
  const p = path.join(ROOT, rel);
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null;
};

// ---------------------------------------------------------------- skill set

const skillsDir = path.join(ROOT, "skills");
if (!fs.existsSync(skillsDir)) {
  console.error(`ERROR: no skills/ directory under ${ROOT}`);
  process.exit(1);
}
const skills = fs
  .readdirSync(skillsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .filter((n) => fs.existsSync(path.join(skillsDir, n, "SKILL.md")))
  .sort();

if (skills.length === 0) {
  console.error("ERROR: skills/ contains no directory with a SKILL.md");
  process.exit(1);
}

// ------------------------------------------------------- lib/skills.ts wiring

const libSrc = read("lib/skills.ts");
if (libSrc === null) {
  errors.push("lib/skills.ts is missing; the /skills pages render from it");
} else {
  const block = (name) => {
    // Matches `const NAME = new Set([...])`, `const NAME = [...]`, and
    // `const NAME: Record<string, X> = {...}` by brace/bracket balance.
    const start = libSrc.indexOf(`const ${name}`);
    if (start === -1) return null;
    const open = libSrc.slice(start).search(/[[{]/);
    if (open === -1) return null;
    const from = start + open;
    const openCh = libSrc[from];
    const closeCh = openCh === "[" ? "]" : "}";
    let depth = 0;
    for (let i = from; i < libSrc.length; i += 1) {
      if (libSrc[i] === openCh) depth += 1;
      else if (libSrc[i] === closeCh) {
        depth -= 1;
        if (depth === 0) return libSrc.slice(from, i + 1);
      }
    }
    return null;
  };

  const named = (src) =>
    src === null
      ? null
      : new Set([...src.matchAll(/["']([a-z0-9][a-z0-9-]*)["']/g)].map((m) => m[1]));

  const order = named(block("ORDER"));
  const userInvoked = named(block("USER_INVOKED"));
  const copyBlock = block("SKILL_COPY");
  // SKILL_COPY keys are the object's top-level keys: `name:` or `"name":`.
  const copyKeys = copyBlock
    ? new Set(
        [...copyBlock.matchAll(/(?:^|\n)\s{2}(?:["']([a-z0-9-]+)["']|([a-z0-9-]+)):\s*\{/g)].map(
          (m) => m[1] || m[2],
        ),
      )
    : null;

  for (const [label, set] of [
    ["ORDER", order],
    ["USER_INVOKED", userInvoked],
    ["SKILL_COPY", copyKeys],
  ]) {
    if (set === null) {
      errors.push(`lib/skills.ts: could not parse ${label}`);
      continue;
    }
    if (label === "USER_INVOKED") continue; // membership is a choice, not a requirement
    for (const s of skills) {
      if (!set.has(s)) {
        errors.push(
          `lib/skills.ts ${label} has no entry for skills/${s}; it will ${
            label === "ORDER" ? "sort last on /skills" : "fall back to raw agent-facing prose on /skills"
          }`,
        );
      }
    }
    for (const entry of set) {
      if (!skills.includes(entry)) {
        errors.push(`lib/skills.ts ${label} lists "${entry}", which is not a skill directory`);
      }
    }
  }
  if (order && userInvoked) {
    for (const entry of userInvoked) {
      if (!skills.includes(entry)) {
        errors.push(`lib/skills.ts USER_INVOKED lists "${entry}", which is not a skill directory`);
      }
    }
  }
}

// ----------------------------------------------------------- README.md table

const readme = read("README.md");
if (readme === null) {
  errors.push("README.md is missing");
} else {
  const rows = new Set(
    [...readme.matchAll(/^\|\s*`([a-z0-9][a-z0-9-]*)`\s*\|/gm)].map((m) => m[1]),
  );
  for (const s of skills) {
    if (!rows.has(s)) {
      errors.push(`README.md has no skills-table row for \`${s}\``);
    }
  }
  for (const row of rows) {
    if (!skills.includes(row)) {
      notes.push(`README.md has a table row for \`${row}\`, which is not a skill directory`);
    }
  }
}

// ------------------------------------------------- PRODUCT.md suite listing

// The forever spec enumerates the suite in prose and renders publicly at
// /behind/product. PR #11 added a skill, updated the README table and
// lib/skills.ts, and left this list at nine: a count check alone would not have
// caught it, because the omission is a missing bullet, not a wrong number.
const product = read("PRODUCT.md");
if (product === null) {
  errors.push("PRODUCT.md is missing");
} else {
  const m = product.match(/^##\s+The suite\s*$([\s\S]*?)(?=^##\s|\Z)/m);
  if (!m) {
    notes.push(
      "PRODUCT.md has no '## The suite' section; skipping its per-skill check. Restore the section or update this script.",
    );
  } else {
    const section = m[1];
    for (const s of skills) {
      if (!section.includes(`\`${s}\``) && !new RegExp(`\\b${s}\\b`).test(section)) {
        errors.push(`PRODUCT.md '## The suite' does not mention \`${s}\`; it renders publicly at /behind/product`);
      }
    }
  }
}

// --------------------------------------------------------- count agreement

const WORDS = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight",
  "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen",
  "sixteen", "seventeen", "eighteen", "nineteen", "twenty",
];
const expected = skills.length;
const expectedWord = WORDS[expected] ?? String(expected);

// Present-tense surfaces that state how many skills the suite has. A line may
// opt out with `skills-count-exempt` when the number is deliberately historical
// ("the build grew to nine skills"), which keeps the exemption visible in the
// text rather than hidden in this script.
// Deliberately excludes the dated-narrative docs (CHANGELOG, TODOS, NOTES,
// PROMPTS): their counts are historical by nature and scanning them would be
// noise. Everything here is present-tense and reader-facing, including the
// overview deck's slide data, which carries two of these claims in prose.
const COUNT_FILES = [
  "README.md",
  "PRODUCT.md",
  "CLAUDE.md",
  "lib/site.ts",
  "app/page.tsx",
  "app/skills/page.tsx",
  "app/behind/page.tsx",
];

const CLAIM = new RegExp(
  `\\b(${WORDS.join("|")}|\\d{1,2})\\b((?:\\s|\\{"?\\s*)*(?:Claude Code\\s+)?skills)\\b`,
  "gi",
);

for (const rel of COUNT_FILES) {
  const src = read(rel);
  if (src === null) continue;
  src.split("\n").forEach((line, i) => {
    if (line.includes("skills-count-exempt")) return;
    for (const m of line.matchAll(CLAIM)) {
      const raw = m[1].toLowerCase();
      const n = WORDS.indexOf(raw) === -1 ? Number(raw) : WORDS.indexOf(raw);
      if (!Number.isFinite(n)) continue;
      if (n !== expected) {
        errors.push(
          `${rel}:${i + 1} claims "${m[1]}${m[2]}" but ${expected} skill ${
            expected === 1 ? "directory exists" : "directories exist"
          } (expected "${expectedWord}"). If the number is deliberately historical, add a skills-count-exempt marker to the line.`,
        );
      }
    }
  });
}

// ------------------------------------------------------------------- report

if (notes.length) {
  for (const n of notes) console.log(`note: ${n}`);
}
if (errors.length) {
  console.error(
    `\nERROR: ${errors.length} public-surface problem${errors.length === 1 ? "" : "s"} across ${expected} skills.\n`,
  );
  for (const e of errors) console.error(`  - ${e}`);
  console.error(
    "\nEvery skill must appear on every public surface, and every count claim must match.\n" +
      "See CLAUDE.md, 'The public surfaces track every skill'.\n",
  );
  process.exit(1);
}
console.log(`Public surfaces track all ${expected} skills; count claims agree.`);
