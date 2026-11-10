## What this lesson covers

In recent years CSS gained what used to require preprocessors and JavaScript: nesting, typed variables, parent selection, container queries, color mixing, and dark mode in one line. All of it works in every major browser. Here is the essentials to know in interviews and to use in new code.

## Custom properties

CSS variables (`--brand: #7c3aed`) inherit down the tree, can be overridden in any selector, media query or from JavaScript (`el.style.setProperty("--brand", "red")`), and `var(--brand, fallback)` takes a fallback. Unlike Sass variables, they live at runtime: changing the value instantly recolors everything that uses it.

`@property` registers a variable with a type, an initial value and inheritance. The browser can **animate** a typed variable and discards invalid values:

```css
@property --angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}
.spinner {
  background: conic-gradient(from var(--angle), #7c3aed, #db2777, #7c3aed);
  animation: spin 2s linear infinite;
}
@keyframes spin {
  to { --angle: 360deg; }
}
```

## Color and themes

- `color-mix(in oklab, var(--brand) 20%, transparent)` mixes colors right in CSS: tints, translucent variants, hovers without extra variables.
- `oklch()` defines a color in a perceptually uniform space: equal lightness really looks equally bright, so palettes with even contrast are easier to build.
- The `color-scheme: light dark` property tells the browser which schemes the page supports: it colors scrollbars, form controls and the default background itself.
- The `light-dark(#111, #eee)` function returns the first value for the light scheme and the second for the dark one.

```css
:root {
  color-scheme: light dark;
  --bg: light-dark(#ffffff, #0d0a22);
  --ink: light-dark(#17153a, #f4f2ff);
}
```

The `prefers-color-scheme` media feature reports the system setting; `color-scheme` and `light-dark()` build on it, and for a manual theme switch the scheme is set with an attribute on `<html>`.

## Nesting

Native nesting works like Sass: `&` refers to the parent, and nested `@media` and `@container` are allowed.

```css
.card {
  padding: 1rem;
  & .title { font-weight: 600; }
  &:hover { box-shadow: var(--shadow); }
  @media (width >= 48rem) {
    padding: 2rem;
  }
}
```

The difference from Sass: string concatenation like `&__title` does not work; `&` is a selector, not text.

## :has()

`:has()` selects an element by what is inside it or after it: the long-awaited "parent selector".

```css
/* a card with an image gets two columns */
.card:has(> img) { grid-template-columns: 8rem 1fr; }

/* a field row with an invalid input */
.field:has(input:user-invalid) { --border: var(--danger); }

/* no scrolling behind an open modal */
body:has(dialog[open]) { overflow: hidden; }
```

## Container queries

A media query asks about the window width, but a component cares about the width of the place it is put in. Container queries ask about the size of the nearest container ancestor:

```css
.card-list { container-type: inline-size; }

@container (inline-size > 30rem) {
  .card { flex-direction: row; }
}
```

- `container-type: inline-size` makes an element a width container (the default is `normal`: not a size container), `size` covers both dimensions;
- `container-name` lets you target a specific container: `@container sidebar (…)`;
- the `cqi` and `cqb` units are 1% of the container size;
- **style queries** `@container style(--variant: compact)` ask about a container's CSS variable.

## Media queries today

- Range syntax: `@media (48rem <= width < 64rem)` instead of `min-width` and `max-width`.
- Mobile-first: base styles for a narrow screen, `min-width` or `width >=` adds complexity for wide ones.
- User preferences: `prefers-reduced-motion`, `prefers-color-scheme`, `prefers-contrast`, `forced-colors` (Windows high contrast mode).
- Input capabilities: `(hover: hover)` and `(pointer: coarse)` instead of width checks to learn whether there is a mouse.

## Key points

- CSS variables live at runtime; `@property` adds a type and animation.
- `color-mix()`, `oklch()`, `color-scheme` and `light-dark()` cover tints and dark mode without JS.
- Native nesting with `&`; no Sass-style string concatenation.
- `:has()` selects by content; container queries adapt a component to its place, style queries look at variables.
- Media queries with ranges, mobile-first, and `hover` and `pointer` checks.
