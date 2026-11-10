## О чём урок

Переменная типа `string | number` или `User | null` бесполезна, пока не ясно, что в ней сейчас. **Сужение** (narrowing) это то, как TypeScript по проверкам в коде понимает более точный тип в конкретной ветке. Здесь разберём все способы сужения, размеченные объединения, проверку исчерпанности через `never` и собственные проверки типа (type guards).

## Встроенные проверки

TypeScript понимает обычные проверки JavaScript и сужает тип внутри ветки:

| Проверка | Сужает до |
|---|---|
| `typeof x === "string"` | примитивного типа |
| `x instanceof Date` | экземпляра класса |
| `"swim" in animal` | варианта объединения, где есть это свойство |
| `x === null`, `x === "admin"` | конкретного значения |
| `if (x)` | исключает `null`, `undefined` и другие ложные значения |
| `Array.isArray(x)` | массива |

```ts check
function format(value: string | number | Date | null) {
  if (value === null) return "—"
  if (typeof value === "number") return value.toFixed(2)
  if (value instanceof Date) return value.toISOString()
  return value.toUpperCase() // only string is left
}
```

После `return` в ветке TypeScript убирает этот вариант и из остального кода функции: это анализ потока управления (control flow analysis).

Осторожно с проверкой на истинность: `if (count)` выкинет и `0`, а `if (name)` пустую строку. Для «есть значение» точнее `count !== undefined` или `name != null`.

## Размеченные объединения

Самый полезный приём для состояний и событий: у каждого варианта объединения есть общее поле с литеральным значением (дискриминант). Проверка этого поля сужает весь объект.

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

Такая модель не даёт описать невозможное состояние, например `data` и `error` одновременно, в отличие от объекта с тремя необязательными полями.

## Исчерпанность через never

Если в объединение добавят новый вариант, хочется, чтобы компилятор показал все `switch`, где его забыли обработать. Для этого в ветке `default` значение присваивают переменной типа `never`: туда может попасть только то, что не обработано.

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

## Свои проверки типа

Когда встроенных проверок не хватает, пишут функцию с возвращаемым типом-предикатом `value is T`. Если она вернула `true`, тип сужается в вызывающем коде.

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

Компилятор не проверяет, что предикат честный: если `isFish` ошибётся, типы будут врать. Поэтому такие функции держат короткими и покрывают тестами.

С TypeScript 5.5 предикаты **выводятся** автоматически для простых функций, поэтому `filter` наконец сужает тип массива:

```ts check
const values = [1, null, 2, undefined, 3]
const numbers = values.filter((v) => v != null) // number[]
numbers.map((n) => n.toFixed(1))
```

## Функции-утверждения

Функция с типом `asserts value is T` (TypeScript 3.7) ничего не возвращает, а бросает ошибку, если условие не выполнено. После её вызова тип сужен до конца блока. Удобно для проверки входных данных и инвариантов.

```ts check
function assertDefined<T>(value: T, message: string): asserts value is NonNullable<T> {
  if (value == null) throw new Error(message)
}
function greet(name: string | undefined) {
  assertDefined(name, "name is required")
  return name.toUpperCase()
}
```

## Главное

- TypeScript сужает тип по обычным проверкам: `typeof`, `instanceof`, `in`, сравнения, истинность, `Array.isArray`.
- Размеченные объединения с литеральным полем это лучший способ описать состояния.
- `const x: never = value` в `default` превращает забытый вариант в ошибку компиляции.
- Предикат `value is T` сужает тип у вызывающего кода; с 5.5 простые предикаты выводятся сами.
- `asserts value is T` бросает ошибку и сужает тип после вызова.
