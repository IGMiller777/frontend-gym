## What this lesson covers

Events are how a page learns about what the user and the browser do. Nearly every interview asks about them: in what order handlers run, how `preventDefault` differs from `stopPropagation`, what delegation is and why `passive` exists. Every example runs in jsdom and shows the real order of calls.

## Three phases

An event on an element travels from `window` down to the target and back:

1. **Capture**: from `window` down to the target's parent. Handlers registered with `{ capture: true }` (or `true` as the third argument) run here.
2. **Target**: handlers on the element itself.
3. **Bubble**: from the target up to `window`. Ordinary handlers run here.

```js dom
document.body.innerHTML = `<div id="outer"><button id="btn">Save</button></div>`
const outer = document.querySelector("#outer")
const btn = document.querySelector("#btn")
const log = []
outer.addEventListener("click", () => log.push("outer capture"), { capture: true })
outer.addEventListener("click", () => log.push("outer bubble"))
btn.addEventListener("click", (e) => log.push(`button, phase ${e.eventPhase}`))
btn.click()
console.log(log.join(" → "))
```

```output
outer capture → button, phase 2 → outer bubble
```

Not every event bubbles: `focus` and `blur`, `mouseenter` and `mouseleave`, an image's `load` stay on the element. For delegating focus there are the bubbling `focusin` and `focusout`.

## target and currentTarget

`event.target` is the element where the event originated (the deepest one). `event.currentTarget` is the element whose handler is running now. **Delegation** is built on this: one handler on a container instead of one on every list item. It also works for items added later.

```js dom
document.body.innerHTML = `<ul id="todos">
  <li data-id="1"><span>Buy milk</span> <button class="remove">×</button></li>
  <li data-id="2"><span>Call Ann</span> <button class="remove">×</button></li>
</ul>`
const list = document.querySelector("#todos")
list.addEventListener("click", (e) => {
  const button = e.target.closest(".remove")
  if (!button || !list.contains(button)) return
  console.log("remove", button.closest("li").dataset.id, "| handler on", e.currentTarget.id)
})
list.querySelectorAll(".remove")[1].click()
```

```output
remove 2 | handler on todos
```

`closest` is needed because the click may land on something nested inside the button, such as an icon.

## preventDefault, stopPropagation, stopImmediatePropagation

| Method | What it stops |
|---|---|
| `preventDefault()` | the browser's default action: following a link, submitting a form, the context menu. Propagation continues |
| `stopPropagation()` | the event's further path through the tree. Other handlers on the current element still run |
| `stopImmediatePropagation()` | the path through the tree and every following handler on the current element |

```js dom
document.body.innerHTML = `<div id="outer"><a id="link" href="/next">Next</a></div>`
const outer = document.querySelector("#outer")
const link = document.querySelector("#link")
const log = []
outer.addEventListener("click", () => log.push("outer"))
link.addEventListener("click", (e) => {
  e.preventDefault()
  log.push("first")
})
link.addEventListener("click", (e) => {
  e.stopImmediatePropagation()
  log.push("second")
})
link.addEventListener("click", () => log.push("third"))
const event = new MouseEvent("click", { bubbles: true, cancelable: true })
const notCancelled = link.dispatchEvent(event)
console.log(log.join(", "), "| defaultPrevented:", event.defaultPrevented, "| dispatch returned:", notCancelled)
```

```output
first, second | defaultPrevented: true | dispatch returned: false
```

`dispatchEvent` returns `false` if some handler cancelled the default action. That is how a component learns a listener asked it not to perform its default behaviour.

Returning `false` from a handler assigned as a property (`el.onclick = …`) or an attribute cancels only the default action and does **not** stop bubbling. With `addEventListener` the return value is ignored. Only jQuery stops both bubbling and the default action this way.

```js dom
document.body.innerHTML = `<div id="outer"><a id="link" href="/next">Next</a></div>`
const log = []
document.querySelector("#outer").addEventListener("click", () => log.push("outer still got it"))
const link = document.querySelector("#link")
link.onclick = () => false
const event = new MouseEvent("click", { bubbles: true, cancelable: true })
link.dispatchEvent(event)
console.log(event.defaultPrevented, log.join(""))
```

```output
true outer still got it
```

## addEventListener options

- `once: true`: the handler is removed after its first call.
- `signal`: remove the handler via `AbortController` (see [the cancellation lesson](/learn/async-cancellation)).
- `passive: true`: a promise not to call `preventDefault`. For `touchstart`, `touchmove` and `wheel` the browser then scrolls at once instead of waiting for the handler. On `window`, `document` and `body` browsers make these handlers passive by default; calling `preventDefault` in a passive handler is ignored.

## Custom events

`new CustomEvent(type, { detail, bubbles, composed })` creates an event carrying data in `detail`. By default custom events do **not** bubble: you need `bubbles: true`. For an event to leave a component's Shadow DOM, you also need `composed: true` (more in [the Web Components lesson](/learn/browser-components)).

```js dom
document.body.innerHTML = `<section id="app"><div id="cart"></div></section>`
const app = document.querySelector("#app")
app.addEventListener("cart:add", (e) => console.log("added", e.detail.sku, "x", e.detail.qty))
const cart = document.querySelector("#cart")
cart.dispatchEvent(new CustomEvent("cart:add", { detail: { sku: "A1", qty: 2 } }))
cart.dispatchEvent(new CustomEvent("cart:add", { detail: { sku: "B2", qty: 1 }, bubbles: true }))
```

```output
added B2 x 1
```

## Pointer Events

Pointer Events unify mouse, touch and pen into one model: `pointerdown`, `pointermove`, `pointerup`, with `pointerType`, `pointerId` and `pressure` on the event. For dragging, `element.setPointerCapture(e.pointerId)` keeps the event stream on the element even when the pointer leaves its bounds.

```js
handle.addEventListener("pointerdown", (e) => {
  handle.setPointerCapture(e.pointerId)
  start = { x: e.clientX, y: e.clientY }
})
handle.addEventListener("pointermove", (e) => {
  if (handle.hasPointerCapture(e.pointerId)) move(e.clientX - start.x, e.clientY - start.y)
})
```

Scrolling and pinch-zoom gestures are disabled not with `preventDefault` in a handler but with CSS: `touch-action: none` on the draggable element.

## Key points

- Phases: capture, target, bubble; ordinary handlers run while bubbling.
- `target` is where it started, `currentTarget` is where the handler is; delegate with `closest`.
- `preventDefault` is about the browser's action, `stopPropagation` about the tree, `stopImmediatePropagation` also about neighbouring handlers.
- `return false` in `onclick` cancels only the default action.
- `passive` speeds up scrolling; custom events do not bubble without `bubbles: true`.
- Pointer Events instead of separate mouse and touch, `setPointerCapture` for dragging, `touch-action` for gestures.
