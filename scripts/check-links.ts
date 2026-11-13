/**
 * Checks that every external source link answers. Network-dependent, so it is not part of CI.
 * Usage: pnpm check:links
 */
import { codingTasks } from '../src/content/coding'
import { lessons } from '../src/content/lessons'
import { predictTasks } from '../src/content/predict'
import { tracks } from '../src/content/tracks'

const urls = [...new Set([...lessons.flatMap((l) => l.sources), ...codingTasks.flatMap((t) => t.sources), ...predictTasks.flatMap((t) => t.sources), ...tracks.flatMap((t) => t.docs)].map((s) => s.url.split('#')[0]))]

/**
 * Sites behind a bot challenge (Vercel Security Checkpoint) answer scripts with 429 although the page
 * opens in a browser. Their links are reported separately and checked by hand in a browser.
 */
const botProtected = new Set(['www.greatfrontend.com'])
const manual: string[] = []

async function check(url: string): Promise<string | null> {
  for (const method of ['HEAD', 'GET'] as const) {
    try {
      const res = await fetch(url, { method, redirect: 'follow', headers: { 'user-agent': 'frontend-gym link checker' }, signal: AbortSignal.timeout(15_000) })
      if (res.ok) return null
      if (method === 'GET' && res.status === 429 && botProtected.has(new URL(url).hostname)) {
        manual.push(url)
        return null
      }
      if (method === 'GET') return `HTTP ${res.status}`
    } catch (e) {
      if (method === 'GET') return (e as Error).message
    }
  }
  return 'unreachable'
}

const results = await Promise.all(urls.map(async (u) => [u, await check(u)] as const))
const bad = results.filter(([, err]) => err)
for (const [u, err] of bad) console.log(`✗ ${u}: ${err}`)
for (const u of manual) console.log(`? ${u}: bot challenge, check in a browser`)
console.log(`${urls.length - bad.length}/${urls.length} links OK`)
process.exit(bad.length ? 1 : 0)
