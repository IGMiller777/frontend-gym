import { codeKey, codingTasks } from '../content/coding'
import { examKey, LESSON_PASS, lessonKey, lessons, modules } from '../content/lessons'
import { predictKey, predictTasks } from '../content/predict'
import { examDone, INCIDENT_COUNT, INTERVIEW_PASS, incidentKey, totalXp } from '../content/progress'
import type { Localized } from '../i18n/types'
import { dayKey, streak } from '../store'

/**
 * The game layer is computed from saved results only: ranks from XP, achievements from results and
 * days, daily quests from today's attempts. Nothing extra is stored, so it cannot drift from progress.
 */

export type Results = Record<string, { best: number; attempts: { at: number; score: number }[] }>

export interface Snapshot {
  results: Results
  days: string[]
}

// ───────────── Ranks ─────────────

export const ranks: { xp: number; name: Localized; emoji: string }[] = [
  { xp: 0, name: { ru: 'Стажёр', en: 'Intern' }, emoji: '🌱' },
  { xp: 300, name: { ru: 'Junior', en: 'Junior' }, emoji: '🐣' },
  { xp: 1200, name: { ru: 'Middle', en: 'Middle' }, emoji: '🛠️' },
  { xp: 2500, name: { ru: 'Senior', en: 'Senior' }, emoji: '🚀' },
  { xp: 4000, name: { ru: 'Staff', en: 'Staff' }, emoji: '🧠' },
]

export function rankOf(xp: number) {
  const index = ranks.reduce((best, r, i) => (xp >= r.xp ? i : best), 0)
  const current = ranks[index]
  const next = ranks[index + 1]
  return { index, current, next, progress: next ? (xp - current.xp) / (next.xp - current.xp) : 1 }
}

// ───────────── Achievements ─────────────

const passedLessons = (r: Results) => lessons.filter((l) => (r[lessonKey(l.id)]?.best ?? 0) >= LESSON_PASS).length
const passedExams = (r: Results) => modules.filter((m) => examDone(r, m.track)).length
const solvedCode = (r: Results) => codingTasks.filter((t) => (r[codeKey(t.id)]?.best ?? 0) >= 100).length
const solvedPredict = (r: Results) => predictTasks.filter((t) => (r[predictKey(t.id)]?.best ?? 0) >= 100).length
const wonIncidents = (r: Results) => Object.entries(r).filter(([k, v]) => k.startsWith('incident:') && v.best >= 100).length
const interviewBest = (r: Results, format?: string) =>
  Math.max(0, ...Object.entries(r).filter(([k]) => k.startsWith(format ? `interview:${format}:` : 'interview:')).map(([, v]) => v.best))

export interface Achievement {
  id: string
  emoji: string
  title: Localized
  text: Localized
  /** Hidden until unlocked. */
  secret?: boolean
  test: (s: Snapshot) => boolean
  /** Progress toward the goal, for the profile page. */
  progress?: (s: Snapshot) => { value: number; goal: number }
}

const goal = (count: (r: Results) => number, n: number) => ({
  test: (s: Snapshot) => count(s.results) >= n,
  progress: (s: Snapshot) => ({ value: Math.min(n, count(s.results)), goal: n }),
})

export const achievements: Achievement[] = [
  { id: 'first-lesson', emoji: '👣', title: { ru: 'Первый шаг', en: 'First step' }, text: { ru: 'Пройдите первый урок', en: 'Pass your first lesson' }, ...goal(passedLessons, 1) },
  { id: 'lessons-10', emoji: '📚', title: { ru: 'Читатель', en: 'Reader' }, text: { ru: 'Пройдите 10 уроков', en: 'Pass 10 lessons' }, ...goal(passedLessons, 10) },
  { id: 'lessons-50', emoji: '🎓', title: { ru: 'Отличник', en: 'Honor student' }, text: { ru: 'Пройдите 50 уроков', en: 'Pass 50 lessons' }, ...goal(passedLessons, 50) },
  { id: 'lessons-all', emoji: '🧠', title: { ru: 'Энциклопедист', en: 'Encyclopedist' }, text: { ru: 'Пройдите все уроки', en: 'Pass every lesson' }, ...goal(passedLessons, lessons.length) },
  { id: 'exam-1', emoji: '⚔️', title: { ru: 'Победитель босса', en: 'Boss slayer' }, text: { ru: 'Сдайте экзамен модуля', en: 'Pass a module exam' }, ...goal(passedExams, 1) },
  { id: 'exam-6', emoji: '🏆', title: { ru: 'Охотник на боссов', en: 'Boss hunter' }, text: { ru: 'Сдайте 6 экзаменов', en: 'Pass 6 exams' }, ...goal(passedExams, 6) },
  { id: 'exam-all', emoji: '👑', title: { ru: 'Гроссмейстер', en: 'Grandmaster' }, text: { ru: 'Сдайте экзамены всех модулей', en: 'Pass the exams of every module' }, ...goal(passedExams, modules.length) },
  {
    id: 'frameworks',
    emoji: '🔺',
    title: { ru: 'Три фреймворка', en: 'Three frameworks' },
    text: { ru: 'Сдайте экзамены React, Angular и Vue', en: 'Pass the React, Angular and Vue exams' },
    ...goal((r) => ['react', 'angular', 'vue'].filter((t) => examDone(r, t)).length, 3),
  },
  { id: 'code-1', emoji: '⌨️', title: { ru: 'Первый коммит', en: 'First commit' }, text: { ru: 'Решите кодинг-задачу', en: 'Solve a coding task' }, ...goal(solvedCode, 1) },
  { id: 'code-15', emoji: '🧩', title: { ru: 'Алгоритмист', en: 'Algorithmist' }, text: { ru: 'Решите 15 кодинг-задач', en: 'Solve 15 coding tasks' }, ...goal(solvedCode, 15) },
  { id: 'code-all', emoji: '💯', title: { ru: 'Все тесты зелёные', en: 'All green' }, text: { ru: 'Решите все кодинг-задачи', en: 'Solve every coding task' }, ...goal(solvedCode, codingTasks.length) },
  { id: 'predict-all', emoji: '🔮', title: { ru: 'Оракул', en: 'Oracle' }, text: { ru: 'Решите все задачи «Что выведет код?»', en: 'Solve every "What does it print?" task' }, ...goal(solvedPredict, predictTasks.length) },
  { id: 'incident-1', emoji: '🧯', title: { ru: 'Пожарный', en: 'Firefighter' }, text: { ru: 'Закройте первый инцидент', en: 'Close your first incident' }, ...goal(wonIncidents, 1) },
  { id: 'incident-all', emoji: '🎖️', title: { ru: 'Ветеран дежурств', en: 'On-call veteran' }, text: { ru: 'Закройте все инциденты', en: 'Close every incident' }, ...goal(wonIncidents, INCIDENT_COUNT) },
  {
    id: 'black-friday',
    emoji: '🔥',
    title: { ru: 'Пережил распродажу', en: 'Survived the sale' },
    text: { ru: 'Закройте инцидент «Чёрная пятница»', en: 'Close the Black Friday incident' },
    test: (s) => (s.results[incidentKey('black-friday')]?.best ?? 0) >= 100,
  },
  { id: 'offer', emoji: '🤝', title: { ru: 'Оффер', en: 'Offer' }, text: { ru: 'Mock-интервью на 70 и выше', en: 'A mock interview scoring 70 or more' }, test: (s) => interviewBest(s.results) >= INTERVIEW_PASS },
  {
    id: 'interview-formats',
    emoji: '🎤',
    title: { ru: 'Полный цикл', en: 'Full loop' },
    text: { ru: 'Интервью на 70+ во всех трёх форматах', en: 'Interviews scoring 70+ in all three formats' },
    ...goal((r) => ['theory', 'coding', 'design'].filter((f) => interviewBest(r, f) >= INTERVIEW_PASS).length, 3),
  },
  { id: 'staff-interview', emoji: '🌟', title: { ru: 'Уровень Staff', en: 'Staff level' }, text: { ru: 'Mock-интервью на 85 и выше', en: 'A mock interview scoring 85 or more' }, test: (s) => interviewBest(s.results) >= 85 },
  { id: 'streak-3', emoji: '🔥', title: { ru: 'Разогрев', en: 'Warming up' }, text: { ru: '3 дня занятий подряд', en: '3 days in a row' }, test: (s) => streak(s.days) >= 3, progress: (s) => ({ value: Math.min(3, streak(s.days)), goal: 3 }) },
  { id: 'streak-7', emoji: '📅', title: { ru: 'Неделя', en: 'A full week' }, text: { ru: '7 дней занятий подряд', en: '7 days in a row' }, test: (s) => streak(s.days) >= 7, progress: (s) => ({ value: Math.min(7, streak(s.days)), goal: 7 }) },
  { id: 'streak-30', emoji: '☄️', title: { ru: 'Месяц без пропусков', en: 'A month without a gap' }, text: { ru: '30 дней занятий подряд', en: '30 days in a row' }, test: (s) => streak(s.days) >= 30, progress: (s) => ({ value: Math.min(30, streak(s.days)), goal: 30 }) },
  { id: 'senior', emoji: '🚀', title: { ru: 'Сеньор', en: 'Senior' }, text: { ru: 'Достигните звания Senior', en: 'Reach the Senior rank' }, test: (s) => totalXp(s.results) >= ranks[3].xp },
  {
    id: 'night-owl',
    emoji: '🦉',
    secret: true,
    title: { ru: 'Сова', en: 'Night owl' },
    text: { ru: 'Позанимайтесь между полуночью и пятью утра', en: 'Practice between midnight and 5 a.m.' },
    test: (s) => Object.values(s.results).some((r) => r.attempts.some((a) => new Date(a.at).getHours() < 5)),
  },
]

export const unlocked = (s: Snapshot) => achievements.filter((a) => a.test(s)).map((a) => a.id)

// ───────────── Daily quests ─────────────

export interface Quest {
  id: string
  emoji: string
  text: Localized
  goal: number
  link: string
  /** Counts what was done today: distinct items whose attempt today meets the condition. */
  count: (results: Results, today: string) => number
}

/** Distinct result keys with a prefix that got an attempt today scoring at least `min`. */
const doneToday = (prefix: string, min: number) => (results: Results, today: string) =>
  Object.entries(results).filter(([k, r]) => k.startsWith(prefix) && r.attempts.some((a) => a.score >= min && dayKey(new Date(a.at)) === today)).length

export const questPool: Quest[] = [
  { id: 'lessons', emoji: '📘', text: { ru: 'Пройдите 2 урока', en: 'Pass 2 lessons' }, goal: 2, link: '/#tracks', count: doneToday('lesson:', LESSON_PASS) },
  { id: 'lesson', emoji: '📗', text: { ru: 'Пройдите урок', en: 'Pass a lesson' }, goal: 1, link: '/#tracks', count: doneToday('lesson:', LESSON_PASS) },
  { id: 'code', emoji: '⌨️', text: { ru: 'Решите кодинг-задачу', en: 'Solve a coding task' }, goal: 1, link: '/practice/coding', count: doneToday('code:', 100) },
  { id: 'predict', emoji: '🔮', text: { ru: 'Решите 2 задачи «Что выведет код?»', en: 'Solve 2 "What does it print?" tasks' }, goal: 2, link: '/practice/predict', count: doneToday('predict:', 100) },
  { id: 'exam', emoji: '⚔️', text: { ru: 'Сдайте экзамен модуля', en: 'Pass a module exam' }, goal: 1, link: '/#tracks', count: (r, d) => modules.filter((m) => doneToday(examKey(m.track), Math.round(m.exam.pass * 100))(r, d) > 0).length },
  { id: 'incident', emoji: '🧯', text: { ru: 'Закройте инцидент', en: 'Close an incident' }, goal: 1, link: '/practice/incidents', count: doneToday('incident:', 100) },
  { id: 'interview', emoji: '🎤', text: { ru: 'Пройдите mock-интервью', en: 'Finish a mock interview' }, goal: 1, link: '/interview', count: doneToday('interview:', 0) },
]

/** A deterministic hash of the day, so the three quests stay the same all day and change the next. */
function seed(day: string): number {
  let h = 2166136261
  for (const ch of day) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  return h >>> 0
}

/** Three quests for the day; without the AI server the interview quest is left out. */
export function questsFor(day: string, aiEnabled = true): Quest[] {
  const pool = questPool.filter((q) => aiEnabled || q.id !== 'interview')
  // "lesson" and "lessons" are two sizes of the same quest: never offer both.
  const order = pool.map((q, i) => ({ q, k: seed(`${day}:${i}`) })).sort((a, b) => a.k - b.k)
  const picked: Quest[] = []
  for (const { q } of order) {
    if (picked.length === 3) break
    if ((q.id === 'lesson' && picked.some((p) => p.id === 'lessons')) || (q.id === 'lessons' && picked.some((p) => p.id === 'lesson'))) continue
    picked.push(q)
  }
  return picked
}

export const questDone = (q: Quest, results: Results, today: string) => q.count(results, today) >= q.goal
