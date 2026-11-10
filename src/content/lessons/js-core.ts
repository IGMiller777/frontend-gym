import type { Source } from '../sources'
import { jsCoreMoreLessons } from './js-core-more'
import type { Lesson, Module } from './types'

const mdn = (title: string, path: string): Source => ({ title: `MDN: ${title}`, url: `https://developer.mozilla.org/en-US/docs/${path}`, kind: 'official' })
const verified = { date: '2026-11', version: 'ECMAScript 2025' }

const baseLessons: Lesson[] = [
  {
    id: 'js-types',
    track: 'js-core',
    emoji: '🔢',
    minutes: 12,
    title: { ru: 'Типы, приведение и сравнение', en: 'Types, coercion and equality' },
    summary: {
      ru: 'Восемь типов, typeof, значение и ссылка, правила приведения, NaN, == против ===, null и undefined.',
      en: 'Eight types, typeof, value vs reference, coercion rules, NaN, == vs ===, null and undefined.',
    },
    quiz: {
      ru: [
        { q: 'Что вернёт `typeof null`?', options: ['`"null"`', '`"object"`', '`"undefined"`', 'Бросит ошибку'], correct: 1, why: 'Это историческая ошибка первой версии языка, её не исправляют ради совместимости. Проверяйте `value === null`.' },
        { q: 'Чему равно `[] == false`?', options: ['`true`', '`false`', '`undefined`', 'Бросит TypeError'], correct: 0, why: '`false` превращается в `0`, массив через `toString()` в `""`, а `""` в `0`. Получается `0 == 0`.' },
        { q: 'Какое из значений ложное?', options: ['`"0"`', '`[]`', '`0n`', '`{}`'], correct: 2, why: '`0n` (BigInt ноль) входит в восемь ложных значений. Строка `"0"`, пустой массив и пустой объект истинны.' },
        { q: 'Как одной проверкой поймать и `null`, и `undefined`, но не `0` и не `""`?', options: ['`!value`', '`value === null`', '`value == null`', '`typeof value === "undefined"`'], correct: 2, why: 'При `==` значения `null` и `undefined` равны только друг другу. `!value` поймает ещё `0`, `""` и `NaN`.' },
      ],
      en: [
        { q: 'What does `typeof null` return?', options: ['`"null"`', '`"object"`', '`"undefined"`', 'It throws'], correct: 1, why: 'A historical bug from the first version of the language, kept for compatibility. Check with `value === null`.' },
        { q: 'What is `[] == false`?', options: ['`true`', '`false`', '`undefined`', 'It throws TypeError'], correct: 0, why: '`false` becomes `0`, the array becomes `""` via `toString()`, and `""` becomes `0`. So it is `0 == 0`.' },
        { q: 'Which value is falsy?', options: ['`"0"`', '`[]`', '`0n`', '`{}`'], correct: 2, why: '`0n` (BigInt zero) is one of the eight falsy values. The string `"0"`, an empty array and an empty object are truthy.' },
        { q: 'How do you catch both `null` and `undefined` in one check, but not `0` or `""`?', options: ['`!value`', '`value === null`', '`value == null`', '`typeof value === "undefined"`'], correct: 2, why: 'With `==`, `null` and `undefined` equal only each other. `!value` would also catch `0`, `""` and `NaN`.' },
      ],
    },
    sources: [
      mdn('JavaScript data types and data structures', 'Web/JavaScript/Guide/Data_structures'),
      mdn('Equality comparisons and sameness', 'Web/JavaScript/Guide/Equality_comparisons_and_sameness'),
      { title: 'ECMAScript: IsLooselyEqual', url: 'https://tc39.es/ecma262/#sec-islooselyequal', kind: 'spec' },
    ],
    verified,
  },
  {
    id: 'js-scope-closures',
    track: 'js-core',
    emoji: '🔒',
    minutes: 12,
    title: { ru: 'Области видимости и замыкания', en: 'Scope and closures' },
    summary: {
      ru: 'Лексическая область видимости, var против let и const, всплытие, мёртвая зона и замыкания.',
      en: 'Lexical scope, var vs let and const, hoisting, the temporal dead zone and closures.',
    },
    quiz: {
      ru: [
        { q: 'Что выведет `let x = 1; { let x = 2 } console.log(x)`?', options: ['`1`', '`2`', '`undefined`', 'SyntaxError'], correct: 0, why: 'Внутренний `let x` живёт только в своём блоке и не меняет внешнюю переменную.' },
        { q: 'Что произойдёт при обращении к `let`-переменной до строки её объявления?', options: ['Вернётся `undefined`', 'Вернётся `null`', 'Будет ReferenceError', 'Будет TypeError'], correct: 2, why: 'До строки объявления переменная находится во временной мёртвой зоне. `undefined` вернула бы `var`.' },
        { q: 'В цикле `for (var i = 0; i < 3; i++)` создали три функции `() => i`. Что они вернут при вызове после цикла?', options: ['`0, 1, 2`', '`3, 3, 3`', '`undefined` трижды', '`2, 2, 2`'], correct: 1, why: 'С `var` переменная `i` одна на всю функцию, и к моменту вызова она равна `3`. С `let` было бы `0, 1, 2`.' },
        { q: 'Что такое замыкание?', options: ['Любая функция, объявленная без имени', 'Функция вместе с окружением, где она создана', 'Функция, которая возвращает функцию', 'Копия внешних переменных на момент вызова'], correct: 1, why: 'Замыкание хранит ссылку на окружение, а не копию значений, поэтому видит их изменения. Возвращать функцию для этого не обязательно.' },
      ],
      en: [
        { q: 'What does `let x = 1; { let x = 2 } console.log(x)` print?', options: ['`1`', '`2`', '`undefined`', 'SyntaxError'], correct: 0, why: 'The inner `let x` lives only in its block and does not change the outer variable.' },
        { q: 'What happens when you access a `let` variable before its declaration line?', options: ['It returns `undefined`', 'It returns `null`', 'ReferenceError', 'TypeError'], correct: 2, why: 'Before its declaration the variable is in the temporal dead zone. `var` would return `undefined`.' },
        { q: 'A loop `for (var i = 0; i < 3; i++)` creates three functions `() => i`. What do they return when called after the loop?', options: ['`0, 1, 2`', '`3, 3, 3`', '`undefined` three times', '`2, 2, 2`'], correct: 1, why: 'With `var` there is one `i` for the whole function, and it is `3` by the time they run. With `let` it would be `0, 1, 2`.' },
        { q: 'What is a closure?', options: ['Any function declared without a name', 'A function plus the environment it was created in', 'A function that returns another function', 'A copy of the outer variables made at call time'], correct: 1, why: 'A closure keeps a reference to the environment, not a copy of values, so it sees their changes. Returning a function is not required.' },
      ],
    },
    sources: [
      mdn('Closures', 'Web/JavaScript/Guide/Closures'),
      mdn('Hoisting', 'Glossary/Hoisting'),
      mdn('let: temporal dead zone', 'Web/JavaScript/Reference/Statements/let'),
    ],
    verified,
  },
  {
    id: 'js-this',
    track: 'js-core',
    emoji: '🎯',
    minutes: 12,
    title: { ru: 'this, call, apply и bind', en: 'this, call, apply and bind' },
    summary: {
      ru: 'Как способ вызова определяет this, потеря контекста, стрелочные функции, bind и this в классах.',
      en: 'How the call style decides this, losing context, arrow functions, bind and this in classes.',
    },
    quiz: {
      ru: [
        { q: 'В модуле выполнили `const f = obj.method; f()`. Чему равен `this` внутри `method`?', options: ['`obj`', '`undefined`', '`window`', '`f`'], correct: 1, why: 'Слева от вызова нет объекта, а модули работают в строгом режиме, поэтому `this` равен `undefined`.' },
        { q: 'Можно ли изменить `this` стрелочной функции через `call`?', options: ['Да, как у обычной', 'Только через `bind`', 'Нет, никак', 'Только через `new`'], correct: 2, why: 'Стрелка берёт `this` из внешней функции при создании. `call`, `apply` и `bind` его не меняют, а с `new` стрелку вызвать нельзя.' },
        { q: 'Что выведет `f.bind(a).bind(b)()`, если `f` возвращает `this`?', options: ['`a`', '`b`', '`undefined`', 'TypeError'], correct: 0, why: 'Первая привязка побеждает: второй `bind` оборачивает уже привязанную функцию и `this` не меняет.' },
        { q: 'Привязанную через `bind(ctx)` функцию вызвали с `new`. Чему равен `this`?', options: ['`ctx`', '`undefined`', 'Новому объекту', 'Будет TypeError'], correct: 2, why: '`new` сильнее `bind`: создаётся новый объект, и `this` указывает на него. Привязанные аргументы при этом сохраняются.' },
      ],
      en: [
        { q: 'In a module you run `const f = obj.method; f()`. What is `this` inside `method`?', options: ['`obj`', '`undefined`', '`window`', '`f`'], correct: 1, why: 'There is no object left of the call, and modules are strict, so `this` is `undefined`.' },
        { q: 'Can you change an arrow function’s `this` with `call`?', options: ['Yes, like a regular one', 'Only with `bind`', 'No, not at all', 'Only with `new`'], correct: 2, why: 'An arrow takes `this` from the outer function at creation. `call`, `apply` and `bind` do not change it, and an arrow cannot be called with `new`.' },
        { q: 'What does `f.bind(a).bind(b)()` give if `f` returns `this`?', options: ['`a`', '`b`', '`undefined`', 'TypeError'], correct: 0, why: 'The first binding wins: the second `bind` wraps an already bound function and does not change `this`.' },
        { q: 'A function bound with `bind(ctx)` is called with `new`. What is `this`?', options: ['`ctx`', '`undefined`', 'The new object', 'TypeError'], correct: 2, why: '`new` beats `bind`: a new object is created and `this` points to it. Bound arguments are still applied.' },
      ],
    },
    sources: [
      mdn('this', 'Web/JavaScript/Reference/Operators/this'),
      mdn('Function.prototype.bind()', 'Web/JavaScript/Reference/Global_Objects/Function/bind'),
      mdn('Arrow function expressions', 'Web/JavaScript/Reference/Functions/Arrow_functions'),
    ],
    verified,
  },
  {
    id: 'js-prototypes',
    track: 'js-core',
    emoji: '🧬',
    minutes: 12,
    title: { ru: 'Прототипы и классы', en: 'Prototypes and classes' },
    summary: {
      ru: 'Цепочка прототипов, затенение свойств, prototype и [[Prototype]], что делает new, классы и приватные поля.',
      en: 'The prototype chain, shadowing, prototype vs [[Prototype]], what new does, classes and private fields.',
    },
    quiz: {
      ru: [
        { q: 'Свойства нет ни у объекта, ни в его цепочке прототипов. Что вернёт чтение?', options: ['`null`', '`undefined`', 'ReferenceError', 'TypeError'], correct: 1, why: 'Поиск доходит до `null` в конце цепочки и возвращает `undefined`. Ошибки нет.' },
        { q: '`rabbit = Object.create(animal)`, затем `rabbit.eats = false`. Что изменится?', options: ['`animal.eats` станет `false`', 'У `rabbit` появится своё свойство', 'Будет ошибка записи в прототип', 'Изменятся оба объекта сразу'], correct: 1, why: 'Запись не идёт вверх по цепочке: у `rabbit` появляется собственное свойство, оно затеняет свойство `animal`.' },
        { q: 'Что вернёт `typeof class A {}`?', options: ['`"class"`', '`"object"`', '`"function"`', '`"undefined"`'], correct: 2, why: 'Класс это функция-конструктор с особыми правилами: её нельзя вызвать без `new`.' },
        { q: 'Где хранятся обычные методы класса?', options: ['В каждом экземпляре', 'В `Класс.prototype`', 'В глобальном объекте', 'В замыкании конструктора'], correct: 1, why: 'Методы лежат в прототипе и общие для всех экземпляров. Своя копия у каждого экземпляра только у стрелок в полях.' },
      ],
      en: [
        { q: 'A property is missing on the object and on its whole prototype chain. What does reading it return?', options: ['`null`', '`undefined`', 'ReferenceError', 'TypeError'], correct: 1, why: 'Lookup reaches the `null` at the end of the chain and returns `undefined`. No error.' },
        { q: '`rabbit = Object.create(animal)`, then `rabbit.eats = false`. What changes?', options: ['`animal.eats` becomes `false`', '`rabbit` gets an own property', 'The write to the prototype throws', 'Both objects change at once'], correct: 1, why: 'Writes do not walk up the chain: `rabbit` gets an own property that shadows the one on `animal`.' },
        { q: 'What does `typeof class A {}` return?', options: ['`"class"`', '`"object"`', '`"function"`', '`"undefined"`'], correct: 2, why: 'A class is a constructor function with special rules: it cannot be called without `new`.' },
        { q: 'Where are regular class methods stored?', options: ['In every instance', 'On `Class.prototype`', 'On the global object', 'In the constructor closure'], correct: 1, why: 'Methods live on the prototype and are shared by all instances. Only arrow fields get a copy per instance.' },
      ],
    },
    sources: [
      mdn('Inheritance and the prototype chain', 'Web/JavaScript/Guide/Inheritance_and_the_prototype_chain'),
      mdn('Classes', 'Web/JavaScript/Reference/Classes'),
      mdn('Private elements', 'Web/JavaScript/Reference/Classes/Private_elements'),
    ],
    verified,
  },
  {
    id: 'js-objects-memory',
    track: 'js-core',
    emoji: '🧠',
    minutes: 14,
    title: { ru: 'Копирование, неизменяемость, Map и Set', en: 'Copying, immutability, Map and Set' },
    summary: {
      ru: 'Поверхностная и глубокая копия, structuredClone и его ограничения, freeze, когда брать Map и Set вместо объекта.',
      en: 'Shallow vs deep copy, structuredClone and its limits, freeze, when to use Map and Set instead of an object.',
    },
    quiz: {
      ru: [
        { q: '`const copy = { ...user }`, затем `copy.address.city = "Rome"`. Изменится ли `user.address.city`?', options: ['Нет, spread создал полную копию', 'Да, вложенный объект общий', 'Только в строгом режиме', 'Будет TypeError при записи'], correct: 1, why: 'Spread копирует только верхний уровень, а на вложенный объект копируется ссылка.' },
        { q: 'Что сделает `structuredClone({ run() {} })`?', options: ['Скопирует объект с методом', 'Скопирует без метода', 'Бросит DataCloneError', 'Вернёт `undefined`'], correct: 2, why: 'Функции не клонируются: `structuredClone` бросает `DataCloneError`.' },
        { q: 'После `Object.freeze(obj)` можно ли изменить `obj.nested.value`?', options: ['Нет, freeze глубокий', 'Да, freeze поверхностный', 'Только через `Object.assign`', 'Только в нестрогом режиме'], correct: 1, why: '`Object.freeze` замораживает только сам объект. Для вложенных нужно рекурсивно морозить каждый уровень.' },
        { q: 'Когда `Map` лучше обычного объекта?', options: ['Для записей с известными полями', 'Для словаря с ключами-объектами', 'Для отправки данных в JSON', 'Для доступа к полям через точку'], correct: 1, why: '`Map` принимает ключи любого типа, помнит порядок вставки и не пересекается с ключами прототипа. Объект удобен для записей с известными полями и JSON.' },
      ],
      en: [
        { q: '`const copy = { ...user }`, then `copy.address.city = "Rome"`. Does `user.address.city` change?', options: ['No, spread made a full copy', 'Yes, the nested object is shared', 'Only in strict mode', 'It throws TypeError on write'], correct: 1, why: 'Spread copies only the top level; the nested object is copied by reference.' },
        { q: 'What does `structuredClone({ run() {} })` do?', options: ['Copies the object with the method', 'Copies it without the method', 'Throws DataCloneError', 'Returns `undefined`'], correct: 2, why: 'Functions cannot be cloned: `structuredClone` throws `DataCloneError`.' },
        { q: 'After `Object.freeze(obj)`, can you change `obj.nested.value`?', options: ['No, freeze is deep', 'Yes, freeze is shallow', 'Only via `Object.assign`', 'Only in sloppy mode'], correct: 1, why: '`Object.freeze` freezes only the object itself. Nested objects must be frozen level by level.' },
        { q: 'When is a `Map` better than a plain object?', options: ['For records with known fields', 'For a dictionary keyed by objects', 'For sending data as JSON', 'For dot access to the fields'], correct: 1, why: 'A `Map` accepts keys of any type, keeps insertion order and never clashes with prototype keys. An object suits records with known fields and JSON.' },
      ],
    },
    sources: [
      mdn('structuredClone()', 'Web/API/Window/structuredClone'),
      mdn('Memory management', 'Web/JavaScript/Guide/Memory_management'),
      mdn('Map', 'Web/JavaScript/Reference/Global_Objects/Map'),
      mdn('Object.freeze()', 'Web/JavaScript/Reference/Global_Objects/Object/freeze'),
    ],
    verified,
  },
  {
    id: 'js-modules',
    track: 'js-core',
    emoji: '📦',
    minutes: 10,
    title: { ru: 'Модули: ESM и CommonJS', en: 'Modules: ESM and CommonJS' },
    summary: {
      ru: 'Свойства ES-модулей, живые привязки, динамический import(), CommonJS в Node.js и tree-shaking.',
      en: 'ES module semantics, live bindings, dynamic import(), CommonJS in Node.js and tree-shaking.',
    },
    quiz: {
      ru: [
        { q: 'Чему равен `this` на верхнем уровне ES-модуля?', options: ['`window`', '`globalThis`', '`undefined`', '`module.exports`'], correct: 2, why: 'Модули всегда в строгом режиме, и `this` наверху равен `undefined`. `module.exports` это CommonJS.' },
        { q: 'Почему tree-shaking работает с ESM и почти не работает с CommonJS?', options: ['ESM быстрее загружается', 'Структура ESM статическая', 'CommonJS не умеет экспорт', 'ESM всегда минифицирован'], correct: 1, why: '`import` и `export` известны до запуска, поэтому сборщик видит, что не используется. `require` можно вызвать в условии.' },
        { q: '`import { count, inc } from "./counter.js"`; `inc()` увеличивает экспортированную `count`. Что покажет `count` после вызова?', options: ['Старое значение', 'Новое значение', '`undefined`', 'TypeError'], correct: 1, why: 'Импорт это живая привязка к переменной модуля, поэтому видно новое значение.' },
        { q: 'Может ли `require()` загрузить ES-модуль в Node.js 22.12+?', options: ['Нет, только через import()', 'Да, если нет `await` наверху', 'Только с флагом --experimental', 'Только `.mjs`-файлы из npm'], correct: 1, why: 'С Node.js 22.12 (и 20.19) `require()` загружает ESM синхронно, если в графе модуля нет `await` на верхнем уровне.' },
      ],
      en: [
        { q: 'What is `this` at the top level of an ES module?', options: ['`window`', '`globalThis`', '`undefined`', '`module.exports`'], correct: 2, why: 'Modules are always strict and top-level `this` is `undefined`. `module.exports` is CommonJS.' },
        { q: 'Why does tree-shaking work with ESM but barely with CommonJS?', options: ['ESM loads faster', 'The ESM structure is static', 'CommonJS cannot export', 'ESM is always minified'], correct: 1, why: '`import` and `export` are known before running, so the bundler sees what is unused. `require` can be called inside a condition.' },
        { q: '`import { count, inc } from "./counter.js"`; `inc()` increments the exported `count`. What does `count` show afterwards?', options: ['The old value', 'The new value', '`undefined`', 'TypeError'], correct: 1, why: 'An import is a live binding to the module variable, so the new value is visible.' },
        { q: 'Can `require()` load an ES module in Node.js 22.12+?', options: ['No, only via import()', 'Yes, without top-level `await`', 'Only behind an experimental flag', 'Only `.mjs` files from npm'], correct: 1, why: 'Since Node.js 22.12 (and 20.19) `require()` loads ESM synchronously if its module graph has no top-level `await`.' },
      ],
    },
    sources: [
      mdn('JavaScript modules', 'Web/JavaScript/Guide/Modules'),
      { title: 'Node.js: Loading ECMAScript modules using require()', url: 'https://nodejs.org/api/modules.html#loading-ecmascript-modules-using-require', kind: 'official' },
      { title: 'Node.js: Determining module system', url: 'https://nodejs.org/api/packages.html#determining-module-system', kind: 'official' },
    ],
    verified,
  },
]

/** Path order: language basics first, then functions and objects, then runtime and modules. */
const order = [
  'js-types', 'js-numbers-strings', 'js-scope-closures', 'js-functions', 'js-this', 'js-prototypes', 'js-object-properties', 'js-objects-memory',
  'js-arrays', 'js-iterators', 'js-errors', 'js-memory', 'js-patterns', 'js-caching', 'js-engine', 'js-modules',
]
const all = new Map([...baseLessons, ...jsCoreMoreLessons].map((l) => [l.id, l]))
export const jsCoreLessons: Lesson[] = order.map((id) => all.get(id)!)
if (jsCoreLessons.length !== all.size || jsCoreLessons.some((l) => !l)) throw new Error('js-core: lesson order is out of sync with lesson list')

export const jsCoreModule: Module = {
  track: 'js-core',
  lessons: jsCoreLessons.map((l) => l.id),
  exam: {
    pass: 0.75,
    questions: {
      ru: [
        { q: 'Что выведет `console.log(1 < 2 < 3, 3 > 2 > 1)`?', options: ['`true true`', '`true false`', '`false true`', '`false false`'], correct: 1, why: '`3 > 2` даёт `true`, затем `true > 1` превращается в `1 > 1`, а это `false`.' },
        { q: 'Что вернёт `typeof NaN`?', options: ['`"NaN"`', '`"number"`', '`"undefined"`', '`"object"`'], correct: 1, why: '`NaN` это особое значение типа number, результат неудачной числовой операции.' },
        { q: 'Чему равно `"b" + "a" + +"a" + "a"`?', options: ['`"baaa"`', '`"baNaNa"`', '`"ba0a"`', '`NaN`'], correct: 1, why: 'Унарный плюс превращает `"a"` в число и даёт `NaN`, которое затем склеивается со строками.' },
        { q: '`const o = { f() { return () => this } }`. Что вернёт `o.f()() === o`?', options: ['`true`', '`false`', '`undefined`', 'TypeError'], correct: 0, why: 'Стрелка взяла `this` из `f`, а `f` вызвали как `o.f()`, значит `this` равен `o`.' },
        { q: 'Есть ли `toString` у объекта из `Object.create(null)`?', options: ['Да, как у всех объектов', 'Нет, у него нет прототипа', 'Только после `freeze`', 'Есть, но бросает ошибку'], correct: 1, why: '`Object.create(null)` создаёт объект без прототипа, поэтому унаследованных методов у него нет.' },
        { q: 'Какой способ глубоко копирует объект с `Map` и `Date` без потерь?', options: ['`{ ...obj }`', '`Object.assign({}, obj)`', '`JSON.parse(JSON.stringify(obj))`', '`structuredClone(obj)`'], correct: 3, why: 'Spread и `Object.assign` поверхностные, а JSON превращает `Date` в строку и `Map` в пустой объект.' },
        { q: '`function make() { let n = 0; return () => ++n }`, `a = make()`, `b = make()`. Что вернут `a(); a(); b()` последним вызовом?', options: ['`1`', '`2`', '`3`', '`0`'], correct: 0, why: 'Каждый вызов `make` создаёт своё окружение со своей `n`, поэтому `b()` возвращает `1`.' },
        { q: 'Что верно про импорт в ES-модулях?', options: ['Импорт это копия значения', 'Модуль выполняется при каждом импорте', 'Импорт это живая привязка', 'Импорт можно переприсвоить'], correct: 2, why: 'Импорт видит текущее значение экспортированной переменной, модуль выполняется один раз, а присваивать импорту нельзя.' },
        { q: 'Чему равно `0.1 + 0.2 === 0.3`?', options: ['`true`', '`false`', '`NaN`', 'TypeError'], correct: 1, why: 'Двоичная плавающая точка хранит 0.1 и 0.2 с округлением: сумма равна `0.30000000000000004`.' },
        { q: 'Что сделает `new (() => {})()`?', options: ['Создаст пустой объект', 'Вернёт `undefined`', 'Бросит TypeError', 'Вернёт саму функцию'], correct: 2, why: 'У стрелочной функции нет `[[Construct]]`: вызов с `new` бросает `TypeError`.' },
        { q: 'Какой метод возвращает новый массив, не меняя исходный?', options: ['`toSorted`', '`sort`', '`splice`', '`reverse`'], correct: 0, why: '`toSorted`, `toReversed`, `toSpliced` и `with` из ES2023 копируют массив; остальные меняют его на месте.' },
        { q: 'Что вернёт `gen()` для `function* gen() { console.log(1); yield 2 }`?', options: ['Выведет 1 и вернёт 2', 'Генератор, ничего не выведя', 'Выведет 1 и вернёт генератор', 'Бросит без `new`'], correct: 1, why: 'Тело генератора не выполняется до первого `next()`.' },
        { q: 'Что вернёт `try { return 1 } finally { return 2 }`?', options: ['`1`', '`2`', '`undefined`', 'SyntaxError'], correct: 1, why: '`return` в `finally` перебивает результат `try` (и даже брошенную ошибку).' },
        { q: 'Почему `WeakMap` подходит для метаданных DOM-узлов?', options: ['Он быстрее `Map`', 'Его можно перебирать', 'Он не держит узел в памяти', 'Ключи могут быть строками'], correct: 2, why: 'Когда узел удалён и забыт, запись исчезает вместе с ним; `Map` держал бы узел.' },
      ],
      en: [
        { q: 'What does `console.log(1 < 2 < 3, 3 > 2 > 1)` print?', options: ['`true true`', '`true false`', '`false true`', '`false false`'], correct: 1, why: '`3 > 2` gives `true`, then `true > 1` becomes `1 > 1`, which is `false`.' },
        { q: 'What does `typeof NaN` return?', options: ['`"NaN"`', '`"number"`', '`"undefined"`', '`"object"`'], correct: 1, why: '`NaN` is a special value of type number, the result of a failed numeric operation.' },
        { q: 'What is `"b" + "a" + +"a" + "a"`?', options: ['`"baaa"`', '`"baNaNa"`', '`"ba0a"`', '`NaN`'], correct: 1, why: 'Unary plus turns `"a"` into a number, giving `NaN`, which is then concatenated with the strings.' },
        { q: '`const o = { f() { return () => this } }`. What is `o.f()() === o`?', options: ['`true`', '`false`', '`undefined`', 'TypeError'], correct: 0, why: 'The arrow took `this` from `f`, and `f` was called as `o.f()`, so `this` is `o`.' },
        { q: 'Does an object from `Object.create(null)` have `toString`?', options: ['Yes, like every object', 'No, it has no prototype', 'Only after `freeze`', 'Yes, but it throws'], correct: 1, why: '`Object.create(null)` makes an object with no prototype, so it inherits no methods.' },
        { q: 'Which deep-copies an object with a `Map` and a `Date` without losses?', options: ['`{ ...obj }`', '`Object.assign({}, obj)`', '`JSON.parse(JSON.stringify(obj))`', '`structuredClone(obj)`'], correct: 3, why: 'Spread and `Object.assign` are shallow, and JSON turns a `Date` into a string and a `Map` into an empty object.' },
        { q: '`function make() { let n = 0; return () => ++n }`, `a = make()`, `b = make()`. What does the last call in `a(); a(); b()` return?', options: ['`1`', '`2`', '`3`', '`0`'], correct: 0, why: 'Each `make` call creates its own environment with its own `n`, so `b()` returns `1`.' },
        { q: 'What is true about imports in ES modules?', options: ['An import is a copy', 'The module runs on every import', 'An import is a live binding', 'An import can be reassigned'], correct: 2, why: 'An import sees the current value of the exported variable, the module runs once, and imports cannot be assigned to.' },
        { q: 'What is `0.1 + 0.2 === 0.3`?', options: ['`true`', '`false`', '`NaN`', 'TypeError'], correct: 1, why: 'Binary floating point stores 0.1 and 0.2 rounded: the sum is `0.30000000000000004`.' },
        { q: 'What does `new (() => {})()` do?', options: ['Creates an empty object', 'Returns `undefined`', 'Throws TypeError', 'Returns the function'], correct: 2, why: 'An arrow function has no `[[Construct]]`: calling it with `new` throws a `TypeError`.' },
        { q: 'Which method returns a new array without changing the original?', options: ['`toSorted`', '`sort`', '`splice`', '`reverse`'], correct: 0, why: 'ES2023 `toSorted`, `toReversed`, `toSpliced` and `with` copy the array; the others change it in place.' },
        { q: 'What does `gen()` return for `function* gen() { console.log(1); yield 2 }`?', options: ['Logs 1 and returns 2', 'A generator, logging nothing', 'Logs 1, returns a generator', 'Throws without `new`'], correct: 1, why: 'A generator body does not run until the first `next()`.' },
        { q: 'What does `try { return 1 } finally { return 2 }` return?', options: ['`1`', '`2`', '`undefined`', 'SyntaxError'], correct: 1, why: '`return` in `finally` overrides the result of `try` (and even a thrown error).' },
        { q: 'Why does a `WeakMap` suit DOM node metadata?', options: ['It is faster than a `Map`', 'Its entries can be iterated', 'It does not keep the node alive', 'Its keys can be plain strings'], correct: 2, why: 'Once the node is removed and forgotten, the entry goes with it; a `Map` would keep the node.' },
      ],
    },
  },
}
