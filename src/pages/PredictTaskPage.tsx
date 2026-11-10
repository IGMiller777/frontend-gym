import clsx from 'clsx'
import { ArrowLeft, CheckCircle2, Info, RotateCcw, XCircle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { DifficultyBadge } from '../components/Difficulty'
import { EventLoopViz } from '../components/EventLoopViz'
import { Markdown } from '../components/Markdown'
import { ReadMore } from '../components/ReadMore'
import { Rich } from '../components/Rich'
import { getPredictTask, predictKey, type PredictTask } from '../content/predict'
import { predictSolved } from '../content/progress'
import { getTrack } from '../content/tracks'
import { gradient } from '../design/gradient'
import { useL, useT } from '../i18n'
import { useProgress } from '../store'

/** Deterministic shuffle (seeded by the task id): the same order on every visit and in both languages. */
function shuffled<T>(items: T[], seed: string): T[] {
  let h = 2166136261
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  const next = () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export default function PredictTaskPage() {
  const { id = '' } = useParams()
  const t = useT()
  const task = getPredictTask(id)
  if (!task)
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p>{t.predict.notFound}</p>
      </div>
    )
  return <PredictView key={task.id} task={task} />
}

function PredictView({ task }: { task: PredictTask }) {
  const t = useT()
  const l = useL()
  const track = getTrack(task.track)
  const record = useProgress((s) => s.record)
  const solved = useProgress((s) => predictSolved(s.results, task.id))
  /** Every line is a separate chip, so repeated lines ("3", "3", "3") are separate choices. */
  const chips = useMemo(() => shuffled([...task.output, ...task.distractors], task.id), [task])
  const [picked, setPicked] = useState<number[]>([])
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  const answer = picked.map((i) => chips[i])
  const right = checked && answer.length === task.output.length && answer.every((s, i) => s === task.output[i])

  const check = () => {
    setChecked(true)
    const ok = answer.length === task.output.length && answer.every((s, i) => s === task.output[i])
    record(predictKey(task.id), ok ? 100 : 0)
  }
  const retry = () => {
    setPicked([])
    setChecked(false)
  }

  return (
    <article className="mx-auto max-w-5xl px-4 py-8">
      <Link to="/practice/predict" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft size={16} aria-hidden /> {t.predict.back}
      </Link>

      <header className="mt-4 flex items-center gap-4">
        <span aria-hidden className="flex size-14 shrink-0 items-center justify-center rounded-2xl text-3xl shadow-md" style={track ? { background: gradient(track) } : undefined}>
          {track?.emoji}
        </span>
        <div>
          <h1 className="text-2xl font-extrabold leading-tight sm:text-3xl">{l(task.title)}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm font-semibold text-muted">
            <DifficultyBadge level={task.difficulty} />
            {track && (
              <Link to={`/track/${track.id}`} className="hover:text-ink">
                {l(track.title)}
              </Link>
            )}
            {solved && (
              <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 size={15} aria-hidden /> {t.practice.solved}
              </span>
            )}
          </p>
        </div>
      </header>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
        <div className="min-w-0">
          <Markdown size="base">{'```js\n' + task.code + '```'}</Markdown>
          <p className="flex gap-2 text-sm text-muted">
            <Info size={16} aria-hidden className="mt-0.5 shrink-0" />
            <span>
              <Rich text={t.predict.moduleNote} />
            </span>
          </p>
        </div>

        <div className="min-w-0 space-y-4">
          <p className="text-[15px] leading-relaxed">{t.predict.pick(task.output.length)}</p>

          <section aria-labelledby="answer" className="rounded-3xl border border-line bg-surface p-4 shadow-sm">
            <h2 id="answer" className="text-xs font-bold uppercase tracking-wider text-muted">
              {t.predict.answer}
            </h2>
            {answer.length ? (
              <ol className="mt-2 space-y-1.5">
                {picked.map((chip, pos) => {
                  const ok = checked ? task.output[pos] === chips[chip] : null
                  return (
                    <li key={chip} className="flex items-center gap-2">
                      <span className="w-5 text-right font-mono text-xs text-muted">{pos + 1}</span>
                      <button
                        type="button"
                        disabled={checked}
                        aria-label={t.predict.remove(chips[chip])}
                        onClick={() => setPicked((p) => p.filter((x) => x !== chip))}
                        className={clsx(
                          'flex-1 rounded-xl border-2 px-3 py-1.5 text-left font-mono text-sm transition',
                          ok === null && 'border-brand-1/40 bg-brand-1/10 hover:border-rose-500/60',
                          ok === true && 'border-emerald-500 bg-emerald-500/10',
                          ok === false && 'border-rose-500 bg-rose-500/10',
                        )}
                      >
                        {chips[chip]}
                      </button>
                      {ok === true && <CheckCircle2 size={17} aria-hidden className="text-emerald-600 dark:text-emerald-400" />}
                      {ok === false && <XCircle size={17} aria-hidden className="text-rose-600 dark:text-rose-400" />}
                    </li>
                  )
                })}
              </ol>
            ) : (
              <p className="mt-2 text-sm text-muted">{t.predict.empty}</p>
            )}
          </section>

          {!checked && (
            <section aria-labelledby="options">
              <h2 id="options" className="text-xs font-bold uppercase tracking-wider text-muted">
                {t.predict.options}
              </h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {chips.map((text, i) =>
                  picked.includes(i) ? null : (
                    <button
                      key={i}
                      type="button"
                      aria-label={t.predict.add(text)}
                      onClick={() => setPicked((p) => [...p, i])}
                      className="rounded-xl border-2 border-line bg-surface px-3 py-1.5 font-mono text-sm shadow-sm transition hover:-translate-y-0.5 hover:border-brand-1"
                    >
                      {text}
                    </button>
                  ),
                )}
              </div>
            </section>
          )}

          <div className="flex flex-wrap gap-2">
            {checked ? (
              <button type="button" onClick={retry} className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-semibold hover:bg-surface-2">
                <RotateCcw size={14} aria-hidden /> {t.predict.retry}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={check}
                  disabled={answer.length !== task.output.length}
                  className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white shadow transition hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {t.predict.check}
                </button>
                <button type="button" onClick={() => setPicked([])} disabled={!answer.length} className="rounded-full border border-line px-4 py-2 text-sm font-semibold hover:bg-surface-2 disabled:opacity-50">
                  {t.predict.clear}
                </button>
              </>
            )}
          </div>

          {checked && (
            <div role="status" className={clsx('rounded-3xl p-4', right ? 'bg-emerald-500/10' : 'bg-rose-500/10')}>
              <p className="font-display text-lg font-bold">{right ? t.predict.right : t.predict.wrong}</p>
              {!right && (
                <>
                  <p className="mt-2 text-sm font-semibold text-muted">{t.predict.expected}</p>
                  <pre className="mt-1 rounded-xl bg-surface p-3 font-mono text-sm">{task.output.join('\n')}</pre>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {checked && (
        <>
          <section aria-labelledby="why" className="mt-8">
            <h2 id="why" className="text-2xl font-bold">
              {t.predict.why}
            </h2>
            <div className="mt-3">
              <Markdown size="base">{l(task.explanation)}</Markdown>
            </div>
          </section>
          {task.trace && (
            <div className="mt-8">
              <EventLoopViz code={task.code} trace={task.trace} />
            </div>
          )}
        </>
      )}

      <ReadMore sources={task.sources} verified={task.verified} />
    </article>
  )
}
