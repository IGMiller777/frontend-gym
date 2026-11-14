import { getCodingTask } from '../content/coding'
import { lessons } from '../content/lessons'
import { getTrack } from '../content/tracks'
import type { Locale } from '../i18n/types'
import { getDesignProblem } from './problems'
import type { CodingState, DesignBoard, InterviewFormat, InterviewGrade, InterviewMode, InterviewRequest, InterviewSubject, InterviewTurn } from './types'

export interface Session {
  format: InterviewFormat
  /** Track id (theory), coding task id (coding) or design problem id (design). */
  subjectId: string
  mode: InterviewMode
  durationMin: number
  /** The interview keeps the language it started in, even if the interface language changes. */
  locale: Locale
  startedAt: number
  history: InterviewTurn[]
  hintsLeft: number
  board?: DesignBoard
  coding?: CodingState
  finishedAt?: number
  grade?: InterviewGrade
}

export const HINTS_PER_SESSION = 2
export const DURATIONS = [30, 45, 60] as const

/** Results key: one best score per format and subject. */
export const interviewKey = (format: InterviewFormat, subjectId: string) => `interview:${format}:${subjectId}`

const STORAGE_KEY = 'frontend-gym:interview'

/** A running interview survives a reload; it is a per-browser convenience, so localStorage is enough. */
export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

export function saveSession(s: Session | null) {
  try {
    if (s) localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // storage blocked: the session lives only in memory
  }
}

export function subjectTitle(format: InterviewFormat, subjectId: string, locale: Locale): string | null {
  if (format === 'theory') return getTrack(subjectId)?.title[locale] ?? null
  if (format === 'coding') return getCodingTask(subjectId)?.title[locale] ?? null
  return getDesignProblem(subjectId)?.title[locale] ?? null
}

/** The context the server needs, in the session's language. `statement` is the loaded markdown of a coding task. */
export function buildSubject(s: Pick<Session, 'format' | 'subjectId' | 'locale'>, statement = ''): InterviewSubject | null {
  const { format, subjectId, locale } = s
  if (format === 'theory') {
    const track = getTrack(subjectId)
    if (!track) return null
    const topics = lessons.filter((l) => l.track === subjectId).map((l) => ({ title: l.title[locale], summary: l.summary[locale] }))
    return { format, title: track.title[locale], topics }
  }
  if (format === 'coding') {
    const task = getCodingTask(subjectId)
    if (!task) return null
    return { format, title: task.title[locale], statement, tests: task.tests.map((t) => t.name[locale]) }
  }
  const p = getDesignProblem(subjectId)
  if (!p) return null
  return { format, title: p.title[locale], prompt: p.prompt[locale], facts: p.facts[locale], focus: p.focus[locale] }
}

export function buildRequest(s: Session, elapsedMin: number, history: InterviewTurn[], statement = ''): InterviewRequest | null {
  const subject = buildSubject(s, statement)
  if (!subject) return null
  return { locale: s.locale, mode: s.mode, subject, history, elapsedMin, durationMin: s.durationMin, board: s.board, coding: s.coding }
}

export function newSession(
  format: InterviewFormat,
  subjectId: string,
  opts: { mode: InterviewMode; durationMin: number; locale: Locale; opening: string; now?: number },
): Session {
  const task = format === 'coding' ? getCodingTask(subjectId) : undefined
  return {
    format,
    subjectId,
    mode: opts.mode,
    durationMin: opts.durationMin,
    locale: opts.locale,
    startedAt: opts.now ?? Date.now(),
    history: [{ role: 'interviewer', text: opts.opening }],
    hintsLeft: opts.mode === 'coach' ? 0 : HINTS_PER_SESSION,
    board: format === 'design' ? { nodes: [], edges: [], notes: {} } : undefined,
    coding: task ? { code: task.starter } : undefined,
  }
}
