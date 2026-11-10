## О чём урок

В TypeScript встроено около двадцати утилит, которые преобразуют типы. Они избавляют от копирования: тип формы редактирования, тип ответа API без служебных полей, тип аргументов чужой функции выводятся из одного исходного типа. Здесь самые нужные из них с примерами, а также `Record` и «брендированные» типы.

## Объекты: Partial, Required, Readonly, Pick, Omit

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

`Readonly` поверхностный: вложенные объекты остаются изменяемыми. Это проверка только во время компиляции, `Object.freeze` её не заменяет и наоборот.

`Omit<T, K>` не проверяет, что ключ `K` существует в `T`: опечатка в имени просто ничего не исключит. `Pick` проверяет.

## Record

`Record<K, V>` это объект с ключами `K` и значениями `V`. Если `K` конечное объединение, TypeScript требует все ключи, и это удобно для словарей вроде переводов и настроек по состояниям.

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

С `Record<string, V>` любой ключ считается существующим: `counters.anything` имеет тип `number`, хотя там `undefined`. Это закрывает флаг `noUncheckedIndexedAccess` или `Map`, у которой `get` честно возвращает `V | undefined`.

## Объединения: Exclude, Extract, NonNullable

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

## Функции и классы: ReturnType, Parameters, Awaited, InstanceType

Эти утилиты нужны, когда тип принадлежит чужому коду: функции из библиотеки, фабрике, классу.

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

## Брендированные типы

Структурная типизация считает `UserId` и `OrderId` одним и тем же `string`, и их легко перепутать. «Бренд» добавляет к типу фиктивное поле, которого нет во время выполнения, и такие строки становятся несовместимыми.

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

Приведение `as` делается в одном месте, где значение проверяется или создаётся, например в функции валидации.

## Главное

- `Partial`, `Required`, `Readonly`, `Pick`, `Omit` выводят варианты объектного типа из одного источника; `Readonly` поверхностный, `Omit` не проверяет ключи.
- `Record<K, V>` с конечным `K` требует все ключи; с `string` любой ключ кажется существующим.
- `Exclude`, `Extract`, `NonNullable` фильтруют объединения.
- `ReturnType`, `Parameters`, `Awaited`, `InstanceType` берут типы из чужих функций и классов.
- Брендированные типы не дают перепутать идентификаторы одного примитивного типа.
