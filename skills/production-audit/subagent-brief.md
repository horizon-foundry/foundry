# Subagent brief reference

Read in full in Phase 2 and pass verbatim to every dimension subagent, including the sequential fallback passes; the orchestrator applies it again in Phases 3 and 4.

## Severity rubric

Severity is earned, never vibes. Judge each finding on **impact x reach x exploitability**, tempered by **detectability and recoverability** (a failure the team would see immediately and can roll back cleanly is less severe than the same failure that corrupts silently and permanently). The table gives the bars, with examples beyond auth so the catastrophic classes are named:

| Level | Bar | Examples of the class |
|---|---|---|
| critical | An unacceptable outcome is reachable today by an attacker or by routine use | Unauthenticated or cross-tenant read/write; remote code execution; secret or credential compromise; irrecoverable data destruction; systemic payment or billing corruption; a privacy/regulatory breach (PII exposure); total loss of availability with no recovery path |
| high | An authenticated user can damage other users' data or bypass a business control; or a plausible failure causes serious, hard-to-recover harm | Business-control bypass; supply-chain exposure (a compromised dependency, or an unpinned critical one with a concrete exposure path, lack of pinning alone is not High); data loss with a recovery path that has never been tested |
| medium | Single-user data loss or a broken flow under realistic conditions | Double-submit corrupts one user's own record; a core flow dead-ends on a realistic error |
| low | Degraded experience, hard-to-reach edge | Stuck spinner on a rare race; layout break on an uncommon viewport |
| informational | Hygiene; no user-visible consequence | Dead code, stale comment, redundant check |

A High must name the business control bypassed or the concrete harm; a Critical must name the unacceptable outcome and why it is reachable today.

## Evidence classes (confidence)

| Confidence | Requires |
|---|---|
| runtime-reproduced | The behavior was observed live (browser, test, script). The strongest class; the only one that may carry a `reproduction` |
| code-traced | Complete code path traced end to end in source; no runtime observation |
| configuration-confirmed | Verified directly in configuration or infrastructure state (headers, deploy config, DB policies), not in application code paths |
| high-confidence | Path traced with exactly one named unverified assumption, stated in the finding |
| needs-verification | Requires runtime/browser/multi-client observation; the exact check to run is stated |

Fits no class: not reported. "Traced" and "reproduced" are deliberately separate classes: a static run's strongest honest claim is code-traced.

## False-positive kill list

Do not report:

- Secrets stored in env vars (that is where secrets belong; report exposure, not storage)
- "Missing rate limiting" without checking every layer it could live at (middleware, handler, DB, platform)
- "Client validation insufficient" when the server validates
- A gap fixed by a later migration or covered by an existing test (check both before reporting)
- Generic CSRF on mutation paths already protected by same-site cookies or framework tokens

Rule: before reporting a missing control, search for it at every layer it could live.

## Quote the motivating line

**Quote the motivating line.** Every finding names its file:line AND quotes the verbatim line(s) that triggered it, in the finding's evidence text. A finding whose motivating line cannot be quoted is not `code-traced`; it drops to `needs-verification` and can never drive the verdict. This is the cheapest kill for the confident, hallucinated finding.
