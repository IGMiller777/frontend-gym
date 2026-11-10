import { execFileSync } from 'node:child_process'
import { stripTypes } from './typecheck'

/**
 * A checked code block in a lesson:
 * - ```js run / ```ts run: executed, the ```output block right after it must match;
 * - ```ts check: must pass `tsc --strict` (lines expected to fail carry `// @ts-expect-error`).
 * ts blocks are type-checked in both modes.
 */
export interface Snippet {
  lang: 'js' | 'ts'
  mode: 'run' | 'check'
  code: string
  expected: string | null
  line: number
}

export function extractSnippets(md: string): Snippet[] {
  const out: Snippet[] = []
  const re = /```(js|ts) (run|check)\n([\s\S]*?)```\s*(?:```output\n([\s\S]*?)```)?/g
  for (const m of md.matchAll(re)) {
    out.push({
      lang: m[1] as Snippet['lang'],
      mode: m[2] as Snippet['mode'],
      code: m[3],
      expected: m[4] === undefined ? null : m[4].trimEnd(),
      line: md.slice(0, m.index).split('\n').length,
    })
  }
  return out
}

/**
 * Runs a snippet as an ES module in a fresh Node process (strict mode, top-level `this` is undefined,
 * like modern bundled frontend code) and returns what it printed with console.log.
 * TypeScript is run with its types erased.
 */
export function runSnippet(code: string, lang: Snippet['lang'] = 'js'): string {
  return execFileSync(process.execPath, ['--input-type=module', '--no-warnings', '-e', lang === 'ts' ? stripTypes(code) : code], {
    encoding: 'utf8',
    timeout: 10_000,
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trimEnd()
}
