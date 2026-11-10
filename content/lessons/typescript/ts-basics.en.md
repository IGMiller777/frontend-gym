## What this lesson covers

TypeScript is JavaScript with a type system that exists only at development time: the compiler checks the code and erases the types, and the browser gets plain JavaScript. Hence the main rule of this lesson: types check nothing at runtime. We will look at how TypeScript thinks about types, and at the most common interview question: how `type` differs from `interface`.

Code blocks in the TypeScript lessons are checked by the compiler in strict mode (`strict`). Lines where an error is expected carry `// @ts-expect-error`: if there were no error there, the check would fail.

## Structural typing

TypeScript compares types **by shape**, not by name. An object fits if it has every required property with the right type, whatever its own type was called.

```ts check
interface Point {
  x: number
  y: number
}
const label = { x: 1, y: 2, name: "A" }
const p: Point = label // OK: has x and y, extra name is fine

function len(p: Point) {
  return Math.hypot(p.x, p.y)
}
len({ x: 3, y: 4 })
// @ts-expect-error: object literal may only specify known properties
len({ x: 3, y: 4, z: 5 })
```

An extra property is fine in a variable but an error in an object literal passed straight as an argument. That is a separate check (the excess property check): nobody else uses the literal, so an extra field is most likely a typo.

## Inference and literal types

You can skip types where the value shows them: TypeScript infers them. Put annotations at the boundaries: function parameters, public APIs, data from outside.

`let` infers the general type (`string`), `const` the literal one (`"dark"`), because a constant will not change. `as const` makes a literal deeply readonly and keeps the exact values:

```ts check
let theme = "dark" // string
const mode = "dark" // "dark"
const sizes = ["s", "m", "l"] as const // readonly ["s", "m", "l"]
type Size = (typeof sizes)[number] // "s" | "m" | "l"

const s: Size = "m"
// @ts-expect-error: "xl" is not a Size
const bad: Size = "xl"
theme = mode
```

## any, unknown and never

| Type | Meaning | What you can do with it |
|---|---|---|
| `any` | checking is off | anything, and mistakes slip through |
| `unknown` | there is a value, its type is unknown | nothing until you narrow it with a check |
| `never` | no value can exist | used for unreachable code and exhaustive checks |

For data from outside (`JSON.parse`, `fetch`, `catch (e)`) use `unknown`, not `any`: the compiler makes you check the value before using it.

```ts check
function parse(json: string): unknown {
  return JSON.parse(json)
}
const data = parse('{"name":"Ada"}')
// @ts-expect-error: 'data' is of type 'unknown'
data.name
if (typeof data === "object" && data !== null && "name" in data && typeof data.name === "string") {
  console.log(data.name.toUpperCase())
}
```

## satisfies

An annotation `const x: T = ...` checks the value, but the variable's type becomes `T` and the exact information is lost: TypeScript no longer knows that `blue` is an object and `red` is a string. The `satisfies` operator (TypeScript 4.9) checks the value against a type and **keeps** the inferred type.

```ts check
type Color = string | { r: number; g: number; b: number }

const annotated: Record<string, Color> = { red: "#f00", blue: { r: 0, g: 0, b: 255 } }
// @ts-expect-error: Color may be a string, so .b is unknown
annotated.blue.b

const palette = { red: "#f00", blue: { r: 0, g: 0, b: 255 } } satisfies Record<string, Color>
palette.blue.b // ok: the exact type is kept
palette.red.toUpperCase() // ok: TS knows it is a string
// @ts-expect-error: satisfies still checks the value
const typo = { red: 42 } satisfies Record<string, Color>
```

## type and interface

Both describe the shape of an object, and for objects they are interchangeable in most cases. The differences:

| | `interface` | `type` |
|---|---|---|
| Unions, tuples, primitives, conditional and mapped types | no | yes |
| Declaring twice | merges (declaration merging) | error "Duplicate identifier" |
| Extending | `extends`; conflicting properties are an error | `&`; a conflict turns the property into `never` |

```ts check
interface Window2 {
  title: string
}
interface Window2 {
  width: number
}
const w: Window2 = { title: "a", width: 1 } // both declarations merged

// @ts-expect-error: duplicate identifier 'Id'
type Id = string
// @ts-expect-error: duplicate identifier 'Id'
type Id = number
```

Interface merging exists to augment types you do not own: for example, add your own field to `Window` or to a library's types. A practical rule: `interface` for objects and classes, especially in public APIs; `type` for unions, tuples and computed types.

## Key points

- Types are erased at compile time and check nothing at runtime.
- Compatibility is structural: the shape matters, not the type's name.
- Annotate at the boundaries, rely on inference inside; `as const` keeps literals.
- Use `unknown` for outside data, not `any`.
- `satisfies` checks a value and keeps its exact type.
- `interface` merges when declared twice, `type` does not; unions need `type`.
