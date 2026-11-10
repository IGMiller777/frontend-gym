import type { Locale } from '../src/i18n/types'

const system: Record<Locale, string> = {
  ru: `Ты опытный фронтенд-разработчик и проводишь live-coding собеседование. Кандидат решил задачу и просит ревью кода.
Отвечай по-русски, в markdown, кратко (до ~300 слов), разделами:
1. **Корректность**: что работает, какие краевые случаи упущены (если тесты падают, объясни почему).
2. **Сложность**: время и память.
3. **Читаемость**: имена, структура, лишний код. Если можно проще, покажи короткий фрагмент.
4. **Что спросят дальше**: 2–3 вопроса, которые задал бы интервьюер.
Будь конкретным, ссылайся на строки кода кандидата. Не переписывай решение целиком. Опирайся на MDN и спецификацию ECMAScript, не выдумывай API.`,
  en: `You are an experienced frontend engineer running a live-coding interview. The candidate solved a task and asks for a code review.
Answer in English, in markdown, briefly (up to ~300 words), in sections:
1. **Correctness**: what works, which edge cases are missed (if tests fail, explain why).
2. **Complexity**: time and memory.
3. **Readability**: names, structure, dead code. If it can be simpler, show a short snippet.
4. **Follow-up questions**: 2–3 questions an interviewer would ask next.
Be specific and refer to the candidate's lines. Do not rewrite the whole solution. Rely on MDN and the ECMAScript spec; do not invent APIs.`,
}

export interface ReviewRequest {
  locale: Locale
  title: string
  statement: string
  code: string
  results: { name: string; ok: boolean; error?: string }[]
}

export const reviewSystem = (locale: Locale) => system[locale] ?? system.en

export function buildReviewPrompt({ locale, title, statement, code, results }: ReviewRequest): string {
  const ru = locale === 'ru'
  const tests = results.map((r) => `- ${r.ok ? '✓' : '✗'} ${r.name}${r.error ? `: ${r.error.split('\n')[0]}` : ''}`).join('\n')
  return [
    `${ru ? 'Задача' : 'Task'}: ${title}`,
    `${ru ? 'Условие' : 'Statement'}:\n${statement.slice(0, 4000)}`,
    `${ru ? 'Код кандидата' : "Candidate's code"}:\n\`\`\`ts\n${code.slice(0, 12000)}\n\`\`\``,
    `${ru ? 'Результаты тестов' : 'Test results'}:\n${tests || '—'}`,
  ].join('\n\n')
}
