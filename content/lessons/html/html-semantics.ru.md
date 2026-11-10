## О чём урок

Семантическая разметка это теги по смыслу, а не по виду: кнопка это `<button>`, навигация это `<nav>`, заголовок раздела это `<h2>`. От этого зависят клавиатура, скринридеры, поисковики и то, сколько JavaScript придётся написать вместо браузера. Примеры выполняются в jsdom; роли и доступные имена считает библиотека `dom-accessibility-api`, та же, что использует Testing Library в `getByRole`.

## Встроенные роли

У большинства элементов есть **неявная роль**, которую браузер передаёт вспомогательным технологиям. Скринридер по ней объявляет «кнопка», «ссылка», «навигация» и даёт перескакивать между областями страницы.

```js dom
import { getRole } from "dom-accessibility-api"
document.body.innerHTML = `
  <header id="top">Logo</header>
  <nav id="menu"><a id="home" href="/">Home</a></nav>
  <main id="content"><h1 id="title">Orders</h1><button id="save">Save</button></main>
  <aside id="side">Tips</aside>
  <input type="search" id="q">
  <footer id="bottom">© 2026</footer>
  <div id="fake" class="button">Save</div>`
for (const el of document.querySelectorAll("[id]")) console.log(el.id.padEnd(8), getRole(el) ?? "generic")
```

```output
top      banner
menu     navigation
home     link
content  main
title    heading
save     button
side     complementary
q        searchbox
bottom   contentinfo
fake     generic
```

`<header>` и `<footer>` становятся областями `banner` и `contentinfo`, только когда относятся ко всей странице. Внутри `<article>`, `<section>` или `<aside>` это просто шапка и подвал своего блока, и таких может быть сколько угодно. Область поиска размечают элементом `<search>` (поддерживается всеми браузерами с 2023 года, роль `search`) вместо `<form role="search">`. Библиотека `dom-accessibility-api` его пока не знает, поэтому в примере его нет.

## Кнопка или ссылка

- **Ссылка** (`<a href>`) ведёт на другой адрес: открывается в новой вкладке, копируется, сохраняется в истории.
- **Кнопка** (`<button>`) выполняет действие на странице: открыть меню, отправить форму, удалить.

`<div onclick>` вместо кнопки ломает сразу несколько вещей: на него нельзя попасть клавишей Tab, он не нажимается Enter и пробелом, скринридер не скажет, что это кнопка. Всё это пришлось бы дописывать руками: `role`, `tabindex`, обработчики клавиш.

```js dom
document.body.innerHTML = `<button id="real">Save</button><div id="fake" onclick="save()">Save</div>
  <a id="nohref">Docs</a><a id="link" href="/docs">Docs</a>`
for (const id of ["real", "fake", "nohref", "link"]) {
  const el = document.getElementById(id)
  el.focus()
  console.log(id.padEnd(7), document.activeElement === el ? "can be focused" : "cannot be focused")
}
```

```output
real    can be focused
fake    cannot be focused
nohref  cannot be focused
link    can be focused
```

Ссылка без `href` тоже не фокусируется и не является ссылкой для скринридера. Свойство `tabIndex` здесь не помощник: Chrome возвращает у такой ссылки `0`, хотя фокус на неё не попадает.

У `<button>` внутри формы тип по умолчанию `submit`: кнопка «Отмена» без `type="button"` отправит форму.

## Заголовки

Заголовки `<h1>`–`<h6>` строят оглавление страницы: пользователи скринридеров чаще всего перемещаются именно по ним. Правила:

- один `<h1>` с темой страницы;
- уровни не пропускают: после `<h2>` идёт `<h3>`, а не `<h4>`;
- уровень выбирают по структуре, а размер задают в CSS.

«Алгоритм outline», при котором `<h1>` внутри каждой `<section>` становился бы заголовком нужного уровня, ни один браузер не реализовал, и в 2022 году его убрали из стандарта HTML. Уровень заголовка определяет только цифра в теге.

## Другие полезные элементы

| Элемент | Зачем |
|---|---|
| `<article>` | самостоятельный блок: пост, карточка товара, комментарий |
| `<section>` | тематический раздел с заголовком; без заголовка это просто `<div>` |
| `<figure>`, `<figcaption>` | иллюстрация с подписью |
| `<time datetime="2026-11-10">` | дата в машиночитаемом виде |
| `<details>`, `<summary>` | раскрывающийся блок без JavaScript |
| `<ul>`, `<ol>`, `<dl>` | списки: скринридер скажет «список из 5 элементов» |
| `<table>` с `<th scope>` | табличные данные, а не вёрстка |

## Главное

- Неявные роли элементов дают клавиатуру, озвучивание и навигацию по областям бесплатно.
- `<header>` и `<footer>` становятся областями страницы только на верхнем уровне; поиск размечают `<search>`.
- Ссылка ведёт по адресу, кнопка выполняет действие; `<div onclick>` недоступен с клавиатуры.
- Заголовки идут по порядку без пропусков; алгоритма outline нет.
- `<button>` в форме по умолчанию `submit`.
