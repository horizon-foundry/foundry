import fs from "node:fs";
import path from "node:path";

// Reads the suite's own SKILL.md files so the /skills pages render from the
// canonical source and cannot drift from what's installed. Skills live in
// skills/<name>/SKILL.md and are COPY'd into the image (see Dockerfile).

const SKILLS_DIR = path.join(process.cwd(), "skills");

// Invocation class is not part of the standard skill frontmatter, so it lives
// here: orchestration you type vs disciplines the agent applies itself.
const USER_INVOKED = new Set([
  "foundry",
  "production-audit",
  "frame",
  "scaffold",
  "document",
  "mobile",
  "instrumentation",
]);

// Display order: foundry (the one-command conductor / entry point) first, then
// the flagship it delivers, then the rest grouped by invocation.
const ORDER = [
  "foundry",
  "production-audit",
  "frame",
  "scaffold",
  "document",
  "mobile",
  "instrumentation",
  "phase-plan",
  "brand-voice",
];

// Authored, human-voice marketing copy per skill: a one-line tagline for the
// index cards, plus the "why should I care" layer the detail pages lead with
// (the pain and the payoff, and the moments to reach for it). The SKILL.md
// frontmatter description is written FOR THE AGENT (trigger prose, backticked
// mode names, "use when the user asks..."); rendering it to visitors read as
// unfinished. The detail page still renders the canonical SKILL.md verbatim
// below this layer; this is presentation copy, not a second source of truth.
type SkillCopy = { tagline: string; why: string; when: string[] };

const SKILL_COPY: Record<string, SkillCopy> = {
  foundry: {
    tagline:
      "One pre-ship pass over your project's release gates. It works out which gates this launch actually requires, previews where each stands read-only, helps you close the gaps, and leaves the verdict to one independent audit.",
    why: "Each of these disciplines is easy to skip on its own. Nothing stops you when you do. That is exactly how a product reaches launch day with gaps nobody audited. foundry works out the release policy first. A CLI is not a web product. An internal tool is not a public launch. Then check previews every gate that policy requires, citing the records that already exist instead of re-auditing anything, and telling you when those records have gone stale. Readiness gets reviewed because you ran foundry, not because you remembered each piece. The scorecard says more than pass or fail. It names every state on the record: not-applicable, waived, blocked, and accepted-risk.",
    when: [
      "A release decision or invite wave is close and you want one honest readiness pass",
      "A heavy build stretch just ended and you want to know what it cost",
      "You are about to show the product to strangers",
    ],
  },
  "production-audit": {
    tagline:
      "Audits the whole application across the dimensions your product implies, from a standing set of eleven. It ends in one scope-qualified decision: safe to ship; ready to ship, risks noted; or do not ship.",
    why: "The night before real users arrive, the question is not whether the code is nice. It is whether this is safe to put in front of people. A security review answers security. A diff review answers a diff. This audits the whole application. It traces the flows that cross file boundaries, tries to disprove its own findings, and hands you one decision you can act on. The verdict is honest about its own evidence: a static-only run says runtime was not exercised, never overclaiming a runtime-verified result. You can tune scope and accepted risk, both on the record. You cannot tune the severity rubric or the meaning of the verdict. That is on purpose. A bar you could grade to green is the false comfort this replaces.",
    when: [
      "Launch, an invite wave, or flipping a repo public",
      "An AI built most of it fast and nobody has read it end to end",
      "You want to accept risks on purpose instead of discovering them later",
    ],
  },
  frame: {
    tagline:
      "You declare a one-page product frame plus a four-line security frame, and the skill audits them like code. Who it is for. What it fixes. What success looks like. What would prove the idea wrong. Blanks are findings.",
    why: "Even the most disciplined delivery pipeline can still ship a production-shaped, documented, instrumented solution to the wrong problem. frame holds your declared intent to the same standard the suite holds code. Blank or vague entries are findings. Unlabeled assumptions are findings. Nothing enters the frame that you did not state or confirm. It audits what you believe. It does not run discovery.",
    when: [
      "Before scaffolding or building anything new",
      "A project cannot answer who it is for and why it will matter",
      "An assumption needs to graduate into stated truth, or be retired",
    ],
  },
  scaffold: {
    tagline:
      "Declares what the project is (experiment, internal tool, web product, service, or library), then starts it in the shape that kind of project actually needs.",
    why: "Projects that start as blank prototypes pay for it later. No docs. No deploy story. No license. No memory for the agent that resumes tomorrow. scaffold declares the project's profile first, then stands up the doc set, security frame, and ship path that profile needs. An experiment is allowed to stay light. What it is never allowed to do is quietly become a product without graduating. And it respects what already exists: your CI, your deploy targets, and your conventions win.",
    when: [
      "Starting anything new, from a one-week experiment to a product",
      "An existing repo still has placeholder docs",
      "An experiment is graduating into something real",
    ],
  },
  document: {
    tagline:
      "Keeps the docs true to the code and current across every surface: repair the doc, flag a suspected regression, and reconcile the deck, hub, and showcase copy to what shipped.",
    why: "A wrong doc is worse than no doc. The next agent trusts it and builds on a false premise. document keeps the words honest on two layers. Truth: the docs must match what the code actually does. When a test or an intent claim says the code changed and the doc did not, it flags a regression instead of documenting the bug. Presentation: where the project has an external audience, the repo's own docs become a live surface (deck, Behind-the-Build hub) so they cannot rot unseen. Internal projects get the truth layer without a marketing surface. Every deck claim traces to something real. Impact and evidence are never invented. It is idempotent: a current project is a no-op.",
    when: [
      "The docs and the code (or the shipped product) may disagree",
      "Before closing a unit of work, or before showing the project to anyone",
      "You want the project to explain itself to a newcomer",
    ],
  },
  mobile: {
    tagline:
      "Pressure-tests a surface the way users actually hold it. It diagnoses the real cause first, then verifies across widths, keyboard, zoom, and real devices.",
    why: "Features get designed on a big monitor and break on a 390px phone: clipped commands, unreachable buttons, sideways scrolling. mobile reproduces and instruments the exact broken state before it fixes anything. The usual suspects are diagnostic candidates, not blanket rules. Then it walks the core flows through a real verification matrix: three widths, landscape, text zoom, the software keyboard, keyboard-only, and a real iOS and Android pass. Where a product has no mobile surface, the honest answer is not-applicable, not invented work.",
    when: [
      "A surface was built desktop-first",
      "Anything breaks, clips, or pans on a real phone",
      "Launch is close and mobile has not had a deliberate pass",
    ],
  },
  instrumentation: {
    tagline:
      "Names the funnel before the feature, keys every event on the right entity in one identity model, and measures activation instead of vanity.",
    why: "A feature you cannot measure is a feature you cannot say works. instrumentation names the funnel before the build. It defines one identity model, so client and server events stitch into the same actors (user, account, project, or device, chosen per event). And it runs like production code: versioned event schemas, dedup where a double-fire would corrupt a metric, and a named owner who actually reads the funnel.",
    when: [
      "Adding analytics or instrumenting a new funnel",
      "Wiring PostHog or a similar tool",
      "You could not currently say whether anyone uses the thing you shipped",
    ],
  },
  "phase-plan": {
    tagline:
      "Writes the next unit's plan while context is hot and indexes it, so the next session resumes from a real handoff instead of a cold guess.",
    why: "The next session starts cold, and cold reconstruction is where projects lose afternoons. phase-plan writes the next unit's plan while today's context is still hot. It captures acceptance criteria, dependencies, and non-goals, and indexes the plan exactly where the next session will look first. When there is honestly nothing to plan, it indexes that instead: decision required, awaiting evidence, or a deliberate stop. On resume, the plan is reconciled against the repo's real state before any work starts.",
    when: [
      "A PR is about to merge or a phase is ending",
      "Any plan file is being written",
      "Resuming a project from an indexed plan",
    ],
  },
  "brand-voice": {
    tagline:
      "Enforces one voice from a single source of truth across every user-facing word, and never above clarity.",
    why: "Ten surfaces written in ten moods read as ten different products. brand-voice enforces one voice from a single source of truth, so every word, from error message to landing page, sounds like the same maker. The standard itself is yours, not the skill's. BRAND.md is drafted only from inputs you approved, and binds only after you sign off. The priority order is fixed: comprehension, accessibility, and error recovery outrank stylistic consistency every time.",
    when: [
      "Writing or reviewing any user-facing copy",
      "A project has no defined voice yet",
    ],
  },
};

export interface SkillMeta {
  slug: string;
  name: string;
  description: string;
  // Human-voice marketing layer; tagline falls back to description.
  tagline: string;
  why?: string;
  when?: string[];
  invocation: "user" | "model";
}

// Minimal YAML frontmatter parse for the two fields we render. Avoids a YAML
// dependency; the skill frontmatter is flat name/description only.
function parseFrontmatter(src: string): {
  name: string;
  description: string;
  body: string;
} {
  const m = src.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { name: "", description: "", body: src };
  const fm = m[1];
  const body = m[2];
  const field = (key: string) => {
    const line = fm.match(new RegExp(`^${key}:\\s*(.*)$`, "m"));
    return line ? line[1].trim().replace(/^["']|["']$/g, "") : "";
  };
  return { name: field("name"), description: field("description"), body };
}

function readSkillFile(slug: string): string | null {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) return null;
  const p = path.join(SKILLS_DIR, slug, "SKILL.md");
  if (!p.startsWith(SKILLS_DIR) || !fs.existsSync(p)) return null;
  return fs.readFileSync(p, "utf8");
}

export function listSkills(): SkillMeta[] {
  if (!fs.existsSync(SKILLS_DIR)) return [];
  const metas = fs
    .readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => {
      const src = readSkillFile(d.name);
      if (!src) return null;
      const { name, description } = parseFrontmatter(src);
      return {
        slug: d.name,
        name: name || d.name,
        description,
        tagline: SKILL_COPY[d.name]?.tagline ?? description,
        why: SKILL_COPY[d.name]?.why,
        when: SKILL_COPY[d.name]?.when,
        invocation: USER_INVOKED.has(d.name) ? "user" : "model",
      } as SkillMeta;
    })
    .filter((s): s is SkillMeta => s !== null);
  return metas.sort(
    (a, b) =>
      (ORDER.indexOf(a.slug) + 1 || 99) - (ORDER.indexOf(b.slug) + 1 || 99),
  );
}

export function getSkill(
  slug: string,
): (SkillMeta & { body: string }) | null {
  const src = readSkillFile(slug);
  if (!src) return null;
  const { name, description, body } = parseFrontmatter(src);
  return {
    slug,
    name: name || slug,
    description,
    tagline: SKILL_COPY[slug]?.tagline ?? description,
    why: SKILL_COPY[slug]?.why,
    when: SKILL_COPY[slug]?.when,
    invocation: USER_INVOKED.has(slug) ? "user" : "model",
    body,
  };
}
