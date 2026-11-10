## Why it matters

`JSON.stringify` is used all the time, but few know its rules: what happens to `undefined`, functions, `NaN`, dates and cycles. Writing it yourself means knowing all of them; the task also checks recursion and string escaping.

## What to do

`stringify(value)` returns the same as `JSON.stringify(value)` without indentation and replacer:

- `null`, booleans, numbers, strings; `NaN` and `±Infinity` give `null`;
- strings in quotes with `"`, `\`, `\n`, `\t` and other control characters escaped;
- in objects, properties whose value is `undefined`, a function or a symbol are skipped; in arrays they become `null`;
- a value with a `toJSON` method (a date, for example) serializes the result of `toJSON(key)`;
- wrappers `new Number`, `new String`, `new Boolean` become primitives;
- a cycle and a `BigInt` throw a `TypeError`; a shared reference without a cycle is fine;
- for `undefined` itself (and a function) the result is `undefined`.

## Example

```ts
stringify({ a: [1, undefined, () => 1], b: undefined, at: new Date(0), n: NaN })
// '{"a":[1,null,null],"at":"1970-01-01T00:00:00.000Z","n":null}'
```

<!-- solution -->

## Solution idea

A function `write(key, holder)` serializes `holder[key]`: that way the root can go through a wrapper `{ '': value }` and `toJSON` gets the right key. First apply `toJSON` and unwrap boxed primitives, then handle primitives by `typeof`. For objects and arrays keep a stack of objects on the current path: a repeat means a cycle.

## Pitfalls

- **A stack, not a visited set.** An object that appears twice in different branches is not a cycle; it is a cycle only if the object is already on the current path. So an object is pushed before its walk and popped after.
- **Skipping vs `null`.** `undefined` in an object disappears together with its key, but in an array it becomes `null`, otherwise the indexes would shift.
- **Escaping.** Control characters below `0x20` are written as `\uXXXX`.
- **`toJSON` before the type check.** A date is an object, but it serializes as a string precisely through `toJSON`.

## What they ask next

- Add the `replacer` (a function or a list of keys) and `space` (indentation) parameters.
- How to serialize `Map`, `Set` and `BigInt` (`toJSON` or a replacer) and how to restore them with a `reviver` in `JSON.parse`.
- Why `JSON.parse(JSON.stringify(x))` is a poor deep copy.
