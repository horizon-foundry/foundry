import fs from "node:fs";
import path from "node:path";
import type { SpecimenData } from "@/lib/specimen-types";

// Reads the suite's own SKILL.md files so the /skills pages render from the
// canonical source and cannot drift from what's installed. Skills live in
// skills/<name>/SKILL.md and are COPY'd into the image (see Dockerfile).

const SKILLS_DIR = path.join(process.cwd(), "skills");

// The three stages, from BRAND.md's triad, each with a plain caption so a
// first-time visitor can read it. Every skill sits in exactly one (decided
// with Craig, 2026-10-19: scaffold and document forge new practice; Distill is
// stating the intent and checking the design before anything is built).
export type Stage = "distill" | "forge" | "deliver";

export const STAGES: { id: Stage; label: string; caption: string; line: string }[] = [
  { id: "distill", label: "Distill", caption: "before you build", line: "Melt messy context down to what is clear and current." },
  { id: "forge", label: "Forge", caption: "while you build", line: "Build with the discipline that survives a cold start." },
  { id: "deliver", label: "Deliver", caption: "before you ship", line: "Ship on a verdict, not a hope." },
];

// DRAFT copy for Craig: what each stage passes on, and the line under the
// stages. Every mechanism is one a SKILL.md states: frame declares the product
// and security frame, foundry check cites the event plan, the brand approval
// and the docs reconcile, and production-audit reads those declarations, where
// a blank one is a finding. Approved copy replaces this block in place.
export const HANDOFF: Record<Stage, { to: string; what: string }> = {
  distill: {
    to: "hands Forge",
    what: "A declared frame: who it is for, what success looks like, four security lines.",
  },
  forge: {
    to: "hands Deliver",
    what: "Records that match the code: the event plan, the brand approval, the docs reconcile.",
  },
  deliver: {
    to: "hands you",
    what: "One verdict. A missing frame or record comes back as a finding, not a refusal.",
  },
};

// Stored as parts so the page can render the command as a link to its skill.
export const THREAD = {
  line: "Start anywhere. Each stage sharpens the next.",
  lead: "You can start at the end:",
  command: "/production-audit",
  skill: "production-audit",
  tail: "runs on any codebase.",
};

const SKILL_STAGE: Record<string, Stage> = {
  frame: "distill",
  "feature-design": "distill",
  scaffold: "forge",
  document: "forge",
  "phase-plan": "forge",
  instrumentation: "forge",
  mobile: "forge",
  "brand-voice": "forge",
  readout: "forge",
  foundry: "deliver",
  "production-audit": "deliver",
};

// Display order: by stage, in the order the work happens.
const ORDER = [
  "frame",
  "feature-design",
  "scaffold",
  "document",
  "phase-plan",
  "instrumentation",
  "mobile",
  "brand-voice",
  "readout",
  "foundry",
  "production-audit",
];

// Authored, human-voice copy per skill: the sell the skill page leads with. A
// tagline for index tiles, a headline and sub, three highlights (some with a
// small figure), the moments it helps, the sibling it is not, and a specimen
// of what it produces. The SKILL.md frontmatter description is written for the
// agent; the full SKILL.md still renders on the page, closed, below this.
// DRAFT copy (2026-10-19), for Craig's approval. Every claim traces to the
// skill's own SKILL.md (sources: tmp/skill-copy-draft.json at draft time).
// "verification" is production-audit's: the skeptics' rulings, read from the
// published self-audit at render time so the number never goes stale.
export type SkillFigure =
  | { kind: "stat"; value: string; label: string }
  | { kind: "states"; items: string[] }
  | { kind: "verification" };

export type SkillCopy = {
  tagline: string;
  headline: string;
  sub: string;
  highlights: { title: string; line: string; figure?: SkillFigure }[];
  moments: string[];
  notFor?: { text: string; skill: string };
  specimen: SpecimenData;
};

const SKILL_COPY: Record<string, SkillCopy> = {
  frame: {
    "tagline": "You declare who it is for and why it matters. frame audits it, and blanks are findings.",
    "headline": "Know who it is for before you build it.",
    "sub": "You write a one-page frame: the user, the problem, the success measure, the risks. frame checks every entry and reports what is blank, vague, or unsupported.",
    "highlights": [
      {
        "title": "Blanks are findings",
        "line": "An empty entry, a user named as everyone, or a success measure nobody can observe each comes back as a finding."
      },
      {
        "title": "Contradictions come in pairs",
        "line": "A non-goal that excludes your own user, or a measure that cannot move: it cites both entries and leaves the call to you."
      },
      {
        "title": "Four security lines, stated early",
        "line": "Data, trust boundaries, sign-in, and secrets, one line each. A later audit checks the built system against them."
      }
    ],
    "moments": [
      "Before you scaffold or build anything new.",
      "Nobody can say in one line who the product is for.",
      "An assumption has quietly started to read as fact."
    ],
    "notFor": {
      "text": "Not for auditing code that already exists. production-audit does that.",
      "skill": "production-audit"
    },
    "specimen": {
      "title": "Frame audit, first run",
      "provenance": "from PRODUCT.md, frame audit of 2026-07-13",
      "columns": [
        "Entry",
        "Finding"
      ],
      "rows": [
        {
          "cells": [
            "Entry 1",
            "bordered on an unnamed segment"
          ]
        },
        {
          "cells": [
            "Entry 6",
            "no single observable success signal"
          ],
          "flag": "BLANK"
        },
        {
          "cells": [
            "Entry 8",
            "idea risk was absent"
          ]
        },
        {
          "cells": [
            "Security frame",
            "fully covered by existing declarations"
          ]
        }
      ]
    }
  },
  "feature-design": {
    "tagline": "You declare the feature. It checks the declaration against your repository, file and line cited.",
    "headline": "Check the design against the code before you build it.",
    "sub": "You write down the feature. The skill searches your repository and reports what the code already does, what it contradicts, and what a search cannot find.",
    "highlights": [
      {
        "title": "It finds what you already built",
        "line": "Sometimes the feature exists behind a flag or a missing route. Then the job is making it reachable, not building it."
      },
      {
        "title": "Every claim meets the code",
        "line": "Each behavior and path you name gets a row: what the code has today, with a file and line, or not found by search.",
        "figure": {
          "kind": "states",
          "items": [
            "absent",
            "partial",
            "already present",
            "present but unreachable",
            "present, diverged"
          ]
        }
      },
      {
        "title": "It shows what you forgot",
        "line": "A required reverse pass lists what the change must touch that your design never named."
      }
    ],
    "moments": [
      "You are about to design a real feature in an existing codebase.",
      "Before the implementation plan, while the design can still change.",
      "A design keeps assuming things about the code that nobody checked."
    ],
    "notFor": {
      "text": "Not for writing the implementation plan. phase-plan does that.",
      "skill": "phase-plan"
    },
    "specimen": {
      "title": "Grounding table",
      "provenance": "illustrative",
      "columns": [
        "Proposed item",
        "What the code has today",
        "Resolution"
      ],
      "rows": [
        {
          "cells": [
            "Export report as CSV",
            "lib/export.ts:42, behind a flag",
            "present but unreachable"
          ],
          "flag": "UNREACHABLE"
        },
        {
          "cells": [
            "Route /reports/[id]/export",
            "not found by search",
            "absent"
          ]
        },
        {
          "cells": [
            "Owner check on export",
            "lib/auth.ts:18",
            "already present"
          ]
        },
        {
          "cells": [
            "middleware.ts matcher",
            "reverse pass: not named in entry 2",
            "unrequested"
          ]
        }
      ]
    }
  },
  scaffold: {
    "tagline": "Names what the project is, then starts it in the shape that kind of project needs.",
    "headline": "Start each project in the shape it will need at the end.",
    "sub": "Declare one of five profiles, from experiment to library. scaffold stands up the docs, license posture, and ship path that profile needs, filled from a few answers you supply.",
    "highlights": [
      {
        "title": "An experiment stays honest",
        "line": "An experiment may stay light. It may not quietly gain users while shaped like one: graduating means re-running scaffold.",
        "figure": {
          "kind": "states",
          "items": [
            "experiment",
            "internal-tool",
            "web-product",
            "service",
            "library"
          ]
        }
      },
      {
        "title": "Products start shaped to ship",
        "line": "For a web product or service, the first commit carries a real deploy path, security headers, env checks, and a CI smoke test."
      },
      {
        "title": "Your existing rules win",
        "line": "In an existing team or repo, their CI, branch rules, and deploy targets stay. scaffold fills only what is missing."
      }
    ],
    "moments": [
      "Starting anything new, from a one-week experiment to a product.",
      "An existing repo still has placeholder text in its docs.",
      "An experiment is turning into something real."
    ],
    "notFor": {
      "text": "Not for deciding whether the idea is worth building. frame does that.",
      "skill": "frame"
    },
    "specimen": {
      "title": "Scaffold verification, web-product",
      "provenance": "illustrative",
      "columns": [
        "Check",
        "Result"
      ],
      "rows": [
        {
          "cells": [
            "Profile line in CLAUDE.md",
            "web-product"
          ]
        },
        {
          "cells": [
            "TODOS.md five sections",
            "linter clean"
          ]
        },
        {
          "cells": [
            "SECURITY.md disclosure contact",
            "filled"
          ]
        },
        {
          "cells": [
            "{placeholder} markers",
            "1 left: LICENSE holder unknown"
          ],
          "flag": "REMAINING"
        }
      ]
    }
  },
  document: {
    "tagline": "Keeps your docs true to the code, and flags a suspected regression instead of documenting the bug.",
    "headline": "A wrong doc is worse than no doc.",
    "sub": "document checks your docs against what the code does and repairs the plain mismatches. Where the project has an outside audience, it keeps the public pages current too.",
    "highlights": [
      {
        "title": "It tells drift from regression",
        "line": "A renamed flag gets fixed in the doc. A doc that disagrees with a failing test gets flagged for you to decide.",
        "figure": {
          "kind": "states",
          "items": [
            "pass",
            "repaired",
            "regression-flagged"
          ]
        }
      },
      {
        "title": "Your code stays as it is",
        "line": "It never changes working behavior to match a wrong doc. A code change needs your explicit say."
      },
      {
        "title": "It tests the handoff",
        "line": "In reconcile mode, a fresh agent given only the repo must find the plan, name the next step, and start the app."
      }
    ],
    "moments": [
      "The docs and the shipped product may have drifted apart.",
      "Before you close a unit of work or show the project to anyone."
    ],
    "notFor": {
      "text": "Not for creating a doc set from nothing. scaffold does that.",
      "skill": "scaffold"
    },
    "specimen": {
      "title": "Truth checklist report",
      "provenance": "illustrative",
      "columns": [
        "Checklist item",
        "Result"
      ],
      "rows": [
        {
          "cells": [
            "CLI flags in README",
            "pass"
          ]
        },
        {
          "cells": [
            "Skill count in README",
            "repaired: said 9, code has 11"
          ]
        },
        {
          "cells": [
            "Sign-out redirect in PRODUCT.md",
            "suspected regression, a test fails"
          ],
          "flag": "REGRESSION"
        },
        {
          "cells": [
            "Runtime log gitignored",
            "pass"
          ]
        }
      ]
    }
  },
  "phase-plan": {
    "tagline": "Writes the next plan while today's context is fresh, and indexes it where tomorrow's session looks first.",
    "headline": "Tomorrow's session starts from a plan, not a guess.",
    "sub": "When a unit of work closes, phase-plan writes the next plan and adds it to your TODOS index in the same step. On resume, the repo outranks the plan.",
    "highlights": [
      {
        "title": "Written and indexed together",
        "line": "A plan nobody can find after a reset might as well not exist. The file and its index line land in one action."
      },
      {
        "title": "An honest stop beats filler",
        "line": "When there is nothing to plan, it records why instead of inventing work for the next session to trust.",
        "figure": {
          "kind": "states",
          "items": [
            "Decision required",
            "Awaiting evidence",
            "No next work selected"
          ]
        }
      },
      {
        "title": "The repo wins on resume",
        "line": "Before any work starts, it checks git against the plan and amends the plan where reality moved."
      }
    ],
    "moments": [
      "A PR is about to merge, or a phase is ending.",
      "You are picking a project back up after a break."
    ],
    "notFor": {
      "text": "Not for checking a feature's design against the code. feature-design does that.",
      "skill": "feature-design"
    },
    "specimen": {
      "title": "Phase Plans index",
      "provenance": "from TODOS.md, Phase Plans index, as of 2026-10-19",
      "columns": [
        "Closed",
        "Written",
        "Entry"
      ],
      "rows": [
        {
          "cells": [
            "[x]",
            "2026-10-15",
            "Decision required, when to regenerate"
          ]
        },
        {
          "cells": [
            "[x]",
            "2026-10-16",
            "Readiness coverage map"
          ]
        },
        {
          "cells": [
            "[ ]",
            "2026-10-19",
            "Site overhaul"
          ],
          "flag": "RESUME"
        }
      ]
    }
  },
  instrumentation: {
    "tagline": "Plans the funnel before the feature and measures the moment your product first delivers value.",
    "headline": "Know whether the feature works, not just whether it shipped.",
    "sub": "instrumentation writes the event plan before any capture code: the funnel, the moment value first lands, and what must not get worse. Then it wires capture on one identity.",
    "highlights": [
      {
        "title": "One actor, not two",
        "line": "Client and server events land on the same actor. It fires one of each and confirms the analytics tool shows one actor."
      },
      {
        "title": "A guardrail beside every target",
        "line": "You can lift a target by cheapening what counts as value. The plan names what must not get worse, and tracks it too."
      },
      {
        "title": "Sometimes the answer is no telemetry",
        "line": "Some dev tools and libraries must not phone home. Then it instruments only what you control, and the waiver is recorded with a revisit date."
      }
    ],
    "moments": [
      "Adding analytics, or wiring PostHog or a similar product.",
      "You cannot say whether anyone uses what you shipped."
    ],
    "notFor": {
      "text": "Not for the dashboard that shows the numbers. readout does that.",
      "skill": "readout"
    },
    "specimen": {
      "title": "Event plan table",
      "provenance": "illustrative",
      "columns": [
        "Stage",
        "Event",
        "Fires",
        "Identity key"
      ],
      "rows": [
        {
          "cells": [
            "intent",
            "pricing_viewed",
            "client",
            "anonymous, aliased to user"
          ]
        },
        {
          "cells": [
            "signup",
            "signup_completed",
            "server",
            "user"
          ]
        },
        {
          "cells": [
            "activation",
            "first_report_viewed",
            "server",
            "user"
          ]
        },
        {
          "cells": [
            "value",
            "report_shared",
            "server",
            "workspace"
          ],
          "flag": "SPLIT"
        }
      ]
    }
  },
  mobile: {
    "tagline": "Reproduces the real phone defect before fixing it, then walks a matrix of widths, zoom, keyboards, and devices.",
    "headline": "Built on a big monitor. Checked on a real phone.",
    "sub": "mobile reproduces the exact broken state and finds its real cause before changing anything. Then it walks your core flows through a matrix of widths, zoom, keyboards, and devices.",
    "highlights": [
      {
        "title": "Find the cause, then fix",
        "line": "Most mobile time is lost fixing the plausible cause. It records the actual mechanism before any change."
      },
      {
        "title": "One width is a spot check",
        "line": "Three widths, landscape, 200% text, the soft keyboard, keyboard-only use, and the real devices your product supports."
      },
      {
        "title": "Unverified stays unverified",
        "line": "A screenshot proves a layout, not a gesture. What a headless browser cannot check stays marked unverified, with the check to run.",
        "figure": {
          "kind": "states",
          "items": [
            "pass",
            "fail",
            "unverified"
          ]
        }
      }
    ],
    "moments": [
      "A surface was designed on a desktop first.",
      "Something clips, pans sideways, or hides behind the keyboard on a phone.",
      "Launch is close and mobile has had no deliberate pass."
    ],
    "notFor": {
      "text": "Not for weighing mobile results into a release decision. production-audit does that.",
      "skill": "production-audit"
    },
    "specimen": {
      "title": "Mobile verification matrix",
      "provenance": "from the 2026-10-16 self-audit",
      "columns": [
        "Matrix row",
        "Result"
      ],
      "rows": [
        {
          "cells": [
            "320, 360, 393, 430 and landscape",
            "0 overflow and 0 clipped text"
          ]
        },
        {
          "cells": [
            "text-zoom row",
            "26 of 26 routes do not scroll sideways"
          ]
        },
        {
          "cells": [
            "/unlock field",
            "now 16px, so iOS Safari should not zoom"
          ]
        },
        {
          "cells": [
            "software keyboard, iOS Safari, Android",
            "not run on real devices"
          ],
          "flag": "UNVERIFIED"
        }
      ]
    }
  },
  "brand-voice": {
    "tagline": "Keeps every user-facing word in one voice, from one BRAND.md, and never above clarity.",
    "headline": "Every surface should sound like the same maker.",
    "sub": "brand-voice checks copy against your BRAND.md: tone, glossary, your own copy rules, and what the brand refuses to say. With no BRAND.md, it drafts one from what you already approved.",
    "highlights": [
      {
        "title": "The standard is yours",
        "line": "The draft binds only after you sign off, and the approval sits in the file where the skill can read it."
      },
      {
        "title": "Clarity outranks the brand",
        "line": "When a brand rule makes an error message unclear, the plain version wins and the rule gets flagged for revision."
      },
      {
        "title": "One word per concept",
        "line": "The glossary comes from your own words, collected where you used them, so the surfaces stop drifting apart."
      }
    ],
    "moments": [
      "Writing or reviewing copy for any user-facing surface.",
      "A project has no written voice yet."
    ],
    "notFor": {
      "text": "Not for what the copy on a metrics dashboard must say. readout owns that.",
      "skill": "readout"
    },
    "specimen": {
      "title": "Per-surface voice report",
      "provenance": "illustrative",
      "columns": [
        "Surface",
        "Tone",
        "Glossary",
        "Copy rules",
        "Anti-goals"
      ],
      "rows": [
        {
          "cells": [
            "Pricing page hero",
            "pass",
            "pass",
            "pass",
            "pass"
          ]
        },
        {
          "cells": [
            "Upload error toast",
            "pass",
            "violation: 'job', use 'run'",
            "pass",
            "pass"
          ],
          "flag": "VIOLATION"
        },
        {
          "cells": [
            "Empty inbox state",
            "pass",
            "pass",
            "pass",
            "pass"
          ]
        },
        {
          "cells": [
            "Welcome email",
            "pass",
            "pass",
            "pass",
            "pass"
          ]
        }
      ]
    }
  },
  readout: {
    "tagline": "Reviews the surfaces that show your numbers, so a named reader can act on them without being misled.",
    "headline": "Right numbers can still tell the wrong story.",
    "sub": "readout assumes every number is correct and reviews what the surface does with it: who reads it, what sits beside what, and what a failed read shows.",
    "highlights": [
      {
        "title": "A gap is not a zero",
        "line": "A failed source, a real zero, and a cached value each render differently. A stale number always shows its age.",
        "figure": {
          "kind": "states",
          "items": [
            "not measured",
            "measured, and nothing happened",
            "measured earlier"
          ]
        }
      },
      {
        "title": "Every number shows its window",
        "line": "Cards side by side get compared. When their time windows or populations differ, the face says so."
      },
      {
        "title": "Someone else reads the render",
        "line": "Screenshots at desktop and phone width go to a reviewer who did not build the surface, because reading code misses this."
      }
    ],
    "moments": [
      "Building or reviewing a dashboard, a report, or a metrics email.",
      "Someone says the numbers look wrong, or quietly stops reading them.",
      "An experiment result has to hold up under a real decision."
    ],
    "notFor": {
      "text": "Not for adding events or wiring capture. instrumentation does that.",
      "skill": "instrumentation"
    },
    "specimen": {
      "title": "Window and freshness check",
      "provenance": "illustrative",
      "columns": [
        "Tile",
        "Window",
        "Population",
        "Renders as"
      ],
      "rows": [
        {
          "cells": [
            "New signups",
            "7 days",
            "all new accounts",
            "fresh, 2 hours old"
          ]
        },
        {
          "cells": [
            "Activation rate",
            "7 days",
            "new accounts",
            "fresh, 2 hours old"
          ]
        },
        {
          "cells": [
            "Revenue",
            "24 hours",
            "paying accounts",
            "cached 3 days ago, unlabeled"
          ],
          "flag": "STALE"
        },
        {
          "cells": [
            "Trial conversion",
            "7 days",
            "2 trials",
            "counts shown, rate withheld"
          ]
        }
      ]
    }
  },
  foundry: {
    "tagline": "One pass over the release checks your project needs, then a hand-off to production-audit for the verdict.",
    "headline": "Every release check, in one pass, before you ship.",
    "sub": "foundry works out which checks this release needs: a CLI is not a public web product. foundry check previews where each stands. foundry prepare runs the skills that close gaps.",
    "highlights": [
      {
        "title": "Your release, your checks",
        "line": "Its gates, the checks a release must pass, come from your project's type, risk, and launch audience."
      },
      {
        "title": "Preview first, change on request",
        "line": "foundry check is read-only and cites records that already exist. Only foundry prepare changes anything, and only when you run it.",
        "figure": {
          "kind": "states",
          "items": [
            "met",
            "not-met",
            "not-applicable",
            "waived",
            "not-assessed",
            "blocked",
            "accepted-risk"
          ]
        }
      },
      {
        "title": "It never judges its own work",
        "line": "After prepare, it hands off to a fresh production-audit run for the verdict, because the work that fixed things cannot judge itself."
      }
    ],
    "moments": [
      "A launch or an invite wave is close.",
      "A heavy build stretch just ended and you want to know what it cost.",
      "You are about to show the product to strangers."
    ],
    "notFor": {
      "text": "Not for inspecting code or issuing the verdict. production-audit does that.",
      "skill": "production-audit"
    },
    "specimen": {
      "title": "foundry check scorecard",
      "provenance": "illustrative",
      "columns": [
        "gate",
        "policy",
        "state",
        "record cited"
      ],
      "rows": [
        {
          "cells": [
            "document",
            "required",
            "met",
            "last reconcile outcome, current"
          ]
        },
        {
          "cells": [
            "mobile",
            "required",
            "met",
            "audit shipGates, current"
          ]
        },
        {
          "cells": [
            "instrumentation",
            "required",
            "not-met",
            "event plan: no Owner and cadence line"
          ],
          "flag": "NOT MET"
        }
      ]
    }
  },
  "production-audit": {
    "tagline": "Audits the whole application across the areas your product needs, and ends in one decision you can act on.",
    "headline": "Evidence or it doesn't ship.",
    "sub": "It reads the whole app, tries to disprove its own findings, and ends in one decision: safe to ship; ready to ship, risks noted; or do not ship.",
    "highlights": [
      {
        "title": "One decision, not a pile",
        "line": "Every full run ends in one of three verdicts, and the verdict names the evidence it stands on.",
        "figure": {
          "kind": "states",
          "items": [
            "safe to ship",
            "ready to ship, risks noted",
            "do not ship"
          ]
        }
      },
      {
        "title": "It argues with itself",
        "line": "Every finding that could block your release goes to a fresh reviewer whose only job is to prove it wrong.",
        "figure": {
          "kind": "verification"
        }
      },
      {
        "title": "Read-only, and says what it skipped",
        "line": "It never changes your code. Anything it could not check is listed, so a clean result never claims more than it saw."
      }
    ],
    "moments": [
      "The week before an invite wave, a launch, or a public repo.",
      "An AI wrote most of the code and nobody has read it end to end.",
      "You want to accept risks on purpose, not meet them in production."
    ],
    "notFor": {
      "text": "Not for previewing your release checks. foundry check does that.",
      "skill": "foundry"
    },
    "specimen": {
      "title": "Skeptic results on findings",
      "provenance": "from the 2026-10-16 self-audit",
      "columns": [
        "Finding",
        "Area",
        "Severity",
        "Skeptic"
      ],
      "rows": [
        {
          "cells": [
            "SEC-02",
            "security",
            "medium",
            "confirmed"
          ]
        },
        {
          "cells": [
            "SEC-09",
            "security",
            "low",
            "downgraded"
          ],
          "flag": "DOWNGRADED"
        },
        {
          "cells": [
            "OPS-04",
            "operability",
            "low",
            "confirmed"
          ]
        },
        {
          "cells": [
            "OPS-05",
            "operability",
            "low",
            "confirmed"
          ]
        }
      ]
    }
  },
};

export const stageOf = (slug: string) =>
  STAGES.find((s) => s.id === SKILL_STAGE[slug]);

export interface SkillMeta {
  slug: string;
  name: string;
  description: string;
  // Human-voice tagline; falls back to the frontmatter description.
  tagline: string;
  stage?: Stage;
  copy?: SkillCopy;
}

// Minimal YAML frontmatter parse for the two fields we render. Avoids a YAML
// dependency; the skill frontmatter is flat (name/version/description), and
// unknown keys are ignored by the per-key match below.
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
        stage: SKILL_STAGE[d.name],
        copy: SKILL_COPY[d.name],
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
    stage: SKILL_STAGE[slug],
    copy: SKILL_COPY[slug],
    body,
  };
}
