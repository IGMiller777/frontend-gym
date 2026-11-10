## What this lesson covers

The DOM (Document Object Model) is the tree of objects the browser uses to represent a page, plus the API to work with it. Frameworks hide the DOM, but interviews still ask how `children` differs from `childNodes`, why `innerHTML` is dangerous, how an attribute differs from a property, and which collection is "live". The examples run in jsdom, a DOM implementation for Node.js; it has no layout, so element sizes are covered separately.

## Nodes and elements

The tree holds **nodes** (`Node`): elements, text, comments. An **element** (`Element`) is only a tag. Hence the pairs of properties: `childNodes` and `children`, `firstChild` and `firstElementChild`, `nextSibling` and `nextElementSibling`. The first of each pair sees text nodes, including the line breaks between tags.

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

## Live and static collections

`querySelectorAll` returns a **static** `NodeList`: a snapshot taken at call time. `getElementsByClassName`, `getElementsByTagName` and `children` return a **live** `HTMLCollection` that changes with the DOM. A live collection in a loop that removes elements is a classic bug: the indexes shift.

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

## Creating and inserting

`document.createElement` creates an element but does not insert it. The modern methods `append`, `prepend`, `before`, `after`, `replaceWith` and `remove` take several nodes and strings at once. To insert many elements in one operation, collect them in a `DocumentFragment`: on insertion the fragment "dissolves" and its children move into the DOM.

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

For repeated markup, `<template>` is handy: its contents are neither shown nor run until cloned with `template.content.cloneNode(true)`.

## textContent, innerText and innerHTML

| Property | What it does |
|---|---|
| `textContent` | all descendants' text as is; on write it inserts text, tags are not parsed |
| `innerText` | text "as rendered": it respects CSS (hidden text is skipped), so it triggers layout and is slower |
| `innerHTML` | parses the string as HTML |

Writing user data into `innerHTML` is XSS: the string becomes markup, and attributes such as `onerror` run code. Use `textContent` for text; if user HTML is really needed, clean it with a sanitizer.

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

Another trap: `el.innerHTML += "…"` recreates all the content, and event listeners on the old children are lost.

## Attributes and properties

An attribute is what is written in HTML (`getAttribute`); a property is a field of the object (`el.value`). They are often linked but not always: on `<input>`, the `value` attribute sets the initial value while the `value` property holds the current one.

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

`data-*` attributes are available through `dataset` in camelCase and are always strings.

## Searching up the tree

`el.closest(selector)` walks up from the element and returns the first matching ancestor (or the element itself). `el.matches(selector)` checks whether the element matches. Together they power event delegation from [the next lesson](/learn/browser-events).

## Sizes and coordinates

| Property | What it includes |
|---|---|
| `clientWidth` | content and `padding`, without the border and scrollbar |
| `offsetWidth` | plus the border and scrollbar, without `margin` |
| `scrollWidth` | the full content width, including the scrolled-off part |
| `getBoundingClientRect()` | the exact rectangle relative to the viewport, including `transform` |

Reading any of them makes the browser compute layout. Why that matters is covered in [the lesson on repainting](/learn/browser-layout-paint).

## Key points

- Nodes include text and comments, elements are only tags: `childNodes` versus `children`.
- `querySelectorAll` is static; `getElementsBy*` and `children` are live.
- Insert many elements through a `DocumentFragment` or a `<template>`.
- Insert user data with `textContent`, not `innerHTML`.
- An attribute is the original markup, a property is the current state; `dataset` values are always strings.
