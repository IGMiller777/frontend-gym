/** Plain text with `inline code` segments. Lightweight on purpose: full markdown arrives with lessons. */
export function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]+`)/g).map((part, i) =>
        part.startsWith('`') && part.endsWith('`') && part.length > 1 ? (
          <code key={i} className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-[0.88em] text-ink">
            {part.slice(1, -1)}
          </code>
        ) : (
          part
        ),
      )}
    </>
  )
}
