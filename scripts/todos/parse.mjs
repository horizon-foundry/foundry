// Lossless TODOS.md parser. Reference implementation of reference/todos-spec.md.
//
// The Doc keeps the input as `lines` (split on "\n", so a trailing newline is a final "" element and a
// CR stays on its line) and every node as a line span into it. serialize() joins the lines back, so
// serialize(parse(text)) === text for ANY input, conforming or not. Ops edit line spans and never
// re-render the rest of the file.
import { createHash } from 'node:crypto'

export const SECTION_NAMES = ['Master Plan', 'Now', 'Up Next', 'Backlog', 'Done']

const BLANK = /^\s*$/
const INDENTED = /^[ \t]+\S/
const ITEM = /^([-*+])[ \t]+\[( |x|X)\](?:[ \t]+([\s\S]*))?$/
const FENCE_OPEN_RE = /^\s*(`{3,}|~{3,})([\s\S]*)$/
// CommonMark: a backtick fence's info string may not contain a backtick (so "```x``` note" is prose).
const FENCE_OPEN = {
  exec(line) {
    const m = FENCE_OPEN_RE.exec(line)
    return m && !(m[1][0] === '`' && m[2].includes('`')) ? m : null
  },
  test(line) {
    return this.exec(line) !== null
  },
}
const DATE = /^(\d{4}-\d{2}-\d{2})(?:\s+|$)/
export const isRealDate = (s) => {
  const d = new Date(`${s}T00:00:00Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s
}
const TAG = /^\*\*\[([^\]]+)\]\*\*\s*/
const STRIKE = /~~[^~\s][^~]*~~/
const EMOJI_LEAD = /^(?:[-*+]\s+)?(?:\[[ xX]\]\s*)?(?:\d{4}-\d{2}-\d{2}\s+)?(?:\*\*\[[^\]]+\]\*\*\s*)*[✅✔☑✓❌⬜☐🔲]/u

const bare = (line) => line.replace(/\r$/, '')

export function hashText(text) {
  return createHash('sha256').update(text).digest('hex')
}

export function normalizeTitle(title) {
  return title
    .replace(/\*\*|`/g, '')
    .replace(/\*([^*\s][^*]*)\*/g, '$1')
    .replace(/__([^_\s][^_]*)__/g, '$1').replace(/\s+/g, ' ').trim().toLowerCase()
}

export function parseItemText(rest) {
  let text = rest ?? ''
  let date = null
  const d = DATE.exec(text)
  if (d && isRealDate(d[1])) {
    date = d[1]
    text = text.slice(d[0].length)
  }
  const tags = []
  for (let m; (m = TAG.exec(text)); ) {
    tags.push(m[1])
    text = text.slice(m[0].length)
  }
  let plan = null
  const p = /^([\s\S]*?)\s->\s+(\S[\s\S]*)$/.exec(text)
  if (p) {
    text = p[1]
    const t = /^`([^`]+)`|^(\S+)/.exec(p[2])
    plan = t[1] ?? t[2]
  }
  return { date, tags, title: text.trim(), plan }
}

export function parse(text) {
  const lines = text.split('\n')
  const n = lines.length

  // Fences first: every later scan must ignore anything inside one.
  const fences = []
  const inFence = new Array(n).fill(false)
  const fenceEnd = new Map()
  for (let i = 0; i < n; i++) {
    const m = FENCE_OPEN.exec(bare(lines[i]))
    if (!m) continue
    const ch = m[1][0]
    const len = m[1].length
    let close = null
    for (let j = i + 1; j < n; j++) {
      const c = new RegExp(`^\\s*${ch === '`' ? '`' : '~'}{${len},}\\s*$`).exec(bare(lines[j]))
      if (c) {
        close = j
        break
      }
    }
    const last = close ?? n - 1
    for (let k = i; k <= last; k++) inFence[k] = true
    fenceEnd.set(i, last)
    fences.push({ open: i, close })
    i = last
  }

  const headingAt = (i, level) => {
    if (inFence[i]) return null
    const m = new RegExp(`^#{${level}}[ \\t]+([\\s\\S]*?)[ \\t]*$`).exec(bare(lines[i]))
    return m ? m[1] : null
  }

  let title = null
  const h1s = []
  const sectionStarts = []
  for (let i = 0; i < n; i++) {
    if (inFence[i]) continue
    const t1 = headingAt(i, 1)
    if (t1 !== null) {
      h1s.push(i)
      if (title === null) title = { line: i, text: t1 }
    }
    const s = headingAt(i, 2)
    if (s !== null) sectionStarts.push({ name: s, line: i })
  }
  const firstNonBlank = lines.findIndex((l) => !BLANK.test(l))

  const sections = sectionStarts.map((s, k) => ({
    name: s.name,
    line: s.line,
    start: s.line + 1,
    end: k + 1 < sectionStarts.length ? sectionStarts[k + 1].line : n, // exclusive
    known: SECTION_NAMES.includes(s.name),
    nodes: [],
  }))

  for (const sec of sections) {
    for (let i = sec.start; i < sec.end; i++) {
      const line = bare(lines[i])
      if (inFence[i]) {
        const open = fences.find((f) => f.open === i)
        const last = open ? Math.min(fenceEnd.get(i), sec.end - 1) : i
        sec.nodes.push({ type: 'other', kind: 'fence', start: i, end: last })
        i = last
        continue
      }
      if (BLANK.test(line)) {
        sec.nodes.push({ type: 'other', kind: 'blank', start: i, end: i })
        continue
      }
      const h3 = headingAt(i, 3)
      if (h3 !== null) {
        sec.nodes.push({ type: 'heading3', start: i, end: i, text: h3 })
        continue
      }
      const im = ITEM.exec(line)
      if (im) {
        let end = i
        for (let j = i + 1; j < sec.end; j++) {
          if (INDENTED.test(bare(lines[j]))) {
            end = j
            const fe = FENCE_OPEN.test(bare(lines[j])) ? fenceEnd.get(j) : undefined
            if (fe !== undefined) {
              end = Math.min(fe, sec.end - 1)
              j = end
            }
          } else if (BLANK.test(lines[j])) {
            let k = j
            while (k < sec.end && BLANK.test(lines[k])) k++
            if (k < sec.end && INDENTED.test(bare(lines[k])) && (!inFence[k] || fenceEnd.has(k))) {
              end = k
              j = k
              if (fenceEnd.has(k)) {
                end = Math.min(fenceEnd.get(k), sec.end - 1)
                j = end
              }
            } else break
          } else break
        }
        const codeless = line.replace(/`[^`]*`/g, '\uE000')
        const parsed = parseItemText(im[3])
        sec.nodes.push({
          type: 'item',
          start: i,
          end,
          marker: im[1],
          box: im[2],
          checked: im[2] !== ' ',
          ...parsed,
          key: normalizeTitle(parsed.title),
          strike: STRIKE.test(codeless),
          emoji: EMOJI_LEAD.test(codeless),
        })
        i = end
        continue
      }
      let kind = 'prose'
      if (/^[-*+][ \t]/.test(line)) kind = 'bullet'
      else if (/^\d+[.)][ \t]/.test(line)) kind = 'numbered'
      else if (line.startsWith('>')) kind = 'quote'
      else if (line.startsWith('|')) kind = 'table'
      else if (/^#{1,6}[ \t]/.test(line)) kind = 'heading'
      else if (INDENTED.test(line)) kind = 'indented'
      sec.nodes.push({ type: 'other', kind, start: i, end: i })
    }
  }

  return {
    text,
    hash: hashText(text),
    lines,
    eol: text.includes('\r\n') ? '\r\n' : '\n',
    title,
    h1s,
    titleFirst: title !== null && title.line === firstNonBlank,
    firstSectionLine: sections.length ? sections[0].line : n,
    sections,
    fences,
  }
}

export function serialize(doc) {
  return doc.lines.join('\n')
}

export function items(sec) {
  return sec.nodes.filter((nd) => nd.type === 'item')
}

export function section(doc, name) {
  return doc.sections.find((s) => s.name === name) ?? null
}

// Line regions inside a section: the whole section for flat lists, or per `###` block.
export function blocks(sec) {
  const out = []
  let cur = { heading: null, start: sec.start, nodes: [] }
  for (const nd of sec.nodes) {
    if (nd.type === 'heading3') {
      cur.end = nd.start
      out.push(cur)
      cur = { heading: nd, start: nd.end + 1, nodes: [] }
    } else cur.nodes.push(nd)
  }
  cur.end = sec.end
  out.push(cur)
  return out
}
