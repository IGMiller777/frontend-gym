# Аудит заметок: JavaScript, основа языка

Источник: страница Notion «JS» (около 205 тысяч знаков). Для трека `js-core` прочитаны целиком разделы General (Object, копирование, immutable, Functions, `use strict`, Map/Set/WeakMap, mixins, eval), Data Types, `this` + call/apply/bind, Closure, Hoisting, Scope, Prototyping, Garbage collector, Module systems (ESM vs CJS), `==` и `===`.

Не прочитаны в этом проходе, относятся к другим трекам: Promises, Async/Await, Event Loop, Web/Service Workers, AbortController (трек `js-async`), Tree-shaking (трек `tooling`), подробные разделы WeakRef и FinalizationRegistry (в уроке о памяти дана краткая сводка по MDN), Кэширование, Recursion, Capturing (трек `browser`).

Каждое утверждение уроков сверено с MDN, спецификацией ECMAScript или документацией Node.js; все примеры с выводом выполняются в CI (`scripts/content.test.ts`).

## Найденные ошибки

| Раздел | В заметках | На самом деле | Источник |
|---|---|---|---|
| Глубокое копирование | `structuredClone` копирует `WeakMap` и `WeakSet` | Не копирует: бросает `DataCloneError` | [MDN: Structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm) |
| Глубокое копирование | File и Blob клонируются «с transfer» | Blob и File клонируются; передаваемые (transferable) это ArrayBuffer, MessagePort и др. | там же |
| `use strict` | В строгом режиме нельзя объявлять функции в блоках | Можно с ES2015: они видны только внутри блока | [MDN: Strict mode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode) |
| eval | eval обходит CSP | CSP блокирует `eval`, если нет `'unsafe-eval'` | [MDN: CSP script-src](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/script-src) |
| Map/WeakMap | WeakMap «единственный способ» приватных свойств до `#private` | Приватность давали и замыкания; `#`-поля есть с ES2022 | [MDN: Private elements](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_elements) |
| Map/WeakMap | «Используй Map вместо `{}` для хэшей всегда» | Объект уместен для записей с известными полями и JSON; Map для динамических словарей | [MDN: Map vs Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map#objects_vs._maps) |
| null и undefined | Свойство со значением `undefined`: `in` даёт `false`, `hasOwnProperty` `false`, нет в `Object.keys` | Свойство существует: `in`, `hasOwn` дают `true`, ключ есть в `Object.keys`. Ложь только для отсутствующего свойства | проверено запуском, урок `js-types` |
| null и undefined | Вывод противоречит правилам выше («почти всегда предпочтительнее null») | Урок даёт одно правило: `undefined` ставит язык, `null` ставят явно | урок `js-types` |
| this | В глобальной области `this` это глобальный объект | Так только в классическом скрипте; в модуле `undefined` | [MDN: this](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this) |
| this | Пример с `deepObj.deepest()` подписан `// OUTER` | Выведет `DEEP`: метод вызван на `deepObj` | проверено запуском |
| Прототипы | Не найденное в цепочке свойство даёт `ReferenceError` | Возвращается `undefined` | [MDN: Inheritance and the prototype chain](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain) |
| Прототипы | `rufus.name` вернёт `"Rufus"`, `eats` на уровне 1 | `Dog` не вызывает `Animal`, поэтому `name` равен `undefined`; `eats` на уровне 2 | проверено запуском |
| Прототипы | `dog.speak()` выведет `undefined` | Выведет `true`: `eats` найдено по цепочке у `animal` | проверено запуском |
| Прототипы | «Решение: стрелочные функции в прототипах» для `this` | Стрелки в прототипе не получат `this` экземпляра | урок `js-this` |
| Прототипы | Цифры производительности поиска (12 мс, 45 мс, 220 мс) | Источника нет, числа выдуманы; в уроке не используются | — |
| Сборка мусора | `%PerformGC()` в Chrome, `performance.memory.usedHeapSize` | Таких API нет: в Node `--expose-gc` и `global.gc()`, в Chrome устаревший `performance.memory.usedJSHeapSize` | [MDN: performance.memory](https://developer.mozilla.org/en-US/docs/Web/API/Performance/memory) |
| Сборка мусора | «+10–20% памяти на запись WeakMap» | Источника нет; в уроке не используется | — |
| Модули | `require()` не может загрузить ESM, будет TypeError | С Node.js 22.12 и 20.19 может, если нет `await` на верхнем уровне | [Node.js: require(esm)](https://nodejs.org/api/modules.html#loading-ecmascript-modules-using-require) |
| Модули | «Node.js 22+: ESM по умолчанию, CJS deprecated 2026–2027» | `.js` без `"type"` по-прежнему CommonJS (с определением синтаксиса ESM); CommonJS не объявлен устаревшим | [Node.js: Determining module system](https://nodejs.org/api/packages.html#determining-module-system) |
| Модули | CJS возвращает «snapshot (копию)» | `require` возвращает тот же объект `module.exports` из кэша; копируются лишь значения при деструктуризации | там же |
| Модули | Deno и Bun «только ESM» | Bun поддерживает CommonJS, Deno 2 тоже | документация Bun и Deno |
| Модули | Размеры бандлов и время старта (500 КБ, 24 КБ, 12 мс, 18 мс) | Источника нет; в уроке не используются | — |
| `==` | Алгоритм без BigInt и без уточнения про Date | Урок даёт упрощённую версию с оговоркой, ссылка на спецификацию в «Читать подробнее» | [ECMAScript: IsLooselyEqual](https://tc39.es/ecma262/#sec-islooselyequal) |

## Пробелы, закрытые в уроках

- `Object.is` и `Number.isNaN` против глобального `isNaN`.
- Список из восьми ложных значений.
- Временная мёртвая зона для `class` и для `typeof`.
- Правило «`new` сильнее `bind`», повторный `bind`.
- `this` в полях классов (стрелки) и цена такого подхода.
- Что делает `new` по шагам, `prototype` и `[[Prototype]]`.
- Почему нельзя расширять встроенные прототипы (история с `flatten` и `flat`).
- `Object.preventExtensions`, `seal` и `freeze` в одной таблице; поведение в строгом и нестрогом режиме.
- Источники утечек памяти и поиск утечек через снимки кучи в DevTools.
- Живые привязки ESM, динамический `import()`, `<script type="module">`, поле `sideEffects`.
