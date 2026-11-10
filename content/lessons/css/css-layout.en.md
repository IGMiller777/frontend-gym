## What this lesson covers

Almost every layout today is built from two systems: Flexbox for one axis (a row of buttons, a header, the parts of a card) and Grid for two (a page, a gallery, a multi-column form). We cover the main properties of both, frequent questions ("how do you center", "how does `auto-fit` differ from `auto-fill`", "what does `grid-column: 1 / 3` mean"), subgrid and positioning.

## Flexbox

A `display: flex` container lays its children out along the **main axis** (`flex-direction: row` by default) and aligns them on the **cross axis**:

- `justify-content` distributes space on the main axis: `flex-start`, `center`, `space-between`, `space-evenly`;
- `align-items` aligns on the cross axis: `stretch` (default), `center`, `baseline`;
- `gap` sets spacing between items, without margins;
- `flex-wrap: wrap` allows wrapping onto a new line.

On an item, `flex` is shorthand for `flex-grow flex-shrink flex-basis`:

| Value | Means | When |
|---|---|---|
| `flex: 1` | `1 1 0%`: grows and shrinks, zero basis | equal columns regardless of content |
| `flex: auto` | `1 1 auto`: grows from its own size | items of different widths share the rest |
| `flex: none` | `0 0 auto`: keeps its size | an icon, an avatar |
| default | `0 1 auto`: does not grow but shrinks | normal behaviour |

A trap: a flex item has `min-width: auto`, so long text or a table keeps it from shrinking below its content, and the row overflows. The fix: `min-width: 0` on the item that must shrink (for example, one with `text-overflow: ellipsis`).

## Grid

`display: grid` defines rows and columns. `fr` is a share of the free space.

```css
.page {
  display: grid;
  grid-template-columns: 16rem 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header header"
    "nav    main"
    "footer footer";
  min-block-size: 100dvh;
}
.page > header { grid-area: header; }

.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: 1rem;
}
```

- `repeat(auto-fit, minmax(14rem, 1fr))`: as many columns at least `14rem` wide as fit, without a single media query. `auto-fill` keeps empty columns when there are few items, `auto-fit` collapses them and the items stretch across the full width.
- `grid-column: 1 / 3` names **lines**, not columns: the item spans the columns between lines 1 and 3, that is **two** columns. `1 / -1` means "from the first line to the last", full width. `span 2` takes two columns from the current position.

**Subgrid.** `grid-template-columns: subgrid` on a nested grid takes the parent's columns. That way the headings, texts and buttons in a row of cards line up with each other even when the text lengths differ. Supported by all browsers since 2023.

## Centering

```css
/* both axes, inside a container */
.center { display: grid; place-items: center; }

/* horizontally, a block with a known max width */
.content { max-inline-size: 70rem; margin-inline: auto; }
```

`place-items: center` in grid, or `justify-content: center; align-items: center` in flex, covers nearly every case. The `position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%)` trick remains for overlays on top of content.

## Positioning

| Value | Behaviour |
|---|---|
| `static` | normal flow; `top` and `z-index` have no effect (except `z-index` on flex and grid items) |
| `relative` | offset from its own position, keeps its place in the flow; becomes the anchor for `absolute` children |
| `absolute` | taken out of the flow; positioned from its **containing block**: the nearest ancestor with a non-`static` `position`, or, if there is none, the initial block the size of the viewport |
| `fixed` | positioned from the viewport, does not scroll |
| `sticky` | behaves normally until scrolling reaches the threshold (`top: 0`), then sticks, **but only within its parent** |

Two common traps:

- An ancestor with `transform`, `filter`, `perspective`, `contain: paint` or `will-change: transform` becomes the containing block for both `absolute` and `fixed`. A "fixed" modal inside an animated block stops being tied to the viewport.
- `sticky` does not stick if some ancestor has `overflow: hidden` or `auto`: sticking is relative to the nearest scrolling ancestor. Another cause: the parent has no extra height for the element to "travel" in.

## Key points

- Flex for one axis, Grid for two; spacing with `gap`.
- `flex: 1` splits space evenly, `flex: none` keeps the size; `min-width: 0` cures overflow.
- `repeat(auto-fit, minmax(…, 1fr))` gives an adaptive grid without media queries; `grid-column: 1 / 3` is two columns, lines are counted from 1.
- Subgrid aligns the content of neighbouring cards.
- `absolute` is positioned from its containing block; a `transform` on an ancestor changes it even for `fixed`; `sticky` is limited by its parent and breaks with `overflow` on an ancestor.
