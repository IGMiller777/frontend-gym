import type { RunnableTest, RunResult } from './harness'
import { RUN_LIMIT_MS } from './run'

/** The sandbox runtime: React and the runner in one classic script, served by the app itself. */
const runtimeUrl = () => `${import.meta.env.BASE_URL}runner/react-frame.js?v=${__FRAME_VERSION__}`
let runtime: Promise<string> | null = null
/** Fetched once from the app's own origin; the frame never makes a request of its own. */
const loadRuntime = () =>
  (runtime ??= fetch(runtimeUrl()).then((r) => {
    if (!r.ok) throw new Error(`sandbox runtime: HTTP ${r.status}`)
    return r.text()
  }))

/**
 * Page inside the sandbox: a tiny loader asks the parent for the runtime code and evaluates it.
 * An opaque-origin frame needs no CORS this way, and browsers that block its requests still work.
 */
const frameDoc = () => `<!doctype html><html><head><meta charset="utf-8"><meta name="color-scheme" content="light dark">
<style>body{margin:0;padding:16px;font:15px/1.5 system-ui,sans-serif}button,input,select,textarea{font:inherit}.error{color:#dc2626;white-space:pre-wrap;font-family:ui-monospace,monospace}</style>
</head><body><div id="preview"></div><script>
addEventListener('message', function boot(e) {
  if (e.source !== parent || !e.data || e.data.type !== 'boot') return
  removeEventListener('message', boot)
  ;(0, eval)(e.data.code)
})
parent.postMessage({ type: 'boot-request' }, '*')
</script></body></html>`

/**
 * A sandboxed iframe: `allow-scripts allow-forms` without `allow-same-origin`, so it has an opaque origin and cannot reach the app,
 * its storage or cookies. Messages are accepted only from this exact frame.
 */
function createFrame(parent: HTMLElement, onMessage: (data: { type: string; result?: RunResult }) => void, onFail: (error: string) => void) {
  const frame = document.createElement('iframe')
  // allow-forms: without it Chrome does not even fire `submit` (forms and React form actions need it).
  frame.setAttribute('sandbox', 'allow-scripts allow-forms')
  frame.srcdoc = frameDoc()
  const listener = (e: MessageEvent) => {
    if (e.source !== frame.contentWindow || !e.data || typeof e.data.type !== 'string') return
    if (e.data.type === 'boot-request')
      loadRuntime().then(
        (code) => frame.contentWindow?.postMessage({ type: 'boot', code }, '*'),
        (err: Error) => {
          runtime = null
          onFail(err.message)
        },
      )
    else onMessage(e.data)
  }
  window.addEventListener('message', listener)
  parent.append(frame)
  return { frame, dispose: () => (window.removeEventListener('message', listener), frame.remove()) }
}

/**
 * Runs component tests in a fresh hidden sandbox and removes it after the run or after RUN_LIMIT_MS.
 * The frame stays in the viewport but transparent and inert to the pointer: browsers throttle timers
 * in off-screen cross-origin frames, and display: none would break focus and layout.
 */
export function runInFrame(source: string, tests: RunnableTest[], runtime: 'react' | 'dom' = 'react'): Promise<RunResult & { timedOut?: boolean }> {
  return new Promise((resolve) => {
    const box = document.createElement('div')
    box.setAttribute('aria-hidden', 'true')
    box.style.cssText = 'position:fixed;right:0;bottom:0;width:800px;height:600px;overflow:hidden;opacity:0;pointer-events:none;z-index:-1'
    document.body.append(box)
    const done = (r: RunResult & { timedOut?: boolean }) => {
      clearTimeout(timer)
      dispose()
      box.remove()
      resolve(r)
    }
    const timer = setTimeout(() => done({ tests: [], logs: [], timedOut: true }), RUN_LIMIT_MS)
    const { frame, dispose } = createFrame(
      box,
      (msg) => {
        if (msg.type === 'ready') frame.contentWindow?.postMessage({ type: 'run', source, tests, runtime }, '*')
        else if (msg.type === 'result' && msg.result) done(msg.result)
      },
      (error) => done({ error, tests: [], logs: [] }),
    )
    frame.style.cssText = 'width:800px;height:600px;border:0'
  })
}

/** Renders the task's component into a visible sandbox inside `host`; returns a disposer. */
export function mountPreview(host: HTMLElement, source: string, component: string): () => void {
  const { frame, dispose } = createFrame(
    host,
    (msg) => {
      if (msg.type === 'ready') frame.contentWindow?.postMessage({ type: 'preview', source, component }, '*')
    },
    (error) => (host.textContent = error),
  )
  frame.title = 'Preview'
  frame.className = 'h-72 w-full rounded-xl border border-line bg-surface'
  return dispose
}
