## What this lesson covers

Knowing the type syntax is not enough: interviews ask how TypeScript is configured in a project, why new codebases avoid `enum`, how to type someone else's JavaScript library and how not to trust data from the network. Here: `tsconfig` settings, what changed in TypeScript 6 and 7, running `.ts` without a build, overloads, declaration files and runtime validation.

## tsconfig: what to turn on

| Option | Why |
|---|---|
| `strict` | turns on the strict family: `strictNullChecks`, `noImplicitAny` and others. On by default since TypeScript 6.0 |
| `noUncheckedIndexedAccess` | `arr[i]` and `record[key]` get type `T \| undefined`: an index access may miss |
| `exactOptionalPropertyTypes` | `email?: string` cannot be explicitly set to `undefined`: "no field" and "a field holding `undefined`" differ |
| `verbatimModuleSyntax` | type-only imports are written as `import type`, everything else is kept as is; bundlers and Node.js can read the file without type analysis |
| `erasableSyntaxOnly` | forbids syntax that cannot simply be erased: `enum`, `namespace` with code, constructor parameter properties |
| `moduleResolution: "bundler"` | resolves imports the way Vite and other bundlers do |

```ts check
const list: string[] = ["a"]
const item = list[5] // string, but undefined at runtime: noUncheckedIndexedAccess would add | undefined
const upper = item?.toUpperCase()
```

## TypeScript 6 and 7

TypeScript 6.0 is a transition release: `strict`, `module: "esnext"` and a current-year `target` (now `es2025`) became the defaults, and deprecated options (`baseUrl`, `moduleResolution: "node"`, `target: "es5"`, `outFile`, AMD and UMD modules) produce warnings. TypeScript 7.0 is the native port of the compiler with parallel type checking: the language is the same, builds and the editor are faster, and the options deprecated in 6.0 are removed. The migration order: upgrade to 6.0, clear every warning, then move to 7.

## Running without a build, and erasable syntax

Node.js runs `.ts` files directly: since versions 22.18 and 23.6, type stripping is on by default. Types are replaced with whitespace, **nothing is type-checked**, and `tsconfig.json` is ignored. So the code must consist of erasable syntax, which is exactly what `erasableSyntaxOnly` checks.

`enum` is not erasable: it becomes an object at runtime. Use a union of literals or an `as const` object instead:

```ts check
const Status = {
  Idle: "idle",
  Loading: "loading",
  Done: "done",
} as const
type Status = (typeof Status)[keyof typeof Status] // "idle" | "loading" | "done"

function show(status: Status) {
  return status === Status.Loading ? "…" : status
}
show(Status.Done)
show("idle") // plain strings work too, unlike a string enum
```

## Overloads

When the result depends on the argument type, write several overload signatures and one implementation compatible with all of them. Callers see only the overload signatures.

```ts check
function parse(input: string): number
function parse(input: string[]): number[]
function parse(input: string | string[]): number | number[] {
  return Array.isArray(input) ? input.map(Number) : Number(input)
}
const one = parse("42") // number
const many = parse(["1", "2"]) // number[]
```

A union parameter or a generic often does the job instead of overloads. Overloads pay off when the input-to-output link cannot be expressed in one signature.

## Declaration files

Types for JavaScript code live in `.d.ts` files with the `declare` keyword: it says "this exists at runtime, here is its type" without generating code.

- Popular libraries ship types in the package itself or in `@types/name` (the DefinitelyTyped repository).
- For a package without types: `declare module "legacy-lib" { export function run(): void }` in a `.d.ts` file.
- A global value from a script on the page: `declare global { interface Window { analytics: Analytics } }`.

## Outside data is untyped

The annotation `const user = (await res.json()) as User` checks nothing: if the server returns something else, the error surfaces far from where it could be understood. At the boundaries (API responses, `localStorage`, URL parameters, `postMessage`) validate data at runtime: with your own predicate function or a schema library (Zod, Valibot) that also infers the type from the schema.

```ts check
interface User {
  id: number
  name: string
}
function isUser(value: unknown): value is User {
  return typeof value === "object" && value !== null && "id" in value && typeof value.id === "number" && "name" in value && typeof value.name === "string"
}
async function loadUser(res: Response): Promise<User> {
  const data: unknown = await res.json()
  if (!isUser(data)) throw new Error("Unexpected response shape")
  return data
}
```

## Key points

- Turn on `strict` (default since 6.0), `noUncheckedIndexedAccess`, `verbatimModuleSyntax`; `erasableSyntaxOnly` for running without a build.
- TypeScript 6.0 prepares for 7.0, the native and faster compiler: clear the 6.0 warnings first.
- Node.js erases types and does not check them; replace `enum` with a literal union or an `as const` object.
- Overloads are several signatures plus one compatible implementation.
- `.d.ts` and `declare` describe someone else's JavaScript; outside data is validated at runtime.
