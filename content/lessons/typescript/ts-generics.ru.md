## О чём урок

Дженерики (generics) позволяют писать код, который работает с разными типами и при этом сохраняет связь между ними: «функция возвращает элемент того же типа, что лежит в массиве». Без них остаётся выбор между копированием кода под каждый тип и `any`, который отключает проверку. На собеседованиях дженерики спрашивают через `keyof`, ограничения и типизацию утилит.

## Параметр типа

Параметр типа пишут в угловых скобках, и TypeScript обычно выводит его из аргументов сам.

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

## Ограничения через extends

`T extends Something` требует, чтобы подставляемый тип имел нужную форму. Внутри функции можно пользоваться тем, что гарантирует ограничение.

```ts check
function longest<T extends { length: number }>(a: T, b: T): T {
  return a.length >= b.length ? a : b
}
longest("abc", "de") // string
longest([1, 2], [3]) // number[]
// @ts-expect-error: number has no length
longest(10, 20)
```

## keyof и обращение по индексу

`keyof T` это объединение ключей типа, а `T[K]` тип значения по ключу. Вместе с ограничением `K extends keyof T` они дают типобезопасный доступ к свойствам: ключ проверяется, а тип результата точный.

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

## Дженерики в типах и интерфейсах

Параметры бывают у типов, интерфейсов и классов. Можно задать значение по умолчанию.

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

## Где вывод выбирает не тот тип

Иногда TypeScript выводит параметр не из того аргумента. Утилита `NoInfer<T>` (TypeScript 5.4) запрещает выводить тип из конкретного места: тип берётся из других аргументов, а здесь только проверяется.

```ts check
function createMachine<S extends string>(states: S[], initial: NoInfer<S>) {
  return { states, current: initial }
}
createMachine(["idle", "loading", "done"], "idle")
// @ts-expect-error: "oops" is not one of the states
createMachine(["idle", "loading", "done"], "oops")
```

Без `NoInfer` TypeScript добавил бы `"oops"` к выведенному `S`, и ошибку бы никто не заметил.

Модификатор `const` у параметра типа (TypeScript 5.0) выводит литеральные типы, как будто аргумент передали с `as const`:

```ts check
function routes<const T extends readonly string[]>(paths: T) {
  return paths
}
const r = routes(["/", "/me"]) // readonly ["/", "/me"], not string[]
```

## Когда дженерик не нужен

Если параметр типа встречается в сигнатуре один раз, он ничего не связывает и только усложняет чтение. `function log<T>(value: T): void` ничем не лучше `function log(value: unknown): void`. Хороший дженерик связывает минимум два места: аргумент и результат, два аргумента, ключ и значение.

## Главное

- Дженерик сохраняет связь типов между входом и выходом; `any` её теряет.
- `extends` ограничивает параметр и даёт доступ к свойствам ограничения.
- `K extends keyof T` и `T[K]` дают типобезопасный доступ к свойствам.
- `NoInfer<T>` (5.4) управляет выводом, `const T` (5.0) выводит литералы.
- Параметр, который встречается один раз, не нужен.
