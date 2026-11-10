## Why it matters

Sometimes the path to data is known only at runtime: a form field named `address.city`, a table column `user.profile.age`, a path from config. For a static path in code you write `obj?.a?.b ?? fallback` (optional chaining and `??`). For a path stored as a string you need something like lodash `_.get`. The task checks string parsing, handling `null` and `undefined`, and the difference between a "falsy" and a "missing" value.

## What to build

`get(obj, path, defaultValue)`:

- `path` is either a string like `'a.b[0].c'` or an array of keys `['a', 'b', 0, 'c']`;
- if `null` or `undefined` is met on the way, return `defaultValue`;
- if the final value is `undefined`, return `defaultValue` too;
- `0`, `''`, `false` and `null` at the end of the path are returned as they are.

## Example

```ts
const data = { users: [{ name: 'Ada' }] }
get(data, 'users[0].name')          // 'Ada'
get(data, 'users[5].name', 'guest') // 'guest'
```

<!-- solution -->

## The idea

First turn the string into a list of keys. The regular expression `/[^.[\]]+/g` finds every piece between dots and brackets: `'a.b[0].c'` gives `['a', 'b', '0', 'c']`. The index stays a string, which is fine for arrays: property keys are strings anyway.

Then walk the keys. Before each step check that the current value is not `null` or `undefined`, otherwise reading a property would throw `TypeError`. At the end use the default only when the result is `undefined`.

## Pitfalls

- `return current || defaultValue` breaks falsy values: `0` turns into the default. You need a check for `undefined` specifically.
- An `if (!current)` check inside the loop stops the walk at `0` or `''`, although a string has a readable `length`.
- Reading properties works on primitives too: `get({ s: 'abc' }, 's.length')` returns `3`, because the string is temporarily wrapped in a `String` object.

## Follow-up questions

- How it differs from `obj?.a?.b ?? d`: `??` uses the default for `null` too, `_.get` only for `undefined`.
- How to write the matching `set(obj, path, value)` that creates missing objects and arrays.
- How to guard `set` against `__proto__` and `constructor` keys (prototype pollution).
