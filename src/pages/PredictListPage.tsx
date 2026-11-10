import { CheckCircle2, Footprints, Terminal } from 'lucide-react'
import { Link } from 'react-router'
import { DifficultyBadge } from '../components/Difficulty'
import { predictTasks } from '../content/predict'
import { predictSolved } from '../content/progress'
import { getTrack } from '../content/tracks'
import { gradient } from '../design/gradient'
import { useL, useT } from '../i18n'
import { useProgress } from '../store'

export default function PredictListPage() {
  const t = useT()
  const l = useL()
  const results = useProgress((s) => s.results)
  const solved = predictTasks.filter((x) => predictSolved(results, x.id)).length
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="relative overflow-hidden rounded-[2rem] p-8 text-white shadow-xl" style={{ background: 'linear-gradient(135deg, #0891b2, #4f46e5 60%, #7c3aed)' }}>
        <div aria-hidden className="absolute inset-0 bg-black/25" />
        <div className="relative">
          <span aria-hidden className="flex size-12 items-center justify-center rounded-2xl bg-white/20">
            <Terminal size={26} />
          </span>
          <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">{t.predict.title}</h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/95">{t.predict.intro}</p>
          <p className="mt-4 inline-flex rounded-full bg-white/20 px-3 py-1 text-sm font-semibold">{t.predict.progress(solved, predictTasks.length)}</p>
        </div>
      </header>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {predictTasks.map((task) => {
          const track = getTrack(task.track)
          const done = predictSolved(results, task.id)
          return (
            <li key={task.id}>
              <Link to={`/predict/${task.id}`} className="flex h-full flex-col rounded-3xl border border-line bg-surface p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="flex items-start gap-3">
                  <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-xl text-xl" style={track ? { background: gradient(track) } : undefined}>
                    {track?.emoji}
                  </span>
                  <h2 className="flex-1 text-base font-bold leading-snug">{l(task.title)}</h2>
                  {done && (
                    <span className="text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 size={20} aria-hidden />
                      <span className="sr-only">{t.practice.solved}</span>
                    </span>
                  )}
                </div>
                <pre className="code-block mt-3 flex-1 overflow-hidden rounded-xl border border-line p-3 font-mono text-[11.5px] leading-snug text-ink/80" aria-hidden>
                  {task.code.split('\n').slice(0, 4).join('\n')}
                </pre>
                <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-muted">
                  <DifficultyBadge level={task.difficulty} />
                  {task.trace && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/15 px-2.5 py-0.5 text-cyan-800 dark:text-cyan-300">
                      <Footprints size={12} aria-hidden /> {t.predict.traced}
                    </span>
                  )}
                  {track && <span className="ml-auto truncate">{l(track.title)}</span>}
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
