import type { Localized } from '../../i18n/types'
import type { Difficulty } from '../coding/types'
import type { Source, Verified } from '../sources'

/**
 * One step of an event-loop trace. The viewer folds the steps into the state
 * (call stack, microtask queue, task queue, timers, console); CI checks that the steps
 * obey the event-loop rules and that the logs match the real output.
 */
export type TraceEvent = { note?: Localized } & (
  | { op: 'call'; label: string; line: number }
  | { op: 'return' }
  | { op: 'micro'; label: string; line: number }
  | { op: 'timer'; label: string; line: number; ms: number }
  | { op: 'expire'; label: string }
  | { op: 'run-micro' }
  | { op: 'run-task' }
  | { op: 'log'; text: string; line: number }
)

/** "What does this code print?": the code runs as an ES module; `output` is checked against a real run in CI. */
export interface PredictTask {
  id: string
  track: string
  difficulty: Difficulty
  title: Localized
  code: string
  /** Lines printed by console.log, in order. */
  output: string[]
  /** Wrong lines offered next to the right ones; none of them may appear in `output`. */
  distractors: string[]
  /** Markdown shown after answering. */
  explanation: Localized
  trace?: TraceEvent[]
  sources: Source[]
  verified: Verified
}

export const predictKey = (id: string) => `predict:${id}`
