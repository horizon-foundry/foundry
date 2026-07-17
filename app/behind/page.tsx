import { SlideDeck, type Slide } from "@/components/SlideDeck";

// The overview deck. Slide grammar: category kicker + heading + body +
// evidence items, with a curated quote from
// the engineering-rigor canon anchored to the bottom of each slide.
const SLIDES: Slide[] = [
  {
    category: "The Problem",
    glyph: "problem",
    heading: "Fast, AI-built code is not yet a product.",
    body: "Software built quickly ships fast but unchecked. It forgets its own context between sessions. It skips the unglamorous parts: the docs, the mobile pass, the instrumentation, the pre-launch check. Every gap bites once real users arrive.",
    items: [
      "The gaps are predictable, and so are the disciplines that close them.",
    ],
    quote: {
      text: "Simplicity is prerequisite for reliability.",
      attribution: "Edsger W. Dijkstra",
    },
  },
  {
    category: "The Suite",
    glyph: "suite",
    heading: "Software delivery integrity, as skills.",
    body: "Foundry makes five promises between an idea and its release. A Claude Code skill keeps each one, and you can run them yourself: product intent is declared and audited (frame), execution context survives every session (phase-plan), the outcome is instrumented (instrumentation), the documentation matches reality (document), and technical readiness is audited before real users reach it (foundry + production-audit). Delivery integrity, not product strategy. It is the outer loop: the gate at the end of the build cycle. It composes with the inner-loop skills you use to write and review code, rather than replacing them.",
    chips: ["Distill", "Forge", "Deliver"],
    quote: {
      text: "The cheapest, fastest, and most reliable components are those that aren't there.",
      attribution: "Gordon Bell",
    },
  },
  {
    category: "The Memory",
    glyph: "memory",
    heading: "Documentation engineered as the agent's memory.",
    body: "The failure nothing else addresses is context loss between sessions. The doc set is built so a cold start cannot go wrong. Each fact has one owner. A forever spec holds the present-tense truth. The plan chain is never empty and never padded with a filler plan: when there is honestly no next unit, the index says so.",
    items: [
      "phase-plan writes the next unit's plan while the context is warm. A scaffolded CLAUDE.md rule makes the next session read it before acting.",
      "document keeps the docs and the code from disagreeing, and flags a suspected regression rather than documenting a bug.",
    ],
    quote: {
      text: "The palest ink is better than the best memory.",
      attribution: "proverb",
    },
  },
  {
    category: "The Workflow",
    glyph: "workflow",
    heading: "Build and ship it, honestly.",
    body: "scaffold starts a project in the shape its profile requires, not a blank prototype. document keeps the docs true to the code. It also renders the repo's own docs inside the product, so they cannot drift. phase-plan writes the next unit's plan before you close the current one.",
    quote: {
      text: "Quality is not an act, it is a habit.",
      attribution: "after Aristotle",
    },
  },
  {
    category: "The Release Gates",
    glyph: "gates",
    heading: "The gates your launch needs, resolved and then enforced.",
    body: "There is no universal gate list: a CLI is not a web product. foundry resolves the project's release policy (what it is, its risk tier, its audience), then scores every gate that policy names. mobile pressure-tests the real device experience where one exists. instrumentation wires the activation funnel on one identity model. A gate with no surface is marked not-applicable, with a reason. Skipping one silently is never allowed.",
    items: [
      "A phone-breaking core flow blocks a launch.",
      "A product you cannot measure is not ready to ship, unless you deliberately chose to waive measuring it.",
    ],
    quote: {
      text: "If you can't measure it, you can't improve it.",
      attribution: "attributed to Lord Kelvin",
    },
  },
  {
    category: "The Verdict",
    glyph: "verdict",
    heading: "The flagship audits the whole application.",
    body: "production-audit audits the whole application across eleven dimensions, applicability resolved per project, plus the release gates, and it refutes its own findings. It separates risks, the findings with a path to harm, from improvements, the ones that are safe today and make the app more robust over time, so a clean app reads as clean with a punch list, not a body count. Then it ends in one plain decision that names the evidence it rests on: a static-only run says runtime was not exercised, never overclaiming a runtime-verified result.",
    items: [
      "Only risks decide the verdict; improvements are the punch list, not blockers. You set the scope and accept risks on the record. The severity rubric and the meaning of the verdict are fixed on purpose. A check you could always grade green is the false comfort this replaces.",
    ],
    quote: {
      text: "The first principle is that you must not fool yourself, and you are the easiest person to fool.",
      attribution: "Richard Feynman",
    },
  },
  {
    category: "The Guardrail",
    glyph: "guardrail",
    heading: "Skills that resist being ignored.",
    body: "A named skill is invoked and followed, never hand-reproduced. Every skill opens with a mandatory gate that makes the expected process explicit and harder to bypass. Gates improve compliance; the invariants that must hold are enforced by schema and make validate, not by prose alone.",
    quote: {
      text: "A witty saying proves nothing.",
      attribution: "Voltaire",
    },
  },
  {
    category: "Getting Started",
    glyph: "start",
    heading: "Install once, invoke anywhere.",
    body: "npx skills@latest add horizon-foundry/foundry adds the suite to your Claude Code skills (or clone and make install from source). Then run a skill by name: scaffold a project, document it, or gate a release with production-audit. When a project is nearing release, foundry check reports which pre-ship gates are met, and foundry prepare closes the gaps.",
    chips: ["npx skills@latest add", "/foundry", "/production-audit", "/scaffold"],
    quote: {
      text: "Well begun is half done.",
      attribution: "after Aristotle",
    },
  },
]

export default function BehindOverview() {
  return (
    <div className="flex flex-1 flex-col">
      <SlideDeck
        slides={SLIDES}
        title="Foundry"
        tagline="Software delivery integrity, as Claude Code skills: five kept promises between an idea and its release."
        statChips={[
          "Distill. Forge. Deliver.",
          "Docs as memory",
          "Ends in a verdict",
        ]}
      />
      <p className="mt-4 font-mono text-[0.7rem] uppercase tracking-wide text-bone-faint">
        Arrow keys or the dots to navigate.
      </p>
    </div>
  );
}
