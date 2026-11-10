## What this lesson covers

Once there are many styles, the main question is no longer "how do I build it" but "how do I not break the neighbours". We cover approaches to organizing CSS (naming conventions, CSS Modules, CSS-in-JS, utility-first), Tailwind CSS v4 and how it differs from v3, design tokens, and what really affects CSS performance.

## Approaches

| Approach | How it isolates styles | Pros | Cons |
|---|---|---|---|
| BEM and other conventions | by naming discipline: `.card__title--active` | simple, no tooling | relies on agreements, long names |
| CSS Modules | the bundler renames classes to unique ones | plain CSS, isolation without a runtime | shared styles and themes need variables |
| Runtime CSS-in-JS (styled-components, Emotion) | generates styles from JS at runtime | dynamic styles from props, everything in the component | runtime cost, trouble with React Server Components; the styled-components authors announced maintenance mode |
| Zero-runtime CSS-in-JS (vanilla-extract, Panda, StyleX) | styles from TS/JS at build time | typing, no runtime cost | yet another build tool |
| Utility-first (Tailwind) | small classes, one per property | fast prototyping, no dead CSS, the design system lives in config | long class lists, you must learn the utilities |
| Native features | `@layer`, `@scope`, nesting | no tooling, standard | fewer ready-made conventions |

A good interview answer is not "X is the best" but "what we pay": runtime, CSS size, theming, compatibility with SSR and server components.

## Tailwind CSS v4

Tailwind v4 (2025) is a rewrite, and much of what articles say about v3 no longer holds:

- **One-line setup**: `@import "tailwindcss";` instead of the `@tailwind base; @tailwind components; @tailwind utilities;` directives.
- **Configuration in CSS**: tokens go into `@theme`, not `tailwind.config.js`. A JS config is supported only when loaded explicitly with `@config`.
- **Finds files itself**: no `content` list; sources are scanned automatically, and `@source` adds extra paths.
- **Generates only what is used**: PurgeCSS is not needed in v4, and already was not in v3 with JIT.
- **Native CSS inside**: cascade layers `theme`, `base`, `components`, `utilities`, variables for every token, `color-mix()`, colors in `oklch`. Hence the browser requirements: Safari 16.4, Chrome 111, Firefox 128.
- **Syntax**: the `!` important modifier goes at the end of the class (`bg-red-500!`), custom utilities are declared with `@utility`, custom variants with `@custom-variant`.

```css
@import "tailwindcss";

@theme {
  --color-brand: oklch(0.6 0.25 295);
  --font-display: "Unbounded", sans-serif;
  --breakpoint-3xl: 120rem;
}

@custom-variant dark (&:where(.dark, .dark *));

@utility text-balance-safe {
  text-wrap: balance;
}
```

Every token in `@theme` becomes both a CSS variable (`var(--color-brand)`) and utilities (`bg-brand`, `text-brand`). This trainer itself is built on that scheme.

## Design tokens

Tokens are the named values of a design system: colors, spacing, radii, shadows, fonts, animation durations. Usually there are two levels:

- **base**: palettes and scales (`--violet-600`, `--space-4`);
- **semantic**: the role in the interface (`--color-surface`, `--color-text-muted`, `--radius-card`).

Components use only semantic tokens. Then a dark theme or a rebrand means swapping semantic token values, not editing every component. Tokens are stored in CSS variables and exported automatically from design tools (Figma Variables).

## CSS performance

- **CSS blocks rendering.** The less CSS is needed for the first screen, the earlier FCP happens. Splitting by route (bundlers do it together with JS), inlining critical CSS and removing dead styles all help.
- **Selectors are almost never the problem.** Engines have optimized selector matching; "deep selectors are slow" is usually a myth. Problems appear with tens of thousands of elements and frequent style changes (a class change on `<body>`, switching themes, `:has()` high up the tree).
- **Expensive properties.** Large `box-shadow`, `filter: blur()` and `backdrop-filter` over big areas are costly to repaint, especially when animated.
- **Animate** `transform` and `opacity`; use `will-change` sparingly (more in [the repainting lesson](/learn/browser-layout-paint)).
- **Measure, do not guess**: the Performance tab in Chrome DevTools shows Recalculate Style and Layout time, and the "Enable CSS selector stats" checkbox in its settings shows which selectors cost how much.

## Key points

- Choose an approach by its cost: runtime, CSS size, theming, compatibility with SSR and server components.
- Tailwind v4: `@import "tailwindcss"`, tokens in `@theme`, automatic source detection, `!` at the end of the class, `@utility` and `@custom-variant`; no PurgeCSS needed.
- Two levels of tokens: base and semantic; components use semantic ones.
- CSS blocks rendering: less CSS for the first screen; selectors are rarely the bottleneck, measure in DevTools.
