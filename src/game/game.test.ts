import { describe, expect, test } from 'vitest'
import { codeKey, codingTasks } from '../content/coding'
import { examKey, lessonKey, lessons, modules } from '../content/lessons'
import { INCIDENT_COUNT, incidentKey, totalXp } from '../content/progress'
import { locales } from '../i18n/types'
import { scenarios } from '../perf/scenarios'
import { dayKey } from '../store'
import { achievements, questDone, questPool, questsFor, rankOf, ranks, type Results, type Snapshot, unlocked } from './game'
import { diff } from './watcher'

const at = new Date('2026-11-14T12:00:00Z').getTime()
const today = dayKey(new Date(at))
const yesterday = dayKey(new Date(at - 86_400_000))
const result = (score: number, when = at) => ({ best: score, attempts: [{ at: when, score }] })
const snap = (results: Results, days: string[] = []): Snapshot => ({ results, days })

describe('ranks', () => {
  test('ranks go up with XP, and the last one has no next', () => {
    expect(rankOf(0).current.name.en).toBe('Intern')
    expect(rankOf(ranks[1].xp).current.name.en).toBe('Junior')
    expect(rankOf(ranks[1].xp - 1).current.name.en).toBe('Intern')
    expect(rankOf(99_999)).toMatchObject({ next: undefined, progress: 1 })
    expect(rankOf(ranks[1].xp + (ranks[2].xp - ranks[1].xp) / 2).progress).toBeCloseTo(0.5)
  })

  test('the top rank is reachable with the content alone', () => {
    const all: Results = {}
    for (const l of lessons) all[lessonKey(l.id)] = result(100)
    for (const m of modules) all[examKey(m.track)] = result(100)
    for (const c of codingTasks) all[codeKey(c.id)] = result(100)
    for (const s of scenarios) all[incidentKey(s.id)] = result(100)
    expect(totalXp(all)).toBeGreaterThanOrEqual(ranks.at(-1)!.xp)
  })
})

describe('achievements', () => {
  test('ids are unique and texts exist in both languages', () => {
    expect(new Set(achievements.map((a) => a.id)).size).toBe(achievements.length)
    for (const a of achievements) for (const l of locales) expect(a.title[l].trim() && a.text[l].trim(), a.id).not.toBe('')
  })

  test('nothing is unlocked on a fresh profile', () => {
    expect(unlocked(snap({}))).toEqual([])
  })

  test('each kind of progress unlocks its achievement', () => {
    expect(unlocked(snap({ [lessonKey(lessons[0].id)]: result(100) }))).toContain('first-lesson')
    expect(unlocked(snap({ [codeKey(codingTasks[0].id)]: result(100) }))).toContain('code-1')
    expect(unlocked(snap({ [codeKey(codingTasks[0].id)]: result(80) }))).not.toContain('code-1')
    expect(unlocked(snap({ [incidentKey('black-friday')]: result(100) }))).toEqual(expect.arrayContaining(['incident-1', 'black-friday']))
    expect(unlocked(snap({ 'interview:design:chat': result(72) }))).toContain('offer')
    expect(unlocked(snap({ 'interview:design:chat': result(72) }))).not.toContain('interview-formats')
    const formats = { 'interview:design:chat': result(72), 'interview:coding:debounce': result(75), 'interview:theory:react': result(90) }
    expect(unlocked(snap(formats))).toEqual(expect.arrayContaining(['interview-formats', 'staff-interview']))
  })

  test('the streak achievement needs consecutive days ending today or yesterday', () => {
    const days = [0, 1, 2].map((d) => dayKey(new Date(Date.now() - d * 86_400_000)))
    expect(unlocked(snap({}, days))).toContain('streak-3')
  })

  test('the night owl is secret and comes from the attempt time', () => {
    const owl = achievements.find((a) => a.id === 'night-owl')!
    expect(owl.secret).toBe(true)
    const night = new Date(at)
    night.setHours(2, 0, 0, 0)
    expect(owl.test(snap({ x: result(10, night.getTime()) }))).toBe(true)
  })

  test('the incident count matches the scenarios', () => {
    expect(INCIDENT_COUNT).toBe(scenarios.length)
  })
})

describe('daily quests', () => {
  test('three different quests per day, stable within the day, never both lesson sizes', () => {
    for (let d = 0; d < 60; d++) {
      const day = dayKey(new Date(at + d * 86_400_000))
      const qs = questsFor(day)
      expect(qs).toHaveLength(3)
      expect(new Set(qs.map((q) => q.id)).size).toBe(3)
      expect(qs.some((q) => q.id === 'lesson') && qs.some((q) => q.id === 'lessons')).toBe(false)
      expect(questsFor(day)).toEqual(qs)
    }
  })

  test('the set of quests changes across days and covers the whole pool', () => {
    const seen = new Set<string>()
    for (let d = 0; d < 60; d++) for (const q of questsFor(dayKey(new Date(at + d * 86_400_000)))) seen.add(q.id)
    expect(seen.size).toBe(questPool.length)
  })

  test('without AI the interview quest is never offered', () => {
    for (let d = 0; d < 60; d++) expect(questsFor(dayKey(new Date(at + d * 86_400_000)), false).map((q) => q.id)).not.toContain('interview')
  })

  test('only attempts made today count', () => {
    const q = questPool.find((x) => x.id === 'code')!
    expect(questDone(q, { [codeKey('a')]: result(100) }, today)).toBe(true)
    expect(questDone(q, { [codeKey('a')]: result(100, at - 86_400_000) }, today)).toBe(false)
    expect(questDone(q, { [codeKey('a')]: result(100) }, yesterday)).toBe(false)
    const two = questPool.find((x) => x.id === 'predict')!
    expect(two.count({ 'predict:a': result(100), 'predict:b': result(100), 'predict:c': result(50) }, today)).toBe(2)
  })
})

describe('notifications', () => {
  test('a new achievement and a rank-up produce toasts; no change produces none', () => {
    const before = snap({})
    const all: Results = {}
    for (const l of lessons.slice(0, 25)) all[lessonKey(l.id)] = result(100)
    const after = snap(all)
    const toasts = diff(before, after, today)
    expect(toasts.map((t) => t.kind)).toEqual(expect.arrayContaining(['achievement', 'rank']))
    expect(toasts.find((t) => t.kind === 'rank')!.text.en).toBe('Junior')
    expect(diff(after, after, today)).toEqual([])
  })

  test('a finished daily quest produces a toast once', () => {
    const quest = questsFor(today)[0]
    const done: Results = {}
    // Fill everything a quest could count, so the first quest of the day is surely done.
    for (const l of lessons.slice(0, 2)) done[lessonKey(l.id)] = result(100)
    done[codeKey('a')] = result(100)
    done['predict:a'] = result(100)
    done['predict:b'] = result(100)
    done[examKey(modules[0].track)] = result(100)
    done[incidentKey('slow-hero')] = result(100)
    done['interview:design:chat'] = result(40)
    expect(questDone(quest, done, today)).toBe(true)
    const toasts = diff(snap({}), snap(done), today)
    expect(toasts.filter((t) => t.kind === 'quest')).toHaveLength(3)
    expect(diff(snap(done), snap({ ...done, x: result(1) }), today).filter((t) => t.kind === 'quest')).toHaveLength(0)
  })
})
