## Why it matters

Throttle limits the rate: the function runs at most once per interval, no matter how many events arrive. Unlike debounce, it keeps firing during a continuous stream of events. It is used for `scroll`, `mousemove`, drag and drop, sending the cursor position in a collaborative editor: updates should be regular, but not hundreds per second.

## What to build

`throttle(fn, wait)` returns a wrapper:

- if `fn` has not run recently, the first call runs at once and opens a window of `wait` ms;
- calls inside the window do not run at once; only the arguments and `this` of the latest one are kept;
- when the window closes and a call was waiting, it runs and opens a new window;
- if nothing was called inside the window, nothing extra happens.

Lodash `_.throttle` behaves much the same with its default options (`leading` and `trailing` on).

## Example

```ts
const report = throttle((y: number) => sendScroll(y), 100)
// scroll events every 10 ms for one second
// → about 11 calls: at once, then every 100 ms, the last one with the freshest position
```

<!-- solution -->

## The idea

State in the closure: the window timer and the waiting call `pending`.

- A call with no open window runs `fn` at once and opens a window.
- A call while the window is open only overwrites `pending`: we need the latest one.
- When the window closes, check `pending`. If there is one, run it and open a new window right away; otherwise the next call will run at once again.

The new window after the trailing call is required. Without it the trailing call and the next one would run almost together, and the rate would exceed the limit.

## Pitfalls

- **No trailing call.** The simplest version "call if `wait` ms have passed" loses the last event. After scrolling stops, the position stays stale.
- **`Date.now()` instead of a timer.** Tracking the time of the last call works for the leading call, but the trailing one still needs a timer.
- **For animations, prefer `requestAnimationFrame`.** If the goal is repainting, aligning with the browser's frames is more precise than any interval.

## Follow-up questions

- When to choose throttle and when debounce: progress during an action versus the result after it.
- How to add `cancel()` and `flush()` (run the waiting call immediately).
- How passive listeners (`{ passive: true }`) help with `scroll` and `touchmove`.
