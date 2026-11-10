import type { ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { createRoot, type Root } from 'react-dom/client'

/**
 * A small Testing Library look-alike for component tasks: the same names and the same idea
 * (find elements the way a user does: by role, accessible name, label or text), without the package.
 * Works in the sandboxed iframe in the browser and in jsdom under Vitest.
 */

const mounted: { root: Root; container: HTMLElement }[] = []

/** One macrotask through MessageChannel: not clamped or throttled like setTimeout in background frames. */
const nextTask = () =>
  new Promise<void>((resolve) => {
    const channel = new MessageChannel()
    channel.port1.onmessage = () => {
      channel.port1.close()
      resolve()
    }
    channel.port2.postMessage(null)
  })

/** Lets React finish scheduled work: microtasks, the scheduler's task and passive effects. */
export async function flush() {
  for (let i = 0; i < 3; i++) await nextTask()
}

/** Renders into a fresh container in `document.body`; the first commit is synchronous. */
export function render(ui: ReactNode) {
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)
  flushSync(() => root.render(ui))
  mounted.push({ root, container })
  return {
    container,
    rerender: (next: ReactNode) => flushSync(() => root.render(next)),
    unmount: () => flushSync(() => root.unmount()),
  }
}

/** Unmounts everything `render` mounted; called after every test. */
export function cleanup() {
  for (const { root, container } of mounted.splice(0)) {
    try {
      flushSync(() => root.unmount())
    } catch {
      // already unmounted by the test
    }
    container.remove()
  }
  document.body.innerHTML = ''
}

const norm = (s: string | null | undefined) => (s ?? '').replace(/\s+/g, ' ').trim()

const implicitRole = (el: Element): string | null => {
  const tag = el.tagName.toLowerCase()
  if (/^h[1-6]$/.test(tag)) return 'heading'
  switch (tag) {
    case 'button':
      return 'button'
    case 'a':
      return el.hasAttribute('href') ? 'link' : null
    case 'input': {
      const type = (el.getAttribute('type') ?? 'text').toLowerCase()
      if (type === 'checkbox' || type === 'radio') return type
      if (['button', 'submit', 'reset'].includes(type)) return 'button'
      if (type === 'search') return 'searchbox'
      if (type === 'range') return 'slider'
      return ['text', 'email', 'tel', 'url', 'password'].includes(type) ? 'textbox' : null
    }
    case 'textarea':
      return 'textbox'
    case 'select':
      return (el as HTMLSelectElement).multiple ? 'listbox' : 'combobox'
    case 'option':
      return 'option'
    case 'ul':
    case 'ol':
      return 'list'
    case 'li':
      return 'listitem'
    case 'dialog':
      return 'dialog'
    case 'nav':
      return 'navigation'
    case 'form':
      return 'form'
    case 'img':
      return el.getAttribute('alt') === '' ? 'presentation' : 'img'
    case 'progress':
      return 'progressbar'
    case 'table':
      return 'table'
    case 'tr':
      return 'row'
    case 'td':
      return 'cell'
    case 'th':
      return 'columnheader'
    default:
      return null
  }
}

/** The element's role: explicit `role` first, otherwise the implicit role of the tag. */
export const roleOf = (el: Element) => el.getAttribute('role')?.trim().split(/\s+/)[0] || implicitRole(el)

/** A simplified accessible name: aria-labelledby, aria-label, labels, alt, then the text. */
export function nameOf(el: Element): string {
  const labelledBy = el.getAttribute('aria-labelledby')
  if (labelledBy) return norm(labelledBy.split(/\s+/).map((id) => el.ownerDocument.getElementById(id)?.textContent).join(' '))
  const label = el.getAttribute('aria-label')
  if (label) return norm(label)
  const labels = (el as HTMLInputElement).labels
  if (labels?.length) return norm([...labels].map((l) => l.textContent).join(' '))
  if (el.tagName === 'IMG') return norm(el.getAttribute('alt'))
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)) return norm(el.getAttribute('title') ?? el.getAttribute('placeholder'))
  return norm(el.textContent) || norm(el.getAttribute('title'))
}

/** Hidden from users: `hidden`, `aria-hidden="true"` or `display: none` on it or an ancestor. */
export function isHidden(el: Element): boolean {
  for (let node: Element | null = el; node; node = node.parentElement) {
    if (node.hasAttribute('hidden') || node.getAttribute('aria-hidden') === 'true') return true
    const style = (node as HTMLElement).style
    if (style?.display === 'none' || style?.visibility === 'hidden') return true
  }
  return false
}

type TextMatch = string | RegExp
const matches = (value: string, m: TextMatch) => (typeof m === 'string' ? value === m : m.test(value))
const describe = (m: TextMatch) => (typeof m === 'string' ? JSON.stringify(m) : String(m))

interface RoleOptions {
  name?: TextMatch
  /** Include hidden elements (default: only what a user can perceive). */
  hidden?: boolean
}

const all = () => [...document.body.querySelectorAll('*')]

const queries = {
  allByRole(role: string, opts: RoleOptions = {}) {
    return all().filter((el) => roleOf(el) === role && (opts.hidden || !isHidden(el)) && (opts.name === undefined || matches(nameOf(el), opts.name)))
  },
  allByText(text: TextMatch) {
    // The deepest elements whose text matches: a <p> rather than every ancestor that contains it.
    const hits = all().filter((el) => !['SCRIPT', 'STYLE'].includes(el.tagName) && !isHidden(el) && matches(norm(el.textContent), text))
    return hits.filter((el) => !hits.some((other) => other !== el && el.contains(other)))
  },
  allByLabelText(text: TextMatch) {
    const byLabel = [...document.body.querySelectorAll('label')].filter((l) => matches(norm(l.textContent), text)).map((l) => l.control).filter((c): c is HTMLElement => !!c)
    const byAria = all().filter((el) => el.hasAttribute('aria-label') && matches(norm(el.getAttribute('aria-label')), text))
    return [...new Set([...byLabel, ...byAria])]
  },
}

const one = <T>(list: T[], what: string): T => {
  if (list.length === 1) return list[0]
  const roles = [...new Set(all().map(roleOf).filter(Boolean))].join(', ')
  throw new Error(list.length ? `Found ${list.length} elements ${what}, expected one` : `Unable to find an element ${what}. Roles on the page: ${roles || 'none'}`)
}

/** Queries over the whole document, as in Testing Library: get* throws, query* returns null, getAll* returns a list. */
export const screen = {
  getByRole: (role: string, opts?: RoleOptions) => one(queries.allByRole(role, opts), `with role "${role}"${opts?.name !== undefined ? ` and name ${describe(opts.name)}` : ''}`) as HTMLElement,
  queryByRole: (role: string, opts?: RoleOptions) => (queries.allByRole(role, opts)[0] ?? null) as HTMLElement | null,
  getAllByRole: (role: string, opts?: RoleOptions) => queries.allByRole(role, opts) as HTMLElement[],
  getByText: (text: TextMatch) => one(queries.allByText(text), `with text ${describe(text)}`) as HTMLElement,
  queryByText: (text: TextMatch) => (queries.allByText(text)[0] ?? null) as HTMLElement | null,
  getAllByText: (text: TextMatch) => queries.allByText(text) as HTMLElement[],
  getByLabelText: (text: TextMatch) => one(queries.allByLabelText(text), `labelled ${describe(text)}`) as HTMLElement,
}

/** Sets a value the way typing does, so React's onChange sees the change. */
function setNativeValue(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
  Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(el, value)
  el.dispatchEvent(new Event('input', { bubbles: true }))
}

const key = (el: Element, type: 'keydown' | 'keyup', k: string) => el.dispatchEvent(new KeyboardEvent(type, { key: k, bubbles: true, cancelable: true }))

/** User actions; each one waits for React to finish the resulting work. */
export const user = {
  async click(el: Element) {
    if (el instanceof HTMLElement && !(el as HTMLButtonElement).disabled) el.focus()
    ;(el as HTMLElement).click()
    await flush()
  },
  /** Types character by character into an input or textarea (appends to the current value). */
  async type(el: Element, text: string) {
    const field = el as HTMLInputElement
    field.focus()
    for (const ch of text) {
      key(field, 'keydown', ch)
      setNativeValue(field, field.value + ch)
      key(field, 'keyup', ch)
      await flush()
    }
  },
  async clear(el: Element) {
    ;(el as HTMLInputElement).focus()
    setNativeValue(el as HTMLInputElement, '')
    await flush()
  },
  /** Presses a key (`'Enter'`, `'Escape'`, `'ArrowRight'`…) on the focused element. */
  async keyboard(k: string, target: Element = document.activeElement ?? document.body) {
    const allowed = key(target, 'keydown', k)
    // Enter on a focused button activates it, like a browser does.
    if (allowed && k === 'Enter' && target instanceof HTMLButtonElement) target.click()
    key(target, 'keyup', k)
    await flush()
  },
}

/**
 * Waits `ms` of real time, yielding through MessageChannel rather than setTimeout: timers in
 * sandboxed cross-origin frames can fire tens of milliseconds late, and the tests' own clock must not.
 */
export async function sleep(ms: number) {
  const until = performance.now() + ms
  while (performance.now() < until) await nextTask()
}

/** Retries `check` until it stops throwing (for async UI: fetches, timers), up to `timeout` ms. */
export async function waitFor<T>(check: () => T | Promise<T>, { timeout = 1000, interval = 10 } = {}): Promise<T> {
  const started = performance.now()
  for (;;) {
    try {
      return await check()
    } catch (e) {
      if (performance.now() - started > timeout) throw e
      await sleep(interval)
    }
  }
}
