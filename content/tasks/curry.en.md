## Why it matters

Currying turns `f(a, b, c)` into a chain `f(a)(b)(c)`. In practice it is partial application: fix some arguments and get a new function, such as `const logError = log('error')` or `const byId = sortBy('id')`. The task checks closures, the `...` operator and `Function.length`.

## What to build

`curry(fn)` returns a function that:

- collects arguments across calls until there are at least `fn.length` of them;
- accepts arguments in any groups: `f(1)(2)(3)`, `f(1, 2)(3)`, `f(1)(2, 3)` and `f(1, 2, 3)` give the same result;
- once enough arguments are collected, calls `fn` and returns its result, passing extra arguments to `fn` too;
- lets partially applied functions be reused: `const inc = add(1)` can be called many times.

## Example

```ts
const add = curry((a: number, b: number, c: number) => a + b + c)
add(1)(2)(3)  // 6
add(1, 2)(3)  // 6
const add10 = add(4, 6)
add10(1)      // 11
```

<!-- solution -->

## The idea

`curried(...args)` checks whether there are enough arguments. If so, it calls `fn(...args)`. If not, it returns a new function that appends the next arguments to the collected ones and calls `curried` again.

`fn.length` tells how many are needed: the number of declared parameters before the first one with a default value or a rest parameter.

## Pitfalls

- **A shared argument array.** If you collect arguments in one outer array (`let saved = []`), partial functions start to interfere: `add(1)` and `add(2)` write to the same place. In the solution every call creates a new closure with its own copy of `args`.
- **`fn.length` is not always honest.** `(a, b = 1) => …` has length 1, `(...args) => …` has length 0. `curry` calls such a function at once. If another arity is needed, pass it as a second parameter: `curry(fn, 3)`.
- **Zero parameters.** `curry(() => 42)()` must return 42 right away: zero arguments is already not less than `fn.length`.

## Follow-up questions

- How currying differs from partial application and from `fn.bind(null, a)`.
- How to keep `this` when the curried function is called as a method.
- How to type `curry` in TypeScript: recursive conditional types over the parameter tuple.
