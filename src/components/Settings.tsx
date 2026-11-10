import clsx from 'clsx'
import { Monitor, Moon, Sun } from 'lucide-react'
import { locales, useT } from '../i18n'
import { useProgress, type ThemeMode } from '../store'

const segment = 'flex items-center rounded-full border border-line bg-surface p-0.5'
const option = (active: boolean) =>
  clsx(
    'flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-xs font-semibold transition-colors',
    active ? 'bg-brand text-white shadow-sm' : 'text-muted hover:text-ink',
  )

export function LanguageSwitch() {
  const t = useT()
  const locale = useProgress((s) => s.locale)
  const setLocale = useProgress((s) => s.setLocale)
  return (
    <div role="group" aria-label={t.nav.language} className={segment}>
      {locales.map((l) => (
        <button key={l} type="button" lang={l} aria-pressed={l === locale} onClick={() => setLocale(l)} className={option(l === locale)}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

const themeIcons: Record<ThemeMode, typeof Sun> = { system: Monitor, light: Sun, dark: Moon }

export function ThemeSwitch() {
  const t = useT()
  const theme = useProgress((s) => s.theme)
  const setTheme = useProgress((s) => s.setTheme)
  return (
    <div role="group" aria-label={t.nav.theme} className={segment}>
      {(Object.keys(themeIcons) as ThemeMode[]).map((m) => {
        const Icon = themeIcons[m]
        return (
          <button key={m} type="button" aria-pressed={m === theme} aria-label={t.nav.themes[m]} title={t.nav.themes[m]} onClick={() => setTheme(m)} className={option(m === theme)}>
            <Icon size={15} aria-hidden />
          </button>
        )
      })}
    </div>
  )
}
