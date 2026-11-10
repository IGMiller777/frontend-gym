import type { Locale } from '../../i18n/types'

/** Lesson bodies are loaded on demand, one language at a time. */
const bodies = import.meta.glob<string>('/content/lessons/**/*.md', { query: '?raw', import: 'default' })

export function loadLessonBody(track: string, id: string, locale: Locale): Promise<string> {
  const load = bodies[`/content/lessons/${track}/${id}.${locale}.md`]
  if (!load) return Promise.reject(new Error(`missing lesson body: ${track}/${id}.${locale}.md`))
  return load()
}
