import type { Locale } from '../i18n/types'

/** What the round is about: theory on a track, live coding on a task, or front end system design. */
export type InterviewFormat = 'theory' | 'coding' | 'design'

/** How much the interviewer helps. */
export type InterviewMode = 'strict' | 'standard' | 'coach'

export interface InterviewTurn {
  role: 'interviewer' | 'candidate'
  text: string
  /** The candidate asked for a hint instead of answering. */
  hint?: boolean
}

/** The candidate's board in a design round: blocks with links plus RADIO notes. */
export interface DesignBoard {
  nodes: { id: string; type: string; label: string; x: number; y: number }[]
  edges: { id: string; source: string; target: string; label?: string }[]
  notes: Partial<Record<'r' | 'a' | 'd' | 'i' | 'o', string>>
}

/** The candidate's code in a coding round and the last test run. */
export interface CodingState {
  code: string
  run?: { error?: string; passed: number; total: number; failures: string[] }
}

/** Context the server needs to play the interviewer, already in the session's language. */
export type InterviewSubject =
  | { format: 'theory'; title: string; topics: { title: string; summary: string }[] }
  | { format: 'coding'; title: string; statement: string; tests: string[] }
  | { format: 'design'; title: string; prompt: string; facts: string[]; focus: string[] }

export interface InterviewRequest {
  locale: Locale
  mode: InterviewMode
  subject: InterviewSubject
  history: InterviewTurn[]
  elapsedMin: number
  durationMin: number
  board?: DesignBoard
  coding?: CodingState
}

export type HireVerdict = 'strong no hire' | 'no hire' | 'lean no hire' | 'lean hire' | 'hire' | 'strong hire'

export interface InterviewGrade {
  score: number
  hire: HireVerdict
  level: 'junior' | 'middle' | 'senior' | 'staff'
  summary: string
  axes: { axis: string; score: number; comment: string }[]
  strengths: string[]
  improvements: string[]
  missed: string[]
}
