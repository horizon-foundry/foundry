import fs from "node:fs";
import path from "node:path";
import type { AuditReport } from "./report-types";

// Reads published audit reports from reports/*.json. These files are committed
// and copied into the Docker image (see Dockerfile). The slug is the filename
// without extension and is the /reports/[slug] URL segment.

const REPORTS_DIR = path.join(process.cwd(), "reports");

export interface ReportSummary {
  slug: string;
  project: string;
  date: string;
  owner?: string;
  verdictLevel: AuditReport["verdict"]["level"];
  bySeverity: AuditReport["stats"]["bySeverity"];
}

// Who is looking at the gated collection. Ownership is an email match against
// meta.owner; admins (ADMIN_EMAILS) see everything, including unowned reports.
export interface Viewer {
  email: string;
  admin: boolean;
}

function canView(owner: string | undefined, viewer: Viewer): boolean {
  if (viewer.admin) return true;
  return !!owner && owner.toLowerCase() === viewer.email.toLowerCase();
}

function slugFromFile(file: string): string {
  return file.replace(/\.json$/, "");
}

// Read and parse one report file defensively. A malformed JSON file, or one
// missing the fields the readers touch, is logged and skipped (returns null)
// rather than throwing, so a single bad file can never 500 the whole index for
// every viewer. `make validate` guards the committed set at build time; this is
// the runtime backstop for anything that bypasses it.
function readReport(file: string): AuditReport | null {
  try {
    const parsed = JSON.parse(fs.readFileSync(file, "utf8")) as AuditReport;
    if (
      !parsed?.meta?.project ||
      !parsed?.verdict?.level ||
      !parsed?.stats?.bySeverity
    ) {
      console.error(`Skipping malformed report ${file}: missing required fields`);
      return null;
    }
    return parsed;
  } catch (err) {
    console.error(`Skipping unreadable report ${file}:`, err);
    return null;
  }
}

export function listReports(): ReportSummary[] {
  if (!fs.existsSync(REPORTS_DIR)) return [];
  return fs
    .readdirSync(REPORTS_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => ({ f, r: readReport(path.join(REPORTS_DIR, f)) }))
    .filter((x): x is { f: string; r: AuditReport } => x.r !== null)
    .map(({ f, r }) => ({
      slug: slugFromFile(f),
      project: r.meta.project,
      date: r.meta.date,
      owner: r.meta.owner,
      verdictLevel: r.verdict.level,
      bySeverity: r.stats.bySeverity,
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

// The gated index: only reports the viewer may see.
export function listReportsFor(viewer: Viewer): ReportSummary[] {
  return listReports().filter((r) => canView(r.owner, viewer));
}

// The gated detail read. Returns null (rendered as 404, not 403) when the
// viewer may not see the report, so the gate never confirms that a report
// exists for a slug someone is guessing at.
export function getReportFor(slug: string, viewer: Viewer): AuditReport | null {
  const r = getReport(slug);
  return r && canView(r.meta.owner, viewer) ? r : null;
}

export function getReport(slug: string): AuditReport | null {
  // Guard the slug against path traversal: only a bare filename is allowed.
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) return null;
  const p = path.join(REPORTS_DIR, `${slug}.json`);
  if (!p.startsWith(REPORTS_DIR) || !fs.existsSync(p)) return null;
  // A malformed file returns null (404), never an unhandled 500.
  return readReport(p);
}

// The ungated /example route serves ONLY reports whose meta.public is true.
// A non-public slug returns null there, so the gate can't be bypassed by
// guessing a report URL under /example.
export function getPublicReport(slug: string): AuditReport | null {
  const r = getReport(slug);
  return r && r.meta.public ? r : null;
}

export function listPublicReports(): ReportSummary[] {
  const publicSlugs = new Set(
    (fs.existsSync(REPORTS_DIR) ? fs.readdirSync(REPORTS_DIR) : [])
      .filter((f) => f.endsWith(".json"))
      .filter((f) => readReport(path.join(REPORTS_DIR, f))?.meta.public === true)
      .map(slugFromFile),
  );
  return listReports().filter((r) => publicSlugs.has(r.slug));
}
