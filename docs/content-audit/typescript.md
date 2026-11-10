# Аудит заметок: TypeScript

Источник: страница Notion «TS», прочитана целиком: список задач, type против interface, Record, Utility Types, TypeGuards со всеми подразделами, «Как взять типы значения объекта», unknown, declare, перегрузка функций.

Каждый пример из заметок скомпилирован TypeScript 6.0 в строгом режиме; утверждения сверены с TypeScript Handbook, release notes на typescriptlang.org и документацией Node.js. Все блоки ` ```ts check ` в уроках проходят `tsc --strict` в CI (`scripts/content.test.ts`); строки с ожидаемой ошибкой помечены `// @ts-expect-error`, и проверка падает, если ошибки там нет.

## Найденные ошибки

| Раздел | В заметках | На самом деле | Источник |
|---|---|---|---|
| type и interface | `type` можно переопределять, `interface` нет | Наоборот: повторный `type` даёт «Duplicate identifier», а интерфейсы сливаются (declaration merging) | [Declaration Merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html), проверено компилятором |
| type и interface | `interface C extends A, B` с `prop: number` и `prop: string` назван «пересечением типов» | Это ошибка компиляции «Interface 'C' cannot simultaneously extend types 'A' and 'B'»; у `A & B` свойство `prop` станет `never` | проверено компилятором |
| Record | `let Person = Record<string, number> = {}` | Синтаксическая ошибка: `Record` это тип, а не значение. Правильно `let person: Record<string, number> = {}` | проверено компилятором |
| TypeGuards | Пользовательский предикат «единственный способ сузить union в runtime» | Сужают и `typeof`, `instanceof`, `in`, сравнения, проверка дискриминанта (в тех же заметках ниже) | [Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html) |
| TypeGuards | `satisfies` «TypeScript 5.4+» | Появился в TypeScript 4.9 | [TypeScript 4.9](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html) |
| TypeGuards | Assertion functions «TS 4.4+» | Появились в TypeScript 3.7 | [TypeScript 3.7](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html) |
| TypeGuards | `function isStringArray(arr: unknown): value is string[]` | Имя в предикате должно совпадать с параметром: «Cannot find parameter 'value'» | проверено компилятором |
| TypeGuards | «Ошибка 70%»: `.every(item => typeof item === 'string')` внутри предиката «не сузит тип» | Сужение у вызывающего кода задаёт объявленный предикат функции, а не колбэк внутри. С TypeScript 5.5 колбэк к тому же сам выводится как предикат | [TypeScript 5.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html), проверено компилятором |
| TypeGuards | `type Error = { … }` в примере | Затеняет глобальный `Error`; в уроке переименовано | разбор кода |
| unknown | `if (typeof person === string)` | `string` здесь значение, а не строка: нужно `'string'` | проверено компилятором |
| declare | `declare const libraryName;` | В строгом режиме ошибка неявного `any`; тип нужно указать. Для пакетов типы ставят из `@types` или пишут `declare module` в `.d.ts` | [Declaration Files](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html) |
| Перегрузка | Сигнатура `add(x: string, y: string): string` и реализация только для `number` | Ошибка «This overload signature is not compatible with its implementation signature»: реализация должна принимать все варианты | [More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html#function-overloads), проверено компилятором |
| Перегрузка | «то же имя функции над оригинальной функцией без скобок» | Сигнатуры перегрузок без тела, затем одна совместимая реализация; снаружи видны только сигнатуры | там же |

## Пробелы, закрытые в уроках

- Структурная типизация и проверка лишних свойств у объектных литералов.
- Вывод типов, литеральные типы, `as const`, `any`/`unknown`/`never`.
- Исчерпанность через `never`, выводимые предикаты (5.5), функции-утверждения.
- Дженерики: ограничения, `keyof` и `T[K]`, дженерики в классах, `NoInfer` (5.4), `const`-параметры типа (5.0), когда параметр лишний.
- Mapped-, условные и шаблонные литеральные типы, `infer`, распределение по объединению.
- Встроенные утилиты с `Awaited`, `Parameters`, `InstanceType`; `Omit` не проверяет ключи; брендированные типы.
- `tsconfig`: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`, `erasableSyntaxOnly`.
- TypeScript 6.0 (строгий режим по умолчанию, устаревшие опции) и 7.0 (нативный порт); запуск `.ts` в Node.js через стирание типов; `enum` против объединений.
- Проверка данных во время выполнения на границах приложения.
