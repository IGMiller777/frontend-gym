import clsx from 'clsx'
import { Clock, Lightbulb, LoaderCircle, Mic, MicOff, Play, Send, Volume2, VolumeX } from 'lucide-react'
import { lazy, Suspense, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { CodeEditor } from '../components/CodeEditor'
import { Markdown } from '../components/Markdown'
import { codingTasks, getCodingTask } from '../content/coding'
import { loadTaskBody } from '../content/coding/body'
import { lessons, modules } from '../content/lessons'
import { getTrack } from '../content/tracks'
import { gradient } from '../design/gradient'
import { useL, useLocale, useT } from '../i18n'
import { phaseAt, phases } from '../interview/phases'
import { designProblems, getDesignProblem } from '../interview/problems'
import { buildRequest, DURATIONS, interviewKey, loadSession, newSession, saveSession, type Session, subjectTitle } from '../interview/session'
import { type InterviewDict, useInterviewT } from '../interview/strings'
import { createRecognition, type Recognition, RecognitionCtor, speak, stopSpeaking } from '../interview/speech'
import type { InterviewFormat, InterviewGrade, InterviewMode, InterviewTurn } from '../interview/types'
import { AI_ENABLED, postApi, streamApi } from '../lib/api'
import { runInWorker } from '../runner/run'
import { runInFrame } from '../runner/run-frame'
import { useProgress } from '../store'

// React Flow is heavy; only design rounds load it.
const DesignBoard = lazy(() => import('../interview/DesignBoard').then((m) => ({ default: m.DesignBoard })))

const formats: InterviewFormat[] = ['theory', 'coding', 'design']
const modes: InterviewMode[] = ['strict', 'standard', 'coach']

export default function InterviewPage() {
  const [session, setSession] = useState<Session | null>(() => loadSession())
  useEffect(() => saveSession(session), [session])

  if (!session || !subjectTitle(session.format, session.subjectId, session.locale)) return <Setup onStart={setSession} />
  if (session.grade) return <Result session={session} onReset={() => setSession(null)} />
  return <Live session={session} setSession={setSession} />
}

// ───────────────────────── Setup ─────────────────────────

function Setup({ onStart }: { onStart: (s: Session) => void }) {
  const t = useT()
  const l = useL()
  const locale = useLocale()
  const results = useProgress((s) => s.results)
  const [format, setFormat] = useState<InterviewFormat>('design')
  const [mode, setMode] = useState<InterviewMode>('standard')
  const [duration, setDuration] = useState<number>(45)
  const iv = useInterviewT()

  const start = (subjectId: string) => {
    const title = subjectTitle(format, subjectId, locale) ?? ''
    const problem = getDesignProblem(subjectId)
    const opening = format === 'theory' ? iv.opening.theory(title) : format === 'coding' ? iv.opening.coding(title) : iv.opening.design(problem ? l(problem.prompt) : title)
    onStart(newSession(format, subjectId, { mode, durationMin: duration, locale, opening }))
  }

  const best = (id: string) => results[interviewKey(format, id)]?.best

  const card = (id: string, title: string, text: string, emoji: string, extra?: string, style?: React.CSSProperties) => (
    <li key={id}>
      <button
        type="button"
        onClick={() => start(id)}
        disabled={!AI_ENABLED}
        className="flex h-full w-full gap-3 rounded-2xl border border-line bg-surface p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-xl" style={style}>
          {emoji}
        </span>
        <span className="min-w-0">
          <span className="block font-semibold">{title}</span>
          <span className="mt-1 line-clamp-2 block text-sm text-muted">{text}</span>
          {(extra || best(id) !== undefined) && (
            <span className="mt-1.5 block text-xs font-semibold text-muted">
              {[extra, best(id) !== undefined ? iv.best(best(id)!) : ''].filter(Boolean).join(' · ')}
            </span>
          )}
        </span>
      </button>
    </li>
  )

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <header className="space-y-3">
        <h1 className="text-4xl font-extrabold">{iv.title}</h1>
        <p className="max-w-3xl text-lg leading-relaxed text-muted">{iv.intro}</p>
        {!AI_ENABLED && <p className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm">{iv.aiOff}</p>}
      </header>

      <Choice legend={iv.formatTitle} options={formats.map((f) => ({ id: f, title: iv.formats[f].title, text: iv.formats[f].text }))} value={format} onChange={(v) => setFormat(v as InterviewFormat)} />
      <Choice legend={iv.modeTitle} options={modes.map((m) => ({ id: m, title: iv.modes[m].title, text: iv.modes[m].text }))} value={mode} onChange={(v) => setMode(v as InterviewMode)} />
      <fieldset className="flex flex-wrap items-center gap-2">
        <legend className="mb-2 w-full text-sm font-semibold text-muted">{iv.durationTitle}</legend>
        {DURATIONS.map((d) => (
          <label key={d} className={clsx('cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-1', d === duration ? 'bg-brand text-white' : 'bg-surface-2 text-ink')}>
            <input type="radio" name="duration" value={d} checked={d === duration} onChange={() => setDuration(d)} className="sr-only" />
            {iv.minutes(d)}
          </label>
        ))}
      </fieldset>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">{format === 'theory' ? iv.pickTrack : format === 'coding' ? iv.pickTask : iv.pickProblem}</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {format === 'theory' &&
            modules.map((m) => {
              const track = getTrack(m.track)
              return track ? card(track.id, l(track.title), l(track.blurb), track.emoji, t.track.lessonsCount(m.lessons.length), { background: gradient(track) }) : null
            })}
          {format === 'coding' && codingTasks.map((task) => card(task.id, l(task.title), l(task.summary), getTrack(task.track)?.emoji ?? '⌨️', t.practice.difficulty[task.difficulty]))}
          {format === 'design' && designProblems.map((p) => card(p.id, l(p.title), l(p.prompt), p.emoji, iv.kinds[p.kind]))}
        </ul>
      </section>

      <p className="rounded-2xl border border-line bg-surface p-4 text-sm text-muted">{iv.tip}</p>
    </div>
  )
}

function Choice({ legend, options, value, onChange }: { legend: string; options: { id: string; title: string; text: string }[]; value: string; onChange: (v: string) => void }) {
  const name = useId()
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-muted">{legend}</legend>
      <div className="grid gap-2 sm:grid-cols-3">
        {options.map((o) => (
          <label
            key={o.id}
            className={clsx(
              'cursor-pointer rounded-2xl border-2 p-3 text-sm transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-1',
              o.id === value ? 'border-brand-1 bg-surface' : 'border-line bg-surface hover:border-muted',
            )}
          >
            <input type="radio" name={name} value={o.id} checked={o.id === value} onChange={() => onChange(o.id)} className="sr-only" />
            <span className="block font-semibold">{o.title}</span>
            <span className="mt-1 block text-muted">{o.text}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

// ───────────────────────── The round ─────────────────────────

function Live({ session, setSession }: { session: Session; setSession: (s: Session | null) => void }) {
  const iv = useInterviewT()
  const loc = session.locale
  const [now, setNow] = useState(() => Date.now())
  const [msg, setMsg] = useState('')
  const [pending, setPending] = useState<string | null>(null)
  const [grading, setGrading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [voice, setVoice] = useState(false)
  const [listening, setListening] = useState(false)
  const [statement, setStatement] = useState('')
  const rec = useRef<Recognition | null>(null)
  const typed = useRef('')
  const end = useRef<HTMLDivElement>(null)
  // Event handlers read the newest session even if a re-render has not happened yet.
  const latest = useRef(session)
  useLayoutEffect(() => {
    latest.current = session
  })
  const inputId = useId()

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' })
  }, [session.history.length, pending])
  useEffect(
    () => () => {
      rec.current?.stop()
      stopSpeaking()
    },
    [],
  )
  useEffect(() => {
    if (session.format !== 'coding') return
    let alive = true
    loadTaskBody(session.subjectId, loc).then((b) => alive && setStatement(b.statement))
    return () => {
      alive = false
    }
  }, [session.format, session.subjectId, loc])

  const elapsedMin = (now - session.startedAt) / 60000
  const { index: phaseIdx } = phaseAt(session.format, elapsedMin, session.durationMin)
  const left = Math.max(0, session.durationMin * 60 - (now - session.startedAt) / 1000)
  const timeUp = left <= 0
  const title = subjectTitle(session.format, session.subjectId, loc) ?? ''
  const busy = pending !== null || grading

  /** Sends the dialog so far and streams the interviewer's answer into a pending bubble. */
  const ask = async (history: InterviewTurn[], hint = false) => {
    const base = { ...latest.current, history }
    setSession(base)
    setPending('')
    setError(null)
    try {
      const body = buildRequest(base, (Date.now() - base.startedAt) / 60000, history, statement)
      const text = await streamApi('/api/interview/turn/stream', { ...body, hint }, (so) => setPending(so))
      setSession({ ...latest.current, history: [...history, { role: 'interviewer', text: text.trim() }] })
      if (voice) speak(text, loc)
    } catch (e) {
      setError(`${iv.noAnswer}: ${(e as Error).message}`)
    } finally {
      setPending(null)
    }
  }

  const send = () => {
    const text = msg.trim()
    if (!text || busy) return
    rec.current?.stop()
    setMsg('')
    typed.current = ''
    void ask([...latest.current.history, { role: 'candidate', text }])
  }

  const askHint = () => {
    if (busy || session.hintsLeft <= 0) return
    const s = { ...latest.current, hintsLeft: latest.current.hintsLeft - 1 }
    latest.current = s
    void ask([...s.history, { role: 'candidate', text: iv.hintTurn, hint: true }], true)
  }

  const finish = async () => {
    setGrading(true)
    setError(null)
    stopSpeaking()
    rec.current?.stop()
    try {
      const s = latest.current
      const body = buildRequest(s, (Date.now() - s.startedAt) / 60000, s.history, statement)
      const grade = await postApi<InterviewGrade>('/api/interview/grade', body)
      useProgress.getState().record(interviewKey(s.format, s.subjectId), grade.score)
      setSession({ ...latest.current, finishedAt: Date.now(), grade })
    } catch (e) {
      setError(`${iv.gradeError}: ${(e as Error).message}`)
      setGrading(false)
    }
  }

  const toggleMic = async () => {
    if (listening) {
      rec.current?.stop()
      return
    }
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((x) => x.stop())
    } catch {
      setError(iv.speech['not-allowed'])
      return
    }
    const r = createRecognition(loc)
    if (!r) return
    typed.current = msg ? `${msg.trim()} ` : ''
    r.onresult = (e) => {
      let final = ''
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i]
        if (res.isFinal) final += res[0].transcript
        else interim += res[0].transcript
      }
      if (final) typed.current += final
      setMsg(typed.current + interim)
    }
    r.onend = () => setListening(false)
    r.onerror = (e) => {
      setListening(false)
      if (e.error === 'aborted') return
      const known = iv.speech[e.error as keyof typeof iv.speech]
      setError(typeof known === 'string' ? known : iv.speech.other(e.error))
    }
    rec.current = r
    try {
      r.start()
      setListening(true)
    } catch (e) {
      setError(iv.speech.other((e as Error).message))
    }
  }

  const mm = Math.floor(left / 60)
  const ss = String(Math.floor(left % 60)).padStart(2, '0')

  return (
    <div className="mx-auto flex max-w-[100rem] flex-col gap-3 px-4 py-4 lg:h-[calc(100vh-4rem)]">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <h1 className="text-xl font-extrabold">{title}</h1>
        <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-semibold text-muted">{iv.mode(iv.modes[session.mode].title)}</span>
        <ol aria-label={iv.phases} className="flex flex-wrap gap-1">
          {phases[session.format].map((p, i) => (
            <li
              key={p.name.en}
              aria-current={i === phaseIdx && !timeUp ? 'step' : undefined}
              className={clsx('rounded-full px-2.5 py-0.5 text-xs font-semibold', i === phaseIdx && !timeUp ? 'bg-brand text-white' : i < phaseIdx || timeUp ? 'text-muted line-through' : 'text-muted')}
            >
              {p.name[loc]}
            </li>
          ))}
        </ol>
        <span role="timer" aria-live="off" className={clsx('ml-auto flex items-center gap-1.5 font-mono text-sm font-semibold', timeUp ? 'text-rose-600 dark:text-rose-400' : left < 300 ? 'text-amber-600 dark:text-amber-400' : '')}>
          <Clock size={15} aria-hidden /> {timeUp ? iv.timeUp : iv.timeLeft(mm, ss)}
        </span>
        <button type="button" onClick={() => window.confirm(iv.exitConfirm) && setSession(null)} className="rounded-full px-3 py-1.5 text-sm font-semibold text-muted hover:bg-surface-2 hover:text-ink">
          {iv.exit}
        </button>
        <button
          type="button"
          onClick={finish}
          disabled={busy || session.history.length < 3}
          className="flex items-center gap-1.5 rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-white shadow disabled:opacity-50"
        >
          {grading && <LoaderCircle size={15} className="animate-spin" aria-hidden />}
          {grading ? iv.grading : iv.finish}
        </button>
      </header>

      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="min-h-0 min-w-0">
          {session.format === 'design' && session.board && (
            <Suspense fallback={<div className="p-10 text-center text-muted">…</div>}>
              <DesignBoard board={session.board} onChange={(board) => setSession({ ...latest.current, board })} />
            </Suspense>
          )}
          {session.format === 'coding' && <CodingPanel session={session} statement={statement} setSession={setSession} latest={latest} />}
          {session.format === 'theory' && <TheoryPanel trackId={session.subjectId} />}
        </div>

        <section aria-label={iv.transcriptLabel} className="flex min-h-[28rem] flex-col rounded-2xl border border-line bg-surface">
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3" aria-live="polite" aria-relevant="additions">
            {session.history.map((h, i) => (
              <Bubble key={i} turn={h} labels={iv} />
            ))}
            {pending !== null &&
              (pending ? (
                <Bubble turn={{ role: 'interviewer', text: pending }} labels={iv} />
              ) : (
                <p className="flex items-center gap-2 text-sm text-muted">
                  <LoaderCircle size={14} className="animate-spin" aria-hidden /> {iv.thinking}
                </p>
              ))}
            {timeUp && !grading && <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm">{iv.timeUpNote}</p>}
            <div ref={end} />
          </div>
          {error && (
            <p role="alert" className="px-3 pb-2 text-sm text-rose-600 dark:text-rose-400">
              {error}
            </p>
          )}
          <div className="border-t border-line p-3">
            <label htmlFor={inputId} className="sr-only">
              {iv.answerLabel}
            </label>
            <textarea
              id={inputId}
              value={msg}
              onChange={(e) => {
                setMsg(e.target.value)
                typed.current = e.target.value
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault()
                  send()
                }
              }}
              rows={3}
              placeholder={iv.placeholder}
              className="w-full resize-none rounded-xl border border-line bg-canvas p-3 text-sm outline-none focus:border-brand-1"
            />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button type="button" onClick={send} disabled={busy || !msg.trim()} className="flex items-center gap-1.5 rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50">
                <Send size={15} aria-hidden /> {iv.send}
              </button>
              {RecognitionCtor && (
                <button
                  type="button"
                  onClick={toggleMic}
                  aria-pressed={listening}
                  className={clsx('flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold', listening ? 'bg-rose-600 text-white' : 'bg-surface-2')}
                >
                  {listening ? <MicOff size={15} aria-hidden /> : <Mic size={15} aria-hidden />}
                  {listening ? iv.micStop : iv.mic}
                </button>
              )}
              {session.hintsLeft > 0 && (
                <button type="button" onClick={askHint} disabled={busy} title={iv.hintTitle} className="flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1.5 text-sm font-semibold disabled:opacity-50">
                  <Lightbulb size={15} aria-hidden /> {iv.hint(session.hintsLeft)}
                </button>
              )}
            </div>
            <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs text-muted">
              <input
                type="checkbox"
                checked={voice}
                onChange={(e) => {
                  setVoice(e.target.checked)
                  if (!e.target.checked) stopSpeaking()
                }}
                className="accent-[var(--brand-1)]"
              />
              {voice ? <Volume2 size={14} aria-hidden /> : <VolumeX size={14} aria-hidden />} {iv.speak}
            </label>
          </div>
        </section>
      </div>
    </div>
  )
}

function Bubble({ turn, labels }: { turn: InterviewTurn; labels: InterviewDict }) {
  const me = turn.role === 'candidate'
  return (
    <div className={clsx('max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm', me ? 'ml-auto bg-brand/15' : 'bg-surface-2')}>
      <div className="mb-0.5 text-[11px] font-semibold text-muted">{me ? labels.you : labels.interviewer}</div>
      <div className={clsx('whitespace-pre-wrap', turn.hint && 'italic text-muted')}>{turn.text}</div>
    </div>
  )
}

function TheoryPanel({ trackId }: { trackId: string }) {
  const l = useL()
  const t = useT()
  const track = getTrack(trackId)
  const m = modules.find((x) => x.track === trackId)
  if (!track || !m) return null
  return (
    <section className="h-full overflow-y-auto rounded-2xl border border-line bg-surface p-5">
      <div className="flex items-center gap-3">
        <span aria-hidden className="flex size-12 items-center justify-center rounded-2xl text-2xl" style={{ background: gradient(track) }}>
          {track.emoji}
        </span>
        <div>
          <h2 className="text-lg font-bold">{l(track.title)}</h2>
          <p className="text-sm text-muted">{l(track.blurb)}</p>
        </div>
      </div>
      <h3 className="mt-5 text-sm font-semibold text-muted">{t.track.lessons}</h3>
      <ol className="mt-2 space-y-1.5 text-sm">
        {m.lessons.map((id, i) => (
          <li key={id}>
            {i + 1}. <LessonName id={id} />
          </li>
        ))}
      </ol>
    </section>
  )
}

const lessonsById = new Map(lessons.map((x) => [x.id, x]))

function LessonName({ id }: { id: string }) {
  const l = useL()
  const found = lessonsById.get(id)
  return <>{found ? l(found.title) : id}</>
}

function CodingPanel({
  session,
  statement,
  setSession,
  latest,
}: {
  session: Session
  statement: string
  setSession: (s: Session) => void
  latest: React.RefObject<Session>
}) {
  const t = useT()
  const iv = useInterviewT()
  const task = getCodingTask(session.subjectId)
  const [running, setRunning] = useState(false)
  if (!task || !session.coding) return null
  const run = session.coding.run

  const runTests = async () => {
    setRunning(true)
    const code = latest.current.coding?.code ?? task.starter
    const tests = task.tests.map((x) => ({ code: x.code, fakeTimers: x.fakeTimers }))
    const r = task.runtime ? await runInFrame(code, tests, task.runtime) : await runInWorker(code, tests)
    setRunning(false)
    const error = r.error ?? (r.timedOut ? t.code.timeout : undefined)
    const failures = r.tests.flatMap((x, i) => (x.ok ? [] : [`${task.tests[i].name[session.locale]}${x.error ? `: ${x.error.split('\n')[0]}` : ''}`]))
    const s = latest.current
    setSession({ ...s, coding: { code, run: { error, passed: r.tests.filter((x) => x.ok).length, total: task.tests.length, failures } } })
  }

  return (
    <div className="grid h-full min-h-0 grid-cols-[minmax(0,1fr)] gap-3 lg:grid-rows-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <section className="min-h-0 overflow-y-auto rounded-2xl border border-line bg-surface p-4">
        <h2 className="text-sm font-semibold text-muted">{iv.code.statement}</h2>
        <div className="mt-2">{statement ? (
            <Markdown key={statement} size="base" collapsible>
              {statement}
            </Markdown>
          ) : (
            '…'
          )}</div>
      </section>
      <section className="flex min-h-0 flex-col rounded-2xl border border-line bg-surface p-3">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-semibold text-muted">{iv.code.editor}</h2>
          <button type="button" onClick={runTests} disabled={running} className="ml-auto flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50">
            <Play size={14} aria-hidden /> {running ? iv.code.running : iv.code.run}
          </button>
        </div>
        <div className="min-h-[16rem] flex-1 overflow-auto lg:min-h-0">
          <CodeEditor
            initial={session.coding.code}
            onChange={(code) => setSession({ ...latest.current, coding: { ...latest.current.coding, code } })}
            onRun={runTests}
            label={t.code.editorLabel}
            jsx={task.runtime === 'react'}
          />
        </div>
        {run && (
          <p role="status" className={clsx('mt-2 text-sm font-semibold', !run.error && run.passed === run.total ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>
            {run.error ? `${iv.code.loadError}: ${run.error.split('\n')[0]}` : iv.code.result(run.passed, run.total)}
          </p>
        )}
      </section>
    </div>
  )
}

// ───────────────────────── Review ─────────────────────────

const hireStyle: Record<string, string> = {
  'strong hire': 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300',
  hire: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300',
  'lean hire': 'bg-sky-500/15 text-sky-800 dark:text-sky-300',
  'lean no hire': 'bg-amber-500/15 text-amber-800 dark:text-amber-300',
  'no hire': 'bg-rose-500/15 text-rose-800 dark:text-rose-300',
  'strong no hire': 'bg-rose-500/20 text-rose-800 dark:text-rose-300',
}

function Result({ session, onReset }: { session: Session; onReset: () => void }) {
  const iv = useInterviewT()
  const g = session.grade!
  const loc = session.locale
  const minutes = Math.max(1, Math.round(((session.finishedAt ?? session.startedAt) - session.startedAt) / 60000))
  const turns = session.history.filter((h) => h.role === 'candidate').length
  const color = g.score >= 70 ? 'text-emerald-700 dark:text-emerald-400' : g.score >= 45 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
  const lesson = session.format === 'design' ? getDesignProblem(session.subjectId)?.lesson : undefined
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => heading.current?.focus(), [])

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <header className="flex flex-wrap items-end gap-4">
        <div>
          <p className="text-sm font-semibold text-muted">{iv.result.meta(minutes, turns)}</p>
          <h1 ref={heading} tabIndex={-1} className="mt-1 text-3xl font-extrabold outline-none">
            {subjectTitle(session.format, session.subjectId, loc)}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className={clsx('text-5xl font-extrabold', color)} aria-label={iv.result.score(g.score)}>
              {g.score}
            </span>
            <span className={clsx('rounded-full px-3 py-1 text-sm font-semibold capitalize', hireStyle[g.hire] ?? 'bg-surface-2')}>{g.hire}</span>
            <span className="rounded-full bg-surface-2 px-3 py-1 text-sm font-semibold">{iv.result.level(g.level)}</span>
          </div>
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          {lesson && (
            <Link to={`/learn/${lesson}`} className="rounded-full bg-surface-2 px-4 py-2 text-sm font-semibold">
              {iv.result.prepare}
            </Link>
          )}
          <button type="button" onClick={onReset} className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white">
            {iv.result.again}
          </button>
        </div>
      </header>
      <p className="text-lg leading-relaxed">{g.summary}</p>

      <ul className="grid gap-3 sm:grid-cols-2">
        {g.axes.map((a) => (
          <li key={a.axis} className="rounded-2xl border border-line bg-surface p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold">{a.axis}</span>
              <span className="flex gap-1" role="img" aria-label={iv.result.axisScore(a.score)}>
                {[1, 2, 3, 4].map((i) => (
                  <span key={i} className={clsx('h-2 w-5 rounded-full', i <= a.score ? (a.score >= 3 ? 'bg-emerald-500' : 'bg-amber-500') : 'bg-surface-2')} />
                ))}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted">{a.comment}</p>
          </li>
        ))}
      </ul>

      <div className="grid gap-3 md:grid-cols-3">
        <ListCard title={iv.result.strengths} items={g.strengths} />
        <ListCard title={iv.result.improvements} items={g.improvements} />
        <ListCard title={iv.result.missed} items={g.missed} />
      </div>

      <details className="rounded-2xl border border-line bg-surface p-4">
        <summary className="cursor-pointer font-semibold">{iv.result.transcript}</summary>
        <div className="mt-3 space-y-2 text-sm">
          {session.history.map((h, i) => (
            <p key={i}>
              <span className="font-semibold text-muted">{h.role === 'candidate' ? iv.you : iv.interviewer}: </span>
              {h.text}
            </p>
          ))}
        </div>
      </details>
    </div>
  )
}

function ListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-4">
      <h2 className="font-semibold">{title}</h2>
      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm">
        {items.length ? items.map((x) => <li key={x}>{x}</li>) : <li className="list-none text-muted">—</li>}
      </ul>
    </section>
  )
}
