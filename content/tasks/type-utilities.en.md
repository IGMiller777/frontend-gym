## Why it matters

`typeof` lies in two places: `typeof null === "object"` and `typeof [] === "object"`. Type-check utilities live in every library (lodash, validators, serializers), and `isPlainObject` is needed wherever plain objects are walked recursively while class instances and dates are left as they are.

## What to do

- `isArray(value)`: an array, including arrays from other windows and iframes.
- `isFunction(value)`: any function, including classes, async functions and generators.
- `isObject(value)`: an object or a function, but not `null`.
- `isPlainObject(value)`: an object created by a `{}` literal, `new Object()` or `Object.create(null)`; arrays, dates and class instances do not qualify.

## Example

```ts
isObject(null)              // false
isObject(() => {})          // true
isPlainObject({ a: 1 })     // true
isPlainObject(new Date())   // false
isPlainObject(Object.create(null)) // true
```

<!-- solution -->

## Solution idea

`Array.isArray` and `typeof value === 'function'` cover the first two. For `isObject`, exclude `null` and check `typeof` for `object` or `function`. For `isPlainObject`, look at the prototype: a plain object has `Object.prototype` or `null` as its prototype.

## Pitfalls

- **`instanceof Array` breaks across windows.** An array from an iframe has its own `Array`, so `arr instanceof Array` is `false`; `Array.isArray` works.
- **`Object.prototype.toString.call(x) === "[object Object]"`** treats class instances as plain too, and `Symbol.toStringTag` can fake the result.
- **Wrapper objects.** `new String('x')` is an object, but not a plain one.

## What they ask next

- How to tell `NaN` from other numbers and why `isNaN` and `Number.isNaN` differ.
- How TypeScript turns such functions into type narrowing (`value is unknown[]`).
- How to check that a value looks like a promise (a thenable).
