import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { describe, expect, test } from 'vitest'
import { countSections, rehypeSections } from './sections'

// Every lesson body in both languages, keyed by path.
const lessons = import.meta.glob<string>('/content/lessons/**/*.md', { query: '?raw', import: 'default', eager: true })
const render = (md: string) => renderToStaticMarkup(createElement(ReactMarkdown, { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSections] }, md))

describe('collapsible lesson sections', () => {
  test('each h2 with its content becomes one section; text before the first h2 stays outside', () => {
    const html = render('Intro\n\n## One\n\nA\n\n```md\n## not a heading\n```\n\n## Two\n\nB\n\n### Sub\n\nC')
    expect(html).toMatch(/^<p>Intro<\/p>/)
    expect(html.match(/<section data-section="\d">/g)).toEqual(['<section data-section="0">', '<section data-section="1">'])
    expect(html).toContain('<h2>Two</h2><div>')
    expect(html).toContain('<h3>Sub</h3>')
    expect(countSections('Intro\n\n## One\n\n```md\n## not a heading\n```\n\n## Two')).toBe(2)
  })

  // Renders every lesson, so it needs more than the default 5 s when the suite runs in parallel.
  test('for every lesson, the counted sections match the rendered ones', { timeout: 60_000 }, () => {
    expect(Object.keys(lessons).length).toBeGreaterThan(300)
    for (const [file, md] of Object.entries(lessons)) {
      const rendered = render(md).match(/<section data-section=/g)?.length ?? 0
      expect(rendered, file).toBe(countSections(md))
      expect(rendered, file).toBeGreaterThan(0)
    }
  })
})
