import type { Localized } from '../../i18n/types'
import type { Source, Verified } from '../sources'

export type Difficulty = 'easy' | 'medium' | 'hard'

/**
 * One test: the body of an async function. The task's exports are in scope by name,
 * plus `expect`, `fn` (spy) and, with `fakeTimers`, `clock` (see src/runner).
 */
export interface CodingTest {
  name: Localized
  code: string
  /** Hidden tests show only pass/fail and the failure message, not their code. */
  hidden?: boolean
  fakeTimers?: boolean
}

/**
 * A coding task. The statement and the walkthrough are markdown in
 * `content/tasks/<id>.<locale>.md`, split by a `<!-- solution -->` line.
 * The reference `solution` must pass every test and the `starter` must fail at least one (checked in CI).
 */
export interface CodingTask {
  id: string
  track: string
  difficulty: Difficulty
  minutes: number
  title: Localized
  summary: Localized
  /** TypeScript the learner starts from. */
  starter: string
  /** Reference solution, shown after the task is solved or on request. */
  solution: string
  tests: CodingTest[]
  /**
   * `react`: a component task. The code and the tests are TSX, run in a sandboxed iframe with React
   * (see src/runner/react-frame.ts); tests get `render`, `screen`, `user`, `waitFor` (src/runner/dom-testing.ts).
   * `dom`: plain TypeScript that needs a real DOM, run in the same sandboxed iframe; tests get `html(markup)`
   * (src/runner/dom-runtime.ts), which returns a fresh container in the document.
   * Default: plain TypeScript in a Web Worker.
   */
  runtime?: 'react' | 'dom'
  /** Component export shown in the live preview (component tasks only). */
  preview?: string
  sources: Source[]
  verified: Verified
}

export const SOLUTION_MARK = '<!-- solution -->'
export const codeKey = (id: string) => `code:${id}`
