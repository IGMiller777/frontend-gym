## What this lesson covers

In the [previous lesson](/learn/js-types) we looked at values. Now let us see where the variables holding them live: which part of the code can see a variable, what hoisting and the temporal dead zone are, and how closures work. Closures power debounce, memoization, React hooks and modules, so they come up in almost every interview.

## Lexical scope

Scope decides which part of the code can access a variable. In JavaScript it is **lexical**: it is determined by where the variable is declared in the source, not by where a function is called from. Inner code sees outer variables, not the other way round.

There are four levels:

| Level | Created by |
|---|---|
| Global | code outside functions in a classic script |
| Module | a module file (`import` and `export`): its variables are invisible outside unless exported |
| Function | every function |
| Block | any curly braces: `if`, `for`, a bare `{ }` (for `let`, `const` and `class`) |

## var, let and const

`var` is visible in the whole function where it is declared and ignores blocks. `let` and `const` are visible only inside their block. `const` forbids reassigning the variable but not changing the object it refers to.

```js run
function demo() {
  if (true) {
    var a = 1
    let b = 2
  }
  console.log(typeof a, typeof b)
}
demo()
```

```output
number undefined
```

In a classic (non-module) script a top-level `var` also becomes a property of `window`, while `let` and `const` do not. Modern code does not use `var`.

## Hoisting and the temporal dead zone

Before running a block or function, the engine creates all variables declared in it up front. This is called **hoisting**: the code seems to see declarations before reaching them. The difference is what a variable holds before its declaration line:

- `var` already exists and equals `undefined`;
- a function declaration (`function f() {}`) is fully available, you can call it above its line;
- `let`, `const` and `class` exist but are not initialized. Accessing them before the declaration line throws `ReferenceError`. That stretch of code is called the **temporal dead zone** (TDZ).

```js run
console.log(typeof hoisted, typeof sayHi)
var hoisted = 1
function sayHi() {}
try {
  console.log(later)
} catch (e) {
  console.log(e.name)
}
let later = 2
```

```output
undefined function
ReferenceError
```

Even `typeof` does not escape the dead zone: `typeof later` before the declaration also throws `ReferenceError`, although for an undeclared variable it would return `"undefined"`.

## Closure

> **A closure** is a function together with a reference to the environment it was created in. The function keeps seeing that environment's variables even after the outer function has returned.

Every call of the outer function creates a new environment, so every closure gets its own copy of the state.

```js run
function makeCounter() {
  let count = 0
  return () => ++count
}
const c1 = makeCounter()
const c2 = makeCounter()
c1()
c1()
console.log(c1(), c2())
```

```output
3 1
```

`count` cannot be reached from outside except through the returned function. JavaScript code used this for private state long before classes got private fields.

## The loop puzzle

The best-known closure puzzle: functions created in a loop.

```js run
const withVar = []
for (var i = 0; i < 3; i++) withVar.push(() => i)
const withLet = []
for (let j = 0; j < 3; j++) withLet.push(() => j)
console.log(withVar.map((f) => f()).join(","), withLet.map((f) => f()).join(","))
```

```output
3,3,3 0,1,2
```

With `var` there is one `i` for the whole function; all three closures refer to it, and by the time they run it equals `3`. With `let` the loop creates a new `j` binding on every iteration, and each closure remembers its own value. Interviewers often show the same puzzle with `setTimeout(() => console.log(i))`: the cause is the same.

## Closures in practice

- **Debounce, throttle, memoize** keep their timer or cache in a closure.
- **React hooks.** A handler created during a render sees the state values of that render. If an effect or timer outlives it, it keeps seeing old values: this is called a stale closure.
- **Memory.** While a closure is alive, so are the variables it refers to. An event handler that holds a large array and is never removed keeps the array in memory too.

## Key points

- Scope is lexical: the declaration site matters, not the call site.
- `var` is visible in the whole function, `let` and `const` only in their block.
- Before their declaration line `let`, `const` and `class` are in the dead zone and throw `ReferenceError`; `var` is `undefined`.
- A closure is a function plus the environment it was created in; each call of the outer function creates a new environment.
- `let` in a loop creates a new binding per iteration, `var` one for all of them.
