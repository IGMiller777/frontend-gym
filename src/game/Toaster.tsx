import clsx from 'clsx'
import { X } from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router'
import { useL, useT } from '../i18n'
import { startGameWatcher, type Toast, useToasts } from './watcher'

const style: Record<Toast['kind'], string> = {
  achievement: 'border-amber-500/60',
  quest: 'border-emerald-500/60',
  rank: 'border-brand-1',
}

function ToastView({ toast }: { toast: Toast }) {
  const l = useL()
  const t = useT()
  const dismiss = useToasts((s) => s.dismiss)
  useEffect(() => {
    const id = setTimeout(() => dismiss(toast.id), 6000)
    return () => clearTimeout(id)
  }, [toast.id, dismiss])
  return (
    <li
      className={clsx('motion-safe:animate-toast-in pointer-events-auto flex w-80 max-w-[calc(100vw-2rem)] items-start gap-3 rounded-2xl border-2 bg-surface p-3 shadow-2xl', style[toast.kind])}
    >
      <span aria-hidden className="text-3xl leading-none">
        {toast.emoji}
      </span>
      <Link to="/profile" onClick={() => dismiss(toast.id)} className="min-w-0 flex-1">
        <span className="block text-xs font-bold uppercase tracking-wide text-muted">{l(toast.title)}</span>
        <span className="block font-semibold">{l(toast.text)}</span>
      </Link>
      <button type="button" onClick={() => dismiss(toast.id)} aria-label={t.game.close} className="rounded-full p-1 text-muted hover:bg-surface-2 hover:text-ink">
        <X size={16} aria-hidden />
      </button>
    </li>
  )
}

/** Game notifications in the bottom-right corner; also starts the progress watcher. */
export function Toaster() {
  const toasts = useToasts((s) => s.toasts)
  const t = useT()
  useEffect(() => startGameWatcher(), [])
  return (
    <section aria-label={t.game.notifications} aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-50">
      <ul className="flex flex-col items-end gap-2">
        {toasts.map((toast) => (
          <ToastView key={toast.id} toast={toast} />
        ))}
      </ul>
    </section>
  )
}
