import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { angularJitApplicationTransform } from '@angular/compiler-cli'
import ts from 'typescript'
import { checkOptions, stripTypes } from './typecheck'

/** Repo root: `js dom` examples resolve `jsdom` from the project's node_modules. */
const ROOT = join(import.meta.dirname, '..')

/**
 * A checked code block in a lesson:
 * - ```js run / ```ts run: executed, the ```output block right after it must match;
 * - ```js dom: same, but inside a jsdom page (document, events, custom elements, shadow DOM; no layout);
 * - ```ts check: must pass `tsc --strict` (lines expected to fail carry `// @ts-expect-error`);
 * - ```jsx dom / ```tsx dom: React examples in the same jsdom page, JSX compiled with the automatic runtime
 *   and `IS_REACT_ACT_ENVIRONMENT` set, so `act()` flushes renders and effects synchronously.
 * ts and tsx blocks are type-checked in every mode.
 */
export interface Snippet {
  lang: 'js' | 'ts' | 'jsx' | 'tsx'
  mode: 'run' | 'check' | 'dom'
  code: string
  expected: string | null
  line: number
}

export function extractSnippets(md: string): Snippet[] {
  const out: Snippet[] = []
  const re = /```(jsx|tsx|js|ts) (run|check|dom)\n([\s\S]*?)```\s*(?:```output\n([\s\S]*?)```)?/g
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
/** Page globals for dom mode (jsdom window, Web Storage, React's act flag), loaded before the example. */
const DOM_ENV = join(ROOT, 'scripts', 'dom-env.mjs')

/** JSX → `react/jsx-runtime` calls; types (in tsx) are erased. */
function compileJsx(code: string, lang: 'jsx' | 'tsx'): string {
  return ts.transpileModule(code, {
    fileName: `example.${lang}`,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX, verbatimModuleSyntax: true },
  }).outputText
}

/**
 * Angular examples run in JIT mode, as the Angular CLI does for unit tests: the program is emitted with
 * Angular's JIT transform, which downlevels decorators and declares signal inputs (`input()`, `model()`)
 * and queries so the runtime compiler can see them.
 */
function compileAngular(code: string): string {
  const name = '/example.ts'
  const options: ts.CompilerOptions = { ...checkOptions, noEmit: false, experimentalDecorators: true, sourceMap: false, declaration: false }
  const host = ts.createCompilerHost(options)
  const read = host.getSourceFile.bind(host)
  host.getSourceFile = (file, lang) => (file === name ? ts.createSourceFile(name, code, lang) : read(file, lang))
  const program = ts.createProgram([name], options, host)
  let js = ''
  program.emit(program.getSourceFile(name), (file, text) => file.endsWith('.js') && (js = text), undefined, false, {
    before: [angularJitApplicationTransform(program)],
  })
  return js
}

export function runSnippet(code: string, lang: Snippet['lang'] = 'js', mode: Snippet['mode'] = 'run'): string {
  const react = lang === 'jsx' || lang === 'tsx'
  const angular = /from '@angular\//.test(code)
  const js = react ? compileJsx(code, lang) : angular && lang === 'ts' ? compileAngular(code) : lang === 'ts' ? stripTypes(code) : code
  const env = mode === 'dom' ? ['--import', pathToFileURL(DOM_ENV).href] : []
  // Angular packages ship partially compiled: outside the CLI they need the JIT compiler loaded first.
  if (angular) env.push('--import', '@angular/compiler')
  const out = execFileSync(process.execPath, [...env, '--input-type=module', '--no-warnings', '-e', js], {
    encoding: 'utf8',
    timeout: 10_000,
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  // Angular's development-mode banner is not part of any example's output.
  return (angular ? out.replace(/^Angular is running in development mode\.\n?/m, '') : out).trimEnd()
}
