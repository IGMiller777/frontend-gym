## What this lesson covers

TypeScript ships about twenty utilities that transform types. They save copying: an edit-form type, an API response without internal fields, the argument types of someone else's function are all derived from one source type. Here are the most useful ones with examples, plus `Record` and "branded" types.

## Objects: Partial, Required, Readonly, Pick, Omit

```ts check
interface User {
  id: number
  name: string
  email?: string
  createdAt: Date
}

type UserPatch = Partial<Omit<User, "id" | "createdAt">> // what a PATCH request may send
type UserPreview = Pick<User, "id" | "name">
type CompleteUser = Required<User> // email is required now
type FrozenUser = Readonly<User>

const patch: UserPatch = { name: "Ada" }
const preview: UserPreview = { id: 1, name: "Ada" }
const frozen: FrozenUser = { id: 1, name: "Ada", createdAt: new Date() }
// @ts-expect-error: readonly
frozen.name = "Bob"
// @ts-expect-error: email is missing
const complete: CompleteUser = { id: 1, name: "Ada", createdAt: new Date() }
```

`Readonly` is shallow: nested objects stay mutable. It is a compile-time check only; `Object.freeze` does not replace it, nor the other way round.

`Omit<T, K>` does not check that key `K` exists in `T`: a typo in the name just excludes nothing. `Pick` does check.

## Record

`Record<K, V>` is an object with keys `K` and values `V`. If `K` is a finite union, TypeScript requires every key, which suits dictionaries such as translations and per-state settings.

```ts check
type Status = "idle" | "loading" | "error"
const labels: Record<Status, string> = {
  idle: "Ready",
  loading: "Loading…",
  error: "Something went wrong",
}

// @ts-expect-error: "error" is missing
const partial: Record<Status, string> = { idle: "", loading: "" }

const counters: Record<string, number> = {}
counters.clicks = (counters.clicks ?? 0) + 1
```

With `Record<string, V>` every key is assumed to exist: `counters.anything` has type `number` even though it is `undefined`. The `noUncheckedIndexedAccess` flag fixes that, and so does a `Map`, whose `get` honestly returns `V | undefined`.

## Unions: Exclude, Extract, NonNullable

```ts check
type UiEvent = "click" | "keydown" | "scroll" | "resize"
type Input = Extract<UiEvent, "click" | "keydown"> // "click" | "keydown"
type Passive = Exclude<UiEvent, Input> // "scroll" | "resize"
type MaybeName = string | null | undefined
type Name = NonNullable<MaybeName> // string

const i: Input = "click"
const p: Passive = "scroll"
const n: Name = "Ada"
```

## Functions and classes: ReturnType, Parameters, Awaited, InstanceType

These utilities help when the type belongs to someone else's code: a library function, a factory, a class.

```ts check
async function fetchUser(id: number, opts?: { signal?: AbortSignal }) {
  return { id, name: "Ada" }
}
type FetchArgs = Parameters<typeof fetchUser> // [id: number, opts?: { signal?: AbortSignal }]
type FetchResult = Awaited<ReturnType<typeof fetchUser>> // { id: number; name: string }

class Cache {
  data = new Map<string, string>()
}
type CacheInstance = InstanceType<typeof Cache> // Cache

const args: FetchArgs = [1]
const result: FetchResult = { id: 1, name: "Ada" }
const cache: CacheInstance = new Cache()
```

## Branded types

Structural typing treats `UserId` and `OrderId` as the same `string`, so they are easy to mix up. A "brand" adds a fake field that does not exist at runtime, and such strings become incompatible.

```ts check
type Brand<T, B extends string> = T & { readonly __brand: B }
type UserId = Brand<string, "UserId">
type OrderId = Brand<string, "OrderId">

const toUserId = (raw: string) => raw as UserId // the only place where the cast happens
function loadUser(id: UserId) {
  return id
}

const uid = toUserId("u_1")
loadUser(uid)
const oid = "o_9" as OrderId
// @ts-expect-error: an OrderId is not a UserId
loadUser(oid)
// @ts-expect-error: a plain string is not a UserId either
loadUser("u_2")
```

The `as` cast happens in one place where the value is checked or created, such as a validation function.

## Key points

- `Partial`, `Required`, `Readonly`, `Pick` and `Omit` derive variants of an object type from one source; `Readonly` is shallow, `Omit` does not check keys.
- `Record<K, V>` with a finite `K` requires every key; with `string` every key seems to exist.
- `Exclude`, `Extract` and `NonNullable` filter unions.
- `ReturnType`, `Parameters`, `Awaited` and `InstanceType` take types from other people's functions and classes.
- Branded types keep identifiers of the same primitive type from being mixed up.
