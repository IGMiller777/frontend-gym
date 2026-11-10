## О чём урок

Модальное окно, выпадающее меню, подсказка и аккордеон раньше писали целиком на JavaScript: ловушка фокуса, закрытие по Esc, затемнение фона, возврат фокуса, `z-index`. Сейчас большую часть этого делает браузер: `<dialog>`, Popover API, атрибут `inert` и `<details>`. Здесь разберём, что каждый из них даёт и чего не хватает. Примеры показаны кодом: jsdom эти API пока не реализует.

## dialog

`dialog.showModal()` открывает **модальное** окно:

- окно попадает в верхний слой поверх всего, `z-index` не нужен;
- остальная страница становится инертной: на неё нельзя кликнуть, перейти Tab и её не видит скринридер;
- Esc закрывает окно (событие `cancel`);
- фокус переходит внутрь, а после закрытия возвращается на элемент, который был в фокусе до открытия;
- фон стилизуется псевдоэлементом `::backdrop`.

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

Форма с `method="dialog"` закрывает окно без отправки, а `value` нажатой кнопки попадает в `dialog.returnValue`. `autofocus` выбирает, куда поставить фокус: для разрушительных действий это обычно «Отмена». `dialog.show()` открывает немодальное окно, без инертного фона.

Чего `<dialog>` сам не делает: не закрывается по клику на фон (это добавляют обработчиком `click` по самому диалогу) и не запрещает прокрутку страницы под ним (`body:has(dialog[open]) { overflow: hidden }`).

## Popover API

Атрибут `popover` превращает элемент во всплывающий слой: меню, подсказку, панель уведомлений. Кнопка управляет им без JavaScript через `popovertarget`.

```html
<button popovertarget="user-menu">Account</button>
<div id="user-menu" popover>
  <a href="/profile">Profile</a>
  <a href="/logout">Log out</a>
</div>
```

- `popover` (то же, что `popover="auto"`) закрывается по Esc и по клику снаружи, а открытие другого такого слоя закрывает предыдущий;
- `popover="manual"` закрывается только кодом или кнопкой;
- слой тоже попадает в верхний слой, страница **не** становится инертной: это не модальное окно;
- кнопке с `popovertarget` браузер сам выставляет состояние раскрытия для скринридера.

Popover API поддерживается всеми браузерами с 2024 года. Привязать положение слоя к кнопке помогает CSS Anchor Positioning (`anchor-name`, `position-anchor`): он есть во всех основных браузерах, а для старых версий положение считают скриптом.

## inert

Атрибут `inert` делает блок недоступным целиком: на нём нельзя кликнуть, сфокусироваться, выделить текст, и скринридер его не видит. Подходит для своих модальных решений, для боковой панели, которая выдвигается поверх контента, и для контента «под загрузкой». В отличие от `aria-hidden`, `inert` убирает элементы и из порядка Tab.

```js
const main = document.querySelector("main")
drawer.addEventListener("open", () => (main.inert = true))
drawer.addEventListener("close", () => (main.inert = false))
```

## details и summary

`<details>` с `<summary>` это раскрывающийся блок без JavaScript: заголовок нажимается мышью и клавиатурой, состояние озвучивается. Атрибут `name` объединяет несколько `<details>` в группу, где открыт только один: аккордеон без кода. Событие `toggle` сообщает об открытии и закрытии.

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

## Если пишете своё окно

Иногда нужен свой компонент (старые браузеры, особая анимация). Тогда повторяют то, что `<dialog>` даёт бесплатно: `role="dialog"`, `aria-modal="true"` и `aria-labelledby`; фокус внутрь при открытии; `inert` на остальной странице; Esc закрывает; после закрытия фокус возвращается на кнопку, которая открыла окно. Последнее забывают чаще всего, и пользователь клавиатуры оказывается в начале страницы.

## Главное

- `showModal()` даёт верхний слой, инертный фон, Esc и возврат фокуса; `method="dialog"` закрывает без отправки.
- По клику на фон `<dialog>` сам не закрывается, прокрутку фона блокируют CSS.
- `popover` для меню и подсказок: Esc, клик снаружи, `popovertarget` без JS, фон не блокируется.
- `inert` убирает блок из фокуса, кликов и дерева доступности.
- `<details name="…">` даёт аккордеон без JavaScript.
