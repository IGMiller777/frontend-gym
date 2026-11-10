## Why it matters

`call`, `apply` and `bind` set `this` for a call. Writing `call` without them means knowing the core rule of `this`: in `obj.method()` the method sees `this === obj`. The task checks that rule, `Symbol` and care with side effects.

## What to do

`callWith(fn, thisArg, ...args)` calls `fn` with `this === thisArg` and the arguments `args`, and returns the result:

- without `fn.call`, `fn.apply`, `fn.bind` and `Reflect.apply`;
- a `thisArg` of `null` or `undefined` means a plain call;
- the object stays as it was after the call, even if `fn` throws;
- existing properties of the object are not overwritten.

## Example

```ts
function greet(greeting: string) {
  return `${greeting}, ${this.name}`
}
callWith(greet, { name: 'Ann' }, 'Hi') // 'Hi, Ann'
```

<!-- solution -->

## Solution idea

Temporarily put the function on the object under a unique `Symbol()` key and call it as a method: `target[key](...args)`. A call through a dot points `this` at the object. Remove the temporary property in `finally`.

## Pitfalls

- **A string key overwrites someone's property.** `obj.fn = fn` breaks an object that already has `fn`. A symbol is guaranteed unique and invisible to `Object.keys`.
- **Cleanup on error.** Without `finally`, an exception leaves the temporary property on the object.
- **Primitives.** You cannot add a property to a string or a number, so `Object(thisArg)` boxes them into a wrapper object. The real `call` passes the primitive as is: in a strict function `typeof this` stays `"string"`, while ours gives `"object"`. That cannot be reproduced without the built-ins.
- **A frozen object.** No property can be added to `Object.freeze(obj)`. A workaround is `Object.create(obj)`: `this` is then a descendant, not the object itself.

## What they ask next

- Write `apply` (arguments as an array) and `bind` (with partial application and `new` support).
- Why a bound function cannot be re-bound by a second `bind`.
- Why `call` does not change `this` of an arrow function.
