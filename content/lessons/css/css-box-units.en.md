## What this lesson covers

Every element is a rectangle made of content, padding, border and margin. How these sizes are computed and in which units they are set explains "extra" pixels, layouts that jump on phones, and font scaling. We cover the box model, `box-sizing`, margin collapsing, logical properties, and units from `rem` to `dvh` and `cqi`.

## The box model and box-sizing

From the outside in: `margin` → `border` → `padding` → content. By default (`box-sizing: content-box`) `width` sets only the content width, so the final width is larger: `width + padding + border`. With `box-sizing: border-box`, `width` includes `padding` and `border`, so a block with `width: 100%` and padding does not overflow its parent. Almost every project turns it on globally:

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}
```

## Margin collapsing

Vertical `margin`s of adjacent blocks in normal flow **collapse**: between paragraphs with `margin-bottom: 24px` and `margin-top: 16px` the gap is 24 pixels, not 40. Likewise the first child's margin can "leak" out of its parent. There is no collapsing for flex and grid items, for elements with `display: flow-root`, or for a parent with `padding` or `border`. Current practice: set spacing with `gap` in flex and grid, and collapsing never comes up.

## Logical properties

Physical `left`, `right`, `top`, `bottom` are tied to the screen; logical ones follow the writing direction: `inline` is the direction of a line (left to right in English, right to left in Arabic), `block` the direction blocks follow.

| Physical | Logical |
|---|---|
| `margin-left`, `margin-right` | `margin-inline-start`, `margin-inline-end` |
| `padding-top`, `padding-bottom` | `padding-block` |
| `width`, `height` | `inline-size`, `block-size` |
| `left: 0; right: 0; top: 0; bottom: 0` | `inset: 0` |

With logical properties, the layout mirrors correctly for right-to-left languages without separate styles.

## Length units

| Unit | Relative to | Where to use it |
|---|---|---|
| `px` | the reference pixel (1/96 inch) | borders, shadows, small details |
| `rem` | the `font-size` of the root `<html>` | font sizes, spacing: respects the user's font size setting |
| `em` | the element's **own** `font-size`; for the `font-size` property, the parent's | spacing that grows with the component's text |
| `%` | depends on the property: for `width` and even for vertical `padding` and `margin` it is the container width, for `height` the container height | flexible sizes |
| `ch` | the width of the "0" character | line length of text: `max-inline-size: 65ch` |
| `lh`, `rlh` | the line height of the element or the root | vertical rhythm |
| `vw`, `vh` | 1% of the viewport | full-screen blocks on desktop |
| `svh`, `lvh`, `dvh` | the small, large and current viewport on mobile | full-screen blocks on phones |
| `cqi`, `cqb` | 1% of the container from container queries | sizes inside an adaptive component |

A common `em` mistake: nested `font-size: 1.2em` values multiply, and text deep inside keeps growing. That is why font sizes are set in `rem`, and `em` is kept for spacing that should grow with the text.

**Mobile `vh`.** On a phone the browser toolbar appears and hides while scrolling, and `100vh` equals the viewport height **without** the toolbar: the bottom of the block goes under it. `100svh` is the height with the toolbar visible (the content is guaranteed to be visible), `100lvh` with it hidden, and `100dvh` changes along with the toolbar. For a full-screen first screen use `100svh` or `100dvh`.

## Sizing functions

- `min(100%, 70rem)`, `max(…)`, `clamp(1rem, 2.5vw + 0.5rem, 2rem)`: sizes without media queries. Combine `clamp` for fluid type with `rem`, or zooming the page will not enlarge the text.
- `calc(100% - var(--sidebar))`: arithmetic across units.
- `aspect-ratio: 16 / 9`: block proportions without the old `padding-top: 56.25%` trick.

## Key points

- `box-sizing: border-box` puts `padding` and `border` inside `width`; set it globally.
- Vertical `margin`s in flow collapse; `gap` in flex and grid avoids it.
- Logical properties (`margin-inline`, `inset`, `inline-size`) also work for right-to-left writing.
- `rem` for fonts, `em` relative to the element's own font, `%` depends on the property.
- On mobile use `svh`, `dvh` or `lvh` instead of `100vh`; `cqi` for sizes inside a container.
