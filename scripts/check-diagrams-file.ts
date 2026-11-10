// Dev helper: parse the ```mermaid blocks of the given markdown files. Usage: pnpm tsx scripts/check-diagrams-file.ts <file.md>...
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = join(import.meta.dirname, '..')
const blocks = process.argv.slice(2).flatMap((f) => [...readFileSync(f, 'utf8').matchAll(/^```mermaid\n([\s\S]*?)^```/gm)].map((m, i) => ({ where: `${f} #${i + 1}`, code: m[1] })))
const r = spawnSync(process.execPath, ['--import', join(root, 'scripts', 'dom-env.mjs'), join(root, 'scripts', 'parse-diagrams.mjs')], { input: JSON.stringify(blocks), encoding: 'utf8', cwd: root })
const errors = JSON.parse(r.stdout || '[]') as { where: string; error: string }[]
for (const e of errors) console.log(`✗ ${e.where}: ${e.error}`)
console.log(`${blocks.length} diagrams, ${errors.length} problem(s)`)
process.exit(errors.length ? 1 : 0)
