// Parses ```mermaid blocks with the real Mermaid parser. Runs under scripts/dom-env.mjs
// (Mermaid needs a DOM). Input: JSON [{ where, code }] on stdin. Output: JSON [{ where, error }].
import { readFileSync } from 'node:fs'
import mermaid from 'mermaid'

const blocks = JSON.parse(readFileSync(0, 'utf8'))
const errors = []
for (const { where, code } of blocks) {
  try {
    await mermaid.parse(code)
  } catch (e) {
    errors.push({ where, error: String(e.message ?? e).split('\n').slice(0, 3).join(' ') })
  }
}
process.stdout.write(JSON.stringify(errors))
process.exit(0) // Mermaid leaves handles open
