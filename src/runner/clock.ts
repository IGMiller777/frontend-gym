/**
 * Fake timers for task tests: `setTimeout`, `setInterval`, their `clear*` and `Date.now` /
 * `performance.now` read a virtual clock that moves only on `tick`. Tests of debounce, throttle
 * and the like become instant and deterministic.
 */

interface Timer {
  id: number
  at: number
  fn: (...args: unknown[]) => void
  args: unknown[]
  every?: number
}

export interface Clock {
  /** Virtual milliseconds since the test started. */
  readonly now: number
  /** Moves time forward, running due timers in order. Promise callbacks are not flushed between them. */
  tick(ms: number): void
  /** Like `tick`, but lets pending promise callbacks run before each timer and at the end. */
  tickAsync(ms: number): Promise<void>
  /** Number of timers waiting to fire. */
  pending(): number
}

const real = {
  setTimeout: globalThis.setTimeout,
  clearTimeout: globalThis.clearTimeout,
  setInterval: globalThis.setInterval,
  clearInterval: globalThis.clearInterval,
  dateNow: Date.now,
  perfNow: typeof performance === 'undefined' ? undefined : performance.now.bind(performance),
}

/** Waits for a real macrotask: every queued microtask has run by then. */
export const flushMicrotasks = () => new Promise<void>((resolve) => real.setTimeout(resolve, 0))

/** A real-time timeout that fake timers cannot freeze; used by the harness for its own deadlines. */
export const realSetTimeout = real.setTimeout
export const realClearTimeout = real.clearTimeout

export function installClock(): { clock: Clock; uninstall: () => void } {
  const start = real.dateNow()
  let now = 0
  let nextId = 1
  const timers = new Map<number, Timer>()

  const add = (fn: unknown, delay: unknown, args: unknown[], every: boolean) => {
    if (typeof fn !== 'function') throw new TypeError('timer callback must be a function')
    const ms = Math.max(0, Number(delay) || 0)
    const id = nextId++
    timers.set(id, { id, at: now + ms, fn: fn as Timer['fn'], args, every: every ? Math.max(1, ms) : undefined })
    return id
  }
  const clear = (id: unknown) => void timers.delete(Number(id))

  const g = globalThis as Record<string, unknown>
  g.setTimeout = (fn: unknown, delay?: unknown, ...args: unknown[]) => add(fn, delay, args, false)
  g.setInterval = (fn: unknown, delay?: unknown, ...args: unknown[]) => add(fn, delay, args, true)
  g.clearTimeout = clear
  g.clearInterval = clear
  Date.now = () => start + now
  if (real.perfNow) performance.now = () => now

  /** The earliest timer due at or before `until` (ties: the one scheduled first). */
  const nextDue = (until: number) => {
    let best: Timer | undefined
    for (const t of timers.values()) if (t.at <= until && (!best || t.at < best.at || (t.at === best.at && t.id < best.id))) best = t
    return best
  }
  const fire = (t: Timer) => {
    now = t.at
    if (t.every) t.at += t.every
    else timers.delete(t.id)
    t.fn(...t.args)
  }

  const clock: Clock = {
    get now() {
      return now
    },
    tick(ms) {
      const until = now + ms
      for (let t = nextDue(until), guard = 0; t; t = nextDue(until)) {
        if (++guard > 100_000) throw new Error('clock.tick: too many timers (endless loop?)')
        fire(t)
      }
      now = until
    },
    async tickAsync(ms) {
      const until = now + ms
      await flushMicrotasks()
      for (let t = nextDue(until), guard = 0; t; t = nextDue(until)) {
        if (++guard > 100_000) throw new Error('clock.tickAsync: too many timers (endless loop?)')
        fire(t)
        await flushMicrotasks()
      }
      now = until
      await flushMicrotasks()
    },
    pending: () => timers.size,
  }

  const uninstall = () => {
    g.setTimeout = real.setTimeout
    g.setInterval = real.setInterval
    g.clearTimeout = real.clearTimeout
    g.clearInterval = real.clearInterval
    Date.now = real.dateNow
    if (real.perfNow) performance.now = real.perfNow
  }
  return { clock, uninstall }
}
