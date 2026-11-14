import { Activity, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router'
import { incidentKey, incidentSolved } from '../content/progress'
import { useL } from '../i18n'
import { scenarios } from '../perf/scenarios'
import { usePerfT } from '../perf/strings'
import { useProgress } from '../store'

const difficultyStyle = {
  easy: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300',
  medium: 'bg-amber-500/15 text-amber-800 dark:text-amber-300',
  hard: 'bg-rose-500/15 text-rose-800 dark:text-rose-300',
}

export default function IncidentListPage() {
  const t = usePerfT()
  const l = useL()
  const results = useProgress((s) => s.results)
  const solved = scenarios.filter((sc) => incidentSolved(results, sc.id)).length
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="relative overflow-hidden rounded-[2rem] p-8 text-white shadow-xl" style={{ background: 'linear-gradient(135deg, #f43f5e, #f97316 60%, #eab308)' }}>
        {/* Dark scrim keeps white text at AA contrast on the yellow end of the gradient. */}
        <div aria-hidden className="absolute inset-0 bg-black/45" />
        <div className="relative">
          <span aria-hidden className="flex size-12 items-center justify-center rounded-2xl bg-white/20">
            <Activity size={26} />
          </span>
          <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">{t.title}</h1>
          <p className="mt-3 max-w-3xl text-base leading-relaxed text-white/95">{t.intro}</p>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/85">{t.model}</p>
          <p className="mt-4 inline-flex rounded-full bg-white/20 px-3 py-1 text-sm font-semibold">{t.progress(solved, scenarios.length)}</p>
        </div>
      </header>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {scenarios.map((sc) => {
          const done = incidentSolved(results, sc.id)
          const best = results[incidentKey(sc.id)]?.best
          return (
            <li key={sc.id}>
              <Link to={`/incident/${sc.id}`} className="group flex h-full flex-col rounded-3xl border border-line bg-surface p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="flex items-start gap-3">
                  <span aria-hidden className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-surface-2 text-2xl">
                    {sc.emoji}
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold leading-tight">{l(sc.title)}</h2>
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted">
                      <span className={`rounded-full px-2 py-0.5 ${difficultyStyle[sc.difficulty]}`}>{t.difficulty[sc.difficulty]}</span>
                      <span>
                        {t.releases(sc.turns)} {t.hoursEach(sc.hoursPerTurn)}
                      </span>
                    </p>
                  </div>
                </div>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">{l(sc.brief)}</p>
                <p className="mt-auto flex items-center gap-2 pt-4 text-sm font-semibold">
                  {done ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 size={16} aria-hidden /> {t.solved}
                    </span>
                  ) : best !== undefined ? (
                    <span className="text-muted">{t.best(best)}</span>
                  ) : (
                    <span className="text-muted">{t.target(sc.target)}</span>
                  )}
                </p>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
