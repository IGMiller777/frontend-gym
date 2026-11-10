import { dictionaries } from '../i18n'
import { useProgress } from '../store'

/** AI features need the local API server; GitHub Pages builds set VITE_AI=off. */
export const AI_ENABLED = import.meta.env.VITE_AI !== 'off'

const dict = () => dictionaries[useProgress.getState().locale]
const url = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`

export async function postApi<T>(path: string, body: unknown): Promise<T> {
  if (!AI_ENABLED) throw new Error(dict().errors.aiDisabled)
  const res = await fetch(url(path), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
  // The Vite proxy answers with an empty body when the API process is down.
  const text = await res.text()
  const json = text.startsWith('{') ? JSON.parse(text) : {}
  if (!res.ok) throw new Error(json.error ?? (text ? res.statusText : dict().errors.apiDown(res.status)))
  return json as T
}

/** POST that reads a plain-text stream; onText gets the whole text so far. Server errors come after a NUL. */
export async function streamApi(path: string, body: unknown, onText: (text: string) => void, signal?: AbortSignal): Promise<string> {
  if (!AI_ENABLED) throw new Error(dict().errors.aiDisabled)
  const res = await fetch(url(path), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), signal })
  if (!res.ok || !res.body) {
    const text = await res.text()
    const json = text.startsWith('{') ? JSON.parse(text) : {}
    throw new Error(json.error ?? (text ? res.statusText : dict().errors.apiDown(res.status)))
  }
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader()
  let text = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    text += value
    onText(text.split('\0')[0])
  }
  const nul = text.indexOf('\0')
  if (nul >= 0) throw new Error(text.slice(nul + 1) || dict().errors.generation)
  return text
}
