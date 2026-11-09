import { useProgress } from '../store'
import { en } from './en'
import { ru } from './ru'
import type { Locale, Localized } from './types'

export type Dict = typeof ru

export const dictionaries: Record<Locale, Dict> = { ru, en }

/** Interface strings for the current language. */
export function useT(): Dict {
  return dictionaries[useProgress((s) => s.locale)]
}

export function useLocale(): Locale {
  return useProgress((s) => s.locale)
}

/** Pick the current language from a localized content value. */
export function useL(): <T>(value: Localized<T>) => T {
  const locale = useLocale()
  return (value) => value[locale]
}

export * from './types'
