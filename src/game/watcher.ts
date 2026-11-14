import { create } from 'zustand'
import { totalXp } from '../content/progress'
import type { Localized } from '../i18n/types'
import { AI_ENABLED } from '../lib/api'
import { dayKey, useProgress } from '../store'
import { achievements, questDone, questsFor, rankOf, type Snapshot } from './game'

export interface Toast {
  id: number
  kind: 'achievement' | 'quest' | 'rank'
  emoji: string
  title: Localized
  text: Localized
}

interface Toasts {
  toasts: Toast[]
  push: (t: Omit<Toast, 'id'>) => void
  dismiss: (id: number) => void
}

let nextId = 1
export const useToasts = create<Toasts>()((set) => ({
  toasts: [],
  push: (t) => set((s) => ({ toasts: [...s.toasts, { ...t, id: nextId++ }].slice(-4) })),
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

/** What changed between two snapshots: new achievements, finished quests and a rank-up. */
export function diff(prev: Snapshot, next: Snapshot, today: string, aiEnabled = true): Omit<Toast, 'id'>[] {
  const out: Omit<Toast, 'id'>[] = []
  for (const a of achievements)
    if (!a.test(prev) && a.test(next)) out.push({ kind: 'achievement', emoji: a.emoji, title: a.title, text: a.text })
  for (const q of questsFor(today, aiEnabled))
    if (!questDone(q, prev.results, today) && questDone(q, next.results, today))
      out.push({ kind: 'quest', emoji: q.emoji, title: { ru: 'Квест дня выполнен', en: 'Daily quest done' }, text: q.text })
  const r0 = rankOf(totalXp(prev.results)).current
  const r1 = rankOf(totalXp(next.results)).current
  if (r1.xp > r0.xp) out.push({ kind: 'rank', emoji: r1.emoji, title: { ru: 'Новое звание', en: 'New rank' }, text: r1.name })
  return out
}

/**
 * Watches progress and raises toasts. It starts only after the saved progress has loaded, so the
 * load itself (results jumping from nothing to everything) never produces a burst of toasts.
 */
export function startGameWatcher(): () => void {
  let stop = () => {}
  const begin = () => {
    stop = useProgress.subscribe((s, prev) => {
      if (s.results === prev.results && s.days === prev.days) return
      for (const t of diff(prev, s, dayKey(new Date()), AI_ENABLED)) useToasts.getState().push(t)
    })
  }
  if (useProgress.persist.hasHydrated()) begin()
  else {
    const off = useProgress.persist.onFinishHydration(() => {
      off()
      begin()
    })
    return () => {
      off()
      stop()
    }
  }
  return () => stop()
}
