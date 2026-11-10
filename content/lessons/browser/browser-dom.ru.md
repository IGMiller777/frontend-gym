## О чём урок

DOM (Document Object Model) это дерево объектов, которым браузер представляет страницу, и API для работы с ним. Фреймворки скрывают DOM, но на собеседованиях всё равно спрашивают: чем `children` отличается от `childNodes`, почему `innerHTML` опасен, чем атрибут отличается от свойства и какая коллекция «живая». Примеры урока выполняются в jsdom, реализации DOM для Node.js; раскладки там нет, поэтому размеры элементов показаны отдельно.

## Узлы и элементы

В дереве лежат **узлы** (`Node`): элементы, текст, комментарии. **Элемент** (`Element`) это только теги. Отсюда пары свойств: `childNodes` и `children`, `firstChild` и `firstElementChild`, `nextSibling` и `nextElementSibling`. Первые видят текстовые узлы, включая переносы строк между тегами.

```js dom
document.body.innerHTML = `<ul>
  <li>a</li>
  <li>b</li>
</ul>`
const ul = document.querySelector("ul")
console.log(ul.childNodes.length, ul.children.length)
console.log(ul.firstChild.nodeType === Node.TEXT_NODE, ul.firstElementChild.textContent)
```

```output
5 2
true a
```

## Живые и статические коллекции

`querySelectorAll` возвращает **статический** `NodeList`: снимок на момент вызова. `getElementsByClassName`, `getElementsByTagName` и `children` возвращают **живую** `HTMLCollection`, которая меняется вместе с DOM. Живая коллекция в цикле с удалением элементов даёт классический баг: индексы сдвигаются.

```js dom
document.body.innerHTML = `<p class="x">1</p><p class="x">2</p><p class="x">3</p>`
const live = document.getElementsByClassName("x")
const snapshot = document.querySelectorAll(".x")
live[0].classList.remove("x")
console.log(live.length, snapshot.length)
```

```output
2 3
```

## Создание и вставка

`document.createElement` создаёт элемент, но не вставляет его. Современные методы `append`, `prepend`, `before`, `after`, `replaceWith` и `remove` принимают несколько узлов и строки сразу. Чтобы вставить много элементов одной операцией, их собирают в `DocumentFragment`: при вставке фрагмент «растворяется», а его дети переходят в DOM.

```js dom
const list = document.createElement("ul")
const fragment = document.createDocumentFragment()
for (const name of ["Ada", "Linus", "Grace"]) {
  const li = document.createElement("li")
  li.textContent = name
  fragment.append(li)
}
list.append(fragment)
document.body.append(list)
console.log(list.children.length, fragment.childNodes.length)
```

```output
3 0
```

Для повторяющейся разметки удобен `<template>`: его содержимое не отображается и не выполняется, пока его не клонируют через `template.content.cloneNode(true)`.

## textContent, innerText и innerHTML

| Свойство | Что делает |
|---|---|
| `textContent` | текст всех потомков как есть; при записи вставляет текст, теги не разбираются |
| `innerText` | текст «как его видно»: учитывает CSS (скрытое не попадает), поэтому вызывает layout и медленнее |
| `innerHTML` | разбирает строку как HTML |

Запись в `innerHTML` данных от пользователя это XSS: строка станет разметкой, а атрибуты вроде `onerror` выполнят код. Для текста используйте `textContent`; если нужен HTML от пользователя, его очищают санитайзером.

```js dom
const comment = '<img src="x" onerror="alert(1)">'
const safe = document.createElement("p")
safe.textContent = comment
const unsafe = document.createElement("p")
unsafe.innerHTML = comment
console.log(safe.children.length, unsafe.children.length, unsafe.firstElementChild.getAttribute("onerror"))
```

```output
0 1 alert(1)
```

Ещё одна ловушка: `el.innerHTML += "…"` пересоздаёт всё содержимое, и обработчики событий на старых дочерних элементах пропадают.

## Атрибуты и свойства

Атрибут это то, что написано в HTML (`getAttribute`), свойство это поле объекта (`el.value`). Часто они связаны, но не всегда: у `<input>` атрибут `value` задаёт начальное значение, а свойство `value` хранит текущее.

```js dom
document.body.innerHTML = `<input value="initial" data-user-id="42">`
const input = document.querySelector("input")
input.value = "typed"
console.log(input.getAttribute("value"), input.value)
console.log(input.dataset.userId, typeof input.dataset.userId)
```

```output
initial typed
42 string
```

`data-*` атрибуты доступны через `dataset` в camelCase и всегда строки.

## Поиск вверх по дереву

`el.closest(selector)` идёт от элемента вверх и возвращает первого подходящего предка (или сам элемент). `el.matches(selector)` проверяет, подходит ли элемент. Вместе они основа делегирования событий из [следующего урока](/learn/browser-events).

## Размеры и координаты

| Свойство | Что входит |
|---|---|
| `clientWidth` | содержимое и `padding`, без рамки и полосы прокрутки |
| `offsetWidth` | плюс рамка и полоса прокрутки, без `margin` |
| `scrollWidth` | вся ширина содержимого, включая прокручиваемую часть |
| `getBoundingClientRect()` | точный прямоугольник относительно окна, с учётом `transform` |

Чтение любого из них заставляет браузер посчитать layout. Почему это важно, разобрано в [уроке о перерисовке](/learn/browser-layout-paint).

## Главное

- Узлы включают текст и комментарии, элементы только теги: `childNodes` против `children`.
- `querySelectorAll` статичен, `getElementsBy*` и `children` живые.
- Много элементов вставляют через `DocumentFragment` или `<template>`.
- Пользовательские данные вставляют через `textContent`, не через `innerHTML`.
- Атрибут это исходная разметка, свойство это текущее состояние; `dataset` всегда строки.
