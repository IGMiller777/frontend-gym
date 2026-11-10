## Why it matters

Nested arrays show up all the time: paginated API responses, menu trees, a `map` where every item returned an array. The language has `Array.prototype.flat(depth)` (since ES2019), but interviews ask you to write it yourself. It checks recursion, depth handling and details like holes in arrays.

## What to build

`flatten(arr, depth = Infinity)` returns a new array where nested arrays are unpacked at most `depth` levels deep:

- the input array is not changed;
- `depth = 0` gives a shallow copy, nested arrays stay the same objects;
- empty nested arrays simply disappear;
- holes in sparse arrays are skipped, as `.flat()` does;
- the built-in `.flat()` is not allowed.

## Example

```ts
flatten([1, [2, [3, [4]]]])     // [1, 2, 3, 4]
flatten([1, [2, [3, [4]]]], 1)  // [1, 2, [3, [4]]]
```

<!-- solution -->

## The idea

A recursive walk with a counter of the remaining depth. For each item: if it is an array and depth is left, go into it with `depth - 1`, otherwise push the item to the result.

Collect into one outer array `out` instead of concatenating arrays at every level: fewer copies.

## Pitfalls

- **Holes.** `[1, , 3]` has a hole at index 1. A `for (let i = 0; i < arr.length; i++)` loop reads `undefined` there and adds it, while `.flat()` skips the hole. `forEach`, `map` and `filter` skip holes by themselves, so the solution uses `forEach`.
- **Detecting arrays.** `Array.isArray` is more reliable than `instanceof Array`: the latter fails for arrays from another `iframe` or realm.
- **Spread on big data.** `out.push(...flatten(item))` on hundreds of thousands of items can throw `RangeError`: the number of function arguments is limited.
- **Recursion depth.** Very deep nesting hits the stack size. If asked, rewrite it with an explicit stack.

## Follow-up questions

- How `flatMap` differs from `map` + `flat()`: it is a single operation and flattens exactly one level.
- How to write an iterative version with a stack.
- How to make a lazy version with a generator (`function*` and `yield*`).
