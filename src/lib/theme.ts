import { useEffect } from 'react'
import { useProgress, type ThemeMode } from '../store'

export function isDark(mode: ThemeMode, systemDark: boolean): boolean {
  return mode === 'dark' || (mode === 'system' && systemDark)
}

/** Keeps <html class="dark"> and <html lang> in sync with the settings and the OS theme. */
export function useApplySettings() {
  const theme = useProgress((s) => s.theme)
  const locale = useProgress((s) => s.locale)

  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: dark)')
    const apply = () => document.documentElement.classList.toggle('dark', isDark(theme, mq.matches))
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [theme])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])
}
