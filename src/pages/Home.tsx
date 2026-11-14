import { Bug, Code2, MessagesSquare, Terminal } from 'lucide-react'
import { motion } from 'motion/react'
import { Link } from 'react-router'
import { TrackCard } from '../components/TrackCard'
import { groupOrder, tracks } from '../content/tracks'
import { useT } from '../i18n'

const modes = [
  { id: 'coding', icon: Code2, colors: ['#facc15', '#f97316'], to: '/practice/coding' },
  { id: 'predict', icon: Terminal, colors: ['#22d3ee', '#6366f1'], to: '/practice/predict' },
  { id: 'incidents', icon: Bug, colors: ['#f43f5e', '#f97316'], to: '/practice/incidents' },
  { id: 'interview', icon: MessagesSquare, colors: ['#a855f7', '#ec4899'], to: '/interview' },
] as const

export default function Home() {
  const t = useT()
  return (
    <>
      <section className="bg-glow">
        <div className="mx-auto max-w-6xl px-4 pb-14 pt-16 sm:pt-24">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl text-4xl font-extrabold leading-[1.1] sm:text-6xl"
          >
            <span className="text-brand">{t.home.heroTitle}</span>
          </motion.h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{t.home.heroText}</p>
          <a
            href="#tracks"
            className="mt-8 inline-flex items-center rounded-full bg-brand px-6 py-3 font-semibold text-white shadow-lg transition hover:scale-105 hover:shadow-xl active:scale-100"
          >
            {t.home.start} →
          </a>
        </div>
      </section>

      <section aria-labelledby="modes" className="mx-auto max-w-6xl px-4 py-10">
        <h2 id="modes" className="text-2xl font-bold">
          {t.home.modesTitle}
        </h2>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {modes.map(({ id, icon: Icon, colors, to }) => {
            const inner = (
              <>
                <span aria-hidden className="flex size-11 items-center justify-center rounded-2xl text-white shadow-md" style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}>
                  <Icon size={22} />
                </span>
                <h3 className="mt-4 text-base font-semibold">{t.home.modes[id].title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{t.home.modes[id].text}</p>
              </>
            )
            return (
              <li key={id} className="relative">
                {to ? (
                  <Link to={to} className="block h-full rounded-3xl border border-line bg-surface p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                    {inner}
                  </Link>
                ) : (
                  <div className="h-full rounded-3xl border border-line bg-surface p-5 shadow-sm">
                    {inner}
                    <span className="absolute right-4 top-4 rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-semibold text-muted">{t.home.soon}</span>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </section>

      <section id="tracks" aria-labelledby="tracks-title" className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-20 pt-6">
        <h2 id="tracks-title" className="text-2xl font-bold">
          {t.home.tracksTitle}
        </h2>
        {groupOrder.map((g) => (
          <div key={g} className="mt-8">
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-muted">{t.groups[g]}</h3>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tracks
                .filter((tr) => tr.group === g)
                .map((tr) => (
                  <TrackCard key={tr.id} track={tr} />
                ))}
            </div>
          </div>
        ))}
      </section>
    </>
  )
}
