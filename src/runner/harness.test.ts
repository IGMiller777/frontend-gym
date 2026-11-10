import { describe, expect as vexpect, it } from 'vitest'
import { compile, load, runTests } from './harness'
import { equals, expect, fn, format } from './expect'

describe('compile and load', () => {
  it('strips TypeScript and exposes exports', () => {
    const mod = load('export function add(a: number, b: number): number { return a + b }\nexport const x: string = "y"')
    vexpect((mod.add as (a: number, b: number) => number)(2, 3)).toBe(5)
    vexpect(mod.x).toBe('y')
  })
  it('reports syntax errors with a position', () => {
    vexpect(() => compile('export function (')).toThrow(/\(1:/)
  })
  it('refuses imports', () => {
    vexpect(() => load('import x from "lodash"\nexport const y = x')).toThrow(/not available/)
  })
})

describe('expect', () => {
  it('compares structurally', () => {
    vexpect(equals({ a: [1, { b: NaN }] }, { a: [1, { b: NaN }] })).toBe(true)
    vexpect(equals(new Map([[1, new Set([2])]]), new Map([[1, new Set([2])]]))).toBe(true)
    const sparse: unknown[] = []
    sparse[0] = 1
    sparse[2] = 3
    vexpect(equals(sparse, [1, undefined, 3])).toBe(false)
    vexpect(equals({ a: 1 }, { a: 1, b: undefined })).toBe(false)
    vexpect(equals(new Date(5), new Date(5))).toBe(true)
    const a: Record<string, unknown> = {}
    a.self = a
    const b: Record<string, unknown> = {}
    b.self = b
    vexpect(equals(a, b)).toBe(true)
  })
  it('formats values readably', () => {
    vexpect(format({ a: [1, 'x'], m: new Map([[1, 2]]) })).toBe('{ a: [1, "x"], m: Map(1) {1 => 2} }')
    const c: Record<string, unknown> = {}
    c.c = c
    vexpect(format(c)).toBe('{ c: [Circular] }')
  })
  it('throws a diff on failure', () => {
    vexpect(() => expect(1).toBe(2)).toThrow('Expected: 2\nReceived: 1')
    vexpect(() => expect([1]).not.toEqual([1])).toThrow('Expected not')
  })
  it('records mock calls', () => {
    const spy = fn((x: number) => x * 2)
    vexpect(spy(2)).toBe(4)
    expect(spy).toHaveBeenCalledWith(2)
    expect(spy).toHaveBeenCalledTimes(1)
    vexpect(() => expect(spy).toHaveBeenCalledTimes(2)).toThrow('2 calls')
  })
  it('awaits resolves and rejects', async () => {
    await expect(Promise.resolve(3)).resolves.toBe(3)
    await expect(Promise.reject(new Error('no'))).rejects.toBeInstanceOf(Error)
    await vexpect(expect(Promise.resolve(1)).rejects.toBe(1)).rejects.toThrow('resolved with 1')
  })
})

describe('runTests', () => {
  const source = 'export const double = (x: number) => x * 2'
  it('passes and fails tests independently', async () => {
    const r = await runTests(source, [{ code: 'expect(double(2)).toBe(4)' }, { code: 'expect(double(2)).toBe(5)' }])
    vexpect(r.error).toBeUndefined()
    vexpect(r.tests.map((t) => t.ok)).toEqual([true, false])
    vexpect(r.tests[1].error).toContain('Expected: 5')
  })
  it('captures console output', async () => {
    const r = await runTests('console.log("hi", { a: 1 })\nexport const f = 1', [{ code: 'console.log(f)' }])
    vexpect(r.logs).toEqual(['hi { a: 1 }', '1'])
  })
  it('returns a load error instead of running tests', async () => {
    const r = await runTests('export const = 1', [{ code: '' }])
    vexpect(r.error).toBeDefined()
    vexpect(r.tests).toEqual([])
  })
  it('gives each test a fresh module', async () => {
    const r = await runTests('let n = 0\nexport const inc = () => ++n', [{ code: 'expect(inc()).toBe(1)' }, { code: 'expect(inc()).toBe(1)' }])
    vexpect(r.tests.every((t) => t.ok)).toBe(true)
  })
  it('drives fake timers', async () => {
    const r = await runTests('export const later = (cb: () => void) => setTimeout(cb, 100)', [
      { fakeTimers: true, code: 'const spy = fn(); later(spy); clock.tick(99); expect(spy).toHaveBeenCalledTimes(0); clock.tick(1); expect(spy).toHaveBeenCalledTimes(1)' },
      { fakeTimers: true, code: 'const t0 = Date.now(); clock.tick(250); expect(Date.now() - t0).toBe(250)' },
      { fakeTimers: true, code: 'const seen = []; const p = new Promise(r => setTimeout(r, 50)).then(() => seen.push(1)); await clock.tickAsync(50); expect(seen).toEqual([1]); await p' },
    ])
    vexpect(r.tests.map((t) => t.error ?? 'ok')).toEqual(['ok', 'ok', 'ok'])
    vexpect(globalThis.setTimeout.name).not.toBe('')
  })
  it('times out a test whose promise never settles', async () => {
    const r = await runTests('export const never = () => new Promise(() => {})', [{ code: 'await never()' }], { testTimeoutMs: 50 })
    vexpect(r.tests[0].error).toMatch(/Timeout/)
  })
})
