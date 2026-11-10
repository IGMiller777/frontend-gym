## What this lesson covers

Web Components are a set of browser standards for your own elements: Custom Elements (your own tag with behaviour), Shadow DOM (an isolated subtree with its own styles) and `<template>` with slots. Design systems that work in any framework and embeddable widgets are built on them. The examples run in jsdom: it supports Custom Elements, Shadow DOM and events, but does not apply styles.

## Custom Elements

A custom element is a class extending `HTMLElement`, registered under a name with a hyphen. The browser calls lifecycle methods: `connectedCallback` on insertion into the document, `disconnectedCallback` on removal, `attributeChangedCallback` for attributes listed in `observedAttributes`.

```js dom
class UserBadge extends HTMLElement {
  static observedAttributes = ["name"]
  connectedCallback() {
    this.render()
  }
  attributeChangedCallback() {
    this.render()
  }
  render() {
    this.textContent = `👤 ${this.getAttribute("name") ?? "guest"}`
  }
}
customElements.define("user-badge", UserBadge)

document.body.innerHTML = `<user-badge name="Ada"></user-badge>`
const badge = document.querySelector("user-badge")
console.log(badge.textContent)
badge.setAttribute("name", "Linus")
console.log(badge.textContent, badge instanceof UserBadge)
```

```output
👤 Ada
👤 Linus true
```

## Shadow DOM

`this.attachShadow({ mode })` creates a **shadow root**: a subtree that an ordinary outside `querySelector` cannot see, with its own styles. The content written inside the tag on the page is called the light DOM: it stays in the document and is shown inside the shadow tree through `<slot>`.

```js dom
class FancyCard extends HTMLElement {
  constructor() {
    super()
    const root = this.attachShadow({ mode: "open" })
    root.innerHTML = `<style>.title { font-weight: bold }</style>
      <h2 class="title"><slot name="title">Untitled</slot></h2>
      <div class="body"><slot></slot></div>`
  }
}
customElements.define("fancy-card", FancyCard)

document.body.innerHTML = `<fancy-card><span slot="title">News</span><p>Body text</p></fancy-card>`
const card = document.querySelector("fancy-card")
console.log(document.querySelector(".title"), card.shadowRoot.querySelector(".title") !== null)
const [titleSlot, defaultSlot] = card.shadowRoot.querySelectorAll("slot")
console.log(titleSlot.assignedElements()[0].textContent, defaultSlot.assignedElements()[0].tagName)
```

```output
null true
News P
```

## open and closed

With `mode: "open"` the shadow root is reachable from outside via `el.shadowRoot`. With `mode: "closed"` the `shadowRoot` property is `null`, but the component's author keeps access: `attachShadow` returns the root, which is stored in a private field. This protects against accidental interference, not a security boundary: code in the same window can still intercept `attachShadow`.

```js dom
class SecretBox extends HTMLElement {
  #root = this.attachShadow({ mode: "closed" })
  connectedCallback() {
    this.#root.innerHTML = `<p>inside</p>`
  }
  get insideText() {
    return this.#root.querySelector("p").textContent
  }
}
customElements.define("secret-box", SecretBox)
document.body.innerHTML = `<secret-box></secret-box>`
const box = document.querySelector("secret-box")
console.log(box.shadowRoot, box.insideText)
```

```output
null inside
```

## Styles across the boundary

- Page styles do not reach into the shadow tree, and component styles do not leak out.
- But **inherited** properties (`color`, `font-family`, `line-height`) pass inside through inheritance from the host.
- **CSS custom properties** (`--brand-color`) pass too: that is the main way to theme components.
- `:host` styles the element itself from inside, `::slotted(...)` the top level of slotted content, and `::part(name)` lets the page style elements marked with `part="name"`.

## Events across the boundary

An event from inside the shadow tree is **retargeted** when it leaves it: for outside listeners `event.target` is the host element, and the internals stay hidden. Built-in input events (`click`, `input`, `keydown`) cross the boundary on their own. Custom events leave only if created with `composed: true`; `event.composedPath()` shows the whole path.

```js dom
class LikeButton extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: "open" }).innerHTML = `<button>♥</button>`
  }
}
customElements.define("like-button", LikeButton)
document.body.innerHTML = `<like-button></like-button>`
const host = document.querySelector("like-button")
const inner = host.shadowRoot.querySelector("button")
const log = []
document.body.addEventListener("click", (e) => log.push(`click target: ${e.target.localName}`))
document.body.addEventListener("liked", (e) => log.push(`liked target: ${e.target.localName}`))
inner.click()
inner.dispatchEvent(new CustomEvent("liked", { bubbles: true }))
inner.dispatchEvent(new CustomEvent("liked", { bubbles: true, composed: true }))
console.log(log.join(" | "))
```

```output
click target: like-button | liked target: like-button
```

The second `liked` event without `composed` did not leave the shadow tree, so the log has only one entry for it.

## Server rendering

A regular shadow root is created only by JavaScript, so without JS the component is empty. **Declarative Shadow DOM** describes the shadow tree right in HTML: the browser turns `<template shadowrootmode="open">` inside an element into a shadow root while parsing. This makes it possible to send finished markup from the server.

```html
<fancy-card>
  <template shadowrootmode="open">
    <h2><slot name="title"></slot></h2>
    <slot></slot>
  </template>
  <span slot="title">News</span>
</fancy-card>
```

## When it is worth it

Web Components help when a component must work in any environment: a design system shared by several frameworks, a widget embedded in other people's sites, micro-frontends. The downsides: styles and forms across the boundary take effort (`ElementInternals` to take part in forms), server rendering is harder, and React before version 19 handled custom element properties and events poorly.

## Key points

- Custom Elements: a class extending `HTMLElement`, a hyphenated name, `connectedCallback` and `attributeChangedCallback`.
- Shadow DOM isolates markup and styles; the light DOM is shown through `<slot>`.
- `closed` hides `shadowRoot` from outside code, but the author keeps a reference to the root; it is not security.
- Inherited properties and CSS variables pass inside; `::part` and `:host` give controlled styling.
- Events are retargeted to the host; custom events leave only with `composed: true`.
- Declarative Shadow DOM (`<template shadowrootmode>`) for server rendering.
