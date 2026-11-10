/**
 * Entry of the sandbox for component and DOM tasks: built by scripts/build-frame.ts into one classic script
 * (public/runner/react-frame.js, React included) and evaluated inside a `sandbox="allow-scripts allow-forms"` iframe.
 * The frame has an opaque origin: no access to the app, its storage or its cookies.
 * It only talks to the parent through postMessage.
 */
import { createElement, type ComponentType } from 'react'
import { createRoot } from 'react-dom/client'
import { load, type RunnableTest } from './harness'
import { runDomTests } from './dom-runtime'
import { reactRunOptions, runReactTests } from './react-runtime'

export type FrameRequest = { type: 'run'; source: string; tests: RunnableTest[]; runtime?: 'react' | 'dom' } | { type: 'preview'; source: string; component: string }

const send = (message: unknown) => parent.postMessage(message, '*')

window.addEventListener('message', async (e: MessageEvent<FrameRequest>) => {
  if (e.source !== parent) return
  const req = e.data
  if (req.type === 'run') {
    const run = req.runtime === 'dom' ? runDomTests : runReactTests
    send({ type: 'result', result: await run(req.source, req.tests) })
  } else if (req.type === 'preview') {
    const root = document.getElementById('preview')!
    try {
      const mod = load(req.source, reactRunOptions)
      const Component = (mod[req.component] ?? mod.default) as ComponentType | undefined
      if (typeof Component !== 'function') throw new Error(`export ${req.component} not found`)
      createRoot(root).render(createElement(Component))
    } catch (err) {
      root.textContent = `⚠ ${err instanceof Error ? err.message : String(err)}`
      root.className = 'error'
    }
  }
})

// A form submitted without preventDefault would navigate the frame away and lose the run:
// stop it here (after React's own handlers) and say what a real page would do.
window.addEventListener('submit', (e) => {
  if (e.defaultPrevented) return
  e.preventDefault()
  console.error('A <form> was submitted without preventDefault(): a real page would reload here.')
})

send({ type: 'ready' })
