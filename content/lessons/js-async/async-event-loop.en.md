## What this lesson covers

JavaScript in the browser runs on one thread: while your code runs, the page does not react to clicks and does not repaint. To wait for the network, timers and events without blocking that thread, the browser uses the **event loop**. Almost every "what does this code print" task tests it.

The examples run as ES modules in Node.js. Promises and timers are ordered the same way there as in the browser; what Node.js lacks (rendering, `requestAnimationFrame`) is shown as plain code that is not run.

## The call stack

The call stack holds the functions running right now. A call pushes a frame on top, a return pops it. While the stack is not empty, the engine is busy and nothing else happens: no timer callbacks, no click handlers, no rendering.

Hence the main rule: an async callback never interrupts running code. It waits until the stack is empty.

## Two queues

Callbacks wait in two places.

| Queue | What goes there |
|---|---|
| **Tasks** (also called macrotasks) | `setTimeout` and `setInterval` callbacks, events (`click`, `input`), `postMessage` messages, network responses, running a `<script>` itself |
| **Microtasks** | promise reactions (`then`, `catch`, `finally`), the continuation after `await`, `queueMicrotask`, `MutationObserver` callbacks |

One turn of the event loop in the HTML spec goes like this:

1. Take **one** task from the task queue and run it to the end.
2. Run **all** microtasks, including the ones added along the way.
3. If it is time to update the screen (usually once per frame, about 16.7 ms at 60 Hz), run `requestAnimationFrame` callbacks, recalculate styles and layout, and paint the frame.
4. If there is time left before the next frame, run `requestIdleCallback` callbacks.

Running the script is a task too. So after the synchronous code, all microtasks run first, and only then the first timer.

```js run
console.log("script start")
setTimeout(() => console.log("timeout"), 0)
Promise.resolve().then(() => console.log("promise"))
queueMicrotask(() => console.log("microtask"))
console.log("script end")
```

```output
script start
script end
promise
microtask
timeout
```

## Microtasks until the queue is empty

The microtask queue is drained completely, even when microtasks add new microtasks. The timer waits.

```js run
setTimeout(() => console.log("timeout"), 0)
let n = 0
function tick() {
  n++
  if (n < 3) queueMicrotask(tick)
  else console.log("microtasks done:", n)
}
queueMicrotask(tick)
```

```output
microtasks done: 3
timeout
```

If microtasks keep spawning each other forever, the queue never empties: no timers, no clicks, no rendering, and the tab freezes. An endless chain of `setTimeout` does not do that, because the browser gets to paint between tasks.

## After every task

Microtasks are drained not only after the script but after **every** task. A promise created in a timer callback runs before the next timer, even if that timer is already queued.

```js run
setTimeout(() => {
  console.log("timeout 1")
  Promise.resolve().then(() => console.log("promise in timeout 1"))
}, 0)
setTimeout(() => console.log("timeout 2"), 0)
```

```output
timeout 1
promise in timeout 1
timeout 2
```

## Rendering and requestAnimationFrame

The browser paints frames between tasks, not during them. If a click handler changes the DOM five times in a row, the user sees only the result. A long task (over 50 ms is called a long task) delays the next frame and the response to input, which directly hurts the INP metric.

`requestAnimationFrame(cb)` calls `cb` right before the next frame is painted. It is the right place for JavaScript animations and for reading sizes before changing the DOM.

```js
setTimeout(() => console.log("timeout"), 0)
requestAnimationFrame(() => console.log("frame"))
// The order is not guaranteed: usually "timeout" first,
// but if a frame is due right now, "frame" may come first.
```

"What does it print" tasks where `setTimeout` races `requestAnimationFrame` have no single right answer. A good interview answer explains what the order depends on.

## Node.js is different

Node.js has its own event loop from the libuv library, with phases (timers, I/O, `setImmediate`, close callbacks). Microtasks work as in the browser, but there is also the `process.nextTick` queue, drained before promises. The order of `setTimeout(fn, 0)` and `setImmediate(fn)` in the main module is not guaranteed; inside an I/O callback `setImmediate` always comes first.

## Key points

- While the call stack is not empty, no async callback runs.
- One turn: one task, then all microtasks, then, if it is time, a frame with `requestAnimationFrame`.
- Promises, `await` and `queueMicrotask` are microtasks; timers and events are tasks.
- Endless microtasks freeze the page; long tasks delay frames and input.
- The order of `setTimeout` and `requestAnimationFrame` is not guaranteed.
