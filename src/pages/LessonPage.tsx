import { ArrowLeft, ArrowRight, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { Markdown } from '../components/Markdown'
import { Quiz } from '../components/Quiz'
import { ReadMore } from '../components/ReadMore'
import { getLesson, getModule, LESSON_PASS, lessonKey } from '../content/lessons'
import { loadLessonBody } from '../content/lessons/body'
import { getTrack } from '../content/tracks'
import { gradient } from '../design/gradient'
import { useL, useLocale, useT } from '../i18n'
import { useProgress } from '../store'

export default function LessonPage() {
  const { id = '' } = useParams()
  const t = useT()
  const l = useL()
  const locale = useLocale()
  const record = useProgress((s) => s.record)
  const lesson = getLesson(id)
  const track = lesson && getTrack(lesson.track)
  const [body, setBody] = useState<{ key: string; text: string } | null>(null)
  const key = `${id}.${locale}`

  useEffect(() => {
    if (!lesson) return
    let alive = true
    loadLessonBody(lesson.track, lesson.id, locale).then((text) => alive && setBody({ key, text }))
    return () => {
      alive = false
    }
  }, [lesson, locale, key])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [id])

  if (!lesson || !track)
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p>{t.lesson.notFound}</p>
      </div>
    )

  const order = getModule(lesson.track)?.lessons ?? []
  const idx = order.indexOf(lesson.id)
  const prev = idx > 0 ? getLesson(order[idx - 1]) : undefined
  const next = idx >= 0 && idx < order.length - 1 ? getLesson(order[idx + 1]) : undefined

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <Link to={`/track/${track.id}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft size={16} aria-hidden /> {l(track.title)}
      </Link>

      <header className="mt-5 flex items-start gap-4">
        <span aria-hidden className="flex size-14 shrink-0 items-center justify-center rounded-2xl text-3xl shadow-md" style={{ background: gradient(track) }}>
          {lesson.emoji}
        </span>
        <div>
          <p className="text-sm font-semibold text-muted">
            {t.lesson.label(idx + 1, order.length)} · <Clock size={13} aria-hidden className="inline" /> {t.lesson.minutes(lesson.minutes)}
          </p>
          <h1 className="mt-1 text-3xl font-extrabold leading-tight sm:text-4xl">{l(lesson.title)}</h1>
        </div>
      </header>

      <div className="mt-8">{body?.key === key ? <Markdown>{body.text}</Markdown> : <p className="text-muted">…</p>}</div>

      <section aria-labelledby="quiz" className="mt-12">
        <h2 id="quiz" className="text-2xl font-bold">
          {t.quiz.title}
        </h2>
        <p className="mt-1 text-muted">{t.quiz.hint(LESSON_PASS)}</p>
        <div className="mt-5">
          <Quiz key={key} questions={l(lesson.quiz)} passPct={LESSON_PASS} onFinish={(pct) => record(lessonKey(lesson.id), pct)} />
        </div>
      </section>

      <nav aria-label={t.lesson.nav} className="mt-10 grid gap-3 sm:grid-cols-2">
        {prev ? (
          <Link to={`/learn/${prev.id}`} className="rounded-2xl border border-line bg-surface px-4 py-3 transition hover:-translate-y-0.5 hover:shadow-md">
            <span className="flex items-center gap-1 text-xs font-semibold text-muted">
              <ArrowLeft size={13} aria-hidden /> {t.lesson.prev}
            </span>
            <span className="font-semibold">{l(prev.title)}</span>
          </Link>
        ) : (
          <span />
        )}
        <Link
          to={next ? `/learn/${next.id}` : `/track/${track.id}/exam`}
          className="rounded-2xl border border-line bg-surface px-4 py-3 text-right transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <span className="flex items-center justify-end gap-1 text-xs font-semibold text-muted">
            {next ? t.lesson.next : t.exam.title} <ArrowRight size={13} aria-hidden />
          </span>
          <span className="font-semibold">{next ? l(next.title) : t.exam.cta}</span>
        </Link>
      </nav>

      <ReadMore sources={lesson.sources} verified={lesson.verified} />
    </article>
  )
}
