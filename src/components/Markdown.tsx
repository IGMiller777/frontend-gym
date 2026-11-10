import clsx from 'clsx'
import { Terminal } from 'lucide-react'
import ReactMarkdown, { type Components } from 'react-markdown'
import { Link } from 'react-router'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import { useT } from '../i18n'

interface HastNode {
  value?: string
  properties?: { className?: string[] }
  children?: HastNode[]
}
const textOf = (n: HastNode): string => n.value ?? (n.children ?? []).map(textOf).join('')

/** Lesson markdown: GFM tables, highlighted code, ```output blocks styled as a console. */
export function Markdown({ children }: { children: string }) {
  const t = useT()
  const components: Components = {
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
  }
  return (
    <div
      className={clsx(
        'prose prose-lg max-w-none text-ink dark:prose-invert',
        'prose-headings:font-display prose-headings:text-ink prose-h2:mt-10 prose-h2:text-2xl prose-p:leading-relaxed prose-strong:text-ink prose-li:my-1',
        'prose-code:rounded-md prose-code:bg-surface-2 prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-[0.85em] prose-code:font-normal prose-code:text-ink prose-code:before:content-none prose-code:after:content-none',
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[[rehypeHighlight, { detect: false, plainText: ['output'] }]]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  )
}
