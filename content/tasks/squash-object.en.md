## Why it matters

A flat view of nested data is needed all the time: translation keys (`errors.email.required`), form field names in form libraries, logging, diffing configs, putting filters into a query string. The task checks a recursive walk and careful edge cases.

## What to do

`squash(value)` returns a new single-level object whose keys are dot-separated paths:

- nested objects are unfolded: `{ a: { b: 1 } }` → `{ 'a.b': 1 }`;
- arrays are walked by index: `{ tags: ['x'] }` → `{ 'tags.0': 'x' }`;
- an empty key adds no path segment: `{ a: { '': 1 } }` → `{ a: 1 }`;
- `null`, `undefined` and dates stay values, empty objects and arrays disappear;
- the input is not changed.

## Example

```ts
squash({ user: { name: 'Ann', roles: ['admin'] }, active: true })
// { 'user.name': 'Ann', 'user.roles.0': 'admin', active: true }
```

<!-- solution -->

## Solution idea

A recursive `walk(node, path)`: if the node is an object or an array, iterate `Object.entries` and descend, adding the key to the path (skipping an empty key); otherwise store the value under `path.join('.')`.

## Pitfalls

- **`typeof null === 'object'`.** Without a `null` check the recursion fails on `Object.entries(null)`.
- **Dates and other instances.** `Object.entries(new Date())` is empty, so the date vanishes without a trace. Values that are neither plain objects nor arrays are stored as they are.
- **String concatenation for the path.** Building `prefix + '.' + key` leaves a stray leading dot or a dot for an empty key; an array of segments and `join` is simpler.
- **Cycles.** An object that references itself sends the recursion into a stack overflow; if such data is possible, track the path in a `WeakSet`.

## What they ask next

- Write the inverse `unsquash`: from paths back to a nested object (and when a numeric segment means an array).
- How to escape dots inside keys.
- How to walk without recursion, on an explicit stack.
