import { Flame } from 'lucide-react'
import { Suspense } from 'react'
import { Link, Outlet } from 'react-router'
import { useT } from '../i18n'
import { useApplySettings } from '../lib/theme'
import { streak, useProgress } from '../store'
import { LanguageSwitch, ThemeSwitch } from './Settings'

export function Layout() {
  useApplySettings()
  const t = useT()
  const days = useProgress((s) => s.days)
  const n = streak(days)
  return (
    <div className="min-h-full">
      <a href="#main" className="sr-only rounded-full bg-brand px-4 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50">
        {t.nav.skip}
      </a>
      <header className="sticky top-0 z-40 border-b border-line bg-canvas/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <Link to="/" className="flex shrink-0 items-center gap-2 font-display text-lg font-bold">
            <span aria-hidden className="flex size-9 items-center justify-center rounded-xl bg-brand text-white shadow-md">
              {'</>'}
            </span>
            <span className="hidden sm:inline">
              Frontend <span className="text-brand">Gym</span>
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            {n > 0 && (
              <span className="hidden items-center gap-1 rounded-full bg-surface px-3 py-1.5 text-sm font-semibold text-brand-3 sm:flex" title={t.stats.streak(n)}>
                <Flame size={16} aria-hidden /> {n}
                <span className="sr-only">{t.stats.streak(n)}</span>
              </span>
            )}
            <LanguageSwitch />
            <ThemeSwitch />
          </div>
        </div>
      </header>
      <main id="main" tabIndex={-1} className="outline-none">
        <Suspense fallback={<div className="p-10 text-center text-muted">…</div>}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}
