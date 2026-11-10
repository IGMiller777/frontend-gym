import { execFileSync } from 'node:child_process'

/** A ```js run block and the ```output block right after it. */
export interface Snippet {
  code: string
  expected: string | null
  line: number
}

/** Finds every ```js run block; `expected` is the following ```output block, if any. */
export function extractSnippets(md: string): Snippet[] {
  const out: Snippet[] = []
  const re = /```js run\n([\s\S]*?)```\s*(?:```output\n([\s\S]*?)```)?/g
  for (const m of md.matchAll(re)) {
    out.push({ code: m[1], expected: m[2] === undefined ? null : m[2].trimEnd(), line: md.slice(0, m.index).split('\n').length })
  }
  return out
}

/**
 * Runs a snippet as an ES module in a fresh Node process (strict mode, top-level `this` is undefined,
 * like modern bundled frontend code) and returns what it printed with console.log.
 */
export function runSnippet(code: string): string {
  return execFileSync(process.execPath, ['--input-type=module', '--no-warnings', '-e', code], {
    encoding: 'utf8',
    timeout: 10_000,
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trimEnd()
}
