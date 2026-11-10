import type { Source } from '../sources'
import type { Lesson } from './types'

/** js-core lessons added in the coverage pass (Notion topics + interview essentials); ordered in js-core.ts. */
const mdn = (title: string, path: string): Source => ({ title: `MDN: ${title}`, url: `https://developer.mozilla.org/en-US/docs/${path}`, kind: 'official' })
const verified = { date: '2026-11', version: 'ECMAScript 2025' }

export const jsCoreMoreLessons: Lesson[] = [
  {
    id: 'js-numbers-strings',
    track: 'js-core',
    emoji: '🔣',
    minutes: 14,
    title: { ru: 'Числа, строки и даты', en: 'Numbers, strings and dates' },
    summary: {
      ru: 'Плавающая точка и 0.1 + 0.2, BigInt, Number против parseInt, UTF-16 и графемы, ловушки Date, Intl и статус Temporal.',
      en: 'Floating point and 0.1 + 0.2, BigInt, Number vs parseInt, UTF-16 and graphemes, Date pitfalls, Intl and the status of Temporal.',
    },
    quiz: {
      ru: [
        { q: 'Что вернёт `["1", "2", "3"].map(parseInt)`?', options: ['`[1, 2, 3]`', '`[1, NaN, NaN]`', '`[NaN, NaN, NaN]`', '`["1", "2", "3"]`'], correct: 1, why: '`map` передаёт индекс вторым аргументом, и он становится основанием: `parseInt("2", 1)` и `parseInt("3", 2)` дают `NaN`.' },
        { q: 'Чему равно `"👍".length`?', options: ['`1`', '`2`', '`4`', '`0`'], correct: 1, why: '`length` считает кодовые единицы UTF-16, а этот эмодзи вне базовой плоскости и занимает две.' },
        { q: '`new Date(2026, 0, 31)`, затем `setMonth(1)`. Какой будет дата?', options: ['28 февраля', '3 марта', '31 января', 'Invalid Date'], correct: 1, why: 'Месяцы считаются с нуля, а 31 февраля не существует, поэтому дата переливается на 3 марта.' },
        { q: 'Как хранить денежные суммы, чтобы не терять копейки?', options: ['В `number` с `toFixed(2)`', 'В целых копейках', 'В строке с запятой', 'В `Math.round` каждый раз'], correct: 1, why: 'Двоичная плавающая точка не хранит 0.1 точно; целые минимальные единицы точны до 2⁵³ − 1.' },
      ],
      en: [
        { q: 'What does `["1", "2", "3"].map(parseInt)` return?', options: ['`[1, 2, 3]`', '`[1, NaN, NaN]`', '`[NaN, NaN, NaN]`', '`["1", "2", "3"]`'], correct: 1, why: '`map` passes the index as the second argument and it becomes the radix: `parseInt("2", 1)` and `parseInt("3", 2)` give `NaN`.' },
        { q: 'What is `"👍".length`?', options: ['`1`', '`2`', '`4`', '`0`'], correct: 1, why: '`length` counts UTF-16 code units, and this emoji is outside the basic plane, so it takes two.' },
        { q: '`new Date(2026, 0, 31)`, then `setMonth(1)`. What is the date?', options: ['February 28', 'March 3', 'January 31', 'Invalid Date'], correct: 1, why: 'Months are 0-based and February 31 does not exist, so the date overflows to March 3.' },
        { q: 'How do you store money amounts without losing cents?', options: ['A `number` with `toFixed(2)`', 'As integer cents', 'A string with a comma', '`Math.round` every time'], correct: 1, why: 'Binary floating point cannot store 0.1 exactly; integer minor units are exact up to 2⁵³ − 1.' },
      ],
    },
    sources: [
      mdn('Number', 'Web/JavaScript/Reference/Global_Objects/Number'),
      mdn('BigInt', 'Web/JavaScript/Reference/Global_Objects/BigInt'),
      mdn('String: UTF-16 characters, Unicode code points, and grapheme clusters', 'Web/JavaScript/Reference/Global_Objects/String#utf-16_characters_unicode_code_points_and_grapheme_clusters'),
      mdn('Date', 'Web/JavaScript/Reference/Global_Objects/Date'),
      mdn('Intl', 'Web/JavaScript/Reference/Global_Objects/Intl'),
      mdn('Temporal', 'Web/JavaScript/Reference/Global_Objects/Temporal'),
    ],
    verified,
  },
  {
    id: 'js-functions',
    track: 'js-core',
    emoji: '🧮',
    minutes: 14,
    title: { ru: 'Функции: виды, параметры, каррирование, рекурсия', en: 'Functions: kinds, parameters, currying, recursion' },
    summary: {
      ru: 'Объявление, выражение и стрелка, чем стрелка отличается от обычной функции, параметры и fn.length, чистые функции, каррирование, compose и pipe, рекурсия и стек.',
      en: 'Declaration, expression and arrow, how arrows differ from regular functions, parameters and fn.length, pure functions, currying, compose and pipe, recursion and the stack.',
    },
    quiz: {
      ru: [
        { q: 'Что произойдёт при `new (() => {})()`?', options: ['Создастся пустой объект', 'TypeError: не конструктор', 'Вернётся `undefined`', 'SyntaxError при разборе'], correct: 1, why: 'У стрелочной функции нет `[[Construct]]` и `prototype`, поэтому вызов с `new` бросает `TypeError`.' },
        { q: 'Чему равно `((a, b = 1, c) => {}).length`?', options: ['`3`', '`2`', '`1`', '`0`'], correct: 2, why: '`length` считает параметры до первого со значением по умолчанию.' },
        { q: 'Что вернёт `f(null)` для `function f(x = 5) { return x }`?', options: ['`5`', '`null`', '`undefined`', '`0`'], correct: 1, why: 'Значение по умолчанию подставляется только вместо `undefined`.' },
        { q: 'Почему глубокая рекурсия в Chrome падает даже в хвостовой форме?', options: ['Chrome запрещает рекурсию', 'V8 не делает TCO', 'Стек ограничен 100 вызовами', 'Нужен строгий режим'], correct: 1, why: 'Оптимизацию хвостовых вызовов из ES2015 реализует только JavaScriptCore в Safari; V8 добавляет кадр на каждый вызов.' },
      ],
      en: [
        { q: 'What happens with `new (() => {})()`?', options: ['An empty object is created', 'TypeError: not a constructor', 'It returns `undefined`', 'A SyntaxError at parse time'], correct: 1, why: 'An arrow function has no `[[Construct]]` and no `prototype`, so calling it with `new` throws a `TypeError`.' },
        { q: 'What is `((a, b = 1, c) => {}).length`?', options: ['`3`', '`2`', '`1`', '`0`'], correct: 2, why: '`length` counts parameters before the first one with a default value.' },
        { q: 'What does `f(null)` return for `function f(x = 5) { return x }`?', options: ['`5`', '`null`', '`undefined`', '`0`'], correct: 1, why: 'A default value replaces only `undefined`.' },
        { q: 'Why does deep recursion crash in Chrome even in tail form?', options: ['Chrome forbids recursion', 'V8 does not do TCO', 'The stack holds 100 calls', 'It needs strict mode'], correct: 1, why: 'Of the major engines only Safari\'s JavaScriptCore implements ES2015 tail call optimization; V8 adds a frame per call.' },
      ],
    },
    sources: [
      mdn('Functions', 'Web/JavaScript/Guide/Functions'),
      mdn('Arrow function expressions', 'Web/JavaScript/Reference/Functions/Arrow_functions'),
      mdn('Default parameters', 'Web/JavaScript/Reference/Functions/Default_parameters'),
      mdn('Function: length', 'Web/JavaScript/Reference/Global_Objects/Function/length'),
      mdn('Recursion (glossary)', 'Glossary/Recursion'),
    ],
    verified,
  },
  {
    id: 'js-object-properties',
    track: 'js-core',
    emoji: '🔐',
    minutes: 14,
    title: { ru: 'Свойства объектов: дескрипторы, Symbol, Proxy', en: 'Object properties: descriptors, Symbol, Proxy' },
    summary: {
      ru: 'Дескрипторы и флаги, геттеры и сеттеры, порядок ключей, freeze, seal и preventExtensions, Symbol-ключи, Proxy и Reflect.',
      en: 'Descriptors and flags, getters and setters, key order, freeze, seal and preventExtensions, Symbol keys, Proxy and Reflect.',
    },
    quiz: {
      ru: [
        { q: 'Какие флаги получит свойство из `Object.defineProperty(o, "x", { value: 1 })`?', options: ['Все `true`', 'Все `false`', 'Только `writable: true`', 'Как у литерала'], correct: 1, why: 'У `defineProperty` флаги `writable`, `enumerable` и `configurable` по умолчанию `false`.' },
        { q: 'Что выведет `Object.keys({ b: 1, 2: 0, a: 1, 1: 0 })`?', options: ["`['b','2','a','1']`", "`['1','2','b','a']`", "`['a','b','1','2']`", "`['b','a','1','2']`"], correct: 1, why: 'Сначала ключи-индексы по возрастанию, затем строки в порядке добавления.' },
        { q: 'Что сделает `{ ...obj }` с геттером `obj.total`?', options: ['Скопирует сам геттер как есть', 'Скопирует его текущее значение', 'Пропустит это свойство целиком', 'Бросит TypeError на геттере'], correct: 1, why: 'Spread читает свойства, поэтому геттер вызывается, а копия получает обычное свойство-значение.' },
        { q: 'Чем `Object.seal` отличается от `Object.freeze`?', options: ['После seal значения менять можно', 'seal замораживает всю глубину', 'seal запрещает только удаление', 'Ничем, это просто синонимы'], correct: 0, why: '`seal` запрещает добавлять и удалять свойства, но значения менять можно; `freeze` запрещает и это.' },
      ],
      en: [
        { q: 'Which flags does a property from `Object.defineProperty(o, "x", { value: 1 })` get?', options: ['All `true`', 'All `false`', 'Only `writable: true`', 'Same as a literal'], correct: 1, why: 'With `defineProperty`, `writable`, `enumerable` and `configurable` default to `false`.' },
        { q: 'What does `Object.keys({ b: 1, 2: 0, a: 1, 1: 0 })` print?', options: ["`['b','2','a','1']`", "`['1','2','b','a']`", "`['a','b','1','2']`", "`['b','a','1','2']`"], correct: 1, why: 'Index-like keys first in ascending order, then strings in insertion order.' },
        { q: 'What does `{ ...obj }` do with a getter `obj.total`?', options: ['Copies the getter itself', 'Copies its current value', 'Skips the property entirely', 'Throws a TypeError on it'], correct: 1, why: 'Spread reads properties, so the getter runs and the copy gets a plain data property.' },
        { q: 'How does `Object.seal` differ from `Object.freeze`?', options: ['After seal values can change', 'seal freezes every level', 'seal only forbids deleting', 'No difference: synonyms'], correct: 0, why: '`seal` forbids adding and deleting properties, but values can still change; `freeze` forbids that too.' },
      ],
    },
    sources: [
      mdn('Object.defineProperty()', 'Web/JavaScript/Reference/Global_Objects/Object/defineProperty'),
      mdn('Enumerability and ownership of properties', 'Web/JavaScript/Guide/Enumerability_and_ownership_of_properties'),
      mdn('Object.freeze()', 'Web/JavaScript/Reference/Global_Objects/Object/freeze'),
      mdn('Symbol', 'Web/JavaScript/Reference/Global_Objects/Symbol'),
      mdn('Proxy', 'Web/JavaScript/Reference/Global_Objects/Proxy'),
      mdn('Meta programming', 'Web/JavaScript/Guide/Meta_programming'),
    ],
    verified,
  },
  {
    id: 'js-memory',
    track: 'js-core',
    emoji: '🧹',
    minutes: 14,
    title: { ru: 'Память: сборка мусора, утечки, слабые ссылки', en: 'Memory: garbage collection, leaks, weak references' },
    summary: {
      ru: 'Достижимость и mark-and-sweep, поколения в V8, утечки во фронтенде и поиск в DevTools, WeakMap, WeakRef, FinalizationRegistry и using.',
      en: 'Reachability and mark-and-sweep, generations in V8, front-end leaks and finding them in DevTools, WeakMap, WeakRef, FinalizationRegistry and using.',
    },
    quiz: {
      ru: [
        { q: 'Два объекта ссылаются только друг на друга. Соберёт ли их GC?', options: ['Нет, ссылки на них ещё есть', 'Только после `null` у обоих', 'Только в строгом режиме', 'Да, они недостижимы от корней'], correct: 3, why: 'Алгоритм пометки идёт от корней; цикл, до которого нельзя дойти, освобождается.' },
        { q: 'Почему `WeakMap` нельзя перебрать?', options: ['Это ограничение спецификации ради скорости', 'Содержимое зависит от того, прошёл ли GC', 'Ключи хранятся в другом потоке', 'Так можно, через `entries()`'], correct: 1, why: 'Записи исчезают вместе с ключами в непредсказуемый момент, и результат перебора зависел бы от сборщика.' },
        { q: 'Подходит ли `FinalizationRegistry` для закрытия WebSocket?', options: ['Да, это его назначение', 'Нет, вызов не гарантирован', 'Да, если сокет в `Map`', 'Только в Node.js'], correct: 1, why: 'Колбэк может не вызваться вовсе; ресурсы закрывают явно (`close`, `finally`, `using`).' },
        { q: 'Что чаще всего держит память после размонтирования компонента?', options: ['Локальные переменные функции', 'Строки внутри замыкания', 'Неснятый обработчик на `window`', 'Свойства со значением `undefined`'], correct: 2, why: 'Обработчик на `window` достижим от корня и держит всё, что замкнул, включая компонент.' },
      ],
      en: [
        { q: 'Two objects reference only each other. Will GC collect them?', options: ['No, they still have references', 'Only after setting both to `null`', 'Only when running in strict mode', 'Yes, they are unreachable from roots'], correct: 3, why: 'Marking starts from the roots; a cycle that cannot be reached is freed.' },
        { q: 'Why can you not iterate a `WeakMap`?', options: ['A spec limit added for speed', 'Its content depends on whether GC ran', 'Its keys live in another thread', 'You can, through `entries()`'], correct: 1, why: 'Entries vanish together with their keys at an unpredictable moment, so iteration would depend on the collector.' },
        { q: 'Is `FinalizationRegistry` right for closing a WebSocket?', options: ['Yes, that is its purpose', 'No, the call is not guaranteed', 'Yes, if the socket is in a `Map`', 'Only in Node.js'], correct: 1, why: 'The callback may never run; resources are closed explicitly (`close`, `finally`, `using`).' },
        { q: 'What most often keeps memory after a component unmounts?', options: ['Local function variables', 'Strings inside a closure', 'A listener left on `window`', 'Properties set to `undefined`'], correct: 2, why: 'A listener on `window` is reachable from a root and keeps everything it captured, the component included.' },
      ],
    },
    sources: [
      mdn('Memory management', 'Web/JavaScript/Guide/Memory_management'),
      mdn('WeakMap', 'Web/JavaScript/Reference/Global_Objects/WeakMap'),
      mdn('WeakRef', 'Web/JavaScript/Reference/Global_Objects/WeakRef'),
      mdn('FinalizationRegistry', 'Web/JavaScript/Reference/Global_Objects/FinalizationRegistry'),
      mdn('JavaScript resource management', 'Web/JavaScript/Guide/Resource_management'),
      { title: 'v8.dev: Trash talk: the Orinoco garbage collector', url: 'https://v8.dev/blog/trash-talk', kind: 'official' },
      { title: 'Chrome DevTools: Fix memory problems', url: 'https://developer.chrome.com/docs/devtools/memory-problems', kind: 'official' },
    ],
    verified,
  },
  {
    id: 'js-iterators',
    track: 'js-core',
    emoji: '🔁',
    minutes: 13,
    title: { ru: 'Итераторы и генераторы', en: 'Iterators and generators' },
    summary: {
      ru: 'Протокол итерации, свои перебираемые объекты, генераторы и ленивые последовательности, методы итераторов ES2025, for await.',
      en: 'The iteration protocol, custom iterables, generators and lazy sequences, ES2025 iterator helpers, for await.',
    },
    quiz: {
      ru: [
        { q: 'Что нужно объекту, чтобы работать в `for...of`?', options: ['Числовые ключи и `length`', 'Собственный метод `forEach`', 'Метод `[Symbol.iterator]()`', 'Прототип `Array.prototype`'], correct: 2, why: '`for...of` вызывает `[Symbol.iterator]()` и затем `next()` у полученного итератора.' },
        { q: 'Что делает вызов функции-генератора `gen()`?', options: ['Выполняет тело функции до конца', 'Возвращает генератор, тело не запущено', 'Выполняет тело до первого `yield`', 'Бросает ошибку, если вызвать без `new`'], correct: 1, why: 'Тело начинает выполняться только при первом `next()`.' },
        { q: 'Куда попадёт значение из `gen.next(42)`?', options: ['В аргументы самого генератора', 'В поле `value` ответа `next`', 'Станет результатом текущего `yield`', 'Всегда будет проигнорировано'], correct: 2, why: 'Аргумент `next` становится значением выражения `yield`, на котором генератор стоял; у первого `next` он теряется.' },
        { q: 'Чем `iterator.map(fn)` (ES2025) отличается от `array.map(fn)`?', options: ['Ленивый: считает по запросу', 'Ничем, это тот же метод', 'Мутирует исходный массив', 'Работает только с числами'], correct: 0, why: 'Методы итераторов не создают промежуточных массивов и вызывают `fn` только для запрошенных элементов.' },
      ],
      en: [
        { q: 'What does an object need to work in `for...of`?', options: ['Numeric keys and `length`', 'Its own `forEach` method', 'A `[Symbol.iterator]()` method', '`Array.prototype` as prototype'], correct: 2, why: '`for...of` calls `[Symbol.iterator]()` and then `next()` on the returned iterator.' },
        { q: 'What does calling a generator function `gen()` do?', options: ['Runs the body to the very end', 'Returns a generator, body not run', 'Runs the body up to the first `yield`', 'Throws if called without `new`'], correct: 1, why: 'The body starts only on the first `next()`.' },
        { q: 'Where does the value from `gen.next(42)` go?', options: ['Into the generator arguments list', 'Into the `value` field of the reply', 'It becomes the result of the current `yield`', 'It is always ignored by the engine'], correct: 2, why: 'The argument of `next` becomes the value of the `yield` expression the generator paused at; the first `next` loses it.' },
        { q: 'How does `iterator.map(fn)` (ES2025) differ from `array.map(fn)`?', options: ['It is lazy: computes on demand', 'No difference, same method', 'It mutates the source array', 'It only works with numbers'], correct: 0, why: 'Iterator helpers create no intermediate arrays and call `fn` only for the elements requested.' },
      ],
    },
    sources: [
      mdn('Iteration protocols', 'Web/JavaScript/Reference/Iteration_protocols'),
      mdn('Iterators and generators', 'Web/JavaScript/Guide/Iterators_and_generators'),
      mdn('Iterator', 'Web/JavaScript/Reference/Global_Objects/Iterator'),
      mdn('for await...of', 'Web/JavaScript/Reference/Statements/for-await...of'),
    ],
    verified,
  },
  {
    id: 'js-arrays',
    track: 'js-core',
    emoji: '📚',
    minutes: 14,
    title: { ru: 'Массивы: методы, мутации, полифилы', en: 'Arrays: methods, mutation, polyfills' },
    summary: {
      ru: 'Карта методов, мутирующие методы и копирующие пары ES2023, ловушки sort и reduce, дыры, groupBy, методы Set, полифилы map, filter и reduce.',
      en: 'A map of methods, mutating methods and their ES2023 copying pairs, sort and reduce pitfalls, holes, groupBy, Set methods, map, filter and reduce polyfills.',
    },
    quiz: {
      ru: [
        { q: 'Что вернёт `[10, 1, 2].sort()`?', options: ['`[1, 2, 10]`', '`[1, 10, 2]`', '`[10, 2, 1]`', '`[2, 1, 10]`'], correct: 1, why: 'Без функции сравнения `sort` сравнивает строки: `"10"` раньше `"2"`.' },
        { q: 'Какой метод не меняет исходный массив?', options: ['`sort`', '`toSorted`', '`reverse`', '`splice`'], correct: 1, why: '`toSorted` (ES2023) возвращает отсортированную копию; остальные меняют массив на месте.' },
        { q: 'Что вернёт `[NaN].includes(NaN)` и `[NaN].indexOf(NaN)`?', options: ['`true` и `0`', '`true` и `-1`', '`false` и `-1`', '`false` и `0`'], correct: 1, why: '`includes` использует SameValueZero, `indexOf` строгое равенство, а `NaN !== NaN`.' },
        { q: 'Что вернёт `new Array(3).map(() => 0)`?', options: ['`[0, 0, 0]`', 'Три пустых слота', '`[]`', 'TypeError'], correct: 1, why: '`map` пропускает дыры, а `new Array(3)` состоит из них; нужен `Array.from({ length: 3 }, () => 0)`.' },
      ],
      en: [
        { q: 'What does `[10, 1, 2].sort()` return?', options: ['`[1, 2, 10]`', '`[1, 10, 2]`', '`[10, 2, 1]`', '`[2, 1, 10]`'], correct: 1, why: 'Without a comparator `sort` compares strings: `"10"` comes before `"2"`.' },
        { q: 'Which method does not change the original array?', options: ['`sort`', '`toSorted`', '`reverse`', '`splice`'], correct: 1, why: '`toSorted` (ES2023) returns a sorted copy; the others change the array in place.' },
        { q: 'What do `[NaN].includes(NaN)` and `[NaN].indexOf(NaN)` return?', options: ['`true` and `0`', '`true` and `-1`', '`false` and `-1`', '`false` and `0`'], correct: 1, why: '`includes` uses SameValueZero, `indexOf` uses strict equality, and `NaN !== NaN`.' },
        { q: 'What does `new Array(3).map(() => 0)` return?', options: ['`[0, 0, 0]`', 'Three empty slots', 'An empty array `[]`', 'A TypeError at once'], correct: 1, why: '`map` skips holes, and `new Array(3)` is all holes; use `Array.from({ length: 3 }, () => 0)`.' },
      ],
    },
    sources: [
      mdn('Array', 'Web/JavaScript/Reference/Global_Objects/Array'),
      mdn('Array.prototype.toSorted()', 'Web/JavaScript/Reference/Global_Objects/Array/toSorted'),
      mdn('Indexed collections: sparse arrays', 'Web/JavaScript/Guide/Indexed_collections#sparse_arrays'),
      mdn('Object.groupBy()', 'Web/JavaScript/Reference/Global_Objects/Object/groupBy'),
      mdn('Set: set composition', 'Web/JavaScript/Reference/Global_Objects/Set#set_composition'),
    ],
    verified,
  },
  {
    id: 'js-errors',
    track: 'js-core',
    emoji: '🚨',
    minutes: 12,
    title: { ru: 'Ошибки и их обработка', en: 'Errors and error handling' },
    summary: {
      ru: 'Встроенные типы ошибок, try, catch и finally, return в finally, свои ошибки и cause, асинхронные ошибки, глобальные обработчики, границы ошибок.',
      en: 'Built-in error types, try, catch and finally, return in finally, custom errors and cause, async errors, global handlers, error boundaries.',
    },
    quiz: {
      ru: [
        { q: 'Что вернёт функция с `try { throw e } finally { return 1 }`?', options: ['Бросит `e`', 'Вернёт `1`', 'Вернёт `undefined`', 'SyntaxError'], correct: 1, why: '`return` в `finally` перебивает и результат, и исключение: ошибка теряется.' },
        { q: 'Поймает ли `try/catch` ошибку из колбэка `setTimeout`, запущенного внутри `try`?', options: ['Да, всегда и в любом случае', 'Нет, колбэк выполнится позже', 'Да, если задержка таймера 0 мс', 'Только в строгом режиме кода'], correct: 1, why: 'К моменту вызова колбэка блок `try` уже завершён; ошибка уйдёт в глобальный обработчик.' },
        { q: 'Зачем `new Error(msg, { cause })`?', options: ['Чтобы ускорить стек', 'Чтобы сохранить исходную ошибку', 'Чтобы скрыть сообщение', 'Чтобы ошибка не логировалась'], correct: 1, why: '`cause` хранит исходную ошибку при обёртке, и в логах видна вся цепочка.' },
        { q: 'Какая ошибка будет у `null.x`?', options: ['`ReferenceError`', '`TypeError`', '`RangeError`', '`SyntaxError`'], correct: 1, why: 'Чтение свойства у `null` или `undefined` это `TypeError`; `ReferenceError` для необъявленной переменной.' },
      ],
      en: [
        { q: 'What does a function with `try { throw e } finally { return 1 }` do?', options: ['Throws `e`', 'Returns `1`', 'Returns `undefined`', 'SyntaxError'], correct: 1, why: '`return` in `finally` overrides both the result and the exception: the error is lost.' },
        { q: 'Does `try/catch` catch an error from a `setTimeout` callback started inside `try`?', options: ['Yes, always and in every case', 'No, the callback runs later', 'Yes, with a 0 ms delay timer', 'Only in strict mode code'], correct: 1, why: 'By the time the callback runs, the `try` block has finished; the error goes to the global handler.' },
        { q: 'Why `new Error(msg, { cause })`?', options: ['To speed up the stack', 'To keep the original error', 'To hide the message', 'To avoid logging'], correct: 1, why: '`cause` keeps the original error when wrapping, so logs show the whole chain.' },
        { q: 'Which error does `null.x` raise?', options: ['`ReferenceError`', '`TypeError`', '`RangeError`', '`SyntaxError`'], correct: 1, why: 'Reading a property of `null` or `undefined` is a `TypeError`; `ReferenceError` is for an undeclared variable.' },
      ],
    },
    sources: [
      mdn('Error', 'Web/JavaScript/Reference/Global_Objects/Error'),
      mdn('try...catch', 'Web/JavaScript/Reference/Statements/try...catch'),
      mdn('Error: cause', 'Web/JavaScript/Reference/Global_Objects/Error/cause'),
      mdn('Window: unhandledrejection event', 'Web/API/Window/unhandledrejection_event'),
      mdn('reportError()', 'Web/API/Window/reportError'),
      { title: 'react.dev: Catching rendering errors with an error boundary', url: 'https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary', kind: 'official' },
    ],
    verified,
  },
  {
    id: 'js-patterns',
    track: 'js-core',
    emoji: '🧱',
    minutes: 13,
    title: { ru: 'Паттерны: миксины, наблюдатель, модуль, фабрика', en: 'Patterns: mixins, observer, module, factory' },
    summary: {
      ru: 'Композиция против наследования, миксины, EventEmitter и EventTarget, синглтон через модуль, фабрика, декоратор и стратегия.',
      en: 'Composition vs inheritance, mixins, EventEmitter and EventTarget, a module singleton, factory, decorator and strategy.',
    },
    quiz: {
      ru: [
        { q: 'Что потеряет `Object.assign(target, mixin)`, если в миксине геттер?', options: ['Ничего, всё скопируется как есть', 'Геттер: скопируется значение', 'Все методы миксина целиком', 'Прототип целевого объекта'], correct: 1, why: '`Object.assign` читает свойства источника, поэтому геттер вызывается и копируется его значение.' },
        { q: 'Почему `emit` обходит копию списка обработчиков?', options: ['Так обход заметно быстрее', 'Иначе порядок станет случайным', 'Чтобы не было утечек памяти', 'Обработчик может отписаться по ходу'], correct: 3, why: 'Отписка во время обхода изменила бы коллекцию и пропустила или повторила обработчики.' },
        { q: 'Чем опасен модульный синглтон при SSR?', options: ['Медленный импорт', 'Он общий для всех запросов', 'Он не работает в Node.js', 'Он теряет состояние'], correct: 1, why: 'Сервер обслуживает многих пользователей в одном процессе, и модуль выполняется один раз на всех.' },
        { q: 'Что такое `(Base) => class extends Base { ... }`?', options: ['Фабрика объектов', 'Миксин-класс', 'Декоратор метода', 'Синглтон'], correct: 1, why: 'Функция от базового класса к расширенному встраивает поведение в цепочку прототипов с `super`.' },
      ],
      en: [
        { q: 'What does `Object.assign(target, mixin)` lose if the mixin has a getter?', options: ['Nothing, all is copied as is', 'The getter: the value is copied', 'All of the mixin methods', 'The prototype of the target'], correct: 1, why: '`Object.assign` reads source properties, so the getter runs and its value is copied.' },
        { q: 'Why does `emit` iterate over a copy of the handlers?', options: ['Iterating a copy is faster', 'Otherwise the order is random', 'To avoid any memory leaks', 'A handler may unsubscribe mid-way'], correct: 3, why: 'Unsubscribing while iterating would change the collection and skip or repeat handlers.' },
        { q: 'Why is a module singleton dangerous with SSR?', options: ['The import becomes slow', 'It is shared by all requests', 'It cannot run in Node.js', 'It loses its state on load'], correct: 1, why: 'The server serves many users in one process, and the module runs once for all of them.' },
        { q: 'What is `(Base) => class extends Base { ... }`?', options: ['An object factory', 'A class mixin', 'A method decorator', 'A singleton'], correct: 1, why: 'A function from a base class to an extended one adds behavior to the prototype chain with `super`.' },
      ],
    },
    sources: [
      mdn('Classes: mix-ins', 'Web/JavaScript/Reference/Classes/extends#mix-ins'),
      mdn('EventTarget', 'Web/API/EventTarget'),
      mdn('CustomEvent', 'Web/API/CustomEvent'),
      mdn('JavaScript modules', 'Web/JavaScript/Guide/Modules'),
      { title: 'TC39: Decorators proposal', url: 'https://tc39.es/proposal-decorators/', kind: 'spec' },
    ],
    verified,
  },
  {
    id: 'js-caching',
    track: 'js-core',
    emoji: '🗄️',
    minutes: 13,
    title: { ru: 'Кэширование в памяти: мемоизация, LRU, SWR', en: 'In-memory caching: memoization, LRU, SWR' },
    summary: {
      ru: 'Где живут кэши, мемоизация и выбор ключа, LRU, LFU, FIFO и TTL, LRU на Map, stale-while-revalidate, cache stampede и инвалидация.',
      en: 'Where caches live, memoization and choosing a key, LRU, LFU, FIFO and TTL, LRU on a Map, stale-while-revalidate, cache stampede and invalidation.',
    },
    quiz: {
      ru: [
        { q: 'Какую функцию безопасно мемоизировать без срока жизни?', options: ['`fetchUser(id)`', 'Чистую функцию', 'Функцию с `Date.now()`', 'Любую асинхронную'], correct: 1, why: 'Только чистая функция всегда даёт тот же результат на те же аргументы.' },
        { q: 'Почему LRU удобно писать на `Map`?', options: ['Map быстрее объекта', 'Map помнит порядок вставки', 'Map сам вытесняет записи', 'Map хранит слабые ссылки'], correct: 1, why: 'Удалить и вставить запись значит сделать её самой свежей; первая по порядку самая давняя.' },
        { q: 'Что делает stale-while-revalidate с устаревшей записью?', options: ['Ждёт новую загрузку данных', 'Отдаёт старое и обновляет в фоне', 'Удаляет запись и бросает ошибку', 'Отдаёт `undefined` до загрузки'], correct: 1, why: 'Пользователь получает ответ сразу, а свежие данные приходят к следующему чтению.' },
        { q: 'Что такое cache stampede?', options: ['Переполнение кэша сверх ёмкости', 'Утечка памяти из-за кэша', 'Разом грузят истёкший ключ', 'Ошибка из-за неверного ключа'], correct: 2, why: 'Много клиентов одновременно видят истёкшую запись и все идут на сервер; защита: одна загрузка на ключ.' },
      ],
      en: [
        { q: 'Which function is safe to memoize without a time to live?', options: ['`fetchUser(id)`', 'A pure function', 'A function using `Date.now()`', 'Any async function'], correct: 1, why: 'Only a pure function always gives the same result for the same arguments.' },
        { q: 'Why is LRU easy to write on a `Map`?', options: ['Map is faster than an object', 'Map keeps insertion order', 'Map evicts entries itself', 'Map holds weak references'], correct: 1, why: 'Deleting and re-inserting an entry makes it the most recent; the first one in order is the oldest.' },
        { q: 'What does stale-while-revalidate do with a stale entry?', options: ['Waits for a brand new load first', 'Returns it and refreshes in the background', 'Deletes the entry and throws an error', 'Returns `undefined` until loaded'], correct: 1, why: 'The user gets an answer at once, and fresh data arrives for the next read.' },
        { q: 'What is a cache stampede?', options: ['A cache growing past capacity', 'A memory leak caused by a cache', 'Simultaneous loads of an expired key', 'An error caused by a wrong key'], correct: 2, why: 'Many clients see an expired entry at once and all hit the server; the fix is one load per key.' },
      ],
    },
    sources: [
      mdn('Memoization (glossary)', 'Glossary/Memoization'),
      mdn('Map', 'Web/JavaScript/Reference/Global_Objects/Map'),
      mdn('Cache-Control: stale-while-revalidate', 'Web/HTTP/Reference/Headers/Cache-Control#stale-while-revalidate'),
      { title: 'TanStack Query: Caching examples', url: 'https://tanstack.com/query/latest/docs/framework/react/guides/caching', kind: 'official' },
    ],
    verified,
  },
  {
    id: 'js-engine',
    track: 'js-core',
    emoji: '⚙️',
    minutes: 12,
    title: { ru: 'Как движок выполняет код', en: 'How the engine runs your code' },
    summary: {
      ru: 'Разбор и AST, байткод и JIT-уровни V8, деоптимизация, скрытые классы и inline-кэши, строгий режим целиком, eval и new Function.',
      en: 'Parsing and the AST, bytecode and V8 JIT tiers, deoptimization, hidden classes and inline caches, strict mode in full, eval and new Function.',
    },
    quiz: {
      ru: [
        { q: 'Что такое деоптимизация в V8?', options: ['Сборка мусора в старом поколении', 'Возврат к байткоду при нарушенном предположении', 'Удаление неиспользуемого кода из бандла', 'Отключение JIT-компилятора в строгом режиме'], correct: 1, why: 'Оптимизированный код опирается на типы из обратной связи; если они не совпали, движок выбрасывает его.' },
        { q: 'Как помочь inline-кэшам в горячем коде?', options: ['Удалять ненужные свойства', 'Создавать объекты одной формы', 'Добавлять свойства по условию', 'Хранить числа строками'], correct: 1, why: 'Одна форма объектов в месте доступа даёт мономорфный и самый быстрый доступ.' },
        { q: 'Где строгий режим включён автоматически?', options: ['Во всех скриптах на странице', 'Только в результате TypeScript', 'В ES-модулях и классах', 'Только в процессах Node.js'], correct: 2, why: 'Код модулей и тела классов всегда строгие; в классических скриптах нужна директива.' },
        { q: 'Что запрещает CSP без `unsafe-eval`?', options: ['Только прямой вызов `eval`', 'Все инлайн-скрипты на странице', 'Динамический `import()` модулей', 'Любое выполнение строки как кода'], correct: 3, why: 'Все способы выполнить строку как код попадают под этот запрет.' },
      ],
      en: [
        { q: 'What is deoptimization in V8?', options: ['Garbage collection in the old generation', 'Back to bytecode when an assumption breaks', 'Removing unused code from the bundle', 'Turning the JIT off in strict mode code'], correct: 1, why: 'Optimized code relies on types from feedback; when they do not match, the engine discards it.' },
        { q: 'How do you help inline caches in hot code?', options: ['Delete unused properties', 'Create objects of one shape', 'Add properties conditionally', 'Store numbers as strings'], correct: 1, why: 'One object shape at an access site gives monomorphic and fastest access.' },
        { q: 'Where is strict mode on automatically?', options: ['In every script on a page', 'Only in TypeScript output', 'In ES modules and classes', 'Only in Node.js processes'], correct: 2, why: 'Module code and class bodies are always strict; classic scripts need the directive.' },
        { q: 'What does a CSP without `unsafe-eval` forbid?', options: ['Only a direct call to `eval`', 'Every inline script on the page', 'Dynamic `import()` of modules', 'Any running of a string as code'], correct: 3, why: 'Every way of running a string as code falls under this ban.' },
      ],
    },
    sources: [
      mdn('Strict mode', 'Web/JavaScript/Reference/Strict_mode'),
      mdn('eval(): never use direct eval', 'Web/JavaScript/Reference/Global_Objects/eval#never_use_direct_eval!'),
      mdn('JavaScript technologies overview: engines', 'Web/JavaScript/Reference/JavaScript_technologies_overview'),
      { title: 'v8.dev: Maglev, V8’s fastest optimizing JIT', url: 'https://v8.dev/blog/maglev', kind: 'official' },
      { title: 'v8.dev: Sparkplug, a non-optimizing JavaScript compiler', url: 'https://v8.dev/blog/sparkplug', kind: 'official' },
      { title: 'v8.dev: Fast properties in V8', url: 'https://v8.dev/blog/fast-properties', kind: 'official' },
    ],
    verified,
  },
]
