import clsx from 'clsx'
import { CheckCircle2, Flame, Lock, Zap } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { codeKey, codingTasks } from '../content/coding'
import { LESSON_PASS, lessonKey, lessons, modules } from '../content/lessons'
import { predictKey, predictTasks } from '../content/predict'
import { examDone, INCIDENT_COUNT, INTERVIEW_PASS, totalXp } from '../content/progress'
import { achievements, questsFor, rankOf, ranks } from '../game/game'
import { useGameT } from '../game/strings'
import { useL } from '../i18n'
import { AI_ENABLED } from '../lib/api'
import { dayKey, streak, useProgress } from '../store'

export default function ProfilePage() {
  const t = useGameT()
  const l = useL()
  const results = useProgress((s) => s.results)
  const days = useProgress((s) => s.days)
  const snapshot = { results, days }
  const xp = totalXp(results)
  const rank = rankOf(xp)
  const n = streak(days)
  // The day is fixed when the page opens; quests change with the date only on a new visit.
  const [today] = useState(() => dayKey(new Date()))
  const quests = questsFor(today, AI_ENABLED)
  const open = achievements.filter((a) => a.test(snapshot))
  const count = (prefix: string, min: number) => Object.entries(results).filter(([k, r]) => k.startsWith(prefix) && r.best >= min).length

  const stats: [keyof typeof t.statLabels, number, number | null][] = [
    ['lessons', lessons.filter((x) => (results[lessonKey(x.id)]?.best ?? 0) >= LESSON_PASS).length, lessons.length],
    ['exams', modules.filter((m) => examDone(results, m.track)).length, modules.length],
    ['coding', codingTasks.filter((x) => (results[codeKey(x.id)]?.best ?? 0) >= 100).length, codingTasks.length],
    ['predict', predictTasks.filter((x) => (results[predictKey(x.id)]?.best ?? 0) >= 100).length, predictTasks.length],
    ['incidents', count('incident:', 100), INCIDENT_COUNT],
    ['interviews', count('interview:', INTERVIEW_PASS), null],
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <header className="relative overflow-hidden rounded-[2rem] p-8 text-white shadow-xl" style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777 55%, #ea580c)' }}>
        <div aria-hidden className="absolute inset-0 bg-black/35" />
        <div className="relative flex flex-wrap items-center gap-6">
          <span aria-hidden className="flex size-20 items-center justify-center rounded-3xl bg-white/20 text-5xl">
            {rank.current.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold uppercase tracking-wide text-white/85">{t.rank}</p>
            <h1 className="text-4xl font-extrabold">{l(rank.current.name)}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-3 font-semibold">
              <span className="inline-flex items-center gap-1">
                <Zap size={16} aria-hidden /> {t.xp(xp)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Flame size={16} aria-hidden /> {n ? t.streak(n) : t.noStreak}
              </span>
            </p>
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(rank.progress * 100)}
              aria-label={t.rankProgress(Math.round(rank.progress * 100))}
              className="mt-3 h-3 max-w-md rounded-full bg-white/25"
            >
              <div className="h-full rounded-full bg-white transition-[width] duration-700" style={{ width: `${Math.max(3, rank.progress * 100)}%` }} />
            </div>
            <p className="mt-1 text-sm text-white/90">{rank.next ? t.toNext(rank.next.xp - xp, l(rank.next.name)) : t.maxRank}</p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="rounded-3xl border border-line bg-surface p-5">
          <h2 className="text-xl font-bold">{t.quests}</h2>
          <p className="mt-1 text-sm text-muted">{t.questsHint}</p>
          <ul className="mt-3 space-y-3">
            {quests.map((q) => {
              const value = Math.min(q.goal, q.count(results, today))
              const done = value >= q.goal
              return (
                <li key={q.id} className={clsx('flex items-center gap-3 rounded-2xl border p-3', done ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-line bg-canvas')}>
                  <span aria-hidden className="text-2xl">
                    {q.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{l(q.text)}</p>
                    <div
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={q.goal}
                      aria-valuenow={value}
                      aria-label={`${l(q.text)}: ${t.questProgress(value, q.goal)}`}
                      className="mt-1.5 h-2 rounded-full bg-surface-2"
                    >
                      <div className={clsx('h-full rounded-full', done ? 'bg-emerald-500' : 'bg-brand')} style={{ width: `${(value / q.goal) * 100}%` }} />
                    </div>
                  </div>
                  {done ? (
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 size={16} aria-hidden /> {t.questDone}
                    </span>
                  ) : (
                    <Link to={q.link} className="rounded-full bg-brand px-3 py-1 text-sm font-semibold text-white">
                      {t.go}
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        </section>

        <section className="rounded-3xl border border-line bg-surface p-5">
          <h2 className="text-xl font-bold">{t.stats}</h2>
          <dl className="mt-3 grid grid-cols-2 gap-3">
            {stats.map(([key, value, total]) => (
              <div key={key} className="rounded-2xl bg-canvas p-3">
                <dt className="text-sm text-muted">{t.statLabels[key]}</dt>
                <dd className="mt-1 text-2xl font-extrabold">{total === null ? value : t.of(value, total)}</dd>
              </div>
            ))}
          </dl>
          <h3 className="mt-5 font-bold">{t.ranks}</h3>
          <p className="text-sm text-muted">{t.ranksHint}</p>
          <ol className="mt-2 flex flex-wrap gap-2">
            {ranks.map((r, i) => (
              <li
                key={r.xp}
                aria-current={i === rank.index ? 'step' : undefined}
                className={clsx('rounded-full px-3 py-1 text-sm font-semibold', i === rank.index ? 'bg-brand text-white' : i < rank.index ? 'bg-surface-2' : 'bg-surface-2 text-muted')}
              >
                <span aria-hidden>{r.emoji}</span> {l(r.name)} · {r.xp}
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section className="rounded-3xl border border-line bg-surface p-5">
        <div className="flex flex-wrap items-baseline gap-x-3">
          <h2 className="text-xl font-bold">{t.achievements}</h2>
          <p className="text-sm font-semibold text-muted">{t.achievementsCount(open.length, achievements.length)}</p>
        </div>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[...achievements].sort((a, b) => Number(b.test(snapshot)) - Number(a.test(snapshot))).map((a) => {
            const got = a.test(snapshot)
            const hidden = a.secret && !got
            const p = a.progress?.(snapshot)
            return (
              <li key={a.id} className={clsx('flex gap-3 rounded-2xl border p-4', got ? 'border-amber-500/60 bg-amber-500/10' : 'border-line bg-canvas')}>
                <span aria-hidden className={clsx('flex size-12 shrink-0 items-center justify-center rounded-2xl text-2xl', got ? 'bg-amber-500/20' : 'bg-surface-2 grayscale')}>
                  {hidden ? <Lock size={20} /> : a.emoji}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold">
                    {hidden ? t.secret : l(a.title)}
                    <span className="sr-only">, {got ? t.unlocked : t.locked}</span>
                  </p>
                  <p className="text-sm text-muted">{hidden ? t.secretText : l(a.text)}</p>
                  {!got && p && p.goal > 1 && <p className="mt-1 text-xs font-semibold text-muted">{t.of(p.value, p.goal)}</p>}
                </div>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
