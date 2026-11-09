export const locales = ['ru', 'en'] as const
export type Locale = (typeof locales)[number]

/** A value written in every supported language. TypeScript refuses content with a missing translation. */
export type Localized<T = string> = Record<Locale, T>

export const localeNames: Record<Locale, string> = { ru: 'Русский', en: 'English' }

export function detectLocale(languages: readonly string[] = typeof navigator === 'undefined' ? [] : navigator.languages): Locale {
  for (const lang of languages) {
    const base = lang.toLowerCase().split('-')[0]
    if ((locales as readonly string[]).includes(base)) return base as Locale
  }
  return 'en'
}
