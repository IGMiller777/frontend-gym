import { mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Progress lives in data/ next to the project (gitignored), one JSON file per store name. */
const DEFAULT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'data')
const KEEP_BACKUPS = 14

const safe = (name: string) => name.replace(/[^a-z0-9_-]/gi, '_')

export function progressStore(dir = DEFAULT_DIR) {
  const fileOf = (name: string) => join(dir, `${safe(name)}.json`)

  async function load(name: string): Promise<string | null> {
    try {
      return await readFile(fileOf(name), 'utf8')
    } catch {
      return null
    }
  }

  /**
   * Atomic write (tmp + rename). The first save of each day also writes a backup and never
   * overwrites it later that day, so a bad save (e.g. a reset) cannot destroy today's backup.
   */
  async function save(name: string, body: string, now = new Date()): Promise<void> {
    JSON.parse(body) // refuse garbage instead of overwriting good progress
    const backups = join(dir, 'backups')
    await mkdir(backups, { recursive: true })
    const file = fileOf(name)
    const tmp = `${file}.tmp`
    await writeFile(tmp, body)
    await rename(tmp, file)

    const day = now.toISOString().slice(0, 10)
    try {
      await writeFile(join(backups, `${safe(name)}-${day}.json`), body, { flag: 'wx' })
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== 'EEXIST') throw e
      return
    }
    const old = (await readdir(backups)).filter((f) => f.startsWith(`${safe(name)}-`)).sort()
    for (const f of old.slice(0, Math.max(0, old.length - KEEP_BACKUPS))) await rm(join(backups, f))
  }

  return { load, save }
}
