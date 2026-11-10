## What this lesson covers

Semantic markup means tags chosen by meaning, not by looks: a button is a `<button>`, navigation is a `<nav>`, a section heading is an `<h2>`. Keyboard support, screen readers, search engines, and how much JavaScript you must write instead of the browser all depend on it. The examples run in jsdom; roles and accessible names are computed by the `dom-accessibility-api` library, the same one Testing Library uses in `getByRole`.

## Built-in roles

Most elements have an **implicit role** that the browser passes on to assistive technology. A screen reader uses it to announce "button", "link", "navigation" and to jump between page regions.

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

`<header>` and `<footer>` become the `banner` and `contentinfo` regions only when they belong to the whole page. Inside `<article>`, `<section>` or `<aside>` they are just the header and footer of that block, and there can be any number of them. A search region is marked up with the `<search>` element (supported by all browsers since 2023, role `search`) instead of `<form role="search">`. The `dom-accessibility-api` library does not know it yet, so it is left out of the example.

## Button or link

- A **link** (`<a href>`) goes to another address: it opens in a new tab, can be copied, and is saved in history.
- A **button** (`<button>`) performs an action on the page: open a menu, submit a form, delete.

A `<div onclick>` instead of a button breaks several things at once: Tab cannot reach it, Enter and Space do not press it, and the screen reader does not say it is a button. You would have to add all of that by hand: `role`, `tabindex`, key handlers.

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

A link without `href` cannot be focused either and is not a link for screen readers. The `tabIndex` property is no help here: Chrome returns `0` for such a link even though focus never lands on it.

Inside a form, a `<button>` defaults to `type="submit"`: a "Cancel" button without `type="button"` submits the form.

## Headings

`<h1>`–`<h6>` build the page's table of contents: screen reader users move through headings more than anything else. The rules:

- one `<h1>` with the page topic;
- do not skip levels: an `<h3>` follows an `<h2>`, not an `<h4>`;
- choose the level by structure and set the size in CSS.

The "outline algorithm", under which an `<h1>` inside each `<section>` would become a heading of the right level, was never implemented by any browser and was removed from the HTML standard in 2022. Only the number in the tag sets the heading level.

## Other useful elements

| Element | Why |
|---|---|
| `<article>` | a self-contained block: a post, a product card, a comment |
| `<section>` | a thematic section with a heading; without one it is just a `<div>` |
| `<figure>`, `<figcaption>` | an illustration with a caption |
| `<time datetime="2026-11-10">` | a machine-readable date |
| `<details>`, `<summary>` | a disclosure block without JavaScript |
| `<ul>`, `<ol>`, `<dl>` | lists: the screen reader says "list, 5 items" |
| `<table>` with `<th scope>` | tabular data, not layout |

## Key points

- Implicit roles give you keyboard support, announcements and region navigation for free.
- `<header>` and `<footer>` are page regions only at the top level; mark up search with `<search>`.
- A link goes to an address, a button performs an action; a `<div onclick>` is unreachable by keyboard.
- Headings go in order without skips; there is no outline algorithm.
- A `<button>` in a form is `submit` by default.
