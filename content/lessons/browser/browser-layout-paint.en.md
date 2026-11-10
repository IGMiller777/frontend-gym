## What this lesson covers

How smooth an interface feels depends on which rendering steps the browser has to repeat after a change. We look at what triggers layout and paint, why reading a size after writing a style can be expensive, how to animate without jank, and which CSS properties help the browser. This continues [the lesson on the path from HTML to pixels](/learn/browser-rendering).

## Which steps repeat

After a style change the browser recalculates styles and then repeats only the steps it needs:

| What changes | Steps | Example properties |
|---|---|---|
| Geometry | style → layout → paint → composite | `width`, `height`, `margin`, `top`, `font-size`, adding elements |
| Appearance only | style → paint → composite | `color`, `background`, `box-shadow`, `border-color` |
| A whole layer | style → composite | `transform`, `opacity` on an element with its own layer |

Layout is the most expensive: changing one box can move its neighbours and recompute much of the page. That is why animations use `transform` and `opacity`: the browser can run them on the compositor thread even while the main thread is busy.

## Forced synchronous layout

Normally the browser postpones recalculation until the next frame and does it once. But if after a style change the code **reads** geometry (`offsetHeight`, `getBoundingClientRect()`, `scrollTop`, `getComputedStyle`), the browser must compute layout right away to return a correct value. That is a forced synchronous layout.

Alternating writes and reads in a loop is called **layout thrashing**: layout is computed on every iteration.

```js
// ❌ write, read, write, read…: one forced layout per item
for (const card of cards) {
  card.style.height = "auto"
  card.style.height = card.scrollHeight + "px"
}

// ✅ read everything first, then write everything: one layout
const heights = cards.map((card) => card.scrollHeight)
cards.forEach((card, i) => {
  card.style.height = heights[i] + "px"
})
```

Writing a style does not run layout by itself, it only marks layout as stale. The **next read** is what costs. In DevTools this shows up on the Performance tab as purple Layout blocks with a "Forced reflow" warning.

## Animating without jank

- Animate `transform` and `opacity`, not `top`, `left` or `width`.
- For JavaScript animations use `requestAnimationFrame`, and batch DOM changes into one frame.
- `will-change: transform` moves an element to its own layer ahead of time. Use it sparingly and temporarily: every layer takes GPU memory, and hundreds of layers slow the page down. A common myth: `transform: translateZ(0)` "turns on the GPU". It also just creates a layer.

```css
.drawer {
  transform: translateX(-100%);
  transition: transform 200ms ease-out;
}
.drawer.open {
  transform: translateX(0);
}
```

## Properties that save work

- `contain: layout paint` says changes inside the element do not affect the rest of the page, so the browser limits recalculation.
- `content-visibility: auto` skips layout and paint for off-screen blocks until they are scrolled to. Pair it with `contain-intrinsic-size` so the scrollbar does not jump.
- `visibility: hidden` keeps the element's space and leaves its neighbours' layout alone, while `display: none` removes the box from layout, so neighbours move when it is shown.

## Layout shifts

If an element appears or changes size after the first paint, the content below it jumps. That hurts CLS. Main causes and fixes:

- images and videos without dimensions: set `width` and `height` or `aspect-ratio`;
- ads and embeds: reserve their space in advance;
- web fonts that change text metrics: `font-display: swap` together with a tuned fallback font (`size-adjust`);
- banners inserted above the content: show them on top or in space reserved beforehand.

## Key points

- Geometry triggers layout, appearance only paint, `transform` and `opacity` may need only compositing.
- Reading geometry after writing a style forces a synchronous layout; group reads apart from writes.
- Animate `transform` and `opacity` with CSS or `requestAnimationFrame`; use `will-change` sparingly.
- `contain` and `content-visibility` limit recalculation; media dimensions and reserved space prevent shifts.
