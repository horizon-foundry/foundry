import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { RULES } from '../lint.mjs'

const spec = readFileSync(fileURLToPath(new URL('../../../reference/todos-spec.md', import.meta.url)), 'utf8')
const checklist = spec.split('## Conformance checklist')[1].split('\n## ')[0]
const rows = [...checklist.matchAll(/^\| `([a-z0-9-]+)` \| (error|warn) \|/gm)].map((m) => [m[1], m[2]])

test('the spec checklist and the linter registry list the same rules with the same severities', () => {
  assert.deepEqual(Object.fromEntries(rows), RULES)
  assert.equal(new Set(rows.map((r) => r[0])).size, rows.length, 'duplicate row in checklist')
})
