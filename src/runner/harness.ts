import { transform } from 'sucrase'
import { installClock, realClearTimeout, realSetTimeout, type Clock } from './clock'
import { expect, fn, format } from './expect'

/** A test as the runner sees it: the body of an async function. */
export interface RunnableTest {
  code: string
  /** Replace timers and Date.now with a virtual clock (the test drives it via `clock`). */
  fakeTimers?: boolean
}

export interface TestResult {
  ok: boolean
  /** Failure message (assertion diff, thrown error or timeout). */
  error?: string
  ms: number
}

export interface RunResult {
  /** Compile or load error: the code never got to the tests. */
  error?: string
  tests: TestResult[]
  /** Everything the learner's code and the tests printed with console.*. */
  logs: string[]
}

/** TypeScript or JavaScript → CommonJS-style JS (types stripped, `export` becomes `exports.x =`). */
export function compile(source: string): string {
  return transform(source, { transforms: ['typescript', 'imports'], disableESTransforms: true, production: true }).code
}

/** Evaluates compiled code and returns its exports. Imports are not available inside tasks. */
export function load(source: string): Record<string, unknown> {
  const module = { exports: {} as Record<string, unknown> }
  const requireStub = (name: string) => {
    throw new Error(`import "${name}" is not available here: tasks run without packages`)
  }
  new Function('exports', 'module', 'require', compile(source))(module.exports, module, requireStub)
  return module.exports
}

const IDENT = /^[A-Za-z_$][\w$]*$/

const describeError = (e: unknown) => (e instanceof Error ? (e.name === 'AssertionError' ? e.message : `${e.name}: ${e.message}`) : `Thrown: ${format(e)}`)

/**
 * Runs `tests` against `source`. Each test gets a fresh copy of the module (no state leaks between
 * tests), `expect`, `fn` and, when asked, a fake `clock`; exported names are in scope directly.
 */
export async function runTests(source: string, tests: RunnableTest[], opts: { testTimeoutMs?: number } = {}): Promise<RunResult> {
  const timeout = opts.testTimeoutMs ?? 2000
  const logs: string[] = []
  // The module runs once more per test; its top-level output is kept only from the first run.
  let muted = false
  const original = { log: console.log, info: console.info, warn: console.warn, error: console.error }
  const capture =
    (prefix: string) =>
    (...args: unknown[]) =>
      muted ||
      logs.push(prefix + args.map((a) => (typeof a === 'string' ? a : format(a))).join(' '))
  console.log = capture('')
  console.info = capture('')
  console.warn = capture('⚠ ')
  console.error = capture('✖ ')

  try {
    try {
      load(source)
    } catch (e) {
      return { error: describeError(e), tests: [], logs }
    }

    const results: TestResult[] = []
    for (const test of tests) {
      const started = Date.now()
      const fake = test.fakeTimers ? installClock() : null
      let timer: ReturnType<typeof setTimeout> | undefined
      try {
        muted = true
        const mod = load(source)
        muted = false
        const names = Object.keys(mod).filter((n) => IDENT.test(n))
        const body = new Function('expect', 'fn', 'clock', ...names, `return (async () => {\n${test.code}\n})()`) as (...a: unknown[]) => Promise<void>
        const run = body(expect, fn, fake?.clock as Clock | undefined, ...names.map((n) => mod[n]))
        await Promise.race([
          run,
          new Promise((_, reject) => {
            timer = realSetTimeout(() => reject(new Error(`Timeout: the test did not finish in ${timeout} ms (a promise that never settles?)`)), timeout)
          }),
        ])
        results.push({ ok: true, ms: Date.now() - started })
      } catch (e) {
        results.push({ ok: false, error: describeError(e), ms: Date.now() - started })
      } finally {
        muted = false
        realClearTimeout(timer)
        fake?.uninstall()
      }
    }
    return { tests: results, logs }
  } finally {
    Object.assign(console, original)
  }
}
