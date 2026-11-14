import type { Localized } from '../i18n/types'

export type ResourceKind = 'html' | 'css' | 'js' | 'image' | 'font' | 'third-party'

/** One file the page loads. Sizes are before compression for text and as stored for images and fonts. */
export interface Resource {
  id: string
  kind: ResourceKind
  label: Localized
  kb: number
  /** Blocks the first paint: CSS in <head>, a synchronous script. */
  blocking?: boolean
  /** Who reveals the resource to the browser: the HTML itself (default), a stylesheet, or the app's JavaScript. */
  discovery?: 'html' | 'css' | 'js'
  /** The LCP element is this image. */
  lcp?: boolean
  /** loading="lazy": not fetched during the initial load (an LCP image is fetched only after the first paint). */
  lazy?: boolean
  /** fetchpriority="high" or a preload. */
  high?: boolean
  /** Main-thread time to run it at load on a fast laptop, ms (JavaScript). */
  cpuMs?: number
  /** In a client-rendered page nothing is shown until this script has run. */
  app?: boolean
  /** Share of the script that stays in the initial chunk after code splitting. */
  split?: number
  /** A font with font-display: block: text is invisible until it arrives (up to 3 s). */
  blocksText?: boolean
  /** Recurring main-thread work that delays interactions, ms on a fast laptop. */
  backgroundMs?: number
  /** A third-party tag the team is allowed to remove. */
  removable?: boolean
  /** A widget that can be replaced with a static facade and loaded on click. */
  facade?: boolean
  /** Loaded after the page is ready: does not compete with the initial load. */
  deferred?: boolean
  /** Its load-time work is split into short tasks. */
  yields?: boolean
}

export interface Interaction {
  id: string
  label: Localized
  /** Main-thread work per interaction on a fast laptop, ms. */
  taskMs: number
  /** Which actions make it cheaper, and the multiplier each applies. */
  fixes?: Partial<Record<string, number>>
}

export interface Shift {
  id: string
  label: Localized
  /** Layout shift score this adds to CLS. */
  value: number
  /** The action that removes it. */
  fixedBy: string
}

export interface Page {
  /** Time the server needs to produce the HTML, ms. */
  serverMs: number
  /** csr: the HTML is an empty shell and content appears after the app script runs. */
  render: 'csr' | 'ssr'
  /** Client rendering only: the content also waits for this API call, ms. */
  apiMs?: number
  cdn: boolean
  compression: 'none' | 'gzip' | 'brotli'
  /** Hashed static files are cached for a year, so repeat visits skip downloading them. */
  longCache: boolean
  /** Share of visits that are repeat visits. */
  repeatShare: number
  resources: Resource[]
  interactions: Interaction[]
  shifts: Shift[]
  leakMbPerMin: number
  sessionMin: number
  /** One-off actions that were already taken. */
  done?: string[]
}

export type SegmentId = 'desktop' | 'phone' | 'budget'

/** Share of users per device and network segment; shares add up to 1. */
export type Audience = Record<SegmentId, number>

export interface Metrics {
  ttfb: number
  fcp: number
  lcp: number
  cls: number
  inp: number
  tbt: number
  /** JavaScript sent over the network on the first load, KB. */
  jsKb: number
  /** Everything sent over the network on the first load, KB. */
  totalKb: number
  memoryMb: number
}

export interface WaterfallRow {
  id: string
  kind: ResourceKind
  label: Localized
  /** When the browser learned about the resource, ms. */
  found: number
  /** Download start and end, ms. */
  start: number
  end: number
  /** End of main-thread execution for scripts, ms. */
  execEnd?: number
  blocking: boolean
  lcp: boolean
}

export interface Report {
  /** Share of users for whom LCP, INP and CLS are all good, 0–100. */
  health: number
  /** 75th percentile across the audience, as Core Web Vitals are assessed. */
  p75: Metrics
  segments: { id: SegmentId; share: number; good: number; metrics: Metrics }[]
  /** Loading timeline of a typical user in the largest segment. */
  waterfall: { segment: SegmentId; rows: WaterfallRow[]; ttfb: number; fcp: number; lcp: number }
}

export interface Action {
  id: string
  hours: number
  title: Localized
  /** What the action does, shown before choosing it. */
  text: Localized
  /** Why it helped or did not, shown in the debrief. */
  why: Localized
  /** Lesson to read about it. */
  lesson?: string
  /** A tempting move that does not help here. */
  trap?: boolean
  /** Can be taken only once per game, whatever the page looks like afterwards. */
  once?: boolean
  available: (page: Page) => boolean
  apply: (page: Page) => Page
}

export interface GameEvent {
  /** The event happens when this turn starts. */
  turn: number
  title: Localized
  text: Localized
  apply: (page: Page, audience: Audience) => { page: Page; audience: Audience }
}

export interface Scenario {
  id: string
  emoji: string
  difficulty: 'easy' | 'medium' | 'hard'
  title: Localized
  /** The incident report the player gets. */
  brief: Localized
  /** What the incident teaches, shown in the debrief. */
  lesson: string
  turns: number
  hoursPerTurn: number
  /** Health needed after the last release, 0–100. */
  target: number
  page: Page
  audience: Audience
  /** Ids of the actions offered in this scenario (tag removals are added automatically). */
  actions: string[]
  events: GameEvent[]
  /** A winning plan: action ids per turn. Checked by tests, shown in the debrief. */
  solution: string[][]
}
