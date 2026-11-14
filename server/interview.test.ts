import { describe, expect, test } from 'vitest'
import type { InterviewRequest } from '../src/interview/types'
import { buildGradePrompt, buildTurnPrompt, describeBoard, gradeAxes, interviewGradeSystem, interviewSystem, transcript } from './interview'

const design = (over: Partial<InterviewRequest> = {}): InterviewRequest => ({
  locale: 'ru',
  mode: 'standard',
  subject: { format: 'design', title: 'Лента', prompt: 'Спроектируйте ленту.', facts: ['СЕКРЕТНЫЙ ФАКТ'], focus: ['пагинация курсором'] },
  history: [{ role: 'interviewer', text: 'С чего начнёте?' }],
  elapsedMin: 1,
  durationMin: 45,
  board: { nodes: [{ id: 'v1', type: 'view', label: 'Лента', x: 0, y: 0 }], edges: [{ id: 'e1', source: 'v1', target: 'api', label: 'GET /feed' }], notes: { r: 'текст и фото' } },
  ...over,
})

describe('interviewer system prompt', () => {
  test('is written in the session language and carries the mode rules', () => {
    expect(interviewSystem('design', 'strict', 'ru')).toContain('СТРОГИЙ')
    expect(interviewSystem('design', 'strict', 'en')).toContain('STRICT')
    expect(interviewSystem('coding', 'coach', 'en')).toContain('COACH')
    expect(interviewSystem('theory', 'standard', 'ru')).toContain('программы')
  })
})

describe('turn prompt', () => {
  test('a design turn reveals hidden facts to the interviewer, shows the board and the phase', () => {
    const p = buildTurnPrompt(design())
    expect(p).toContain('СЕКРЕТНЫЙ ФАКТ')
    expect(p).toContain('v1 → api (GET /feed)')
    expect(p).toContain('R: текст и фото')
    expect(p).toContain('Требования')
  })

  test('near the end the interviewer is asked to wrap up', () => {
    expect(buildTurnPrompt(design({ elapsedMin: 42 }))).toContain('подводи к итогу')
    expect(buildTurnPrompt(design({ locale: 'en', elapsedMin: 42 }))).toContain('wrap-up')
  })

  test('a hint request is passed to the interviewer', () => {
    expect(buildTurnPrompt(design(), true)).toContain('подсказку')
  })

  test('a coding turn includes the code and the failing tests', () => {
    const p = buildTurnPrompt({
      locale: 'en',
      mode: 'standard',
      subject: { format: 'coding', title: 'debounce', statement: 'Write debounce.', tests: ['waits'] },
      history: [],
      elapsedMin: 10,
      durationMin: 45,
      coding: { code: 'export function debounce() {}', run: { passed: 1, total: 3, failures: ['waits: expected 1'] } },
    })
    expect(p).toContain('export function debounce() {}')
    expect(p).toContain('passed 1/3')
    expect(p).toContain('✗ waits: expected 1')
  })

  test('a theory turn lists the syllabus', () => {
    const p = buildTurnPrompt({
      locale: 'en',
      mode: 'strict',
      subject: { format: 'theory', title: 'Security', topics: [{ title: 'XSS', summary: 'Kinds of XSS' }] },
      history: [],
      elapsedMin: 0,
      durationMin: 30,
    })
    expect(p).toContain('- XSS: Kinds of XSS')
    expect(p).toContain('Warm-up')
  })
})

describe('grading', () => {
  test('the grading prompt hides the facts but keeps the focus and the board', () => {
    const p = buildGradePrompt(design())
    expect(p).not.toContain('СЕКРЕТНЫЙ ФАКТ')
    expect(p).toContain('пагинация курсором')
    expect(p).toContain('GET /feed')
  })

  test('every format has six named axes in both languages, listed in the grader prompt', () => {
    for (const format of ['theory', 'coding', 'design'] as const) {
      expect(gradeAxes[format]).toHaveLength(6)
      for (const axis of gradeAxes[format]) {
        expect(interviewGradeSystem(format, 'ru')).toContain(`«${axis.ru}»`)
        expect(interviewGradeSystem(format, 'en')).toContain(`«${axis.en}»`)
      }
    }
  })

  test('hint turns are marked in the transcript, not shown as answers', () => {
    expect(transcript([{ role: 'candidate', text: 'ignored', hint: true }], 'en')).toBe('Candidate: [asked for a hint]')
  })

  test('an empty board is described as empty', () => {
    expect(describeBoard({ nodes: [], edges: [], notes: { r: '  ' } }, 'en')).toBe('(empty)')
  })
})
