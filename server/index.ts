import { serve } from '@hono/node-server'
import { type Context, Hono } from 'hono'
import { streamText } from 'hono/streaming'
import { askSystem, buildAskPrompt, type AskRequest } from './ask'
import { MODEL, runClaude, streamClaude } from './claude'
import { progressStore } from './progress'
import { buildReviewPrompt, reviewSystem, type ReviewRequest } from './review'

const PORT = Number(process.env.API_PORT ?? 5901)
const app = new Hono()
const progress = progressStore()

/** JSON POST route: a string result becomes { text }, an exception becomes 500 { error }. */
function route<T>(path: string, handler: (body: T) => Promise<unknown>) {
  app.post(path, async (c) => {
    try {
      const result = await handler(await c.req.json<T>())
      return c.json(typeof result === 'string' ? { text: result } : result)
    } catch (e) {
      console.error(e)
      return c.json({ error: (e as Error).message }, 500)
    }
  })
}

app.get('/api/health', (c) => c.json({ ok: true, model: MODEL }))

route<AskRequest>('/api/ask', (b) => runClaude(buildAskPrompt(b), { system: askSystem(b.locale) }))

/**
 * Plain-text stream route. Errors before the first chunk are a JSON 500;
 * later ones are appended after a NUL separator so the client can tell them from the text.
 */
function streamRoute<T>(path: string, build: (body: T) => { prompt: string; system: string }) {
  app.post(path, async (c) => {
    const { prompt, system } = build(await c.req.json<T>())
    const gen = streamClaude(prompt, { system })
    let first: IteratorResult<string>
    try {
      first = await gen.next()
    } catch (e) {
      console.error(e)
      return c.json({ error: (e as Error).message }, 500)
    }
    return streamText(c, async (s) => {
      s.onAbort(() => void gen.return(undefined))
      try {
        if (!first.done) await s.write(first.value)
        for await (const chunk of gen) await s.write(chunk)
      } catch (e) {
        console.error(e)
        await s.write(`\0${(e as Error).message}`)
      }
    })
  })
}

streamRoute<AskRequest>('/api/ask/stream', (b) => ({ prompt: buildAskPrompt(b), system: askSystem(b.locale) }))
streamRoute<ReviewRequest>('/api/review/stream', (b) => ({ prompt: buildReviewPrompt(b), system: reviewSystem(b.locale) }))

// Player progress: a file in data/ so it survives clearing the browser.
app.get('/api/progress/:name', async (c) => {
  const body = await progress.load(c.req.param('name'))
  return body === null ? c.body(null, 204) : c.body(body, 200, { 'Content-Type': 'application/json' })
})
const putProgress = async (c: Context) => {
  try {
    await progress.save(c.req.param('name') ?? 'default', await c.req.text())
    return c.json({ ok: true })
  } catch (e) {
    return c.json({ error: (e as Error).message }, 400)
  }
}
app.put('/api/progress/:name', putProgress)
app.post('/api/progress/:name', putProgress) // sendBeacon on page close

const server = serve({ fetch: app.fetch, port: PORT }, () => console.log(`api on :${PORT} (model: ${MODEL})`))

// node --watch restarts via SIGTERM; free the port at once so the new process can bind it.
for (const sig of ['SIGTERM', 'SIGINT'] as const)
  process.on(sig, () => {
    server.close()
    process.exit(0)
  })
