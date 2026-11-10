import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { locales } from '../src/i18n/types'
import { codingTasks, SOLUTION_MARK } from '../src/content/coding'
import { lessons, modules } from '../src/content/lessons'
import { predictTasks } from '../src/content/predict'
import { foldTrace } from '../src/content/predict/trace'
import type { QuizQuestion } from '../src/content/lessons/types'
import { isOfficial, type Source, type Verified } from '../src/content/sources'
import { tracks } from '../src/content/tracks'
import { extractSnippets, runSnippet } from './snippets'
import { typeCheck } from './typecheck'

export const ROOT = join(import.meta.dirname, '..')
export const bodyPath = (track: string, id: string, locale: string) => join(ROOT, 'content', 'lessons', track, `${id}.${locale}.md`)
export const readBody = (track: string, id: string, locale: string) => readFileSync(bodyPath(track, id, locale), 'utf8')

const headings = (md: string) => md.split('\n').filter((l) => l.startsWith('## ')).length
const fences = (md: string) => (md.match(/^```/gm) ?? []).length / 2

/** Problems in one quiz pair (ru/en), as human-readable strings. */
export function quizProblems(where: string, quiz: Record<string, QuizQuestion[]>): string[] {
  const out: string[] = []
  const [a, b] = locales.map((l) => quiz[l])
  if (a.length !== b.length) out.push(`${where}: ${a.length} questions in ru, ${b.length} in en`)
  a.forEach((q, i) => {
    const other = b[i]
    if (!other) return
    if (q.options.length !== other.options.length) out.push(`${where} #${i + 1}: option count differs between languages`)
    if (q.correct !== other.correct) out.push(`${where} #${i + 1}: correct index differs between languages`)
  })
  for (const l of locales)
    quiz[l].forEach((q, i) => {
      if (q.correct < 0 || q.correct >= q.options.length) out.push(`${where}.${l} #${i + 1}: correct index out of range`)
      if (q.options.length < 3) out.push(`${where}.${l} #${i + 1}: fewer than 3 options`)
      if (new Set(q.options).size !== q.options.length) out.push(`${where}.${l} #${i + 1}: duplicate options`)
      const len = q.options.map((o) => o.length)
      const others = len.filter((_, k) => k !== q.correct)
      const avg = others.reduce((s, x) => s + x, 0) / others.length
      if (len[q.correct] > 1.3 * avg && len[q.correct] - avg > 8) out.push(`${where}.${l} #${i + 1}: the correct option is much longer than the others (gives the answer away)`)
      if (!q.why.trim()) out.push(`${where}.${l} #${i + 1}: empty explanation`)
    })
  return out
}

/** Static checks: files, language parity, sources, links, quizzes. Fast, no code execution. */
export function staticProblems(): string[] {
  const out: string[] = []
  const lessonIds = new Set(lessons.map((l) => l.id))
  const trackIds = new Set(tracks.map((t) => t.id))
  if (lessonIds.size !== lessons.length) out.push('duplicate lesson ids')

  for (const lesson of lessons) {
    const w = `lesson ${lesson.id}`
    if (!trackIds.has(lesson.track)) out.push(`${w}: unknown track ${lesson.track}`)
    if (!/^\d{4}-\d{2}$/.test(lesson.verified.date)) out.push(`${w}: verified.date must be YYYY-MM`)
    if (!lesson.sources.some((s) => s.kind !== 'article')) out.push(`${w}: needs at least one official or spec source`)
    for (const s of lesson.sources) if (s.kind !== 'article' && !isOfficial(s.url)) out.push(`${w}: ${s.url} is not on the official domain list`)
    out.push(...quizProblems(w, lesson.quiz))

    const bodies: Record<string, string> = {}
    for (const l of locales) {
      if (!existsSync(bodyPath(lesson.track, lesson.id, l))) {
        out.push(`${w}: missing ${lesson.id}.${l}.md`)
        continue
      }
      bodies[l] = readBody(lesson.track, lesson.id, l)
      for (const m of bodies[l].matchAll(/\]\(\/(learn|track|code|predict)\/([a-z0-9-]+)\)/g)) {
        const ids = { learn: lessonIds, track: trackIds, code: new Set(codingTasks.map((t) => t.id)), predict: new Set(predictTasks.map((t) => t.id)) }
        const ok = ids[m[1] as keyof typeof ids].has(m[2])
        if (!ok) out.push(`${w}.${l}: broken link /${m[1]}/${m[2]}`)
      }
      if (/^#\s/m.test(bodies[l])) out.push(`${w}.${l}: use ## headings, the page renders the title itself`)
    }
    if (bodies.ru && bodies.en) {
      if (headings(bodies.ru) !== headings(bodies.en)) out.push(`${w}: section count differs (ru ${headings(bodies.ru)}, en ${headings(bodies.en)})`)
      if (fences(bodies.ru) !== fences(bodies.en)) out.push(`${w}: code block count differs between languages`)
      const [ru, en] = [extractSnippets(bodies.ru), extractSnippets(bodies.en)]
      if (ru.length !== en.length) out.push(`${w}: runnable example count differs between languages`)
      ru.forEach((s, i) => {
        if (!en[i]) return
        if (s.code !== en[i].code || s.lang !== en[i].lang || s.mode !== en[i].mode) out.push(`${w}: runnable example #${i + 1} has different code in ru and en`)
        if (s.expected !== en[i].expected) out.push(`${w}: runnable example #${i + 1} has different output in ru and en`)
      })
      for (const [l, list] of [['ru', ru], ['en', en]] as const)
        list.forEach((s) => {
          if (s.mode !== 'check' && s.expected === null) out.push(`${w}.${l}:${s.line}: runnable example without an output block`)
          if (s.mode === 'check' && s.expected !== null) out.push(`${w}.${l}:${s.line}: a "check" example does not run, drop its output block`)
        })
    }
  }

  for (const m of modules) {
    const w = `module ${m.track}`
    if (!trackIds.has(m.track)) out.push(`${w}: unknown track`)
    for (const id of m.lessons) {
      const lesson = lessons.find((l) => l.id === id)
      if (!lesson) out.push(`${w}: unknown lesson ${id}`)
      else if (lesson.track !== m.track) out.push(`${w}: lesson ${id} belongs to ${lesson.track}`)
    }
    if (m.exam.pass <= 0 || m.exam.pass > 1) out.push(`${w}: exam.pass must be in (0, 1]`)
    out.push(...quizProblems(`${w} exam`, m.exam.questions))
  }
  return out
}

/** Shared rules for any content item: known track, verified date, official sources. */
function metaProblems(w: string, item: { track: string; sources: Source[]; verified: Verified }, trackIds: Set<string>): string[] {
  const out: string[] = []
  if (!trackIds.has(item.track)) out.push(`${w}: unknown track ${item.track}`)
  if (!/^\d{4}-\d{2}$/.test(item.verified.date)) out.push(`${w}: verified.date must be YYYY-MM`)
  if (!item.sources.some((s) => s.kind !== 'article')) out.push(`${w}: needs at least one official or spec source`)
  for (const s of item.sources) if (s.kind !== 'article' && !isOfficial(s.url)) out.push(`${w}: ${s.url} is not on the official domain list`)
  return out
}

export const taskPath = (id: string, locale: string) => join(ROOT, 'content', 'tasks', `${id}.${locale}.md`)

/** Coding tasks: ids, metadata, ru/en bodies with the same structure and a solution marker. */
export function taskProblems(): string[] {
  const out: string[] = []
  const trackIds = new Set(tracks.map((t) => t.id))
  const ids = new Set(codingTasks.map((t) => t.id))
  if (ids.size !== codingTasks.length) out.push('duplicate coding task ids')
  for (const task of codingTasks) {
    const w = `task ${task.id}`
    if (!/^[a-z0-9-]+$/.test(task.id)) out.push(`${w}: id must be kebab-case`)
    out.push(...metaProblems(w, task, trackIds))
    task.tests.forEach((t, i) => {
      for (const l of locales) if (!t.name[l].trim()) out.push(`${w} test #${i + 1}: empty ${l} name`)
    })
    const bodies: Record<string, string> = {}
    for (const l of locales) {
      if (!existsSync(taskPath(task.id, l))) {
        out.push(`${w}: missing content/tasks/${task.id}.${l}.md`)
        continue
      }
      bodies[l] = readFileSync(taskPath(task.id, l), 'utf8')
      if (bodies[l].split(SOLUTION_MARK).length !== 2) out.push(`${w}.${l}: needs exactly one ${SOLUTION_MARK} line`)
      if (/^#\s/m.test(bodies[l])) out.push(`${w}.${l}: use ## headings, the page renders the title itself`)
    }
    if (bodies.ru && bodies.en) {
      const parts = (md: string) => md.split(SOLUTION_MARK)
      const [ru, en] = [parts(bodies.ru), parts(bodies.en)]
      ru.forEach((part, i) => {
        if (en[i] === undefined) return
        if (headings(part) !== headings(en[i])) out.push(`${w}: ${i ? 'walkthrough' : 'statement'} section count differs between languages`)
        if (fences(part) !== fences(en[i])) out.push(`${w}: ${i ? 'walkthrough' : 'statement'} code block count differs between languages`)
      })
    }
  }
  return out
}

/**
 * "What does it print" tasks: metadata, explanations in both languages, distractors,
 * a valid event-loop trace whose logs equal the output, and (unless `run` is false)
 * a real run of the code whose output must match.
 */
export function predictProblems(run = true): string[] {
  const out: string[] = []
  const trackIds = new Set(tracks.map((t) => t.id))
  if (new Set(predictTasks.map((t) => t.id)).size !== predictTasks.length) out.push('duplicate predict task ids')
  for (const task of predictTasks) {
    const w = `predict ${task.id}`
    out.push(...metaProblems(w, task, trackIds))
    for (const l of locales) if (!task.explanation[l].trim()) out.push(`${w}: empty ${l} explanation`)
    if (!task.output.length) out.push(`${w}: empty output`)
    if (!task.distractors.length) out.push(`${w}: needs at least one distractor`)
    for (const d of task.distractors) if (task.output.includes(d)) out.push(`${w}: distractor "${d}" is part of the output`)
    if (task.trace) {
      const { state, problems } = foldTrace(task.trace)
      out.push(...problems.map((p) => `${w} trace: ${p}`))
      if (state.logs.join('\n') !== task.output.join('\n')) out.push(`${w} trace: logs ${JSON.stringify(state.logs)} differ from the output`)
      const lines = task.code.trimEnd().split('\n').length
      for (const e of task.trace) if ('line' in e && (e.line < 1 || e.line > lines)) out.push(`${w} trace: line ${e.line} is outside the code`)
      task.trace.forEach((e, i) => {
        if (e.note && locales.some((l) => !e.note![l].trim())) out.push(`${w} trace step ${i + 1}: note missing a language`)
      })
    }
    if (run) {
      let got: string
      try {
        got = runSnippet(task.code)
      } catch (e) {
        out.push(`${w}: code threw: ${(e as Error).message.split('\n')[0]}`)
        continue
      }
      if (got !== task.output.join('\n')) out.push(`${w}: real output differs\n  expected: ${JSON.stringify(task.output)}\n  actual:   ${JSON.stringify(got.split('\n'))}`)
    }
  }
  return out
}

/**
 * Type-checks every ```ts block and runs every ```js run / ```ts run example (in Russian bodies;
 * parity guarantees English is identical), comparing the output.
 */
export function snippetProblems(): string[] {
  const out: string[] = []
  const tsFiles: Record<string, string> = {}
  for (const lesson of lessons) {
    if (!existsSync(bodyPath(lesson.track, lesson.id, 'ru'))) continue
    for (const s of extractSnippets(readBody(lesson.track, lesson.id, 'ru'))) {
      const where = `${lesson.id}.ru:${s.line}`
      if (s.lang === 'ts' || s.lang === 'tsx') tsFiles[`${where}.${s.lang}`] = s.code
      if (s.mode === 'check') continue
      let got: string
      try {
        got = runSnippet(s.code, s.lang, s.mode)
      } catch (e) {
        out.push(`${where}: example threw: ${(e as Error).message.split('\n')[0]}`)
        continue
      }
      if (s.expected !== null && got !== s.expected) out.push(`${where}: output differs\n  expected: ${JSON.stringify(s.expected)}\n  actual:   ${JSON.stringify(got)}`)
    }
  }
  for (const [file, errors] of Object.entries(Object.keys(tsFiles).length ? typeCheck(tsFiles) : {}))
    for (const e of errors) out.push(`${file.replace(/\.tsx?$/, '')}: type error at block line ${e}`)
  return out
}
