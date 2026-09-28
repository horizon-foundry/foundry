import test from 'node:test'
import assert from 'node:assert/strict'
import { preserve } from '../preserve.mjs'

const BEFORE = `# T

## Phase 7 (Done)

- [x] shipped thing -> \`~/.claude/plans/one.md\`

## Backlog

- [ ] open thing
- [ ] another thing -> \`~/.claude/plans/two.md\`
  - [ ] nested step
- [ ] finished but unchecked
`
const kinds = (a, b) => preserve(a, b).map((m) => m.kind)

test('a pure reordering passes', () => {
  const after = `# T

## Backlog

- [ ] another thing -> \`~/.claude/plans/two.md\`
  - [ ] nested step
- [ ] open thing

## Done

- [x] shipped thing -> \`~/.claude/plans/one.md\`
- [x] finished but unchecked
`
  assert.deepEqual(preserve(BEFORE, after), [])
})

test('adding a date and moving an item to Done while checking it passes', () => {
  const after = BEFORE.replace('- [ ] open thing', '- [ ] 2026-01-01 open thing').replace('## Phase 7 (Done)', '## Done').replace('- [ ] finished but unchecked', '').concat('\n## Done\n\n- [x] finished but unchecked\n')
  assert.deepEqual(preserve(BEFORE, after.replace('## Done\n\n- [x] shipped', '## Old\n\n- [x] shipped')), [])
})

test('a dropped item is caught', () => {
  assert.deepEqual(kinds(BEFORE, BEFORE.replace('- [ ] open thing\n', '')), ['item-missing'])
})

test('a dropped nested checkbox is caught', () => {
  assert.deepEqual(kinds(BEFORE, BEFORE.replace('  - [ ] nested step\n', '')), ['item-missing'])
})

test('a dropped plan link is caught, on the item and in the file', () => {
  const m = preserve(BEFORE, BEFORE.replace(' -> `~/.claude/plans/two.md`', ''))
  assert.deepEqual(m.map((x) => x.kind), ['plan-link-missing'])
  assert.equal(m[0].detail, '~/.claude/plans/two.md')
})

test('a link kept elsewhere in the file but lost from its item is still caught', () => {
  const after = BEFORE.replace(' -> `~/.claude/plans/two.md`', '') + '\nSee ~/.claude/plans/two.md\n'
  assert.deepEqual(kinds(BEFORE, after), ['plan-link-missing'])
})

test('a silently edited title is caught', () => {
  assert.deepEqual(kinds(BEFORE, BEFORE.replace('open thing', 'open things')), ['item-missing'])
})

test('unchecked to checked outside Done is caught, inside Done it is not', () => {
  assert.deepEqual(kinds(BEFORE, BEFORE.replace('- [ ] open thing', '- [x] open thing')), ['checked-outside-done'])
  const inDone = BEFORE.replace('- [ ] open thing\n', '') + '\n## Done\n\n- [x] open thing\n'
  assert.deepEqual(preserve(BEFORE, inDone), [])
})

test('reopening a completed item is caught', () => {
  assert.deepEqual(kinds(BEFORE, BEFORE.replace('- [x] shipped thing', '- [ ] shipped thing')), ['unchecked'])
})

test('duplicate items must both survive', () => {
  const two = '## Backlog\n\n- [ ] same\n- [ ] same\n'
  assert.deepEqual(kinds(two, '## Backlog\n\n- [ ] same\n'), ['item-missing'])
})

test('checkbox lines inside code fences are not items', () => {
  assert.deepEqual(preserve('## A\n\n```\n- [ ] example\n```\n', '## A\n'), [])
})

test('a checkbox moved into a different fence kind is not preserved', () => {
  assert.deepEqual(kinds('## A\n\n- [ ] keep me\n', '## A\n\n```\n~~~\n- [ ] keep me\n'), ['item-missing'])
})

test('duplicate texts cannot mask a check outside Done', () => {
  const before = '## Up Next\n\n- [ ] foo\n\n## Done\n\n- [x] foo\n'
  const after = '## Now\n\n- [x] foo\n\n## Done\n\n- [x] foo\n'
  assert.deepEqual(kinds(before, after), ['checked-outside-done'])
})

test('a plan path must survive as a whole token', () => {
  const b = '- [ ] x -> `~/.claude/plans/a.md`\n'
  assert.deepEqual(kinds(b, '- [ ] x -> `~/.claude/old-plans/a.md`\n').includes('plan-link-missing'), true)
  assert.deepEqual(kinds(b, '- [ ] x -> `~/.claude/plans/a.md.bak`\n').includes('plan-link-missing'), true)
})

test('numbered and quoted checkboxes count', () => {
  assert.deepEqual(kinds('1. [ ] alpha\n2. [ ] beta\n', '- [ ] alpha\n'), ['item-missing'])
  assert.deepEqual(kinds('> - [ ] alpha\n', ''), ['item-missing'])
})

test('an unchanged file always passes, whatever punctuation surrounds a plan path', () => {
  for (const tail of ['.', ', see also', '**', ']', ': done', '#top']) {
    const x = `## Up Next\n\n- [ ] 2026-01-01 a -> ~/.claude/plans/a.md${tail}\n\nSee [~/.claude/plans/b.md].\n`
    assert.deepEqual(preserve(x, x), [], tail)
  }
})

test('a look-alike path does not stand in for the real one', () => {
  const b = 'See ~/.claude/plans/a.md.\n'
  assert.equal(preserve(b, 'See ~/.claude/myplans/a.md.\n').length, 1)
  assert.equal(preserve(b, 'See ~/.claude/plans/a.mdx.\n').length, 1)
})

test('a checkbox line with a lone CR is still an item', () => {
  assert.deepEqual(kinds('## Up Next\n- [ ] a\rb\n- [ ] keep\n', '## Up Next\n- [ ] keep\n'), ['item-missing'])
})

test('hostile long paths stay linear', () => {
  const t0 = Date.now()
  preserve('a/'.repeat(50000) + '\n', 'x\n')
  assert.ok(Date.now() - t0 < 1000)
})

test('an unchanged file passes for a plan path wrapped in any delimiter', () => {
  for (const [a, b] of [['(', ')'], ['"', '"'], ['<', '>'], ["'", "'"], ['[', '](x)'], ['', ',b'], ['', ';next']]) {
    const x = `## Up Next\n\n- [ ] 2026-01-01 t -> ${a}plans/a.md${b}\n`
    assert.deepEqual(preserve(x, x), [], a + b)
  }
})

test('a nested plans directory is still a plan path', () => {
  assert.equal(preserve('See ~/.claude/plans/sub/a.md.\n', 'nothing\n').length, 1)
})
