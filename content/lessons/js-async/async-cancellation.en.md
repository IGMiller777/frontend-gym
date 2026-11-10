## What this lesson covers

A promise cannot be "cancelled": it only reports a result. But the operation itself can and should be cancelled. The user left the page, typed the next letter in a search box, closed a modal: the old request is no longer needed, and its response may overwrite fresh data. The standard cancellation mechanism on the web is `AbortController` and `AbortSignal`. They are defined in the DOM Standard (not in ECMAScript) and exist in all browsers and in Node.js.

## Controller and signal

- `const controller = new AbortController()` creates a controller.
- `controller.signal` is the signal; pass it to operations that must be cancellable.
- `controller.abort(reason?)` cancels: `signal.aborted` becomes `true`, `signal.reason` gets the reason, and the signal fires an `abort` event.

Without a reason, the reason is a `DOMException` named `AbortError`. With one, operations reject **with your reason**, not with `AbortError`.

```js run
const controller = new AbortController()
controller.signal.addEventListener("abort", () => console.log("abort event"))
controller.abort()
console.log(controller.signal.aborted, controller.signal.reason.name)

const custom = new AbortController()
custom.abort(new Error("user left"))
console.log(custom.signal.reason.message)
```

```output
abort event
true AbortError
user left
```

## Aborting fetch

`fetch(url, { signal })` rejects with the signal's reason on abort. Tell an abort apart from a real error and do not show it to the user.

```js
const controller = new AbortController()
try {
  const res = await fetch("/api/search?q=react", { signal: controller.signal })
  render(await res.json())
} catch (e) {
  if (e.name === "AbortError") return // we cancelled it ourselves, not an error
  showError(e)
}
```

Aborting also works while the body is being read: `res.json()` rejects too.

## Timeouts

`AbortSignal.timeout(ms)` creates a signal that aborts itself after `ms` milliseconds with a `TimeoutError` reason. It beats a hand-made `setTimeout` + `abort()`: there is no timer to clear, and a timeout is easy to tell apart from a user cancel.

```js run
const signal = AbortSignal.timeout(10)
await new Promise((r) => setTimeout(r, 30))
console.log(signal.aborted, signal.reason.name)
```

```output
true TimeoutError
```

`AbortSignal.any([a, b])` combines signals: it aborts when any of them does. For example, "cancel if the user pressed Stop or 10 seconds passed": `AbortSignal.any([controller.signal, AbortSignal.timeout(10_000)])`.

## Your own cancellable functions

Built-in APIs are not the only ones that can take a signal. To make your own async function cancellable: call `signal.throwIfAborted()` at the start, and on the `abort` event release resources and reject with the reason.

```js run
function sleep(ms, { signal } = {}) {
  return new Promise((resolve, reject) => {
    signal?.throwIfAborted()
    const id = setTimeout(resolve, ms)
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(id)
        reject(signal.reason)
      },
      { once: true },
    )
  })
}

const controller = new AbortController()
setTimeout(() => controller.abort(), 10)
try {
  await sleep(1000, { signal: controller.signal })
} catch (e) {
  console.log("stopped:", e.name)
}
```

```output
stopped: AbortError
```

Timers themselves, `IntersectionObserver` and `ResizeObserver` do not take a signal: stop them by hand, as in the example above.

## Removing event listeners

`addEventListener(type, fn, { signal })` removes the listener when the signal aborts. One controller can remove many listeners at once, which is handy when a component unmounts.

```js run
const target = new EventTarget()
const controller = new AbortController()
target.addEventListener("ping", () => console.log("ping a"), { signal: controller.signal })
target.addEventListener("ping", () => console.log("ping b"), { signal: controller.signal })
target.dispatchEvent(new Event("ping"))
controller.abort()
target.dispatchEvent(new Event("ping"))
console.log("after abort: silence")
```

```output
ping a
ping b
after abort: silence
```

## Racing responses

Search as you type: the request for "re" may arrive after the one for "react", and old results end up on screen. That is a race condition, and there are two fixes.

- Abort the previous request before a new one: keep the controller and call `abort()` on every input.
- Ignore stale responses: remember the number of the latest request and drop responses with a smaller number.

In React this goes into the effect cleanup: `useEffect(() => { const c = new AbortController(); load(c.signal); return () => c.abort() }, [query])`. Libraries such as TanStack Query pass a signal to the query function for you.

## Key points

- A promise is not cancelled, the operation is: via `AbortController` and `AbortSignal`.
- `abort()` without a reason gives `AbortError`; with a reason, operations reject with that reason.
- `AbortSignal.timeout(ms)` for timeouts (`TimeoutError`), `AbortSignal.any` to combine signals.
- Make your own function cancellable with `throwIfAborted` and the `abort` event, and release resources.
- Aborting old requests removes response races in search and on navigation.
