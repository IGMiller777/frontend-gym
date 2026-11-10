## What this lesson covers

A variable of type `string | number` or `User | null` is useless until you know what it holds right now. **Narrowing** is how TypeScript uses the checks in your code to work out a more precise type in a given branch. We cover every way to narrow, discriminated unions, exhaustiveness checks with `never`, and your own type guards.

## Built-in checks

TypeScript understands ordinary JavaScript checks and narrows the type inside the branch:

| Check | Narrows to |
|---|---|
| `typeof x === "string"` | a primitive type |
| `x instanceof Date` | a class instance |
| `"swim" in animal` | the union member that has that property |
| `x === null`, `x === "admin"` | a specific value |
| `if (x)` | drops `null`, `undefined` and other falsy values |
| `Array.isArray(x)` | an array |

```ts check
function format(value: string | number | Date | null) {
  if (value === null) return "—"
  if (typeof value === "number") return value.toFixed(2)
  if (value instanceof Date) return value.toISOString()
  return value.toUpperCase() // only string is left
}
```

After a `return` in a branch, TypeScript removes that case from the rest of the function too: this is control flow analysis.

Careful with truthiness checks: `if (count)` also drops `0`, and `if (name)` drops an empty string. For "has a value", `count !== undefined` or `name != null` is more precise.

## Discriminated unions

The most useful technique for states and events: every union member has a common field with a literal value (the discriminant). Checking that field narrows the whole object.

```ts check
type State =
  | { status: "loading" }
  | { status: "success"; data: string[] }
  | { status: "error"; error: Error }

function render(state: State) {
  switch (state.status) {
    case "loading":
      return "Loading…"
    case "success":
      return state.data.join(", ")
    case "error":
      return state.error.message
  }
}
```

This model cannot describe an impossible state, such as `data` and `error` at once, unlike an object with three optional fields.

## Exhaustiveness with never

When someone adds a new member to the union, you want the compiler to point at every `switch` that forgot to handle it. To get that, assign the value to a `never` variable in the `default` branch: only unhandled members can reach it.

```ts check
type Shape = { kind: "circle"; r: number } | { kind: "square"; side: number } | { kind: "triangle"; base: number; h: number }

function area(s: Shape): number {
  switch (s.kind) {
    case "circle":
      return Math.PI * s.r ** 2
    case "square":
      return s.side ** 2
    default: {
      // @ts-expect-error: "triangle" is not handled, so s is not never
      const unhandled: never = s
      return unhandled
    }
  }
}
```

## Your own type guards

When the built-in checks are not enough, write a function whose return type is a predicate `value is T`. If it returns `true`, the type is narrowed in the calling code.

```ts check
interface Fish {
  swim(): void
}
interface Bird {
  fly(): void
}
function isFish(pet: Fish | Bird): pet is Fish {
  return "swim" in pet
}
function move(pet: Fish | Bird) {
  if (isFish(pet)) pet.swim()
  else pet.fly()
}
```

The compiler does not verify that the predicate is honest: if `isFish` is wrong, the types will lie. Keep such functions short and cover them with tests.

Since TypeScript 5.5, predicates are **inferred** for simple functions, so `filter` finally narrows the array type:

```ts check
const values = [1, null, 2, undefined, 3]
const numbers = values.filter((v) => v != null) // number[]
numbers.map((n) => n.toFixed(1))
```

## Assertion functions

A function typed `asserts value is T` (TypeScript 3.7) returns nothing and throws if the condition fails. After the call, the type stays narrowed until the end of the block. Handy for validating input and invariants.

```ts check
function assertDefined<T>(value: T, message: string): asserts value is NonNullable<T> {
  if (value == null) throw new Error(message)
}
function greet(name: string | undefined) {
  assertDefined(name, "name is required")
  return name.toUpperCase()
}
```

## Key points

- TypeScript narrows on ordinary checks: `typeof`, `instanceof`, `in`, comparisons, truthiness, `Array.isArray`.
- Discriminated unions with a literal field are the best way to describe states.
- `const x: never = value` in `default` turns a forgotten member into a compile error.
- A `value is T` predicate narrows the type for the caller; since 5.5 simple predicates are inferred.
- `asserts value is T` throws and narrows the type after the call.
