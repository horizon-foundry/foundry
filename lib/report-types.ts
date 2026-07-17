// TypeScript mirror of schema/audit-report.schema.json. When the schema changes,
// change this in the same commit (see CLAUDE.md source-of-truth rules).

// Eleven dimensions, applicability resolved per project: six are usually
// applicable, five are conditional (see the schema's dimension $def).
export type Dimension =
  | "security"
  | "concurrency"
  | "reliability"
  | "accessibility"
  | "ui"
  | "infra"
  | "operability"
  | "testing-confidence"
  | "data-migration-safety"
  | "release-safety"
  | "performance-capacity";

export type Severity = "critical" | "high" | "medium" | "low" | "informational";

export type Confidence =
  | "runtime-reproduced"
  | "code-traced"
  | "configuration-confirmed"
  | "high-confidence"
  | "needs-verification";

export type VerificationStatus = "confirmed" | "downgraded" | "not-verified";

export type VerificationMethod =
  | "fresh-subagent"
  | "different-model"
  | "repro-script"
  | "runtime-test"
  | "human";

// The evidence base the verdict rests on. A "static" verdict names its scope
// in the evidence line beneath the recommendation ("static review, runtime not
// exercised"), so it never overclaims a runtime-verified result.
export type AssessedScope = "static" | "static-plus-runtime";

export type VerdictLevel =
  | "safe-to-ship"
  | "ship-with-known-risks"
  | "do-not-ship";

export type ShipGateName = "mobile" | "instrumentation";

export type ShipGateStatus =
  | "met"
  | "at-risk"
  | "not-met"
  | "not-assessed"
  | "not-applicable";

export interface ShipGate {
  gate: ShipGateName;
  status: ShipGateStatus;
  note: string;
  findingIds?: string[];
}

export interface Location {
  file: string;
  line?: number;
  symbol?: string;
}

// risk: a path to harm in production (exposure, data/payment corruption, crash,
// abuse, a hidden active failure). improvement: safe today, a way to make it more
// robust/observable/consistent/accessible/faster. Only risks drive the verdict.
export type FindingKind = "risk" | "improvement";

export interface Finding {
  id: string;
  kind: FindingKind;
  severity: Severity;
  category: string;
  dimension: Dimension;
  location: Location;
  issue: string;
  impact: string;
  evidence: string;
  recommendedFix: string;
  confidence: Confidence;
  assumption?: string;
  verification: {
    status: VerificationStatus;
    method?: VerificationMethod;
    refutationNotes?: string;
  };
  instances?: Location[];
  reproduction?: string;
}

export interface AuditReport {
  meta: {
    schemaVersion: number;
    project: string;
    projectSlug?: string;
    // Email that owns this report. The /reports collection shows a signed-in
    // user only their owned reports; ADMIN_EMAILS see all.
    owner?: string;
    date: string;
    auditedCommit?: string;
    scope: {
      dimensions: Dimension[];
      // Conditional dimensions this run resolved out, with why.
      excludedDimensions?: {
        dimension: Dimension;
        status: "not-applicable" | "not-assessed";
        reason: string;
      }[];
      runtimePass: boolean;
      quick?: boolean;
    };
    skillVersion?: string;
    // The audited product's own release version (e.g. "0.1.0"). When set, the
    // report header stamps it (v0.1.0) instead of leading with the date, so a
    // published report reads as the audit of a release, not a stale dated run.
    version?: string;
    loc?: number;
    // When true, this report is served ungated at /example/<slug> as a public
    // credibility example, and listed on the public /reports index.
    public?: boolean;
  };
  verdict: {
    level: VerdictLevel;
    assessedScope: AssessedScope;
    posture?: string;
    justification: string;
    blockingFindingIds: string[];
  };
  strengths?: { area: string; note: string; dimension?: Dimension }[];
  shipGates: ShipGate[];
  stats: {
    bySeverity: Record<Severity, number>;
    byDimension: Partial<Record<Dimension, number>>;
    verification: { confirmed: number; downgraded: number; refuted: number };
  };
  findings: Finding[];
  remediationPlan: { title: string; findingIds: string[]; detail?: string }[];
  quickWins: { title: string; findingId?: string; blastRadius: string }[];
  deeperInvestigation: {
    title: string;
    detail?: string;
    findingIds?: string[];
  }[];
  notAssessed: { check: string; reason?: string; howToVerify: string }[];
  mechanicalSweeps: {
    name: string;
    tool?: string;
    outcome: string;
    summary?: string;
  }[];
}

export const SEVERITY_ORDER: Severity[] = [
  "critical",
  "high",
  "medium",
  "low",
  "informational",
];

export const VERDICT_LABEL: Record<VerdictLevel, string> = {
  "safe-to-ship": "Safe to ship",
  "ship-with-known-risks": "Ready to ship, risks noted",
  "do-not-ship": "Do not ship",
};

// Maps a verdict/severity to the token color class fragment (see DESIGN.md:
// color means severity or verdict, nothing else).
export const VERDICT_COLOR: Record<VerdictLevel, string> = {
  "safe-to-ship": "verdict-safe",
  "ship-with-known-risks": "verdict-risk",
  "do-not-ship": "verdict-noship",
};

export const SHIP_GATE_LABEL: Record<ShipGateName, string> = {
  mobile: "Mobile",
  instrumentation: "Instrumentation",
};

export const SHIP_GATE_STATUS_LABEL: Record<ShipGateStatus, string> = {
  met: "Met",
  "at-risk": "At risk",
  "not-met": "Not met",
  "not-assessed": "Not assessed",
  "not-applicable": "N/A",
};

// Gate status -> full text-color class (severity/verdict palette only). Full
// class strings so Tailwind's scanner keeps them (dynamic fragments get purged).
export const SHIP_GATE_STATUS_COLOR: Record<ShipGateStatus, string> = {
  met: "text-verdict-safe",
  "at-risk": "text-medium",
  "not-met": "text-verdict-noship",
  "not-assessed": "text-bone-faint",
  "not-applicable": "text-bone-faint",
};
