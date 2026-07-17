import fs from "node:fs";
import path from "node:path";

// Reads the project's own scaffold docs for the public Behind-the-Build tabs.
// Whitelisted filenames only, no user input reaches the filesystem, and secret
// files are never in the set. These are COPY'd into the image (see Dockerfile).
//
// The set is deliberately limited to the CURATED, external-facing docs. The raw
// session logs (PROMPTS.md, NOTES.md, FRICTION.md) are internal continuity docs,
// not marketing surfaces, so they are intentionally NOT renderable by the public
// site (they would show placeholders/empty sections and internal voice, which
// brand-voice forbids on a user-facing surface). They remain in the repo.
const ALLOWED = new Set([
  "PRODUCT.md",
  "BRAND.md",
  "DESIGN.md",
]);

export function readDoc(name: string): string {
  if (!ALLOWED.has(name)) throw new Error(`Doc not allowed: ${name}`);
  const p = path.join(process.cwd(), name);
  if (!fs.existsSync(p)) return `_(${name} not found in this build.)_`;
  return fs.readFileSync(p, "utf8");
}

// Remove a `## Heading` section (the heading line through the line before the
// next `## ` at the same level, or EOF) from rendered markdown. This is the
// section-level projection the `document` skill defines: a file can be public
// while a section inside it is not. PRODUCT.md opens with the frame (intent,
// unconfirmed assumptions, open findings, and the security-frame specifics),
// all internal-by-default, so the public product tab strips it. The frame stays
// visible in the gated internal portal (the repo itself).
export function stripSection(content: string, heading: string): string {
  const out: string[] = [];
  let skipping = false;
  for (const line of content.split("\n")) {
    const isH2 = line.startsWith("## ");
    if (isH2 && line.slice(3).trim() === heading) {
      skipping = true; // enter the section to drop
      continue;
    }
    if (skipping && isH2) skipping = false; // next section begins; stop dropping
    if (!skipping) out.push(line);
  }
  return out.join("\n");
}

// The doc-set spec lives under reference/. Whitelisted, single file.
export function readDocSetSpec(): string {
  const p = path.join(process.cwd(), "reference", "doc-set-spec.md");
  if (!fs.existsSync(p)) return "_(doc-set-spec.md not found in this build.)_";
  return fs.readFileSync(p, "utf8");
}
