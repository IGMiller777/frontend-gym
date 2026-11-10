import type { Locale } from '../../i18n/types'
import { SOLUTION_MARK } from './types'

const bodies = import.meta.glob<string>('/content/tasks/*.md', { query: '?raw', import: 'default' })

/** Statement and walkthrough of a coding task in one language. */
export async function loadTaskBody(id: string, locale: Locale): Promise<{ statement: string; walkthrough: string }> {
  const load = bodies[`/content/tasks/${id}.${locale}.md`]
  if (!load) throw new Error(`missing task body: ${id}.${locale}.md`)
  const [statement, walkthrough = ''] = (await load()).split(SOLUTION_MARK)
  return { statement: statement.trim(), walkthrough: walkthrough.trim() }
}
