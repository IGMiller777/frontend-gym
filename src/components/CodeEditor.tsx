import { indentWithTab } from '@codemirror/commands'
import { javascript } from '@codemirror/lang-javascript'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import { tags } from '@lezer/highlight'
import { basicSetup } from 'codemirror'
import { useEffect, useRef } from 'react'

/** Token colors come from the same CSS variables as lesson code blocks, so both themes match. */
const highlight = HighlightStyle.define([
  { tag: [tags.keyword, tags.bool, tags.null, tags.self, tags.operatorKeyword, tags.modifier], color: 'var(--code-keyword)' },
  { tag: [tags.string, tags.special(tags.string), tags.regexp], color: 'var(--code-string)' },
  { tag: [tags.number], color: 'var(--code-number)' },
  { tag: [tags.comment, tags.lineComment, tags.blockComment], color: 'var(--code-comment)', fontStyle: 'italic' },
  { tag: [tags.function(tags.variableName), tags.function(tags.propertyName), tags.className, tags.typeName, tags.definition(tags.typeName)], color: 'var(--code-title)' },
  { tag: [tags.propertyName, tags.attributeName], color: 'var(--code-attr)' },
])

const theme = EditorView.theme({
  '&': { backgroundColor: 'var(--code-bg)', color: 'var(--code-ink)', fontSize: '13.5px', height: '100%' },
  '.cm-scroller': { fontFamily: 'var(--font-mono)', lineHeight: '1.6', fontVariantLigatures: 'none' },
  '.cm-content': { caretColor: 'var(--ring)', padding: '12px 0' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--ring)', borderLeftWidth: '2px' },
  '.cm-gutters': { backgroundColor: 'var(--code-bg)', color: 'var(--code-comment)', border: 'none' },
  '.cm-activeLine': { backgroundColor: 'color-mix(in oklab, var(--brand-1) 7%, transparent)' },
  '.cm-activeLineGutter': { backgroundColor: 'transparent', color: 'var(--code-ink)' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': { backgroundColor: 'color-mix(in oklab, var(--brand-1) 28%, transparent) !important' },
  '.cm-matchingBracket': { backgroundColor: 'color-mix(in oklab, var(--brand-2) 22%, transparent)', outline: 'none' },
  '&.cm-focused': { outline: '3px solid var(--ring)', outlineOffset: '-3px' },
  '.cm-tooltip': { backgroundColor: 'var(--surface)', color: 'var(--ink)', border: '1px solid var(--line)', borderRadius: '10px' },
  '.cm-tooltip-autocomplete ul li[aria-selected]': { backgroundColor: 'var(--brand-1)', color: 'white' },
})

/**
 * CodeMirror 6 editor for TypeScript. Uncontrolled: `initial` sets the starting text,
 * remount it with a new `key` to reset. Mod+Enter calls `onRun`.
 * Tab indents; Escape then Tab moves focus out (CodeMirror's keyboard escape hatch).
 */
export function CodeEditor({ initial, onChange, onRun, label, describedBy }: { initial: string; onChange: (code: string) => void; onRun?: () => void; label: string; describedBy?: string }) {
  const host = useRef<HTMLDivElement>(null)
  // Latest callbacks without recreating the editor.
  const cb = useRef({ onChange, onRun })
  // Read once at mount: the editor owns its text afterwards.
  const setup = useRef({ initial, label, describedBy })
  useEffect(() => {
    cb.current = { onChange, onRun }
  })

  useEffect(() => {
    if (!host.current) return
    const { initial, label, describedBy } = setup.current
    const view = new EditorView({
      parent: host.current,
      state: EditorState.create({
        doc: initial,
        extensions: [
          keymap.of([{ key: 'Mod-Enter', preventDefault: true, run: () => (cb.current.onRun?.(), true) }, indentWithTab]),
          basicSetup,
          javascript({ typescript: true }),
          syntaxHighlighting(highlight),
          theme,
          EditorState.tabSize.of(2),
          EditorView.contentAttributes.of({ 'aria-label': label, ...(describedBy ? { 'aria-describedby': describedBy } : {}) }),
          EditorView.updateListener.of((u) => {
            if (u.docChanged) cb.current.onChange(u.state.doc.toString())
          }),
        ],
      }),
    })
    return () => view.destroy()
  }, [])

  return <div ref={host} className="h-full min-h-[22rem] overflow-hidden" />
}
