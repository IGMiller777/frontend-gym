## О чём урок

В TypeScript можно вычислять одни типы из других: сделать все поля необязательными, достать тип результата функции, собрать имена событий из имён полей. Для этого есть три инструмента: mapped-типы, условные типы и шаблонные литеральные типы. Встроенные утилиты (`Partial`, `ReturnType`, `Awaited`) написаны именно на них, и на собеседованиях часто просят написать одну из них самому.

## Mapped-типы

Mapped-тип проходит по ключам и строит новый объектный тип. Модификаторы `?` и `readonly` можно добавлять и снимать знаками `+` и `-`.

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

Ключи можно переименовать через `as` и шаблонные строки, а ключ, переименованный в `never`, исчезнет:

```ts check
type Getters<T> = { [K in keyof T & string as `get${Capitalize<K>}`]: () => T[K] }
type OnlyStrings<T> = { [K in keyof T as T[K] extends string ? K : never]: T[K] }

type User = { id: number; name: string; email: string }
type UserGetters = Getters<User> // { getId: () => number; getName: () => string; getEmail: () => string }
const g: UserGetters = { getId: () => 1, getName: () => "Ada", getEmail: () => "a@b.c" }
const s: OnlyStrings<User> = { name: "Ada", email: "a@b.c" }
```

## Условные типы

`A extends B ? X : Y` выбирает тип в зависимости от того, совместим ли `A` с `B`. Внутри условия `infer` объявляет переменную типа, которую TypeScript подберёт сам: так «достают» часть типа.

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

Встроенный `Awaited<T>` делает то же, что `Unwrap`, но аккуратнее: учитывает любые thenable-объекты.

## Распределение по объединению

Если проверяемый тип это голый параметр типа, условный тип применяется к **каждому** члену объединения отдельно. На этом построены `Exclude` и `Extract`.

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

Чтобы отключить распределение, параметр оборачивают в кортеж: `[T] extends [U]`.

## Шаблонные литеральные типы

Шаблонные строки работают и на уровне типов. Вместе с объединениями они перемножают варианты, а встроенные `Uppercase`, `Lowercase`, `Capitalize`, `Uncapitalize` меняют регистр.

```ts check
type Side = "top" | "right" | "bottom" | "left"
type Margin = `margin-${Side}` // "margin-top" | "margin-right" | ...
type EventName<T extends string> = `on${Capitalize<T>}`

const m: Margin = "margin-left"
const e: EventName<"click"> = "onClick"
// @ts-expect-error: not one of the four sides
const bad: Margin = "margin-center"
```

## Меру знать

Сложные вычисляемые типы трудно читать и они замедляют проверку. Если тип занимает больше нескольких строк, проверьте, не проще ли описать его явно. В прикладном коде чаще всего хватает встроенных утилит из [следующего урока](/learn/ts-utility-types).

## Главное

- Mapped-тип `{ [K in keyof T]: ... }` строит объект по ключам; `?`, `readonly`, `-`, `as` управляют результатом.
- Условный тип `A extends B ? X : Y` с `infer` достаёт части типов.
- Голый параметр распределяется по объединению; `[T] extends [U]` это отключает.
- Шаблонные литеральные типы собирают строковые типы из частей.
- Встроенные `Partial`, `ReturnType`, `Exclude`, `Awaited` написаны на этих же инструментах.
