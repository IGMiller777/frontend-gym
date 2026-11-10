## О чём урок

TypeScript это JavaScript с системой типов, которая работает только во время разработки: компилятор проверяет код и стирает типы, в браузер попадает обычный JavaScript. Отсюда главное правило урока: типы ничего не проверяют во время выполнения. Разберём, как TypeScript думает о типах, и самый частый вопрос собеседования: чем `type` отличается от `interface`.

Блоки с кодом в уроках TypeScript проверены компилятором в строгом режиме (`strict`). Строки, где ошибка ожидается, помечены `// @ts-expect-error`: если бы ошибки там не было, проверка упала бы.

## Структурная типизация

TypeScript сравнивает типы **по форме**, а не по имени. Объект подходит, если у него есть все нужные свойства нужных типов, и неважно, как назывался его тип.

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

Лишнее свойство в переменной допустимо, а в объектном литерале прямо в аргументе это ошибка. Это отдельная проверка (excess property check): литерал никто больше не использует, значит, лишнее поле скорее всего опечатка.

## Вывод типов и литеральные типы

Типы можно не писать там, где их видно из значения: TypeScript выводит их сам. Аннотации ставят на границах: параметры функций, публичные API, данные извне.

`let` выводит общий тип (`string`), а `const` литеральный (`"dark"`), ведь константа не изменится. `as const` делает литерал глубоко неизменяемым и сохраняет точные значения:

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

## any, unknown и never

| Тип | Что значит | Что с ним можно |
|---|---|---|
| `any` | проверка отключена | всё, и ошибки пройдут незамеченными |
| `unknown` | значение есть, но тип неизвестен | ничего, пока не сузите тип проверкой |
| `never` | значения не бывает | используется для недостижимого кода и исчерпывающих проверок |

Для данных извне (`JSON.parse`, `fetch`, `catch (e)`) используйте `unknown`, а не `any`: компилятор заставит проверить значение перед использованием.

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

Аннотация `const x: T = ...` проверяет значение, но тип переменной становится `T`, и точная информация теряется: TypeScript больше не знает, что `blue` объект, а `red` строка. Оператор `satisfies` (TypeScript 4.9) проверяет значение на соответствие типу и **сохраняет** выведенный тип.

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

## type и interface

Оба описывают форму объекта, и для объектов в большинстве случаев взаимозаменяемы. Различия:

| | `interface` | `type` |
|---|---|---|
| Объединения, кортежи, примитивы, условные и mapped-типы | нет | да |
| Повторное объявление | сливается (declaration merging) | ошибка «Duplicate identifier» |
| Расширение | `extends`, конфликт свойств это ошибка | `&`, конфликт даёт `never` в свойстве |

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

Слияние интерфейсов нужно, чтобы дополнять чужие типы: например, добавить своё поле в `Window` или в типы библиотеки. Практичное правило: `interface` для объектов и классов, особенно в публичных API; `type` для объединений, кортежей и вычисляемых типов.

## Главное

- Типы стираются при компиляции и ничего не проверяют во время выполнения.
- Совместимость структурная: важна форма, а не имя типа.
- Пишите аннотации на границах, внутри полагайтесь на вывод; `as const` сохраняет литералы.
- Для внешних данных `unknown`, не `any`.
- `satisfies` проверяет и сохраняет точный тип.
- `interface` сливается при повторном объявлении, `type` нет; объединения только через `type`.
