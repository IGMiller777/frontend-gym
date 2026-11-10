import { BookOpen, ExternalLink } from 'lucide-react'
import type { Source, Verified } from '../content/sources'
import { useLocale, useT } from '../i18n'

/** Sources block that always goes last on a page: the explanation is above, this is for going deeper. */
export function ReadMore({ sources, verified }: { sources: Source[]; verified?: Verified }) {
  const t = useT()
  const locale = useLocale()
  return (
    <section aria-labelledby="read-more" className="mt-12 border-t border-line pt-8">
      <h2 id="read-more" className="flex items-center gap-2 text-lg font-semibold">
        <BookOpen size={18} aria-hidden className="text-brand-1" /> {t.track.readMore}
      </h2>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {sources.map((d) => (
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
      {verified && (
        <p className="mt-3 text-xs text-muted">
          {t.lesson.verified(new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(new Date(`${verified.date}-01T00:00:00`)), verified.version)}
        </p>
      )}
    </section>
  )
}
