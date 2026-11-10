## Why it matters

`===` compares objects by reference: two different `{ a: 1 }` objects are not equal. Comparing by content is needed in tests (`toEqual` in Vitest and Jest), when checking whether form data changed, and when caching by request parameters. The task checks recursion, knowledge of types and care with edge cases.

## What to build

`deepEqual(a, b)` returns `true` when the values are equal by content:

- primitives are compared with `Object.is`: `NaN` equals `NaN`, `1` does not equal `'1'`;
- arrays and plain objects are equal when they have the same own enumerable keys with values equal by the same rules; key order does not matter;
- an array is not equal to an object with the same keys;
- dates are compared by time;
- an object with an extra key, even one holding `undefined`, is not equal to an object without it;
- circular references do not cause infinite recursion.

## Example

```ts
deepEqual({ tags: ['a'], at: new Date(0) }, { tags: ['a'], at: new Date(0) }) // true
deepEqual({ a: 1, b: undefined }, { a: 1 })                                // false
```

<!-- solution -->

## The idea

Cheap checks first: if `Object.is(a, b)`, the values are equal. If either one is not an object or is `null` and `Object.is` already said `false`, they differ.

For objects compare prototypes: that way an array never matches a plain object, and a date never matches an object without the `Date` prototype. Compare dates with `getTime()`. Then the key lists: lengths must match, and every key of `a` must be an own key of `b` with an equal value.

For cycles keep a `Map` of pairs already being compared higher up the recursion. When the same pair comes again, treat it as equal: if there is a difference somewhere, another branch will find it.

## Pitfalls

- **`JSON.stringify(a) === JSON.stringify(b)`** depends on key order, drops `undefined`, turns `NaN` into `null` and throws on cycles.
- **Checking only the key count.** `{ a: 1, b: undefined }` and `{ a: 1, c: undefined }` have the same count, so `Object.hasOwn(b, key)` is needed.
- **`typeof null === 'object'`.** Without an explicit `null` check the code tries to read its keys.

## Follow-up questions

- How to add `Map`, `Set`, `RegExp` and typed arrays.
- How `toEqual` differs from `toStrictEqual` in Vitest: the latter respects `undefined` properties and classes.
- Why React props use a shallow comparison (`shallowEqual`) rather than a deep one.
