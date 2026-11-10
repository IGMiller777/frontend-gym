import { describe, expect, it } from 'vitest'
import { runTests } from '../../runner/harness'
import { typeCheck } from '../../../scripts/typecheck'
import { codingTasks } from '.'

const files = Object.fromEntries(codingTasks.flatMap((t) => [[`${t.id}.solution.ts`, t.solution], [`${t.id}.starter.ts`, t.starter]]))
let diagnostics: Record<string, string[]> | undefined
const diagnosticsFor = (name: string) => (diagnostics ??= typeCheck(files))[name]

describe.each(codingTasks.map((t) => [t.id, t] as const))('coding task %s', (id, task) => {
  it('reference solution passes every test', async () => {
    const r = await runTests(task.solution, task.tests)
    expect(r.error).toBeUndefined()
    expect(r.tests.map((t, i) => (t.ok ? 'ok' : `${task.tests[i].name.en}: ${t.error}`))).toEqual(task.tests.map(() => 'ok'))
  })

  it('starter fails at least one test (the tests check something)', async () => {
    const r = await runTests(task.starter, task.tests, { testTimeoutMs: 200 })
    expect(r.error ?? r.tests.some((t) => !t.ok)).toBeTruthy()
  })

  it('starter and solution type-check', () => {
    expect(diagnosticsFor(`${id}.solution.ts`)).toEqual([])
    // Starters are stubs: unused parameters are expected there.
    expect(diagnosticsFor(`${id}.starter.ts`).filter((e) => !/is declared but|never read/.test(e))).toEqual([])
  }, 30_000)

  it('has tests visible to the learner and hidden ones', () => {
    expect(task.tests.some((t) => !t.hidden)).toBe(true)
    expect(task.tests.some((t) => t.hidden)).toBe(true)
  })
})
