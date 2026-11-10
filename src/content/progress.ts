import { codeKey, codingTasks } from './coding'
import { examKey, LESSON_PASS, lessonKey, lessons, modules } from './lessons'
import { predictKey, predictTasks } from './predict'

type Results = Record<string, { best: number }>

export const LESSON_XP = 15
export const EXAM_XP = 60
export const CODE_XP = 30
export const PREDICT_XP = 10

export const lessonDone = (results: Results, id: string) => (results[lessonKey(id)]?.best ?? 0) >= LESSON_PASS

export function examDone(results: Results, track: string): boolean {
  const m = modules.find((x) => x.track === track)
  return !!m && (results[examKey(track)]?.best ?? 0) >= Math.round(m.exam.pass * 100)
}

/** XP is always recomputed from results, so the economy can change without migrating saved data. */
export function totalXp(results: Results): number {
  const l = lessons.filter((x) => lessonDone(results, x.id)).length * LESSON_XP
  const e = modules.filter((m) => examDone(results, m.track)).length * EXAM_XP
  const c = codingTasks.filter((x) => codeSolved(results, x.id)).length * CODE_XP
  const p = predictTasks.filter((x) => predictSolved(results, x.id)).length * PREDICT_XP
  return l + e + c + p
}

export const predictSolved = (results: Results, id: string) => (results[predictKey(id)]?.best ?? 0) >= 100

/** A coding task counts as solved when every test passed at least once. */
export const codeSolved = (results: Results, id: string) => (results[codeKey(id)]?.best ?? 0) >= 100

export function moduleProgress(results: Results, track: string) {
  const m = modules.find((x) => x.track === track)
  if (!m) return null
  const done = m.lessons.filter((id) => lessonDone(results, id)).length
  const exam = examDone(results, track)
  return { done, total: m.lessons.length, exam, pct: (done + (exam ? 1 : 0)) / (m.lessons.length + 1) }
}
