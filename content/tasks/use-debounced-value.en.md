## Why it matters

Search as you type should not send a request for every letter. In React the delay is easier as a hook over a value than as a wrapper over a function (the `debounce` task): the component renders with the current text in the input, while the request depends on the delayed value. The task checks how the candidate handles a timer in an effect and its cleanup.

## What to build

`useDebouncedValue(value, delay)`:

- on the first render it returns `value` at once;
- when `value` changes, it keeps returning the old value until the new one has stayed unchanged for `delay` ms;
- out of a burst of quick changes, only the last one reaches the component;
- after unmount it updates nothing.

## Tests

The tests render a small component that calls your hook, change its prop with `rerender` and wait real time (`sleep`).

<!-- solution -->

## Solution idea

The delayed value lives in state. An effect with `[value, delay]` dependencies sets a timer that writes `value` after `delay`. The effect's cleanup clears the timer, and that is the whole debounce logic: every new value first runs the previous effect's cleanup (the old timer is cancelled), then sets a new one. On unmount the cleanup runs as well, so nothing updates after the component is gone.

```tsx
const [debounced, setDebounced] = useState(value)
useEffect(() => {
  const timer = setTimeout(() => setDebounced(value), delay)
  return () => clearTimeout(timer)
}, [value, delay])
```

## Pitfalls

- **No cleanup.** Timers pile up: every intermediate value reaches the screen in turn, and after unmount React updates a removed component.
- **`useRef` for the value.** Changing a ref does not trigger a render, so the new value never shows up.
- **A debounce function inside the component.** `debounce(fn, 300)` in the component body is re-created on every render, and the delay does not work (see the `debounce` task).

## Follow-up questions

- How this differs from `useDeferredValue`: it does not wait a fixed time, it defers rendering while there is more urgent work, and it does not reduce the number of requests.
- How to build `useDebouncedCallback`: the function in `useRef` or `useEffectEvent`, the timer in a ref, cleanup on unmount.
- Where to debounce a request: here, in a data library or on the server (caching and rate limits).
