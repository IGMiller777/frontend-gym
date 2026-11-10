## What this lesson covers

In the [first lesson](/learn/js-types) we saw that objects are passed by reference. That raises practical questions: how to copy an object, how to forbid changes, when to use `Map` instead of a plain object, and why memory can leak in the browser even though garbage collection is automatic.

## Shallow copy

Spread (`{ ...obj }`, `[...arr]`) and `Object.assign()` copy only the top level. Nested objects stay shared: only the reference to them is copied.

```js run
const original = { name: "Ann", address: { city: "Paris" } }
const shallow = { ...original }
shallow.name = "Bob"
shallow.address.city = "Rome"
console.log(original.name, original.address.city)
```

```output
Ann Rome
```

For immutable state updates (React, Redux) this is usually enough: you copy exactly the levels you change, `{ ...state, address: { ...state.address, city: "Rome" } }`, and unchanged parts are reused.

## Deep copy

The built-in way is `structuredClone()`. It copies nested objects and arrays, `Date`, `RegExp`, `Map`, `Set`, typed arrays and even circular references. It does not copy functions or DOM nodes: it throws `DataCloneError` on them. Class instances lose their prototype and become plain objects.

The old trick `JSON.parse(JSON.stringify(obj))` works only for plain data: dates become strings, `Map` and `Set` become empty objects, `undefined` and functions disappear, and `BigInt` or circular references throw.

```js run
const event = { title: "Meetup", when: new Date(Date.UTC(2026, 0, 15)), tags: new Set(["js"]) }
const viaJson = JSON.parse(JSON.stringify(event))
const viaClone = structuredClone(event)
console.log(typeof viaJson.when, JSON.stringify(viaJson.tags))
console.log(viaClone.when instanceof Date, viaClone.tags.has("js"))
try {
  structuredClone({ run() {} })
} catch (e) {
  console.log(e.name)
}
```

```output
string {}
true true
DataCloneError
```

## Immutability

`const` protects only the variable: you cannot reassign it, but you can change the object it refers to. To forbid changes to the object itself there are three levels:

| Method | Add | Delete | Change values |
|---|---|---|---|
| `Object.preventExtensions()` | no | yes | yes |
| `Object.seal()` | no | no | yes |
| `Object.freeze()` | no | no | no |

All three are shallow: nested objects stay mutable. In strict mode, changing a frozen object throws `TypeError`; in sloppy mode it is silently ignored.

```js run
const config = Object.freeze({ port: 80, db: { host: "a" } })
try {
  config.port = 8080
} catch (e) {
  console.log(e.name)
}
config.db.host = "b"
console.log(config.port, config.db.host, Object.isFrozen(config.db))
```

```output
TypeError
80 b false
```

## Map and Set instead of objects

A plain object is good as a record with known fields and for JSON. For a dictionary whose keys are added at runtime, `Map` fits better:

- any value can be a key, including an object (object keys are always strings or symbols);
- it has `size`, and iteration order is insertion order;
- no inherited keys: for a plain object `"toString" in {}` is true, because `toString` is on the prototype.

```js run
const visits = new Map()
const page = { url: "/home" }
visits.set(page, 3).set("total", 10)
console.log(visits.get(page), visits.size, visits.has("toString"))
const dict = {}
console.log("toString" in dict)
```

```output
3 2 false
true
```

`Set` stores unique values: `[...new Set(arr)]` removes duplicates from an array.

## Garbage collection and leaks

The garbage collector frees memory in JavaScript. Modern engines use mark-and-sweep: starting from roots (the global object, the current call stack), they mark every object reachable through references and remove the rest. So a leak in JavaScript is not "forgot to free" but "accidentally kept a reference". Typical sources:

- an event listener or subscription not removed when leaving a page or unmounting a component;
- a `setInterval` that keeps running;
- a cache in a `Map` or global array that only grows;
- a DOM node removed from the page but still stored in a variable;
- a closure holding large data.

The Memory panel in DevTools helps: comparing two heap snapshots shows which objects pile up.

## WeakMap and WeakSet

`WeakMap` is like `Map` but does not keep its keys alive: if nothing else references a key object, the collector may remove it together with its entry. The price: only objects (and non-registered symbols) can be keys, and you cannot iterate the collection, get its size or clear it.

```js
const meta = new WeakMap()
function track(node) {
  meta.set(node, { seenAt: Date.now() })
}
// When node is removed from the DOM and forgotten, the entry goes away too.
```

`WeakMap` suits data attached to someone else's object: metadata for DOM nodes, a cache of results per object, private instance data. `WeakRef` and `FinalizationRegistry` give even lower-level control, but the timing of garbage collection is not guaranteed, and MDN advises avoiding them when possible.

## Key points

- Spread and `Object.assign` copy one level; `structuredClone()` copies deeply but without functions and prototypes.
- `JSON.parse(JSON.stringify())` loses dates, `Map`, `Set`, `undefined` and fails on cycles and `BigInt`.
- `const` does not make an object immutable; `Object.freeze()` does, but only shallowly.
- `Map` for dictionaries with dynamic keys, plain objects for records and JSON.
- A leak is a forgotten reference; `WeakMap` stores data about an object without extending its life.
