import clsx from 'clsx'
import { AlertTriangle, ArrowLeft, CheckCircle2, Clock, Rocket, RotateCcw, Target, Zap } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { incidentKey } from '../content/progress'
import { useL } from '../i18n'
import { getAction } from '../perf/actions'
import { GOOD, POOR } from '../perf/engine'
import { act, type Game, offers, report, score, ship, startGame } from '../perf/game'
import { getScenario } from '../perf/scenarios'
import { type PerfDict, usePerfT } from '../perf/strings'
import type { Report, Scenario } from '../perf/types'
import { Waterfall } from '../perf/Waterfall'
import { useProgress } from '../store'

const saveKey = (id: string) => `frontend-gym:incident:${id}`

/** A running incident survives a reload; per-browser convenience, so localStorage is enough. */
function loadGame(sc: Scenario): Game {
  try {
    const raw = localStorage.getItem(saveKey(sc.id))
    const saved = raw ? (JSON.parse(raw) as Game) : null
    if (saved && saved.scenarioId === sc.id && !saved.result) return saved
  } catch {
    // storage blocked or the save is broken: start over
  }
  return startGame(sc)
}

function saveGame(g: Game) {
  try {
    if (g.result) localStorage.removeItem(saveKey(g.scenarioId))
    else localStorage.setItem(saveKey(g.scenarioId), JSON.stringify(g))
  } catch {
    // storage blocked: the game lives only in memory
  }
}

export default function IncidentPage() {
  const { id = '' } = useParams()
  const t = usePerfT()
  const sc = getScenario(id)
  if (!sc)
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p>{t.notFound}</p>
      </div>
    )
  return <Play key={sc.id} sc={sc} />
}

type Status = 'good' | 'needs' | 'poor'
const status = (value: number, good: number, poor: number): Status => (value <= good ? 'good' : value <= poor ? 'needs' : 'poor')
const statusStyle: Record<Status, string> = {
  good: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300',
  needs: 'bg-amber-500/15 text-amber-800 dark:text-amber-300',
  poor: 'bg-rose-500/15 text-rose-800 dark:text-rose-300',
}

function vitals(r: Report, t: PerfDict) {
  return [
    { name: 'LCP', value: t.ms(r.p75.lcp), state: status(r.p75.lcp, GOOD.lcp, POOR.lcp), limit: t.ms(GOOD.lcp) },
    { name: 'INP', value: t.ms(r.p75.inp), state: status(r.p75.inp, GOOD.inp, POOR.inp), limit: t.ms(GOOD.inp) },
    { name: 'CLS', value: t.score(r.p75.cls), state: status(r.p75.cls, GOOD.cls, POOR.cls), limit: t.score(GOOD.cls, 1) },
  ]
}

function Play({ sc }: { sc: Scenario }) {
  const t = usePerfT()
  const l = useL()
  const [game, setGame] = useState(() => loadGame(sc))
  const [change, setChange] = useState<string[] | null>(null)
  const rep = useMemo(() => report(game), [game])
  const available = useMemo(() => offers(game, sc), [game, sc])
  const resultRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => saveGame(game), [game])
  useEffect(() => {
    if (game.result) resultRef.current?.focus()
  }, [game.result])

  /** Applies a step and remembers which vitals it moved, to show the effect right away. */
  const step = (next: Game) => {
    if (next === game) return
    const before = vitals(rep, t)
    const after = vitals(report(next), t)
    const moved = after.flatMap((v, i) => (v.value !== before[i].value ? [t.changed(v.name, before[i].value, v.value)] : []))
    setChange(next.result ? null : [t.delta(rep.health, report(next).health), ...moved])
    setGame(next)
    if (next.result) useProgress.getState().record(incidentKey(sc.id), score(next))
  }

  const restart = (ask: boolean) => {
    if (ask && !window.confirm(t.restartConfirm)) return
    setChange(null)
    setGame(startGame(sc))
  }

  const lastTurn = game.turn >= sc.turns

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Link to="/practice/incidents" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft size={16} aria-hidden /> {t.back}
      </Link>

      <header className="mt-4 flex flex-wrap items-center gap-4">
        <span aria-hidden className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-surface-2 text-3xl shadow-md">
          {sc.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-extrabold leading-tight">{l(sc.title)}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm font-semibold text-muted">
            <span>{t.difficulty[sc.difficulty]}</span>
            {!game.result && (
              <>
                <span className="rounded-full bg-brand px-2.5 py-0.5 text-white">{t.turn(game.turn, sc.turns)}</span>
                <span className="inline-flex items-center gap-1">
                  <Clock size={14} aria-hidden /> {t.hoursLeft(game.hoursLeft)}
                </span>
              </>
            )}
            <span className="inline-flex items-center gap-1">
              <Target size={14} aria-hidden /> {t.target(sc.target)}
            </span>
          </p>
        </div>
        {!game.result && game.log.length > 0 && (
          <button type="button" onClick={() => restart(true)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-muted hover:bg-surface-2 hover:text-ink">
            <RotateCcw size={15} aria-hidden /> {t.restart}
          </button>
        )}
      </header>

      {game.result ? (
        <Debrief sc={sc} game={game} rep={rep} headingRef={resultRef} onAgain={() => restart(false)} />
      ) : (
        <>
          <section aria-label={t.brief} className="mt-5 rounded-3xl border border-line bg-surface p-5">
            <p className="max-w-4xl leading-relaxed">{l(sc.brief)}</p>
            <p className="mt-2 text-sm text-muted">{t.model}</p>
          </section>

          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_21rem]">
            <div className="min-w-0 space-y-5">
              <Dashboard rep={rep} target={sc.target} />
              <section className="rounded-3xl border border-line bg-surface p-5">
                <h2 className="text-lg font-bold">{t.waterfall}</h2>
                <div className="mt-2">
                  <Waterfall data={rep.waterfall} />
                </div>
              </section>
              <Details game={game} rep={rep} />
            </div>

            <div className="min-w-0 space-y-5">
              <section className="rounded-3xl border border-line bg-surface p-5">
                <h2 className="text-lg font-bold">{t.actions}</h2>
                <p className="mt-1 text-sm font-semibold text-muted">
                  {t.turn(game.turn, sc.turns)} · {t.hoursLeft(game.hoursLeft)}
                </p>
                <button
                  type="button"
                  onClick={() => step(ship(game, sc))}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-4 py-2.5 font-semibold text-canvas shadow transition hover:scale-[1.02]"
                >
                  <Rocket size={17} aria-hidden /> {lastTurn ? t.shipLast : t.ship}
                </button>
                <div role="status" className="mt-3 min-h-5 text-sm font-semibold text-brand-1">
                  {change?.join(' · ')}
                </div>
                {available.length === 0 ? (
                  <p className="mt-2 text-sm text-muted">{t.noActions}</p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {available.map((a) => (
                      <li key={a.id} className="rounded-2xl border border-line bg-canvas p-3">
                        <div className="flex items-start gap-2">
                          <h3 className="min-w-0 flex-1 font-sans text-[15px] font-bold leading-snug">{l(a.title)}</h3>
                          <span className="shrink-0 rounded-full bg-surface-2 px-2 py-0.5 text-xs font-bold">{t.hours(a.hours)}</span>
                        </div>
                        <p className="mt-1 text-sm leading-relaxed text-muted">{l(a.text)}</p>
                        <button
                          type="button"
                          onClick={() => step(act(game, sc, a.id))}
                          disabled={!a.affordable}
                          aria-label={`${a.affordable ? t.doIt : t.tooExpensive}: ${l(a.title)}`}
                          className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-none disabled:bg-surface-2 disabled:text-muted"
                        >
                          <Zap size={14} aria-hidden /> {a.affordable ? t.doIt : t.tooExpensive}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
              <LogList game={game} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function Dashboard({ rep, target }: { rep: Report; target: number }) {
  const t = usePerfT()
  const health = Math.round(rep.health)
  const reached = rep.health >= target
  return (
    <section className="rounded-3xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-end gap-x-4 gap-y-1">
        <h2 className="text-lg font-bold">{t.health}</h2>
        <p className={clsx('text-4xl font-extrabold leading-none', reached ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400')}>{health}%</p>
        <p className="text-sm text-muted">{t.healthHint}</p>
      </div>
      <div role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={health} aria-label={t.healthValue(health, target)} className="relative mt-3 h-4 rounded-full bg-surface-2">
        <div className={clsx('h-full rounded-full transition-[width] duration-500', reached ? 'bg-emerald-500' : 'bg-brand')} style={{ width: `${Math.max(2, health)}%` }} />
        <div aria-hidden className="absolute -top-1 h-6 w-1 rounded bg-ink" style={{ left: `calc(${target}% - 2px)` }} />
        <div aria-hidden className="absolute top-6 -translate-x-1/2 text-xs font-bold" style={{ left: `${target}%` }}>
          {t.target(target)}
        </div>
      </div>

      <h3 className="mt-9 text-sm font-semibold text-muted">{t.vitals}</h3>
      <ul className="mt-2 grid gap-3 sm:grid-cols-3">
        {vitals(rep, t).map((v) => (
          <li key={v.name} className="rounded-2xl border border-line bg-canvas p-3">
            <p className="text-sm font-bold">{v.name}</p>
            <p className="mt-1 font-mono text-2xl font-bold">{v.value}</p>
            <p className="mt-1">
              <span className={clsx('inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-bold', statusStyle[v.state])}>{t.status[v.state]}</span>
            </p>
            <p className="mt-1 text-xs text-muted">{t.limit(v.limit)}</p>
          </li>
        ))}
      </ul>

      <h3 className="mt-4 text-sm font-semibold text-muted">{t.other}</h3>
      <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
        {(
          [
            [t.metrics.ttfb, t.ms(rep.p75.ttfb)],
            [t.metrics.fcp, t.ms(rep.p75.fcp)],
            [t.metrics.tbt, t.ms(rep.p75.tbt)],
            [t.metrics.js, t.kb(rep.p75.jsKb)],
            [t.metrics.total, t.kb(rep.p75.totalKb)],
            [t.metrics.memory, t.mb(rep.p75.memoryMb)],
          ] as const
        ).map(([name, value]) => (
          <div key={name}>
            <dt className="text-muted">{name}</dt>
            <dd className="font-mono font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function Details({ game, rep }: { game: Game; rep: Report }) {
  const t = usePerfT()
  const l = useL()
  const slowest = Math.max(0, ...game.page.interactions.map((i) => i.taskMs))
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <section className="rounded-3xl border border-line bg-surface p-5">
        <h2 className="text-lg font-bold">{t.interactions}</h2>
        <p className="mt-1 text-xs text-muted">{t.interactionsHint}</p>
        <ul className="mt-3 space-y-2 text-sm">
          {game.page.interactions.map((i) => (
            <li key={i.id}>
              <div className="flex justify-between gap-2">
                <span>{l(i.label)}</span>
                <span className="font-mono font-semibold">{t.ms(i.taskMs)}</span>
              </div>
              <div aria-hidden className="mt-1 h-1.5 rounded-full bg-surface-2">
                <div className={clsx('h-full rounded-full', i.taskMs === slowest ? 'bg-rose-500' : 'bg-brand-1')} style={{ width: `${Math.max(3, (i.taskMs / Math.max(slowest, 1)) * 100)}%` }} />
              </div>
            </li>
          ))}
        </ul>
        <h2 className="mt-5 text-lg font-bold">{t.shifts}</h2>
        {game.page.shifts.length === 0 ? (
          <p className="mt-1 text-sm text-muted">{t.noShifts}</p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm">
            {game.page.shifts.map((s) => (
              <li key={s.id} className="flex justify-between gap-2">
                <span>{l(s.label)}</span>
                <span className="font-mono font-semibold">+{t.score(s.value)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-3xl border border-line bg-surface p-5">
        <h2 className="text-lg font-bold">{t.audience}</h2>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th scope="col" className="py-1 pr-2 font-semibold">{t.audience}</th>
                <th scope="col" className="py-1 pr-2 font-semibold">{t.share}</th>
                <th scope="col" className="py-1 pr-2 font-semibold">{t.good}</th>
                <th scope="col" className="py-1 pr-2 font-semibold">LCP</th>
                <th scope="col" className="py-1 font-semibold">INP</th>
              </tr>
            </thead>
            <tbody>
              {rep.segments.map((s) => (
                <tr key={s.id} className="border-t border-line">
                  <th scope="row" className="py-1.5 pr-2 font-normal">{t.segmentNames[s.id]}</th>
                  <td className="py-1.5 pr-2 font-mono">{Math.round(s.share * 100)}%</td>
                  <td className="py-1.5 pr-2 font-mono font-semibold">{Math.round(s.good)}%</td>
                  <td className="py-1.5 pr-2 font-mono">{t.ms(s.metrics.lcp)}</td>
                  <td className="py-1.5 font-mono">{t.ms(s.metrics.inp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function LogList({ game }: { game: Game }) {
  const t = usePerfT()
  const l = useL()
  return (
    <section className="rounded-3xl border border-line bg-surface p-5">
      <h2 className="text-lg font-bold">{t.log}</h2>
      {game.log.length === 0 ? (
        <p className="mt-2 text-sm text-muted">{t.logEmpty}</p>
      ) : (
        <ol className="mt-2 space-y-2 text-sm">
          {game.log.map((e, i) => (
            <li key={i} className={clsx('rounded-2xl p-3', e.kind === 'event' ? 'border border-amber-500/40 bg-amber-500/10' : 'bg-canvas')}>
              <p className="font-semibold">
                {e.kind === 'event' && (
                  <span className="mr-1.5 inline-flex items-center gap-1 text-amber-800 dark:text-amber-300">
                    <AlertTriangle size={14} aria-hidden /> {t.event}:
                  </span>
                )}
                {l(e.title)}
              </p>
              {e.kind === 'event' && <p className="mt-1 text-muted">{l(e.why)}</p>}
              <p className="mt-1 text-xs font-semibold text-muted">
                {t.referenceTurn(e.turn)} · {t.delta(e.before, e.after)}
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

function Debrief({ sc, game, rep, headingRef, onAgain }: { sc: Scenario; game: Game; rep: Report; headingRef: React.RefObject<HTMLHeadingElement | null>; onAgain: () => void }) {
  const t = usePerfT()
  const l = useL()
  const won = game.result === 'won'
  const final = game.history.at(-1) ?? 0
  const bars = game.history
  return (
    <div className="mt-5 space-y-5">
      <section className={clsx('rounded-3xl border p-6', won ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-rose-500/50 bg-rose-500/10')}>
        <h2 ref={headingRef} tabIndex={-1} className="flex items-center gap-2 text-2xl font-extrabold outline-none">
          {won ? <CheckCircle2 size={26} aria-hidden /> : <AlertTriangle size={26} aria-hidden />} {won ? t.won : t.lost}
        </h2>
        <p className="mt-2 text-lg">{t.resultText(final, sc.target)}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={onAgain} className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white">
            <RotateCcw size={15} aria-hidden /> {t.again}
          </button>
          <Link to={`/learn/${sc.lesson}`} className="rounded-full bg-surface px-4 py-2 text-sm font-semibold">
            {t.readLesson}
          </Link>
          <Link to="/practice/incidents" className="rounded-full bg-surface px-4 py-2 text-sm font-semibold">
            {t.back}
          </Link>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="min-w-0 space-y-5">
        <section className="rounded-3xl border border-line bg-surface p-5">
          <h2 className="text-lg font-bold">{t.history}</h2>
          <svg
            viewBox={`0 0 ${Math.max(bars.length * 56, 200)} 150`}
            role="img"
            aria-label={t.historyAlt(bars.map((h, i) => `${i === 0 ? t.start : t.referenceTurn(i)} ${Math.round(h)}%`).join(', '))}
            className="mt-3 h-40 w-full max-w-md text-ink"
          >
            <line x1="0" x2="100%" y1={120 - sc.target} y2={120 - sc.target} stroke="currentColor" strokeDasharray="5 4" strokeOpacity="0.6" />
            <text x="2" y={120 - sc.target - 4} fontSize="10" fill="currentColor" opacity="0.8">
              {t.target(sc.target)}
            </text>
            {bars.map((h, i) => (
              <g key={i}>
                <rect x={i * 56 + 12} y={120 - h} width="32" height={Math.max(1, h)} rx="4" className={h >= sc.target ? 'fill-emerald-500' : 'fill-rose-500'} />
                <text x={i * 56 + 28} y={115 - h} textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">
                  {Math.round(h)}
                </text>
                <text x={i * 56 + 28} y="136" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.8">
                  {i === 0 ? t.start : i}
                </text>
              </g>
            ))}
          </svg>
        </section>
        <Dashboard rep={rep} target={sc.target} />
        </div>

        <section className="rounded-3xl border border-line bg-surface p-5">
          <h2 className="text-lg font-bold">{t.debrief}</h2>
          {game.log.length === 0 ? (
            <p className="mt-2 text-sm text-muted">{t.logEmpty}</p>
          ) : (
            <ol className="mt-3 space-y-3 text-sm">
              {game.log.map((e, i) => (
                <li key={i} className={clsx('rounded-2xl p-3', e.kind === 'event' ? 'border border-amber-500/40 bg-amber-500/10' : 'bg-canvas')}>
                  <p className="font-semibold">
                    {e.kind === 'event' ? `${t.event}: ` : ''}
                    {l(e.title)}
                    {e.trap && <span className="ml-2 rounded-full bg-rose-500/15 px-2 py-0.5 text-xs font-bold text-rose-800 dark:text-rose-300">{t.trap}</span>}
                  </p>
                  <p className="mt-1 leading-relaxed text-muted">{l(e.why)}</p>
                  <p className="mt-1 text-xs font-semibold text-muted">
                    {t.referenceTurn(e.turn)} · {Math.round(e.before) === Math.round(e.after) && e.kind === 'action' ? t.noEffect : t.delta(e.before, e.after)}
                    {e.lesson && (
                      <>
                        {' · '}
                        <Link to={`/learn/${e.lesson}`} className="underline">
                          {t.readLesson}
                        </Link>
                      </>
                    )}
                  </p>
                </li>
              ))}
            </ol>
          )}

          <h2 className="mt-6 text-lg font-bold">{t.reference}</h2>
          <ol className="mt-2 space-y-2 text-sm">
            {sc.solution.map((ids, i) => (
              <li key={i}>
                <span className="font-semibold">{t.referenceTurn(i + 1)}: </span>
                {ids.map((id) => l(referenceTitle(sc, id))).join('; ')}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  )
}

/** Title of a reference-plan step; tag removals are resolved against every tag the scenario can have. */
function referenceTitle(sc: Scenario, id: string) {
  let page = sc.page
  for (const e of sc.events) page = e.apply(page, sc.audience).page
  return getAction(id, page)?.title ?? getAction(id, sc.page)?.title ?? { ru: id, en: id }
}
