import { Workflow } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { useT } from '../i18n'

type Mermaid = typeof import('mermaid').default
let mermaidPromise: Promise<Mermaid> | undefined
/** Mermaid is large, so it loads only when a page actually shows a diagram. */
const loadMermaid = () => (mermaidPromise ??= import('mermaid').then((m) => m.default))

const isDark = () => document.documentElement.classList.contains('dark')

/** Mermaid theme built from the app's design tokens, so diagrams follow light and dark mode. */
function themeVariables() {
  const css = getComputedStyle(document.documentElement)
  const v = (name: string) => css.getPropertyValue(name).trim()
  return {
    darkMode: isDark(),
    background: v('--surface'),
    fontFamily: 'inherit',
    fontSize: '15px',
    primaryColor: v('--surface-2'),
    primaryTextColor: v('--ink'),
    primaryBorderColor: v('--brand-1'),
    secondaryColor: v('--surface'),
    secondaryBorderColor: v('--brand-2'),
    tertiaryColor: v('--canvas'),
    tertiaryBorderColor: v('--brand-3'),
    lineColor: v('--muted'),
    textColor: v('--ink'),
    mainBkg: v('--surface-2'),
    nodeBorder: v('--brand-1'),
    clusterBkg: v('--canvas'),
    clusterBorder: v('--line'),
    edgeLabelBackground: v('--surface'),
    actorBkg: v('--surface-2'),
    actorBorder: v('--brand-1'),
    actorTextColor: v('--ink'),
    signalColor: v('--ink'),
    signalTextColor: v('--ink'),
    labelBoxBkgColor: v('--surface-2'),
    noteBkgColor: v('--surface'),
    noteBorderColor: v('--brand-3'),
    noteTextColor: v('--ink'),
  }
}

/** Re-render when the `.dark` class on <html> flips. */
function useThemeVersion() {
  const [dark, setDark] = useState(isDark)
  useEffect(() => {
    const observer = new MutationObserver(() => setDark(isDark()))
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])
  return dark
}

/** A ```mermaid block from lesson markdown, rendered to SVG. */
export function Diagram({ code }: { code: string }) {
  const t = useT()
  const id = `d${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const dark = useThemeVersion()
  const [svg, setSvg] = useState<string>()
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    loadMermaid()
      .then(async (mermaid) => {
        // Natural size (no shrinking to the column width): small text stays readable, wide diagrams scroll.
        const natural = { useMaxWidth: false }
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: 'base',
          themeVariables: themeVariables(),
          flowchart: { ...natural, htmlLabels: true, curve: 'basis', padding: 12 },
          sequence: { ...natural, mirrorActors: false },
          state: natural,
          class: natural,
          er: natural,
          timeline: natural,
          mindmap: natural,
          block: natural,
        })
        const result = await mermaid.render(`${id}-${dark ? 'd' : 'l'}`, code)
        if (!cancelled) setSvg(result.svg)
      })
      .catch(() => !cancelled && setFailed(true))
    return () => {
      cancelled = true
    }
  }, [code, dark, id])

  return (
    <figure className="not-prose my-6 overflow-hidden rounded-2xl border border-line bg-surface">
      <figcaption className="flex items-center gap-1.5 border-b border-line bg-surface-2 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
        <Workflow size={13} aria-hidden /> {t.lesson.diagram}
      </figcaption>
      {failed ? (
        <pre className="overflow-x-auto px-4 py-3 font-mono text-[13px] text-ink">{code}</pre>
      ) : svg ? (
        <div className="overflow-x-auto px-3 py-4 [&_svg]:mx-auto" dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <div className="h-40 animate-pulse bg-surface-2/50" aria-busy="true" />
      )}
    </figure>
  )
}
