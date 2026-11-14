import type { Audience, Metrics, Page, Report, Resource, SegmentId, WaterfallRow } from './types'

/**
 * A deterministic model of how a page loads and responds. It is deliberately simple: one network
 * pipe shared by priority, one main thread, a handful of user segments. The numbers are a model,
 * not a measurement; the thresholds are the real Core Web Vitals ones from web.dev.
 */

/** "Good" thresholds of the Core Web Vitals. */
export const GOOD = { lcp: 2500, inp: 200, cls: 0.1 } as const
/** "Poor" starts above these values. */
export const POOR = { lcp: 4000, inp: 500, cls: 0.25 } as const

export interface Segment {
  id: SegmentId
  /** Downlink, kilobits per second. */
  kbps: number
  /** Round-trip time, ms. */
  rtt: number
  /** How many times slower than a fast laptop the CPU is. */
  cpu: number
}

export const segments: Record<SegmentId, Segment> = {
  desktop: { id: 'desktop', kbps: 25_000, rtt: 30, cpu: 1 },
  phone: { id: 'phone', kbps: 8_000, rtt: 80, cpu: 2.5 },
  budget: { id: 'budget', kbps: 1_600, rtt: 150, cpu: 4.5 },
}
export const segmentIds = Object.keys(segments) as SegmentId[]

/** Users inside a segment differ too: each segment is sampled at these slowness multipliers. */
const SPREAD = [0.7, 0.85, 1, 1.25, 1.6]

const TEXT_FACTOR = { none: 1, gzip: 0.3, brotli: 0.24 } as const
const isText = (r: Resource) => r.kind === 'html' || r.kind === 'css' || r.kind === 'js'

/** Kilobytes that travel over the network for a resource. */
export function transferKb(r: Resource, page: Page, cached = false): number {
  if (cached && page.longCache && r.kind !== 'html' && r.kind !== 'third-party') return 0
  if (r.kind === 'third-party') return r.kb * TEXT_FACTOR.gzip // the vendor compresses its own script
  return isText(r) ? r.kb * TEXT_FACTOR[page.compression] : r.kb
}

/** Browser fetch priority: the pipe always serves the highest one that is ready. */
function priority(r: Resource): number {
  if (r.kind === 'html') return 5
  if (r.high) return 4
  if (r.blocking) return 4
  if (r.kind === 'font') return 3
  if (r.kind === 'js') return 2
  return 1
}

interface Net {
  kbps: number
  rtt: number
  cpu: number
}

interface Item {
  r: Resource
  left: number
  /** When the resource would be found if it were not lazy. */
  natural?: number
  found?: number
  ready?: number
  start?: number
  end?: number
  execEnd?: number
}

interface Timeline extends Metrics {
  rows: WaterfallRow[]
}

/** Simulates one page view for one user. */
export function simulate(page: Page, net: Net, cached = false): Timeline {
  const { rtt, cpu } = net
  const rate = net.kbps / 8 / 1000 // KB per ms
  const ttfb = 3 * rtt * (page.cdn ? 0.6 : 1) + page.serverMs
  const csr = page.render === 'csr'
  const paint = 30 * cpu

  const items: Item[] = page.resources.filter((r) => !r.deferred && (!r.lazy || r.lcp)).map((r) => ({ r, left: transferKb(r, page, cached) }))
  const html = items.find((i) => i.r.kind === 'html')
  const latency = (r: Resource) => (r.kind === 'third-party' ? 3 * rtt : rtt * (page.cdn ? 0.4 : 1))
  let fcp: number | undefined
  const find = (i: Item, at: number) => {
    if (i.found !== undefined) return
    if (i.r.lazy) {
      // A lazy image is requested only after the first paint, when the layout shows it is in the viewport.
      i.natural ??= at
      if (fcp === undefined) return
      at = Math.max(i.natural, fcp)
    }
    i.found = at
    i.ready = at + (i.r.kind === 'html' ? 0 : latency(i.r))
  }
  if (html) find(html, ttfb)
  else for (const i of items) if ((i.r.discovery ?? 'html') === 'html') find(i, ttfb)

  let t = ttfb
  let mainFree = ttfb
  const blocking = items.filter((i) => i.r.blocking)
  const appItems = items.filter((i) => i.r.app)
  const textFonts = items.filter((i) => i.r.blocksText)
  const cssItems = items.filter((i) => i.r.kind === 'css')

  /** Runs the consequences of a finished download: script execution and newly discovered resources. */
  const settle = (done: Item) => {
    if (done.r.cpuMs) {
      const startExec = Math.max(done.end!, mainFree)
      done.execEnd = startExec + done.r.cpuMs * cpu
      mainFree = done.execEnd
    }
    if (done.r.kind === 'html') for (const i of items) if ((i.r.discovery ?? 'html') === 'html') find(i, done.end!)
    if (done.r.kind === 'css' && cssItems.every((c) => c.end !== undefined)) {
      const at = Math.max(...cssItems.map((c) => c.end!))
      for (const i of items) if (i.r.discovery === 'css') find(i, at)
    }
    if (done.r.app && appItems.every((a) => a.execEnd !== undefined)) {
      const at = Math.max(...appItems.map((a) => a.execEnd!)) + (csr && page.apiMs ? rtt + page.apiMs : 0)
      for (const i of items) if (i.r.discovery === 'js') find(i, at)
    }
    if (fcp === undefined) {
      const renderReady = blocking.every((b) => b.end !== undefined && (!b.r.cpuMs || b.execEnd !== undefined))
      const appReady = !csr || appItems.every((a) => a.execEnd !== undefined)
      if (renderReady && appReady && (!html || html.end !== undefined)) {
        const rb = Math.max(html?.end ?? ttfb, ...blocking.map((b) => b.execEnd ?? b.end!), ...(csr ? appItems.map((a) => a.execEnd!) : []))
        // font-display: block hides text until the font arrives, for at most 3 seconds
        if (textFonts.every((f) => f.end !== undefined)) {
          const fonts = Math.min(Math.max(0, ...textFonts.map((f) => f.end!)), rb + 3000)
          fcp = Math.max(rb, fonts) + paint
          for (const i of items) if (i.r.lazy && i.natural !== undefined) find(i, i.natural)
        }
      }
    }
  }

  // The pipe: at every moment the ready resources with the highest priority get the whole bandwidth.
  for (let guard = 0; guard < 10_000; guard++) {
    const open = items.filter((i) => i.end === undefined)
    if (!open.length) break
    const ready = open.filter((i) => i.ready !== undefined && i.ready <= t)
    const upcoming = open.filter((i) => i.ready !== undefined && i.ready > t).map((i) => i.ready!)
    if (!ready.length) {
      if (!upcoming.length) break // the rest is never discovered: a resource waits for something the page does not have
      t = Math.min(...upcoming)
      continue
    }
    // Resources of the same priority download in parallel and split the bandwidth equally.
    const top = Math.max(...ready.map((i) => priority(i.r)))
    const active = ready.filter((i) => priority(i.r) === top)
    for (const i of active) i.start ??= t
    const share = rate / active.length
    const first = active.reduce((best, i) => (i.left < best.left ? i : best))
    const finishAt = t + first.left / share
    const nextReady = upcoming.length ? Math.min(...upcoming) : Infinity
    const until = Math.min(finishAt, nextReady)
    for (const i of active) i.left = Math.max(0, i.left - (until - t) * share)
    t = until
    if (finishAt <= nextReady) {
      first.left = 0
      for (const i of active)
        if (i.left <= 1e-9) {
          i.end = t
          settle(i)
        }
    }
  }
  if (fcp === undefined) {
    const rb = Math.max(ttfb, ...items.filter((i) => i.r.blocking || i.r.app || i.r.kind === 'html').map((i) => i.execEnd ?? i.end ?? ttfb))
    fcp = rb + paint
  }

  const appDone = appItems.length ? Math.max(...appItems.map((a) => a.execEnd ?? a.end ?? ttfb)) : ttfb
  const contentText = csr ? appDone + (page.apiMs ? rtt + page.apiMs : 0) + paint : fcp
  const lcpImage = items.find((i) => i.r.lcp)
  const lcp = Math.max(fcp, contentText, lcpImage?.end !== undefined ? lcpImage.end + 20 * cpu : 0)

  const scripts = page.resources.filter((r) => r.cpuMs && !r.deferred)
  const tbt = scripts.reduce((sum, r) => sum + (r.yields ? 0 : Math.max(0, r.cpuMs! * cpu - 50)), 0)

  // Every tag's recurring work can land in front of an interaction: the more of it, the longer the input delay.
  const background = page.resources.reduce((sum, r) => sum + (r.backgroundMs ?? 0), 0)
  const memoryMb = page.leakMbPerMin * page.sessionMin
  const leakDelay = Math.min(500, Math.max(0, memoryMb - 60) * 0.6) * (cpu / 2.5)
  const slowest = Math.max(0, ...page.interactions.map((i) => i.taskMs))
  const inp = 16 + slowest * cpu + background * cpu * 0.3 + leakDelay

  const cls = page.shifts.reduce((sum, s) => sum + s.value, 0)
  const sent = page.resources.filter((r) => !r.lazy || r.lcp)
  const jsKb = sent.filter((r) => r.kind === 'js' || r.kind === 'third-party').reduce((sum, r) => sum + transferKb(r, page), 0)
  const totalKb = sent.reduce((sum, r) => sum + transferKb(r, page), 0)

  const rows: WaterfallRow[] = items
    .filter((i) => i.end !== undefined)
    .map((i) => ({ id: i.r.id, kind: i.r.kind, label: i.r.label, found: i.found!, start: i.start ?? i.ready!, end: i.end!, execEnd: i.execEnd, blocking: !!i.r.blocking, lcp: !!i.r.lcp }))
    .sort((a, b) => a.found - b.found || a.start - b.start)

  return { ttfb, fcp, lcp, cls, inp, tbt, jsKb, totalKb, memoryMb, rows }
}

export const isGood = (m: Pick<Metrics, 'lcp' | 'inp' | 'cls'>) => m.lcp <= GOOD.lcp && m.inp <= GOOD.inp && m.cls <= GOOD.cls

const metricKeys = ['ttfb', 'fcp', 'lcp', 'cls', 'inp', 'tbt', 'jsKb', 'totalKb', 'memoryMb'] as const

/** Weighted percentile: the smallest value at or below which the given share of the weight lies. */
export function percentile(points: { value: number; weight: number }[], share: number): number {
  const sorted = [...points].sort((a, b) => a.value - b.value)
  const total = sorted.reduce((sum, p) => sum + p.weight, 0)
  let acc = 0
  for (const p of sorted) {
    acc += p.weight
    if (acc >= total * share - 1e-9) return p.value
  }
  return sorted.at(-1)?.value ?? 0
}

/** Metrics across the whole audience: health, p75 values, per-segment numbers and a sample waterfall. */
export function measure(page: Page, audience: Audience): Report {
  const samples: { segment: SegmentId; weight: number; m: Timeline }[] = []
  for (const id of segmentIds) {
    const share = audience[id]
    if (!share) continue
    const s = segments[id]
    for (const k of SPREAD) {
      const net = { kbps: s.kbps / k, rtt: s.rtt * k, cpu: s.cpu * (1 + (k - 1) * 0.6) }
      const w = share / SPREAD.length
      if (page.longCache && page.repeatShare > 0) {
        samples.push({ segment: id, weight: w * (1 - page.repeatShare), m: simulate(page, net) })
        samples.push({ segment: id, weight: w * page.repeatShare, m: simulate(page, net, true) })
      } else samples.push({ segment: id, weight: w, m: simulate(page, net) })
    }
  }
  const total = samples.reduce((sum, s) => sum + s.weight, 0) || 1
  const p75 = Object.fromEntries(metricKeys.map((k) => [k, percentile(samples.map((s) => ({ value: s.m[k], weight: s.weight })), 0.75)])) as unknown as Metrics
  const health = (samples.filter((s) => isGood(s.m)).reduce((sum, s) => sum + s.weight, 0) / total) * 100

  const bySegment = segmentIds
    .filter((id) => audience[id] > 0)
    .map((id) => {
      const own = samples.filter((s) => s.segment === id)
      const weight = own.reduce((sum, s) => sum + s.weight, 0)
      return {
        id,
        share: audience[id],
        good: (own.filter((s) => isGood(s.m)).reduce((sum, s) => sum + s.weight, 0) / weight) * 100,
        metrics: Object.fromEntries(metricKeys.map((k) => [k, percentile(own.map((s) => ({ value: s.m[k], weight: s.weight })), 0.75)])) as unknown as Metrics,
      }
    })

  const main = segmentIds.reduce((best, id) => (audience[id] > audience[best] ? id : best))
  const typical = simulate(page, segments[main])
  return {
    health: Math.round(health * 10) / 10,
    p75,
    segments: bySegment,
    waterfall: { segment: main, rows: typical.rows, ttfb: typical.ttfb, fcp: typical.fcp, lcp: typical.lcp },
  }
}
