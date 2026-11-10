import { Link } from 'react-router'
import { getModule } from '../content/lessons'
import { moduleProgress } from '../content/progress'
import type { Track } from '../content/tracks'
import { gradient } from '../design/gradient'
import { useL, useT } from '../i18n'
import { useProgress } from '../store'

export function TrackCard({ track }: { track: Track }) {
  const l = useL()
  const t = useT()
  const results = useProgress((s) => s.results)
  const mod = getModule(track.id)
  const progress = moduleProgress(results, track.id)
  return (
    <Link
      to={`/track/${track.id}`}
      className="group relative flex flex-col gap-3 overflow-hidden rounded-3xl border border-line bg-surface p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl active:translate-y-0"
    >
      <span aria-hidden className="absolute inset-x-0 top-0 h-1.5" style={{ background: gradient(track) }} />
      <span className="flex items-start justify-between gap-2">
        <span
          aria-hidden
          className="flex size-12 items-center justify-center rounded-2xl text-2xl shadow-md transition group-hover:rotate-3 group-hover:scale-110"
          style={{ background: gradient(track) }}
        >
          {track.emoji}
        </span>
        {mod && <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-semibold text-ink">{t.track.lessonsCount(mod.lessons.length)}</span>}
      </span>
      <span className="font-display text-lg font-semibold leading-tight">{l(track.title)}</span>
      <span className="text-sm leading-relaxed text-muted">{l(track.blurb)}</span>
      {progress && progress.pct > 0 && (
        <span className="mt-auto h-1.5 overflow-hidden rounded-full bg-surface-2" aria-hidden>
          <span className="block h-full rounded-full" style={{ width: `${progress.pct * 100}%`, background: gradient(track) }} />
        </span>
      )}
    </Link>
  )
}
