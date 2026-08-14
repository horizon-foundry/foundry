#!/usr/bin/env node
// A pull request that changes the shipped suite must say what changed and why,
// in the same pull request.
//
// This exists because the convention alone would not hold. CHANGELOG.md is the
// release's only source: a release rolls [Unreleased] up verbatim into the
// GitHub Release body. Notes written months later, from a diff, are a worse
// record than the ones written by whoever made the change, and the release
// roll-up is exactly where nobody has the context anymore.
//
// Watched paths are the SHIPPED suite: skills/, schema/, reference/. An
// adopter installs those; the site is Foundry's own product surface and its
// changes are visible in the deploy, so site-only work is deliberately outside
// the gate rather than forced to invent a note.
//
// The escape hatch is visible, never silent: a `changelog-exempt` label on the
// pull request, or a `Changelog-exempt: <reason>` trailer on any commit in the
// range. Both leave a record of who waived it.
//
// It runs in CI rather than in `make validate` because it needs the pull
// request's base ref, which a local working copy has no equivalent of.
//
// Usage: node scripts/check-changelog.mjs <base-ref> [head-ref]
//        BASE_SHA=<sha> [HEAD_SHA=<sha>] [PR_LABELS='["..."]'] node scripts/check-changelog.mjs

import { execFileSync } from "node:child_process";

const WATCHED = ["skills/", "schema/", "reference/"];
const CHANGELOG = "CHANGELOG.md";

const base = process.argv[2] || process.env.BASE_SHA;
const head = process.argv[3] || process.env.HEAD_SHA || "HEAD";

if (!base) {
  console.error(
    "ERROR: no base ref. Usage: node scripts/check-changelog.mjs <base-ref> [head-ref], or set BASE_SHA.",
  );
  process.exit(2);
}

const git = (args) => execFileSync("git", args, { encoding: "utf8" });

let changed;
try {
  changed = git(["diff", "--name-only", `${base}...${head}`])
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
} catch (err) {
  // A missing ref is a broken check, not a passing one. Fail loudly: a gate
  // that opens when its own machinery breaks is not a gate.
  console.error(`ERROR: could not diff ${base}...${head}: ${err.message}`);
  process.exit(2);
}

const suiteChanges = changed.filter((file) =>
  WATCHED.some((prefix) => file.startsWith(prefix)),
);

if (suiteChanges.length === 0) {
  console.log("No shipped-suite changes in this range; changelog not required.");
  process.exit(0);
}

if (changed.includes(CHANGELOG)) {
  console.log(
    `${suiteChanges.length} shipped-suite file(s) changed and ${CHANGELOG} is in the diff.`,
  );
  process.exit(0);
}

// ------------------------------------------------------------ escape hatches

let labels = [];
if (process.env.PR_LABELS) {
  try {
    const parsed = JSON.parse(process.env.PR_LABELS);
    if (Array.isArray(parsed)) labels = parsed.map(String);
  } catch {
    console.error("WARNING: PR_LABELS is not valid JSON; ignoring it.");
  }
}
if (labels.includes("changelog-exempt")) {
  console.log("Waived by the `changelog-exempt` label.");
  process.exit(0);
}

let trailer = null;
try {
  const messages = git(["log", "--format=%B", `${base}..${head}`]);
  trailer = messages
    .split("\n")
    .map((line) => line.trim())
    .find((line) => /^changelog-exempt:/i.test(line));
} catch {
  // The diff already succeeded, so a log failure here is unexpected; treat it
  // as no trailer rather than as a waiver.
}
if (trailer) {
  console.log(`Waived by a commit trailer: ${trailer}`);
  process.exit(0);
}

// ------------------------------------------------------------------- failure

console.error(
  `ERROR: this change touches the shipped suite without touching ${CHANGELOG}:\n` +
    suiteChanges.map((f) => `  ${f}`).join("\n") +
    `\n\nAdd an entry under ${CHANGELOG}'s [Unreleased] heading saying what changed and why.` +
    "\nIf the change genuinely ships nothing (a typo in a comment, a file move with no behavior)," +
    "\nwaive it visibly: add the `changelog-exempt` label, or a `Changelog-exempt: <reason>` commit trailer.",
);
process.exit(1);
