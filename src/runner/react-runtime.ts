import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as ReactDOMClient from 'react-dom/client'
import * as JsxRuntime from 'react/jsx-runtime'
import { cleanup, flush, render, screen, sleep, user, waitFor } from './dom-testing'
import { runTests, type RunnableTest, type RunOptions } from './harness'

/** Packages a component task may import. They come from the app's own bundle, never from a CDN. */
export const reactModules: Record<string, unknown> = {
  react: React,
  'react-dom': ReactDOM,
  'react-dom/client': ReactDOMClient,
  'react/jsx-runtime': JsxRuntime,
}

/** Names in scope of every component test, next to `expect` and `fn`. */
export const reactTestGlobals = { render, screen, user, waitFor, flush, sleep }

export const reactRunOptions: RunOptions = { jsx: true, modules: reactModules, globals: reactTestGlobals, afterEach: cleanup }

/** Runs a component task's tests in the current document (the sandboxed iframe, or jsdom in Vitest). */
export const runReactTests = (source: string, tests: RunnableTest[], opts: { testTimeoutMs?: number } = {}) => runTests(source, tests, { ...reactRunOptions, ...opts })
