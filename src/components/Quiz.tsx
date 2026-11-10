import clsx from 'clsx'
import { Check, RotateCcw, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { QuizQuestion } from '../content/lessons'
import { useT } from '../i18n'
import { Rich } from './Rich'

/**
 * Multiple-choice quiz: answer each question, see why right away, get a score at the end.
 * `onFinish` receives the percentage (0..100).
 */
export function Quiz({ questions, onFinish, passPct }: { questions: QuizQuestion[]; onFinish: (pct: number) => void; passPct: number }) {
  const t = useT()
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null))
  const [round, setRound] = useState(0)
  const done = answers.every((a) => a !== null)
  const right = answers.filter((a, i) => a === questions[i].correct).length
  const pct = Math.round((right / questions.length) * 100)

  // Functional update: several answers in one render must not overwrite each other.
  const choose = (qi: number, oi: number) => setAnswers((prev) => (prev[qi] !== null ? prev : prev.map((a, i) => (i === qi ? oi : a))))

  // Report the score once per completed round (an effect, so StrictMode's double render cannot record twice).
  const reported = useRef(false)
  useEffect(() => {
    if (!done) reported.current = false
    else if (!reported.current) {
      reported.current = true
      onFinish(pct)
    }
  }, [done, pct, onFinish])

  return (
    <div key={round} className="space-y-5">
      {questions.map((q, qi) => {
        const chosen = answers[qi]
        return (
          <fieldset key={qi} className="rounded-3xl border border-line bg-surface p-5 shadow-sm sm:p-6">
            <legend className="sr-only">{t.quiz.question(qi + 1, questions.length)}</legend>
            <p className="text-xs font-bold uppercase tracking-wider text-muted" aria-hidden>
              {t.quiz.question(qi + 1, questions.length)}
            </p>
            <p className="mt-2 text-lg font-semibold leading-snug">
              <Rich text={q.q} />
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {q.options.map((o, oi) => {
                const isRight = oi === q.correct
                const state = chosen === null ? 'idle' : isRight ? 'right' : chosen === oi ? 'wrong' : 'dim'
                return (
                  <button
                    key={oi}
                    type="button"
                    disabled={chosen !== null}
                    aria-pressed={chosen === oi}
                    onClick={() => choose(qi, oi)}
                    className={clsx(
                      'flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-[15px] transition',
                      state === 'idle' && 'border-line hover:-translate-y-0.5 hover:border-brand-1 hover:shadow-md',
                      state === 'right' && 'border-emerald-500 bg-emerald-500/10',
                      state === 'wrong' && 'border-rose-500 bg-rose-500/10',
                      state === 'dim' && 'border-line opacity-60',
                    )}
                  >
                    <span
                      aria-hidden
                      className={clsx(
                        'flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold',
                        state === 'right' ? 'bg-emerald-500 text-white' : state === 'wrong' ? 'bg-rose-500 text-white' : 'bg-surface-2 text-muted',
                      )}
                    >
                      {state === 'right' ? <Check size={15} /> : state === 'wrong' ? <X size={15} /> : String.fromCharCode(65 + oi)}
                    </span>
                    <span>
                      <Rich text={o} />
                    </span>
                  </button>
                )
              })}
            </div>
            {chosen !== null && (
              <p role="status" className={clsx('mt-4 rounded-2xl px-4 py-3 text-[15px] leading-relaxed', chosen === q.correct ? 'bg-emerald-500/10' : 'bg-rose-500/10')}>
                <span className="font-semibold">{chosen === q.correct ? t.quiz.right : t.quiz.wrong} </span>
                <Rich text={q.why} />
              </p>
            )}
          </fieldset>
        )
      })}

      {done && (
        <div role="status" className={clsx('flex flex-wrap items-center gap-4 rounded-3xl p-5 text-white shadow-lg', pct >= passPct ? 'bg-brand' : 'bg-slate-700')}>
          <span className="font-display text-3xl font-extrabold">{pct}%</span>
          <span className="flex-1 text-base font-medium">
            {t.quiz.score(right, questions.length)} {pct >= passPct ? t.quiz.passed : t.quiz.failed(passPct)}
          </span>
          <button
            type="button"
            onClick={() => {
              setAnswers(questions.map(() => null))
              setRound((r) => r + 1)
            }}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold transition hover:bg-white/30"
          >
            <RotateCcw size={15} aria-hidden /> {t.quiz.retry}
          </button>
        </div>
      )}
    </div>
  )
}
