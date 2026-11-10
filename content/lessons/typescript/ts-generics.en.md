## What this lesson covers

Generics let you write code that works with different types while keeping the link between them: "the function returns an item of the same type that is in the array". Without them the choice is between copying code for every type and `any`, which turns checking off. Interviews ask about generics through `keyof`, constraints and typing utilities.

## A type parameter

A type parameter goes in angle brackets, and TypeScript usually infers it from the arguments.

```ts check
function first<T>(items: T[]): T | undefined {
  return items[0]
}
const n = first([1, 2, 3]) // number | undefined
const s = first(["a", "b"]) // string | undefined

function firstAny(items: any[]) {
  return items[0]
}
const lost = firstAny([1, 2, 3]) // any: the link between input and output is gone
```

## Constraints with extends

`T extends Something` requires the substituted type to have the right shape. Inside the function you can use what the constraint guarantees.

```ts check
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b
}
longest("abc", "de") // string
longest([1, 2], [3]) // number[]
// @ts-expect-error: number has no length
longest(10, 20)
```

## keyof and indexed access

`keyof T` is the union of a type's keys, and `T[K]` is the type of the value at a key. Together with the constraint `K extends keyof T` they give type-safe property access: the key is checked and the result type is exact.

```ts check
function pick<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}
const user = { id: 1, name: "Ada", admin: true }
const name = pick(user, "name") // string
const admin = pick(user, "admin") // boolean
// @ts-expect-error: "email" is not a key of user
pick(user, "email")
```

## Generics in types and interfaces

Types, interfaces and classes can have parameters too, with optional defaults.

```ts check
interface ApiResponse<T, E = string> {
  data: T | null
  error: E | null
}
type User = { id: number; name: string }
const ok: ApiResponse<User[]> = { data: [{ id: 1, name: "Ada" }], error: null }

class Store<T> {
  #items = new Map<string, T>()
  set(id: string, item: T) {
    this.#items.set(id, item)
  }
  get(id: string): T | undefined {
    return this.#items.get(id)
  }
}
const users = new Store<User>()
users.set("1", { id: 1, name: "Ada" })
```

## When inference picks the wrong type

Sometimes TypeScript infers a parameter from the wrong argument. The `NoInfer<T>` utility (TypeScript 5.4) forbids inferring from a given position: the type comes from the other arguments and is only checked here.

```ts check
function createMachine<S extends string>(states: S[], initial: NoInfer<S>) {
  return { states, current: initial }
}
createMachine(["idle", "loading", "done"], "idle")
// @ts-expect-error: "oops" is not one of the states
createMachine(["idle", "loading", "done"], "oops")
```

Without `NoInfer`, TypeScript would add `"oops"` to the inferred `S`, and the mistake would go unnoticed.

The `const` modifier on a type parameter (TypeScript 5.0) infers literal types, as if the argument were passed with `as const`:

```ts check
function routes<const T extends readonly string[]>(paths: T) {
  return paths
}
const r = routes(["/", "/me"]) // readonly ["/", "/me"], not string[]
```

## When a generic is not needed

If a type parameter appears in the signature only once, it links nothing and only makes the code harder to read. `function log<T>(value: T): void` is no better than `function log(value: unknown): void`. A good generic links at least two places: an argument and the result, two arguments, a key and a value.

## Key points

- A generic keeps the type link between input and output; `any` loses it.
- `extends` constrains the parameter and gives access to the constraint's properties.
- `K extends keyof T` and `T[K]` give type-safe property access.
- `NoInfer<T>` (5.4) steers inference, `const T` (5.0) infers literals.
- A parameter used only once is not needed.
