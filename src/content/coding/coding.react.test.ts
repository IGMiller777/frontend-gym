// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { runReactTests } from '../../runner/react-runtime'
import { typeCheck } from '../../../scripts/typecheck'
import { codingTasks } from '.'

/** Component tasks: the same guarantees as plain tasks, run against React in jsdom. */
const tasks = codingTasks.filter((t) => t.runtime === 'react')
const files = Object.fromEntries(tasks.flatMap((t) => [[`${t.id}.solution.tsx`, t.solution], [`${t.id}.starter.tsx`, t.starter]]))
let diagnostics: Record<string, string[]> | undefined
const diagnosticsFor = (name: string) => (diagnostics ??= typeCheck(files))[name]

describe.each(tasks.map((t) => [t.id, t] as const))('component task %s', (id, task) => {
  it('reference solution passes every test', async () => {
    const r = await runReactTests(task.solution, task.tests)
    expect(r.error).toBeUndefined()
    expect(r.tests.map((t, i) => (t.ok ? 'ok' : `${task.tests[i].name.en}: ${t.error}`))).toEqual(task.tests.map(() => 'ok'))
  })

  it('starter fails at least one test (the tests check something)', async () => {
    const r = await runReactTests(task.starter, task.tests, { testTimeoutMs: 500 })
    expect(r.error ?? r.tests.some((t) => !t.ok)).toBeTruthy()
  })

  it('starter and solution type-check as TSX', () => {
    expect(diagnosticsFor(`${id}.solution.tsx`)).toEqual([])
    expect(diagnosticsFor(`${id}.starter.tsx`).filter((e) => !/is declared but|never read/.test(e))).toEqual([])
  }, 60_000)

  it('has a preview export, visible tests and hidden ones', async () => {
    expect(task.preview && task.solution.includes(`export function ${task.preview}`) && task.starter.includes(`export function ${task.preview}`)).toBeTruthy()
    expect(task.tests.some((t) => !t.hidden)).toBe(true)
    expect(task.tests.some((t) => t.hidden)).toBe(true)
  })
})
