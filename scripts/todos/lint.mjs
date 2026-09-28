// Linter for reference/todos-spec.md. Rule ids are stable once published; the conformance checklist in
// the spec lists exactly these ids (test/spec-agreement.test.mjs enforces it).
import { parse, items, section, blocks, isRealDate, SECTION_NAMES } from './parse.mjs'
import { trimTrail } from './preserve.mjs'

const E = 'error'
const W = 'warn'
export const RULES = {
  'file-crlf': E,
  'file-final-newline': E,
  'line-trailing-space': W,
  'indent-tab': W,
  'fence-unclosed': E,
  'title-h1': E,
  'preamble-content': W,
  'section-missing': E,
  'section-unknown': E,
  'section-duplicate': E,
  'section-order': E,
  'phase-plans-missing': E,
  'phase-plans-undated': W,
  'phase-plans-order': W,
  'now-outside-unit': E,
  'now-cap': E,
  'now-unit-plan': W,
  'upnext-heading': E,
  'list-prose': E,
  'list-lazy-continuation': E,
  'upnext-checked': E,
  'item-date': E,
  'item-duplicate': E,
  'item-marker': E,
  'item-strikethrough': E,
  'item-emoji-check': E,
  'done-outside-block': E,
  'done-heading': E,
  'done-order': E,
  'done-open-item': E,
}

const DONE_HEADING = /^(?:.+ \((\d{4}-\d{2}-\d{2})(?:, PR #\d+|, PRs #\d+(?:, #\d+)+)?\)|(\d{4}-\d{2}-\d{2}))$/
// A plan link is a path with a directory ending .md, or the target of " -> ". Token based, so linear.
const hasPlanLink = (body) => {
  const toks = body.replace(/(^|\s)->(?=\s)/g, ' \u0001 ').split(/[\s`()<>,;"']+/).filter(Boolean)
  const md = (t) => trimTrail(t.replace(/#.*$/, '')).endsWith('.md')
  return toks.some((t, i) => md(t) && !/^[a-z]+:\/\//i.test(t) && (t.includes('/') || toks.slice(Math.max(0, i - 3), i).includes('\u0001')))
}
const OPEN_CHILD = /^[ \t]+(?:[-*+]|\d+[.)])[ \t]+\[ \]/
const UPPER_CHILD = /^[ \t]+[-*+][ \t]+\[X\]/
const STRIKE = /~~[^~\s][^~]*~~/
const EMOJI_LEAD = /^\s*(?:[-*+]\s+)?(?:\[[ xX]\]\s*)?(?:\d{4}-\d{2}-\d{2}\s+)?(?:\*\*\[[^\]]+\]\*\*\s*)*[✅✔☑✓❌⬜☐🔲]/u

export function lint(text) {
  const doc = parse(text)
  const out = []
  const add = (rule, line, message) => out.push({ rule, severity: RULES[rule], line: line + 1, message })
  const { lines } = doc

  // File level.
  const cr = lines.findIndex((l) => l.endsWith('\r'))
  if (cr >= 0) add('file-crlf', cr, 'File uses CRLF line endings; use LF.')
  const lf = text.replace(/\r\n/g, '\n')
  const lfl = lf.split('\n')
  if (lfl.length < 2 || lfl[lfl.length - 1] !== '' || !lfl[lfl.length - 2].trim()) {
    add('file-final-newline', lines.length - 1, 'File must end with exactly one newline.')
  }
  lines.forEach((l, i) => {
    const b = l.replace(/\r$/, '')
    if (b.trim() && b !== b.trimEnd()) add('line-trailing-space', i, 'Trailing whitespace.')
    if (/^ *\t/.test(b)) add('indent-tab', i, 'Tab in indentation; use spaces.')
  })
  for (const f of doc.fences) if (f.close === null) add('fence-unclosed', f.open, 'Code fence is never closed.')

  // Structure.
  if (!doc.title || !doc.titleFirst || doc.title.line > doc.firstSectionLine) {
    add('title-h1', 0, 'File must start with a "# " title before any "## " section.')
  }
  for (const h of doc.h1s.slice(1)) add('title-h1', h, 'Only one "# " title is allowed.')
  const pStart = doc.title ? doc.title.line + 1 : 0
  for (let i = pStart; i < doc.firstSectionLine; i++) {
    if (lines[i].trim()) {
      add('preamble-content', i, 'Content between the title and the first section.')
      break
    }
  }
  const seen = new Set()
  let lastIdx = -1
  for (const s of doc.sections) {
    if (!s.known) {
      add('section-unknown', s.line, `"## ${s.name}" is not one of: ${SECTION_NAMES.join(', ')}.`)
      continue
    }
    if (seen.has(s.name)) {
      add('section-duplicate', s.line, `"## ${s.name}" appears more than once.`)
      continue
    }
    seen.add(s.name)
    const idx = SECTION_NAMES.indexOf(s.name)
    if (idx < lastIdx) add('section-order', s.line, `"## ${s.name}" is out of order.`)
    lastIdx = Math.max(lastIdx, idx)
  }
  for (const name of SECTION_NAMES) {
    if (!seen.has(name)) add('section-missing', 0, `Missing "## ${name}".`)
  }

  const inFence = new Set()
  for (const f of doc.fences) for (let l = f.open; l <= (f.close ?? lines.length - 1); l++) inFence.add(l)
  const get = (name) => section(doc, name)

  // Master Plan / Phase Plans.
  const mp = get('Master Plan')
  if (mp) {
    const pp = blocks(mp).find((b) => b.heading && b.heading.text === 'Phase Plans')
    if (!pp) add('phase-plans-missing', mp.line, 'Master Plan has no "### Phase Plans" block.')
    else {
      let prev = null
      for (const it of pp.nodes.filter((nd) => nd.type === 'item')) {
        if (!it.date) add('phase-plans-undated', it.start, 'Phase Plans entry has no date.')
        else {
          if (prev && it.date < prev) add('phase-plans-order', it.start, 'Phase Plans entry is older than the one above it.')
          prev = it.date
        }
      }
    }
  }

  // Now.
  const now = get('Now')
  if (now) {
    const bl = blocks(now)
    for (const nd of bl[0].nodes) {
      if (!(nd.type === 'other' && nd.kind === 'blank')) add('now-outside-unit', nd.start, 'Now content must sit inside a "###" unit.')
    }
    bl.slice(1).forEach((b, k) => {
      if (k >= 3) add('now-cap', b.heading.start, 'Now holds at most 3 units.')
      const body = lines.slice(b.heading.start, b.end).join('\n')
      if (!hasPlanLink(body)) add('now-unit-plan', b.heading.start, 'Unit does not link a plan file.')
    })
  }

  // Up Next and Backlog.
  for (const name of ['Up Next', 'Backlog']) {
    const sec = get(name)
    if (!sec) continue
    const ids = new Map()
    sec.nodes.forEach((nd, k) => {
      if (nd.type === 'heading3') {
        if (name === 'Up Next') add('upnext-heading', nd.start, 'Up Next is one flat list; no "###" headings.')
      } else if (nd.type === 'item') {
        if (!nd.date) add('item-date', nd.start, 'Item has no leading YYYY-MM-DD date.')
        if (name === 'Up Next' && nd.checked) add('upnext-checked', nd.start, 'Checked item in Up Next; it belongs in Done.')
        const id = `${nd.date}|${nd.key}`
        if (ids.has(id)) add('item-duplicate', nd.start, `Same date and title as line ${ids.get(id) + 1}.`)
        else ids.set(id, nd.start)
      } else if (nd.kind !== 'blank') {
        const prev = sec.nodes[k - 1]
        const lazy = nd.kind === 'prose' && prev && prev.type === 'item' && prev.end + 1 === nd.start
        if (lazy) add('list-lazy-continuation', nd.start, 'Non-indented line directly under an item; indent it or separate it.')
        else add('list-prose', nd.start, `${nd.kind} content in ${name}; only items are allowed.`)
      }
    })
  }

  // Done.
  const done = get('Done')
  if (done) {
    const bl = blocks(done)
    for (const nd of bl[0].nodes) {
      if (!(nd.type === 'other' && nd.kind === 'blank')) add('done-outside-block', nd.start, 'Done content must sit inside a "###" block.')
    }
    let prev = null
    for (const b of bl.slice(1)) {
      const m = DONE_HEADING.exec(b.heading.text)
      if (!m) {
        add('done-heading', b.heading.start, 'Heading must be "### <unit> (YYYY-MM-DD[, PR #n])" or "### YYYY-MM-DD".')
        continue
      }
      const d = m[1] ?? m[2]
      if (!isRealDate(d)) {
        add('done-heading', b.heading.start, `${d} is not a real date.`)
        continue
      }
      if (prev && d < prev) add('done-order', b.heading.start, 'Done blocks must be oldest first.')
      prev = d
    }
  }
  const doneOpen = done ? items(done) : []
  for (const it of doneOpen) {
    if (!it.checked) add('done-open-item', it.start, 'Open item in Done.')
    for (let l = it.start + 1; l <= it.end; l++) {
      if (!inFence.has(l) && OPEN_CHILD.test(lines[l])) add('done-open-item', l, 'Open nested checkbox in Done.')
    }
  }

  // Item syntax, every section.
  for (const s of doc.sections) {
    for (const it of items(s)) {
      if (it.marker !== '-' || it.box === 'X') add('item-marker', it.start, 'Use "- [ ]" or "- [x]".')
      for (let l = it.start + 1; l <= it.end; l++) {
        if (inFence.has(l)) continue
        const c = lines[l].replace(/`[^`]*`/g, '\uE000')
        if (UPPER_CHILD.test(c)) add('item-marker', l, 'Use "[x]", not "[X]".')
        if (STRIKE.test(c)) add('item-strikethrough', l, 'Strikethrough in a child line.')
        if (EMOJI_LEAD.test(c)) add('item-emoji-check', l, 'Emoji check mark in a child line.')
      }
      if (it.strike) add('item-strikethrough', it.start, 'Strikethrough; a finished item is [x] in Done.')
      if (it.emoji) add('item-emoji-check', it.start, 'Emoji check mark; use [x].')
    }
  }

  return out.sort((a, b) => a.line - b.line)
}

export const errors = (findings) => findings.filter((f) => f.severity === 'error')
