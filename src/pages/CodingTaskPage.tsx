import clsx from 'clsx'
import { ArrowLeft, Bot, CheckCircle2, Circle, Clock, Eye, EyeOff, Lock, Play, RotateCcw, Square, XCircle } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { CodeEditor } from '../components/CodeEditor'
import { DifficultyBadge } from '../components/Difficulty'
import { Markdown } from '../components/Markdown'
import { ReadMore } from '../components/ReadMore'
import { codeKey, getCodingTask, type CodingTask } from '../content/coding'
import { loadTaskBody } from '../content/coding/body'
import { codeSolved } from '../content/progress'
import { getTrack } from '../content/tracks'
import { gradient } from '../design/gradient'
import { useL, useLocale, useT } from '../i18n'
import { AI_ENABLED, streamApi } from '../lib/api'
import type { RunResult } from '../runner/harness'
import { runInWorker } from '../runner/run'
import { mountPreview, runInFrame } from '../runner/run-frame'
import { useProgress } from '../store'

/** The learner's code survives a reload; per-browser convenience, so localStorage is enough. */
const draftKey = (id: string) => `frontend-gym:draft:${id}`
const readDraft = (id: string) => {
  try {
    return localStorage.getItem(draftKey(id))
  } catch {
    return null
  }
}
const writeDraft = (id: string, code: string | null) => {
  try {
    if (code === null) localStorage.removeItem(draftKey(id))
    else localStorage.setItem(draftKey(id), code)
  } catch {
    // storage blocked: the draft lives only in memory
  }
}

export default function CodingTaskPage() {
  const { id = '' } = useParams()
  const t = useT()
  const task = getCodingTask(id)
  if (!task)
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p>{t.code.notFound}</p>
      </div>
    )
  // A new task gets fresh state (editor, results, tabs).
  return <TaskView key={task.id} task={task} />
}

type Run = RunResult & { timedOut?: boolean }

function TaskView({ task }: { task: CodingTask }) {
  const t = useT()
  const l = useL()
  const locale = useLocale()
  const track = getTrack(task.track)
  const record = useProgress((s) => s.record)
  const solved = useProgress((s) => codeSolved(s.results, task.id))
  const [body, setBody] = useState<{ locale: string; statement: string; walkthrough: string } | null>(null)
  const [code, setCode] = useState(() => readDraft(task.id) ?? task.starter)
  const [editorKey, setEditorKey] = useState(0)
  const [running, setRunning] = useState(false)
  const [run, setRun] = useState<Run | null>(null)
  const [tab, setTab] = useState<'statement' | 'walkthrough'>('statement')
  const [revealed, setRevealed] = useState(false)
  const hintId = useId()
  const tabsId = useId()

  useEffect(() => {
    let alive = true
    loadTaskBody(task.id, locale).then((b) => alive && setBody({ locale, ...b }))
    return () => {
      alive = false
    }
  }, [task.id, locale])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  const onChange = (next: string) => {
    setCode(next)
    writeDraft(task.id, next === task.starter ? null : next)
  }

  const runTests = async () => {
    if (running) return
    setRunning(true)
    const tests = task.tests.map((x) => ({ code: x.code, fakeTimers: x.fakeTimers }))
    const result = task.runtime ? await runInFrame(code, tests, task.runtime) : await runInWorker(code, tests)
    setRunning(false)
    setRun(result)
    if (!result.error && !result.timedOut && result.tests.length) {
      const passed = result.tests.filter((x) => x.ok).length
      record(codeKey(task.id), Math.round((passed / task.tests.length) * 100))
    }
  }

  const reset = () => {
    if (code !== task.starter && !window.confirm(t.code.resetConfirm)) return
    writeDraft(task.id, null)
    setCode(task.starter)
    setEditorKey((k) => k + 1)
    setRun(null)
  }

  const visible = task.tests.filter((x) => !x.hidden)
  const hiddenCount = task.tests.length - visible.length
  const passed = run?.tests.filter((x) => x.ok).length ?? 0
  const allPassed = !!run && !run.error && !run.timedOut && passed === task.tests.length
  const open = solved || revealed

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Link to="/practice/coding" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft size={16} aria-hidden /> {t.code.back}
      </Link>

      <header className="mt-4 flex flex-wrap items-center gap-4">
        <span aria-hidden className="flex size-14 shrink-0 items-center justify-center rounded-2xl text-3xl shadow-md" style={track ? { background: gradient(track) } : undefined}>
          {track?.emoji}
        </span>
        <div className="min-w-0">
          <h1 className="font-mono text-3xl font-extrabold leading-tight">{l(task.title)}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm font-semibold text-muted">
            <DifficultyBadge level={task.difficulty} />
            <span className="inline-flex items-center gap-1">
              <Clock size={13} aria-hidden /> {t.lesson.minutes(task.minutes)}
            </span>
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
        {/* Left: statement / walkthrough, tests, sources */}
        <section className="min-w-0">
          <div role="tablist" aria-label={l(task.title)} className="inline-flex rounded-full border border-line bg-surface p-1">
            {(['statement', 'walkthrough'] as const).map((name) => (
              <button
                key={name}
                type="button"
                role="tab"
                id={`${tabsId}-${name}`}
                aria-selected={tab === name}
                aria-controls={`${tabsId}-${name}-panel`}
                onClick={() => setTab(name)}
                className={clsx('inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition', tab === name ? 'bg-brand text-white shadow' : 'text-muted hover:text-ink')}
              >
                {name === 'walkthrough' && !open && <Lock size={13} aria-hidden />}
                {name === 'statement' ? t.code.statement : t.code.walkthrough}
              </button>
            ))}
          </div>

          <div role="tabpanel" id={`${tabsId}-${tab}-panel`} aria-labelledby={`${tabsId}-${tab}`} className="mt-5">
            {!body || body.locale !== locale ? (
              <p className="text-muted">…</p>
            ) : tab === 'statement' ? (
              <>
                <Markdown size="base">{body.statement}</Markdown>
                <h2 className="mt-8 text-xl font-bold">{t.code.tests}</h2>
                <ul className="mt-3 space-y-2">
                  {visible.map((test) => {
                    const i = task.tests.indexOf(test)
                    return (
                      <li key={i} className="rounded-2xl border border-line bg-surface px-4 py-3">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <TestIcon state={run && !run.error ? (run.tests[i]?.ok ?? null) : null} />
                          {l(test.name)}
                        </div>
                        <details className="mt-1 text-sm">
                          <summary className="cursor-pointer text-muted hover:text-ink">{t.code.showCode}</summary>
                          <pre className="code-block mt-2 overflow-x-auto rounded-xl border border-line p-3 font-mono text-[12.5px] leading-relaxed">{test.code}</pre>
                        </details>
                      </li>
                    )
                  })}
                </ul>
                {hiddenCount > 0 && (
                  <p className="mt-3 flex items-center gap-2 text-sm text-muted">
                    <EyeOff size={15} aria-hidden /> {t.code.hiddenNote(hiddenCount)}
                  </p>
                )}
              </>
            ) : open ? (
              <Markdown size="base">{`## ${t.code.reference}\n\n\`\`\`${task.runtime === 'react' ? 'tsx' : 'ts'}\n${task.solution}\`\`\`\n\n${body.walkthrough}`}</Markdown>
            ) : (
              <div className="rounded-3xl border border-dashed border-line bg-surface p-6 text-center">
                <Lock size={28} aria-hidden className="mx-auto text-brand-1" />
                <p className="mx-auto mt-3 max-w-md leading-relaxed text-muted">{t.code.locked}</p>
                <button type="button" onClick={() => setRevealed(true)} className="mt-4 rounded-full border border-line px-4 py-2 text-sm font-semibold transition hover:bg-surface-2">
                  {t.code.reveal}
                </button>
              </div>
            )}
          </div>

          <ReadMore sources={task.sources} verified={task.verified} />
        </section>

        {/* Right: editor and results, kept in view on wide screens */}
        <section aria-label={t.code.editor} className="min-w-0 space-y-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pb-2">
          <div className="overflow-hidden rounded-3xl border border-line shadow-sm">
            <div className="flex items-center gap-2 border-b border-line bg-surface px-3 py-2">
              <span className="px-1 text-sm font-semibold">{t.code.editor}</span>
              <span className="text-xs text-muted">{task.runtime === 'react' ? 'TSX · React 19' : task.runtime === 'dom' ? 'TypeScript · DOM' : 'TypeScript'}</span>
              <button type="button" onClick={reset} className="ml-auto inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold text-muted transition hover:bg-surface-2 hover:text-ink">
                <RotateCcw size={14} aria-hidden /> {t.code.reset}
              </button>
              <button
                type="button"
                onClick={runTests}
                disabled={running}
                className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-white shadow transition hover:scale-105 disabled:opacity-70 disabled:hover:scale-100"
              >
                <Play size={14} aria-hidden /> {running ? t.code.running : t.code.run}
              </button>
            </div>
            <div className="h-[26rem]">
              <CodeEditor key={editorKey} initial={code} onChange={onChange} onRun={runTests} label={t.code.editorLabel} describedBy={hintId} jsx={task.runtime === 'react'} />
            </div>
          </div>
          <p id={hintId} className="px-2 text-xs text-muted">
            {t.code.editorHint}
          </p>

          <Results task={task} run={run} running={running} allPassed={allPassed} passed={passed} />

          {task.runtime === 'react' && task.preview && <Preview code={code} component={task.preview} />}

          {AI_ENABLED && run && !run.error && !run.timedOut && <Review task={task} code={code} run={run} statement={body?.statement ?? ''} />}
        </section>
      </div>
    </div>
  )
}

/** Live preview of the learner's component in its own sandbox; rebuilt on demand, not on every keystroke. */
function Preview({ code, component }: { code: string; component: string }) {
  const t = useT()
  const host = useRef<HTMLDivElement>(null)
  const latest = useRef(code)
  const [version, setVersion] = useState(0)
  useEffect(() => {
    latest.current = code
  })
  useEffect(() => {
    if (!version || !host.current) return
    return mountPreview(host.current, latest.current, component)
  }, [version, component])

  return (
    <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <span aria-hidden className="flex size-9 items-center justify-center rounded-xl bg-brand text-white">
          <Eye size={18} />
        </span>
        <p className="min-w-0 flex-1 text-sm text-muted">{t.code.previewHint(component)}</p>
        <button type="button" onClick={() => setVersion((v) => v + 1)} className="rounded-full border border-line px-4 py-1.5 text-sm font-semibold transition hover:bg-surface-2">
          {version ? t.code.previewRefresh : t.code.preview}
        </button>
      </div>
      <div ref={host} className={clsx(version > 0 && 'mt-3')} />
    </div>
  )
}

function TestIcon({ state }: { state: boolean | null }) {
  if (state === true) return <CheckCircle2 size={17} aria-hidden className="shrink-0 text-emerald-600 dark:text-emerald-400" />
  if (state === false) return <XCircle size={17} aria-hidden className="shrink-0 text-rose-600 dark:text-rose-400" />
  return <Circle size={17} aria-hidden className="shrink-0 text-muted" />
}

function Results({ task, run, running, allPassed, passed }: { task: CodingTask; run: Run | null; running: boolean; allPassed: boolean; passed: number }) {
  const t = useT()
  const l = useL()
  if (!run) return null
  return (
    <div role="status" aria-busy={running} className="rounded-3xl border border-line bg-surface p-4 shadow-sm">
      {run.timedOut ? (
        <p className="font-semibold text-rose-700 dark:text-rose-400">{t.code.timeout}</p>
      ) : run.error ? (
        <>
          <p className="font-semibold text-rose-700 dark:text-rose-400">{t.code.loadError}</p>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-xl bg-rose-500/10 p-3 font-mono text-[12.5px]">{run.error}</pre>
        </>
      ) : (
        <>
          <p className={clsx('font-display text-lg font-bold', allPassed ? 'text-emerald-700 dark:text-emerald-400' : 'text-ink')}>
            {allPassed ? t.code.allPassed : t.code.passed(passed, task.tests.length)}
          </p>
          <ul className="mt-3 space-y-2">
            {task.tests.map((test, i) => {
              const r = run.tests[i]
              return (
                <li key={i} className="text-sm">
                  <div className="flex items-center gap-2">
                    <TestIcon state={r ? r.ok : null} />
                    <span className={clsx(r && !r.ok && 'font-semibold')}>{l(test.name)}</span>
                    {test.hidden && <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-muted">{t.code.hidden}</span>}
                  </div>
                  {r && !r.ok && r.error && <pre className="ml-6 mt-1.5 overflow-x-auto whitespace-pre-wrap rounded-xl bg-rose-500/10 p-3 font-mono text-[12.5px] leading-relaxed">{r.error}</pre>}
                </li>
              )
            })}
          </ul>
        </>
      )}
      {run.logs.length > 0 && (
        <details className="mt-3" open={!!run.error}>
          <summary className="cursor-pointer text-sm font-semibold text-muted hover:text-ink">
            {t.code.console} ({run.logs.length})
          </summary>
          <pre className="mt-2 max-h-48 overflow-auto rounded-xl bg-surface-2 p-3 font-mono text-[12.5px] leading-relaxed">{run.logs.join('\n')}</pre>
        </details>
      )}
    </div>
  )
}

function Review({ task, code, run, statement }: { task: CodingTask; code: string; run: Run; statement: string }) {
  const t = useT()
  const l = useL()
  const locale = useLocale()
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abort = useRef<AbortController | null>(null)
  useEffect(() => () => abort.current?.abort(), [])

  const start = async () => {
    abort.current = new AbortController()
    setBusy(true)
    setError(null)
    setText('')
    try {
      await streamApi(
        '/api/review/stream',
        {
          locale,
          title: l(task.title),
          statement,
          code,
          results: task.tests.map((x, i) => ({ name: l(x.name), ok: !!run.tests[i]?.ok, error: run.tests[i]?.error })),
        },
        setText,
        abort.current.signal,
      )
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <span aria-hidden className="flex size-9 items-center justify-center rounded-xl bg-brand text-white">
          <Bot size={18} />
        </span>
        <p className="min-w-0 flex-1 text-sm text-muted">{t.code.reviewHint}</p>
        {busy ? (
          <button type="button" onClick={() => abort.current?.abort()} className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-1.5 text-sm font-semibold hover:bg-surface-2">
            <Square size={13} aria-hidden /> {t.code.stop}
          </button>
        ) : (
          <button type="button" onClick={start} className="rounded-full border border-line px-4 py-1.5 text-sm font-semibold transition hover:bg-surface-2">
            {t.code.review}
          </button>
        )}
      </div>
      {busy && !text && <p className="mt-3 text-sm text-muted">{t.code.reviewing}</p>}
      {error && <p className="mt-3 text-sm text-rose-700 dark:text-rose-400">{error}</p>}
      {text && (
        <div className="mt-3" aria-live="polite">
          <Markdown size="base">{text}</Markdown>
        </div>
      )}
    </div>
  )
}
