// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { runReactTests } from './react-runtime'

const counter = `import { useState } from 'react'
export function Counter({ start = 0 }: { start?: number }) {
  const [n, setN] = useState(start)
  return (
    <div>
      <p>Count: {n}</p>
      <button onClick={() => setN(n + 1)}>Add</button>
      <label>Name <input /></label>
    </div>
  )
}`

describe('component runner', () => {
  it('renders TSX, clicks by role and reads text', async () => {
    const r = await runReactTests(counter, [
      { code: `render(<Counter start={2} />)\nawait user.click(screen.getByRole('button', { name: 'Add' }))\nexpect(screen.getByText('Count: 3')).toBeTruthy()` },
      { code: `render(<Counter />)\nconst input = screen.getByLabelText('Name')\nawait user.type(input, 'Ann')\nexpect(input.value).toBe('Ann')` },
      { code: `render(<Counter />)\nexpect(screen.getByText('Count: 5')).toBeTruthy()` },
    ])
    expect(r.error).toBeUndefined()
    expect(r.tests.map((t) => t.ok)).toEqual([true, true, false])
    expect(r.tests[2].error).toContain('Unable to find an element with text "Count: 5"')
  })

  it('unmounts between tests and rejects unknown imports', async () => {
    const r = await runReactTests(counter, [{ code: `render(<Counter />)` }, { code: `expect(document.body.children.length).toBe(0)` }])
    expect(r.tests.every((t) => t.ok)).toBe(true)
    const bad = await runReactTests(`import _ from 'lodash'\nexport const x = _`, [{ code: '' }])
    expect(bad.error).toContain('import "lodash" is not available here')
  })
})
