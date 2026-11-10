## Why it matters

`Promise.all` waits for several operations in parallel: load the profile, settings and notifications at the same time, not one after another. Writing it yourself shows you understand how promises work: when `then` callbacks run, why the order of results does not depend on response speed, and what happens on failure.

## What to build

`promiseAll(values)` behaves like `Promise.all`:

- accepts any iterable (array, `Set`, generator); items can be promises, thenables and plain values;
- resolves with an array of results in input order, not completion order;
- resolves to `[]` at once for empty input;
- rejects with the reason of the first failure in time;
- the built-in `Promise.all`, `allSettled`, `any` and `race` are not allowed.

## Example

```ts
const [user, settings] = await promiseAll([fetchUser(), fetchSettings()])
```

<!-- solution -->

## The idea

Return `new Promise` and walk the input with `for...of`, which works with any iterable. Wrap every item in `Promise.resolve(value)`: it turns a plain value or a thenable into a promise.

Put each result at the index remembered during the walk (`results[index] = result`), so the order is kept. Compare a counter of settled items with the total: when they are equal, resolve the outer promise. Pass an error straight to `reject`. A promise ignores repeated `resolve` and `reject`, so later failures cannot break anything.

## Pitfalls

- **`results.push(result)`** stores in completion order, not input order.
- **Checking `results.length === values.length`.** If the item at index 2 finishes before the one at index 1, `length` is already 3 while index 1 is still empty. You need a separate counter.
- **Empty input.** Without a separate check the promise never resolves: no callback ever runs.
- **`values.length`.** A generator and a `Set` have no `length`, so count during the walk.

## Follow-up questions

- How to write `allSettled`, `race` and `any` (the last one rejects with `AggregateError`).
- Does `Promise.all` cancel the other operations on failure? No, they keep running. Cancellation uses `AbortController`.
- How `await` in a loop differs from `Promise.all`: sequential versus parallel waiting.
