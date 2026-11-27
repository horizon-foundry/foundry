// The identity's hard rules as pure functions, shared by both brand gates
// (scripts/check-brand-assets.mjs reads source, scripts/check-built-mark.mjs
// reads what the site serves) and held by scripts/test/brand-rules.test.mjs.
//
// Each rule is written so that it FAILS on the identity this site retired on
// 2026-11-27: the angular mountain mark, Archivo Black as the display face,
// and amber as the color of type. The test file feeds each rule the old
// identity and the new one and names every path the old one could take.
//
// This is the one file in the repo allowed to carry a retired mark's
// geometry. Both sweeps exempt it by path, and the test file imports the
// literals from here, so nothing else has a reason to quote them.

// Every mark this site has retired. A literal is a prefix of the old path or
// the old viewBox, which a copy of the old file carries and a new drawing
// never does.
export const RETIRED_MARKS = [
  {
    name: "the mountain mark (the canonical cut, retired 2026-11-27)",
    literals: ["M0 246 L67.03 170.59", "0 0 378.19 246"],
  },
  {
    name: "the mountain mark (the small cut, retired 2026-11-27)",
    literals: ["M0 246 L65.55 172.26", "0 0 384.21 246"],
  },
  {
    name: "the mark drawn before 2026-09-19",
    literals: ["M98 165.5", "0 0 414 274"],
  },
];

// The retired marks a text still carries, by name.
export function retiredMarkHits(text) {
  return RETIRED_MARKS.filter((m) => m.literals.some((l) => text.includes(l))).map(
    (m) => m.name,
  );
}

// The retired display face. One family name: no shipped file, stylesheet or
// prerendered page has a reason to say it.
export function archivoHits(text) {
  return /archivo/i.test(text) ? ["Archivo"] : [];
}

// Amber, in every spelling a stylesheet or a component can give it: the hex,
// either theme variable, and the utility suffixes built on the variables.
const AMBER_VALUE = /#d99a2e\b|--color-(?:command|amber)\b/i;

// The properties whose value may be amber: a fill, and nothing else. A
// background is how CSS fills a bar; `fill` is how an SVG does.
const FILL_PROPS = new Set(["background", "background-color", "fill"]);
// The two theme tokens that hold the value. Defining them is not using them.
const TOKEN_DEFS = new Set(["--color-command", "--color-amber"]);

// Amber misuse in a stylesheet. Returns one line per offending declaration,
// with the selector it sits in, so the failure names what to fix.
//
// Amber only ever fills a bar. So it fails as the color of type, a border, an
// outline, a text decoration, a caret, a stroke or a shadow; in any mix or
// with any alpha (a wash, a tint, a glow, a gradient stop); and behind an
// alias (a custom property set to amber hides the use from this check, so the
// alias itself fails). It passes only as the whole value of a fill.
export function amberMisuseInCss(css) {
  const hits = [];
  const text = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const decl = /(--[\w-]+|[a-z-]+)\s*:\s*([^;{}]*)/gi;
  let m;
  while ((m = decl.exec(text))) {
    const prop = m[1].toLowerCase();
    const value = m[2].trim();
    if (!AMBER_VALUE.test(value)) continue;
    if (TOKEN_DEFS.has(prop)) continue;
    const whole = value.replace(/\s*!important$/i, "");
    const isWhole = /^(?:#d99a2e|var\(--color-(?:command|amber)\))$/i.test(whole);
    if (FILL_PROPS.has(prop) && isWhole) continue;
    const open = text.lastIndexOf("{", m.index);
    const before = text.lastIndexOf("}", open);
    const prevOpen = text.lastIndexOf("{", open - 1);
    const selector = text
      .slice(Math.max(before, prevOpen) + 1, open)
      .replace(/\s+/g, " ")
      .trim();
    hits.push(`${selector || "(top level)"} { ${prop}: ${value} }`);
  }
  return hits;
}

// Amber misuse in markup or script: a page, a server chunk, a component.
//
//   * a utility that sets amber on anything but a fill (the text, border,
//     decoration, outline, ring, caret, shadow, stroke and gradient families,
//     under either of the theme's two names for the value, behind any variant
//     prefix);
//   * an inline style or a style object that does the same;
//   * an SVG attribute that strokes or colors with it.
//
// A `fill` is not judged here: scripts/check-built-mark.mjs holds every amber
// fill on a prerendered page to the mark's bar or the unit bar by its path.
const AMBER_CLASS =
  /(?<![\w-])(?:text|border(?:-[trblxyse])?|decoration|outline|ring(?:-offset)?|divide(?:-[xy])?|caret|placeholder|accent|shadow|stroke|from|via|to)-(?:command|amber)(?![\w-])/g;
const AMBER_STYLE =
  /(?<![\w-])(?:color|border(?:-[a-z]+)*|outline(?:-[a-z]+)*|text-decoration(?:-[a-z]+)*|caret-color|stroke|box-shadow|text-shadow|borderColor|border(?:Top|Right|Bottom|Left)Color|outlineColor|textDecorationColor|caretColor|boxShadow|textShadow|WebkitTextFillColor)\s*:\s*["'`]?[^;"'`{}]*?(?:#d99a2e\b|--color-(?:command|amber)\b)/gi;
const AMBER_ATTR = /(?<![\w-])(?:stroke|color|stop-color|flood-color)=["']#d99a2e/gi;

export function amberMisuseInMarkup(text) {
  const hits = new Set();
  for (const re of [AMBER_CLASS, AMBER_STYLE, AMBER_ATTR]) {
    re.lastIndex = 0;
    for (const m of text.matchAll(re)) hits.add(m[0].replace(/\s+/g, " ").slice(0, 80));
  }
  return [...hits];
}

// Every amber fill in a page's markup, as the path it fills ("" when the
// filled element is not a path). The caller holds the list to the pinned bar
// geometry: amber fills the mark's bar and the unit bar, and nothing else.
export function amberFills(html) {
  const out = [];
  for (const m of html.matchAll(/<([a-z]+)\b[^>]*\bfill="#d99a2e"[^>]*>/gi)) {
    out.push(m[1].toLowerCase() === "path" ? (m[0].match(/\sd="([^"]+)"/)?.[1] ?? "") : "");
  }
  return out;
}
