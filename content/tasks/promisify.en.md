## Why it matters

Older Node.js APIs and many libraries take an `(error, result)` callback as the last argument. `promisify` turns them into functions that return a promise, so you can `await` them. Node.js has `util.promisify`; the task checks whether you understand how it works, including `this`.

## What to do

`promisify(fn)` returns a function that:

- calls `fn` with the same arguments plus a callback at the end;
- fulfills with `result` if `error` is falsy (`null` or `undefined`), and rejects otherwise;
- passes to `fn` the same `this` it was itself called with;
- works whether the callback is called asynchronously or synchronously.

## Example

```ts
const readFile = (path: string, cb: (err: Error | null, data?: string) => void) => setTimeout(() => cb(null, 'content'), 10)
const readFileAsync = promisify<string>(readFile)
await readFileAsync('/a.txt') // 'content'
```

<!-- solution -->

## Solution idea

Return a regular (not arrow) function: only it has its own `this`. Inside, create a promise whose callback calls `reject` or `resolve`, and call `fn` with the original `this` and the arguments plus the callback.

## Pitfalls

- **An arrow wrapper loses `this`.** An object method turned into a promise stops seeing the object's fields.
- **A `null` error is not an error.** Check `if (error)`, not `error !== undefined`.
- **The callback called twice.** The promise ignores the second call, but in a real library it signals a bug.

## What they ask next

- How `util.promisify` supports functions with several results (`util.promisify.custom`).
- The reverse task, `callbackify`.
- Why `setTimeout` has long been available as a promise (`timers/promises` in Node.js).
