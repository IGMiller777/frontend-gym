## What this lesson covers

"I set `z-index: 9999` and the modal is still under the header" is a classic, and the cause is almost always **stacking contexts**. We cover how the browser decides what to paint on top, what creates a stacking context, typical breakages, and the modern way out: the top layer used by `<dialog>` and popovers.

## z-index works inside a context

`z-index` orders elements only within **one** stacking context. A context behaves like a single layer: everything inside is painted together with it, and no child `z-index` lifts it above the parent's sibling.

```html
<header class="header">…</header>
<main class="page">
  <div class="modal">…</div>
</main>
```

```css
.header {
  position: sticky;
  top: 0;
  z-index: 10;
}
.page {
  position: relative;
  z-index: 1; /* creates a stacking context with level 1 */
}
.modal {
  position: fixed;
  z-index: 9999; /* compared only inside .page, so it stays below the header (10 > 1) */
}
```

`z-index` applies to elements with a non-`static` `position`, and also to **flex and grid items** without any `position`.

## What creates a stacking context

- the document root (`<html>`);
- `position: absolute` or `relative` with a `z-index` other than `auto`;
- `position: fixed` and `sticky`, always;
- flex and grid items with a `z-index` other than `auto`;
- `opacity` below 1;
- `transform`, `filter`, `backdrop-filter`, `perspective`, `clip-path`, `mask` with any value other than `none`;
- `mix-blend-mode` other than `normal`;
- `isolation: isolate`;
- `contain: layout` or `paint` (and `strict`, `content`, which include them);
- `will-change` naming any of these properties, even before the property itself is set;
- elements in the top layer (a `<dialog>` opened with `showModal()`, popovers).

Hence typical breakages: a smooth `opacity` animation on a wrapper, or a `transform` added for GPU acceleration, suddenly changes the stacking of all its content.

## Order inside a context

Inside one context, elements are painted in layers from bottom to top:

1. the background and border of the context root itself;
2. children with a **negative** `z-index`;
3. normal blocks in the flow;
4. floats;
5. inline content;
6. positioned elements with `z-index: auto` or `0`, in DOM order;
7. children with a positive `z-index`.

With equal `z-index`, the later one in the DOM is on top. A negative `z-index` hides an element under the parent's background only if the parent does not create a context itself: otherwise the element ends up above its background but below its content. That is how decorative backgrounds are made with `::before`.

## How to fix it

- Find the nearest ancestor that creates a context (the Layers panel in Chrome DevTools helps) and raise `z-index` **at its level**, not on the child.
- Do not create contexts by accident: remove stray `will-change`, `transform: translateZ(0)` and `z-index` on wrappers.
- `isolation: isolate` on a component creates a context explicitly without changing anything visually: the component's internal `z-index` values stop clashing with the page.
- Keep a small scale of values in variables (`--z-header: 10; --z-dropdown: 20; --z-toast: 30`) instead of a race to `9999`.

## The top layer

Modals, menus and tooltips no longer need to be moved to the end of `<body>` with a hand-picked `z-index`. A `<dialog>` opened with `showModal()` and elements with the `popover` attribute go into the **top layer**: it is painted above the whole document, regardless of stacking contexts and `overflow: hidden` on ancestors. Portals in frameworks (`createPortal` in React, `Teleport` in Vue, the CDK Overlay in Angular) solved the same problem before the top layer existed.

## Key points

- `z-index` is compared only inside one stacking context; a context behaves like a single layer.
- `z-index` works on positioned elements and on flex and grid items.
- Contexts are created by `opacity < 1`, `transform`, `filter`, `isolation`, `will-change`, `fixed` and `sticky`, `z-index` on positioned elements, and more.
- Fix at the level of the nearest context; `isolation: isolate` isolates a component.
- Put modals and popovers in the top layer with `<dialog>` and `popover`.
