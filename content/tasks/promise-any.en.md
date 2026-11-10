## Why it matters

`Promise.any` takes the first **successful** result: the fastest mirror, the first server to answer, the cache or the network. Writing it yourself means understanding how promises settle and how `any` differs from `race` and `all`.

## What to do

`promiseAny(values)` behaves like `Promise.any`:

- it fulfills with the value of the first fulfilled promise (plain values count as fulfilled);
- if all reject, it rejects with an `AggregateError` whose `errors` hold the reasons **in input order**;
- an empty input rejects right away with an `AggregateError` with empty `errors`;
- it accepts any iterable;
- without the built-in `Promise.any`, `Promise.all`, `Promise.allSettled` and `Promise.race`.

## Example

```ts
await promiseAny([Promise.reject(new Error('a')), fetchFromMirror2(), fetchFromMirror3()])
// the first mirror that answers successfully
```

<!-- solution -->

## Solution idea

Like `Promise.all`, but the other way round: wrap each value in `Promise.resolve` and subscribe. A success calls `resolve` at once (repeated calls are ignored). An error is stored by index and counted; when all have rejected, reject with an `AggregateError`.

## Pitfalls

- **Error order.** Store by index, not `push` as they arrive.
- **Empty input.** For `Promise.all` an empty input fulfills with `[]`, but `any` rejects: there is nothing to fulfill with.
- **Counting after the loop.** The iterable may be a generator, so the length is unknown up front; count as you go.

## What they ask next

- How `all`, `allSettled`, `race` and `any` differ (the combinators lesson).
- How to cancel the losing requests once one has succeeded (`AbortController`).
- Write `Promise.race` and `Promise.allSettled`.
