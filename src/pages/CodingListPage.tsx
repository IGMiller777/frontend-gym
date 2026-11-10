import { CheckCircle2, Clock, Code2 } from 'lucide-react'
import { Link } from 'react-router'
import { DifficultyBadge } from '../components/Difficulty'
import { codingTasks } from '../content/coding'
import { codeSolved } from '../content/progress'
import { getTrack } from '../content/tracks'
import { gradient } from '../design/gradient'
import { useL, useT } from '../i18n'
import { useProgress } from '../store'

export default function CodingListPage() {
  const t = useT()
  const l = useL()
  const results = useProgress((s) => s.results)
  const solved = codingTasks.filter((x) => codeSolved(results, x.id)).length
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="relative overflow-hidden rounded-[2rem] p-8 text-white shadow-xl" style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c 55%, #db2777)' }}>
        {/* Dark scrim keeps white text at AA contrast on the amber end of the gradient. */}
        <div aria-hidden className="absolute inset-0 bg-black/45" />
        <div className="relative">
          <span aria-hidden className="flex size-12 items-center justify-center rounded-2xl bg-white/20">
            <Code2 size={26} />
          </span>
          <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">{t.practice.codingTitle}</h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/95">{t.practice.codingIntro}</p>
          <p className="mt-4 inline-flex rounded-full bg-white/20 px-3 py-1 text-sm font-semibold">{t.practice.progress(solved, codingTasks.length)}</p>
        </div>
      </header>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {codingTasks.map((task) => {
          const track = getTrack(task.track)
          const done = codeSolved(results, task.id)
          return (
            <li key={task.id}>
              <Link
                to={`/code/${task.id}`}
                className="group flex h-full flex-col rounded-3xl border border-line bg-surface p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-xl text-xl" style={track ? { background: gradient(track) } : undefined}>
                    {track?.emoji}
                  </span>
                  <h2 className="font-mono text-base font-bold">{l(task.title)}</h2>
                  {done && (
                    <span className="ml-auto text-emerald-600 dark:text-emerald-400" title={t.practice.solved}>
                      <CheckCircle2 size={20} aria-hidden />
                      <span className="sr-only">{t.practice.solved}</span>
                    </span>
                  )}
                </div>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{l(task.summary)}</p>
                <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-muted">
                  <DifficultyBadge level={task.difficulty} />
                  <span className="inline-flex items-center gap-1">
                    <Clock size={13} aria-hidden /> {t.lesson.minutes(task.minutes)}
                  </span>
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
