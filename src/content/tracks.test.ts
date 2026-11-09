import { describe, expect, it } from 'vitest'
import { locales } from '../i18n/types'
import { overviews } from './overviews'
import { isOfficial } from './sources'
import { groupOrder, tracks } from './tracks'

describe('tracks', () => {
  it('has 18 tracks with unique ids', () => {
    const ids = tracks.map((t) => t.id)
    expect(ids).toHaveLength(18)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every group is used and known', () => {
    expect(new Set(tracks.map((t) => t.group))).toEqual(new Set(groupOrder))
  })

  it('every text is filled in every language', () => {
    for (const t of tracks)
      for (const l of locales) {
        expect(t.title[l].trim(), `${t.id}.title.${l}`).not.toBe('')
        expect(t.blurb[l].trim(), `${t.id}.blurb.${l}`).not.toBe('')
      }
  })

  it('cites at least one official source, and only official domains', () => {
    for (const t of tracks) {
      expect(t.docs.length, t.id).toBeGreaterThan(0)
      for (const d of t.docs) expect(isOfficial(d.url), `${t.id}: ${d.url}`).toBe(true)
    }
  })

  it('every track explains itself on the page in both languages', () => {
    for (const t of tracks) {
      const o = overviews[t.id]
      expect(o, t.id).toBeDefined()
      expect(o.ru.topics.length, t.id).toBeGreaterThanOrEqual(4)
      expect(o.en.topics.length, `${t.id}: same number of topics in ru and en`).toBe(o.ru.topics.length)
      for (const l of locales) {
        expect(o[l].intro.length, `${t.id}.${l}.intro`).toBeGreaterThan(60)
        for (const topic of o[l].topics) expect(topic.text.length, `${t.id}.${l}: ${topic.title}`).toBeGreaterThan(80)
      }
    }
    expect(Object.keys(overviews).sort()).toEqual(tracks.map((t) => t.id).sort())
  })

  it('colors are hex', () => {
    for (const t of tracks) for (const c of t.colors) expect(c).toMatch(/^#[0-9a-f]{6}$/i)
  })
})
