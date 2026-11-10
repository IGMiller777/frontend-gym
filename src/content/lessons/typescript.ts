import type { Source } from '../sources'
import type { Lesson, Module } from './types'

const ts = (title: string, path: string): Source => ({ title: `TypeScript: ${title}`, url: `https://www.typescriptlang.org/${path}`, kind: 'official' })
const verified = { date: '2026-11', version: 'TypeScript 6.0 / 7.0' }

export const typescriptLessons: Lesson[] = [
  {
    id: 'ts-basics',
    track: 'typescript',
    emoji: '🧱',
    minutes: 12,
    title: { ru: 'Как TypeScript видит типы', en: 'How TypeScript sees types' },
    summary: {
      ru: 'Структурная типизация, вывод и литеральные типы, any, unknown и never, satisfies, type против interface.',
      en: 'Structural typing, inference and literal types, any, unknown and never, satisfies, type versus interface.',
    },
    quiz: {
      ru: [
        { q: 'Что TypeScript проверяет во время выполнения программы?', options: ['Аргументы функций с аннотациями', 'Ничего: типы стираются при компиляции', 'Только данные с `as`-приведением', 'Ответы `fetch` с типом `Promise<T>`'], correct: 1, why: 'Компилятор проверяет код и стирает типы. В рантайм попадает обычный JavaScript, поэтому внешние данные проверяют отдельно.' },
        { q: 'Что будет при повторном объявлении `interface User` с другим полем?', options: ['Ошибка «Duplicate identifier»', 'Объявления сольются в один тип', 'Второе объявление заменит первое', 'Поля станут необязательными'], correct: 1, why: 'Интерфейсы сливаются (declaration merging). Повторный `type` с тем же именем это ошибка.' },
        { q: 'Какой тип выбрать для результата `JSON.parse`, чтобы компилятор заставил проверить данные?', options: ['`any`', '`unknown`', '`never`', '`object`'], correct: 1, why: 'С `unknown` ничего нельзя сделать, пока тип не сужен проверкой. `any` отключает проверки совсем.' },
        { q: 'Чем `satisfies T` отличается от аннотации `: T`?', options: ['Ничем, это просто синоним аннотации типа', 'Проверяет значение и сохраняет выведенный тип', 'Приводит значение к `T` без всякой проверки', 'Проверяет значение во время выполнения кода'], correct: 1, why: 'Аннотация делает тип переменной равным `T` и теряет детали. `satisfies` проверяет совместимость и оставляет точный тип.' },
      ],
      en: [
        { q: 'What does TypeScript check while the program runs?', options: ['Arguments of every annotated function', 'Nothing: types are erased at compile time', 'Only data that was cast with `as`', '`fetch` responses typed as `Promise<T>`'], correct: 1, why: 'The compiler checks the code and erases the types. Plain JavaScript runs, so outside data has to be validated separately.' },
        { q: 'What happens when `interface User` is declared again with another field?', options: ['A "Duplicate identifier" error', 'The declarations merge into one type', 'The second declaration replaces the first', 'All fields become optional'], correct: 1, why: 'Interfaces merge (declaration merging). Declaring a `type` with the same name twice is an error.' },
        { q: 'Which type should `JSON.parse` results get so the compiler forces a check?', options: ['`any`', '`unknown`', '`never`', '`object`'], correct: 1, why: 'Nothing can be done with `unknown` until a check narrows it. `any` turns checking off entirely.' },
        { q: 'How does `satisfies T` differ from the annotation `: T`?', options: ['No difference, it is just a synonym', 'It checks the value and keeps the inferred type', 'It casts the value to `T` without any check', 'It checks the value while the code runs'], correct: 1, why: 'An annotation makes the variable\'s type `T` and loses detail. `satisfies` checks compatibility and keeps the exact type.' },
      ],
    },
    sources: [
      ts('Everyday Types', 'docs/handbook/2/everyday-types.html'),
      ts('Type Compatibility', 'docs/handbook/type-compatibility.html'),
      ts('Declaration Merging', 'docs/handbook/declaration-merging.html'),
      ts('TypeScript 4.9: satisfies', 'docs/handbook/release-notes/typescript-4-9.html'),
    ],
    verified,
  },
  {
    id: 'ts-narrowing',
    track: 'typescript',
    emoji: '🔍',
    minutes: 12,
    title: { ru: 'Сужение типов', en: 'Narrowing' },
    summary: {
      ru: 'typeof, instanceof и in, размеченные объединения, исчерпанность через never, предикаты и функции-утверждения.',
      en: 'typeof, instanceof and in, discriminated unions, exhaustiveness with never, predicates and assertion functions.',
    },
    quiz: {
      ru: [
        { q: 'Как сделать так, чтобы забытый вариант объединения в `switch` стал ошибкой компиляции?', options: ['Добавить `default: throw new Error()` в каждый `switch`', 'Присвоить значение переменной типа `never` в `default`', 'Включить флаг компилятора `noFallthroughCasesInSwitch`', 'Пометить объединение модификатором `readonly`'], correct: 1, why: 'В `default` попадает только необработанное. Если что-то осталось, оно не присваивается `never`, и компилятор сообщит об ошибке.' },
        { q: 'Что сужает тип внутри ветки `if`?', options: ['Только пользовательские предикаты вида `x is T`', '`typeof`, `instanceof`, `in`, сравнения, предикаты', 'Только операторы `typeof` и `instanceof`', 'Только явное приведение типа через `as`'], correct: 1, why: 'Анализ потока управления понимает все эти проверки. Предикаты нужны, когда встроенных проверок не хватает.' },
        { q: 'Что изменилось в TypeScript 5.5 для `values.filter((v) => v != null)`?', options: ['Ничего, результат по-прежнему `(T | null)[]`', 'Предикат выводится сам, результат `T[]`', '`filter` теперь требует явный предикат', 'Появился отдельный метод `filterNonNull`'], correct: 1, why: 'С 5.5 TypeScript выводит предикат для простых функций, и `filter` сужает тип элементов.' },
        { q: 'Что делает функция с типом `asserts value is T`?', options: ['Возвращает `true` или `false` по результату проверки', 'Бросает ошибку при провале, и после вызова тип сужен', 'Приводит значение к `T` без всякой проверки', 'Проверяет тип только в режиме разработки'], correct: 1, why: 'Функция-утверждение ничего не возвращает: либо бросает ошибку, либо после неё тип считается суженным до конца блока.' },
      ],
      en: [
        { q: 'How do you make a forgotten union member in a `switch` a compile error?', options: ['Add `default: throw new Error()` to every `switch`', 'Assign the value to a `never` variable in `default`', 'Turn on the `noFallthroughCasesInSwitch` flag', 'Mark the union type with a `readonly` modifier'], correct: 1, why: 'Only unhandled members reach `default`. If anything is left, it cannot be assigned to `never`, and the compiler reports an error.' },
        { q: 'What narrows a type inside an `if` branch?', options: ['Only custom predicates of the form `x is T`', '`typeof`, `instanceof`, `in`, comparisons, predicates', 'Only the `typeof` and `instanceof` operators', 'Only an explicit type cast written with `as`'], correct: 1, why: 'Control flow analysis understands all of these checks. Predicates are for when the built-in checks are not enough.' },
        { q: 'What changed in TypeScript 5.5 for `values.filter((v) => v != null)`?', options: ['Nothing, it is still `(T | null)[]`', 'The predicate is inferred, the result is `T[]`', '`filter` now requires an explicit predicate', 'A separate `filterNonNull` method appeared'], correct: 1, why: 'Since 5.5 TypeScript infers predicates for simple functions, and `filter` narrows the element type.' },
        { q: 'What does a function typed `asserts value is T` do?', options: ['Returns `true` or `false` depending on the check', 'Throws on failure; after the call the type is narrowed', 'Casts the value to `T` without any check', 'Checks the type in development builds only'], correct: 1, why: 'An assertion function returns nothing: it either throws, or after it the type counts as narrowed until the end of the block.' },
      ],
    },
    sources: [
      ts('Narrowing', 'docs/handbook/2/narrowing.html'),
      ts('TypeScript 5.5: inferred type predicates', 'docs/handbook/release-notes/typescript-5-5.html'),
      ts('TypeScript 3.7: assertion functions', 'docs/handbook/release-notes/typescript-3-7.html'),
    ],
    verified,
  },
  {
    id: 'ts-generics',
    track: 'typescript',
    emoji: '🧬',
    minutes: 12,
    title: { ru: 'Дженерики', en: 'Generics' },
    summary: {
      ru: 'Параметры типов, ограничения extends, keyof и T[K], дженерики в классах, NoInfer и const-параметры.',
      en: 'Type parameters, extends constraints, keyof and T[K], generic classes, NoInfer and const parameters.',
    },
    quiz: {
      ru: [
        { q: 'Чем `function first<T>(xs: T[]): T` лучше `function first(xs: any[]): any`?', options: ['Работает быстрее во время выполнения', 'Сохраняет связь типа входа и выхода', 'Запрещает пустые массивы', 'Ничем, это одно и то же'], correct: 1, why: 'Дженерик передаёт тип элемента в результат. С `any` проверка теряется и на выходе.' },
        { q: 'Какая сигнатура даёт типобезопасный доступ `get(obj, key)`?', options: ['`get(obj: object, key: string): unknown`', '`get<T, K extends keyof T>(obj: T, key: K): T[K]`', '`get<T>(obj: T, key: string): T[keyof T]`', '`get(obj: any, key: PropertyKey): any`'], correct: 1, why: '`K extends keyof T` проверяет ключ, а `T[K]` даёт точный тип значения.' },
        { q: 'Зачем нужен `NoInfer<T>`?', options: ['Чтобы отключить вывод типов во всём файле', 'Чтобы тип не выводился отсюда, а только проверялся', 'Чтобы запретить `null` и `undefined` в параметре', 'Чтобы сделать параметр обязательным при вызове'], correct: 1, why: '`NoInfer` (5.4) убирает место из вывода: тип берётся из других аргументов, а здесь значение лишь проверяется.' },
        { q: 'Когда параметр типа лишний?', options: ['Когда у него нет ограничения `extends`', 'Когда он встречается в сигнатуре один раз', 'Когда функция асинхронная', 'Когда у него есть значение по умолчанию'], correct: 1, why: 'Параметр, использованный один раз, ничего не связывает: `unknown` выразит то же проще.' },
      ],
      en: [
        { q: 'Why is `function first<T>(xs: T[]): T` better than `function first(xs: any[]): any`?', options: ['It runs faster at runtime than the `any` version', 'It keeps the type link between input and output', 'It forbids passing empty arrays', 'No difference, the two are the same'], correct: 1, why: 'The generic carries the element type to the result. With `any` the checking is lost on the way out too.' },
        { q: 'Which signature gives type-safe access `get(obj, key)`?', options: ['`get(obj: object, key: string): unknown`', '`get<T, K extends keyof T>(obj: T, key: K): T[K]`', '`get<T>(obj: T, key: string): T[keyof T]`', '`get(obj: any, key: PropertyKey): any`'], correct: 1, why: '`K extends keyof T` checks the key, and `T[K]` gives the exact value type.' },
        { q: 'What is `NoInfer<T>` for?', options: ['To turn off type inference in the whole file', 'So the type is checked here but not inferred from it', 'To forbid `null` and `undefined` in a parameter', 'To make a parameter required at every call'], correct: 1, why: '`NoInfer` (5.4) removes a position from inference: the type comes from other arguments and the value here is only checked.' },
        { q: 'When is a type parameter unnecessary?', options: ['When it has no `extends` constraint', 'When it appears in the signature only once', 'When the function is declared `async`', 'When it has a default type value'], correct: 1, why: 'A parameter used once links nothing: `unknown` says the same more simply.' },
      ],
    },
    sources: [
      ts('Generics', 'docs/handbook/2/generics.html'),
      ts('Keyof Type Operator', 'docs/handbook/2/keyof-types.html'),
      ts('Indexed Access Types', 'docs/handbook/2/indexed-access-types.html'),
      ts('TypeScript 5.4: NoInfer', 'docs/handbook/release-notes/typescript-5-4.html'),
    ],
    verified,
  },
  {
    id: 'ts-type-transforms',
    track: 'typescript',
    emoji: '🪄',
    minutes: 14,
    title: { ru: 'Mapped, условные и шаблонные типы', en: 'Mapped, conditional and template types' },
    summary: {
      ru: 'Как устроены Partial и ReturnType: mapped-типы, условные типы с infer, распределение по объединению, шаблонные литералы.',
      en: 'How Partial and ReturnType work: mapped types, conditional types with infer, distribution over unions, template literals.',
    },
    quiz: {
      ru: [
        { q: 'Как написать свой `Partial<T>`?', options: ['`{ [K in keyof T]?: T[K] }`', '`{ [K in T]: K }`', '`T extends object ? T : never`', '`keyof T | undefined`'], correct: 0, why: 'Mapped-тип проходит по ключам `T` и добавляет модификатор `?` к каждому.' },
        { q: 'Что делает `infer R` в `F extends (...a: never[]) => infer R ? R : never`?', options: ['Объявляет тип, который подберёт TypeScript', 'Выводит тип значения во время выполнения', 'Делает параметр `R` необязательным', 'Запрещает TypeScript выводить тип `R`'], correct: 0, why: '`infer` объявляет тип внутри условия; если `F` функция, `R` станет типом её результата.' },
        { q: 'Чему равно `ToArray<string | number>` при `type ToArray<T> = T extends unknown ? T[] : never`?', options: ['`string[] | number[]`', '`(string | number)[]`', '`never`', '`unknown[]`'], correct: 0, why: 'Голый параметр распределяется по объединению: условие применяется к `string` и к `number` отдельно.' },
        { q: 'Как получить тип `"onClick"` из `"click"`?', options: ['`` `on${Capitalize<"click">}` ``', '`"on" + Capitalize<"click">`', '`Uppercase<"on" | "click">`', '`` `on${Uppercase<"click">}` ``'], correct: 0, why: 'Шаблонный литеральный тип собирает строку, `Capitalize` делает первую букву заглавной.' },
      ],
      en: [
        { q: 'How do you write your own `Partial<T>`?', options: ['`{ [K in keyof T]?: T[K] }`', '`{ [K in T]: K }`', '`T extends object ? T : never`', '`keyof T | undefined`'], correct: 0, why: 'A mapped type walks the keys of `T` and adds the `?` modifier to each.' },
        { q: 'What does `infer R` do in `F extends (...a: never[]) => infer R ? R : never`?', options: ['Declares a type TypeScript fills in', 'Infers the value type at runtime', 'Makes the parameter `R` optional', 'Forbids TypeScript to infer `R`'], correct: 0, why: '`infer` declares a type inside the condition; if `F` is a function, `R` becomes its return type.' },
        { q: 'What is `ToArray<string | number>` with `type ToArray<T> = T extends unknown ? T[] : never`?', options: ['`string[] | number[]`', '`(string | number)[]`', '`never`', '`unknown[]`'], correct: 0, why: 'A naked parameter distributes over the union: the condition applies to `string` and `number` separately.' },
        { q: 'How do you get the type `"onClick"` from `"click"`?', options: ['`` `on${Capitalize<"click">}` ``', '`"on" + Capitalize<"click">`', '`Uppercase<"on" | "click">`', '`` `on${Uppercase<"click">}` ``'], correct: 0, why: 'A template literal type builds the string, and `Capitalize` upper-cases the first letter.' },
      ],
    },
    sources: [
      ts('Mapped Types', 'docs/handbook/2/mapped-types.html'),
      ts('Conditional Types', 'docs/handbook/2/conditional-types.html'),
      ts('Template Literal Types', 'docs/handbook/2/template-literal-types.html'),
    ],
    verified,
  },
  {
    id: 'ts-utility-types',
    track: 'typescript',
    emoji: '🧰',
    minutes: 10,
    title: { ru: 'Встроенные утилиты', en: 'Built-in utility types' },
    summary: {
      ru: 'Partial, Pick, Omit, Record, Exclude, ReturnType, Parameters, Awaited и брендированные типы.',
      en: 'Partial, Pick, Omit, Record, Exclude, ReturnType, Parameters, Awaited and branded types.',
    },
    quiz: {
      ru: [
        { q: 'Как получить тип результата async-функции `load` без промиса?', options: ['`ReturnType<typeof load>`', '`Awaited<ReturnType<typeof load>>`', '`Parameters<typeof load>[0]`', '`InstanceType<typeof load>`'], correct: 1, why: '`ReturnType` даст `Promise<…>`, а `Awaited` разворачивает промис.' },
        { q: 'Чем `Omit<T, K>` отличается от `Pick<T, K>` по проверке ключей?', options: ['Ничем: оба проверяют, что ключ есть в `T`', '`Omit` не проверяет, что ключ есть в `T`', '`Pick` не проверяет ключи, а `Omit` проверяет', 'Оба принимают любые строковые ключи'], correct: 1, why: 'У `Omit` ключ ограничен `keyof any`, поэтому опечатка ничего не исключит молча. `Pick` требует `K extends keyof T`.' },
        { q: 'Что даёт `Record<"a" | "b", number>` при объекте `{ a: 1 }`?', options: ['Ошибку: нет ключа `b`', 'Всё в порядке', 'Тип `number | undefined` у `b`', 'Ошибку: лишний ключ `a`'], correct: 0, why: 'Если ключи конечное объединение, `Record` требует каждый из них.' },
        { q: 'Зачем нужны брендированные типы вроде `UserId`?', options: ['Чтобы ускорить проверку типов в больших проектах', 'Чтобы не перепутать значения одного примитивного типа', 'Чтобы проверять формат строк во время выполнения', 'Чтобы сериализовать идентификаторы в JSON'], correct: 1, why: 'Бренд делает `UserId` и `OrderId` несовместимыми, хотя оба `string`. Во время выполнения это обычная строка.' },
      ],
      en: [
        { q: 'How do you get the result type of async function `load` without the promise?', options: ['`ReturnType<typeof load>`', '`Awaited<ReturnType<typeof load>>`', '`Parameters<typeof load>[0]`', '`InstanceType<typeof load>`'], correct: 1, why: '`ReturnType` gives `Promise<…>`, and `Awaited` unwraps the promise.' },
        { q: 'How do `Omit<T, K>` and `Pick<T, K>` differ in checking keys?', options: ['No difference: both check that the key exists', '`Omit` does not check that the key exists in `T`', '`Pick` does not check keys, `Omit` does', 'Both accept any string as a key'], correct: 1, why: '`Omit` constrains the key only to `keyof any`, so a typo silently excludes nothing. `Pick` requires `K extends keyof T`.' },
        { q: 'What does `Record<"a" | "b", number>` give for the object `{ a: 1 }`?', options: ['An error: key `b` is missing', 'It is fine', 'Type `number | undefined` for `b`', 'An error: extra key `a`'], correct: 0, why: 'When the keys are a finite union, `Record` requires each of them.' },
        { q: 'What are branded types such as `UserId` for?', options: ['To speed up type checking in large projects', 'To avoid mixing up values of one primitive type', 'To validate string formats at runtime', 'To serialize identifiers to JSON'], correct: 1, why: 'A brand makes `UserId` and `OrderId` incompatible although both are `string`. At runtime it is a plain string.' },
      ],
    },
    sources: [ts('Utility Types', 'docs/handbook/utility-types.html'), ts('Object Types', 'docs/handbook/2/objects.html')],
    verified,
  },
  {
    id: 'ts-in-projects',
    track: 'typescript',
    emoji: '🏗️',
    minutes: 12,
    title: { ru: 'TypeScript в проекте', en: 'TypeScript in a project' },
    summary: {
      ru: 'Строгий tsconfig, TypeScript 6 и 7, запуск .ts в Node.js без сборки, enum против объединений, перегрузки, .d.ts и проверка данных.',
      en: 'A strict tsconfig, TypeScript 6 and 7, running .ts in Node.js without a build, enum versus unions, overloads, .d.ts and data validation.',
    },
    quiz: {
      ru: [
        { q: 'Что делает флаг `noUncheckedIndexedAccess`?', options: ['Запрещает доступ к массивам и объектам по индексу', 'Добавляет `| undefined` к результату `arr[i]` и `obj[key]`', 'Проверяет границы массивов во время выполнения', 'Запрещает тип `Record<string, T>` в проекте'], correct: 1, why: 'Доступ по индексу может промахнуться, и флаг заставляет это учитывать.' },
        { q: 'Почему с `erasableSyntaxOnly` нельзя использовать `enum`?', options: ['`enum` объявлен устаревшим в TypeScript 6', '`enum` создаёт объект в рантайме, стереть его нельзя', '`enum` работает медленнее объединений литералов', '`enum` не поддерживается в современных браузерах'], correct: 1, why: 'Node.js и другие инструменты стирают типы без генерации кода. `enum` порождает код, поэтому его заменяют объединением или объектом `as const`.' },
        { q: 'Что Node.js делает с типами при запуске `.ts`-файла?', options: ['Проверяет их по `tsconfig.json`', 'Стирает их без проверки', 'Компилирует через `tsc`', 'Отказывается запускать файл'], correct: 1, why: 'Type stripping заменяет типы пробелами, ничего не проверяет и игнорирует `tsconfig.json`. Проверку делает отдельный `tsc --noEmit`.' },
        { q: 'Что значит `const user = (await res.json()) as User`?', options: ['Ответ проверен на соответствие типу `User`', 'Компилятор поверил на слово, проверки нет', 'Лишние поля из ответа удалены', 'При несовпадении с `User` будет ошибка'], correct: 1, why: '`as` только меняет тип для компилятора. Данные извне проверяют во время выполнения предикатом или схемой.' },
      ],
      en: [
        { q: 'What does the `noUncheckedIndexedAccess` flag do?', options: ['Forbids index access on arrays and objects', 'Adds `| undefined` to `arr[i]` and `obj[key]`', 'Checks array bounds while the code runs', 'Forbids the `Record<string, T>` type'], correct: 1, why: 'An index access may miss, and the flag makes you handle that.' },
        { q: 'Why is `enum` not allowed with `erasableSyntaxOnly`?', options: ['`enum` was deprecated in TypeScript 6 and removed in 7', '`enum` creates a runtime object, it cannot be erased', '`enum` is much slower than a union of string literals', '`enum` does not work in modern browsers at all'], correct: 1, why: 'Node.js and other tools erase types without generating code. `enum` produces code, so it is replaced with a union or an `as const` object.' },
        { q: 'What does Node.js do with types when running a `.ts` file?', options: ['Checks them against `tsconfig.json`', 'Erases them without checking', 'Compiles with `tsc`', 'Refuses to run the file'], correct: 1, why: 'Type stripping replaces types with whitespace, checks nothing and ignores `tsconfig.json`. A separate `tsc --noEmit` does the checking.' },
        { q: 'What does `const user = (await res.json()) as User` mean?', options: ['The response was checked against `User`', 'The compiler trusts you; nothing is checked', 'Extra fields from the response were removed', 'A mismatch with `User` throws an error'], correct: 1, why: '`as` only changes the type for the compiler. Outside data is validated at runtime with a predicate or a schema.' },
      ],
    },
    sources: [
      ts('TSConfig Reference', 'tsconfig/'),
      ts('TypeScript 6.0', 'docs/handbook/release-notes/typescript-6-0.html'),
      ts('More on Functions: overloads', 'docs/handbook/2/functions.html#function-overloads'),
      ts('Declaration Files', 'docs/handbook/declaration-files/introduction.html'),
      { title: 'Node.js: Modules: TypeScript', url: 'https://nodejs.org/api/typescript.html', kind: 'official' },
    ],
    verified,
  },
]

export const typescriptModule: Module = {
  track: 'typescript',
  lessons: typescriptLessons.map((l) => l.id),
  exam: {
    pass: 0.75,
    questions: {
      ru: [
        { q: 'Объект `{ x: 1, y: 2, z: 3 }` из переменной передают в функцию, ждущую `{ x: number; y: number }`. Что будет?', options: ['Ошибка компиляции из-за лишнего `z`', 'Всё в порядке: совместимость структурная', 'Поле `z` удалится при передаче', 'Ошибка из-за другого порядка полей'], correct: 1, why: 'Важна форма. Проверка лишних полей срабатывает только для объектного литерала прямо в аргументе.' },
        { q: 'Что выбрать для набора состояний загрузки с разными данными?', options: ['Объект с тремя необязательными полями', 'Размеченное объединение с полем `status`', '`enum` и отдельный объект данных', '`Record<string, unknown>` для любых данных'], correct: 1, why: 'Объединение с дискриминантом не даёт описать невозможное состояние и сужает тип по `status`.' },
        { q: 'Как вернуть тип значения по ключу в `get<T, K extends keyof T>(obj: T, key: K)`?', options: ['`T`', '`T[K]`', '`keyof T`', '`K`'], correct: 1, why: 'Тип индексного доступа `T[K]` даёт тип свойства по ключу.' },
        { q: 'Чему равно `Exclude<"a" | "b" | "c", "a">`?', options: ['`"a"`', '`"b" | "c"`', '`never`', '`"a" | "b" | "c"`'], correct: 1, why: '`Exclude` распределяется по объединению и убирает совместимые с `"a"` члены.' },
        { q: 'Что из этого нельзя использовать с `erasableSyntaxOnly`?', options: ['`interface`', '`enum`', '`type` с объединением', '`as const`'], correct: 1, why: '`enum` создаёт код во время выполнения. Остальное стирается без следа.' },
        { q: 'Что изменилось в TypeScript 6.0 по умолчанию?', options: ['`strict` включён по умолчанию', 'Удалены дженерики с ограничениями', '`enum` запрещён', 'Типы проверяются во время выполнения'], correct: 0, why: 'В 6.0 `strict`, `module: "esnext"` и `target` текущего года стали значениями по умолчанию.' },
        { q: 'Какой тип у результата `filter((x) => x !== null)` для `(string | null)[]` в TypeScript 5.5+?', options: ['`(string | null)[]`', '`string[]`', '`unknown[]`', '`never[]`'], correct: 1, why: 'С 5.5 предикат `x is string` выводится автоматически, и `filter` сужает тип.' },
        { q: 'Где обязательно нужна проверка данных во время выполнения?', options: ['В каждой функции, у которой есть аннотации типов', 'На границах: API, `localStorage`, `postMessage`', 'Только в тестах, чтобы проверить сами типы', 'Нигде, если в проекте включён режим `strict`'], correct: 1, why: 'Внутри программы типы гарантирует компилятор, а данные извне он не видит.' },
      ],
      en: [
        { q: 'An object `{ x: 1, y: 2, z: 3 }` from a variable is passed to a function expecting `{ x: number; y: number }`. What happens?', options: ['A compile error because of the extra `z`', 'It is fine: compatibility is structural', 'Field `z` is dropped when passed', 'An error because the field order differs'], correct: 1, why: 'Shape is what matters. The excess property check applies only to an object literal written right in the argument.' },
        { q: 'What fits a set of loading states that carry different data?', options: ['An object with three optional fields', 'A discriminated union with a `status` field', 'An `enum` plus a separate data object', '`Record<string, unknown>` for any data'], correct: 1, why: 'A union with a discriminant cannot describe an impossible state and narrows by `status`.' },
        { q: 'How do you return the value type for a key in `get<T, K extends keyof T>(obj: T, key: K)`?', options: ['`T`', '`T[K]`', '`keyof T`', '`K`'], correct: 1, why: 'The indexed access type `T[K]` gives the property type for the key.' },
        { q: 'What is `Exclude<"a" | "b" | "c", "a">`?', options: ['`"a"`', '`"b" | "c"`', '`never`', '`"a" | "b" | "c"`'], correct: 1, why: '`Exclude` distributes over the union and removes members assignable to `"a"`.' },
        { q: 'Which of these cannot be used with `erasableSyntaxOnly`?', options: ['`interface`', '`enum`', 'A `type` union', '`as const`'], correct: 1, why: '`enum` creates runtime code. The rest erases without a trace.' },
        { q: 'What changed by default in TypeScript 6.0?', options: ['`strict` is on by default', 'Constrained generics were removed', '`enum` is forbidden', 'Types are checked at runtime'], correct: 0, why: 'In 6.0, `strict`, `module: "esnext"` and a current-year `target` became the defaults.' },
        { q: 'What is the type of `filter((x) => x !== null)` on `(string | null)[]` in TypeScript 5.5+?', options: ['`(string | null)[]`', '`string[]`', '`unknown[]`', '`never[]`'], correct: 1, why: 'Since 5.5 the predicate `x is string` is inferred, and `filter` narrows the type.' },
        { q: 'Where is runtime validation required?', options: ['In every function that has type annotations', 'At the boundaries: API, `localStorage`, `postMessage`', 'Only in tests, to check the types themselves', 'Nowhere, as long as `strict` mode is on'], correct: 1, why: 'Inside the program the compiler guarantees types, but it cannot see outside data.' },
      ],
    },
  },
}
