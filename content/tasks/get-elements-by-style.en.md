## Why it matters

Finding elements by style is needed in tools (contrast checks, font audits, finding hidden elements) and tests. The task checks the difference between the inline style (`el.style`) and the computed one (`getComputedStyle`) and the ability to compare CSS values written in different ways.

## What to do

`getElementsByStyle(root, property, value)` returns the descendants of `root` whose **computed** value of `property` equals `value`:

- inline styles, stylesheet rules and inheritance all count;
- values are compared in normalized form: `red` matches `rgb(255, 0, 0)`, `bold` matches `700`;
- `root` itself is excluded, document order.

## Example

```ts
// <div style="color: green"><span></span></div>
getElementsByStyle(root, 'color', 'green') // [div, span]: color is inherited
```

<!-- solution -->

## Solution idea

To compare values in the same form, run the wanted value through the same machinery: create a temporary element, set `property: value` on it, add it to the document, read the computed value and remove the element. Then walk the descendants and compare `getComputedStyle(el).getPropertyValue(property)` with the normalized value.

## Pitfalls

- **`el.style` sees only the `style` attribute.** Rules from CSS and inherited values are not in it.
- **Comparing strings as is.** The browser returns colors as `rgb()`, weights as numbers, sizes in `px`; `'red' === 'rgb(255, 0, 0)'` is false.
- **An element outside the document.** A detached element has no computed styles, so the temporary element is added to the document.
- **Performance.** `getComputedStyle` for thousands of elements is expensive: it can force a style recalculation. Real tools read in batches and do not interleave reads with writes.

## What they ask next

- How to find invisible elements: `display: none`, `visibility: hidden`, zero size, `opacity: 0`.
- Why reading styles after a write forces a recalculation (layout thrashing).
- How to get the styles of a pseudo-element (`getComputedStyle(el, '::before')`).
