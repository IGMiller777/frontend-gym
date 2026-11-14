import { describe, expect, test } from 'vitest'
import { getLesson } from '../content/lessons'
import { locales } from '../i18n/types'
import { actionIds, availableActions, getAction } from './actions'
import { GOOD, isGood, measure, percentile, segments, simulate, transferKb } from './engine'
import { act, offers, play, score, ship, startGame } from './game'
import { scenarios } from './scenarios'
import type { Page, Resource } from './types'

const label = { ru: 'x', en: 'x' }
const res = (id: string, kind: Resource['kind'], kb: number, extra: Partial<Resource> = {}): Resource => ({ id, kind, label, kb, ...extra })
const page = (over: Partial<Page> = {}): Page => ({
  serverMs: 100,
  render: 'ssr',
  cdn: false,
  compression: 'gzip',
  longCache: false,
  repeatShare: 0.3,
  resources: [res('html', 'html', 40), res('css', 'css', 100, { blocking: true }), res('hero', 'image', 400, { lcp: true }), res('rest', 'image', 600)],
  interactions: [{ id: 'tap', label, taskMs: 40 }],
  shifts: [],
  leakMbPerMin: 0,
  sessionMin: 5,
  ...over,
})
const phone = segments.phone
const withResources = (p: Page, f: (r: Resource) => Resource) => ({ ...p, resources: p.resources.map(f) })

describe('engine', () => {
  test('the same page and user always give the same numbers', () => {
    expect(simulate(page(), phone)).toEqual(simulate(page(), phone))
  })

  test('the order of milestones holds: TTFB, then FCP, then LCP', () => {
    const m = simulate(page(), phone)
    expect(m.ttfb).toBeLessThan(m.fcp)
    expect(m.fcp).toBeLessThanOrEqual(m.lcp)
  })

  test('compression shrinks text but not images', () => {
    const p = page({ compression: 'brotli' })
    expect(transferKb(p.resources[1], p)).toBeCloseTo(24)
    expect(transferKb(p.resources[2], p)).toBe(400)
    expect(simulate(p, phone).fcp).toBeLessThan(simulate(page({ compression: 'none' }), phone).fcp)
  })

  test('a high-priority main image loads before other images', () => {
    const high = withResources(page(), (r) => (r.lcp ? { ...r, high: true } : r))
    expect(simulate(high, phone).lcp).toBeLessThan(simulate(page(), phone).lcp)
  })

  test('a lazy main image is requested only after the first paint', () => {
    const base = withResources(page(), (r) => (r.id === 'rest' ? { ...r, lazy: true } : r))
    const lazy = withResources(base, (r) => (r.lcp ? { ...r, lazy: true } : r))
    const row = simulate(lazy, phone).rows.find((r) => r.lcp)!
    expect(row.found).toBeGreaterThanOrEqual(simulate(lazy, phone).fcp)
    expect(simulate(lazy, phone).lcp).toBeGreaterThan(simulate(base, phone).lcp)
  })

  test('lazy images below the fold are not part of the initial load', () => {
    const lazy = withResources(page(), (r) => (r.id === 'rest' ? { ...r, lazy: true } : r))
    expect(simulate(lazy, phone).rows.map((r) => r.id)).not.toContain('rest')
    expect(simulate(lazy, phone).lcp).toBeLessThan(simulate(page(), phone).lcp)
  })

  test('a client-rendered page shows content only after the app script runs and the API answers', () => {
    const resources = [res('html', 'html', 6), res('app', 'js', 500, { cpuMs: 300, app: true })]
    const csr = simulate(page({ render: 'csr', apiMs: 300, resources }), phone)
    const ssr = simulate(page({ render: 'ssr', resources }), phone)
    const app = csr.rows.find((r) => r.id === 'app')!
    expect(csr.fcp).toBeGreaterThanOrEqual(app.execEnd!)
    expect(csr.lcp).toBeGreaterThan(app.execEnd! + 300)
    expect(ssr.lcp).toBeLessThan(csr.lcp)
  })

  test('a text-blocking font delays the first paint by at most 3 seconds', () => {
    const font = (kb: number) => page({ resources: [res('html', 'html', 40), res('css', 'css', 100, { blocking: true }), res('font', 'font', kb, { discovery: 'css', blocksText: true })] })
    const none = simulate(page({ resources: font(1).resources.slice(0, 2) }), phone).fcp
    expect(simulate(font(100), phone).fcp).toBeGreaterThan(none)
    expect(simulate(font(50_000), phone).fcp).toBeLessThanOrEqual(none + 3000 + 1)
  })

  test('a slower CPU makes interactions and long tasks worse', () => {
    const p = page({ resources: [...page().resources, res('app', 'js', 300, { cpuMs: 200 })] })
    expect(simulate(p, segments.budget).inp).toBeGreaterThan(simulate(p, segments.desktop).inp)
    expect(simulate(p, segments.budget).tbt).toBeGreaterThan(simulate(p, segments.desktop).tbt)
    expect(simulate(withResources(p, (r) => ({ ...r, yields: true })), segments.budget).tbt).toBe(0)
  })

  test('CLS is the sum of the shifts; a leak adds input delay', () => {
    const shifts = [0.05, 0.08].map((value, i) => ({ id: String(i), label, value, fixedBy: 'image-dimensions' }))
    expect(simulate(page({ shifts }), phone).cls).toBeCloseTo(0.13)
    expect(simulate(page({ leakMbPerMin: 10, sessionMin: 60 }), phone).inp).toBeGreaterThan(simulate(page(), phone).inp)
  })

  test('with long caching a repeat visit downloads only the HTML', () => {
    const p = page({ longCache: true })
    expect(simulate(p, phone, true).lcp).toBeLessThan(simulate(p, phone).lcp)
    expect(simulate(page(), phone, true).lcp).toBe(simulate(page(), phone).lcp)
  })

  test('health is the share of users with all three vitals good', () => {
    expect(isGood({ lcp: GOOD.lcp, inp: GOOD.inp, cls: GOOD.cls })).toBe(true)
    expect(isGood({ lcp: GOOD.lcp + 1, inp: 0, cls: 0 })).toBe(false)
    expect(measure(page(), { desktop: 1, phone: 0, budget: 0 }).health).toBe(100)
    expect(measure(page({ shifts: [{ id: 's', label, value: 0.3, fixedBy: 'reserve-space' }] }), { desktop: 1, phone: 0, budget: 0 }).health).toBe(0)
  })

  test('weighted percentile', () => {
    const points = [1, 2, 3, 4].map((value) => ({ value, weight: 1 }))
    expect(percentile(points, 0.75)).toBe(3)
    expect(percentile([{ value: 1, weight: 9 }, { value: 100, weight: 1 }], 0.75)).toBe(1)
  })
})

describe('scenarios', () => {
  test('ids are unique and texts exist in every language', () => {
    expect(new Set(scenarios.map((s) => s.id)).size).toBe(scenarios.length)
    for (const sc of scenarios)
      for (const locale of locales) {
        expect(sc.title[locale].trim(), sc.id).not.toBe('')
        expect(sc.brief[locale].trim(), sc.id).not.toBe('')
        for (const e of sc.events) expect(e.title[locale].trim() && e.text[locale].trim(), sc.id).not.toBe('')
        for (const r of sc.page.resources) expect(r.label[locale].trim(), `${sc.id} ${r.id}`).not.toBe('')
      }
  })

  test('audience shares add up to 1 and the lesson exists', () => {
    for (const sc of scenarios) {
      expect(Object.values(sc.audience).reduce((a, b) => a + b, 0), sc.id).toBeCloseTo(1)
      expect(getLesson(sc.lesson), sc.id).toBeDefined()
    }
  })

  test('every offered action exists, and fixes refer to offered actions', () => {
    for (const sc of scenarios) {
      for (const id of sc.actions) expect(actionIds, `${sc.id} ${id}`).toContain(id)
      for (const i of sc.page.interactions) for (const id of Object.keys(i.fixes ?? {})) expect(sc.actions, `${sc.id} ${i.id}`).toContain(id)
      for (const s of sc.page.shifts) expect(sc.actions, `${sc.id} ${s.id}`).toContain(s.fixedBy)
    }
  })

  test.each(scenarios.map((sc) => [sc.id, sc] as const))('%s: doing nothing loses, the reference plan wins', (_id, sc) => {
    expect(play(sc, []).result).toBe('lost')
    const won = play(sc, sc.solution)
    expect(won.result).toBe('won')
    expect(score(won)).toBe(100)
  })

  test.each(scenarios.map((sc) => [sc.id, sc] as const))('%s: traps do not help, at the start or after the reference plan', (_id, sc) => {
    const start = startGame(sc)
    let end = startGame(sc)
    for (let t = 0; t < sc.turns - 1; t++) {
      for (const id of sc.solution[t] ?? []) end = act(end, sc, id)
      end = ship(end, sc)
    }
    for (const g of [start, end]) {
      const before = measure(g.page, g.audience).health
      for (const a of availableActions(g.page, sc.actions).filter((x) => x.trap)) expect(measure(a.apply(g.page), g.audience).health, `${sc.id} ${a.id}`).toBeLessThanOrEqual(before + 0.5)
    }
  })

  test('spending every hour on traps loses', () => {
    for (const sc of scenarios) {
      let g = startGame(sc)
      while (!g.result) {
        const trap = offers(g, sc).find((a) => a.trap && a.affordable && a.id !== 'spinner')
        g = trap ? act(g, sc, trap.id) : ship(g, sc)
      }
      expect(g.result, sc.id).toBe('lost')
    }
  })
})

describe('actions', () => {
  test('every action has texts in both languages and an existing lesson', () => {
    const p = scenarios[0].page
    for (const id of actionIds) {
      const a = getAction(id, p)!
      for (const locale of locales) expect(a.title[locale].trim() && a.text[locale].trim() && a.why[locale].trim(), id).not.toBe('')
      expect(a.hours, id).toBeGreaterThan(0)
      if (a.lesson) expect(getLesson(a.lesson), `${id} ${a.lesson}`).toBeDefined()
    }
  })

  test('an action that was applied is no longer offered, unless it can help again', () => {
    const sc = scenarios.find((s) => s.id === 'layout-jumps')!
    const g = act(startGame(sc), sc, 'image-dimensions')
    expect(offers(g, sc).map((a) => a.id)).not.toContain('image-dimensions')
  })

  test('no action can be repeated to keep improving the page', () => {
    for (const sc of scenarios) {
      const g = startGame(sc)
      for (const a of offers(g, sc)) {
        const once = a.apply(g.page)
        const again = availableActions(once, sc.actions).find((x) => x.id === a.id)
        if (again) expect(measure(again.apply(once), g.audience).health, `${sc.id} ${a.id}`).toBeLessThanOrEqual(measure(once, g.audience).health)
      }
    }
  })

  test('removing a tag is offered only for removable tags and removes it', () => {
    const sc = scenarios.find((s) => s.id === 'tag-storm')!
    const g = startGame(sc)
    const ids = offers(g, sc).map((a) => a.id)
    expect(ids).toContain('remove:heatmap')
    expect(ids).not.toContain('remove:analytics')
    expect(act(g, sc, 'remove:heatmap').page.resources.map((r) => r.id)).not.toContain('heatmap')
    expect(getAction('remove:analytics', g.page)).toBeUndefined()
  })
})

describe('game', () => {
  const sc = scenarios[0]

  test('an action costs hours and cannot be taken without them', () => {
    const g = startGame(sc)
    const after = act(g, sc, 'image-format')
    expect(after.hoursLeft).toBe(g.hoursLeft - 4)
    expect(act(after, sc, 'cdn')).toBe(after) // 3 h needed, 2 h left
    expect(act(g, sc, 'no-such-action')).toBe(g)
  })

  test('shipping the last release ends the game; nothing changes after that', () => {
    let g = startGame(sc)
    for (let i = 0; i < sc.turns; i++) g = ship(g, sc)
    expect(g.result).toBe('lost')
    expect(g.history).toHaveLength(sc.turns + 1)
    expect(ship(g, sc)).toBe(g)
    expect(act(g, sc, 'brotli')).toBe(g)
    expect(score(g)).toBeLessThan(100)
  })

  test('events happen at the start of their turn and are logged', () => {
    const storm = scenarios.find((s) => s.id === 'tag-storm')!
    const g = ship(startGame(storm), storm)
    expect(g.turn).toBe(2)
    expect(g.page.resources.map((r) => r.id)).toContain('pixels')
    expect(g.log.at(-1)).toMatchObject({ kind: 'event', turn: 2 })
  })

  test('a game survives saving to JSON, so it can be resumed', () => {
    const g = act(startGame(sc), sc, 'image-format')
    const restored = JSON.parse(JSON.stringify(g))
    expect(measure(restored.page, restored.audience).health).toBe(measure(g.page, g.audience).health)
    expect(ship(restored, sc).turn).toBe(2)
  })
})
