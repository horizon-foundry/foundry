#!/usr/bin/env node
// The identity in this repo is a set of COPIES of the Horizon Foundry
// handoff, which lives in the company's own repo (docs/rebrand/assets, plus
// the weight-only font under app/fonts) and is not a package, not a submodule
// and not on CI's disk. A copy with no link back drifts in silence, and the
// one failure that sentence cannot survive is a revision that reaches the
// source and half the copies: two marks for one company, green.
//
// The company repo can diff its copies against the handoff directly, because
// the handoff is in it. Here it is absent, so the pin
// (reference/brand-kit.json) stands in for it: it records the geometry that
// was transcribed and a digest per copied file. The default run checks this
// repo against the pin and needs nothing else, so it works in CI. A run with
// --kit <path to a checkout of the company repo> also checks the PIN against
// the real files, which is what the pin is a proxy for, and --update --kit
// <path> regenerates the pin (a handoff revision is one command and one
// diff).
//
// What it holds, in the product's identity as of 2026-11-27 ("the dark
// instrument"):
//
//   1. The copied files, byte for byte: the icon set and the font.
//   2. public/ as a set: the pinned icons plus this site's own three files.
//   3. The HF mark and the unit bar in components/brand/, by exact equality.
//   4. The product lockup: the untouched mark, then FOUNDRY SKILLS in the
//      display face at the parent's ratios.
//   5. The faces: Zalando Sans from the pinned file, IBM Plex Mono, and
//      nothing of the retired display face.
//   6. The share card's source: the pinned mark and unit bar, the lockup, the
//      h1, and the published self-audit's own verdict.
//   7. The share card's render and its URL token.
//   8. The web manifest and the icon tags the layout declares.
//   9. No retired mark and no amber outside a fill, in source.
//
// Sibling gate: scripts/check-built-mark.mjs sweeps what the site SERVES.
// This one is about source; that one is about output. Neither subsumes the
// other. The rules both apply live in scripts/lib/brand-rules.mjs, and
// scripts/test/brand-rules.test.mjs proves they fail on the retired identity.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { repoFiles } from "./lib/repo-files.mjs";
import {
  retiredMarkHits,
  archivoHits,
  amberMisuseInCss,
  amberMisuseInMarkup,
} from "./lib/brand-rules.mjs";

const ROOT = process.cwd();
const SELF = "scripts/check-brand-assets.mjs";
const RULES = "scripts/lib/brand-rules.mjs";
const PIN_PATH = "reference/brand-kit.json";
// The card's source digest and its render's digest, beside the card and not
// under public/: it is build provenance, not a site asset, and public/ is
// served.
const RENDERED_PATH = "scripts/og/rendered.json";

// Files this site serves from its root that are NOT the handoff's. Everything
// else under public/ must be a pinned copy. A set, never a subset: an EXTRA
// icon is the failure byte-equality on named files cannot see, and a leftover
// of the retired set (a favicon.ico, a pinned-tab mask) is exactly that.
const OURS = ["og.png", "robots.txt", "site.webmanifest"];

// The product's name in its lockup, and the home page's h1, which the share
// card repeats. Both are checked against the page's own source below, so the
// card cannot drift from the page.
const LOCKUP_WORDS = "Foundry Skills";
const AMBER = "#D99A2E";

const read = (p) => readFileSync(join(ROOT, p), "utf8");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

// Guarded, and reported as a finding and not a stack trace: a truncated or
// hand-edited record used to crash with a SyntaxError that named no file.
function readJson(rel, what) {
  try {
    return JSON.parse(read(rel));
  } catch (e) {
    console.error(
      `Brand asset check FAILED:\n  - ${rel} (${what}) could not be read as JSON: ${e.message}`,
    );
    process.exit(1);
  }
}

const fail = [];
const check = (ok, message) => {
  if (!ok) fail.push(message);
};

const dAttrs = (svg) => [...svg.matchAll(/\sd="([^"]+)"/g)].map((m) => m[1]);
const viewBoxOf = (svg) => svg.match(/viewBox="([^"]+)"/)?.[1];
const textOf = (html) =>
  html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&rsquo;/g, "’")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

// --- the handoff, read from a checkout of the company repo -------------------

const ASSETS = "docs/rebrand/assets";

function handoffGeometry(kit) {
  const asset = (rel) => readFileSync(join(kit, ASSETS, rel), "utf8");
  const dark = asset("mark/hf-mark-on-dark.svg");
  const light = asset("mark/hf-mark-on-light.svg");
  const [bar, body] = dAttrs(dark);
  // The mark ships twice, on dark and on light. If the two files disagree on
  // the drawing, the handoff contradicts itself and a transcription would
  // pick a side silently.
  if (!bar || !body || JSON.stringify(dAttrs(light)) !== JSON.stringify([bar, body]))
    throw new Error("the handoff's two mark files do not carry the same two paths");
  const unit = asset("mark/unit-bar.svg");
  const [unitD] = dAttrs(unit);
  if (!unitD) throw new Error("the handoff's unit-bar.svg changed shape");
  return {
    mark: {
      from: `${ASSETS}/mark/hf-mark-on-dark.svg`,
      viewBox: viewBoxOf(dark),
      bar,
      body,
    },
    unitBar: {
      from: `${ASSETS}/mark/unit-bar.svg`,
      viewBox: viewBoxOf(unit),
      d: unitD,
    },
  };
}

// Every file under the handoff's assets tree, digested. Pinned as a SET and
// not as the handful this repo copies: a revision that ADDS or renames an
// asset (a new favicon size, a product variant of the icon) changes what the
// company says a product should carry, and a subset check cannot see it.
function handoffTree(kit) {
  const out = {};
  const walk = (dir, prefix) => {
    for (const e of readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
      a.name.localeCompare(b.name),
    )) {
      if (e.name === ".DS_Store") continue;
      const p = join(dir, e.name);
      const rel = prefix ? `${prefix}/${e.name}` : e.name;
      if (e.isDirectory()) walk(p, rel);
      else out[rel] = sha(p);
    }
  };
  walk(join(kit, ASSETS), "");
  return out;
}

// The keys of the company's manifest this product tracks. The names are the
// product's own, and are asserted below.
const MANIFEST_TRACKED = ["icons", "theme_color", "background_color", "display"];
function handoffManifest(kit) {
  const m = JSON.parse(readFileSync(join(kit, "public/site.webmanifest"), "utf8"));
  return Object.fromEntries(MANIFEST_TRACKED.map((k) => [k, m[k]]));
}

// --- modes ------------------------------------------------------------------

const args = process.argv.slice(2);
const kitArg = args.includes("--kit") ? args[args.indexOf("--kit") + 1] : null;
const update = args.includes("--update");

if (update) {
  if (!kitArg) {
    console.error("--update needs --kit <path to a checkout of the Horizon Foundry company repo>");
    process.exit(2);
  }
  const pin = readJson(PIN_PATH, "the brand pin");
  pin.geometry = handoffGeometry(kitArg);
  for (const f of pin.files) f.sha256 = sha(join(kitArg, f.from));
  pin.handoffSet = handoffTree(kitArg);
  pin.manifest = handoffManifest(kitArg);
  writeFileSync(join(ROOT, PIN_PATH), `${JSON.stringify(pin, null, 2)}\n`);
  console.log(
    `${PIN_PATH} regenerated from ${kitArg}. Copy the pinned files again, re-cut components/brand/paths.ts and scripts/og/card.html if the geometry moved, re-render the share card (make og-card), and update the pin's "taken" date.`,
  );
  process.exit(0);
}

// A record that parses but is missing a field is the same problem one
// keystroke later, so every field this gate reads is required here, once.
function requireKeys(obj, rel, what, paths) {
  const missing = paths.filter(
    (path) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj) === undefined,
  );
  if (missing.length) {
    console.error(
      `Brand asset check FAILED:\n  - ${rel} (${what}) is missing ${missing.join(", ")}. Regenerate it with \`node ${SELF} --update --kit <path>\`.`,
    );
    process.exit(1);
  }
  return obj;
}
const pin = requireKeys(readJson(PIN_PATH, "the brand pin"), PIN_PATH, "the brand pin", [
  "taken",
  "geometry.mark.viewBox",
  "geometry.mark.bar",
  "geometry.mark.body",
  "geometry.unitBar.viewBox",
  "geometry.unitBar.d",
  "files",
  "handoffSet",
  "manifest.icons",
  "manifest.theme_color",
  "manifest.background_color",
  "manifest.display",
]);
const G = pin.geometry;

// 1. Every copied file is byte-identical to what the pin recorded. A recolor
//    or a re-export changes bytes without changing anything review would see.
for (const f of pin.files) {
  let actual;
  try {
    actual = sha(join(ROOT, f.path));
  } catch {
    fail.push(`${f.path} is missing (pinned copy of the company's ${f.from}).`);
    continue;
  }
  check(
    actual === f.sha256,
    `${f.path} has drifted from the company's ${f.from}. Copy it again, or regenerate the pin with --update if the handoff itself changed.`,
  );
}

// 2. public/ is the pinned set plus this site's own files, and nothing else,
//    in both directions.
const pinnedPublic = pin.files
  .filter((f) => f.path.startsWith("public/"))
  .map((f) => f.path.slice(7));
{
  const allowed = new Set([...pinnedPublic, ...OURS]);
  const actual = readdirSync(join(ROOT, "public")).filter((n) => n !== ".DS_Store");
  const extra = actual.filter((n) => !allowed.has(n));
  check(
    extra.length === 0,
    `unexpected file in public/: ${extra.join(", ")}. Everything served from the site root is a pinned copy of the company's icon set or one of this site's own files (${OURS.join(", ")}). The retired set (favicon.ico, icon.svg, the android-chrome and maskable tiles, the pinned-tab mask) carried the mountain mark and must not come back.`,
  );
  const gone = OURS.filter((n) => !actual.includes(n));
  check(
    gone.length === 0,
    `missing from public/: ${gone.join(", ")}. These are this site's own served files, so nothing else notices them going.`,
  );
  check(
    pinnedPublic.length >= 7,
    `the pin lists ${pinnedPublic.length} icon files under public/; the company's set is seven.`,
  );
}

// 3. The transcribed geometry, compared EXACTLY. Never with "contains": the
//    mark's body and the unit bar both begin "M0 0H", and a containment check
//    passes on a file where one has been corrupted into the other.
{
  const src = read("components/brand/paths.ts");
  const constant = (name) =>
    src.match(new RegExp(`export const ${name} =\\s*"([^"]+)";`))?.[1];
  const expected = {
    MARK_VIEWBOX: G.mark.viewBox,
    MARK_BAR: G.mark.bar,
    MARK_BODY: G.mark.body,
    UNIT_BAR_VIEWBOX: G.unitBar.viewBox,
    UNIT_BAR: G.unitBar.d,
  };
  for (const [name, value] of Object.entries(expected)) {
    check(
      constant(name) === value,
      `components/brand/paths.ts: ${name} is not the pinned geometry (${value}). The mark and the bar are copies, never redrawn.`,
    );
  }
  // The mark is drawn from those constants, bar first, and only the body
  // changes color by ground. The amber bar is a literal and is never a token.
  const mark = read("components/brand/Mark.tsx");
  const drawn = [...mark.matchAll(/<path d=\{(\w+)\} fill=(?:"([^"]+)"|\{(\w+)\})/g)].map(
    (m) => [m[1], m[2] ?? m[3]],
  );
  check(
    JSON.stringify(drawn) === JSON.stringify([["MARK_BAR", AMBER], ["MARK_BODY", "body"]]),
    `components/brand/Mark.tsx should draw exactly two paths: the bar in the literal ${AMBER}, then the body in the ground's color. Found ${JSON.stringify(drawn)}.`,
  );
  check(
    /ground === "dark" \? "var\(--color-bone\)" : "var\(--color-ink\)"/.test(mark),
    "components/brand/Mark.tsx: the body is Bone on a dark ground and Ink on a light one, and nothing else.",
  );
  check(
    mark.includes("viewBox={MARK_VIEWBOX}"),
    "components/brand/Mark.tsx: the mark is drawn in its own viewBox, whole. It is never cropped.",
  );
  const unit = read("components/brand/UnitBar.tsx");
  check(
    unit.includes("<path d={UNIT_BAR}") && unit.includes("viewBox={UNIT_BAR_VIEWBOX}"),
    "components/brand/UnitBar.tsx should draw the pinned unit bar in its own viewBox.",
  );
  check(
    new RegExp(`amber: "${AMBER}"`).test(unit),
    `components/brand/UnitBar.tsx: the amber fill is the literal ${AMBER}.`,
  );
}

// 4. The product lockup: the untouched mark, then the product's name in the
//    display face, Black, capitals, at the parent's one-line ratios (capitals
//    0.4 of the mark's height, the gap 0.4 of it, tracking 0.05em).
{
  const lockup = read("components/brand/ProductLockup.tsx");
  check(lockup.includes("<Mark"), "components/brand/ProductLockup.tsx no longer draws the Mark.");
  check(
    new RegExp(`>\\s*${LOCKUP_WORDS}\\s*<`).test(lockup),
    `components/brand/ProductLockup.tsx: the lockup's words are "${LOCKUP_WORDS}".`,
  );
  check(
    lockup.includes("gap: markHeight * 0.4") &&
      lockup.includes("(markHeight * 0.4) / CAP") &&
      /const CAP = 0\.714;/.test(lockup),
    "components/brand/ProductLockup.tsx: the gap and the capital height are each 0.4 of the mark's height, and Zalando's cap height is 0.714em.",
  );
  check(
    lockup.includes("(markHeight * 128) / 100"),
    "components/brand/ProductLockup.tsx: the mark keeps its 128 by 100 box.",
  );
  const css = read("app/globals.css");
  const rule = css.match(/\.lockup-word\s*\{([^}]*)\}/)?.[1] ?? "";
  for (const [decl, why] of [
    ["font-family: var(--font-display)", "the display face"],
    ["font-weight: 900", "Black"],
    ["letter-spacing: 0.05em", "the parent's tracking"],
    ["text-transform: uppercase", "capitals"],
  ]) {
    check(rule.includes(decl), `app/globals.css .lockup-word should set ${decl} (${why}).`);
  }
  for (const f of ["components/SiteHeader.tsx", "components/SiteFooter.tsx"]) {
    check(read(f).includes("<Wordmark"), `${f} no longer carries the lockup.`);
  }
  check(
    read("components/Wordmark.tsx").includes("<ProductLockup"),
    "components/Wordmark.tsx should set the product lockup, not a mark of its own.",
  );
}

// 5. The faces. Zalando Sans is the company's and is loaded from the pinned
//    file; IBM Plex Mono is the product's own voice. The retired display face
//    is loaded by nothing.
{
  const fonts = read("lib/fonts.ts");
  check(
    /localFont\(\{[\s\S]*?src: "\.\.\/app\/fonts\/ZalandoSans-wght\.woff2"/.test(fonts),
    "lib/fonts.ts should load Zalando Sans from app/fonts/ZalandoSans-wght.woff2, the company's weight-only file.",
  );
  check(/IBM_Plex_Mono/.test(fonts), "lib/fonts.ts no longer loads IBM Plex Mono, the product's own voice.");
  check(
    pin.files.some((f) => f.path === "app/fonts/ZalandoSans-wght.woff2"),
    `${PIN_PATH} does not pin app/fonts/ZalandoSans-wght.woff2.`,
  );
  const theme = read("app/globals.css");
  check(
    /--font-display:\s*var\(--font-zalando\)/.test(theme),
    "app/globals.css: --font-display should resolve to Zalando Sans first.",
  );
  // The source that decides which faces ship. Prose elsewhere may name the
  // retired face as history; the built-output gate holds what is served.
  for (const f of ["lib/fonts.ts", "app/layout.tsx", "scripts/og/card.html"]) {
    check(
      archivoHits(read(f)).length === 0,
      `${f} names the retired display face. Zalando Sans Black is the display face.`,
    );
  }
}

// 6. The share card's source. It is the copy that hides: no page imports it,
//    it is not TypeScript, and its output is a PNG, so a stale mark or a stale
//    verdict there survives every other check in this repo.
{
  const card = read("scripts/og/card.html");
  const markSvg = card.match(/<svg viewBox="0 0 128 100"[\s\S]*?<\/svg>/)?.[0] ?? "";
  check(
    JSON.stringify(dAttrs(markSvg)) === JSON.stringify([G.mark.bar, G.mark.body]),
    "scripts/og/card.html does not carry the pinned mark: the bar's path first, then the body's, in viewBox 0 0 128 100.",
  );
  const fills = [...markSvg.matchAll(/fill="([^"]+)"/g)].map((m) => m[1].toUpperCase());
  check(
    JSON.stringify(fills) === JSON.stringify([AMBER, "#E8ECF0"]),
    "scripts/og/card.html: the mark is an amber bar and a Bone body, on a dark ground.",
  );
  const unitSvg = card.match(/<svg viewBox="0 0 34 22"[\s\S]*?<\/svg>/)?.[0] ?? "";
  check(
    JSON.stringify(dAttrs(unitSvg)) === JSON.stringify([G.unitBar.d]),
    "scripts/og/card.html does not carry the pinned unit bar in front of the command.",
  );
  const text = textOf(card.slice(card.indexOf("<body")));
  check(text.includes(LOCKUP_WORDS), `scripts/og/card.html: the lockup's words are "${LOCKUP_WORDS}".`);

  // The h1 and the command are the home page's, word for word.
  const home = read("app/page.tsx");
  const h1 = textOf(home.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? "");
  check(h1.length > 0, "app/page.tsx: no h1 found to hold the share card to.");
  check(
    h1.length === 0 || text.includes(h1),
    `scripts/og/card.html: the card's heading is not the home page's h1 ("${h1}").`,
  );
  const slug = read("lib/site.ts").match(/REPO_OWNER = "([^"]+)"[\s\S]*?REPO_NAME = "([^"]+)"/);
  const command = slug ? `npx skills@latest add ${slug[1]}/${slug[2]}` : null;
  check(
    command !== null && text.includes(command),
    `scripts/og/card.html: the command in the well should be "${command}".`,
  );

  // The sheet is the published self-audit's verdict. Every word and number
  // on it is typed into the card, so it is compared to the report here: a
  // regenerated self-audit fails this gate until the card is re-typed and
  // re-rendered.
  const reports = readdirSync(join(ROOT, "reports"))
    .filter((n) => /^foundry-\d{4}-\d{2}-\d{2}\.json$/.test(n))
    .sort();
  check(reports.length > 0, "no reports/foundry-<date>.json found to hold the share card to.");
  if (reports.length) {
    const report = readJson(`reports/${reports[reports.length - 1]}`, "the published self-audit");
    const fact = (name) =>
      textOf(card.match(new RegExp(`data-fact="${name}"[^>]*>([\\s\\S]*?)<`))?.[1] ?? "");
    const LABEL = {
      "safe-to-ship": "Safe to ship",
      "ship-with-known-risks": "Ready to ship, risks noted",
      "do-not-ship": "Do not ship",
    };
    const SCOPE = {
      static: "Static review · runtime not exercised",
      "static-plus-runtime": "Static review + runtime pass",
    };
    const want = {
      verdict: LABEL[report.verdict?.level],
      scope: SCOPE[report.verdict?.assessedScope],
      posture: report.verdict?.posture,
      stamp: report.meta?.auditedCommit
        ? `${report.meta.date} · ${report.meta.auditedCommit}`
        : report.meta?.date,
      ...Object.fromEntries(
        ["critical", "high", "medium", "low", "informational"].map((s) => [
          s,
          String(report.stats?.bySeverity?.[s]),
        ]),
      ),
    };
    for (const [name, value] of Object.entries(want)) {
      check(
        fact(name) === value,
        `scripts/og/card.html: the sheet's ${name} reads "${fact(name)}", and the published self-audit (reports/${reports[reports.length - 1]}) says "${value}". Re-type the card from the report and run \`make og-card\`.`,
      );
    }
    check(report.meta?.public === true, `reports/${reports[reports.length - 1]} is not public, so the card may not quote it.`);
  }
}

// 7. The share card, both halves: the source's digest and the render's. A
//    source digest alone proves someone ran line 2 of a two-line recipe and
//    nothing about the PNG, so the retired card could be restored byte for
//    byte, or deleted, with both gates green. Mtimes cannot stand in (git
//    does not preserve them); committed digests are checkout-stable.
{
  let rendered;
  try {
    rendered = JSON.parse(read(RENDERED_PATH));
  } catch {
    rendered = null;
    fail.push(
      `${RENDERED_PATH} is missing or unreadable. It records the share card's source and render digests; regenerate both with \`make og-card\`.`,
    );
  }
  if (rendered) {
    check(
      sha(join(ROOT, "scripts/og/card.html")) === rendered.source,
      `scripts/og/card.html changed since public/og.png was rendered. Re-render it with \`make og-card\`, which rewrites ${RENDERED_PATH}.`,
    );
    let pngSha = null;
    try {
      pngSha = sha(join(ROOT, "public/og.png"));
    } catch {
      fail.push(
        "public/og.png is missing. The share card is the most-shared surface of this site and nothing else renders it.",
      );
    }
    if (pngSha) {
      check(
        pngSha === rendered.render,
        `public/og.png is not the render this repo recorded. If the card was re-rendered, update ${RENDERED_PATH}; if the file was replaced or reverted (the retired card carried the mountain mark), this is the check that exists to say so.`,
      );
    }
    // The card's URL carries the render's token, so a re-render is a new URL
    // for the scrapers that cache og:image by URL and ignore cache headers.
    // EVERY reference: app/layout.tsx names the card for openGraph and for
    // twitter, and a single containment check was satisfied by either alone.
    const token = `/og.png?v=${String(rendered.render).slice(0, 8)}`;
    const layout = read("app/layout.tsx");
    const refs = [...layout.matchAll(/"(\/og\.png[^"]*)"/g)].map((m) => m[1]);
    check(
      refs.length >= 2,
      `app/layout.tsx names the share card ${refs.length} time(s); it should name it for both openGraph and twitter.`,
    );
    const untokened = refs.filter((r) => r !== token);
    check(
      untokened.length === 0,
      `app/layout.tsx points at ${untokened.join(", ")} and not ${token}. Without the current token, every link already shared keeps showing the previous card.`,
    );
    // Every OTHER route, too. The built-output sweep can only see prerendered
    // pages, so a dynamic route that set its own openGraph.images would drop
    // the token with both gates green. The override itself is what is caught.
    const overriding = repoFiles(ROOT)
      .filter((f) => f.startsWith("app/") && f.endsWith(".tsx") && f !== "app/layout.tsx")
      .filter((f) => /openGraph\s*:|twitter\s*:/.test(read(f)));
    check(
      overriding.length === 0,
      `${overriding.join(", ")} sets its own openGraph or twitter metadata. Those routes are not all prerendered, so no built-output check can see them: give the card URL the same token app/layout.tsx uses, then add the file here.`,
    );
  }
}

// 8. The manifest and the declared icons. The manifest tracks the company's
//    in its icons, colors and display mode, and differs in exactly the
//    product's own names. The layout declares only pinned files.
{
  const ours = readJson("public/site.webmanifest", "the web manifest");
  check(ours.id === "/", "public/site.webmanifest: id should be /");
  check(ours.start_url === "/", "public/site.webmanifest: start_url should be /");
  check(
    ours.scope === "/",
    "public/site.webmanifest: scope should be /. Without it, scope follows whichever page the visitor installed from, and under display: standalone every other route then opens in the in-app browser bar.",
  );
  check(
    ours.name === "Foundry Skills" && ours.short_name === "Foundry",
    'public/site.webmanifest: the long name says what the product is ("Foundry Skills"), because an install prompt carries no site around it; the short name under the icon is "Foundry".',
  );
  for (const k of MANIFEST_TRACKED) {
    check(
      JSON.stringify(ours[k]) === JSON.stringify(pin.manifest[k]),
      `public/site.webmanifest: ${k} should still track the company's (${JSON.stringify(pin.manifest[k])}).`,
    );
  }
  for (const icon of ours.icons ?? []) {
    check(
      pinnedPublic.includes(String(icon.src).replace(/^\//, "")),
      `public/site.webmanifest lists ${icon.src}, which is not a pinned icon file.`,
    );
  }
  // The KEY SET, not named keys one by one: a `shortcuts` entry pointing
  // offsite, or any key nobody declared, would ship green otherwise.
  const allowedKeys = new Set(["name", "short_name", "id", "start_url", "scope", ...MANIFEST_TRACKED]);
  const unexpected = Object.keys(ours).filter((k) => !allowedKeys.has(k));
  const missing = [...allowedKeys].filter((k) => !(k in ours));
  check(
    unexpected.length === 0,
    `public/site.webmanifest carries undeclared keys: ${unexpected.join(", ")}. Add each to ${SELF} with a reason, or take it out.`,
  );
  check(missing.length === 0, `public/site.webmanifest is missing ${missing.join(", ")}.`);

  // The layout's icon block: every url is a pinned file, and the retired
  // declarations are gone. No mask-icon: a one-color tint cannot keep the
  // amber bar, and the company ships none.
  const layout = read("app/layout.tsx");
  const block = layout.match(/\n  icons: \{([\s\S]*?)\n  \},/)?.[1];
  check(block !== undefined, "app/layout.tsx no longer declares `icons` where this gate reads it.");
  const urls = [...(block ?? "").matchAll(/url: "\/([^"]+)"/g)].map((m) => m[1]);
  const declared = ["favicon.svg", "favicon-16.png", "favicon-32.png", "favicon-48.png", "apple-touch-icon-180.png"];
  check(
    JSON.stringify(urls) === JSON.stringify(declared),
    `app/layout.tsx should declare exactly ${declared.join(", ")} (the company's own tags). Found ${urls.join(", ") || "none"}.`,
  );
  check(
    !/mask-icon|favicon\.ico|safari-pinned-tab/.test(layout.replace(/\/\/[^\n]*/g, "")),
    "app/layout.tsx still declares a retired icon (a mask-icon, favicon.ico or the pinned-tab mask).",
  );
  const conventions = repoFiles(ROOT).filter((f) =>
    /^app\/(icon|apple-icon|favicon|opengraph-image|twitter-image)\./.test(f),
  );
  check(
    conventions.length === 0,
    `${conventions.join(", ")}: an app/ icon or image convention file. \`icons\` is one metadata key, so a declared set and a convention file silently drop one another.`,
  );
}

// 9. The source sweep: no retired mark anywhere this repo carries text, no
//    amber outside a fill in the code that builds the site, and no claim of a
//    design-kit version (the kit belonged to the retired identity).
{
  const files = repoFiles(ROOT).filter((f) => !/\.(png|ico|jpg|jpeg|webp|woff2?)$/.test(f));
  check(
    files.length > 20,
    `only ${files.length} files swept; the repo listing looks broken.`,
  );
  const unreadable = [];
  for (const f of files) {
    let text;
    try {
      text = readFileSync(join(ROOT, f), "utf8");
    } catch {
      unreadable.push(f);
      continue;
    }
    if (f !== RULES) {
      for (const name of retiredMarkHits(text)) {
        check(false, `${f} still carries ${name}. The mark is the HF monogram, from components/brand/.`);
      }
    }
    const built = /^(app|components|lib)\//.test(f);
    if (built && f.endsWith(".css")) {
      for (const hit of amberMisuseInCss(text)) {
        check(false, `${f}: amber outside a fill: ${hit}. Amber only ever fills a bar: never text, a border or a wash.`);
      }
    }
    if (built && /\.(ts|tsx)$/.test(f)) {
      for (const hit of amberMisuseInMarkup(text)) {
        check(false, `${f}: amber outside a fill: ${hit}. A command is Bone or Mist mono, with the amber unit bar in front of it where it is the command to run.`);
      }
    }
    if (
      (built || f.startsWith("scripts/og/") || ["DESIGN.md", "BRAND.md", "README.md", "CLAUDE.md"].includes(f)) &&
      /kit v\d+\.\d+/i.test(text)
    ) {
      check(false, `${f} still claims a design-kit version. The kit belonged to the retired mark; the pin is ${PIN_PATH}.`);
    }
  }
  check(
    unreadable.length === 0,
    `git lists files this gate cannot open, so they went unchecked: ${unreadable.join(", ")}`,
  );
}

// 10. With a checkout of the company repo in hand, check the PIN itself.
//     Everything above trusts the pin; this asks whether the pin still
//     describes the handoff, which is what it is a proxy for.
if (kitArg) {
  const g = handoffGeometry(kitArg);
  check(
    JSON.stringify(g) === JSON.stringify(pin.geometry),
    `the pinned geometry differs from the handoff's at ${kitArg}/${ASSETS}/mark.`,
  );
  for (const f of pin.files) {
    check(
      sha(join(kitArg, f.from)) === f.sha256,
      `the pinned digest for ${f.from} differs from the company's file.`,
    );
  }
  check(
    JSON.stringify(handoffManifest(kitArg)) === JSON.stringify(pin.manifest),
    "the pinned manifest keys differ from the company's public/site.webmanifest.",
  );
  // A SET, not a subset: a revision that adds or renames an asset must show.
  const tree = handoffTree(kitArg);
  const added = Object.keys(tree).filter((f) => !(f in pin.handoffSet));
  const removed = Object.keys(pin.handoffSet).filter((f) => !(f in tree));
  check(
    added.length === 0,
    `the handoff has files the pin does not record: ${added.join(", ")}. Regenerate the pin and decide what this site takes from them.`,
  );
  check(removed.length === 0, `the pin records handoff files that no longer exist: ${removed.join(", ")}.`);
  for (const [f, digest] of Object.entries(tree)) {
    if (f in pin.handoffSet) {
      check(pin.handoffSet[f] === digest, `the handoff's ${f} differs from the pinned digest.`);
    }
  }
  console.log(`Pin checked against the handoff at ${kitArg}, assets tree included.`);
}

if (fail.length) {
  console.error("Brand asset check FAILED:");
  for (const m of fail) console.error(`  - ${m}`);
  process.exit(1);
}
console.log(
  `Brand assets match the pin (taken ${pin.taken}): ${pin.files.length} copied files, the HF mark and the unit bar, the product lockup, the faces, the share card and its render, and no retired mark or amber type in source.`,
);
if (!kitArg) {
  // Said out loud because it is the one thing this gate cannot do on its own.
  // CI has no checkout of the company repo, so the default run compares this
  // repo to a file in this repo; only `make check-kit KIT=<path>` compares
  // that file to the handoff.
  console.log(
    "  (the pin itself was not checked against the handoff in this run: run `make check-kit KIT=<path to the Horizon Foundry company repo>`)",
  );
}
