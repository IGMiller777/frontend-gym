## What this lesson covers

ARIA (WAI-ARIA, current version 1.2) is a set of attributes that tell assistive technology an element's role, state and relationships when HTML cannot do it by itself: tabs, comboboxes, trees, popup menus. ARIA changes no behaviour: it does not make an element focusable or add key handling. That is why wrong ARIA is worse than none.

## The first rule of ARIA

If a native element with the right semantics and behaviour exists, use it. `<button>` instead of `<div role="button" tabindex="0">` with Enter and Space handlers, `<input type="checkbox">` instead of `role="checkbox"`, `<dialog>` instead of a home-made window. ARIA is for what HTML does not have.

## Roles, states and properties

- A **role** (`role`) says what it is: `tab`, `tablist`, `tabpanel`, `menu`, `combobox`, `switch`, `alert`, `dialog`.
- **States** change as the UI works: `aria-expanded`, `aria-selected`, `aria-checked`, `aria-pressed`, `aria-disabled`, `aria-hidden`.
- **Properties** are mostly constant and describe relationships: `aria-labelledby`, `aria-describedby`, `aria-controls`, `aria-haspopup`, `aria-required`.

A state must match reality: when the menu is open, `aria-expanded="true"`. Your JavaScript keeps them in sync.

```js dom
import { computeAccessibleName, computeAccessibleDescription, getRole } from "dom-accessibility-api"
document.body.innerHTML = `
  <button id="toggle" aria-expanded="false" aria-controls="menu">Account</button>
  <ul id="menu" hidden><li><a href="/profile">Profile</a></li></ul>
  <label for="pass">Password</label>
  <input id="pass" type="password" aria-describedby="pass-hint" aria-invalid="true">
  <p id="pass-hint">At least 12 characters</p>`
const toggle = document.querySelector("#toggle")
const menu = document.querySelector("#menu")
toggle.addEventListener("click", () => {
  const open = toggle.getAttribute("aria-expanded") === "true"
  toggle.setAttribute("aria-expanded", String(!open))
  menu.hidden = open
})
toggle.click()
console.log(getRole(toggle), computeAccessibleName(toggle), "expanded:", toggle.getAttribute("aria-expanded"), "menu hidden:", menu.hidden)
const pass = document.querySelector("#pass")
console.log(computeAccessibleName(pass), "|", computeAccessibleDescription(pass))
```

```output
button Account expanded: true menu hidden: false
Password | At least 12 characters
```

## Ready-made patterns

For complex widgets you do not invent your own keyboard scheme: the W3C **ARIA Authoring Practices Guide** (APG) describes it. Tabs, for example:

- a `role="tablist"` container, `role="tab"` buttons with `aria-selected` and `aria-controls`, `role="tabpanel"` panels with `aria-labelledby`;
- Tab reaches only the active tab, Left and Right arrows switch tabs (the so-called roving tabindex: the active one has `tabindex="0"`, the rest `-1`);
- Home and End go to the first and last tab.

In framework apps these patterns usually come from accessible component libraries (Radix, React Aria, Angular CDK, Headless UI) rather than being written from scratch.

## Live regions

Changes that happen without moving focus (saved, upload failed, 5 results found) go unnoticed by a screen reader. Live regions exist for that:

- `role="status"` (the same as `aria-live="polite"`): read it when the user is idle;
- `role="alert"` (`aria-live="assertive"`): interrupt and read at once, only for urgent things.

The live region container must **already exist** in the DOM before its text changes: if you insert it together with the message, many screen readers say nothing.

```html
<div role="status" class="visually-hidden" id="announcer"></div>
<script>
  function announce(text) {
    document.getElementById("announcer").textContent = text
  }
</script>
```

## aria-hidden and its traps

`aria-hidden="true"` removes an element and its contents from the accessibility tree, but **not** from the Tab order or the page. If there are focusable elements inside, the keyboard lands on a button the screen reader says nothing about. That is an accessibility bug. To hide a whole part of the page (the background behind a modal), use the `inert` attribute: it removes elements from the accessibility tree, from focus and from clicks.

| Need | How |
|---|---|
| Hide from everyone | `hidden` or `display: none` |
| Hide only visually | a `visually-hidden` class |
| Hide only from screen readers (a decorative icon) | `aria-hidden="true"` on a non-focusable element |
| Disable a whole block (behind a modal) | `inert` |

## Key points

- Native HTML first; ARIA only for what HTML lacks.
- ARIA adds no behaviour: your code handles focus and keys and keeps states in sync.
- Build complex widgets from APG patterns or take them from accessible component libraries.
- `status` and `alert` live regions must exist before the message appears.
- `aria-hidden` does not remove an element from focus; use `inert` for the background behind a modal.
