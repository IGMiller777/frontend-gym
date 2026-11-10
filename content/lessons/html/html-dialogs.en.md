## What this lesson covers

Modal windows, dropdown menus, tooltips and accordions used to be written entirely in JavaScript: focus traps, closing on Esc, dimming the background, returning focus, `z-index`. Today the browser does most of it: `<dialog>`, the Popover API, the `inert` attribute and `<details>`. We look at what each one gives and what is still missing. The examples are shown as code: jsdom does not implement these APIs yet.

## dialog

`dialog.showModal()` opens a **modal** window:

- it goes into the top layer above everything, no `z-index` needed;
- the rest of the page becomes inert: it cannot be clicked, reached with Tab, or seen by a screen reader;
- Esc closes it (the `cancel` event);
- focus moves inside, and after closing returns to the element that had focus before opening;
- the backdrop is styled with the `::backdrop` pseudo-element.

```html
<button id="open">Delete project</button>
<dialog id="confirm" aria-labelledby="confirm-title">
  <form method="dialog">
    <h2 id="confirm-title">Delete the project?</h2>
    <p>This cannot be undone.</p>
    <button value="cancel" autofocus>Cancel</button>
    <button value="delete">Delete</button>
  </form>
</dialog>
<script>
  const dialog = document.getElementById("confirm")
  document.getElementById("open").addEventListener("click", () => dialog.showModal())
  dialog.addEventListener("close", () => {
    if (dialog.returnValue === "delete") deleteProject()
  })
</script>
```

A form with `method="dialog"` closes the window without submitting, and the `value` of the pressed button ends up in `dialog.returnValue`. `autofocus` chooses where focus goes: for destructive actions that is usually "Cancel". `dialog.show()` opens a non-modal window, without an inert background.

What `<dialog>` does not do by itself: it does not close on a backdrop click (add a `click` handler on the dialog itself) and does not stop the page behind it from scrolling (`body:has(dialog[open]) { overflow: hidden }`).

## The Popover API

The `popover` attribute turns an element into a pop-up layer: a menu, a tooltip, a notification panel. A button controls it without JavaScript via `popovertarget`.

```html
<button popovertarget="user-menu">Account</button>
<div id="user-menu" popover>
  <a href="/profile">Profile</a>
  <a href="/logout">Log out</a>
</div>
```

- `popover` (same as `popover="auto"`) closes on Esc and on an outside click, and opening another such layer closes the previous one;
- `popover="manual"` closes only from code or a button;
- the layer also goes into the top layer, but the page does **not** become inert: it is not a modal;
- the browser exposes the expanded state of a `popovertarget` button to screen readers by itself.

The Popover API has been supported by all browsers since 2024. CSS Anchor Positioning (`anchor-name`, `position-anchor`) helps tie the layer's position to the button; where it is missing, the position is computed in script.

## inert

The `inert` attribute makes a whole block unavailable: it cannot be clicked, focused or selected, and screen readers do not see it. It suits custom modals, a side panel that slides over the content, and content that is "loading". Unlike `aria-hidden`, `inert` also removes elements from the Tab order.

```js
const main = document.querySelector("main")
drawer.addEventListener("open", () => (main.inert = true))
drawer.addEventListener("close", () => (main.inert = false))
```

## details and summary

`<details>` with `<summary>` is a disclosure block without JavaScript: the heading works with mouse and keyboard, and its state is announced. The `name` attribute groups several `<details>` so that only one is open: an accordion with no code. The `toggle` event reports opening and closing.

```html
<details name="faq" open>
  <summary>How do refunds work?</summary>
  <p>Within 14 days, to the original card.</p>
</details>
<details name="faq">
  <summary>Can I change my plan?</summary>
  <p>Yes, at any time in settings.</p>
</details>
```

## If you build your own window

Sometimes you need your own component (old browsers, a special animation). Then repeat what `<dialog>` gives for free: `role="dialog"`, `aria-modal="true"` and `aria-labelledby`; focus inside on open; `inert` on the rest of the page; Esc closes; after closing, focus returns to the button that opened the window. The last step is the one most often forgotten, and keyboard users end up at the top of the page.

## Key points

- `showModal()` gives the top layer, an inert background, Esc and focus return; `method="dialog"` closes without submitting.
- `<dialog>` does not close on a backdrop click by itself; block background scrolling with CSS.
- `popover` for menus and tooltips: Esc, outside click, `popovertarget` without JS, the background stays usable.
- `inert` removes a block from focus, clicks and the accessibility tree.
- `<details name="…">` gives an accordion without JavaScript.
