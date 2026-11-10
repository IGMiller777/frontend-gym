## О чём урок

Знать синтаксис типов мало: на собеседовании спросят, как настроен TypeScript в проекте, почему в новых кодовых базах нет `enum`, как типизировать чужую JavaScript-библиотеку и как не верить данным из сети. Здесь настройка `tsconfig`, перемены в TypeScript 6 и 7, запуск `.ts` без сборки, перегрузки, файлы деклараций и проверка данных во время выполнения.

## tsconfig: что включить

| Опция | Зачем |
|---|---|
| `strict` | включает группу строгих проверок: `strictNullChecks`, `noImplicitAny` и другие. С TypeScript 6.0 включена по умолчанию |
| `noUncheckedIndexedAccess` | `arr[i]` и `record[key]` получают тип `T \| undefined`: доступ по индексу может промахнуться |
| `exactOptionalPropertyTypes` | `email?: string` нельзя явно присвоить `undefined`: «нет поля» и «поле со значением `undefined`» различаются |
| `verbatimModuleSyntax` | импорт только типов пишется как `import type`, остальное сохраняется как есть; сборщики и Node.js понимают файл без анализа типов |
| `erasableSyntaxOnly` | запрещает синтаксис, который нельзя просто стереть: `enum`, `namespace` с кодом, параметры-свойства в конструкторе |
| `moduleResolution: "bundler"` | разрешение импортов как у Vite и других сборщиков |

```ts check
const list: string[] = ["a"]
const item = list[5] // string, but undefined at runtime: noUncheckedIndexedAccess would add | undefined
const upper = item?.toUpperCase()
```

## TypeScript 6 и 7

TypeScript 6.0 переходный релиз: `strict`, `module: "esnext"` и `target` текущего года (сейчас `es2025`) стали значениями по умолчанию, а устаревшие опции (`baseUrl`, `moduleResolution: "node"`, `target: "es5"`, `outFile`, модули AMD и UMD) выдают предупреждения. TypeScript 7.0 это нативный порт компилятора с параллельной проверкой типов: язык тот же, сборка и редактор быстрее, а опции, устаревшие в 6.0, в нём удалены. Порядок миграции: обновиться до 6.0, убрать все предупреждения, затем переходить на 7.

## Запуск без сборки и стираемый синтаксис

Node.js выполняет `.ts`-файлы напрямую: начиная с версий 22.18 и 23.6 стирание типов (type stripping) включено по умолчанию. Типы заменяются пробелами, **проверки типов нет**, `tsconfig.json` игнорируется. Поэтому код должен состоять из стираемого синтаксиса, и именно это проверяет `erasableSyntaxOnly`.

`enum` не стирается: он превращается в объект во время выполнения. Вместо него используют объединение литералов или объект `as const`:

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

## Перегрузки

Если результат зависит от типа аргумента, пишут несколько сигнатур перегрузки и одну реализацию, совместимую со всеми. Снаружи видны только сигнатуры перегрузок.

```ts check
function parse(input: string): number
function parse(input: string[]): number[]
function parse(input: string | string[]): number | number[] {
  return Array.isArray(input) ? input.map(Number) : Number(input)
}
const one = parse("42") // number
const many = parse(["1", "2"]) // number[]
```

Часто вместо перегрузок хватает объединения в параметре или дженерика. Перегрузки оправданы, когда связь «вход → выход» не выражается одной сигнатурой.

## Файлы деклараций

Типы для JavaScript-кода описывают в файлах `.d.ts` с ключевым словом `declare`: оно говорит «это существует во время выполнения, вот его тип», не создавая кода.

- У популярных библиотек типы уже есть в самом пакете или в `@types/имя` (репозиторий DefinitelyTyped).
- Для пакета без типов: `declare module "legacy-lib" { export function run(): void }` в файле `.d.ts`.
- Глобальное значение от скрипта на странице: `declare global { interface Window { analytics: Analytics } }`.

## Данные извне не типизированы

Аннотация `const user = (await res.json()) as User` ничего не проверяет: если сервер вернёт другое, ошибка всплывёт далеко от места, где её можно понять. На границах (ответы API, `localStorage`, параметры URL, `postMessage`) данные проверяют во время выполнения: своей функцией-предикатом или библиотекой схем (Zod, Valibot), которая заодно выводит тип из схемы.

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

## Главное

- Включайте `strict` (по умолчанию с 6.0), `noUncheckedIndexedAccess`, `verbatimModuleSyntax`; `erasableSyntaxOnly` для запуска без сборки.
- TypeScript 6.0 готовит к 7.0, нативному и более быстрому компилятору: сначала уберите предупреждения 6.0.
- Node.js стирает типы и не проверяет их; `enum` заменяют объединением литералов или объектом `as const`.
- Перегрузки это несколько сигнатур и одна совместимая реализация.
- `.d.ts` и `declare` описывают чужой JavaScript; данные извне проверяют во время выполнения.
