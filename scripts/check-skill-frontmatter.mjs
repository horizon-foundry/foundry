#!/usr/bin/env node
// Every skills/<name>/SKILL.md must have front matter that a strict YAML
// parser reads, because the installer uses one.
//
// Why this check exists: on 2026-11-27 `npx skills@latest add
// horizon-foundry/foundry` installed 9 of the 11 skills. The `description:`
// lines of `document` and `frame` were plain (unquoted) scalars that held a
// colon followed by a space ("Modes: public", "inventing answers: it
// audits"). YAML reads that as the start of a nested mapping, so the
// installer printed "YAML parse error" and skipped both skills. Nothing here
// failed, because the site's own reader (lib/skills.ts) is a one-line regex
// that takes whatever follows the key.
//
// The repo has no YAML dependency and this check adds none. It holds the
// narrow rule that makes a flat front matter safe for any YAML parser: a
// plain scalar value must not contain ": " or " #", must not end with ":",
// and must not start with a character YAML gives a meaning to. A value that
// needs one of those is written in double quotes, with no double quote or
// backslash inside it (the site's reader strips the outer quotes and does not
// unescape).

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const SKILLS = join(ROOT, "skills");
const errors = [];
let files = 0;

for (const name of readdirSync(SKILLS).sort()) {
  const file = join(SKILLS, name, "SKILL.md");
  if (!existsSync(file)) continue;
  files++;
  const src = readFileSync(file, "utf8");
  const m = src.match(/^---\n([\s\S]*?)\n---\n/);
  const rel = `skills/${name}/SKILL.md`;
  if (!m) {
    errors.push(`${rel}: no front matter block at the top of the file`);
    continue;
  }
  const keys = new Set();
  m[1].split("\n").forEach((line, i) => {
    const at = `${rel}:${i + 2}`;
    const kv = line.match(/^([A-Za-z][\w-]*):(?: (.*))?$/);
    if (!kv) {
      errors.push(`${at}: not a flat "key: value" line (the front matter is flat on purpose): ${line.slice(0, 60)}`);
      return;
    }
    const [, key, raw = ""] = kv;
    if (keys.has(key)) errors.push(`${at}: the key "${key}" appears twice`);
    keys.add(key);
    const value = raw.trim();
    if (value === "") {
      errors.push(`${at}: "${key}" has no value`);
      return;
    }
    if (value.startsWith('"')) {
      const inner = value.slice(1, -1);
      if (!value.endsWith('"') || value.length < 2) errors.push(`${at}: "${key}" opens a double quote and does not close it`);
      else if (/["\\]/.test(inner)) errors.push(`${at}: "${key}" holds a double quote or a backslash inside its quotes; the site's reader does not unescape, so reword or use a plain scalar`);
      return;
    }
    // A plain scalar. These are the forms a YAML parser reads as structure.
    if (value.includes(": ")) errors.push(`${at}: "${key}" is unquoted and holds a colon followed by a space, which YAML reads as a nested mapping (the installer then skips the whole skill). Put the value in double quotes.`);
    if (value.endsWith(":")) errors.push(`${at}: "${key}" is unquoted and ends with a colon. Put the value in double quotes.`);
    if (value.includes(" #")) errors.push(`${at}: "${key}" is unquoted and holds " #", which YAML reads as a comment. Put the value in double quotes.`);
    if (/^[\[\]{}>|*&!%@`'#,?-]/.test(value)) errors.push(`${at}: "${key}" is unquoted and starts with a character YAML gives a meaning to. Put the value in double quotes.`);
  });
  for (const need of ["name", "version", "description"]) {
    if (!keys.has(need)) errors.push(`${rel}: the front matter has no "${need}"`);
  }
}

if (files === 0) errors.push("no skills/<name>/SKILL.md found: the check would pass on nothing");

if (errors.length) {
  console.error(`check-skill-frontmatter: ${errors.length} problem(s)`);
  for (const e of errors) console.error("  " + e);
  process.exit(1);
}
console.log(`check-skill-frontmatter: ok (${files} skills, front matter is safe for a strict YAML parser)`);
