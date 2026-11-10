import { ArrowLeft, BookOpen, ExternalLink, Hammer } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { Rich } from '../components/Rich'
import { gradient } from '../design/gradient'
import { overviews } from '../content/overviews'
import { getTrack } from '../content/tracks'
import { useL, useT } from '../i18n'

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

      <aside className="mt-8 flex gap-3 rounded-3xl border border-dashed border-line bg-surface-2/60 p-5 text-sm leading-relaxed text-muted">
        <Hammer size={18} aria-hidden className="mt-0.5 shrink-0 text-brand-3" />
        <p>
          <span className="font-semibold text-ink">{t.track.comingTitle}. </span>
          {t.track.comingText}
        </p>
      </aside>

      <section aria-labelledby="more" className="mt-10 border-t border-line pt-8">
        <h2 id="more" className="flex items-center gap-2 text-lg font-semibold">
          <BookOpen size={18} aria-hidden className="text-brand-1" /> {t.track.readMore}
        </h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {track.docs.map((d) => (
            <li key={d.url}>
              <a
                href={d.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-4 py-2.5 text-sm font-medium transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span>
                  {d.title}
                  <span className="block text-xs font-normal text-muted">{new URL(d.url).hostname}</span>
                </span>
                <ExternalLink size={15} aria-hidden className="shrink-0 text-muted" />
              </a>
            </li>
          ))}
        </ul>
      </section>
    </article>
  )
}
