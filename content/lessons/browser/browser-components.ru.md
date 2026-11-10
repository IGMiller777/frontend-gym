## О чём урок

Web Components это набор стандартов браузера для своих элементов: Custom Elements (свой тег с поведением), Shadow DOM (изолированное поддерево со своими стилями) и `<template>` со слотами. На них построены дизайн-системы, которые работают в любом фреймворке, и встраиваемые виджеты. Примеры урока выполняются в jsdom: он поддерживает Custom Elements, Shadow DOM и события, но не применяет стили.

## Custom Elements

Свой элемент это класс, наследующий `HTMLElement`, зарегистрированный под именем с дефисом. Браузер вызывает методы жизненного цикла: `connectedCallback` при вставке в документ, `disconnectedCallback` при удалении, `attributeChangedCallback` для атрибутов из `observedAttributes`.

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

`this.attachShadow({ mode })` создаёт **теневой корень**: поддерево, которое не видно обычным `querySelector` снаружи, и в котором свои стили. Содержимое, написанное внутри тега на странице, называют light DOM: оно остаётся в документе и показывается внутри теневого дерева через `<slot>`.

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

## open и closed

С `mode: "open"` теневой корень доступен снаружи через `el.shadowRoot`. С `mode: "closed"` свойство `shadowRoot` равно `null`, но автор компонента не теряет доступ: `attachShadow` возвращает корень, и его сохраняют в приватном поле. Это защита от случайного вмешательства, а не безопасность: в том же окне всё равно можно перехватить `attachShadow`.

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

## Стили через границу

- Стили страницы не попадают в теневое дерево, а стили компонента не выходят наружу.
- Но **наследуемые** свойства (`color`, `font-family`, `line-height`) проходят внутрь через наследование от хоста.
- **CSS custom properties** (`--brand-color`) тоже проходят: это основной способ темизации компонентов.
- `:host` стилизует сам элемент изнутри, `::slotted(...)` верхний уровень содержимого слота, `::part(name)` позволяет странице стилизовать элементы с атрибутом `part="name"`.

## События через границу

Событие изнутри теневого дерева при выходе наружу **перенацеливается** (retargeting): для слушателей снаружи `event.target` это хост-элемент, внутренности не раскрываются. Встроенные события ввода (`click`, `input`, `keydown`) проходят границу сами. Свои события выходят наружу, только если созданы с `composed: true`; путь целиком показывает `event.composedPath()`.

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

Второе событие `liked` без `composed` не вышло за пределы теневого дерева, поэтому в журнале одна запись о нём.

## Серверный рендеринг

Обычный теневой корень создаётся только JavaScript-кодом, поэтому без JS компонент пустой. **Declarative Shadow DOM** описывает теневое дерево прямо в HTML: `<template shadowrootmode="open">` внутри элемента браузер при разборе превращает в теневой корень. Это позволяет отдавать готовую разметку с сервера.

```html
<fancy-card>
  <template shadowrootmode="open">
    <h2><slot name="title"></slot></h2>
    <slot></slot>
  </template>
  <span slot="title">News</span>
</fancy-card>
```

## Когда это нужно

Web Components полезны, когда компонент должен работать в любом окружении: дизайн-система для нескольких фреймворков, встраиваемый виджет на чужие сайты, микрофронтенды. Минусы: стили и формы через границу требуют усилий (`ElementInternals` для участия в формах), серверный рендеринг сложнее, а React до версии 19 плохо передавал свойства и события своим элементам.

## Главное

- Custom Elements: класс от `HTMLElement`, имя с дефисом, `connectedCallback` и `attributeChangedCallback`.
- Shadow DOM изолирует разметку и стили; light DOM показывается через `<slot>`.
- `closed` скрывает `shadowRoot` от внешнего кода, но автор хранит ссылку на корень; это не безопасность.
- Наследуемые свойства и CSS-переменные проходят внутрь; `::part` и `:host` дают управляемую стилизацию.
- События перенацеливаются на хост; свои события выходят наружу только с `composed: true`.
- Declarative Shadow DOM (`<template shadowrootmode>`) для серверного рендеринга.
