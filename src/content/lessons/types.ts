import type { Localized } from '../../i18n/types'
import type { Source, Verified } from '../sources'

/** One quiz question in one language. The `correct` index must match across languages. */
export interface QuizQuestion {
  q: string
  options: string[]
  correct: number
  /** Why the right answer is right (and the tempting wrong one is wrong). Plain text with `inline code`. */
  why: string
}

/**
 * A lesson: metadata and quiz live here, the body is markdown in
 * `content/lessons/<track>/<id>.<locale>.md` (loaded lazily per language).
 */
export interface Lesson {
  id: string
  track: string
  emoji: string
  minutes: number
  title: Localized
  summary: Localized
  quiz: Localized<QuizQuestion[]>
  /** At least one official source; shown at the end under "Read more". */
  sources: Source[]
  verified: Verified
}

/** A module of a track: ordered lessons plus a final exam (the boss). */
export interface Module {
  track: string
  lessons: string[]
  exam: {
    /** Share of correct answers needed to pass, 0..1. */
    pass: number
    questions: Localized<QuizQuestion[]>
  }
}

export const LESSON_PASS = 66
export const lessonKey = (id: string) => `lesson:${id}`
export const examKey = (track: string) => `exam:${track}`
