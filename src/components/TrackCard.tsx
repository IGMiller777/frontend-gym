import { Link } from 'react-router'
import type { Track } from '../content/tracks'
import { gradient } from '../design/gradient'
import { useL } from '../i18n'

export function TrackCard({ track }: { track: Track }) {
  const l = useL()
  return (
    <Link
      to={`/track/${track.id}`}
      className="group relative flex flex-col gap-3 overflow-hidden rounded-3xl border border-line bg-surface p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl active:translate-y-0"
      style={{ ['--track' as string]: track.colors[0] }}
    >
      <span aria-hidden className="absolute inset-x-0 top-0 h-1.5" style={{ background: gradient(track) }} />
      <span
        aria-hidden
        className="flex size-12 items-center justify-center rounded-2xl text-2xl shadow-md transition group-hover:scale-110 group-hover:rotate-3"
        style={{ background: gradient(track) }}
      >
        {track.emoji}
      </span>
      <span className="font-display text-lg font-semibold leading-tight">{l(track.title)}</span>
      <span className="text-sm leading-relaxed text-muted">{l(track.blurb)}</span>
    </Link>
  )
}
