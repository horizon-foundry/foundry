#!/usr/bin/env node
// "The retired identity is gone" is an invariant, not a checklist, so it is
// asserted over what the site SERVES and not by grepping the source once. The
// failure this exists to stop is the half-swap: the old drawing, the old
// display face or an amber command surviving in the one place nobody renders
// in review.
//
// The identity changed on 2026-11-27 ("the dark instrument"). This gate holds
// the built site to the new one and fails on the old one:
//
//   * the mark is the HF monogram, whole, inside the product lockup, on every
//     prerendered page; the angular mountain mark is in nothing the build
//     emits and in no source file;
//   * the display face is Zalando Sans; Archivo Black is in no stylesheet, no
//     font file name, no chunk and no page;
//   * amber only ever fills a bar: no rule, utility or inline style sets it
//     on type, a border, an outline or a wash, and every amber fill on a page
//     is the mark's bar or the unit bar.
//
// The rules themselves live in scripts/lib/brand-rules.mjs, and
// scripts/test/brand-rules.test.mjs proves each one fails on the retired
// identity by every route it could take.
//
// It requires `npm run build` to have run, and it FAILS when the output is
// missing or stale: a gate that quietly skips is a gate that is green for the
// wrong reason.
//
// Everything below that looks over-scoped was earned by a demonstrated hole:
//
//   * Not every route prerenders. The ones that render on demand have no
//     built HTML for a page-level check to read, and their component code
//     compiles into `.next/server/chunks/ssr/`. So the sweeps read all of
//     `.next/server`, not only `.next/server/app`.
//   * `scripts/og/card.html` is a served asset's SOURCE and no build output
//     carries it, so the retired-mark sweep covers tracked and untracked
//     source too.
//   * The freshness check watches everything the repo tracks, because
//     skills/, reference/ and reports/ are all read at build time.
//   * Placement counts cover EVERY prerendered page by a default, because an
//     enumeration left pages that could lose their marks and stay green.
//
// Limits, stated and not implied:
//
//   * The retired-mark sweep keys on string literals, so a re-EXPORT of an
//     old mark with the same geometry written as different numbers would
//     pass. A copy of the old file would not.
//   * The rendered share card is a PNG this sweep cannot read. It is covered
//     by scripts/check-brand-assets.mjs, which pins the PNG's own digest and
//     holds its source to the mark, the lockup and the published verdict.
//   * A hand-written amber that is neither the hex nor one of the two theme
//     variables (an rgb() spelling, a near-amber) is not found.
//   * No file here may carry a retired mark's geometry except
//     scripts/lib/brand-rules.mjs. Write a retirement note about the mark
//     without quoting its path.
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { repoFiles as listRepoFiles } from "./lib/repo-files.mjs";
import {
  retiredMarkHits,
  archivoHits,
  amberMisuseInCss,
  amberMisuseInMarkup,
  amberFills,
} from "./lib/brand-rules.mjs";

const ROOT = process.cwd();

const SELF = "scripts/check-built-mark.mjs";
// The one file allowed to carry a retired mark's geometry: it is where the
// retired marks are named. It is skipped by its path's ending, so a copy of
// it inside .next/standalone is skipped too. Next's tracer put one there
// while lib/docs.ts read the repo's root markdown at runtime; since that
// file was cut (2026-11-28) the bundle holds only skills/, reference/,
// reports/ and VERSION.
const RULES = "scripts/lib/brand-rules.mjs";

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
  readJson("reference/brand-kit.json", "the brand pin"),
  "reference/brand-kit.json",
  "the brand pin",
  [
    "geometry.mark.viewBox",
    "geometry.mark.bar",
    "geometry.mark.body",
    "geometry.unitBar.d",
    "files",
  ],
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
// The markdown half: the site renders no root markdown. The hub that rendered
// PRODUCT.md and BRAND.md was cut on 2026-11-28, and lib/docs.ts, whose
// allowlist this gate used to derive the rendered set from, went with it. So
// root markdown is not a build input. Markdown under a directory is: the
// skill pages read skills/, and the readiness map reads reference/. A page
// that starts reading a root markdown file names it here in the same change,
// or this check is blind to it.
const RENDERED_ROOT_DOCS = [];

function isBuildInput(f) {
  // Nothing under app/, components/ or lib/ imports from scripts/ (checked),
  // public/ is served straight off disk and swept from disk, and the rest is
  // repo housekeeping the bundler never opens.
  if (/^(scripts|public|tmp|\.github|\.impeccable)\//.test(f)) return false;
  if (f === ".gitignore" || f === "LICENSE") return false;
  // The gates' own record of what was taken from the design kit. Read by the
  // two scripts, never by the bundler.
  if (f === "reference/brand-kit.json") return false;
  if (f.endsWith(".md")) return f.includes("/") || RENDERED_ROOT_DOCS.includes(f);
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
// enumeration was the bug (skills/, reference/ and reports/ are all read at
// build time and none of them were on the old list).
{
  const built = statSync(join(APP_OUT, "index.html")).mtimeMs;
  let newest = { path: "", mtime: 0 };
  const unreadable = [];
  for (const f of repoFiles()) {
    if (!isBuildInput(f)) continue;
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

// 1. The retired marks. Two halves, because a mark has two ways to hide.
{
  // (a) Everything the build emits. `.next/server` matters as much as
  //     `.next/server/app`: the components that render on demand compile into
  //     `.next/server/chunks/ssr/`, and those routes have no prerendered HTML
  //     for any page-level check to read. `.next/standalone` is what the
  //     Docker image actually runs, so it is swept too, minus its vendored
  //     node_modules. `.next/cache` and `.next/dev` are local scratch that no
  //     deploy serves; they are excluded so a stale dev cache cannot fail a
  //     gate about production. The cost is real and worth naming: a
  //     `.next/dev` left over from before the mark changed can serve the
  //     retired mark under `next dev` while this gate is green. Clear it
  //     after a swap.
  const skipBuildDir = (p, name) =>
    name === "node_modules" || name === "cache" || name === "dev";
  const built = [
    ...filesUnder(join(ROOT, ".next/server"), (n) => TEXT.test(n), skipBuildDir),
    ...filesUnder(join(ROOT, ".next/static"), (n) => TEXT.test(n), skipBuildDir),
    ...filesUnder(join(ROOT, ".next/standalone"), (n) => TEXT.test(n), skipBuildDir),
    ...filesUnder(join(ROOT, "public"), (n) => TEXT.test(n), skipBuildDir),
  ];
  // (b) The source. A served asset's source can carry a retired mark while
  //     every built artifact is clean, which is what scripts/og/card.html
  //     demonstrated.
  const source = repoFiles().filter((f) => TEXT.test(f));

  // A sweep over an empty list is green for the wrong reason.
  check(built.length > 20, `only ${built.length} built text files swept.`);
  check(source.length > 20, `only ${source.length} source text files swept.`);

  const unreadable = [];
  for (const f of [...built, ...source.map((f) => join(ROOT, f))]) {
    if (f.endsWith(RULES)) continue;
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
    for (const name of retiredMarkHits(text)) {
      check(false, `${rel} still carries ${name}.`);
    }
  }
  check(
    unreadable.length === 0,
    `these files were listed but could not be read, so they were not swept: ${unreadable.join(", ")}`,
  );
  // The retired icon set, by name. The files carried the mountain mark, and
  // a PNG or an .ico is outside a text sweep.
  const RETIRED_FILES = [
    "favicon.ico",
    "icon.svg",
    "safari-pinned-tab.svg",
    "apple-touch-icon.png",
    "favicon-16x16.png",
    "favicon-32x32.png",
    "favicon-48x48.png",
    "android-chrome-192x192.png",
    "android-chrome-512x512.png",
    "maskable-icon-512x512.png",
  ];
  for (const dir of ["public", ".next/standalone/public"]) {
    for (const name of RETIRED_FILES) {
      check(
        !existsSync(join(ROOT, dir, name)),
        `${dir}/${name} is a file of the retired icon set, which carried the mountain mark.`,
      );
    }
  }
}

// 2. Absence is half the invariant. Asserting only what is gone passes on a
//    site that renders no mark at all. So assert, on every prerendered page:
//    the HF mark is there, WHOLE (its own viewBox, the amber bar's path first
//    in the literal amber, then the body's path in Bone or Ink, and nothing
//    else inside the svg), and the product lockup's words stand beside it.
//
//    Counts are exact, and every page is covered by a DEFAULT and not an
//    enumeration, because the enumeration was itself the hole: the pages left
//    off the list could lose their marks entirely and stay green. A page that
//    gains a placement has to come here and say so.
{
  const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const G = pin.geometry.mark;
  const WHOLE_MARK = new RegExp(
    `<svg viewBox="${esc(G.viewBox)}"[^>]*><path d="${esc(G.bar)}" fill="#D99A2E"></path><path d="${esc(G.body)}" fill="var\\(--color-(?:bone|ink)\\)"></path></svg>`,
    "g",
  );
  const ANY_MARK_BOX = new RegExp(`<svg viewBox="${esc(G.viewBox)}"`, "g");
  const LOCKUP_WORDS = /<span[^>]*class="lockup-word"[^>]*>Foundry Skills<\/span>/g;
  // The chrome: the header sets the lockup at two sizes (one is drawn, by
  // width) and the footer sets it once.
  const DEFAULT = { marks: 3, lockups: 3 };
  const EXPECTED = {
    // The chrome, plus the design-system page's specimens: the lockup at its
    // two chrome sizes, and the mark alone.
    "design-system.html": { marks: 6, lockups: 5 },
    // Next's global error boundary replaces the root layout, chrome included.
    "_global-error.html": { marks: 0, lockups: 0 },
  };

  for (const f of htmlPages) {
    const rel = f.replace(`${join(ROOT, ".next/server/app")}/`, "");
    const html = readFileSync(f, "utf8");
    const want = EXPECTED[rel] ?? DEFAULT;
    const marks = (html.match(WHOLE_MARK) ?? []).length;
    const boxes = (html.match(ANY_MARK_BOX) ?? []).length;
    const lockups = (html.match(LOCKUP_WORDS) ?? []).length;
    check(
      marks === want.marks,
      `${rel} draws the HF mark ${marks} times, expected ${want.marks}. If a placement moved, change the expectation in ${SELF} deliberately; if the mark went missing or was replaced, this is why you are reading it.`,
    );
    check(
      boxes === marks,
      `${rel} has ${boxes} svg(s) in the mark's viewBox and ${marks} whole mark(s). The mark is two paths, the amber bar then the body, and is never cropped, recolored or redrawn.`,
    );
    check(
      lockups === want.lockups,
      `${rel} sets the lockup's words ${lockups} times, expected ${want.lockups}. The lockup is the mark, then FOUNDRY SKILLS in Zalando Sans Black capitals (components/brand/ProductLockup.tsx).`,
    );
  }
}

// 3. The icon set, on every page including 404: a 404 is a real page people
//    land on. Whole tags, not prefixes. The silent failure this guards is
//    Next's `icons` metadata key replacing every convention-generated tag:
//    the build succeeds and the tags are simply absent. The files are the
//    company's own, and each tag's file must be a pinned copy.
{
  const manifest = readJson("public/site.webmanifest", "the web manifest");
  const TAGS = [
    '<link rel="manifest" href="/site.webmanifest"/>',
    '<link rel="icon" href="/favicon.svg" type="image/svg+xml"/>',
    '<link rel="icon" href="/favicon-16.png" sizes="16x16" type="image/png"/>',
    '<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png"/>',
    '<link rel="icon" href="/favicon-48.png" sizes="48x48" type="image/png"/>',
    '<link rel="apple-touch-icon" href="/apple-touch-icon-180.png" sizes="180x180"/>',
  ];
  const pinned = new Set(pin.files.map((f) => f.path));
  for (const tag of TAGS.slice(1)) {
    const href = tag.match(/href="\/([^"]+)"/)[1];
    check(pinned.has(`public/${href}`), `${SELF} expects a tag for /${href}, which the pin does not hold.`);
  }
  // _global-error.html is the one page that legitimately has none of this:
  // Next's global error boundary replaces the root layout entirely, including
  // its <html> and <head>. It is still swept for the retired identity.
  for (const f of htmlPages.filter((p) => !p.endsWith("_global-error.html"))) {
    const html = readFileSync(f, "utf8");
    const rel = f.replace(`${ROOT}/`, "");
    for (const tag of TAGS) {
      check(html.includes(tag), `${rel} is missing ${tag}`);
    }
    // The retired set's tags. A mask-icon cannot keep the amber bar, and the
    // .ico and icon.svg carried the mountain mark.
    for (const old of ['rel="mask-icon"', 'href="/favicon.ico"', 'href="/icon.svg"', 'href="/apple-touch-icon.png"']) {
      check(!html.includes(old), `${rel} still declares a retired icon (${old}).`);
    }
    const icons = [...html.matchAll(/<link rel="(?:icon|apple-touch-icon|shortcut icon)"[^>]*>/g)];
    check(
      icons.length === TAGS.length - 1,
      `${rel} declares ${icons.length} icon tags, expected ${TAGS.length - 1}. An extra one is a file the company's set does not hold.`,
    );
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
  // this site answers on two hosts (the canonical one and the fly.dev one,
  // which redirects its sign-in pages), which is exactly when a share card
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

// 4. The monochrome rule, asserted in the ARTIFACT rather than in source.
//    DESIGN.md allows no colour outside the palette and the severity and
//    verdict hues, and source obeyed it while the shipped stylesheet did
//    not: Tailwind auto-detection scanned the repo's prose, so `.text-red-600`
//    was regenerated from a published audit report quoting another product's
//    classes, and `.backdrop-blur` from the changelog entry describing its own
//    removal. No source sweep can see that, which is why it survived two
//    audits. Source scanning is now scoped (app/globals.css), and this is the
//    check that says so.
{
  const PALETTE =
    /\.(?:text|bg|border|ring|from|via|to|fill|stroke|outline|decoration|shadow|accent|caret|divide|placeholder)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}(?![\w-])/g;
  //    The class-name pattern alone is not enough, and an adversarial pass
  //    proved it: 13 of 16 real emitted forms walked straight past it, because
  //    the class name is only bare in the simplest case. Every variant puts
  //    something in front of it (`.hover\:text-red-600`, `.sm\:text-red-600`
  //    inside a media query, `.group-hover\:…:is(…)`, an arbitrary variant),
  //    and several utilities put something in the middle
  //    (`.border-t-red-600`, `.ring-offset-red-500`). What every one of them
  //    shares is that it resolves to `var(--color-<palette>-<n>)`, which pulls
  //    that custom property into the emitted theme layer. So the VARIABLE is
  //    the assertion that holds, and the class pattern stays only because it
  //    names the offending selector in the failure message, which is what
  //    makes the failure actionable.
  //
  //    Stated gap, deliberately not papered over: a hand-written `#dc2626` or
  //    `oklch(57.7% .245 27.325)` is the same monochrome violation with no
  //    class and no variable to find. Nothing here catches it. Enumerating
  //    every non-brand hex would mean listing the brand's own values and
  //    failing on anything else, which is a different and much larger check.
  const PALETTE_VAR =
    /--color-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}(?![\w-])/g;
  const sheets = filesUnder(join(ROOT, ".next/static"), (n) => n.endsWith(".css"));
  check(sheets.length > 0, "no built stylesheet found to check.");
  for (const f of sheets) {
    const css = readFileSync(f, "utf8");
    const rel = f.replace(`${ROOT}/`, "");
    const classes = [...new Set(css.match(PALETTE) ?? [])];
    const vars = [...new Set(css.match(PALETTE_VAR) ?? [])];
    check(
      classes.length === 0 && vars.length === 0,
      `${rel} ships numbered Tailwind palette colour (${[...classes, ...vars].join(", ")}). The palette is the company's four values, three support values and the severity and verdict hues, and nothing else. If it came from prose and not from a component, the source scope in app/globals.css is what to fix.`,
    );
  }
}

// 5. The display face. Zalando Sans is the company's one family, and the
//    face this site retired is in nothing the build emits: no stylesheet, no
//    chunk, no page, no font file name. .next/standalone is left out: it
//    holds a copy of skills/ and reference/, where the retired face may be
//    named as history, and its build output is the same as the two trees
//    read here.
// 6. Amber only ever fills a bar. In the built stylesheets no rule sets it on
//    type, a border, an outline, a decoration or a shadow, in a mix, or
//    behind an alias. In pages and chunks no utility and no inline style does
//    either. On every prerendered page each amber fill is the mark's bar or
//    the unit bar, by its path.
{
  const skipBuildDir = (p, name) =>
    name === "node_modules" || name === "cache" || name === "dev";
  const MARKUP = /\.(html|js|mjs|cjs|rsc|json|txt)$/;
  const trees = [join(ROOT, ".next/server"), join(ROOT, ".next/static")];
  const every = trees.flatMap((t) => filesUnder(t, () => true, skipBuildDir));
  const sheets = every.filter((f) => f.endsWith(".css"));
  const markup = every.filter((f) => MARKUP.test(f));
  check(sheets.length > 0, "no built stylesheet found to hold to the amber rule.");
  check(markup.length > 20, `only ${markup.length} built pages and chunks swept for the retired identity.`);

  for (const f of every) {
    const rel = f.replace(`${ROOT}/`, "");
    check(
      archivoHits(rel).length === 0,
      `${rel}: a built file is named for the retired display face. lib/fonts.ts should load Zalando Sans and IBM Plex Mono only.`,
    );
  }
  for (const f of sheets) {
    const css = readFileSync(f, "utf8");
    const rel = f.replace(`${ROOT}/`, "");
    check(
      archivoHits(css).length === 0,
      `${rel} names the retired display face. The display face is Zalando Sans Black.`,
    );
    for (const hit of amberMisuseInCss(css)) {
      check(false, `${rel}: amber outside a fill: ${hit}. Amber only ever fills a bar: never text, a border or a wash.`);
    }
  }
  check(
    sheets.some((f) => /@font-face\{[^}]*zalando/i.test(readFileSync(f, "utf8"))),
    "no built stylesheet declares a Zalando Sans @font-face. It is the display face and the text face.",
  );
  for (const f of markup) {
    const text = readFileSync(f, "utf8");
    const rel = f.replace(`${ROOT}/`, "");
    check(
      archivoHits(text).length === 0,
      `${rel} names the retired display face. If the name is in a doc the site renders, write about the face without naming it.`,
    );
    const hits = amberMisuseInMarkup(text);
    check(
      hits.length === 0,
      `${rel}: amber outside a fill (${hits.slice(0, 4).join(" | ")}). A command is Bone or Mist mono, with the amber unit bar in front of it where it is the command to run.`,
    );
  }
  const BARS = new Set([pin.geometry.mark.bar, pin.geometry.unitBar.d]);
  for (const f of htmlPages) {
    const rel = f.replace(`${ROOT}/`, "");
    const stray = amberFills(readFileSync(f, "utf8")).filter((d) => !BARS.has(d));
    check(
      stray.length === 0,
      `${rel} fills something other than a bar in amber (${stray.map((d) => d || "not a path").join(", ")}). Amber fills the mark's bar and the unit bar, and nothing else.`,
    );
  }
}

if (fail.length) {
  console.error("Built-output check FAILED:");
  for (const m of fail) console.error(`  - ${m}`);
  process.exit(1);
}
const withChrome = htmlPages.filter((p) => !p.endsWith("_global-error.html")).length;
console.log(
  `Built output clean: ${withChrome} of ${htmlPages.length} prerendered pages carry the HF mark whole inside the product lockup, the company's icon set and the current share-card token (the other is Next's global error boundary, which replaces the root layout and is asserted to carry none of them); no retired mark in the build, in what the image ships, or in source; no trace of the retired display face; and amber only as the fill of a bar.`,
);
