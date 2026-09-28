// Guarded line-span moves. A move removes an item's whole span and inserts it elsewhere; no other
// line changes (apart from one separator blank when the list is blank-separated).
import { parse, items, section, blocks, normalizeTitle } from './parse.mjs'

const isBlank = (l) => l.trim() === ''
const MOVABLE = ['Up Next', 'Backlog']

export const refOf = (sectionName, it) => ({ section: sectionName, date: it.date, title: it.key })

const conflict = (kind, detail) => ({ ok: false, conflict: { kind, detail } })

function region(doc, sec, group) {
  const bl = blocks(sec)
  if (group === undefined) {
    const b = bl[0]
    return { anchor: sec.line, start: b.start, end: b.end, nodes: b.nodes }
  }
  const b = bl.find((x) => x.heading && x.heading.text === group)
  return b ? { anchor: b.heading.start, start: b.start, end: b.end, nodes: b.nodes } : null
}

const itemsOf = (r) => r.nodes.filter((nd) => nd.type === 'item')
const isLoose = (doc, its) => its.some((a, k) => k + 1 < its.length && its[k + 1].start > a.end + 1 && doc.lines.slice(a.end + 1, its[k + 1].start).every(isBlank))

// moveItem(doc, ref, {section, index, group?}, baseHash?) -> {ok:true,text,hash} | {ok:false,conflict}
// `index` is the item's final 0-based position within the target list (its group for Backlog).
export function moveItem(doc, ref, target, baseHash) {
  if (baseHash !== undefined && baseHash !== doc.hash) return conflict('hash-mismatch', doc.hash)
  if (!MOVABLE.includes(ref.section)) return conflict('source-not-movable', ref.section)
  if (!MOVABLE.includes(target.section)) return conflict('target-invalid', `cannot move into ${target.section}`)
  const srcSec = section(doc, ref.section)
  const dstSec = section(doc, target.section)
  if (!srcSec || !dstSec) return conflict('target-invalid', 'section missing')
  if (target.group !== undefined && target.section !== 'Backlog') return conflict('target-invalid', 'only Backlog has groups')

  const key = normalizeTitle(ref.title)
  const hits = items(srcSec).filter((it) => it.date === ref.date && it.key === key)
  if (hits.length === 0) return conflict('item-not-found', key)
  if (hits.length > 1) return conflict('item-ambiguous', key)
  const it = hits[0]

  const dst = region(doc, dstSec, target.group)
  if (!dst) return conflict('target-invalid', `no group "${target.group}"`)
  const remaining = itemsOf(dst).filter((x) => x !== it)
  if (!Number.isInteger(target.index) || target.index < 0 || target.index > remaining.length) {
    return conflict('target-invalid', `index ${target.index} outside 0..${remaining.length}`)
  }

  const lines = doc.lines
  const span = lines.slice(it.start, it.end + 1)
  const loose = isLoose(doc, itemsOf(dst))

  // Insertion anchor in original coordinates, plus separators.
  let at
  let pre = []
  let post = []
  if (target.index < remaining.length) {
    at = remaining[target.index].start
    if (loose) post = ['']
  } else if (remaining.length) {
    at = remaining[remaining.length - 1].end + 1
    if (loose) pre = ['']
  } else {
    at = dst.anchor + 1
    while (at < dst.end && isBlank(lines[at])) at++
    if (at === dst.anchor + 1) pre = ['']
    if (at < lines.length && !isBlank(lines[at])) post = ['']
  }

  // Removal range: the span plus one separator blank when the source list is blank-separated.
  let rmStart = it.start
  let rmEnd = it.end
  const srcItems = itemsOf(region(doc, srcSec, groupOf(srcSec, it)))
  if (isLoose(doc, srcItems)) {
    if (rmEnd + 1 < lines.length && isBlank(lines[rmEnd + 1]) && srcItems[srcItems.length - 1] !== it) rmEnd++
    else if (rmStart > 0 && isBlank(lines[rmStart - 1])) rmStart--
  }

  const insert = [...pre, ...span, ...post]
  const out = []
  for (let i = 0; i <= lines.length; i++) {
    if (i === at) out.push(...insert)
    if (i === lines.length) break
    if (i >= rmStart && i <= rmEnd) continue
    out.push(lines[i])
  }
  const text = out.join('\n')
  const next = parse(text)

  // Belt and braces: a move never changes the multiset of items.
  const sig = (d) => d.sections.flatMap((s) => items(s).map((x) => `${x.date}|${x.key}|${x.checked}`)).sort().join('\n')
  if (sig(next) !== sig(doc)) throw new Error('moveItem changed the item set; this is a bug')
  return { ok: true, text, hash: next.hash }
}

function groupOf(sec, it) {
  let g
  for (const nd of sec.nodes) {
    if (nd.type === 'heading3') g = nd.text
    if (nd === it) return g
  }
  return undefined
}

// Move the referenced items to the top of Up Next, in the given order.
export function queueToTop(doc, refs, baseHash) {
  if (baseHash !== undefined && baseHash !== doc.hash) return conflict('hash-mismatch', doc.hash)
  let cur = doc
  let text = doc.text
  for (let k = 0; k < refs.length; k++) {
    const r = moveItem(cur, refs[k], { section: 'Up Next', index: k })
    if (!r.ok) return r
    text = r.text
    cur = parse(text)
  }
  return { ok: true, text, hash: cur.hash }
}
