## What this lesson covers

How to run code later, at the right moment of a frame, or in the background without getting in the user's way: timers, `requestAnimationFrame`, `requestIdleCallback`, splitting long tasks, and Web Workers. This bridges the [event loop](/learn/async-event-loop) and UI performance.

## Timers

`setTimeout(fn, ms)` promises "no sooner than `ms`", not "exactly at". The callback enters the task queue once the time is up and then waits for the stack to clear and the microtasks to drain.

- From the fifth level of nesting (a timer set from a timer, and so on) browsers raise the delay to at least 4 ms.
- In background tabs timers are throttled to run at most once per second, and Chrome throttles even harder after a long idle period. A timer is no good for precise timekeeping: measure elapsed time with `performance.now()` or `Date.now()`.
- `setTimeout` and `setInterval` return an id; stop them with `clearTimeout` and `clearInterval`.

`setInterval` schedules calls on a fixed rhythm without waiting for the previous one to finish. If the work may take longer than the interval (polling a server, say), use a `setTimeout` chain: the next run is scheduled after the current one ends.

```js run
let runs = 0
function poll() {
  runs++
  if (runs < 3) setTimeout(poll, 5)
  else console.log("polled", runs, "times, never overlapping")
}
poll()
```

```output
polled 3 times, never overlapping
```

## requestAnimationFrame

`requestAnimationFrame(cb)` calls `cb` before the next frame is painted and passes it the frame time. The rate follows the screen (60, 120 Hz and so on), and calls stop in a background tab. It is the right tool for JavaScript animations: an animation driven by `setTimeout(..., 16)` drifts out of sync with the screen and stutters.

```js
function animate(el, from, to, duration) {
  const start = performance.now()
  requestAnimationFrame(function frame(now) {
    const t = Math.min((now - start) / duration, 1)
    el.style.transform = `translateX(${from + (to - from) * t}px)`
    if (t < 1) requestAnimationFrame(frame)
  })
}
```

For simple transitions, CSS animations and transitions on `transform` and `opacity` are better: the browser can run them off the main thread.

## requestIdleCallback

`requestIdleCallback(cb, { timeout })` calls `cb` when the browser has spare time between frames. The callback gets a `deadline`: `deadline.timeRemaining()` tells how many milliseconds are left. It suits low-priority work: analytics, prefetching, warming caches. Safari does not have this API yet, so check for it and fall back to `setTimeout`.

## Long tasks

A task longer than 50 ms counts as a long task: while it runs, clicks and input wait, and the page feels frozen. The fix is to split the work into chunks and give control back to the browser between chunks, so it can handle input and paint a frame.

```js
async function processAll(items) {
  for (const [i, item] of items.entries()) {
    process(item)
    if (i % 50 === 0) await yieldToMain()
  }
}
const yieldToMain = () =>
  globalThis.scheduler?.yield ? scheduler.yield() : new Promise((r) => setTimeout(r, 0))
```

`scheduler.yield()` is available in Chrome (since 129) and Firefox (since 142); Safari does not have it yet, hence the fallback. Yielding with `await Promise.resolve()` does not work: that is a microtask, and the browser gets no chance to do anything between chunks.

## Web Workers

If the work is heavy in itself (parsing a large file, processing an image, encryption), move it to a **Web Worker**: a separate thread with its own event loop. A worker has no access to the DOM, `window` or `document`, but it has `fetch`, timers, promises, IndexedDB and WebSocket.

```js
// main.js
const worker = new Worker(new URL("./parse.worker.js", import.meta.url), { type: "module" })
worker.postMessage(file)
worker.onmessage = (e) => render(e.data)

// parse.worker.js
self.onmessage = async (e) => {
  const text = await e.data.text()
  self.postMessage(parse(text))
}
```

Data between threads is copied with the structured clone algorithm, which takes time for large objects. An `ArrayBuffer` and some other objects can be **transferred** instead of copied: `worker.postMessage(buffer, [buffer])`. After the transfer, the original buffer is empty.

```js run
const buffer = new ArrayBuffer(1024)
const { port1, port2 } = new MessageChannel()
port2.onmessage = (e) => {
  console.log("received bytes:", e.data.byteLength)
  port1.close()
  port2.close()
}
port1.postMessage(buffer, [buffer])
console.log("sender keeps:", buffer.byteLength)
```

```output
sender keeps: 0
received bytes: 1024
```

A **Service Worker** is a different kind of worker: it lives apart from pages, intercepts their network requests (the `fetch` event), works with the Cache API and receives push notifications. It is used for offline mode and PWAs, not for heavy computation.

## Key points

- `setTimeout` means "no sooner than": delays grow with nesting and in background tabs.
- Write server polling as a `setTimeout` chain, not `setInterval`.
- JavaScript animations go through `requestAnimationFrame`, small background work through `requestIdleCallback` (with a fallback).
- Split long tasks and yield with `scheduler.yield()` or `setTimeout`, not with microtasks.
- Move heavy computation to a Web Worker; transfer large buffers instead of copying them.
