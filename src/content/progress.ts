import { codeKey, codingTasks } from './coding'
import { examKey, LESSON_PASS, lessonKey, lessons, modules } from './lessons'
import { predictKey, predictTasks } from './predict'

type Results = Record<string, { best: number }>

export const LESSON_XP = 15
export const EXAM_XP = 60
export const CODE_XP = 30
export const PREDICT_XP = 10
export const INTERVIEW_XP = 40
/** An interview counts toward XP once its best score would pass at senior level. */
export const INTERVIEW_PASS = 70
export const INCIDENT_XP = 35
/** Number of incident scenarios; kept here so the main bundle does not import the simulator (a test checks it). */
export const INCIDENT_COUNT = 8

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
  const i = Object.entries(results).filter(([key, r]) => key.startsWith('interview:') && r.best >= INTERVIEW_PASS).length * INTERVIEW_XP
  const n = Object.entries(results).filter(([key, r]) => key.startsWith('incident:') && r.best >= 100).length * INCIDENT_XP
  return l + e + c + p + i + n
}

export const incidentKey = (id: string) => `incident:${id}`
/** An incident counts as solved when it was won at least once (a win is recorded as 100). */
export const incidentSolved = (results: Results, id: string) => (results[incidentKey(id)]?.best ?? 0) >= 100

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
