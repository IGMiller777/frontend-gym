// Minimal hast shapes; the full types live in @types/hast, which is not a direct dependency.
interface HNode {
  type: string
  tagName?: string
  properties?: Record<string, unknown>
  children?: HNode[]
}

/**
 * Rehype plugin: wraps every `h2` and the content up to the next `h2` into
 * `<section data-section="i"><h2/><div/></section>`. Content before the first `h2` stays as is.
 * The Markdown component turns these sections into collapsible ones.
 */
export function rehypeSections() {
  return (tree: HNode) => {
    const out: HNode[] = []
    let body: HNode | undefined
    let index = 0
    for (const child of tree.children ?? []) {
      if (child.type === 'element' && child.tagName === 'h2') {
        body = { type: 'element', tagName: 'div', properties: {}, children: [] }
        out.push({ type: 'element', tagName: 'section', properties: { dataSection: index++ }, children: [child, body] })
      } else if (body) body.children!.push(child)
      else out.push(child)
    }
    tree.children = out
  }
}

/** Number of `## ` headings outside code fences, i.e. how many sections rehypeSections makes. */
export function countSections(md: string): number {
  let fence = false
  let n = 0
  for (const line of md.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) fence = !fence
    else if (!fence && line.startsWith('## ')) n++
  }
  return n
}
