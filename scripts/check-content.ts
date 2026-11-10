/**
 * Content checks for lessons and tasks: ru/en parity, official sources, internal links, quizzes,
 * and every ```js run example executed and compared with its ```output block.
 * Usage: pnpm check:content [--no-run]
 */
import { predictProblems, snippetProblems, staticProblems, taskProblems } from './content-checks'

const noRun = process.argv.includes('--no-run')
const problems = [...staticProblems(), ...taskProblems(), ...predictProblems(!noRun), ...(noRun ? [] : snippetProblems())]
for (const p of problems) console.log(`✗ ${p}`)
console.log(problems.length ? `\n${problems.length} problem(s)` : 'content OK')
process.exit(problems.length ? 1 : 0)
