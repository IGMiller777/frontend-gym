/**
 * A small Jest-like `expect` for task tests. Runs the same in a Web Worker and in Node (CI),
 * so a task's reference solution is checked by exactly the code that checks the learner.
 */

export class AssertionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AssertionError'
  }
}

/** Short, readable rendering of any value for failure messages. */
export function format(value: unknown, seen = new WeakSet<object>(), depth = 0): string {
  if (typeof value === 'string') return JSON.stringify(value)
  if (typeof value === 'bigint') return `${value}n`
  if (typeof value === 'symbol') return value.toString()
  if (typeof value === 'function') return value.name ? `[Function ${value.name}]` : '[Function]'
  if (value === null || typeof value !== 'object') return Object.is(value, -0) ? '-0' : String(value)
  if (seen.has(value)) return '[Circular]'
  if (depth > 4) return Array.isArray(value) ? '[…]' : '{…}'
  seen.add(value)
  try {
    const f = (v: unknown) => format(v, seen, depth + 1)
    if (value instanceof Date) return `Date(${Number.isNaN(value.getTime()) ? 'Invalid' : value.toISOString()})`
    if (value instanceof RegExp) return value.toString()
    if (value instanceof Error) return `${value.name}: ${value.message}`
    if (value instanceof Promise) return 'Promise {}'
    if (value instanceof Map) return `Map(${value.size}) {${[...value].map(([k, v]) => `${f(k)} => ${f(v)}`).join(', ')}}`
    if (value instanceof Set) return `Set(${value.size}) {${[...value].map(f).join(', ')}}`
    if (Array.isArray(value)) {
      // Holes are printed as `empty`, like DevTools, so a sparse result is visible.
      const items = Array.from({ length: value.length }, (_, i) => (i in value ? f(value[i]) : 'empty'))
      return `[${items.join(', ')}]`
    }
    const entries = Object.entries(value).map(([k, v]) => `${/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k)}: ${f(v)}`)
    return entries.length ? `{ ${entries.join(', ')} }` : '{}'
  } finally {
    seen.delete(value)
  }
}

/**
 * Structural equality used by `toEqual`: plain objects and arrays by own enumerable keys,
 * Map, Set, Date and RegExp by content, NaN equals NaN. Cycles are handled.
 */
export function equals(a: unknown, b: unknown, seen = new Map<object, object>()): boolean {
  if (Object.is(a, b)) return true
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false
  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false
  if (seen.get(a) === b) return true
  seen.set(a, b)
  if (a instanceof Date) return a.getTime() === (b as Date).getTime()
  if (a instanceof RegExp) return a.toString() === (b as RegExp).toString()
  // Error message and name are own but not enumerable: compare them explicitly.
  if (a instanceof Error && (a.name !== (b as Error).name || a.message !== (b as Error).message)) return false
  if (a instanceof Map) {
    const m = b as Map<unknown, unknown>
    if (a.size !== m.size) return false
    for (const [k, v] of a) if (!m.has(k) || !equals(v, m.get(k), seen)) return false
    return true
  }
  if (a instanceof Set) {
    const s = b as Set<unknown>
    if (a.size !== s.size) return false
    outer: for (const v of a) {
      if (s.has(v)) continue
      for (const w of s) if (equals(v, w, seen)) continue outer
      return false
    }
    return true
  }
  if (Array.isArray(a)) {
    const arr = b as unknown[]
    if (a.length !== arr.length) return false
    for (let i = 0; i < a.length; i++) {
      if (i in a !== i in arr) return false
      if (!equals(a[i], arr[i], seen)) return false
    }
    return true
  }
  const ka = Object.keys(a)
  const kb = Object.keys(b)
  if (ka.length !== kb.length) return false
  for (const k of ka) {
    if (!Object.prototype.hasOwnProperty.call(b, k)) return false
    if (!equals((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k], seen)) return false
  }
  return true
}

export interface Mock<A extends unknown[] = unknown[], R = unknown> {
  (...args: A): R
  /** Arguments of every call, in order. */
  calls: A[]
  /** `this` of every call. */
  contexts: unknown[]
  /** Clears recorded calls. */
  reset: () => void
}

/** A spy function that records its calls; optionally delegates to `impl`. */
export function fn<A extends unknown[] = unknown[], R = unknown>(impl?: (...args: A) => R): Mock<A, R> {
  const mock = function (this: unknown, ...args: A) {
    mock.calls.push(args)
    mock.contexts.push(this)
    return impl?.apply(this, args) as R
  } as Mock<A, R>
  mock.calls = []
  mock.contexts = []
  mock.reset = () => {
    mock.calls.length = 0
    mock.contexts.length = 0
  }
  return mock
}

const isMock = (v: unknown): v is Mock => typeof v === 'function' && Array.isArray((v as Mock).calls)

type Matchers = {
  toBe(expected: unknown): void
  toEqual(expected: unknown): void
  toBeTruthy(): void
  toBeFalsy(): void
  toBeNull(): void
  toBeUndefined(): void
  toBeDefined(): void
  toBeInstanceOf(ctor: abstract new (...args: never[]) => unknown): void
  toBeGreaterThan(n: number): void
  toBeGreaterThanOrEqual(n: number): void
  toBeLessThan(n: number): void
  toBeLessThanOrEqual(n: number): void
  toContain(item: unknown): void
  toHaveLength(n: number): void
  toThrow(expected?: string | RegExp): void
  toHaveBeenCalled(): void
  toHaveBeenCalledTimes(n: number): void
  toHaveBeenCalledWith(...args: unknown[]): void
  toHaveBeenLastCalledWith(...args: unknown[]): void
}

export type Expectation = Matchers & {
  not: Matchers
  resolves: { [K in keyof Matchers]: (...args: Parameters<Matchers[K]>) => Promise<void> }
  rejects: { [K in keyof Matchers]: (...args: Parameters<Matchers[K]>) => Promise<void> }
}

function matchers(received: unknown, negate: boolean): Matchers {
  const assert = (pass: boolean, name: string, expectedText: string | null, receivedText = format(received)) => {
    if (pass !== negate) return
    const head = `expect(received)${negate ? '.not' : ''}.${name}`
    const lines = [head]
    if (expectedText !== null) lines.push(`${negate ? 'Expected not' : 'Expected'}: ${expectedText}`)
    lines.push(`Received: ${receivedText}`)
    throw new AssertionError(lines.join('\n'))
  }
  const mockOf = (name: string): Mock => {
    if (!isMock(received)) throw new AssertionError(`expect(received).${name}: received value must be a mock created with fn()`)
    return received
  }
  const calls = (m: Mock) => (m.calls.length ? m.calls.map((c) => `(${c.map((x) => format(x)).join(', ')})`).join(', ') : 'no calls')
  return {
    toBe: (e) => assert(Object.is(received, e), 'toBe(expected)', format(e)),
    toEqual: (e) => assert(equals(received, e), 'toEqual(expected)', format(e)),
    toBeTruthy: () => assert(!!received, 'toBeTruthy()', null),
    toBeFalsy: () => assert(!received, 'toBeFalsy()', null),
    toBeNull: () => assert(received === null, 'toBeNull()', 'null'),
    toBeUndefined: () => assert(received === undefined, 'toBeUndefined()', 'undefined'),
    toBeDefined: () => assert(received !== undefined, 'toBeDefined()', null),
    toBeInstanceOf: (c) => assert(received instanceof c, 'toBeInstanceOf(constructor)', c.name),
    toBeGreaterThan: (n) => assert((received as number) > n, 'toBeGreaterThan(n)', `> ${n}`),
    toBeGreaterThanOrEqual: (n) => assert((received as number) >= n, 'toBeGreaterThanOrEqual(n)', `>= ${n}`),
    toBeLessThan: (n) => assert((received as number) < n, 'toBeLessThan(n)', `< ${n}`),
    toBeLessThanOrEqual: (n) => assert((received as number) <= n, 'toBeLessThanOrEqual(n)', `<= ${n}`),
    toContain: (item) =>
      assert(
        typeof received === 'string' ? received.includes(item as string) : Array.isArray(received) && received.includes(item),
        'toContain(item)',
        format(item),
      ),
    toHaveLength: (n) => assert((received as { length?: number })?.length === n, 'toHaveLength(n)', String(n), `length ${format((received as { length?: number })?.length)}`),
    toThrow: (expected) => {
      if (typeof received !== 'function') throw new AssertionError('expect(received).toThrow(): received value must be a function')
      let thrown: unknown
      let did = false
      try {
        received()
      } catch (e) {
        did = true
        thrown = e
      }
      const message = thrown instanceof Error ? thrown.message : String(thrown)
      const ok = did && (expected === undefined || (typeof expected === 'string' ? message.includes(expected) : expected.test(message)))
      assert(ok, 'toThrow()', expected === undefined ? 'a thrown error' : format(expected), did ? `thrown ${format(thrown)}` : 'nothing was thrown')
    },
    toHaveBeenCalled: () => {
      const m = mockOf('toHaveBeenCalled()')
      assert(m.calls.length > 0, 'toHaveBeenCalled()', null, `${m.calls.length} calls`)
    },
    toHaveBeenCalledTimes: (n) => {
      const m = mockOf('toHaveBeenCalledTimes(n)')
      assert(m.calls.length === n, 'toHaveBeenCalledTimes(n)', `${n} calls`, `${m.calls.length} calls`)
    },
    toHaveBeenCalledWith: (...args) => {
      const m = mockOf('toHaveBeenCalledWith(...args)')
      assert(
        m.calls.some((c) => equals(c, args)),
        'toHaveBeenCalledWith(...args)',
        `(${args.map((x) => format(x)).join(', ')})`,
        calls(m),
      )
    },
    toHaveBeenLastCalledWith: (...args) => {
      const m = mockOf('toHaveBeenLastCalledWith(...args)')
      assert(
        m.calls.length > 0 && equals(m.calls[m.calls.length - 1], args),
        'toHaveBeenLastCalledWith(...args)',
        `(${args.map((x) => format(x)).join(', ')})`,
        calls(m),
      )
    },
  }
}

export function expect(received: unknown): Expectation {
  const settle = (mode: 'resolves' | 'rejects') =>
    new Proxy({} as Expectation['resolves'], {
      get: (_, name: string) =>
        async (...args: unknown[]) => {
          let value: unknown
          let rejected = false
          try {
            value = await received
          } catch (e) {
            rejected = true
            value = e
          }
          if (mode === 'resolves' && rejected) throw new AssertionError(`expect(promise).resolves: the promise rejected with ${format(value)}`)
          if (mode === 'rejects' && !rejected) throw new AssertionError(`expect(promise).rejects: the promise resolved with ${format(value)}`)
          const m = matchers(value, false) as unknown as Record<string, (...a: unknown[]) => void>
          if (typeof m[name] !== 'function') throw new AssertionError(`unknown matcher ${name}`)
          m[name](...args)
        },
    })
  return Object.assign(matchers(received, false), { not: matchers(received, true), resolves: settle('resolves'), rejects: settle('rejects') })
}
