import type { TraceEvent } from './types'

export interface Frame {
  label: string
  line: number
}
interface Timer extends Frame {
  due: number
  seq: number
}

export interface TraceState {
  stack: Frame[]
  micro: Frame[]
  tasks: Frame[]
  timers: (Frame & { ms: number })[]
  logs: string[]
  /** Code line to highlight. */
  line: number | null
  /** Virtual time in ms (moves when a timer expires). */
  now: number
}

/**
 * Applies trace events in order and returns the event-loop state after `count` of them.
 * Also returns the rule violations met on the way (empty for a valid trace).
 */
export function foldTrace(events: TraceEvent[], count = events.length): { state: TraceState; problems: string[] } {
  const stack: Frame[] = []
  const micro: Frame[] = []
  const tasks: Frame[] = []
  const timers: (Timer & { ms: number })[] = []
  const logs: string[] = []
  const problems: string[] = []
  let line: number | null = null
  let now = 0
  let seq = 0

  events.slice(0, count).forEach((e, i) => {
    const at = `step ${i + 1} (${e.op})`
    switch (e.op) {
      case 'call':
        if (i === 0 && e.label !== 'script') problems.push(`${at}: a trace starts with call "script"`)
        stack.push({ label: e.label, line: e.line })
        line = e.line
        break
      case 'return':
        if (!stack.length) problems.push(`${at}: return with an empty stack`)
        stack.pop()
        line = stack.at(-1)?.line ?? null
        break
      case 'micro':
        if (!stack.length) problems.push(`${at}: only running code can queue a microtask`)
        micro.push({ label: e.label, line: e.line })
        line = e.line
        break
      case 'timer':
        if (!stack.length) problems.push(`${at}: only running code can set a timer`)
        timers.push({ label: e.label, line: e.line, ms: e.ms, due: now + e.ms, seq: seq++ })
        line = e.line
        break
      case 'expire': {
        const k = timers.findIndex((x) => x.label === e.label)
        if (k === -1) {
          problems.push(`${at}: no pending timer "${e.label}"`)
          break
        }
        const first = [...timers].sort((a, b) => a.due - b.due || a.seq - b.seq)[0]
        if (first !== timers[k]) problems.push(`${at}: timer "${first.label}" is due before "${e.label}"`)
        const [t] = timers.splice(k, 1)
        now = Math.max(now, t.due)
        tasks.push({ label: t.label, line: t.line })
        break
      }
      case 'run-micro': {
        if (stack.length) problems.push(`${at}: microtasks run only when the stack is empty`)
        const job = micro.shift()
        if (!job) {
          problems.push(`${at}: the microtask queue is empty`)
          break
        }
        stack.push(job)
        line = job.line
        break
      }
      case 'run-task': {
        if (stack.length) problems.push(`${at}: a task runs only when the stack is empty`)
        if (micro.length) problems.push(`${at}: a task cannot run before the microtask queue is drained`)
        const job = tasks.shift()
        if (!job) {
          problems.push(`${at}: the task queue is empty`)
          break
        }
        stack.push(job)
        line = job.line
        break
      }
      case 'log':
        if (!stack.length) problems.push(`${at}: console.log outside of running code`)
        logs.push(e.text)
        line = e.line
        break
    }
  })

  if (count === events.length && (stack.length || micro.length || tasks.length || timers.length))
    problems.push('the trace ends with work left (stack, queues or timers are not empty)')

  return { state: { stack, micro, tasks, timers: timers.map(({ label, line: l, ms }) => ({ label, line: l, ms })), logs, line, now }, problems }
}
