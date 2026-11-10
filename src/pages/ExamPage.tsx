import { ArrowLeft, Swords } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { Quiz } from '../components/Quiz'
import { examKey, getModule } from '../content/lessons'
import { getTrack } from '../content/tracks'
import { gradient } from '../design/gradient'
import { useL, useLocale, useT } from '../i18n'
import { useProgress } from '../store'

export default function ExamPage() {
  const { id = '' } = useParams()
  const t = useT()
  const l = useL()
  const locale = useLocale()
  const record = useProgress((s) => s.record)
  const best = useProgress((s) => s.results[examKey(id)]?.best)
  const track = getTrack(id)
  const mod = getModule(id)
  if (!track || !mod)
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p>{t.track.notFound}</p>
      </div>
    )
  const passPct = Math.round(mod.exam.pass * 100)
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <Link to={`/track/${track.id}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft size={16} aria-hidden /> {l(track.title)}
      </Link>
      <header className="relative mt-5 overflow-hidden rounded-[2rem] p-8 text-white shadow-xl" style={{ background: gradient(track) }}>
        <span aria-hidden className="absolute inset-0 bg-black/50" />
        <div className="relative">
          <Swords size={36} aria-hidden />
          <h1 className="mt-3 text-3xl font-extrabold">
            {t.exam.title}: {l(track.title)}
          </h1>
          <p className="mt-2 text-white/90">{t.exam.intro(mod.exam.questions[locale].length, passPct)}</p>
          {best !== undefined && <p className="mt-2 text-sm font-semibold text-white">{t.exam.best(best)}</p>}
        </div>
      </header>
      <div className="mt-8">
        <Quiz key={locale} questions={l(mod.exam.questions)} passPct={passPct} onFinish={(pct) => record(examKey(track.id), pct)} />
      </div>
    </article>
  )
}
