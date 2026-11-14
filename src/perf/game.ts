import type { Localized } from '../i18n/types'
import { availableActions } from './actions'
import { measure } from './engine'
import type { Action, Audience, GameEvent, Page, Report, Scenario } from './types'

export interface LogEntry {
  turn: number
  kind: 'action' | 'event'
  /** Action id, or the index of the event in the scenario. */
  ref: string
  title: Localized
  /** Debrief text: why the action helped or not, or what the event did. */
  why: Localized
  trap?: boolean
  lesson?: string
  /** Health before and after, to show what the step changed. */
  before: number
  after: number
}

export interface Game {
  scenarioId: string
  /** 1-based; after the last release it equals `turns + 1`. */
  turn: number
  hoursLeft: number
  page: Page
  audience: Audience
  log: LogEntry[]
  /** Health after each release, for the chart. */
  history: number[]
  result?: 'won' | 'lost'
}

const health = (page: Page, audience: Audience) => measure(page, audience).health

/** Applies the events scheduled for the turn that is starting. */
function runEvents(g: Game, sc: Scenario): Game {
  let next = g
  sc.events.forEach((e: GameEvent, index) => {
    if (e.turn !== next.turn) return
    const before = health(next.page, next.audience)
    const changed = e.apply(next.page, next.audience)
    next = { ...next, ...changed, log: [...next.log, { turn: next.turn, kind: 'event', ref: String(index), title: e.title, why: e.text, before, after: health(changed.page, changed.audience) }] }
  })
  return next
}

export function startGame(sc: Scenario): Game {
  const g: Game = { scenarioId: sc.id, turn: 1, hoursLeft: sc.hoursPerTurn, page: sc.page, audience: sc.audience, log: [], history: [health(sc.page, sc.audience)] }
  return runEvents(g, sc)
}

export const report = (g: Game): Report => measure(g.page, g.audience)

/** Actions the player can still afford and that make sense for the current page. */
export function offers(g: Game, sc: Scenario): (Action & { affordable: boolean })[] {
  if (g.result) return []
  return availableActions(g.page, sc.actions).map((a) => ({ ...a, affordable: a.hours <= g.hoursLeft }))
}

/** Spends hours on an action. Returns the same game if the action is unknown, unavailable or too expensive. */
export function act(g: Game, sc: Scenario, actionId: string): Game {
  if (g.result) return g
  const action = offers(g, sc).find((a) => a.id === actionId)
  if (!action || !action.affordable) return g
  const before = health(g.page, g.audience)
  const page = action.apply(g.page)
  return { ...g, page, hoursLeft: g.hoursLeft - action.hours, log: [...g.log, { turn: g.turn, kind: 'action', ref: actionId, title: action.title, why: action.why, trap: action.trap, lesson: action.lesson, before, after: health(page, g.audience) }] }
}

/** Ships the release: the turn ends, unused hours are lost, the next turn's events happen. */
export function ship(g: Game, sc: Scenario): Game {
  if (g.result) return g
  const shipped = { ...g, history: [...g.history, health(g.page, g.audience)] }
  if (g.turn >= sc.turns) {
    const final = health(g.page, g.audience)
    return { ...shipped, turn: g.turn + 1, hoursLeft: 0, result: final >= sc.target ? 'won' : 'lost' }
  }
  return runEvents({ ...shipped, turn: g.turn + 1, hoursLeft: sc.hoursPerTurn }, sc)
}

/** Plays a whole plan: action ids per turn. Throws if a step is impossible, so tests catch broken plans. */
export function play(sc: Scenario, plan: string[][]): Game {
  let g = startGame(sc)
  for (let turn = 0; turn < sc.turns; turn++) {
    for (const id of plan[turn] ?? []) {
      const next = act(g, sc, id)
      if (next === g) throw new Error(`${sc.id}: cannot do "${id}" on turn ${turn + 1} (${g.hoursLeft} h left)`)
      g = next
    }
    g = ship(g, sc)
  }
  return g
}

/** Score saved to progress: 100 for a win, otherwise the final health capped below 100. */
export const score = (g: Game) => (g.result === 'won' ? 100 : Math.min(99, Math.round(g.history.at(-1) ?? 0)))
