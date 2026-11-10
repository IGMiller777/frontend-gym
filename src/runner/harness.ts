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

/**
 * Options for component tasks: JSX in the code and tests, packages the code may import
 * (React from the runner, never from the network) and extra names in scope of every test.
 */
export interface RunOptions {
  testTimeoutMs?: number
  /** Compile JSX with the automatic runtime (`react/jsx-runtime`), in the task and in the tests. */
  jsx?: boolean
  /** `import x from 'name'` resolves here; anything else throws. */
  modules?: Record<string, unknown>
  /** Helpers in scope of every test, e.g. `render`, `screen`, `user`. */
  globals?: Record<string, unknown>
  /** Runs after every test, passed or failed (unmount rendered components). */
  afterEach?: () => void | Promise<void>
}

/** TypeScript or JavaScript → CommonJS-style JS (types stripped, `export` becomes `exports.x =`). */
export function compile(source: string, jsx = false): string {
  return transform(source, {
    transforms: jsx ? ['typescript', 'jsx', 'imports'] : ['typescript', 'imports'],
    jsxRuntime: 'automatic',
    disableESTransforms: true,
    production: true,
  }).code
}

const requireFrom = (modules: Record<string, unknown> = {}) => (name: string) => {
  if (name in modules) return modules[name]
  throw new Error(`import "${name}" is not available here: ${Object.keys(modules).length ? `only ${Object.keys(modules).join(', ')}` : 'tasks run without packages'}`)
}

/** Evaluates compiled code and returns its exports. Only `opts.modules` can be imported. */
export function load(source: string, opts: Pick<RunOptions, 'jsx' | 'modules'> = {}): Record<string, unknown> {
  const module = { exports: {} as Record<string, unknown> }
  new Function('exports', 'module', 'require', compile(source, opts.jsx))(module.exports, module, requireFrom(opts.modules))
  return module.exports
}

const IDENT = /^[A-Za-z_$][\w$]*$/

const describeError = (e: unknown) => (e instanceof Error ? (e.name === 'AssertionError' ? e.message : `${e.name}: ${e.message}`) : `Thrown: ${format(e)}`)

/**
 * Runs `tests` against `source`. Each test gets a fresh copy of the module (no state leaks between
 * tests), `expect`, `fn` and, when asked, a fake `clock`; exported names are in scope directly.
 */
export async function runTests(source: string, tests: RunnableTest[], opts: RunOptions = {}): Promise<RunResult> {
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
      load(source, opts)
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
        const mod = load(source, opts)
        muted = false
        const globals = opts.globals ?? {}
        const names = Object.keys(mod).filter((n) => IDENT.test(n) && !(n in globals))
        const scope: Record<string, unknown> = { expect, fn, clock: fake?.clock as Clock | undefined, ...globals, ...Object.fromEntries(names.map((n) => [n, mod[n]])) }
        // The test body may contain JSX: compiled like the task, it gets the same `require`.
        const wrapped = opts.jsx ? compile(`exports.test = async () => {\n${test.code}\n}`, true) : `exports.test = async () => {\n${test.code}\n}`
        const holder: { test?: () => Promise<void> } = {}
        new Function('exports', 'require', ...Object.keys(scope), wrapped)(holder, requireFrom(opts.modules), ...Object.values(scope))
        const run = holder.test!()
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
        try {
          await opts.afterEach?.()
        } catch {
          // cleanup errors must not hide the test result
        }
      }
    }
    return { tests: results, logs }
  } finally {
    Object.assign(console, original)
  }
}
