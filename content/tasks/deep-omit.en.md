## Why it matters

Drop technical or secret fields before logging or sending data: `password`, `token`, `__typename`, `_id`. Such fields can sit at any depth, including inside arrays of objects. The task checks recursion and immutable updates.

## What to do

`deepOmit(value, keys)` returns a copy of `value` without the keys from `keys` in every nested plain object and array:

- primitives are returned as they are;
- arrays are walked element by element;
- the input is not changed.

## Example

```ts
deepOmit({ id: 1, password: 'x', items: [{ password: 'y', ok: true }] }, ['password'])
// { id: 1, items: [{ ok: true }] }
```

<!-- solution -->

## Solution idea

A recursive walk with three branches: an array (`map` over the elements), a plain object (a new object without the banned keys, values walked recursively), anything else returned as is. Put the keys into a `Set` so each check is O(1).

## Pitfalls

- **Mutation.** `delete obj.password` on the input object corrupts the caller's data.
- **Dates, `Map` and class instances.** Walked as plain objects, a date turns into an empty `{}`. Only plain objects are walked.
- **`keys.includes` in a loop.** With many keys and big data that is O(n·m); a `Set` makes each check O(1).

## What they ask next

- Write the inverse `deepPick`: keep only the given keys.
- How to support paths (`'user.password'`) instead of key names.
- How to do the same with `JSON.stringify` and a replacer function, and why that is worse.
