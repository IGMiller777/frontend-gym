## What this lesson covers

Accessibility (a11y) means people with different abilities can use the interface: with a keyboard instead of a mouse, with a screen reader, with low vision, with enlarged text, with sensitivity to motion. For many products it is also a legal requirement: in the EU the European Accessibility Act applies from 28 June 2025. Here are the basics: the WCAG 2.2 standard, accessible names, keyboard and focus, contrast, motion, and page language.

## WCAG 2.2

WCAG rests on four principles: content is **perceivable**, the interface is **operable**, everything is **understandable**, and **robust** (works with assistive technology). The usual target is level AA. Version 2.2 (2023) added, among others, these AA requirements:

- focus must not be fully hidden by a sticky header or banner (Focus Not Obscured);
- every drag action must have an alternative without dragging (Dragging Movements);
- a clickable target is at least 24×24 CSS pixels or has enough spacing (Target Size);
- login without memory puzzles: pasting passwords and password managers must work (Accessible Authentication).

## The accessible name

Every interactive element must have an **accessible name**: what the screen reader says, and what a test uses to find it with `getByRole("button", { name: "Save" })`. The sources of the name by priority: `aria-labelledby`, `aria-label`, then native ones (a `<label>` for a field, the text of a button or link, an image's `alt`, `title` as a last resort).

```js dom
import { computeAccessibleName } from "dom-accessibility-api"
document.body.innerHTML = `
  <button id="icon"><svg aria-hidden="true"></svg></button>
  <button id="close" aria-label="Close dialog">×</button>
  <label for="mail">Email</label><input id="mail" type="email">
  <h2 id="billing-title">Billing</h2><section id="billing" aria-labelledby="billing-title"></section>
  <a id="more" href="/post/1">Read more <span class="visually-hidden">about pricing</span></a>`
for (const id of ["icon", "close", "mail", "billing", "more"]) {
  console.log(id.padEnd(8), JSON.stringify(computeAccessibleName(document.getElementById(id))))
}
```

```output
icon     ""
close    "Close dialog"
mail     "Email"
billing  "Billing"
more     "Read more about pricing"
```

The icon-only button ended up without a name: the screen reader will just say "button". Browsers use a `placeholder` as a fallback name for an unlabeled field, but it disappears while typing and is not always announced, so a `<label>` is still needed. Visually hidden text (a `visually-hidden` class with `clip` and a 1-pixel size, but not `display: none`) clarifies links like "Read more".

## Alternative text

- An informative image: `alt` describes the meaning, not the looks: "Chart: revenue grew 20%", not "chart".
- A decorative one: `alt=""` (empty but present): the screen reader skips it. Without an `alt` attribute it may read the file name.
- An image that is a link or button: `alt` describes the action: "Home", not "logo".

## Keyboard and focus

Everything doable with a mouse must be doable with a keyboard: Tab and Shift+Tab through interactive elements, Enter and Space to activate, arrows inside composite widgets, Esc to close.

- Tab order follows the DOM. If the visual order differs (CSS `order`, `position`), keyboard focus jumps around.
- `tabindex="0"` adds an element to the common order at its DOM position, `tabindex="-1"` allows focusing it from code with `focus()`. Positive values break the order for the whole page and are not used.
- Focus must be **visible**. `outline: none` without a replacement leaves keyboard users lost. `:focus-visible` shows the ring on keyboard navigation and hides it on mouse clicks.
- A "Skip to content" link at the start of the page lets users skip repeated navigation.

```css
:focus-visible {
  outline: 3px solid var(--ring);
  outline-offset: 2px;
}
.skip-link:not(:focus) {
  position: absolute;
  clip-path: inset(50%);
  width: 1px;
  height: 1px;
  overflow: hidden;
}
```

## Contrast, size, motion, language

- Text contrast at least **4.5:1**, large text (24 px, or 18.5 px bold) **3:1**, field borders and icons **3:1** too.
- Color must not be the only cue: show an error with text, not just a red border.
- The page must work at 200% zoom and at 320 px width without horizontal scrolling. Set font sizes in `rem` to respect user settings.
- `@media (prefers-reduced-motion: reduce)` turns off or simplifies animations for people who get motion sickness.
- `<html lang="en">` and `lang` on fragments in other languages: the screen reader picks the right pronunciation.

## How to check

Automated tools (axe DevTools, Lighthouse, `jest-axe` and `@axe-core/playwright` in tests) find only part of the problems: missing names, contrast, wrong attributes. They cannot see logic. So also go through the page by keyboard without a mouse, and listen to key flows with a screen reader (VoiceOver on macOS and iOS, NVDA on Windows, TalkBack on Android). In tests, find components by role and name (`getByRole`): the test also checks that the element has an accessible name.

## Key points

- The target is usually WCAG 2.2 AA; in the EU it is a legal requirement since June 2025.
- Every interactive element has an accessible name; icons need an `aria-label` or hidden text.
- `alt` conveys meaning; decorative images get `alt=""`.
- Everything works by keyboard, focus is visible (`:focus-visible`), Tab order matches the visual one, no positive `tabindex`.
- Contrast 4.5:1 for text and 3:1 for large text and controls; respect `prefers-reduced-motion` and `lang`.
