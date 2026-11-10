import { describe, expect, it } from 'vitest'
import { foldTrace } from '../src/content/predict/trace'
import { predictProblems, quizProblems, snippetProblems, staticProblems, taskProblems } from './content-checks'
import { extractSnippets, runSnippet } from './snippets'
import { typeCheck } from './typecheck'

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

  it('ts examples: an unused @ts-expect-error and a real type error both fail', () => {
    const errors = typeCheck({ 'a.ts': '// @ts-expect-error: nothing wrong\nconst a: number = 1\nconst b: string = 2' })['a.ts']
    expect(errors.some((e) => e.includes("Unused '@ts-expect-error'"))).toBe(true)
    expect(errors.some((e) => e.includes('not assignable'))).toBe(true)
  })

  it('reads ts check/run blocks and runs TypeScript with types erased', () => {
    const md = '```ts check\nconst x: number = 1\n```\n\n```ts run\nconst y: string = "ok"\nconsole.log(y)\n```\n\n```output\nok\n```\n'
    const [check, run] = extractSnippets(md)
    expect([check.lang, check.mode, run.mode, run.expected]).toEqual(['ts', 'check', 'run', 'ok'])
    expect(runSnippet(run.code, 'ts')).toBe('ok')
  })

  it('runs js dom blocks inside a jsdom page', () => {
    const md = '```js dom\ndocument.body.innerHTML = "<p>a</p><p>b</p>"\nconsole.log(document.querySelectorAll("p").length)\n```\n\n```output\n2\n```\n'
    const [dom] = extractSnippets(md)
    expect([dom.mode, dom.expected]).toEqual(['dom', '2'])
    expect(runSnippet(dom.code, dom.lang, dom.mode)).toBe('2')
  })

  it('runs jsx dom blocks with React: act() flushes the render and its effects', () => {
    const code = [
      "import { act, useEffect, useState } from 'react'",
      "import { createRoot } from 'react-dom/client'",
      'function App() {',
      '  const [n, setN] = useState(0)',
      '  useEffect(() => { if (n === 0) setN(1) }, [n])',
      '  return <b>{n}</b>',
      '}',
      "const el = document.createElement('div')",
      'await act(() => createRoot(el).render(<App />))',
      'console.log(el.innerHTML)',
    ].join('\n')
    const [s] = extractSnippets('```jsx dom\n' + code + '\n```\n\n```output\n<b>1</b>\n```\n')
    expect([s.lang, s.mode]).toEqual(['jsx', 'dom'])
    expect(runSnippet(s.code, s.lang, s.mode)).toBe('<b>1</b>')
  })

  it('runs Angular examples in JIT mode with signal inputs visible to the compiler', () => {
    const code = [
      "import { Component, input } from '@angular/core'",
      "import { createApplication } from '@angular/platform-browser'",
      "@Component({ selector: 'hello-name', template: `Hello {{ name() }}` })",
      'class Hello {',
      '  name = input.required<string>()',
      '}',
      "@Component({ selector: 'app-root', imports: [Hello], template: `<hello-name name=\"Ann\" />` })",
      'class App {}',
      "document.body.innerHTML = '<app-root></app-root>'",
      'const app = await createApplication()',
      'app.bootstrap(App)',
      'await app.whenStable()',
      'console.log(document.body.textContent)',
    ].join('\n')
    expect(runSnippet(code, 'ts', 'dom')).toBe('Hello Ann')
  }, 30_000)

  it('type-checks tsx against the React types', () => {
    const ok = "import { useRef } from 'react'\nexport const El = () => { const r = useRef<HTMLInputElement>(null); return <input ref={r} /> }"
    expect(typeCheck({ 'ok.tsx': ok })['ok.tsx']).toEqual([])
    const bad = 'export const El = () => <input value={1n} />'
    expect(typeCheck({ 'bad.tsx': bad })['bad.tsx'].length).toBeGreaterThan(0)
  })
})
