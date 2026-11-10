## Why it matters

Some events come in bursts: typing in a search box, window `resize`, edits in an editor. Reacting to each one is expensive: extra server requests, extra recalculations. Debounce delays the call while events keep coming and runs it once when there is a pause. The classic case: search sends a request 300 ms after the person stopped typing.

## What to build

`debounce(fn, wait)` returns a wrapper function:

- every call to the wrapper delays `fn` by `wait` ms and cancels the previously scheduled call;
- `fn` gets the arguments of the last call and the same `this` the wrapper was called with;
- the wrapper has a `cancel()` method that drops the scheduled call;
- the wrapper keeps working after `cancel()`.

## Example

```ts
const search = debounce((query: string) => fetchResults(query), 300)
input.addEventListener('input', (e) => search((e.target as HTMLInputElement).value))
// "r", "re", "rea", "reac", "react" typed quickly → one request with 'react'
```

The tests use fake timers: `clock.tick(100)` moves time forward by 100 ms instantly.

<!-- solution -->

## The idea

Keep the timer id in a closure. On every call clear the old timer with `clearTimeout` and set a new one. When the timer fires, call `fn` with the saved arguments.

The wrapper is declared with `function`, not as an arrow: that gives it its own `this`. The arrow function inside `setTimeout` takes the wrapper's `this`, and `fn.apply(this, args)` passes it on.

`cancel` is just a property of the function: functions in JavaScript are objects too.

## Pitfalls

- **Lost `this`.** If the wrapper is an arrow, `this` comes from where `debounce` was called, not from the object the method was called on.
- **Wrapper inside a handler.** `onInput={() => debounce(save, 300)()}` in React creates a new wrapper on every event, so nothing is delayed. Create the wrapper once: outside the component, in `useMemo` or in `useRef`.
- **Cancel on unmount.** If the component is gone but a call is still scheduled, it fires with stale data. That is what `cancel()` is for.

## Follow-up questions

- How debounce differs from throttle (the next task).
- The `leading` mode: call at once on the first event, then stay quiet until a pause.
- How to return `fn`'s result from debounce: the wrapper can return a promise that resolves with it.
