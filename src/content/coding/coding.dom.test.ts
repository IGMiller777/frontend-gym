// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { runDomTests } from '../../runner/dom-runtime'
import { typeCheck } from '../../../scripts/typecheck'
import { codingTasks } from '.'

/** DOM tasks: the same guarantees as plain tasks, run with a real document (jsdom here, the sandboxed iframe in the app). */
const tasks = codingTasks.filter((t) => t.runtime === 'dom')
const files = Object.fromEntries(tasks.flatMap((t) => [[`${t.id}.solution.ts`, t.solution], [`${t.id}.starter.ts`, t.starter]]))
let diagnostics: Record<string, string[]> | undefined
const diagnosticsFor = (name: string) => (diagnostics ??= typeCheck(files))[name]

describe.each(tasks.map((t) => [t.id, t] as const))('DOM task %s', (id, task) => {
  it('reference solution passes every test', async () => {
    const r = await runDomTests(task.solution, task.tests)
    expect(r.error).toBeUndefined()
    expect(r.tests.map((t, i) => (t.ok ? 'ok' : `${task.tests[i].name.en}: ${t.error}`))).toEqual(task.tests.map(() => 'ok'))
  })

  it('starter fails at least one test (the tests check something)', async () => {
    const r = await runDomTests(task.starter, task.tests, { testTimeoutMs: 500 })
    expect(r.error ?? r.tests.some((t) => !t.ok)).toBeTruthy()
  })

  it('starter and solution type-check', () => {
    expect(diagnosticsFor(`${id}.solution.ts`)).toEqual([])
    expect(diagnosticsFor(`${id}.starter.ts`).filter((e) => !/is declared but|never read/.test(e))).toEqual([])
  }, 60_000)

  it('has visible tests and hidden ones', () => {
    expect(task.tests.some((t) => !t.hidden)).toBe(true)
    expect(task.tests.some((t) => t.hidden)).toBe(true)
  })
})
