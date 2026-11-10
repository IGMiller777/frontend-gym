import { describe, expect, it } from 'vitest'
import { foldTrace } from '../src/content/predict/trace'
import { predictProblems, quizProblems, snippetProblems, staticProblems, taskProblems } from './content-checks'
import { extractSnippets } from './snippets'

describe('content', () => {
  it('passes static checks (files, ru/en parity, sources, links, quizzes)', () => {
    expect(staticProblems()).toEqual([])
  })

  it('coding tasks have both languages, sources and the same structure', () => {
    expect(taskProblems()).toEqual([])
  })

  it('"what does it print" answers match a real run, traces follow the event-loop rules', () => {
    expect(predictProblems()).toEqual([])
  }, 60_000)

  it('every runnable example prints exactly its output block', () => {
    expect(snippetProblems()).toEqual([])
  }, 60_000)
})

describe('checkers catch mistakes', () => {
  it('extracts examples with their output', () => {
    const md = 'text\n\n```js run\nconsole.log(1)\n```\n\n```output\n1\n```\n\n```js run\nlet a\n```\n'
    expect(extractSnippets(md).map((s) => [s.code, s.expected])).toEqual([
      ['console.log(1)\n', '1'],
      ['let a\n', null],
    ])
  })

  it('flags a giveaway answer and mismatched languages', () => {
    const q = (correct: number, options: string[]) => ({ q: 'Q', options, correct, why: 'because' })
    const problems = quizProblems('t', {
      ru: [q(0, ['очень длинный и подробный правильный ответ', 'нет', 'да'])],
      en: [q(1, ['a', 'b', 'c'])],
    })
    expect(problems.some((p) => p.includes('correct index differs'))).toBe(true)
    expect(problems.some((p) => p.includes('much longer'))).toBe(true)
  })

  it('trace checker rejects a task that runs before microtasks are drained', () => {
    const { problems } = foldTrace([
      { op: 'call', label: 'script', line: 1 },
      { op: 'timer', label: 't', line: 1, ms: 0 },
      { op: 'micro', label: 'm', line: 2 },
      { op: 'return' },
      { op: 'expire', label: 't' },
      { op: 'run-task' },
      { op: 'return' },
      { op: 'run-micro' },
      { op: 'return' },
    ])
    expect(problems.some((p) => p.includes('microtask queue is drained'))).toBe(true)
  })

  it('trace checker rejects timers expiring out of order', () => {
    const { problems } = foldTrace([
      { op: 'call', label: 'script', line: 1 },
      { op: 'timer', label: 'slow', line: 1, ms: 10 },
      { op: 'timer', label: 'fast', line: 2, ms: 0 },
      { op: 'return' },
      { op: 'expire', label: 'slow' },
    ])
    expect(problems.some((p) => p.includes('"fast" is due before "slow"'))).toBe(true)
  })
})
