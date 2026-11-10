import clsx from 'clsx'
import { ArrowLeft, CheckCircle2, Circle, Hammer, Swords } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { ReadMore } from '../components/ReadMore'
import { Rich } from '../components/Rich'
import { getLesson, getModule } from '../content/lessons'
import { overviews } from '../content/overviews'
import { examDone, lessonDone, moduleProgress } from '../content/progress'
import { getTrack, type Track } from '../content/tracks'
import { gradient } from '../design/gradient'
import { useL, useT } from '../i18n'
import { useProgress } from '../store'

function ModuleLessons({ track }: { track: Track }) {
  const t = useT()
  const l = useL()
  const results = useProgress((s) => s.results)
  const mod = getModule(track.id)
  const progress = moduleProgress(results, track.id)
  if (!mod || !progress) return null
  return (
    <section aria-labelledby="lessons" className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="lessons" className="text-2xl font-bold">
          {t.track.lessons}
        </h2>
        <span className="text-sm font-semibold text-muted">{t.track.progress(progress.done, progress.total)}</span>
      </div>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress.pct * 100)} aria-label={t.track.lessons}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress.pct * 100}%`, background: gradient(track) }} />
      </div>
      <ol className="mt-5 space-y-3">
        {mod.lessons.map((id, i) => {
          const lesson = getLesson(id)!
          const done = lessonDone(results, id)
          return (
            <li key={id}>
              <Link to={`/learn/${id}`} className="group flex items-center gap-4 rounded-3xl border border-line bg-surface p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                <span aria-hidden className="flex size-12 shrink-0 items-center justify-center rounded-2xl text-2xl" style={{ background: gradient(track) }}>
                  {lesson.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold text-muted">
                    {t.lesson.label(i + 1, mod.lessons.length)} · {t.lesson.minutes(lesson.minutes)}
                  </span>
                  <span className="block font-semibold">{l(lesson.title)}</span>
                  <span className="mt-0.5 block text-sm text-muted">{l(lesson.summary)}</span>
                </span>
                {done ? <CheckCircle2 size={24} className="shrink-0 text-emerald-500" aria-label={t.track.done} /> : <Circle size={24} className="shrink-0 text-line" aria-label={t.track.todo} />}
              </Link>
            </li>
          )
        })}
        <li>
          <Link
            to={`/track/${track.id}/exam`}
            className={clsx('flex items-center gap-4 rounded-3xl p-4 text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl', 'relative overflow-hidden')}
            style={{ background: gradient(track) }}
          >
            <span aria-hidden className="absolute inset-0 bg-black/45" />
            <span aria-hidden className="relative flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/20">
              <Swords size={24} />
            </span>
            <span className="relative flex-1">
              <span className="block text-xs font-semibold uppercase tracking-wider text-white/85">{t.exam.boss}</span>
              <span className="block font-semibold">{t.exam.cta}</span>
            </span>
            {examDone(results, track.id) && <CheckCircle2 size={24} className="relative shrink-0" aria-label={t.track.done} />}
          </Link>
        </li>
      </ol>
    </section>
  )
}

export default function TrackPage() {
  const { id = '' } = useParams()
  const t = useT()
  const l = useL()
  const track = getTrack(id)
  const overview = overviews[id]
  if (!track || !overview)
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p>{t.track.notFound}</p>
        <Link to="/" className="mt-4 inline-block font-semibold text-brand-1 underline">
          {t.track.back}
        </Link>
      </div>
    )
  const o = l(overview)
  const hasModule = !!getModule(track.id)
  return (
    <article className="mx-auto max-w-4xl px-4 py-10">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft size={16} aria-hidden /> {t.track.back}
      </Link>

      <header className="relative mt-5 overflow-hidden rounded-[2rem] p-8 text-white shadow-xl" style={{ background: gradient(track) }}>
        {/* Dark scrim keeps white text at AA contrast on light track colors (yellow, lime). */}
        <span aria-hidden className="absolute inset-0 bg-black/50" />
        <div className="relative">
          <span aria-hidden className="text-5xl">
            {track.emoji}
          </span>
          <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">{l(track.title)}</h1>
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-white">
            <Rich text={o.intro} />
          </p>
        </div>
      </header>

      {hasModule && <ModuleLessons track={track} />}

      <section aria-labelledby="key" className="mt-10">
        <h2 id="key" className="text-2xl font-bold">
          {t.track.keyIdeas}
        </h2>
        <ol className="mt-5 space-y-4">
          {o.topics.map((topic, i) => (
            <li key={topic.title} className="flex gap-4 rounded-3xl border border-line bg-surface p-5 shadow-sm sm:p-6">
              <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-xl font-display text-sm font-bold text-white" style={{ background: gradient(track) }}>
                {i + 1}
              </span>
              <div>
                <h3 className="text-lg font-semibold">{topic.title}</h3>
                <p className="mt-2 leading-relaxed text-ink/90">
                  <Rich text={topic.text} />
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {!hasModule && (
        <aside className="mt-8 flex gap-3 rounded-3xl border border-dashed border-line bg-surface-2/60 p-5 text-sm leading-relaxed text-muted">
          <Hammer size={18} aria-hidden className="mt-0.5 shrink-0 text-brand-3" />
          <p>
            <span className="font-semibold text-ink">{t.track.comingTitle}. </span>
            {t.track.comingText}
          </p>
        </aside>
      )}

      <ReadMore sources={track.docs} />
    </article>
  )
}
