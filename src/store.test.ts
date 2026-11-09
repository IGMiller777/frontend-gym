import { describe, expect, it } from 'vitest'
import { streak, weight } from './store'

describe('streak', () => {
  const today = new Date('2026-11-09T12:00:00Z')
  it('counts consecutive days ending today', () => {
    expect(streak(['2026-11-07', '2026-11-08', '2026-11-09'], today)).toBe(3)
  })
  it('keeps the streak alive if today is not done yet', () => {
    expect(streak(['2026-11-07', '2026-11-08'], today)).toBe(2)
  })
  it('breaks on a gap', () => {
    expect(streak(['2026-11-05', '2026-11-08', '2026-11-09'], today)).toBe(2)
    expect(streak(['2026-11-06'], today)).toBe(0)
  })
})

describe('weight', () => {
  it('counts results and tolerates garbage', () => {
    expect(weight(null)).toBe(-1)
    expect(weight('nope')).toBe(-1)
    expect(weight('{"state":{"results":{"a":{},"b":{}}}}')).toBe(2)
  })
})
