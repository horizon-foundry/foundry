import { NextResponse, type NextRequest } from "next/server";
import { VERSION } from "@/lib/site";
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
  synthetic actor "foundry-suite", so the metric is run counts, never uniques.
  Privacy over analytics fidelity: the suite's own instrumentation doctrine
  forbids identifying telemetry from a tool running in someone else's
  environment.

  Capture never gates the response: invalid or absent params skip capture,
  posthog-server no-ops without a key, and captureServer is fire-and-forget
  (flushed immediately per that module's reliability posture).
*/

const SKILL_PARAM = /^[a-z][a-z-]{0,39}$/;
const VERSION_PARAM = /^[0-9A-Za-z.-]{1,20}$/;

export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const skill = params.get("skill") ?? "";
  const installed = params.get("v") ?? "";

  if (SKILL_PARAM.test(skill) && VERSION_PARAM.test(installed)) {
    captureServer("foundry-suite", "skill_version_check", {
      skill,
      installed_version: installed,
      current_version: VERSION,
    });
  }

  return NextResponse.json({ suite: "foundry", version: VERSION });
}
