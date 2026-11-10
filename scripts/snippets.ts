import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { stripTypes } from './typecheck'

/** Repo root: `js dom` examples resolve `jsdom` from the project's node_modules. */
const ROOT = join(import.meta.dirname, '..')

/**
 * A checked code block in a lesson:
 * - ```js run / ```ts run: executed, the ```output block right after it must match;
 * - ```js dom: same, but inside a jsdom page (document, events, custom elements, shadow DOM; no layout);
 * - ```ts check: must pass `tsc --strict` (lines expected to fail carry `// @ts-expect-error`).
 * ts blocks are type-checked in both modes.
 */
export interface Snippet {
  lang: 'js' | 'ts'
  mode: 'run' | 'check' | 'dom'
  code: string
  expected: string | null
  line: number
}

export function extractSnippets(md: string): Snippet[] {
  const out: Snippet[] = []
  const re = /```(js|ts) (run|check|dom)\n([\s\S]*?)```\s*(?:```output\n([\s\S]*?)```)?/g
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
/** Globals a `js dom` example sees: the jsdom window's DOM classes replace Node's own Event & co. */
const DOM_PRELUDE = `import { JSDOM } from 'jsdom'
const __dom = new JSDOM('<!doctype html><html><head></head><body></body></html>')
// DOM names Node lacks come from jsdom; Node's own Event classes are replaced so events dispatch on DOM nodes.
const __override = ['Event', 'EventTarget', 'CustomEvent', 'AbortController', 'AbortSignal', 'DOMException']
for (const k of Object.getOwnPropertyNames(__dom.window)) {
  const dom = /^[A-Z]/.test(k) || ['document', 'customElements', 'getComputedStyle', 'requestAnimationFrame'].includes(k)
  if (dom && (!(k in globalThis) || __override.includes(k))) globalThis[k] = __dom.window[k]
}
globalThis.window = __dom.window
`

export function runSnippet(code: string, lang: Snippet['lang'] = 'js', mode: Snippet['mode'] = 'run'): string {
  const js = lang === 'ts' ? stripTypes(code) : code
  return execFileSync(process.execPath, ['--input-type=module', '--no-warnings', '-e', mode === 'dom' ? DOM_PRELUDE + js : js], {
    encoding: 'utf8',
    timeout: 10_000,
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trimEnd()
}
