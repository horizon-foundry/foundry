import test from 'node:test'
import assert from 'node:assert/strict'
import { lint, RULES, errors } from '../lint.mjs'
import { GOOD } from './base.mjs'

const rules = (t) => new Set(lint(t).map((f) => f.rule))
const swap = (from, to) => {
  assert.ok(GOOD.includes(from), `fixture anchor missing: ${from}`)
  return GOOD.replace(from, to)
}

// One failing fixture per rule id. The passing fixture is GOOD itself, which must trip none.
const FAIL = {
  'file-crlf': () => GOOD.replace(/\n/g, '\r\n'),
  'file-final-newline': () => GOOD.trimEnd(),
  'line-trailing-space': () => swap('- [ ] 2026-03-02 Beta item', '- [ ] 2026-03-02 Beta item  '),
  'indent-tab': () => swap('  - child bullet', '\t- child bullet'),
  'fence-unclosed': () => swap('Some narrative about the unit.', '```\nSome narrative'),
  'title-h1': () => GOOD.replace('# TODOs\n', 'intro\n'),
  'preamble-content': () => swap('# TODOs\n', '# TODOs\n\nstray words\n'),
  'section-missing': () => GOOD.replace(/## Backlog[\s\S]*?(?=## Done)/, ''),
  'section-unknown': () => swap('## Backlog', '## Phase 7 (Done)\n\n## Backlog'),
  'section-duplicate': () => GOOD + '\n## Done\n',
  'section-order': () => swap('## Now', '## Done\n\n## Now').replace(/## Done\n\n### Setup[\s\S]*$/, ''),
  'phase-plans-missing': () => swap('### Phase Plans', '### Plans'),
  'phase-plans-undated': () => swap('- [ ] 2026-02-03 Phase 2', '- [ ] Phase 2'),
  'phase-plans-order': () => swap('2026-02-03 Phase 2', '2025-02-03 Phase 2'),
  'now-outside-unit': () => swap('## Now\n', '## Now\n\n- [ ] loose\n'),
  'now-cap': () => swap('## Up Next', '### B -> `p/b.md`\n### C -> `p/c.md`\n### D -> `p/d.md`\n\n## Up Next'),
  'now-unit-plan': () => swap('### Build the thing -> `~/.claude/plans/build.md`', '### Build the thing'),
  'upnext-heading': () => swap('- [ ] 2026-03-02 Beta item', '### sub\n- [ ] 2026-03-02 Beta item'),
  'list-prose': () => swap('- [ ] 2026-03-02 Beta item', '\nSome prose.\n\n- [ ] 2026-03-02 Beta item'),
  'list-lazy-continuation': () => swap('- [ ] 2026-03-02 Beta item', '- [ ] 2026-03-02 Beta item\nlazy tail'),
  'upnext-checked': () => swap('- [ ] 2026-03-02 Beta', '- [x] 2026-03-02 Beta'),
  'item-date': () => swap('- [ ] 2026-03-02 Beta item', '- [ ] Beta item'),
  'item-duplicate': () => swap('2026-03-03 Gamma item', '2026-03-02 beta   ITEM'),
  'item-marker': () => swap('- [ ] 2026-03-02 Beta', '* [ ] 2026-03-02 Beta'),
  'item-strikethrough': () => swap('Delta item', '~~Delta item~~'),
  'item-emoji-check': () => swap('- [x] did a thing', '- [x] ✅ did a thing'),
  'done-outside-block': () => swap('## Done\n', '## Done\n\n- [x] loose\n'),
  'done-heading': () => swap('### Setup (2026-01-02, PR #1)', '### Setup'),
  'done-order': () => swap('### 2026-02-01', '### 2025-01-01'),
  'done-open-item': () => swap('- [x] did a thing', '- [ ] did a thing'),
}

test('the conforming fixture has no findings', () => {
  assert.deepEqual(lint(GOOD), [])
})

test('every rule has a failing fixture, and no fixture is orphaned', () => {
  assert.deepEqual(Object.keys(FAIL).sort(), Object.keys(RULES).sort())
})

for (const id of Object.keys(RULES)) {
  test(`rule ${id}: failing fixture trips it, passing fixture does not`, () => {
    assert.ok(rules(FAIL[id]()).has(id), `${id} did not fire`)
    assert.ok(!rules(GOOD).has(id))
  })
}

test('severity comes from the registry', () => {
  const f = lint(FAIL['now-unit-plan']()).find((x) => x.rule === 'now-unit-plan')
  assert.equal(f.severity, 'warn')
  assert.equal(errors(lint(FAIL['now-unit-plan']())).length, 0)
})

test('loose bullets, quotes, tables and numbered lines are rejected in the lists', () => {
  for (const line of ['- plain bullet', '> quote', '| a | b |', '1. numbered', '```\ncode\n```']) {
    const t = swap('- [ ] 2026-03-02 Beta item', `${line}\n\n- [ ] 2026-03-02 Beta item`)
    assert.ok(rules(t).has('list-prose'), line)
  }
})

test('narrative is allowed in Master Plan, Now and Done blocks', () => {
  const t = swap('- [x] did a thing', 'Prose.\n\n> quote\n\n| a | b |\n|---|---|\n\n- [x] did a thing')
  assert.deepEqual(lint(t), [])
})

test('undated steps inside Now and Done blocks are allowed', () => {
  assert.ok(!rules(GOOD).has('item-date'))
})

// Regressions from the adversarial review of the parser and linter.
const has = (t, id) => rules(t).has(id)

test('a fence after a blank line stays inside its item', () => {
  const t = swap('- [ ] 2026-03-03 Gamma item', '- [ ] 2026-03-03 Gamma item\n\n  ```\n  code\n  ```')
  assert.deepEqual(lint(t), [])
})

test('open and malformed children are seen, not just the first line', () => {
  assert.ok(has(swap('- [x] did a thing', '- [x] did a thing\n  - [ ] child'), 'done-open-item'))
  assert.ok(has(swap('- [ ] 2026-03-02 Beta item', '- [ ] 2026-03-02 Beta item\n  - [X] c'), 'item-marker'))
  assert.ok(has(swap('- [ ] 2026-03-02 Beta item', '- [ ] 2026-03-02 Beta item\n  - ~~c~~'), 'item-strikethrough'))
  assert.ok(has(swap('- [ ] 2026-03-02 Beta item', '- [ ] 2026-03-02 Beta item\n  - ✅ c'), 'item-emoji-check'))
})

test('marks inside a title are not marks on the item', () => {
  const t = swap('Delta item', 'show ✓ in UI and clean ~~/tmp files')
  assert.ok(!has(t, 'item-emoji-check') && !has(t, 'item-strikethrough'))
})

test('exactly one title', () => {
  assert.ok(has(swap('## Master Plan', '# Another\n\n## Master Plan'), 'title-h1'))
  assert.ok(has(swap('### Phase Plans', '# Sub\n\n### Phase Plans'), 'title-h1'))
})

test('a CR inside a line does not turn an item into prose', () => {
  assert.ok(!has(swap('Beta item', 'Beta\ritem'), 'list-prose'))
})

test('"```x``` note" is prose, not a fence', () => {
  const t = swap('Some narrative about the unit.', '```x``` note')
  assert.deepEqual(lint(t), [])
})

test('impossible dates are not dates', () => {
  assert.ok(has(swap('2026-03-02 Beta', '2026-13-45 Beta'), 'item-date'))
  assert.ok(has(swap('### 2026-02-01', '### 2026-13-45'), 'done-heading'))
})

test('emphasis does not hide a duplicate', () => {
  assert.ok(has(swap('2026-03-03 Gamma item', '2026-03-02 *Beta* item'), 'item-duplicate'))
})

test('a whitespace-only last line is not a final newline', () => {
  assert.ok(has(GOOD + '   \n', 'file-final-newline'))
})

test('a plan link without a directory still counts', () => {
  assert.ok(!has(swap('build.md`', 'build.md`').replace('`~/.claude/plans/build.md`', 'plan.md'), 'now-unit-plan'))
})
