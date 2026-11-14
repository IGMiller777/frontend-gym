import { describe, expect, test } from 'vitest'
import { codingTasks } from '../content/coding'
import { getLesson, modules } from '../content/lessons'
import { INTERVIEW_XP, totalXp } from '../content/progress'
import { locales } from '../i18n/types'
import { phaseAt, phases } from './phases'
import { designProblems } from './problems'
import { buildRequest, buildSubject, HINTS_PER_SESSION, interviewKey, newSession } from './session'

describe('design problems', () => {
  test('ids are unique and every text exists in every language', () => {
    expect(new Set(designProblems.map((p) => p.id)).size).toBe(designProblems.length)
    for (const p of designProblems)
      for (const locale of locales) {
        expect(p.title[locale].trim(), p.id).not.toBe('')
        expect(p.prompt[locale].trim(), p.id).not.toBe('')
        expect(p.facts[locale].length, `${p.id} facts`).toBeGreaterThanOrEqual(3)
        expect(p.focus[locale].length, `${p.id} focus`).toBeGreaterThanOrEqual(4)
      }
  })

  test('facts and focus have the same number of items in both languages', () => {
    for (const p of designProblems) {
      expect(p.facts.en.length, p.id).toBe(p.facts.ru.length)
      expect(p.focus.en.length, p.id).toBe(p.focus.ru.length)
    }
  })

  test('the preparation lesson exists', () => {
    for (const p of designProblems) expect(getLesson(p.lesson), p.id).toBeDefined()
  })
})

describe('phases', () => {
  test('every format ends at the full duration and phases go forward', () => {
    for (const list of Object.values(phases)) {
      expect(list.at(-1)!.until).toBeGreaterThan(1)
      for (let i = 1; i < list.length; i++) expect(list[i].until).toBeGreaterThan(list[i - 1].until)
    }
  })

  test('the phase follows the elapsed time, and overtime stays in the last phase', () => {
    expect(phaseAt('design', 0, 45).phase.name.en).toBe('Requirements')
    expect(phaseAt('design', 20, 45).phase.name.en).toBe('API')
    expect(phaseAt('design', 99, 45).phase.name.en).toBe('Wrap-up')
  })
})

describe('sessions', () => {
  test('every module and every coding task can be an interview subject', () => {
    for (const m of modules) {
      const s = buildSubject({ format: 'theory', subjectId: m.track, locale: 'en' })
      expect(s?.format === 'theory' && s.topics.length, m.track).toBe(m.lessons.length)
    }
    for (const task of codingTasks) {
      const s = buildSubject({ format: 'coding', subjectId: task.id, locale: 'ru' }, 'statement')
      expect(s?.format === 'coding' && s.tests.length, task.id).toBe(task.tests.length)
    }
  })

  test('a new design session starts with an empty board, a coding one with the starter code', () => {
    const opts = { mode: 'standard' as const, durationMin: 45, locale: 'ru' as const, opening: 'Привет', now: 0 }
    const d = newSession('design', 'news-feed', opts)
    expect(d.board).toEqual({ nodes: [], edges: [], notes: {} })
    expect(d.history).toEqual([{ role: 'interviewer', text: 'Привет' }])
    expect(d.hintsLeft).toBe(HINTS_PER_SESSION)
    const c = newSession('coding', codingTasks[0].id, opts)
    expect(c.coding?.code).toBe(codingTasks[0].starter)
    expect(newSession('theory', 'security', { ...opts, mode: 'coach' }).hintsLeft).toBe(0)
  })

  test('the request is built in the session language even if it differs from the interface', () => {
    const s = newSession('design', 'chat', { mode: 'strict', durationMin: 30, locale: 'en', opening: 'Hi', now: 0 })
    const req = buildRequest(s, 5, s.history)!
    expect(req.locale).toBe('en')
    expect(req.subject.format === 'design' && req.subject.title).toBe('Chat app')
  })

  test('an unknown subject builds no request', () => {
    expect(buildSubject({ format: 'design', subjectId: 'nope', locale: 'en' })).toBeNull()
  })
})

describe('XP', () => {
  test('an interview gives XP once its best score reaches 70', () => {
    const base = totalXp({})
    expect(totalXp({ [interviewKey('design', 'chat')]: { best: 69 } })).toBe(base)
    expect(totalXp({ [interviewKey('design', 'chat')]: { best: 70 } })).toBe(base + INTERVIEW_XP)
  })
})
