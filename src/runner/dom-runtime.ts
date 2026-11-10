import { runTests, type RunnableTest, type RunOptions } from './harness'

/** Containers created by `html()` in the current test; removed after every test. */
const roots = new Set<HTMLElement>()

/**
 * Test helper for DOM tasks: parses markup into a fresh container attached to the document
 * (so computed styles work) and returns the container.
 */
export function html(markup: string): HTMLElement {
  const root = document.createElement('div')
  root.setAttribute('data-test-root', '')
  root.innerHTML = markup.trim()
  document.body.append(root)
  roots.add(root)
  return root
}

const cleanup = () => {
  for (const root of roots) root.remove()
  roots.clear()
}

/** Plain TypeScript with a real DOM: run in the sandboxed iframe (or jsdom in Vitest). */
export const domRunOptions: RunOptions = { globals: { html }, afterEach: cleanup }

export const runDomTests = (source: string, tests: RunnableTest[], opts: { testTimeoutMs?: number } = {}) => runTests(source, tests, { ...domRunOptions, ...opts })
