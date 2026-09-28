#!/usr/bin/env node
// todos lint <file...> [--json]      exit 1 on any error finding
// todos roundtrip <file...>          exit 1 unless serialize(parse(x)) === x for every file
// todos preserve <before> <after>    exit 1 if anything is missing
import { readFileSync } from 'node:fs'
import { parse, serialize } from './parse.mjs'
import { lint, errors } from './lint.mjs'
import { preserve } from './preserve.mjs'

const [cmd, ...rest] = process.argv.slice(2)
const json = rest.includes('--json')
const args = rest.filter((a) => a !== '--json')
const read = (f) => readFileSync(f, 'utf8')
let code = 0

if (cmd === 'lint' && args.length) {
  const all = {}
  for (const f of args) {
    const fs = lint(read(f))
    all[f] = fs
    if (errors(fs).length) code = 1
    if (!json) for (const x of fs) console.log(`${f}:${x.line}: ${x.severity} ${x.rule} ${x.message}`)
  }
  if (json) console.log(JSON.stringify(all, null, 2))
  else if (!code) console.log(`ok (${args.length} file${args.length > 1 ? 's' : ''})`)
} else if (cmd === 'roundtrip' && args.length) {
  for (const f of args) {
    const t = read(f)
    const ok = serialize(parse(t)) === t
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${f}`)
    if (!ok) code = 1
  }
} else if (cmd === 'preserve' && args.length === 2) {
  const m = preserve(read(args[0]), read(args[1]))
  for (const x of m) console.log(`${args[0]}:${x.line}: ${x.kind} ${x.detail}`)
  if (m.length) code = 1
  else console.log('ok')
} else {
  console.error('usage: todos lint <file...> [--json] | roundtrip <file...> | preserve <before> <after>')
  code = 2
}
process.exit(code)
