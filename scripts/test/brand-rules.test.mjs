// The brand gates must FAIL on the identity this site retired and pass on the
// one it ships. A gate that is only ever run against a clean tree proves
// nothing about that, so each rule is fed the old identity here, by every
// path it could take, and then the new one.
//
// Run by `make validate` (node --test). No fixture file: the old identity is
// written inline, and the retired marks' geometry is imported from the one
// module allowed to carry it.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  RETIRED_MARKS,
  retiredMarkHits,
  archivoHits,
  amberMisuseInCss,
  amberMisuseInMarkup,
  amberFills,
} from "../lib/brand-rules.mjs";

const MARK_BAR = "M81 40H116L99.5 62H81Z";
const MARK_BODY = "M0 0H24V40H58V0H128L111.5 22H82V100H58V40L41.5 62H24V100H0Z";
const UNIT_BAR = "M0 0H34L17.5 22H0Z";

test("every retired mark is caught by its path and by its viewBox alone", () => {
  assert.equal(RETIRED_MARKS.length, 3);
  for (const mark of RETIRED_MARKS) {
    for (const literal of mark.literals) {
      assert.deepEqual(
        retiredMarkHits(`<svg viewBox="x"><path d="${literal} L1 1 Z"/></svg>`),
        [mark.name],
        `${mark.name} got past as ${literal}`,
      );
    }
  }
});

test("the HF mark, the unit bar and the favicon are not a retired mark", () => {
  const page = `<svg viewBox="0 0 128 100"><path d="${MARK_BAR}" fill="#D99A2E"></path><path d="${MARK_BODY}" fill="var(--color-bone)"></path></svg><svg viewBox="0 0 34 22"><path d="${UNIT_BAR}"/></svg>`;
  assert.deepEqual(retiredMarkHits(page), []);
});

test("the retired display face is caught in a stylesheet, a font file name and a page", () => {
  for (const text of [
    "@font-face{font-family:Archivo Black;src:url(x.woff2)}",
    ".archivo_black_abc123-module__variable{--font-archivo:'Archivo Black'}",
    "media/archivo-black-latin-400.woff2",
    "<p>ARCHIVO BLACK</p>",
  ]) {
    assert.deepEqual(archivoHits(text), ["Archivo"], text);
  }
  assert.deepEqual(archivoHits("@font-face{font-family:zalando;src:url(x.woff2)}"), []);
});

test("amber as anything but a fill fails in a stylesheet, by every route", () => {
  const routes = {
    "type, by the old token": ".text-command{color:var(--color-command)}",
    "type, by the parent's token": ".x{color:var(--color-amber)}",
    "type, by the hex": ".x{color:#D99A2E}",
    "type, behind a variant": ".hover\\:text-command:hover{color:var(--color-command)}",
    "type, mixed toward white": "a:hover .text-command{color:color-mix(in srgb,var(--color-command) 82%,white)}",
    "a border": ".border-command{border-color:var(--color-command)}",
    "one side of a border": ".tab{border-bottom-color:var(--color-command)}",
    "a border shorthand": ".x{border:1px solid #d99a2e}",
    "an outline": ":focus-visible{outline:2px solid var(--color-command)}",
    "an outline color": ".x{outline-color:var(--color-command)}",
    "a text decoration": ".x{text-decoration-color:var(--color-amber)}",
    "a caret": "input{caret-color:#d99a2e}",
    "a stroke": "path{stroke:var(--color-amber)}",
    "a glow": ".x{box-shadow:0 0 14px #d99a2e}",
    "a text shadow": ".x{text-shadow:0 0 14px var(--color-command)}",
    "a wash": ".x{background-color:color-mix(in oklab,var(--color-command) 12%,transparent)}",
    "a gradient stop": ".x{background:linear-gradient(#d99a2e,transparent)}",
    "an alias": ".x{--hue:var(--color-amber)}",
    "a Tailwind ring alias": ".ring-command{--tw-ring-color:var(--color-command)}",
    "inside a media query": "@media (width>=40rem){.sm\\:text-command{color:var(--color-command)}}",
  };
  for (const [name, css] of Object.entries(routes)) {
    assert.equal(amberMisuseInCss(css).length, 1, `amber as ${name} got past: ${css}`);
  }
});

test("a stylesheet's failure names the selector", () => {
  assert.deepEqual(amberMisuseInCss(".a{color:red}.skill-cmd{color:var(--color-command)}"), [
    ".skill-cmd { color: var(--color-command) }",
  ]);
});

test("amber as a fill, the two token definitions and comments pass in a stylesheet", () => {
  const css = `
    @theme { --color-command: #d99a2e; --color-amber: #d99a2e; }
    /* amber is never text: color: var(--color-command) */
    .bar { background: var(--color-amber); }
    .bar-2 { background-color: #D99A2E !important; }
    svg .unit { fill: var(--color-amber); }
    .tab:hover { color: var(--fg); }
  `;
  assert.deepEqual(amberMisuseInCss(css), []);
});

test("amber as anything but a fill fails in markup and script, by every route", () => {
  const routes = {
    "the old command utility": '<code class="font-mono text-command">/production-audit</code>',
    "the utility under the parent's name": '<p class="text-amber">x</p>',
    "behind a hover variant": 'className:"border-line hover:border-command"',
    "one border side": '<div class="border-b-command">',
    "a decoration": '<a class="underline decoration-amber">',
    "a ring": '<button class="ring-command">',
    "a gradient stop": '<div class="from-amber to-transparent">',
    "an inline style": '<span style="color:#d99a2e">x</span>',
    "a style object": 'style:{borderColor:"#D99A2E"}',
    "a console style string": 'const label="color:#d99a2e;font-weight:600"',
    "an inline variable": '<span style="outline-color:var(--color-command)">',
    "an svg stroke": '<path d="M0 0" stroke="#D99A2E"/>',
  };
  for (const [name, text] of Object.entries(routes)) {
    assert.ok(amberMisuseInMarkup(text).length > 0, `amber as ${name} got past: ${text}`);
  }
});

test("the shipped markup passes: an amber fill, a filled bar, Bone commands", () => {
  const ok = [
    `<path d="${MARK_BAR}" fill="#D99A2E"></path>`,
    'const FILL={slate:"var(--color-slate)",amber:"#D99A2E"}',
    '<span class="cmd">/production-audit</span>',
    '<span class="bg-amber"></span>',
    '<div style="background-color:#D99A2E"></div>',
    "Amber only ever fills a bar. Never text, a border or a wash.",
    'UnitBar fill="amber" className="cmd-field-bar"',
  ];
  for (const text of ok) assert.deepEqual(amberMisuseInMarkup(text), [], text);
});

test("an amber fill is listed with the path it fills, so the caller can hold it to a bar", () => {
  const html = `<svg><path d="${MARK_BAR}" fill="#D99A2E"></path><path d="${MARK_BODY}" fill="var(--color-bone)"></path></svg><svg><path d="${UNIT_BAR}" fill="#D99A2E"></path></svg><rect width="9" fill="#d99a2e"></rect><path fill="#D99A2E" d="M0 0H9V9Z"></path>`;
  assert.deepEqual(amberFills(html), [MARK_BAR, UNIT_BAR, "", "M0 0H9V9Z"]);
});
