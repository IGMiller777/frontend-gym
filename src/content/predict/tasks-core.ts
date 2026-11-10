import type { Source } from '../sources'
import type { PredictTask } from './types'

const mdn = (title: string, path: string): Source => ({ title: `MDN: ${title}`, url: `https://developer.mozilla.org/en-US/docs/${path}`, kind: 'official' })
const verified = { date: '2026-11', version: 'ECMAScript 2025' }

export const corePredict: PredictTask[] = [
  {
    id: 'closure-loop',
    track: 'js-core',
    difficulty: 'easy',
    title: { ru: 'var и let в цикле с таймером', en: 'var and let in a loop with a timer' },
    code: `for (var i = 0; i < 3; i++) setTimeout(() => console.log('var', i))
for (let j = 0; j < 3; j++) setTimeout(() => console.log('let', j))
`,
    output: ['var 3', 'var 3', 'var 3', 'let 0', 'let 1', 'let 2'],
    distractors: ['var 0', 'var 1', 'var 2', 'let 3'],
    explanation: {
      ru: `Колбэки таймеров выполняются после окончания обоих циклов.

- \`var\` создаёт **одну** переменную на всю функцию или модуль. Все три замыкания ссылаются на неё, а к моменту вызова в ней уже \`3\`.
- \`let\` в заголовке \`for\` создаёт **новую** привязку на каждой итерации. Каждое замыкание помнит своё значение: \`0\`, \`1\`, \`2\`.

До ES2015 это чинили немедленно вызываемой функцией (IIFE); сейчас достаточно \`let\`.`,
      en: `The timer callbacks run after both loops have finished.

- \`var\` creates **one** variable for the whole function or module. All three closures refer to it, and by the time they run it holds \`3\`.
- \`let\` in a \`for\` header creates a **new** binding on every iteration. Each closure remembers its own value: \`0\`, \`1\`, \`2\`.

Before ES2015 this was fixed with an immediately invoked function (IIFE); today \`let\` is enough.`,
    },
    sources: [mdn('Closures', 'Web/JavaScript/Guide/Closures'), mdn('let', 'Web/JavaScript/Reference/Statements/let'), mdn('for', 'Web/JavaScript/Reference/Statements/for')],
    verified,
  },
  {
    id: 'this-lost',
    track: 'js-core',
    difficulty: 'medium',
    title: { ru: 'Потерянный this', en: 'Lost this' },
    code: `const user = {
  name: 'Ada',
  hi() {
    return this?.name
  },
  arrow: () => typeof this,
}
const hi = user.hi
console.log(user.hi())
console.log(hi())
console.log(user.arrow())
console.log(hi.call({ name: 'Bob' }))
`,
    output: ['Ada', 'undefined', 'undefined', 'Bob'],
    distractors: ['object', 'window', 'TypeError'],
    explanation: {
      ru: `\`this\` в обычной функции определяется **способом вызова**, а не местом объявления.

- \`user.hi()\`: вызов через объект, \`this === user\`, ответ \`Ada\`.
- \`hi()\`: та же функция без объекта. В модуле действует строгий режим, поэтому \`this\` равен \`undefined\`, а \`?.\` вместо ошибки даёт \`undefined\`.
- \`user.arrow()\`: у стрелки нет своего \`this\`, она берёт его снаружи. Снаружи верхний уровень модуля, там \`this\` равен \`undefined\`.
- \`hi.call({ name: 'Bob' })\`: \`call\` задаёт \`this\` явно.

В классическом скрипте без строгого режима \`hi()\` получила бы глобальный объект.`,
      en: `In a regular function \`this\` is decided by **how the function is called**, not where it is declared.

- \`user.hi()\`: called through the object, \`this === user\`, the answer is \`Ada\`.
- \`hi()\`: the same function without an object. Modules are strict, so \`this\` is \`undefined\`, and \`?.\` gives \`undefined\` instead of an error.
- \`user.arrow()\`: an arrow has no \`this\` of its own and takes it from outside. Outside is the module top level, where \`this\` is \`undefined\`.
- \`hi.call({ name: 'Bob' })\`: \`call\` sets \`this\` explicitly.

In a classic non-strict script, \`hi()\` would get the global object.`,
    },
    sources: [mdn('this', 'Web/JavaScript/Reference/Operators/this'), mdn('Arrow function expressions', 'Web/JavaScript/Reference/Functions/Arrow_functions'), mdn('Function.prototype.call()', 'Web/JavaScript/Reference/Global_Objects/Function/call')],
    verified,
  },
  {
    id: 'hoisting-tdz',
    track: 'js-core',
    difficulty: 'easy',
    title: { ru: 'Поднятие и временная мёртвая зона', en: 'Hoisting and the temporal dead zone' },
    code: `console.log(typeof hoisted)
console.log(typeof notDeclared)
try {
  console.log(later)
} catch (e) {
  console.log(e.name)
}
function hoisted() {}
let later = 1
`,
    output: ['function', 'undefined', 'ReferenceError'],
    distractors: ['TypeError', '1', 'object'],
    explanation: {
      ru: `- **Объявление функции** поднимается целиком: её можно вызвать до строки с \`function\`. Поэтому \`typeof hoisted\` даёт \`function\`.
- \`typeof\` для **необъявленного** имени не бросает ошибку, а возвращает \`undefined\`.
- \`let\`, \`const\` и \`class\` тоже поднимаются, но до строки объявления находятся во **временной мёртвой зоне**: любое обращение бросает \`ReferenceError\`. Даже \`typeof later\` здесь бросил бы ошибку.`,
      en: `- A **function declaration** is hoisted whole: you can call it before the \`function\` line. So \`typeof hoisted\` is \`function\`.
- \`typeof\` on an **undeclared** name does not throw, it returns \`undefined\`.
- \`let\`, \`const\` and \`class\` are hoisted too, but until their declaration line they are in the **temporal dead zone**: any access throws \`ReferenceError\`. Even \`typeof later\` would throw here.`,
    },
    sources: [mdn('Hoisting', 'Glossary/Hoisting'), mdn('let: temporal dead zone', 'Web/JavaScript/Reference/Statements/let#temporal_dead_zone_tdz'), mdn('typeof', 'Web/JavaScript/Reference/Operators/typeof')],
    verified,
  },
  {
    id: 'coercion',
    track: 'js-core',
    difficulty: 'medium',
    title: { ru: 'Приведение типов', en: 'Type coercion' },
    code: `console.log([] + {})
console.log('5' - 2)
console.log('5' + 2)
console.log(null == 0)
console.log(null >= 0)
console.log(NaN === NaN)
`,
    output: ['[object Object]', '3', '52', 'false', 'true', 'false'],
    distractors: ['7', 'NaN', '{}'],
    explanation: {
      ru: `- \`[] + {}\`: оба операнда приводятся к примитивам. Массив даёт \`""\`, объект \`"[object Object]"\`, и \`+\` склеивает строки.
- \`'5' - 2\`: у минуса нет строкового режима, строка становится числом: \`3\`.
- \`'5' + 2\`: если один операнд строка, \`+\` склеивает: \`"52"\`.
- \`null == 0\`: при \`==\` значение \`null\` равно только \`null\` и \`undefined\`, поэтому \`false\`.
- \`null >= 0\`: операторы сравнения приводят \`null\` к числу \`0\`, и \`0 >= 0\` истинно. Да, \`==\` и \`>=\` ведут себя по-разному.
- \`NaN\` не равен ничему, даже себе. Проверяйте через \`Number.isNaN\` или \`Object.is\`.`,
      en: `- \`[] + {}\`: both operands become primitives. The array gives \`""\`, the object \`"[object Object]"\`, and \`+\` concatenates strings.
- \`'5' - 2\`: minus has no string mode, the string becomes a number: \`3\`.
- \`'5' + 2\`: if either operand is a string, \`+\` concatenates: \`"52"\`.
- \`null == 0\`: with \`==\`, \`null\` equals only \`null\` and \`undefined\`, so \`false\`.
- \`null >= 0\`: relational operators turn \`null\` into the number \`0\`, and \`0 >= 0\` is true. Yes, \`==\` and \`>=\` behave differently.
- \`NaN\` equals nothing, not even itself. Use \`Number.isNaN\` or \`Object.is\`.`,
    },
    sources: [mdn('Type coercion', 'Glossary/Type_coercion'), mdn('Equality comparisons and sameness', 'Web/JavaScript/Guide/Equality_comparisons_and_sameness'), mdn('Addition (+)', 'Web/JavaScript/Reference/Operators/Addition')],
    verified,
  },
  {
    id: 'proto-shadowing',
    track: 'js-core',
    difficulty: 'medium',
    title: { ru: 'Свойство прототипа и своё свойство', en: 'Prototype property versus own property' },
    code: `const animal = { sound: 'generic' }
const dog = Object.create(animal)
console.log(dog.sound)
dog.sound = 'woof'
console.log(dog.sound, animal.sound)
delete dog.sound
console.log(dog.sound)
console.log(Object.hasOwn(dog, 'sound'))
`,
    output: ['generic', 'woof generic', 'generic', 'false'],
    distractors: ['woof woof', 'undefined', 'true'],
    explanation: {
      ru: `- У \`dog\` своего свойства \`sound\` нет, и чтение идёт по цепочке прототипов: значение берётся у \`animal\`.
- **Запись** не идёт по цепочке: \`dog.sound = 'woof'\` создаёт **собственное** свойство у \`dog\`, которое затеняет прототипное. \`animal\` не меняется.
- \`delete\` удаляет только собственное свойство. После этого чтение снова доходит до прототипа.
- \`Object.hasOwn\` проверяет только собственные свойства, поэтому \`false\`.`,
      en: `- \`dog\` has no own \`sound\`, so reading walks the prototype chain and finds it on \`animal\`.
- **Writing** does not walk the chain: \`dog.sound = 'woof'\` creates an **own** property on \`dog\` that shadows the prototype one. \`animal\` is unchanged.
- \`delete\` removes only an own property. After it, reading reaches the prototype again.
- \`Object.hasOwn\` checks own properties only, hence \`false\`.`,
    },
    sources: [mdn('Inheritance and the prototype chain', 'Web/JavaScript/Guide/Inheritance_and_the_prototype_chain'), mdn('Object.create()', 'Web/JavaScript/Reference/Global_Objects/Object/create'), mdn('Object.hasOwn()', 'Web/JavaScript/Reference/Global_Objects/Object/hasOwn')],
    verified,
  },
  {
    id: 'reference-copy',
    track: 'js-core',
    difficulty: 'easy',
    title: { ru: 'Ссылка, копия и spread', en: 'Reference, copy and spread' },
    code: `const a = { n: 1, tags: ['x'] }
const b = a
const c = { ...a }
b.n = 2
c.tags.push('y')
c.n = 3
console.log(a.n, b.n, c.n)
console.log(a.tags.length)
console.log(a === b, a === c)
`,
    output: ['2 2 3', '2', 'true false'],
    distractors: ['1 2 3', '1', 'false false'],
    explanation: {
      ru: `- \`const b = a\` не копирует объект, а копирует **ссылку**: \`a\` и \`b\` это один объект. Поэтому \`b.n = 2\` меняет и \`a.n\`.
- \`{ ...a }\` создаёт новый объект, но копия **поверхностная**: \`c.tags\` указывает на тот же массив, что и \`a.tags\`. \`push\` виден через оба объекта.
- \`c.n = 3\` меняет только \`c\`: у него своё свойство \`n\`.
- \`===\` для объектов сравнивает ссылки.

Для глубокой копии используют \`structuredClone\`.`,
      en: `- \`const b = a\` copies the **reference**, not the object: \`a\` and \`b\` are one object. So \`b.n = 2\` changes \`a.n\` too.
- \`{ ...a }\` creates a new object, but the copy is **shallow**: \`c.tags\` points to the same array as \`a.tags\`. The \`push\` is visible through both.
- \`c.n = 3\` changes only \`c\`: it has its own \`n\`.
- \`===\` on objects compares references.

For a deep copy use \`structuredClone\`.`,
    },
    sources: [mdn('Spread syntax', 'Web/JavaScript/Reference/Operators/Spread_syntax'), mdn('Shallow copy', 'Glossary/Shallow_copy'), mdn('Strict equality (===)', 'Web/JavaScript/Reference/Operators/Strict_equality')],
    verified,
  },
]
