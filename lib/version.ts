import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";

/*
  The suite version, read from the repo-root VERSION file (the single source
  of truth) at first use and cached for the process. Every site surface that
  shows a version calls this, so a release bump is one file edit and nothing
  on the site can drift from it. Runtime fs read: the Dockerfile COPYs
  VERSION explicitly (CLAUDE.md gotcha: Next's standalone trace omits
  fs-read files).

  Fail-open to "0.0.0", loudly: a missing VERSION file must not 500 every
  page that renders the footer, and 0.0.0 is older than any real release, so
  /api/version can never tell an installed skill it is behind by mistake.
  The one-time log makes the misconfiguration visible in ops instead of
  silent (same posture as the Supabase missing-env lockout log).
*/

let cached: string | undefined;
let warned = false;

export function suiteVersion(): string {
  if (cached === undefined) {
    try {
      cached = readFileSync(path.join(process.cwd(), "VERSION"), "utf8").trim();
    } catch {
      if (!warned) {
        console.error(
          "VERSION file missing or unreadable; site version falling back to 0.0.0. Was it COPYd into the image?",
        );
        warned = true;
      }
      cached = "0.0.0";
    }
  }
  return cached;
}
