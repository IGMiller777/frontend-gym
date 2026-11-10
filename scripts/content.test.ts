import { describe, expect, it } from 'vitest'
import { quizProblems, snippetProblems, staticProblems, taskProblems } from './content-checks'
import { extractSnippets } from './snippets'

describe('content', () => {
  it('passes static checks (files, ru/en parity, sources, links, quizzes)', () => {
    expect(staticProblems()).toEqual([])
  })

  it('coding tasks have both languages, sources and the same structure', () => {
    expect(taskProblems()).toEqual([])
  })

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
})
