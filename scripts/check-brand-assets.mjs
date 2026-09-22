#!/usr/bin/env node
// The brand assets in this repo are COPIES of the Horizon Foundry design kit,
// which lives in the parent brand repo and is not a package, not a submodule,
// and not on an adopter's or CI's disk. Every doc says "the kit is the source
// of truth"; until this script existed, nothing checked it, and the one thing
// a sentence like that cannot survive is a kit revision that updates the kit
// and half the copies. That ships two marks for one company, green.
//
// The parent repo can diff its copies against the kit directly, because the
// kit is in it. Here the kit is absent, so the pin (reference/brand-kit.json)
// stands in for it: it records which kit version was taken, the geometry that
// was transcribed, and a digest per copied file. The default run checks the
// repo against the pin and needs nothing else, so it works in CI. A run with
// --kit <path> additionally checks the PIN against a real kit checkout, which
// is the thing the pin is a proxy for, and --update --kit <path> regenerates
// the pin (that is what a kit bump looks like: one command, one diff).
//
// Sibling gate: scripts/check-built-mark.mjs sweeps what the site SERVES.
// This one is about source; that one is about output. Neither subsumes the
// other, and the retired mark hid from source greps in a PNG once already.
//
// Three of the checks below exist because an adversarial pass defeated the
// first version of this file:
//
//   * public/og.png was protected by nothing. It is a PNG, so the built-output
//     sweep cannot read it, and this file only hashed the card's SOURCE. The
//     retired card could be restored byte for byte, or the file deleted
//     outright, and both gates stayed green while the success line said "the
//     share card and its render". The render now has its own pinned digest.
//   * --kit compared only the files the pin names, so a kit revision that
//     ADDED or renamed an asset was invisible in both modes. The kit's whole
//     web/ tree is now pinned as a set.
//   * The derived claimant sweep used `git ls-files`, which cannot see a file
//     that has not been added yet, so the green run an author sees is the one
//     that cannot see the file they just wrote. It reads untracked files too.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { repoFiles } from "./lib/repo-files.mjs";

const ROOT = process.cwd();
const SELF = "scripts/check-brand-assets.mjs";
const PIN_PATH = "reference/brand-kit.json";
// The card's source digest and its render's digest, beside the card rather
// than under public/: it is build provenance, not a site asset, and public/
// is served, so the old location published it at the site root.
const RENDERED_PATH = "scripts/og/rendered.json";

// Files this repo serves that are NOT the kit's: everything else under
// public/ must be a pinned copy, or the set has drifted. A set, never a
// subset: an EXTRA icon is the failure that byte-equality on named files
// cannot see, and iOS and several scrapers prefer names nobody declared.
const OURS = ["og.png", "robots.txt"];

// Every file that states which kit is installed, in the canonical form
// `kit vX.Y`. A file added here without the phrase fails immediately, which
// is the point: this list is the set of things a kit bump has to touch, and
// it is cheaper to read than to remember. Historical mentions are written
// without the `v`, so a mention can never read as a claim.
// The pin is not on this list: its `kit` field is the authority every claim is
// checked against, not prose making a claim of its own.
const CLAIMANTS = [
  "components/Wordmark.tsx",
  "scripts/og/card.html",
  "DESIGN.md",
  "BRAND.md",
];

const read = (p) => readFileSync(join(ROOT, p), "utf8");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

// Guarded, and reported as a finding rather than a stack trace: a truncated or
// hand-edited record used to crash with a SyntaxError that named no file, in a
// gate whose whole stance is that a failure says what is wrong.
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

// viewBox + d out of any single-path SVG. Throws rather than returning
// undefined: a kit file that changed shape must stop the run, not quietly
// compare undefined to undefined.
function geometry(svg, label) {
  const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1];
  const d = svg.match(/\sd="([^"]+)"/)?.[1];
  if (!viewBox || !d) throw new Error(`${label} is not a single-path SVG`);
  return { viewBox, d };
}

function kitGeometry(kit) {
  const tsx = readFileSync(join(kit, "web/HfSymbol.tsx"), "utf8");
  const canonical = {
    viewBox: tsx.match(/HF_SYMBOL_VIEWBOX = "([^"]+)"/)?.[1],
    d: tsx.match(/HF_SYMBOL_PATH = "([^"]+)"/)?.[1],
  };
  if (!canonical.viewBox || !canonical.d)
    throw new Error("kit web/HfSymbol.tsx changed shape");
  // The canonical cut ships twice, as the component reference and as an SVG.
  // If they disagree, the kit contradicts itself and a transcription would
  // pick a side silently.
  const fromSvg = geometry(
    readFileSync(join(kit, "svg/mark/hf-symbol-currentcolor.svg"), "utf8"),
    "kit svg/mark/hf-symbol-currentcolor.svg",
  );
  if (fromSvg.viewBox !== canonical.viewBox || fromSvg.d !== canonical.d)
    throw new Error(
      "the kit disagrees with itself: web/HfSymbol.tsx vs svg/mark/hf-symbol-currentcolor.svg",
    );
  return {
    canonical: { from: "web/HfSymbol.tsx", ...canonical },
    small: {
      from: "svg/mark/hf-symbol-small-ink.svg",
      ...geometry(
        readFileSync(join(kit, "svg/mark/hf-symbol-small-ink.svg"), "utf8"),
        "kit svg/mark/hf-symbol-small-ink.svg",
      ),
    },
  };
}

// Every file under the kit's web/ tree, digested. Pinned as a SET rather than
// as the handful of files this repo copies: a kit revision that ADDS or
// renames an asset (a new favicon size, a second head snippet) is a change to
// what the kit says this site should serve, and a subset check cannot see it.
function kitWebTree(kit) {
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
  walk(join(kit, "web"), "");
  return out;
}

// --- modes ------------------------------------------------------------------

const args = process.argv.slice(2);
const kitArg = args.includes("--kit") ? args[args.indexOf("--kit") + 1] : null;
const update = args.includes("--update");

if (update) {
  if (!kitArg) {
    console.error("--update needs --kit <path to logo/horizon-foundry-kit>");
    process.exit(2);
  }
  const pin = readJson(PIN_PATH, "the design-kit pin");
  pin.kit = readFileSync(join(kitArg, "VERSION"), "utf8").trim();
  pin.geometry = kitGeometry(kitArg);
  for (const f of [...pin.files, ...pin.diverged, ...pin.reference]) {
    f.sha256 = sha(join(kitArg, f.from));
  }
  pin.kitSet = kitWebTree(kitArg);
  pin.kitManifest = JSON.parse(
    readFileSync(join(kitArg, "web/foundry/site.webmanifest"), "utf8"),
  );
  writeFileSync(join(ROOT, PIN_PATH), `${JSON.stringify(pin, null, 2)}\n`);
  console.log(
    `${PIN_PATH} regenerated from kit v${pin.kit}. Copy the kit's files into public/, re-cut components/Wordmark.tsx and scripts/og/card.html, re-render the share card, and update every claimant to "kit v${pin.kit}".`,
  );
  process.exit(0);
}

// A record that parses but is missing a field is the same problem one keystroke
// later: `pin.kitManifest.display` on a pin written by an older cut of this
// script threw a TypeError naming nothing.
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
const pin = requireKeys(readJson(PIN_PATH, "the design-kit pin"), PIN_PATH, "the design-kit pin", [
  "kit",
  "geometry.canonical.viewBox",
  "geometry.canonical.d",
  "geometry.small.viewBox",
  "geometry.small.d",
  "files",
  "diverged",
  "reference",
  "kitSet",
  "kitManifest",
]);

// 1. Every copied file is byte-identical to what the pin recorded. A recolor
//    or a re-export changes bytes without changing anything review would see.
for (const f of pin.files) {
  let actual;
  try {
    actual = sha(join(ROOT, f.path));
  } catch {
    fail.push(`${f.path} is missing (pinned copy of the kit's ${f.from}).`);
    continue;
  }
  check(
    actual === f.sha256,
    `${f.path} has drifted from the kit's ${f.from}. Copy it again from the kit, or regenerate the pin with --update if the kit itself changed.`,
  );
}

// 2. public/ is the pinned set plus this site's own files, and nothing else.
{
  const allowed = new Set([
    ...pin.files.filter((f) => f.path.startsWith("public/")).map((f) => f.path.slice(7)),
    ...pin.diverged.filter((f) => f.path.startsWith("public/")).map((f) => f.path.slice(7)),
    ...OURS,
  ]);
  const actual = readdirSync(join(ROOT, "public")).filter((n) => n !== ".DS_Store");
  const extra = actual.filter((n) => !allowed.has(n));
  check(
    extra.length === 0,
    `unexpected file in public/: ${extra.join(", ")}. Everything served from the site root is either a pinned kit copy or one of this site's own files (${OURS.join(", ")}).`,
  );
  // And in the other direction. "A set, never a subset" was only half
  // implemented: extras were reported, absences were not, so deleting
  // public/robots.txt was invisible to both gates (the pinned copies fail
  // when missing and og.png is covered below, which left exactly one file
  // nothing watched).
  const gone = OURS.filter((n) => !actual.includes(n));
  check(
    gone.length === 0,
    `missing from public/: ${gone.join(", ")}. These are this site's own served files, not the kit's, so nothing else notices them going.`,
  );
}

// 3. The transcribed geometry, compared EXACTLY and in order. Never with
//    "contains": the kit's lockup path BEGINS with the mark's own path, so a
//    containment check passes on a file where the mark has been corrupted and
//    only a lockup is intact.
{
  const src = read("components/Wordmark.tsx");
  const paths = [...src.matchAll(/<path d="([^"]+)" \/>/g)].map((m) => m[1]);
  const viewBoxes = [...src.matchAll(/^const \w+_VIEWBOX = "([^"]+)";$/gm)].map(
    (m) => m[1],
  );
  const expected = [pin.geometry.canonical, pin.geometry.small];
  check(
    JSON.stringify(paths) === JSON.stringify(expected.map((e) => e.d)),
    "components/Wordmark.tsx should define exactly two paths, the canonical cut then the small cut, matching the pin.",
  );
  check(
    JSON.stringify(viewBoxes) === JSON.stringify(expected.map((e) => e.viewBox)),
    "components/Wordmark.tsx should define exactly two viewBoxes, canonical then small, matching the pin. Each cut travels with its own box; reusing one misaligns the art.",
  );
}

// 4. The share card is the copy that hides: no page imports it, it is not
//    TypeScript, and its output is a PNG, so a stale mark there survives every
//    other check in this repo.
{
  const card = read("scripts/og/card.html");
  check(
    card.includes(pin.geometry.canonical.viewBox) &&
      card.includes(pin.geometry.canonical.d),
    "scripts/og/card.html does not carry the kit's canonical mark. Re-cut it from the pin and re-render public/og.png.",
  );
}

// 5. The share card, both halves. Recording only the SOURCE's digest was the
//    hole: it proved someone ran line 2 of a two-line recipe, and nothing at
//    all about the PNG, so the retired card could be restored byte for byte,
//    or deleted, with both gates green. Mtimes cannot stand in (git does not
//    preserve them, so any checkout reorders the two files); committed digests
//    are checkout-stable.
{
  let rendered;
  try {
    rendered = JSON.parse(read(RENDERED_PATH));
  } catch {
    rendered = null;
    fail.push(
      `${RENDERED_PATH} is missing or unreadable. It records the share card's source and render digests; regenerate both with the recipe in scripts/og/card.html.`,
    );
  }
  if (rendered) {
    const cardSha = createHash("sha256")
      .update(readFileSync(join(ROOT, "scripts/og/card.html")))
      .digest("hex");
    check(
      cardSha === rendered.source,
      `scripts/og/card.html changed since public/og.png was rendered. Re-render it (the recipe is in the card's header comment), which rewrites ${RENDERED_PATH}.`,
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
        `public/og.png is not the render this repo recorded. If the card was re-rendered, update ${RENDERED_PATH}; if the file was replaced or reverted, this is the check that exists to say so.`,
      );
    }
    // The card's URL carries the render's token, so a re-render is a new URL
    // for the scrapers that cache og:image by URL and ignore cache headers.
    //
    // EVERY reference, not one. app/layout.tsx names the card twice, once for
    // openGraph and once for twitter, and a single containment check was
    // satisfied by either alone: dropping the token from twitter:image passed,
    // though X is the reason the token exists at all.
    const token = `/og.png?v=${rendered.render.slice(0, 8)}`;
    const layout = read("app/layout.tsx");
    const refs = [...layout.matchAll(/"(\/og\.png[^"]*)"/g)].map((m) => m[1]);
    check(
      refs.length >= 2,
      `app/layout.tsx names the share card ${refs.length} time(s); it should name it for both openGraph and twitter.`,
    );
    const untokened = refs.filter((r) => r !== token);
    check(
      untokened.length === 0,
      `app/layout.tsx points at ${untokened.join(", ")} rather than ${token}. Without the current token, every link already shared keeps showing the previous card.`,
    );
    // Every OTHER route, too. The built-output sweep can only see prerendered
    // pages, and this site's dynamic routes have none, so they are correct by
    // inheriting the root layout's metadata rather than by assertion. The
    // first route to set its own openGraph.images (a per-report card on
    // /example/[slug] is the obvious candidate) would drop the token with both
    // gates green, so the override itself is what gets caught.
    const overriding = repoFiles(ROOT)
      .filter((f) => f.startsWith("app/") && f.endsWith(".tsx") && f !== "app/layout.tsx")
      .filter((f) => /openGraph\s*:|twitter\s*:/.test(read(f)));
    check(
      overriding.length === 0,
      `${overriding.join(", ")} sets its own openGraph or twitter metadata. Those routes are not prerendered, so no built-output check can see them: give the card URL the same token app/layout.tsx uses, then add the file here.`,
    );
  }
}

// 6. The manifest diverges from the kit in exactly the declared ways, and
//    still tracks it everywhere else, so the next kit drop cannot quietly
//    absorb a change to the icon list or the display mode under this
//    exemption.
{
  const ours = readJson("public/site.webmanifest", "the web manifest");
  const kit = pin.kitManifest;
  check(ours.id === "/", "public/site.webmanifest: id should be /");
  check(ours.start_url === "/", "public/site.webmanifest: start_url should be /");
  check(
    ours.scope === "/",
    "public/site.webmanifest: scope should be /. Without it, scope follows whichever page the visitor installed from, and under display: standalone every other route then opens in the in-app browser bar.",
  );
  check(
    ours.name === "Foundry Skills" && ours.short_name === "Foundry",
    'public/site.webmanifest: the long name says what the product is ("Foundry Skills"), because an install prompt carries no site around it and "Foundry" alone collides with a well-known Ethereum toolchain among exactly this audience; the short name under the icon is the brand ("Foundry"). The kit ships a placeholder for both.',
  );
  for (const k of ["display", "theme_color", "background_color"]) {
    check(
      JSON.stringify(ours[k]) === JSON.stringify(kit[k]),
      `public/site.webmanifest: ${k} should still track the kit (${JSON.stringify(kit[k])}).`,
    );
  }
  check(
    JSON.stringify(ours.icons) === JSON.stringify(kit.icons),
    "public/site.webmanifest: the icon list should still track the kit.",
  );
  // The KEY SET, not nine named keys. Checking names one by one is a subset
  // check wearing a set check's clothes: a `shortcuts` entry pointing offsite,
  // or any other key the kit never had, shipped green. public/ and the kit's
  // web/ tree are both compared as sets above, and this file is the one
  // declared divergence, which makes it the last place that should be looser.
  // Keys this repo ADDS because the kit omits them, which is not the same as
  // keys whose VALUE diverges (name and short_name exist in the kit and are
  // asserted above). Listing the value divergences here too meant a kit
  // revision that DROPPED `short_name` was absorbed with no finding, while
  // dropping any other key was caught.
  const ADDED_KEYS = ["id", "start_url", "scope"];
  const allowedKeys = new Set([...Object.keys(kit), ...ADDED_KEYS]);
  const unexpected = Object.keys(ours).filter((k) => !allowedKeys.has(k));
  const missing = Object.keys(kit).filter((k) => !(k in ours));
  check(
    unexpected.length === 0,
    `public/site.webmanifest carries keys the kit does not and this repo has not declared: ${unexpected.join(", ")}. Add it to ADDED_KEYS in ${SELF} with a reason, or take it out.`,
  );
  check(
    missing.length === 0,
    `public/site.webmanifest is missing keys the kit ships: ${missing.join(", ")}.`,
  );
}

// 7. Polarity. The studio set and the foundry set are the same filenames with
//    inverted colours, so taking the wrong one is silent: either looks right
//    alone, and what breaks is that the two sites stop being distinguishable
//    in a row of tabs. This site's tile is ink with a bone mark.
{
  const icon = read("public/icon.svg");
  check(
    /<rect[^>]*fill="#14191F"/i.test(icon),
    "public/icon.svg is not the foundry tile (ink ground). The studio set is the inverse and belongs to the parent site.",
  );
  check(
    /<path[^>]*fill="#E8ECF0"/i.test(icon),
    "public/icon.svg does not carry a bone mark.",
  );
}

// 8. One kit version, claimed in one form. The kit's version used to live only
//    in prose in the parent repo, which is how the folder that delivered it
//    and its own MARK.md ended up claiming two different numbers with nothing
//    able to disagree.
{
  check(
    /^\d+\.\d+$/.test(pin.kit),
    `${PIN_PATH}: "kit" should be a bare version number.`,
  );
  for (const f of CLAIMANTS) {
    const claims = [...read(f).matchAll(/kit v(\d+\.\d+)/gi)].map((m) => m[1]);
    check(
      claims.length > 0,
      `${f} makes no "kit v${pin.kit}" claim. A kit bump has to touch every claimant; write the phrase where it says which kit is installed.`,
    );
    for (const c of claims) {
      check(
        c === pin.kit,
        `${f} claims kit v${c} while ${PIN_PATH} says ${pin.kit}. If that mention is history rather than a claim, write it without the "v".`,
      );
    }
  }
  // Derived, not declared: a file can be REMOVED from CLAIMANTS and the loop
  // above still passes on what remains, so a version claim appearing anywhere
  // else would be invisible.
  // scripts/lib/repo-files.mjs explains why this is tracked AND untracked, and
  // why it cannot be `git ls-files` without -z. This file exempts itself for
  // the same reason its sibling does: it is where the canonical claim form is
  // written down, so the first time someone quotes an example in this header
  // the gate would accuse itself.
  const tracked = repoFiles(ROOT).filter(
    (f) => f !== SELF && !/\.(png|ico|jpg|jpeg|woff2?)$/.test(f),
  );
  const unreadable = [];
  const claiming = tracked.filter((f) => {
    try {
      return /kit v\d+\.\d+/i.test(readFileSync(join(ROOT, f), "utf8"));
    } catch {
      unreadable.push(f);
      return false;
    }
  });
  check(
    unreadable.length === 0,
    `git lists files this gate cannot open, so they went unchecked: ${unreadable.join(", ")}`,
  );
  // A sweep over an empty list is green for the wrong reason, and its sibling
  // gate had this floor while this one did not, so a broken file listing
  // failed one gate and passed the other.
  check(
    tracked.length > 20,
    `only ${tracked.length} files swept for version claims; the repo listing looks broken.`,
  );
  const unexpected = claiming.filter((f) => !CLAIMANTS.includes(f));
  check(
    unexpected.length === 0,
    `${unexpected.join(", ")} makes a "kit vX.Y" claim without being a claimant in scripts/check-brand-assets.mjs. Add it there, or write the mention without the "v" if it is history.`,
  );
}

// 9. With a kit checkout in hand, check the PIN itself. Everything above
//    trusts the pin; this is the step that asks whether the pin still
//    describes the kit, which is what it is a proxy for.
if (kitArg) {
  const kitVersion = readFileSync(join(kitArg, "VERSION"), "utf8").trim();
  check(
    kitVersion === pin.kit,
    `the kit at ${kitArg} is v${kitVersion}; the pin records v${pin.kit}. Regenerate with --update --kit ${kitArg}.`,
  );
  const g = kitGeometry(kitArg);
  for (const cut of ["canonical", "small"]) {
    check(
      g[cut].viewBox === pin.geometry[cut].viewBox &&
        g[cut].d === pin.geometry[cut].d,
      `the pinned ${cut} geometry differs from the kit's ${g[cut].from}.`,
    );
  }
  for (const f of [...pin.files, ...pin.diverged, ...pin.reference]) {
    check(
      sha(join(kitArg, f.from)) === f.sha256,
      `the pinned digest for ${f.from} differs from the kit's file.`,
    );
  }
  // A SET, not a subset. Checking only the files the pin names means a kit
  // revision that adds or renames an asset is invisible: the pin still
  // matches, and the thing the kit now says this site should serve is not
  // there. web/ is the whole surface this repo takes from the kit.
  const tree = kitWebTree(kitArg);
  const pinned = pin.kitSet ?? {};
  const added = Object.keys(tree).filter((f) => !(f in pinned));
  const removed = Object.keys(pinned).filter((f) => !(f in tree));
  check(
    added.length === 0,
    `the kit's web/ tree has files the pin does not record: ${added.join(", ")}. Regenerate the pin and decide what this site takes from them.`,
  );
  check(
    removed.length === 0,
    `the pin records kit files that no longer exist: ${removed.join(", ")}.`,
  );
  for (const [f, digest] of Object.entries(tree)) {
    if (f in pinned) {
      check(
        pinned[f] === digest,
        `the kit's web/${f} differs from the pinned digest.`,
      );
    }
  }
  console.log(`Pin checked against the kit at ${kitArg} (v${kitVersion}), web/ tree included.`);
}

if (fail.length) {
  console.error("Brand asset check FAILED:");
  for (const m of fail) console.error(`  - ${m}`);
  process.exit(1);
}
console.log(
  `Brand assets match the pin: kit v${pin.kit}, ${pin.files.length} copied files, both cuts, the share card and its render.`,
);
if (!kitArg) {
  // Said out loud because it is the one thing this gate cannot do on its own.
  // CI has no kit on disk, so the default run compares the repo to a file in
  // the repo; only `make check-kit KIT=<path>` compares that file to the kit.
  console.log(
    "  (the pin itself was not checked against a kit in this run: run `make check-kit KIT=<path to logo/horizon-foundry-kit>`)",
  );
}
