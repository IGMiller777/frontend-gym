import type { RunnableTest, RunResult } from './harness'

/** Wall-clock limit for one run: an endless loop in the learner's code cannot freeze the page. */
export const RUN_LIMIT_MS = 6000

/**
 * Runs the tests in a fresh Web Worker (separate thread, no DOM, no access to the page)
 * and terminates it after the run or after RUN_LIMIT_MS.
 */
export function runInWorker(source: string, tests: RunnableTest[]): Promise<RunResult & { timedOut?: boolean }> {
  return new Promise((resolve) => {
    const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
    const done = (r: RunResult & { timedOut?: boolean }) => {
      clearTimeout(timer)
      worker.terminate()
      resolve(r)
    }
    const timer = setTimeout(() => done({ tests: [], logs: [], timedOut: true }), RUN_LIMIT_MS)
    worker.onmessage = (e: MessageEvent<RunResult>) => done(e.data)
    worker.onerror = (e) => done({ error: e.message || 'Worker error', tests: [], logs: [] })
    worker.postMessage({ source, tests })
  })
}
