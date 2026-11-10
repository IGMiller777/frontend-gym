## Why it matters

`reduce` folds an array into one value: a sum, an index object, a grouping, a string. The `reduce` polyfill is a classic task: it checks whether you know what the method does without an initial value, how it walks holes in an array and what it passes to the callback.

## What to do

`reduce(array, callback, initial?)` behaves like `array.reduce(callback, initial)`:

- the callback gets `(acc, value, index, array)`;
- without an initial value the accumulator is the first existing element and the walk starts from the next one;
- an empty array without an initial value throws a `TypeError`;
- holes (`[1, , 3]`) are skipped;
- an `initial` passed explicitly as `undefined` is still an initial value.

## Example

```ts
reduce([1, 2, 3], (sum, x) => sum + x, 10) // 16
reduce([1, 2, 3], (sum, x) => sum + x)     // 6, callback called for indexes 1 and 2
reduce([], (a, b) => a + b)                // TypeError
```

<!-- solution -->

## Solution idea

First decide where the accumulator comes from: `initial` if it was passed, otherwise the first existing element (skipping leading holes). Then walk the indexes up to the original length and call the callback only for indexes present in the array (`i in array`).

## Pitfalls

- **"Not passed" and "passed `undefined`" differ.** A default parameter cannot tell them apart, hence the `...initial` signature and the `initial.length` check.
- **Holes.** `array[i]` gives `undefined` for a hole, and the sum becomes `NaN`. The `i in array` check tells a hole from an explicit `undefined`.
- **The length is fixed up front.** If the callback appends elements, the built-in `reduce` does not visit them.
- **Checking the callback.** `reduce([1], 'x')` should throw a `TypeError`, not fail later with an obscure error.

## What they ask next

- How `reduceRight` differs and how to write it.
- How to express `map`, `filter` and grouping with `reduce` (and why `Object.groupBy` reads better).
- Why built-in prototypes must not be extended and how real polyfills are added (`core-js`).
