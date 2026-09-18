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
  // Both projections apply HERE rather than at each call site, on purpose.
  // This function exists only to feed public pages, so a new page cannot leak
  // machine-readable metadata by forgetting to opt in. The brand tab shipped
  // that exact leak: it rendered BRAND.md raw, so the approval header the
  // `brand-voice` skill reads ("Status: approved / Approved by: / Approved
  // on:") appeared to visitors as one run-on sentence, followed by a sentence
  // explaining the header to a repo reader. Section-level stripping could not
  // reach it, because it is loose lines under the H1, not a `## ` section.
  return stripInternalBlocks(stripFrontmatter(fs.readFileSync(p, "utf8")));
}

// Drop a leading YAML frontmatter block. DESIGN.md carries its design tokens
// this way, and it is whitelisted above, so without this the first public page
// to render it would print the raw token map as a paragraph. Latent rather
// than live today (no page renders DESIGN.md yet), and fixed here so it stays
// that way. Only a block that starts on line 1 counts; a `---` later in the
// document is a horizontal rule and is left alone.
export function stripFrontmatter(content: string): string {
  if (!content.startsWith("---\n")) return content;
  const end = content.indexOf("\n---", 3);
  if (end === -1) return content; // unterminated; render as-is rather than eat the file
  return content.slice(content.indexOf("\n", end + 1) + 1).replace(/^\n+/, "");
}

// Drop every `<!-- internal:start -->` ... `<!-- internal:end -->` block. This
// is the BLOCK-level companion to stripSection below: a file can be public,
// a section inside it can be private (stripSection), and now a few lines
// inside a public section can be private too, which is the granularity
// machine-readable headers and tooling notes actually need. Markers beat
// pattern-matching the prose because the intent is declared in the document
// instead of inferred by a regex that a reworded sentence would defeat.
// An unterminated start marker drops the remainder of the file deliberately:
// failing closed on a private-content marker is the safe direction.
export function stripInternalBlocks(content: string): string {
  const out: string[] = [];
  let skipping = false;
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed === "<!-- internal:start -->") {
      skipping = true;
      continue;
    }
    if (trimmed === "<!-- internal:end -->") {
      skipping = false;
      continue;
    }
    if (!skipping) out.push(line);
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n");
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
