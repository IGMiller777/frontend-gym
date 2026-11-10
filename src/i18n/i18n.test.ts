import { describe, expect, it } from 'vitest'
import { en } from './en'
import { ru } from './ru'
import { detectLocale } from './types'

/** Every leaf path with its kind, so both dictionaries can be compared structurally. */
function shape(o: unknown, prefix = ''): string[] {
  if (typeof o !== 'object' || o === null) return [`${prefix}:${typeof o}`]
  return Object.entries(o).flatMap(([k, v]) => shape(v, prefix ? `${prefix}.${k}` : k))
}

describe('i18n', () => {
  it('ru and en have the same keys and value kinds', () => {
    expect(shape(en).sort()).toEqual(shape(ru).sort())
  })

  it('no empty strings', () => {
    for (const d of [ru, en]) {
      const empty = shape(d).filter((p) => p.endsWith(':string')).map((p) => p.split(':')[0]).filter((path) => {
        const v = path.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown>)[k], d)
        return (v as string).trim() === ''
      })
      expect(empty).toEqual([])
    }
  })

  it('russian plurals', () => {
    expect([1, 2, 5, 11, 21, 22].map((n) => ru.stats.streak(n))).toEqual([
      '1 день подряд',
      '2 дня подряд',
      '5 дней подряд',
      '11 дней подряд',
      '21 день подряд',
      '22 дня подряд',
    ])
  })

  it('detects locale from browser languages', () => {
    expect(detectLocale(['ru-RU', 'en'])).toBe('ru')
    expect(detectLocale(['de-DE', 'en-GB'])).toBe('en')
    expect(detectLocale(['fr'])).toBe('en')
    expect(detectLocale([])).toBe('en')
  })
})
