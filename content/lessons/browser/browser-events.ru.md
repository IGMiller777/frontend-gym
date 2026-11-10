## О чём урок

События это то, как страница узнаёт о действиях пользователя и браузера. Вопросы о них есть почти в каждом интервью: в каком порядке срабатывают обработчики, чем `preventDefault` отличается от `stopPropagation`, что такое делегирование и зачем `passive`. Все примеры выполняются в jsdom и показывают реальный порядок вызовов.

## Три фазы

Событие на элементе проходит путь от `window` до цели и обратно:

1. **Погружение** (capture): от `window` вниз к родителю цели. Сюда попадают обработчики с `{ capture: true }` (или третьим аргументом `true`).
2. **Цель** (target): обработчики на самом элементе.
3. **Всплытие** (bubble): от цели вверх до `window`. Обычные обработчики срабатывают здесь.

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

Не все события всплывают: `focus` и `blur`, `mouseenter` и `mouseleave`, `load` у картинки остаются на элементе. Для делегирования фокуса есть всплывающие `focusin` и `focusout`.

## target и currentTarget

`event.target` это элемент, где событие возникло (самый глубокий). `event.currentTarget` это элемент, чей обработчик выполняется сейчас. На этом построено **делегирование**: один обработчик на контейнере вместо обработчика на каждом элементе списка. Оно работает и для элементов, добавленных позже.

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

`closest` нужен, потому что клик может прийти на вложенный элемент кнопки, например на иконку.

## preventDefault, stopPropagation, stopImmediatePropagation

| Метод | Что останавливает |
|---|---|
| `preventDefault()` | действие браузера по умолчанию: переход по ссылке, отправку формы, контекстное меню. Распространение продолжается |
| `stopPropagation()` | дальнейший путь события по дереву. Остальные обработчики на текущем элементе выполнятся |
| `stopImmediatePropagation()` | путь по дереву и все следующие обработчики на текущем элементе |

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

`dispatchEvent` возвращает `false`, если какой-то обработчик отменил действие. Так компонент узнаёт, что подписчик попросил не выполнять поведение по умолчанию.

`return false` из обработчика, назначенного свойством (`el.onclick = …`) или атрибутом, отменяет только действие по умолчанию и **не** останавливает всплытие. Из `addEventListener` возвращаемое значение игнорируется. Отменять и всплытие, и действие умеет только jQuery.

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

## Опции addEventListener

- `once: true`: обработчик снимется после первого вызова.
- `signal`: снять обработчик через `AbortController` (см. [урок об отмене](/learn/async-cancellation)).
- `passive: true`: обещание не вызывать `preventDefault`. Для `touchstart`, `touchmove` и `wheel` браузер тогда прокручивает страницу сразу, не дожидаясь обработчика. На `window`, `document` и `body` браузеры по умолчанию делают эти обработчики пассивными; вызов `preventDefault` в пассивном обработчике игнорируется.

## Свои события

`new CustomEvent(type, { detail, bubbles, composed })` создаёт событие с данными в `detail`. По умолчанию свои события **не** всплывают: нужен `bubbles: true`. Чтобы событие вышло из Shadow DOM компонента наружу, нужен ещё и `composed: true` (подробнее в [уроке о Web Components](/learn/browser-components)).

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

Pointer Events объединяют мышь, касание и перо в одну модель: `pointerdown`, `pointermove`, `pointerup`, а в событии есть `pointerType`, `pointerId`, `pressure`. Для перетаскивания `element.setPointerCapture(e.pointerId)` закрепляет поток событий за элементом, даже если указатель ушёл за его границы.

```js
handle.addEventListener("pointerdown", (e) => {
  handle.setPointerCapture(e.pointerId)
  start = { x: e.clientX, y: e.clientY }
})
handle.addEventListener("pointermove", (e) => {
  if (handle.hasPointerCapture(e.pointerId)) move(e.clientX - start.x, e.clientY - start.y)
})
```

Прокрутку и масштаб жестами отключают не `preventDefault` в обработчике, а CSS: `touch-action: none` на перетаскиваемом элементе.

## Главное

- Фазы: погружение, цель, всплытие; обычные обработчики работают на всплытии.
- `target` где возникло, `currentTarget` где обработчик; делегирование через `closest`.
- `preventDefault` про действие браузера, `stopPropagation` про дерево, `stopImmediatePropagation` ещё и про соседние обработчики.
- `return false` в `onclick` отменяет только действие по умолчанию.
- `passive` ускоряет прокрутку; свои события не всплывают без `bubbles: true`.
- Pointer Events вместо отдельных mouse и touch, `setPointerCapture` для перетаскивания, `touch-action` для жестов.
