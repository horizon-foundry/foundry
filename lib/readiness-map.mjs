// The one parser for reference/readiness-map.md. The gate
// (scripts/check-readiness-map.mjs) and the site both read the map through it,
// so a row either parses the same way in both places or fails in both.
//
// Plain ESM, no dependencies. A malformed table row throws an Error that names
// the line, so a bad edit is found at the line that caused it.
//
// Shape: { title, preface, areas: [{ name, slug, rows: [{ id, concern, owner,
// appliesWhen, evidence }] }] }. Cells are kept exactly as written, backticks
// included, because the site renders them.
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const MAP_PATH = "reference/readiness-map.md";
export const HEADER = ["ID", "Concern", "Owner", "Applies when", "Evidence"];

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Splits one table line into trimmed cells. A backslash-escaped pipe stays
// inside its cell. Leading and trailing pipes are the table's frame, not cells.
function splitRow(line) {
  const body = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  const cells = [];
  let cur = "";
  for (let i = 0; i < body.length; i++) {
    if (body[i] === "\\" && body[i + 1] === "|") {
      cur += "|";
      i++;
    } else if (body[i] === "|") {
      cells.push(cur.trim());
      cur = "";
    } else {
      cur += body[i];
    }
  }
  cells.push(cur.trim());
  return cells;
}

const isSeparator = (cells) => cells.every((c) => /^:?-+:?$/.test(c));

export function parseReadinessMap(text) {
  const lines = String(text).split(/\r?\n/);
  const fail = (n, msg) => {
    throw new Error(`${MAP_PATH} line ${n}: ${msg}`);
  };

  let title = null;
  const prefaceLines = [];
  const areas = [];
  let area = null;
  // "none" before the header, "sep" after it (a separator row must follow),
  // "rows" while reading data rows, "done" once the area's table has ended.
  let table = "none";

  for (let i = 0; i < lines.length; i++) {
    const n = i + 1;
    const line = lines[i];
    const trimmed = line.trim();

    if (/^# /.test(line)) {
      if (title !== null) fail(n, "a second title; the file has one `# ` heading.");
      if (areas.length) fail(n, "the title must come before the first area.");
      title = line.slice(2).trim();
      continue;
    }

    if (/^## /.test(line)) {
      if (title === null) fail(n, "an area before the title.");
      if (area && table === "none") fail(n, `area "${area.name}" has no table.`);
      if (area && table === "sep") fail(n, `area "${area.name}" has a header with no rows.`);
      const name = line.slice(3).trim();
      if (!name) fail(n, "an area heading with no name.");
      area = { name, slug: slugify(name), rows: [] };
      if (areas.some((a) => a.slug === area.slug)) fail(n, `duplicate area "${name}".`);
      areas.push(area);
      table = "none";
      continue;
    }

    if (!area) {
      if (title !== null && trimmed) prefaceLines.push(line);
      else if (title !== null) prefaceLines.push("");
      else if (trimmed) fail(n, "text before the title.");
      continue;
    }

    if (!trimmed) {
      if (table === "rows") table = "done";
      continue;
    }

    if (!trimmed.startsWith("|")) {
      fail(n, `text inside area "${area.name}" that is not part of its table.`);
    }

    if (table === "done") fail(n, `area "${area.name}" has a second table; each area has exactly one.`);

    const cells = splitRow(line);

    if (table === "none") {
      const same = cells.length === HEADER.length && cells.every((c, k) => c === HEADER[k]);
      if (!same) fail(n, `the table header must be | ${HEADER.join(" | ")} |.`);
      table = "sep";
      continue;
    }

    if (table === "sep") {
      if (!isSeparator(cells)) fail(n, "the header must be followed by a separator row.");
      table = "rows";
      continue;
    }

    // table === "rows"
    if (cells.length !== HEADER.length) {
      fail(n, `expected ${HEADER.length} cells, found ${cells.length}.`);
    }
    const [id, concern, owner, appliesWhen, evidence] = cells;
    for (const [k, v] of [["ID", id], ["Concern", concern], ["Owner", owner], ["Applies when", appliesWhen], ["Evidence", evidence]]) {
      if (!v) fail(n, `the ${k} cell is empty.`);
    }
    area.rows.push({ id, concern, owner, appliesWhen, evidence });
  }

  if (title === null) fail(1, "no title (`# ` heading).");
  if (!areas.length) fail(lines.length, "no areas (`## ` headings).");
  if (table === "none") fail(lines.length, `area "${area.name}" has no table.`);
  if (table === "sep") fail(lines.length, `area "${area.name}" has a header with no rows.`);

  return { title, preface: prefaceLines.join("\n").trim(), areas };
}

export function loadReadinessMap(root = process.cwd()) {
  return parseReadinessMap(readFileSync(join(root, MAP_PATH), "utf8"));
}
