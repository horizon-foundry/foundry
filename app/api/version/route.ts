import { NextResponse, type NextRequest } from "next/server";
import { SKILL_SLUGS, VERSION } from "@/lib/site";
import { captureServer } from "@/lib/posthog-server";

/*
  The suite's version endpoint. Installed skills call this (rate-limited to at
  most daily per machine, opt-out via FOUNDRY_NO_VERSION_CHECK; the check block
  in each SKILL.md carries the contract) to learn whether a newer suite exists.

  Functional first: the response is the current released version, always.
  Telemetry second, and disclosed (README "Version check"): when the caller
  identifies its skill and installed version via query params, that is captured
  as `skill_version_check`. Identity model, per the CLAUDE.md event plan: this
  event deliberately carries NO user, install, or IP identity; it keys on the
  synthetic actor "foundry-suite", so the metric is check counts, never
  uniques. Privacy over analytics fidelity: this is the narrow version-check
  exception the suite's instrumentation doctrine defines (functional purpose,
  disclosure, enforced opt-out, no identity); everything beyond it stays
  banned.

  Capture never gates the response: invalid or absent params skip capture,
  posthog-server no-ops without a key, and captureServer is fire-and-forget
  (flushed immediately per that module's reliability posture).
*/

const VERSION_PARAM = /^[0-9A-Za-z.-]{1,20}$/;

export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const skill = params.get("skill") ?? "";
  const installed = params.get("v") ?? "";

  // Capture only for the canonical slugs (kills junk property cardinality
  // from an open endpoint; this is a data-quality control, not a cost or
  // rate control). $process_person_profile: false is posthog-node's own
  // idiom for "no person": without it a synthetic distinct id still creates
  // and endlessly updates one person row, which would contradict the
  // counts-not-identity contract stated above.
  if (SKILL_SLUGS.includes(skill) && VERSION_PARAM.test(installed)) {
    captureServer("foundry-suite", "skill_version_check", {
      skill,
      installed_version: installed,
      current_version: VERSION,
      $process_person_profile: false,
    });
  }

  // no-store: a cached "current version" is the one answer this endpoint
  // exists to never give stale, and it would starve the capture besides.
  return NextResponse.json(
    { suite: "foundry", version: VERSION },
    { headers: { "Cache-Control": "no-store" } },
  );
}
