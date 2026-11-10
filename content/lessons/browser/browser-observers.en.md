## What this lesson covers

To learn that an element appeared on screen, changed size, or that something was added to the DOM, people used to listen to `scroll` and `resize` or poll the page with a timer. Today there are four observers for this: `MutationObserver`, `IntersectionObserver`, `ResizeObserver` and `PerformanceObserver`. They are asynchronous, batch changes, and do not force layout on every pixel of scrolling.

## The common shape

All four look alike: the callback receives an array of entries, `observe` starts watching, `disconnect` stops everything at once. `IntersectionObserver` and `ResizeObserver` also have `unobserve(el)` for a single element, and `MutationObserver`, `IntersectionObserver` and `PerformanceObserver` have `takeRecords()` to take pending entries without the callback.

## MutationObserver

Watches DOM changes: added and removed nodes (`childList`), attributes (`attributes`), text (`characterData`), across the whole subtree (`subtree`). The callback runs as a **microtask**: after the current synchronous code, in one call for all the changes.

```js dom
document.body.innerHTML = `<ul id="list"></ul>`
const list = document.querySelector("#list")
const observer = new MutationObserver((records) => {
  const added = records.flatMap((r) => [...r.addedNodes]).length
  console.log("callback: records", records.length, "added", added)
})
observer.observe(list, { childList: true, attributes: true })
list.append(document.createElement("li"))
list.append(document.createElement("li"))
list.setAttribute("data-state", "ready")
console.log("sync code done")
```

```output
sync code done
callback: records 3 added 2
```

Uses: reacting to markup inserted by someone else's script, editors, testing utilities. It does not see styles or properties (`el.value`), only the DOM and attributes.

## IntersectionObserver

Reports when an element enters or leaves the visible area of a root (the viewport by default). Options go into the constructor: `root`, `rootMargin` (extend the area to start loading early), `threshold` (the visible share from 0 to 1, possibly an array).

```js
const io = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      loadMore()
      io.unobserve(entry.target)
    }
  },
  { rootMargin: "200px", threshold: 0 },
)
io.observe(document.querySelector("#sentinel"))
```

Typical jobs: an infinite feed (watch a "sentinel" at the end of the list), impression analytics, starting an animation on appearance. Lazy-loading images and `iframe`s needs no JavaScript: the `loading="lazy"` attribute is enough.

## ResizeObserver

Reports size changes of a specific element rather than the window: good for charts, text fields and components that adapt to their container. Which box to measure goes **into the second argument of `observe`**: `observe(el, { box: "border-box" })`. An entry has `contentBoxSize` and `borderBoxSize` (arrays, one item per fragment) and `contentRect`, kept for compatibility.

```js
const ro = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const { inlineSize } = entry.contentBoxSize[0]
    chart.resize(inlineSize)
  }
})
ro.observe(container, { box: "content-box" })
```

The callback runs after layout and before paint. If the callback changes the observed element's size, the browser handles the new changes in the same frame only to a limited extent and logs "ResizeObserver loop completed with undelivered notifications". To adapt layout to a container, CSS container queries without JavaScript are often enough.

## PerformanceObserver

Receives entries from the performance timeline: `largest-contentful-paint`, `layout-shift`, `event`, `longtask`, `resource`, your own `mark` and `measure`. The `buffered: true` flag (deliver entries recorded before subscribing) works only with the `type` option, one type per call. With `entryTypes` it is ignored.

```js
new PerformanceObserver((list) => {
  const last = list.getEntries().at(-1)
  sendMetric("LCP", last.startTime)
}).observe({ type: "largest-contentful-paint", buffered: true })
```

In practice Core Web Vitals are collected with the `web-vitals` library, which handles many subtleties.

## Key points

- `MutationObserver`: DOM and attribute changes, the callback is a microtask, one call per batch.
- `IntersectionObserver`: element visibility; options in the constructor; for images `loading="lazy"` is enough.
- `ResizeObserver`: element size, the box is set in `observe(el, { box })`; resizing inside the callback causes a loop error.
- `PerformanceObserver`: metrics; `buffered` works only with `type`.
- `disconnect` stops everything; remember to disconnect observers when a component is removed.
