import test from 'node:test'
import assert from 'node:assert/strict'
import { parse, items, section } from '../parse.mjs'
import { moveItem as rawMove, queueToTop } from '../ops.mjs'
const moveItem = (d, r, t, h = d.hash) => rawMove(d, r, t, h)
import { lint, errors } from '../lint.mjs'
import { GOOD } from './base.mjs'

const doc = parse(GOOD)
const ref = (sec, title, date) => ({ section: sec, date, title })
const titles = (text, sec) => items(section(parse(text), sec)).map((i) => i.title)

// Line-level diff: lines removed and added, as multisets (a move is remove + add of the same lines).
function delta(a, b) {
  const A = a.split('\n')
  const B = b.split('\n')
  const count = (arr) => arr.reduce((m, l) => m.set(l, (m.get(l) ?? 0) + 1), new Map())
  const ca = count(A)
  const cb = count(B)
  const changed = []
  for (const k of new Set([...ca.keys(), ...cb.keys()])) if ((ca.get(k) ?? 0) !== (cb.get(k) ?? 0)) changed.push(k)
  return changed.sort()
}

test('top priority moves an item to line 1 and touches only its own lines', () => {
  const r = moveItem(doc, ref('Up Next', 'gamma item', '2026-03-03'), { section: 'Up Next', index: 0 }, doc.hash)
  assert.ok(r.ok)
  assert.deepEqual(titles(r.text, 'Up Next'), ['Gamma item', 'Alpha item', 'Beta item'])
  assert.deepEqual(delta(GOOD, r.text), [])
  assert.equal(r.text.split('\n').length, GOOD.split('\n').length)
})

test('moving a multi-line item takes its children with it', () => {
  const r = moveItem(doc, ref('Up Next', 'Alpha item', '2026-03-01'), { section: 'Up Next', index: 2 })
  assert.ok(r.ok)
  assert.deepEqual(titles(r.text, 'Up Next'), ['Beta item', 'Gamma item', 'Alpha item'])
  assert.ok(r.text.includes('- Alpha item') === false)
  const lines = r.text.split('\n')
  const i = lines.findIndex((l) => l.includes('Alpha item'))
  assert.equal(lines[i + 1], '  - child bullet')
  assert.equal(lines[i + 2], '  - [ ] nested checkbox')
})

test('reorder within Up Next uses the final position', () => {
  const r = moveItem(doc, ref('Up Next', 'Alpha item', '2026-03-01'), { section: 'Up Next', index: 1 })
  assert.deepEqual(titles(r.text, 'Up Next'), ['Beta item', 'Alpha item', 'Gamma item'])
})

test('moving to the current position is a byte-for-byte no-op', () => {
  const r = moveItem(doc, ref('Up Next', 'Beta item', '2026-03-02'), { section: 'Up Next', index: 1 })
  assert.equal(r.text, GOOD)
})

test('demote to a Backlog group and promote back', () => {
  const d = moveItem(doc, ref('Up Next', 'Beta item', '2026-03-02'), { section: 'Backlog', group: 'Group one', index: 1 })
  assert.ok(d.ok)
  assert.deepEqual(titles(d.text, 'Backlog'), ['Delta item', 'Beta item', 'Epsilon item'])
  const p = moveItem(parse(d.text), ref('Backlog', 'Beta item', '2026-03-02'), { section: 'Up Next', index: 1 })
  assert.equal(p.text, GOOD)
})

test('promotion out of a group is undone exactly', () => {
  const r = moveItem(doc, ref('Backlog', 'Delta item', '2026-03-04'), { section: 'Up Next', index: 0 })
  assert.deepEqual(titles(r.text, 'Up Next')[0], 'Delta item')
  const back = moveItem(parse(r.text), ref('Up Next', 'Delta item', '2026-03-04'), { section: 'Backlog', group: 'Group one', index: 0 })
  assert.equal(back.text, GOOD)
})

test('into an empty list adds only the item and separators', () => {
  const src = '# T\n\n## Up Next\n\n## Backlog\n\n- [ ] 2026-01-01 a\n'
  const r = moveItem(parse(src), ref('Backlog', 'a', '2026-01-01'), { section: 'Up Next', index: 0 })
  assert.ok(r.ok)
  assert.deepEqual(titles(r.text, 'Up Next'), ['a'])
  assert.deepEqual(errors(lint(r.text)).filter((f) => f.rule.startsWith('list') || f.rule === 'item-date'), [])
})

test('blank-separated lists stay blank-separated', () => {
  const src = '# T\n\n## Up Next\n\n- [ ] 2026-01-01 a\n\n- [ ] 2026-01-02 b\n\n- [ ] 2026-01-03 c\n'
  for (const [t, idx, expect] of [['c', 0, 'c,a,b'], ['a', 2, 'b,c,a'], ['b', 0, 'b,a,c']]) {
    const d = parse(src)
    const it = items(section(d, 'Up Next')).find((i) => i.title === t)
    const r = moveItem(d, ref('Up Next', t, it.date), { section: 'Up Next', index: idx })
    assert.equal(titles(r.text, 'Up Next').join(','), expect)
    const body = r.text.split('\n').slice(4).join('\n')
    assert.equal(body, expect.split(',').map((x) => `- [ ] ${items(section(d, 'Up Next')).find((i) => i.title === x).date} ${x}`).join('\n\n') + '\n')
  }
})

test('queue N puts the selection on top in the chosen order', () => {
  const r = queueToTop(doc, [ref('Backlog', 'Epsilon item', '2026-03-05'), ref('Up Next', 'Gamma item', '2026-03-03')], doc.hash)
  assert.ok(r.ok)
  assert.deepEqual(titles(r.text, 'Up Next'), ['Epsilon item', 'Gamma item', 'Alpha item', 'Beta item'])
  assert.deepEqual(titles(r.text, 'Backlog'), ['Delta item'])
})

test('conflicts are typed, never guessed', () => {
  const c = (r) => r.conflict.kind
  assert.equal(c(moveItem(doc, ref('Up Next', 'Beta item', '2026-03-02'), { section: 'Up Next', index: 0 }, 'stale')), 'hash-mismatch')
  assert.equal(c(moveItem(doc, ref('Up Next', 'Nope', '2026-03-02'), { section: 'Up Next', index: 0 })), 'item-not-found')
  assert.equal(c(moveItem(doc, ref('Up Next', 'Beta item', '2026-03-02'), { section: 'Up Next', index: 9 })), 'target-invalid')
  assert.equal(c(moveItem(doc, ref('Up Next', 'Beta item', '2026-03-02'), { section: 'Done', index: 0 })), 'target-invalid')
  assert.equal(c(moveItem(doc, ref('Done', 'x', null), { section: 'Up Next', index: 0 })), 'source-not-movable')
  assert.equal(c(moveItem(doc, ref('Up Next', 'Beta item', '2026-03-02'), { section: 'Backlog', group: 'Missing', index: 0 })), 'target-invalid')
  const dup = parse('# T\n\n## Up Next\n\n- [ ] 2026-01-01 a\n- [ ] 2026-01-01 A\n')
  assert.equal(c(moveItem(dup, ref('Up Next', 'a', '2026-01-01'), { section: 'Up Next', index: 0 })), 'item-ambiguous')
})

test('CRLF files stay CRLF', () => {
  const crlf = parse(GOOD.replace(/\n/g, '\r\n'))
  const r = moveItem(crlf, ref('Up Next', 'Gamma item', '2026-03-03'), { section: 'Up Next', index: 0 })
  assert.ok(r.ok)
  assert.equal(r.text.replace(/\r\n/g, '').includes('\n'), false)
})

test('moving the only item to its own place is byte-identical', () => {
  const src = '# T\n\n## Up Next\n\n- [ ] 2026-01-01 A\n\n## Backlog\n'
  const d = parse(src)
  assert.equal(moveItem(d, ref('Up Next', 'A', '2026-01-01'), { section: 'Up Next', index: 0 }).text, src)
})

test('a request without the hash, or malformed, is a typed conflict', () => {
  assert.equal(rawMove(doc, ref('Up Next', 'Beta item', '2026-03-02'), { section: 'Up Next', index: 0 }).conflict.kind, 'hash-required')
  assert.equal(moveItem(doc, { section: 'Up Next', date: null, title: 5 }, { section: 'Up Next', index: 0 }).conflict.kind, 'bad-request')
  assert.equal(moveItem(doc, null, { section: 'Up Next', index: 0 }).conflict.kind, 'bad-request')
  assert.equal(queueToTop(doc, 'x', doc.hash).conflict.kind, 'bad-request')
})

test('a duplicated group name is ambiguous, not the first match', () => {
  const src = '# T\n\n## Backlog\n\n### G\n\n- [ ] 2026-01-01 A\n\n### G\n\n- [ ] 2026-01-02 B\n'
  const r = moveItem(parse(src), ref('Backlog', 'B', '2026-01-02'), { section: 'Backlog', group: 'G', index: 0 })
  assert.equal(r.conflict.kind, 'target-invalid')
})

test('CRLF files gain no bare LF, and a last section keeps its final newline', () => {
  const src = '# T\r\n\r\n## Up Next\r\n\r\n## Backlog\r\n\r\n- [ ] 2026-01-01 A\r\n'
  const r = moveItem(parse(src), ref('Backlog', 'A', '2026-01-01'), { section: 'Up Next', index: 0 })
  assert.equal(r.text.replace(/\r\n/g, '').includes('\n'), false)
  const tail = moveItem(parse('# T\n\n## Up Next\n\n- [ ] 2026-01-01 A\n\n## Backlog\n'), ref('Up Next', 'A', '2026-01-01'), { section: 'Backlog', index: 0 })
  assert.ok(tail.text.endsWith('\n'))
})

test('an item under a duplicated group name still moves out (its identity is unique)', () => {
  const src = '# T\n\n## Up Next\n\n## Backlog\n\n### G\n\n- [ ] 2026-01-01 A\n\n### G\n\n- [ ] 2026-01-02 B\n'
  const r = moveItem(parse(src), ref('Backlog', 'A', '2026-01-01'), { section: 'Up Next', index: 0 })
  assert.equal(r.ok, true)
  assert.deepEqual(titles(r.text, 'Up Next'), ['A'])
})

test('removing the only item of a group leaves one blank line, and it can be refilled cleanly', () => {
  const src = '# T\n\n## Up Next\n\n- [ ] 2026-01-01 a\n\n## Backlog\n\n### G\n\n- [ ] 2026-01-02 b\n\n## Done\n'
  const out = moveItem(parse(src), ref('Backlog', 'b', '2026-01-02'), { section: 'Up Next', index: 1 })
  assert.ok(out.ok)
  assert.equal(out.text, '# T\n\n## Up Next\n\n- [ ] 2026-01-01 a\n- [ ] 2026-01-02 b\n\n## Backlog\n\n### G\n\n## Done\n')
  const back = moveItem(parse(out.text), ref('Up Next', 'b', '2026-01-02'), { section: 'Backlog', group: 'G', index: 0 })
  assert.ok(back.ok)
  assert.equal(back.text, src.replace('- [ ] 2026-01-01 a\n\n', '- [ ] 2026-01-01 a\n\n'))
})
