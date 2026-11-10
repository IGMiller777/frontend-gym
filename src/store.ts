import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'
import { detectLocale, type Locale } from './i18n/types'

export type ThemeMode = 'system' | 'light' | 'dark'

export interface Attempt {
  at: number
  score: number
}

interface State {
  /** Result per item key (task id, `lesson:<id>`, `card:<id>`…): best score and every attempt. */
  results: Record<string, { best: number; attempts: Attempt[] }>
  /** Days (YYYY-MM-DD) with at least one recorded result, for the streak. */
  days: string[]
  /** Spaced repetition: box 0..4 → next review in 1/3/7/21/60 days. */
  srs: Record<string, { box: number; due: string }>
  locale: Locale
  theme: ThemeMode

  record: (key: string, score: number) => void
  review: (itemId: string, ok: boolean) => void
  setLocale: (locale: Locale) => void
  setTheme: (theme: ThemeMode) => void
  reset: () => void
}

/**
 * Progress is saved to a file by the local API server (data/<name>.json) and mirrored to localStorage.
 * Reads prefer whichever copy holds more progress; writes are debounced and skipped until hydration,
 * so an empty initial state never overwrites the file.
 */
let hydrated = false
const pending = new Map<string, string>()
let flushTimer: ReturnType<typeof setTimeout> | undefined
const flush = (beacon = false) => {
  clearTimeout(flushTimer)
  for (const [name, value] of pending) {
    const url = `${import.meta.env.BASE_URL}api/progress/${name}`
    if (beacon && navigator.sendBeacon) navigator.sendBeacon(url, new Blob([value], { type: 'application/json' }))
    else void fetch(url, { method: 'PUT', body: value, headers: { 'Content-Type': 'application/json' } }).catch(() => {})
  }
  pending.clear()
}
if (typeof window !== 'undefined') window.addEventListener('pagehide', () => flush(true))

/** How much progress a saved snapshot holds: number of result entries. */
export function weight(raw: string | null): number {
  if (!raw) return -1
  try {
    return Object.keys(JSON.parse(raw)?.state?.results ?? {}).length
  } catch {
    return -1
  }
}

const useFileStorage = import.meta.env.VITE_AI !== 'off'

const fileStorage: StateStorage = {
  getItem: async (name) => {
    let file: string | null = null
    let local: string | null = null
    if (useFileStorage)
      try {
        const r = await fetch(`${import.meta.env.BASE_URL}api/progress/${name}`)
        if (r.status === 200) file = await r.text()
      } catch {
        // API server is not running: use the browser copy
      }
    try {
      local = localStorage.getItem(name)
    } catch {
      // storage blocked
    }
    return weight(local) > weight(file) ? local : (file ?? local)
  },
  setItem: (name, value) => {
    if (!hydrated) return
    try {
      localStorage.setItem(name, value)
    } catch {
      // storage full or blocked: the file copy is the main one anyway
    }
    if (!useFileStorage) return
    pending.set(name, value)
    clearTimeout(flushTimer)
    flushTimer = setTimeout(flush, 500)
  },
  removeItem: () => {},
}

export const dayKey = (d: Date) => d.toISOString().slice(0, 10)
export const SRS_DAYS = [1, 3, 7, 21, 60]

const empty = { results: {}, days: [], srs: {} }

export const useProgress = create<State>()(
  persist(
    (set) => ({
      ...empty,
      locale: detectLocale(),
      theme: 'system',
      record: (key, score) =>
        set((s) => {
          const prev = s.results[key] ?? { best: 0, attempts: [] }
          const d = dayKey(new Date())
          return {
            results: { ...s.results, [key]: { best: Math.max(prev.best, score), attempts: [...prev.attempts, { at: Date.now(), score }] } },
            days: s.days.includes(d) ? s.days : [...s.days, d],
          }
        }),
      review: (itemId, ok) =>
        set((s) => {
          const prev = s.srs[itemId]
          const box = ok ? Math.min(SRS_DAYS.length - 1, prev ? prev.box + 1 : 1) : 0
          const due = new Date()
          due.setDate(due.getDate() + SRS_DAYS[box])
          return { srs: { ...s.srs, [itemId]: { box, due: dayKey(due) } } }
        }),
      setLocale: (locale) => set({ locale }),
      setTheme: (theme) => set({ theme }),
      reset: () => set(empty),
    }),
    {
      name: 'frontend-gym',
      version: 0,
      storage: createJSONStorage(() => fileStorage),
      onRehydrateStorage: () => () => {
        hydrated = true
        // First run: copy whatever the browser had into the file right away.
        useProgress.setState({})
      },
    },
  ),
)

/** Consecutive days with activity, ending today or yesterday. */
export function streak(days: string[], today = new Date()): number {
  const set = new Set(days)
  const d = new Date(today)
  if (!set.has(dayKey(d))) d.setDate(d.getDate() - 1)
  let n = 0
  while (set.has(dayKey(d))) {
    n++
    d.setDate(d.getDate() - 1)
  }
  return n
}
