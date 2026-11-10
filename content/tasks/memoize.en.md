## Why it matters

Memoization remembers a pure function's result for a set of arguments and reads it from the cache on a repeated call. It speeds up expensive work: formatting, parsing, filtering big lists. The same idea is behind React `useMemo`, `computed` in Vue and Angular, and Redux selectors. Interviewers look at how you choose the cache key: that is where most mistakes happen.

## What to build

`memoize(fn)` returns a function with the same behaviour that:

- calls `fn` once for the same arguments;
- tells `1` from `'1'`;
- compares objects by reference, not by content;
- caches an `undefined` result too;
- supports any number of arguments and tells `f(1)` from `f(1, undefined)`.

## Example

```ts
const slowSquare = (n: number) => { /* heavy work */ return n * n }
const square = memoize(slowSquare)
square(9) // computes
square(9) // from the cache
```

<!-- solution -->

## The idea

A common first attempt is a key like `JSON.stringify(args)` or `args.join(',')`. It breaks in several places: `1` and `'1'` give the same key with `join`, objects with equal content collapse into one, functions and `undefined` are lost, and big objects are slow to serialize.

A tree of `Map`s is more reliable: one level per argument. `Map` compares keys with SameValueZero, so `1` and `'1'` differ, `NaN` matches `NaN`, and objects are compared by reference. The result is stored in the node under a special symbol key. "Already computed" means the key exists (`has`), not that the value is truthy, so `undefined` is cached too.

## Pitfalls

- `if (cache.get(key))` misses cached `0`, `''`, `false` and `undefined`, and the function runs again.
- An unbounded cache grows forever. Real code adds a limit (LRU) or caches only the last call, like Reselect selectors.
- When arguments are objects, the `Map` keeps them in memory. A cache keyed by objects can use `WeakMap`, but primitives cannot be its keys.

## Follow-up questions

- How to build an LRU cache on `Map` (it remembers insertion order).
- When memoization hurts: cheap functions, impure functions, rare repeats.
- Why memoize an async function: cache the promise itself so parallel calls do not duplicate the request.
