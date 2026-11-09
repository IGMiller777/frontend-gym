import type { Locale } from '../src/i18n/types'

const system: Record<Locale, string> = {
  ru: `Ты опытный фронтенд-архитектор и терпеливый наставник. Ученик готовится к собеседованию на frontend-разработчика.
Отвечай по-русски, в markdown, кратко (до ~250 слов, если не просят подробнее): суть, как это работает, пример кода, типичная ошибка.
Опирайся на официальную документацию (MDN, web.dev, спецификации, react.dev, angular.dev, vuejs.org, typescriptlang.org) и современные практики. Если подход устарел, скажи, что используют сейчас.
В конце дай 1–2 ссылки на официальные страницы. Не выдумывай факты и версии; если не уверен, так и скажи.`,
  en: `You are an experienced frontend architect and a patient mentor. The student is preparing for a frontend developer interview.
Answer in English, in markdown, briefly (up to ~250 words unless asked for more): the gist, how it works, a code example, a common mistake.
Rely on official documentation (MDN, web.dev, specs, react.dev, angular.dev, vuejs.org, typescriptlang.org) and current practice. If an approach is outdated, say what is used today.
End with 1–2 links to official pages. Do not invent facts or versions; if unsure, say so.`,
}

export interface AskRequest {
  locale: Locale
  topic: string
  context?: string
  question: string
  history?: { q: string; a: string }[]
}

export const askSystem = (locale: Locale) => system[locale] ?? system.en

export function buildAskPrompt({ locale, topic, context, question, history }: AskRequest): string {
  const ru = locale === 'ru'
  const past = (history ?? []).map((h) => `${ru ? 'Вопрос' : 'Question'}: ${h.q}\n${ru ? 'Ответ' : 'Answer'}: ${h.a}`).join('\n\n')
  return [
    `${ru ? 'Тема' : 'Topic'}: ${topic}`,
    context ? `${ru ? 'Материал, который ученик сейчас читает' : 'Material the student is reading'}:\n${context}` : '',
    past ? `${ru ? 'Предыдущий диалог' : 'Previous dialog'}:\n${past}` : '',
    `${ru ? 'Вопрос ученика' : "Student's question"}: ${question}`,
  ]
    .filter(Boolean)
    .join('\n\n')
}
