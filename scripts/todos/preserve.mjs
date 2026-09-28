// Content-preservation check for rewrites (migrations). preserve(before, after) -> Missing[].
// Reports; never repairs.

const BOX = /^(\s*(?:>\s*)*)(?:[-*+]|\d+[.)])[ \t]+\[( |x|X)\](?:[ \t]+([\s\S]*))?$/
const FENCE = /^\s*(`{3,}|~{3,})([\s\S]*)$/
const DATE = /^\d{4}-\d{2}-\d{2}\s*/
const DELIM = /[\s`()<>,;"']+/
// Trim prose punctuation and fragments so a path at the end of a sentence still counts as itself.
const clean = (t) => t.replace(/^[*_[]+/, '').replace(/#.*$/, '').replace(/[.,:;*_)\]!?]+$/, '')
const PLAN_TOKEN = /(?:^|\/)plans\/[^/]+\.md$/

const norm = (s) => s.replace(/\s+/g, ' ').trim().toLowerCase()

function extract(text) {
  const lines = text.split('\n')
  const out = []
  let fence = null
  let sec = ''
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].replace(/\r$/, '')
    const f = FENCE.exec(l)
    if (fence) {
      if (f && f[1][0] === fence[0] && f[1].length >= fence.length && !f[2].trim()) fence = null
      continue
    }
    if (f && !(f[1][0] === '`' && f[2].includes('`'))) {
      fence = f[1]
      continue
    }
    const h = /^##[ \t]+(.*?)[ \t]*$/.exec(l)
    if (h) sec = h[1].toLowerCase()
    const m = BOX.exec(l)
    if (!m) continue
    let rest = m[3] ?? ''
    rest = rest.replace(DATE, '')
    let plan = null
    const p = /^([\s\S]*?)\s->\s+`?([^\s`]+)/.exec(rest)
    if (p) {
      rest = p[1]
      plan = clean(p[2])
    }
    let span = l
    for (let j = i + 1; j < lines.length && /^[ \t]+\S/.test(lines[j]); j++) span += '\n' + lines[j]
    out.push({ line: i + 1, checked: m[2] !== ' ', key: norm(rest), plan, section: sec, span, text: rest.trim() })
  }
  return out
}

const tokensOf = (text) => new Set(text.split(DELIM).map(clean).filter(Boolean))

function planPaths(text) {
  const raw = text.split(DELIM).filter(Boolean)
  const s = new Set()
  raw.forEach((t, i) => {
    const c = clean(t)
    if (PLAN_TOKEN.test(c) || (raw[i - 1] === '->' && c.endsWith('.md'))) s.add(c)
  })
  return s
}

export function preserve(before, after) {
  const missing = []
  const b = extract(before)
  const a = extract(after)
  const byKey = new Map()
  for (const x of a) byKey.set(x.key, [...(byKey.get(x.key) ?? []), x])
  const reported = new Set()

  const pairs = []
  const leftover = []
  for (const bi of b) {
    const cands = byKey.get(bi.key) ?? []
    let k = cands.findIndex((c) => c.checked === bi.checked && c.section === bi.section)
    if (k < 0) k = cands.findIndex((c) => c.checked === bi.checked)
    if (k >= 0) pairs.push([bi, cands.splice(k, 1)[0]])
    else leftover.push(bi)
  }
  for (const bi of leftover) {
    const cands = byKey.get(bi.key) ?? []
    if (!cands.length) {
      missing.push({ kind: 'item-missing', line: bi.line, text: bi.text, detail: 'no item with this text survives' })
      continue
    }
    const ai = cands.shift()
    if (!bi.checked && ai.checked && ai.section !== 'done') {
      missing.push({ kind: 'checked-outside-done', line: bi.line, text: bi.text, detail: `now checked under "${ai.section}"` })
    } else if (bi.checked && !ai.checked) {
      missing.push({ kind: 'unchecked', line: bi.line, text: bi.text, detail: 'completed item reopened' })
    }
    pairs.push([bi, ai])
  }
  for (const [bi, ai] of pairs) {
    if (bi.plan && !tokensOf(ai.span).has(bi.plan)) {
      reported.add(bi.plan)
      missing.push({ kind: 'plan-link-missing', line: bi.line, text: bi.text, detail: bi.plan })
    }
  }
  const afterTokens = tokensOf(after)
  for (const p of planPaths(before)) {
    if (!afterTokens.has(p) && !reported.has(p)) {
      missing.push({ kind: 'plan-link-missing', line: 0, text: '', detail: p })
    }
  }
  return missing.sort((x, y) => x.line - y.line)
}
