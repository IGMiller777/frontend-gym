## Why it matters

Turning a tree into indented text is what code formatters, server rendering, email generation and DOM debug output do. The task checks a recursive walk with depth and understanding why text must be escaped.

## What to do

`serialize(node, indent = '  ')` turns a `{ tag, children }` tree into an HTML string:

- the opening tag, the children and the closing tag each go on their own line;
- every nesting level adds one `indent`;
- text children are printed as an indented line, with `&`, `<`, `>` escaped;
- lines are joined with `\n`.

## Example

```ts
serialize({ tag: 'ul', children: [{ tag: 'li', children: ['a'] }] })
// <ul>
//   <li>
//     a
//   </li>
// </ul>
```

<!-- solution -->

## Solution idea

A recursive `walk(node, depth)` pushes lines into a shared array: for a string, one line indented with `indent.repeat(depth)`; for an element, the opening tag, then the children at `depth + 1`, then the closing tag. Finally `join('\n')`.

## Pitfalls

- **Escaping.** Text from data inserted as is becomes markup: a `<script>` in a user name turns into XSS. `&` is escaped first, otherwise already escaped sequences get mangled.
- **Concatenating strings in the recursion.** Returning strings from the recursion and re-indenting them is harder and slower than collecting lines in an array.
- **Deep trees.** A very deep tree overflows the stack; then the walk is rewritten with an explicit stack.

## What they ask next

- Add attributes (`attrs`) with quote escaping and void elements (`br`, `img`) without a closing tag.
- Do the reverse: parse a string into a tree.
- Why `textContent` is safer than `innerHTML` and what Trusted Types are.
