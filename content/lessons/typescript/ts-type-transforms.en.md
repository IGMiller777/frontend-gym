## What this lesson covers

TypeScript can compute types from other types: make every field optional, extract a function's return type, build event names from field names. Three tools do this: mapped types, conditional types and template literal types. The built-in utilities (`Partial`, `ReturnType`, `Awaited`) are written with exactly these tools, and interviews often ask you to write one of them yourself.

## Mapped types

A mapped type walks over keys and builds a new object type. The `?` and `readonly` modifiers can be added and removed with `+` and `-`.

```ts check
type MyPartial<T> = { [K in keyof T]?: T[K] }
type MyReadonly<T> = { readonly [K in keyof T]: T[K] }
type Mutable<T> = { -readonly [K in keyof T]: T[K] }

type User = { readonly id: number; name: string }
const draft: MyPartial<User> = { name: "Ada" }
const frozen: MyReadonly<User> = { id: 1, name: "Ada" }
// @ts-expect-error: name is readonly now
frozen.name = "Bob"
const editable: Mutable<User> = { id: 1, name: "Ada" }
editable.id = 2
```

Keys can be renamed with `as` and template strings, and a key renamed to `never` disappears:

```ts check
type Getters<T> = { [K in keyof T & string as `get${Capitalize<K>}`]: () => T[K] }
type OnlyStrings<T> = { [K in keyof T as T[K] extends string ? K : never]: T[K] }

type User = { id: number; name: string; email: string }
type UserGetters = Getters<User> // { getId: () => number; getName: () => string; getEmail: () => string }
const g: UserGetters = { getId: () => 1, getName: () => "Ada", getEmail: () => "a@b.c" }
const s: OnlyStrings<User> = { name: "Ada", email: "a@b.c" }
```

## Conditional types

`A extends B ? X : Y` picks a type depending on whether `A` is assignable to `B`. Inside the condition, `infer` declares a type variable that TypeScript fills in itself: that is how you "extract" part of a type.

```ts check
type MyReturnType<F> = F extends (...args: never[]) => infer R ? R : never
type ElementOf<T> = T extends readonly (infer E)[] ? E : never
type Unwrap<T> = T extends Promise<infer V> ? Unwrap<V> : T

type A = MyReturnType<() => Date> // Date
type B = ElementOf<string[]> // string
type C = Unwrap<Promise<Promise<number>>> // number

const a: A = new Date()
const b: B = "x"
const c: C = 1
```

The built-in `Awaited<T>` does what `Unwrap` does, more carefully: it handles any thenable.

## Distribution over unions

If the checked type is a naked type parameter, the conditional type applies to **each** union member separately. `Exclude` and `Extract` are built on this.

```ts check
type MyExclude<T, U> = T extends U ? never : T
type Status = "idle" | "loading" | "done" | "error"
type Busy = MyExclude<Status, "idle" | "done"> // "loading" | "error"

type ToArray<T> = T extends unknown ? T[] : never
type NoDistribute<T> = [T] extends [unknown] ? T[] : never
type X = ToArray<string | number> // string[] | number[]
type Y = NoDistribute<string | number> // (string | number)[]

const busy: Busy = "loading"
const x: X = ["a", "b"]
const y: Y = ["a", 1]
```

To turn distribution off, wrap the parameter in a tuple: `[T] extends [U]`.

## Template literal types

Template strings work at the type level too. Combined with unions they multiply the options, and the built-in `Uppercase`, `Lowercase`, `Capitalize` and `Uncapitalize` change case.

```ts check
type Side = "top" | "right" | "bottom" | "left"
type Margin = `margin-${Side}` // "margin-top" | "margin-right" | ...
type EventName<T extends string> = `on${Capitalize<T>}`

const m: Margin = "margin-left"
const e: EventName<"click"> = "onClick"
// @ts-expect-error: not one of the four sides
const bad: Margin = "margin-center"
```

## Know when to stop

Complex computed types are hard to read and slow down checking. If a type takes more than a few lines, see whether it is simpler to write it out. Application code mostly needs the built-in utilities from [the next lesson](/learn/ts-utility-types).

## Key points

- A mapped type `{ [K in keyof T]: ... }` builds an object from keys; `?`, `readonly`, `-` and `as` shape the result.
- A conditional type `A extends B ? X : Y` with `infer` extracts parts of types.
- A naked parameter distributes over a union; `[T] extends [U]` turns that off.
- Template literal types build string types from parts.
- The built-in `Partial`, `ReturnType`, `Exclude` and `Awaited` are built with these same tools.
