#!/usr/bin/env node
// "Remove every trace of the retired mark" is an invariant, not a checklist,
// so it is asserted over what the site SERVES rather than by grepping the
// source once. The failure this exists to stop is the half-swap: the old
// drawing surviving in the one place nobody renders in review.
//
// It requires `npm run build` to have run, and it FAILS rather than skipping
// when the output is missing or stale: a gate that quietly skips is a gate
// that is green for the wrong reason.
//
// The first version of this file swept only `.next/server/app`, `.next/static`
// and `public/`, and an adversarial pass took it apart. Everything below that
// looks over-scoped was earned by a demonstrated hole, so each is labelled
// with what got through:
//
//   * Not every route prerenders. The ones that render on demand have no
//     built HTML for a page-level check to read, and their component code
//     compiles into `.next/server/chunks/ssr/`, which was swept by nothing: a
//     retired mark added to `app/skills/[slug]/page.tsx` built green, then
//     served 200 with the retired path in the HTML. The sweep now reads all
//     of `.next/server`.
//   * `scripts/og/card.html` is a served asset's SOURCE and no sweep read it,
//     so the retired mark could sit in a tracked file, green. The sweep now
//     covers tracked and untracked source too, which is the general form of
//     that hole.
//   * The freshness check watched `app`, `components` and `lib`, which is 3 of
//     about 7 build inputs. A retired mark appended to BRAND.md (rendered by
//     /behind/brand) was green before a build and red after it, meaning
//     `make validate` passed the exact tree a deploy would ship broken. It now
//     watches everything the repo tracks.
//   * Placement counts covered 4 of 8 prerendered pages and the <symbol> defs
//     were asserted on one page, so three served pages could render no mark at
//     all, green. Every page is now checked, against a default expectation.
//
// Three limits remain, stated rather than implied:
//
//   * The sweep keys on two string literals, so a re-EXPORT of the retired
//     mark with the same geometry written as different numbers would pass. A
//     copy of the old file would not. Detecting the shape rather than the
//     string is the real fix and is not attempted here.
//   * The rendered share card is a PNG this sweep cannot read. It is covered
//     by scripts/check-brand-assets.mjs, which pins the PNG's own digest.
//   * Because the source half sweeps the repo, no file here may carry the
//     retired literals except this one. That is stricter than it sounds: a
//     retirement note quoting the old path, which is a reasonable thing to
//     want, would fail. Write such a note about the mark without quoting its
//     geometry, or add the file to an exemption here and say why.
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { repoFiles as listRepoFiles } from "./lib/repo-files.mjs";

const ROOT = process.cwd();

// The retired mark, drawn before 2026-09-19. These two literals are the only
// deliberate occurrences left in the repo, which is why this file exempts
// itself from the source sweep below.
const RETIRED_PATH = "M98 165.5";
const RETIRED_VIEWBOX = "0 0 414 274";
const SELF = "scripts/check-built-mark.mjs";

// Guarded, and reported as a finding rather than a stack trace: a truncated or
// hand-edited record used to crash with a SyntaxError that named no file, in a
// gate whose whole stance is that a failure says what is wrong.
function readJson(rel, what) {
  try {
    return JSON.parse(readFileSync(join(ROOT, rel), "utf8"));
  } catch (e) {
    console.error(
      `Built-output check FAILED:\n  - ${rel} (${what}) could not be read as JSON: ${e.message}`,
    );
    process.exit(1);
  }
}
// A record that parses but is missing a field is the same problem one keystroke
// later, and `pin.geometry.small.viewBox` on an older pin threw a TypeError
// naming nothing. Every field these gates read is required here, once.
function requireKeys(obj, rel, what, paths) {
  const missing = paths.filter((path) =>
    path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj) === undefined,
  );
  if (missing.length) {
    console.error(
      `Built-output check FAILED:\n  - ${rel} (${what}) is missing ${missing.join(", ")}. Regenerate it: the pin with \`node scripts/check-brand-assets.mjs --update --kit <path>\`, the card's digests with \`make og-card\`.`,
    );
    process.exit(1);
  }
  return obj;
}
const pin = requireKeys(
  readJson("reference/brand-kit.json", "the design-kit pin"),
  "reference/brand-kit.json",
  "the design-kit pin",
  ["geometry.canonical.viewBox", "geometry.canonical.d", "geometry.small.viewBox", "geometry.small.d"],
);
const readRendered = () =>
  requireKeys(
    readJson("scripts/og/rendered.json", "the share card's digests"),
    "scripts/og/rendered.json",
    "the share card's digests",
    ["source", "render"],
  );

const fail = [];
const check = (ok, message) => {
  if (!ok) fail.push(message);
};

const TEXT = /\.(html|svg|json|webmanifest|js|mjs|cjs|css|txt|xml|rsc|map|md|ts|tsx)$/;

function filesUnder(dir, filter, skipDir = () => false) {
  let out = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (!skipDir(p, e.name)) out = out.concat(filesUnder(p, filter, skipDir));
    } else if (filter(e.name)) out.push(p);
  }
  return out;
}

const repoFiles = () => listRepoFiles(ROOT);

// What the BUILD reads, as opposed to what the repo carries. Everything not
// excluded here is treated as a build input, so the asymmetry is deliberate:
// excluding too little costs a rebuild nobody needed, excluding too much makes
// the sweep blind to the exact class of change it exists to catch. Only
// exclusions that can be argued belong here.
//
// The markdown half is DERIVED rather than listed: lib/docs.ts decides which
// documents the site renders, so any root markdown outside its allowlist is
// not a build input. If that parse ever fails, every markdown file counts as
// an input, which is the safe direction.
// Strict or nothing. The first version sliced to the first `]` after the
// declaration and returned whatever string literals it found, so a partial
// parse was indistinguishable from a complete one: a comment containing `]`
// inside the literal (`readDoc[name]` in a sentence about `app/behind/[tab]`)
// truncated the list and quietly dropped BRAND.md and DESIGN.md from the
// build-input set, which is the exact blindness this check exists to remove.
// Now the whole literal has to be a plain list of quoted .md names, or the
// answer is null and every markdown file counts as an input.
function renderedDocs() {
  try {
    const src = readFileSync(join(ROOT, "lib/docs.ts"), "utf8");
    const m = src.match(/const ALLOWED\s*=\s*new Set\(\[([\s\S]*?)\]\)/);
    if (!m) return null;
    const body = m[1].replace(/\/\/[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "");
    // Anything that is not a quoted .md name, a comma or whitespace means the
    // list is computed (a spread, a constant, a template) and this parse
    // cannot claim to know what is in it.
    if (!/^(\s*"[^"]+\.md"\s*,?)+\s*$/.test(body)) return null;
    const names = [...body.matchAll(/"([^"]+\.md)"/g)].map((x) => x[1]);
    return names.length ? names : null;
  } catch {
    return null;
  }
}

function isBuildInput(f, rendered) {
  // Nothing under app/, components/ or lib/ imports from scripts/ (checked),
  // public/ is served straight off disk and swept from disk, and the rest is
  // repo housekeeping the bundler never opens.
  if (/^(scripts|public|tmp|\.github|\.impeccable)\//.test(f)) return false;
  if (f === ".gitignore" || f === "LICENSE") return false;
  // The gates' own record of what was taken from the design kit. Read by the
  // two scripts, never by the bundler.
  if (f === "reference/brand-kit.json") return false;
  if (f.endsWith(".md")) {
    if (rendered === null) return true;
    return rendered.includes(f) || f.includes("/");
  }
  return true;
}

const APP_OUT = join(ROOT, ".next/server/app");
if (!existsSync(APP_OUT)) {
  console.error(
    "Built-output check FAILED: .next/server/app is missing. Run `npm run build` before `make validate`.",
  );
  process.exit(1);
}

const htmlPages = filesUnder(APP_OUT, (n) => n.endsWith(".html"));
check(
  htmlPages.length > 3,
  `only ${htmlPages.length} prerendered pages found; the build looks incomplete.`,
);

// Freshness. .next/ is gitignored, so it survives every branch switch and can
// carry over from whatever was last built; a stale build makes this whole
// sweep blind to exactly the class of defect it exists for. The source set is
// everything the repo carries, not an enumeration of build inputs: the
// enumeration was the bug (the markdown docs, skills/ and reports/ are all
// read at build time and none of them were on the old list).
{
  const built = statSync(join(APP_OUT, "index.html")).mtimeMs;
  const rendered = renderedDocs();
  let newest = { path: "", mtime: 0 };
  const unreadable = [];
  for (const f of repoFiles()) {
    if (!isBuildInput(f, rendered)) continue;
    let m;
    try {
      m = statSync(join(ROOT, f)).mtimeMs;
    } catch {
      // Never swallowed. A path git lists and the filesystem will not open is
      // a file outside every sweep below, which is the failure this gate is
      // least able to survive quietly.
      unreadable.push(f);
      continue;
    }
    if (m > newest.mtime) newest = { path: f, mtime: m };
  }
  check(
    unreadable.length === 0,
    `git lists files this gate cannot open, so they are outside every sweep: ${unreadable.join(", ")}`,
  );
  check(
    built > newest.mtime,
    `.next/ is older than ${newest.path}, which the build reads: run \`npm run build\` before \`make validate\`. (Editing docs the site does not render, anything under scripts/ or public/, or repo housekeeping does not require a rebuild.)`,
  );
}

// 1. The sweep. Two halves, because the retired mark has two ways to hide.
{
  // (a) Everything the build emits. `.next/server` matters as much as
  //     `.next/server/app`: the components that render on demand compile into
  //     `.next/server/chunks/ssr/`, and those routes have no prerendered HTML
  //     for any page-level check to read. `.next/standalone` is what the
  //     Docker image actually runs, so it is swept too, minus its vendored
  //     node_modules. `.next/cache` and `.next/dev` are local scratch that no
  //     deploy serves; they are excluded so a stale dev cache cannot fail a
  //     gate about production. The cost is real and worth naming: a
  //     `.next/dev` left over from before a mark change can serve the retired
  //     mark under `next dev` while this gate is green. Clear it after a swap.
  const skipBuildDir = (p, name) =>
    name === "node_modules" || name === "cache" || name === "dev";
  const built = [
    ...filesUnder(join(ROOT, ".next/server"), (n) => TEXT.test(n), skipBuildDir),
    ...filesUnder(join(ROOT, ".next/static"), (n) => TEXT.test(n), skipBuildDir),
    ...filesUnder(join(ROOT, ".next/standalone"), (n) => TEXT.test(n), skipBuildDir),
    ...filesUnder(join(ROOT, "public"), (n) => TEXT.test(n), skipBuildDir),
  ];
  // (b) The source. A served asset's source can carry the retired mark while
  //     every built artifact is clean, which is exactly what scripts/og/
  //     card.html demonstrated.
  const source = repoFiles().filter((f) => f !== SELF && TEXT.test(f));

  // A sweep over an empty list is green for the wrong reason.
  check(built.length > 20, `only ${built.length} built text files swept.`);
  check(source.length > 20, `only ${source.length} source text files swept.`);

  const unreadable = [];
  for (const f of [...built, ...source.map((f) => join(ROOT, f))]) {
    // This file's own constants, wherever they turn up. They turn up twice:
    // here, and inside .next/standalone, because lib/docs.ts reads the repo's
    // markdown at runtime and Next's tracer answers dynamic filesystem access
    // by copying the whole project into the bundle (the build says so). That
    // is worth knowing on its own: the deployed artifact carries this repo's
    // source, so a retired mark in any source file ships even when no page
    // renders it, which is why the source half of this sweep exists.
    if (f.endsWith(SELF)) continue;
    let text;
    try {
      text = readFileSync(f, "utf8");
    } catch {
      // A file that cannot be read is a file that was not swept, and a sweep
      // that skips silently is the thing this gate exists not to be.
      unreadable.push(f.replace(`${ROOT}/`, ""));
      continue;
    }
    const rel = f.replace(`${ROOT}/`, "");
    check(!text.includes(RETIRED_PATH), `${rel} still carries the retired mark path.`);
    check(
      !text.includes(RETIRED_VIEWBOX),
      `${rel} still carries the retired mark viewBox.`,
    );
  }
  check(
    unreadable.length === 0,
    `these files were listed but could not be read, so they were not swept: ${unreadable.join(", ")}`,
  );
}

// 2. Absence is half the invariant. Asserting only what is gone passes on a
//    site that renders no mark at all, and asserting that the <symbol> defs
//    shipped proves only that the defs block shipped: breaking every <use>
//    (so each mark renders an empty svg) would pass that. So assert, on every
//    prerendered page: the defs are there, every <use> points at one of them,
//    and the cut each surface asks for is the one its size requires.
//
//    Counts are exact, and every page is covered by a DEFAULT rather than an
//    enumeration, because the enumeration was itself the hole: the pages left
//    off the list could lose their marks entirely and stay green. A page that
//    gains a placement has to come here and say so.
{
  const SYMBOLS = { "hf-mark": "canonical", "hf-mark-small": "small" };
  // Chrome only: the header lockup and the footer lockup, both at h-5 (31px
  // wide, under the kit's 48px floor).
  const DEFAULT = { "hf-mark": 0, "hf-mark-small": 2 };
  const EXPECTED = {
    // The chrome, plus the deck's title slide at h-12 (74px wide).
    "behind.html": { "hf-mark": 1, "hf-mark-small": 2 },
    // The chrome, plus the two specimens on the design-system page, each
    // rendered at a size its own cut is correct for. If that page ever shows
    // the small cut large to make the difference visible, it breaks the rule
    // it documents, and this count is where that shows up.
    "behind/design-system.html": { "hf-mark": 1, "hf-mark-small": 3 },
    // Next's global error boundary replaces the root layout, chrome included.
    "_global-error.html": { "hf-mark": 0, "hf-mark-small": 0 },
  };

  for (const f of htmlPages) {
    const rel = f.replace(`${join(ROOT, ".next/server/app")}/`, "");
    const html = readFileSync(f, "utf8");
    const counts = EXPECTED[rel] ?? DEFAULT;
    const refs = [...html.matchAll(/<use href="#([^"]+)"/g)].map((m) => m[1]);

    for (const [id, n] of Object.entries(counts)) {
      const got = refs.filter((r) => r === id).length;
      check(
        got === n,
        `${rel} references ${id} ${got} times, expected ${n}. If a placement moved, change the expectation in ${SELF} deliberately; if every mark went blank, this is why you are reading it.`,
      );
      // A reference with no definition on the same page renders an empty svg.
      if (n > 0) {
        const cut = SYMBOLS[id];
        check(
          html.includes(`<symbol id="${id}" viewBox="${pin.geometry[cut].viewBox}"`),
          `${rel} references ${id} but does not define it with the pinned ${cut} viewBox. Each cut travels with its own box; sharing one clips the art.`,
        );
        check(
          html.includes(pin.geometry[cut].d),
          `${rel} references ${id} but the pinned ${cut} path is not on the page.`,
        );
      }
    }
    // Anything referenced that this file does not know about. The previous
    // version matched only the two known ids, so a <use> pointing at a symbol
    // that does not exist was neither counted nor reported.
    for (const r of refs) {
      check(
        Object.hasOwn(SYMBOLS, r),
        `${rel} has <use href="#${r}">, which is not one of the defined mark symbols.`,
      );
    }
  }
}

// 3. The icon set, on every page including 404: a 404 is a real page people
//    land on. Whole tags, not prefixes, because a prefix check let the .ico's
//    sizes hint be dropped in the parent repo, and that hint is what makes
//    Chrome prefer the SVG icon over it. The silent failure this guards is
//    Next's `icons` metadata key replacing every convention-generated tag: the
//    build succeeds and the tags are simply absent.
{
  const manifest = readJson("public/site.webmanifest", "the web manifest");
  const TAGS = [
    '<link rel="manifest" href="/site.webmanifest"/>',
    '<link rel="icon" href="/favicon.ico" sizes="48x48" type="image/x-icon"/>',
    '<link rel="icon" href="/icon.svg" type="image/svg+xml"/>',
    '<link rel="apple-touch-icon" href="/apple-touch-icon.png"/>',
    // Ink, always: Safari tints a monochrome mask against the tab bar, so it
    // follows the mark, not the tile.
    '<link rel="mask-icon" href="/safari-pinned-tab.svg" color="#14191F"/>',
  ];
  // _global-error.html is the one page that legitimately has none of this:
  // Next's global error boundary replaces the root layout entirely, including
  // its <html> and <head>. It is still swept for the retired mark above.
  for (const f of htmlPages.filter((p) => !p.endsWith("_global-error.html"))) {
    const html = readFileSync(f, "utf8");
    const rel = f.replace(`${ROOT}/`, "");
    for (const tag of TAGS) {
      check(html.includes(tag), `${rel} is missing ${tag}`);
    }
    check(
      html.includes(`<meta name="theme-color" content="${manifest.theme_color}"/>`),
      `${rel} theme-color disagrees with the manifest (${manifest.theme_color}).`,
    );
  }
  // The share card's URL carries a version token so a re-render is a new URL
  // to the scrapers that cache by URL and ignore cache headers. Without it,
  // every link already shared keeps the old card forever.
  //
  // Asserted per TAG and per PAGE, not as one `includes` on the home page. A
  // single containment check was satisfied by either tag alone, so dropping
  // the token from `twitter:image` (X is the reason the token exists at all)
  // passed; and every prerendered page inherits these from the root layout,
  // so checking one page checked an eighth of the surface.
  const token = `/og.png?v=${readRendered().render.slice(0, 8)}`;
  // The ORIGIN as well as the path. A suffix check passes on any host, and
  // this site deliberately runs two (SITE_URL and fly.toml's SITE_ORIGIN
  // disagree through the launch tail), which is exactly when a share card
  // pointing at the wrong one is plausible.
  const siteUrl = readFileSync(join(ROOT, "app/layout.tsx"), "utf8").match(/const SITE_URL = "([^"]+)"/)?.[1];
  check(siteUrl !== undefined, "app/layout.tsx no longer declares SITE_URL where this gate reads it.");
  for (const f of htmlPages.filter((p) => !p.endsWith("_global-error.html"))) {
    const html = readFileSync(f, "utf8");
    const rel = f.replace(`${ROOT}/`, "");
    for (const [tag, re] of [
      ["og:image", /<meta property="og:image" content="([^"]*)"/],
      ["twitter:image", /<meta name="twitter:image" content="([^"]*)"/],
    ]) {
      const url = html.match(re)?.[1];
      check(url !== undefined, `${rel} has no ${tag} tag.`);
      if (url !== undefined) {
        check(
          siteUrl === undefined || url.startsWith(`${siteUrl}/`),
          `${rel}'s ${tag} is ${url}, which is not on ${siteUrl}.`,
        );
        check(
          url.endsWith(token),
          `${rel}'s ${tag} is ${url}, which does not end in the current render's token (${token}). Re-rendering the card without changing its URL leaves every link already shared showing the old image.`,
        );
      }
    }
  }
}

if (fail.length) {
  console.error("Built-output check FAILED:");
  for (const m of fail) console.error(`  - ${m}`);
  process.exit(1);
}
const withChrome = htmlPages.filter((p) => !p.endsWith("_global-error.html")).length;
console.log(
  `Built output clean: ${withChrome} of ${htmlPages.length} prerendered pages carry the current mark in the cut their size requires, the full icon set and the current share-card token (the other is Next's global error boundary, which replaces the root layout and is asserted to carry none of them), and no trace of the retired mark in the build, in what the image ships, or in source.`,
);
