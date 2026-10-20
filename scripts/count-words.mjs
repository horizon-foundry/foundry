#!/usr/bin/env node
// Counts the visible words on a rendered page, the number the overhaul's word
// caps are written against (600 on /, 250 for a skill page's sell). One rule,
// so two people measuring the same page get the same number:
//
//   * only text inside <main> counts (the header and footer are chrome);
//   * text a visitor cannot see does not count: anything not rendered
//     (display: none, so a collapsed tab or accordion panel), visibility
//     hidden, or clipped to the 1px sr-only box;
//   * everything else counts, terminal output and figure labels included;
//   * a word is a run of non-space characters that holds a letter or digit.
//
// It reads the page as served, in a real browser at the given width with
// script on and reduced motion (so no figure is mid-entrance), because the
// panels collapse under script and a static read of the HTML would count them.
//
// Usage:
//   node scripts/count-words.mjs [--playwright-from <dir>] [--width 1440]
//     [--max N] [--exclude <css selector>] <url>...
// The repo carries no browser dependency, so --playwright-from names a
// directory whose node_modules has playwright (render-check takes the same
// flag). --exclude drops a subtree, e.g. "#method" for production-audit's
// "How it works", which sits below its sell. Exits 1 if any page is over --max.
import { createRequire } from "node:module";
import path from "node:path";

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  if (i === -1) return fallback;
  const [v] = args.splice(i, 2).slice(1);
  return v;
};
const from = opt("--playwright-from", process.cwd());
const width = Number(opt("--width", "1440"));
const max = opt("--max", null);
const exclude = opt("--exclude", null);
const urls = args;
if (urls.length === 0) {
  console.error("count-words: give at least one URL");
  process.exit(2);
}

let chromium;
try {
  ({ chromium } = createRequire(path.join(path.resolve(from), "package.json"))("playwright"));
} catch {
  console.error(`count-words: no playwright under ${from}; pass --playwright-from <dir>`);
  process.exit(2);
}

const browser = await chromium.launch();
let over = false;
try {
  for (const url of urls) {
    const ctx = await browser.newContext({
      viewport: { width, height: 900 },
      reducedMotion: "reduce",
    });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: "networkidle" });
    const words = await page.evaluate((excludeSel) => {
      const main = document.querySelector("main");
      if (!main) return -1;
      const skip = excludeSel ? [...main.querySelectorAll(excludeSel)] : [];
      const hidden = (el) => {
        for (let e = el; e && e !== main.parentElement; e = e.parentElement) {
          if (skip.includes(e)) return true;
          const cs = getComputedStyle(e);
          if (cs.display === "none" || cs.visibility === "hidden") return true;
          const r = e.getBoundingClientRect();
          if (r.width <= 1 && r.height <= 1 && cs.overflow === "hidden") return true;
        }
        return false;
      };
      let n = 0;
      const walk = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
      for (let t = walk.nextNode(); t; t = walk.nextNode()) {
        const el = t.parentElement;
        if (!el || el.closest("script,style,noscript,template") || hidden(el)) continue;
        n += (t.textContent.match(/\S+/g) ?? []).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
      }
      return n;
    }, exclude);
    const bad = max !== null && words > Number(max);
    over ||= bad;
    console.log(`${bad ? "OVER" : "ok  "}  ${String(words).padStart(5)}  ${width}px  ${url}`);
    await ctx.close();
  }
} finally {
  await browser.close();
}
process.exit(over ? 1 : 0);
