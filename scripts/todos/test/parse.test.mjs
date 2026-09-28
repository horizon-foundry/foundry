import test from 'node:test'
import assert from 'node:assert/strict'
import { parse, serialize, section, items } from '../parse.mjs'
import { GOOD } from './base.mjs'

const CASES = {
  empty: '',
  'only newline': '\n',
  good: GOOD,
  'no final newline': GOOD.trimEnd(),
  'many trailing newlines': GOOD + '\n\n\n',
  crlf: GOOD.replace(/\n/g, '\r\n'),
  'mixed eol': GOOD.replace('\n## Now', '\r\n## Now'),
  tabs: '# T\n\n## Up Next\n\n- [ ] 2026-01-01 a\n\t- child\n\t\tdeeper\n',
  'trailing space': '# T  \n\n## Up Next  \n- [ ] x   \n',
  'fence hides headings': '# T\n\n## Now\n\n```\n## Not a section\n- [ ] not an item\n```\n\n## Done\n',
  'unclosed fence': '# T\n\n## Now\n\n```\n## Not a section\n',
  'weird bullets': '# T\n\n## Backlog\n\n* [ ] star\n+ [X] plus\n1. [ ] numbered\n- plain\n> quote\n| a | b |\n',
  'no title': '## Now\n\ntext\n',
  'binary-ish': '# T\n\n## Now\n\n\u0000ÿ\u2014 emoji ✅\n',
}

for (const [name, text] of Object.entries(CASES)) {
  test(`round trip is byte exact: ${name}`, () => {
    assert.equal(serialize(parse(text)), text)
  })
}

test('fenced headings and items are not structure', () => {
  const d = parse(CASES['fence hides headings'])
  assert.deepEqual(d.sections.map((s) => s.name), ['Now', 'Done'])
  assert.equal(items(section(d, 'Now')).length, 0)
})

test('item span covers continuation and children, not the next item', () => {
  const d = parse(GOOD)
  const [alpha, beta] = items(section(d, 'Up Next'))
  assert.equal(alpha.end - alpha.start, 2)
  assert.equal(beta.start, alpha.end + 1)
  assert.equal(alpha.date, '2026-03-01')
  assert.deepEqual(alpha.tags, ['Bug'])
  assert.equal(alpha.title, 'Alpha item')
  assert.equal(alpha.plan, '~/.claude/plans/alpha.md')
})

test('blank line then indented text stays inside the item', () => {
  const d = parse('# T\n\n## Up Next\n\n- [ ] 2026-01-01 a\n\n  more\n- [ ] 2026-01-02 b\n')
  const [a, b] = items(section(d, 'Up Next'))
  assert.equal(a.end, 6)
  assert.equal(b.start, 7)
})
