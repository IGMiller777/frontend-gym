import clsx from 'clsx'
import { ChevronRight, ChevronsDownUp, ChevronsUpDown, Terminal } from 'lucide-react'
import { Children, createContext, type ReactElement, type ReactNode, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import { Link } from 'react-router'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import { useT } from '../i18n'
import { Diagram } from './Diagram'
import { countSections, rehypeSections } from './sections'

interface HastNode {
  value?: string
  properties?: { className?: string[]; dataSection?: number }
  children?: HastNode[]
}
const textOf = (n: HastNode): string => n.value ?? (n.children ?? []).map(textOf).join('')

interface SectionsState {
  open: ReadonlySet<number>
  set: (i: number, open: boolean) => void
}
const SectionsContext = createContext<SectionsState | null>(null)

/**
 * A collapsible lesson section. The heading stays a real `h2` with a button inside, so screen reader
 * users can still move between sections by heading (a heading inside `summary` gets dropped by JAWS
 * and TalkBack). Closed content is `hidden="until-found"`: find in page still matches it and opens it.
 */
function Section({ node, children }: { node?: unknown; children?: ReactNode }) {
  const ctx = useContext(SectionsContext)
  const i = (node as HastNode | undefined)?.properties?.dataSection ?? 0
  const open = ctx?.open.has(i) ?? true
  const ref = useRef<HTMLDivElement>(null)
  const set = ctx?.set
  // Set before paint, so a closed section never flashes open. React has no prop for the string value.
  useLayoutEffect(() => {
    if (open) ref.current?.removeAttribute('hidden')
    else ref.current?.setAttribute('hidden', 'until-found')
  }, [open])
  useEffect(() => {
    const el = ref.current
    if (!el || !set) return
    const reveal = () => set(i, true)
    el.addEventListener('beforematch', reveal)
    return () => el.removeEventListener('beforematch', reveal)
  }, [i, set])
  const [head, body] = Children.toArray(children) as ReactElement<{ children?: ReactNode }>[]
  return (
    <section className="border-b border-line">
      <h2 className="!my-0">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => set?.(i, !open)}
          className="flex w-full items-center gap-2 rounded-xl py-4 text-left transition-colors hover:text-brand-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <ChevronRight aria-hidden className={clsx('size-6 shrink-0 text-muted transition-transform motion-reduce:transition-none', open && 'rotate-90')} />
          <span>{head?.props.children}</span>
        </button>
      </h2>
      <div ref={ref}>
        <div className="pb-6">{body?.props.children}</div>
      </div>
    </section>
  )
}

/**
 * Lesson and task markdown: GFM tables, highlighted code, ```output blocks styled as a console, ```mermaid diagrams.
 * With `collapsible`, every `##` section starts closed and opens on click; a button opens or closes all of them.
 */
export function Markdown({ children, size = 'lg', collapsible = false }: { children: string; size?: 'base' | 'lg'; collapsible?: boolean }) {
  const t = useT()
  const [open, setOpen] = useState<ReadonlySet<number>>(() => new Set())
  const set = useCallback(
    (i: number, value: boolean) =>
      setOpen((prev) => {
        if (prev.has(i) === value) return prev
        const next = new Set(prev)
        if (value) next.add(i)
        else next.delete(i)
        return next
      }),
    [],
  )
  const total = useMemo(() => (collapsible ? countSections(children) : 0), [children, collapsible])
  const allOpen = total > 0 && open.size >= total
  const sections = useMemo(() => ({ open, set }), [open, set])

  const components: Components = useMemo(() => ({
    section: Section,
    a: ({ node: _node, href = '', ...props }) =>
      href.startsWith('/') ? (
        <Link to={href} className="font-medium text-brand-1 underline decoration-brand-1/30 underline-offset-2 hover:decoration-brand-1" {...props} />
      ) : (
        <a href={href} target="_blank" rel="noreferrer" className="font-medium text-brand-1 underline decoration-brand-1/30 underline-offset-2" {...props} />
      ),
    blockquote: ({ node: _node, ...props }) => (
      <blockquote className="not-prose my-5 space-y-2 rounded-2xl border-l-4 border-brand-1 bg-surface-2 px-5 py-4 leading-relaxed text-ink [&_code]:rounded [&_code]:bg-surface [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.88em]" {...props} />
    ),
    pre: ({ node, ...props }) => {
      const code = (node as HastNode | undefined)?.children?.[0]
      const lang = code?.properties?.className?.find((c) => c.startsWith('language-'))?.slice(9)
      if (code && lang === 'mermaid') return <Diagram code={textOf(code)} />
      if (code && lang === 'output')
        return (
          <figure className="not-prose -mt-2 mb-5 overflow-hidden rounded-b-2xl rounded-t-md border border-line bg-surface-2">
            <figcaption className="flex items-center gap-1.5 border-b border-line px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
              <Terminal size={13} aria-hidden /> {t.lesson.output}
            </figcaption>
            <pre className="overflow-x-auto px-4 py-3 font-mono text-[13px] leading-relaxed text-ink">{textOf(code)}</pre>
          </figure>
        )
      return <pre className="not-prose code-block my-4 overflow-x-auto rounded-2xl border border-line p-4 font-mono text-[13px] leading-relaxed [&_code]:!bg-transparent [&_code]:!p-0" {...props} />
    },
    table: ({ node: _node, ...props }) => (
      <div className="not-prose my-5 overflow-x-auto rounded-2xl border border-line">
        <table
          className="w-full border-collapse text-left text-sm [&_code]:rounded [&_code]:bg-surface-2 [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.88em] [&_td]:border-t [&_td]:border-line [&_td]:px-4 [&_td]:py-2.5 [&_td]:align-top [&_th]:bg-surface-2 [&_th]:px-4 [&_th]:py-2.5 [&_th]:font-semibold"
          {...props}
        />
      </div>
    ),
  }), [t])
  // Memoized so that opening a section re-renders only the sections, not the parsed markdown and its diagrams.
  const tree = useMemo(
    () => (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { detect: false, plainText: ['output', 'mermaid'] }], ...(collapsible ? [rehypeSections] : [])]}
        components={components}
      >
        {children}
      </ReactMarkdown>
    ),
    [children, collapsible, components],
  )
  return (
    <div
      className={clsx(
        'prose max-w-none text-ink dark:prose-invert',
        size === 'lg' && 'prose-lg',
        'prose-headings:font-display prose-headings:text-ink prose-h2:mt-10 prose-h2:text-2xl prose-p:leading-relaxed prose-strong:text-ink prose-li:my-1',
        'prose-code:rounded-md prose-code:bg-surface-2 prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-[0.85em] prose-code:font-normal prose-code:text-ink prose-code:before:content-none prose-code:after:content-none',
      )}
    >
      {total > 1 && (
        <div className="not-prose mb-2 flex justify-end">
          <button
            type="button"
            aria-expanded={allOpen}
            onClick={() => setOpen(allOpen ? new Set() : new Set(Array.from({ length: total }, (_, i) => i)))}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-semibold text-muted transition hover:bg-surface-2 hover:text-ink"
          >
            {allOpen ? <ChevronsDownUp size={16} aria-hidden /> : <ChevronsUpDown size={16} aria-hidden />}
            {allOpen ? t.lesson.collapseAll : t.lesson.expandAll}
          </button>
        </div>
      )}
      <SectionsContext value={sections}>{tree}</SectionsContext>
    </div>
  )
}
