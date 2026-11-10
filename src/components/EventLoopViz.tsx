import clsx from 'clsx'
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { foldTrace, type Frame } from '../content/predict/trace'
import type { TraceEvent } from '../content/predict/types'
import { useL, useT } from '../i18n'

const STEP_MS = 1100

/**
 * Step-by-step event loop: code with the current line, call stack, microtask and task queues,
 * pending timers and console. The state at step N is recomputed from the trace each time.
 */
export function EventLoopViz({ code, trace }: { code: string; trace: TraceEvent[] }) {
  const t = useT()
  const l = useL()
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const total = trace.length
  const { state } = foldTrace(trace, step)
  const event = step > 0 ? trace[step - 1] : null
  const lines = code.trimEnd().split('\n')

  // Playback stops by itself at the last step.
  const running = playing && step < total
  useEffect(() => {
    if (!running) return
    const id = setTimeout(() => setStep((s) => s + 1), STEP_MS)
    return () => clearTimeout(id)
  }, [running, step])

  const describe = (e: TraceEvent): string => {
    switch (e.op) {
      case 'call':
        return t.viz.ops.call(e.label)
      case 'return':
        return t.viz.ops.return
      case 'micro':
        return t.viz.ops.micro(e.label)
      case 'timer':
        return t.viz.ops.timer(e.label, e.ms)
      case 'expire':
        return t.viz.ops.expire(e.label)
      case 'run-micro':
        return t.viz.ops.runMicro
      case 'run-task':
        return t.viz.ops.runTask
      case 'log':
        return t.viz.ops.log(e.text)
    }
  }

  const button = 'inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm font-semibold transition hover:bg-surface-2 disabled:opacity-40 disabled:hover:bg-transparent'

  return (
    <section aria-labelledby="viz-title" className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-5">
      <h2 id="viz-title" className="text-xl font-bold">
        {t.viz.title}
      </h2>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" className={button} onClick={() => (setPlaying(false), setStep((s) => Math.max(0, s - 1)))} disabled={step === 0}>
          <ChevronLeft size={16} aria-hidden /> {t.viz.prev}
        </button>
        <button type="button" className={clsx(button, 'border-transparent bg-brand text-white hover:bg-brand')} onClick={() => (setPlaying(false), setStep((s) => Math.min(total, s + 1)))} disabled={step === total}>
          {t.viz.next} <ChevronRight size={16} aria-hidden />
        </button>
        <button
          type="button"
          className={button}
          onClick={() => {
            if (running) return setPlaying(false)
            if (step >= total) setStep(0)
            setPlaying(true)
          }}
        >
          {running ? <Pause size={15} aria-hidden /> : <Play size={15} aria-hidden />} {running ? t.viz.pause : t.viz.play}
        </button>
        <button type="button" className={button} onClick={() => (setPlaying(false), setStep(0))} disabled={step === 0}>
          <RotateCcw size={15} aria-hidden /> {t.viz.restart}
        </button>
        <span className="ml-auto text-sm font-semibold tabular-nums text-muted">{t.viz.step(step, total)}</span>
      </div>

      <div aria-live="polite" className="mt-3 min-h-[3.5rem] rounded-2xl bg-surface-2 px-4 py-3 text-[15px] leading-relaxed">
        {event ? (
          <>
            <span className="font-semibold">{describe(event)}</span>
            {event.note && <span className="block text-muted">{l(event.note)}</span>}
          </>
        ) : (
          <span className="text-muted">{t.viz.start}</span>
        )}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <figure className="min-w-0">
          <figcaption className="mb-1.5 text-xs font-bold uppercase tracking-wider text-muted">{t.viz.code}</figcaption>
          <pre className="code-block overflow-x-auto rounded-2xl border border-line py-3 font-mono text-[13px] leading-relaxed">
            {lines.map((text, i) => (
              <div
                key={i}
                className={clsx('flex px-3 transition-colors', state.line === i + 1 && 'bg-brand-1/20 shadow-[inset_3px_0_0_var(--brand-1)]')}
                aria-current={state.line === i + 1 ? 'step' : undefined}
              >
                <span aria-hidden className="mr-3 w-5 shrink-0 select-none text-right text-[color:var(--code-comment)]">
                  {i + 1}
                </span>
                <span className="whitespace-pre">{text || ' '}</span>
              </div>
            ))}
          </pre>
        </figure>

        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
          <Panel title={t.viz.stack} items={[...state.stack].reverse()} empty={t.viz.empty} tone="violet" className="sm:col-span-2" />
          <Panel title={t.viz.micro} items={state.micro} empty={t.viz.empty} tone="pink" />
          <Panel title={t.viz.tasks} items={state.tasks} empty={t.viz.empty} tone="orange" />
          <Panel title={t.viz.timers} items={state.timers.map((x) => ({ ...x, label: `${x.label} · ${x.ms} ms` }))} empty={t.viz.empty} tone="cyan" />
          <div className="min-w-0 rounded-2xl border border-line p-3">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">{t.viz.console}</p>
            <pre className="mt-2 min-h-8 whitespace-pre-wrap font-mono text-[13px] leading-relaxed">{state.logs.join('\n') || <span className="text-muted">{t.viz.empty}</span>}</pre>
          </div>
        </div>
      </div>
    </section>
  )
}

const tones = {
  violet: 'bg-violet-500/15 border-violet-500/40',
  pink: 'bg-pink-500/15 border-pink-500/40',
  orange: 'bg-orange-500/15 border-orange-500/40',
  cyan: 'bg-cyan-500/15 border-cyan-500/40',
}

function Panel({ title, items, empty, tone, className }: { title: string; items: Frame[]; empty: string; tone: keyof typeof tones; className?: string }) {
  return (
    <div className={clsx('min-w-0 rounded-2xl border border-line p-3', className)}>
      <p className="text-xs font-bold uppercase tracking-wider text-muted">{title}</p>
      {items.length ? (
        <ol className="mt-2 space-y-1.5">
          {items.map((f, i) => (
            <li key={`${f.label}-${i}`} title={f.label} className={clsx('truncate rounded-lg border px-2.5 py-1 font-mono text-[12.5px]', tones[tone])}>
              {f.label}
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-2 text-sm text-muted">{empty}</p>
      )}
    </div>
  )
}
