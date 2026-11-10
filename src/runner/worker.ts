/// <reference lib="webworker" />
import { runTests, type RunnableTest } from './harness'

/** One run per message; the page terminates the worker if it does not answer in time. */
self.onmessage = async (e: MessageEvent<{ source: string; tests: RunnableTest[] }>) => {
  const result = await runTests(e.data.source, e.data.tests)
  self.postMessage(result)
}
