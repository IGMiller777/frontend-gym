import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { progressStore } from './progress'

let dir: string
beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'fg-progress-'))
})
afterEach(async () => {
  await rm(dir, { recursive: true, force: true })
})

describe('progress store', () => {
  it('returns null for a missing file and round-trips JSON', async () => {
    const p = progressStore(dir)
    expect(await p.load('x')).toBeNull()
    await p.save('x', '{"a":1}')
    expect(await p.load('x')).toBe('{"a":1}')
  })

  it('refuses invalid JSON and keeps the old file', async () => {
    const p = progressStore(dir)
    await p.save('x', '{"a":1}')
    await expect(p.save('x', 'not json')).rejects.toThrow()
    expect(await p.load('x')).toBe('{"a":1}')
  })

  it('keeps the first backup of the day', async () => {
    const p = progressStore(dir)
    const day = new Date('2026-11-09T10:00:00Z')
    await p.save('x', '{"v":"morning"}', day)
    await p.save('x', '{"v":"reset"}', day)
    expect(await p.load('x')).toBe('{"v":"reset"}')
    expect(await readFile(join(dir, 'backups', 'x-2026-11-09.json'), 'utf8')).toBe('{"v":"morning"}')
  })

  it('keeps only the last 14 daily backups', async () => {
    const p = progressStore(dir)
    for (let d = 1; d <= 20; d++) await p.save('x', `{"d":${d}}`, new Date(Date.UTC(2026, 0, d)))
    const files = (await readdir(join(dir, 'backups'))).sort()
    expect(files).toHaveLength(14)
    expect(files[0]).toBe('x-2026-01-07.json')
  })

  it('sanitizes the store name', async () => {
    const p = progressStore(dir)
    await p.save('../evil', '{}')
    expect(await readdir(dir)).toContain('___evil.json')
  })
})
