/**
 * Checks the examples of one lesson file while writing it: type errors and run output.
 * Usage: tsx scripts/check-snippets.ts content/lessons/<track>/<id>.ru.md
 */
import { readFileSync } from 'node:fs'
import { extractSnippets, runSnippet } from './snippets'
import { typeCheck } from './typecheck'

const file = process.argv[2]
const snippets = extractSnippets(readFileSync(file, 'utf8'))
const ts = Object.fromEntries(snippets.filter((s) => s.lang === 'ts').map((s) => [`line-${s.line}.ts`, s.code]))
let bad = 0
for (const [name, errors] of Object.entries(typeCheck(ts)))
  for (const e of errors) {
    bad++
    console.log(`✗ ${name}: ${e}`)
  }
for (const s of snippets.filter((x) => x.mode !== 'check')) {
  try {
    const got = runSnippet(s.code, s.lang, s.mode)
    if (got !== s.expected) {
      bad++
      console.log(`✗ line ${s.line}: output\n${got}\n--- expected\n${s.expected}`)
    }
  } catch (e) {
    bad++
    console.log(`✗ line ${s.line}: threw ${(e as Error).message.split('\n')[0]}`)
  }
}
console.log(`${snippets.length} snippets, ${bad} problem(s)`)
process.exit(bad ? 1 : 0)
