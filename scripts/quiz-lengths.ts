/**
 * Lists quiz questions whose right answer is noticeably longer than the wrong ones
 * (the rule from quizProblems), with every option and the average length the others need.
 * Usage: pnpm tsx scripts/quiz-lengths.ts [track]
 */
import { lessons, modules } from '../src/content/lessons'
import type { QuizQuestion } from '../src/content/lessons/types'
import { locales } from '../src/i18n/types'

const track = process.argv[2]
const sets: [string, Record<string, QuizQuestion[]>][] = [
  ...lessons.filter((l) => !track || l.track === track).map((l) => [l.id, l.quiz] as [string, Record<string, QuizQuestion[]>]),
  ...modules.filter((m) => !track || m.track === track).map((m) => [`exam ${m.track}`, m.exam.questions] as [string, Record<string, QuizQuestion[]>]),
]
let flagged = 0
for (const [id, quiz] of sets)
  for (const lang of locales)
    quiz[lang].forEach((q, i) => {
      const len = q.options.map((o) => o.length)
      const others = len.filter((_, k) => k !== q.correct)
      const avg = others.reduce((s, x) => s + x, 0) / others.length
      if (len[q.correct] <= 1.3 * avg || len[q.correct] - avg <= 8) return
      flagged++
      const need = Math.ceil(Math.min(len[q.correct] / 1.3, len[q.correct] - 8))
      console.log(`${id}.${lang} #${i + 1}: right answer ${len[q.correct]} chars, others average ${avg.toFixed(0)}, need ≥ ${need}`)
      q.options.forEach((o, k) => console.log(`  ${k === q.correct ? '*' : ' '} ${o.length.toString().padStart(3)}  ${o}`))
    })
console.log(flagged ? `${flagged} question(s) to fix` : 'quiz option lengths OK')
