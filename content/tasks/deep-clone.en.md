## Why it matters

Spread (`{ ...obj }`) and `Object.assign` copy only the top level: nested objects stay shared, and editing the copy changes the original. A deep copy is needed for form drafts, undo, immutable updates of complex state. Modern code has the built-in `structuredClone` for it. Interviews ask you to write your own to check recursion, type handling and circular references.

## What to build

`deepClone(value)` returns a deep copy:

- primitives are returned as they are;
- arrays stay arrays, plain objects stay plain objects;
- a `Date` is copied into a new `Date`; `Map` and `Set` are copied with their contents;
- circular references are supported: the copy refers to itself;
- a shared reference stays shared: if `a.x === a.y`, then `copy.x === copy.y`;
- functions are copied by reference;
- `structuredClone` is not allowed.

## Example

```ts
const draft = deepClone(form)
draft.address.city = 'Berlin'
form.address.city // unchanged
```

<!-- solution -->

## The idea

Recursion plus a `WeakMap` "original → copy". Before copying an object, look it up in the `WeakMap`: if it is already copied, return that copy. This handles both cycles and shared references.

Register the copy **before** recursing: in a cycle the object meets itself before its own copy is finished.

Special types are created with their constructors: `new Date(time)`, `new Map()`, `new Set()`, `new RegExp(source, flags)`. For arrays and objects copy own enumerable keys and keep the prototype with `Object.create(Object.getPrototypeOf(value))`.

The `WeakMap` does not block garbage collection: after copying, the table goes away together with its references to the originals.

## Pitfalls

- **`JSON.parse(JSON.stringify(x))`** drops `undefined` and functions, turns a `Date` into a string, `Map` and `Set` into `{}`, and throws `TypeError` on a cycle.
- **Registering after recursion** overflows the stack on a cycle.
- **`structuredClone` in real code** is usually the right choice, but it has limits: functions and DOM nodes throw `DataCloneError`, class prototypes are not kept, getters become plain values.

## Follow-up questions

- When copying is not needed at all: immutable updates with spread along the changed path, or libraries such as Immer.
- What to do with classes that have private `#x` fields: they cannot be copied from outside.
- How to copy symbol keys and non-enumerable properties (`Reflect.ownKeys`, `Object.getOwnPropertyDescriptors`).
