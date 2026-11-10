# Аудит заметок: JavaScript, основа языка

Источник: страница Notion «JS» (около 200 тысяч знаков без картинок). Первый проход (6 уроков) читал разделы General, Data Types, this, Closure, Hoisting, Scope, Prototyping, Garbage collector, Module systems и `==`. Второй проход (ноябрь 2026, по правилу «все темы из заметок плюс основные вопросы собеседований») дочитал остальные разделы: функции и стрелки, `use strict`, миксины, `eval`, рекурсию, кэширование, tree-shaking, WeakMap и WeakSet, WeakRef, FinalizationRegistry, полный цикл выполнения, Preload и Prefetch, полифилы, остановку таймеров и список задач Practice coding. Таблица покрытия ниже показывает, где разобрана каждая тема.

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

## Покрытие заметок Notion (второй проход)

Каждая тема страницы «JS» и место, где она разобрана. Треки: `js-core` и `js-async` (этот раздел общий для обоих), остальное в других треках.

| Тема в заметках | Где разобрано |
|---|---|
| Practice coding: список GFE 75 | Задачи: все 24 задачи раздела «JavaScript functions» из GFE 75 (`curry`, `map-limit`, `debounce`, `throttle`, `deep-clone`, `flatten`, `event-emitter`, `class-names`, `promise-all`, `deep-equal`, `memoize`, `promise-any`, `array-reduce`, `function-call`, `type-utilities`, `squash-object`, `deep-omit`, `data-merging`, `list-format`, `json-stringify`, `html-serializer`, `promisify`, `get-elements-by-class-name`, `get-elements-by-style`) плюс `get-by-path` и `lru-cache` |
| General: Object, копирование (spread, assign, create + дескрипторы, JSON, structuredClone, cloneDeep, рекурсия) | `js-objects-memory` (копии), `js-object-properties` (копия с дескрипторами) |
| Immutable: freeze, seal, preventExtensions, defineProperty, deep freeze, const | `js-objects-memory#Неизменяемость`, `js-object-properties#Защита объекта` |
| Functions: стрелочные и обычные (синтаксис, this, hoisting, arguments, new) | `js-functions#Чем стрелочная функция отличается`, `js-this` |
| `use strict` | `js-engine#Строгий режим` |
| Map, Set, WeakMap, WeakSet | `js-objects-memory#Map и Set`, `js-memory#WeakMap и WeakSet` |
| mixins | `js-patterns#Миксины` |
| eval is evil | `js-engine#eval и new Function` |
| Data Types, null и undefined | `js-types` |
| this, call, apply, bind (включая обработчики событий) | `js-this`, `browser-events` |
| Closure | `js-scope-closures` |
| Promises и статические методы | `async-promises`, `async-combinators` |
| Async/Await | `async-await` |
| EventLoop, микро- и макрозадачи, как создать микрозадачу | `async-event-loop` |
| Рендер: Style, Layout, Paint, Composite, layout thrashing | трек `browser`: `browser-rendering`, `browser-layout-paint` |
| Полный цикл: от файла до выполнения | `js-engine#Путь кода в V8` (разбор и компиляция), `async-event-loop` (порядок выполнения) |
| Типы задач, Web Workers, Service Workers и event loop | `async-timers-workers`, `net-caching` (Service Worker) |
| Hoisting | `js-scope-closures#Всплытие`, `js-functions` (объявление и выражение) |
| Capturing и Bubbling | трек `browser`: `browser-events` |
| Scope | `js-scope-closures` |
| Recursion | `js-functions#Рекурсия` |
| Кэширование: мемоизация, LRU, LFU, FIFO, inflight, TTL, TTR/SWR | `js-caching`, `net-caching` (HTTP и объединение запросов) |
| Prototyping | `js-prototypes` |
| AbortController | `async-cancellation`, `async-patterns` |
| Garbage collector | `js-memory` |
| Tree-shaking mechanics | `js-modules#Tree-shaking`; подробно в треке `tooling` |
| WeakRef, FinalizationRegistry | `js-memory` |
| Module systems (ESM и CJS) | `js-modules` |
| Preload и Prefetch | трек `network`: `net-loading` |
| `==` и `===` | `js-types` |
| Полифилы forEach, map, filter, reduce | `js-arrays#Полифилы`, задача `array-reduce` |
| How stop setTimeout и setInterval | `async-timers-workers` |

Темы собеседований, которых нет в заметках и которые добавлены: числа, строки, даты и `Intl` (`js-numbers-strings`), итераторы и генераторы (`js-iterators`), методы массивов (`js-arrays`), ошибки (`js-errors`), дескрипторы, `Symbol`, `Proxy` и `Reflect` (`js-object-properties`), паттерны (`js-patterns`), устройство движка (`js-engine`), асинхронные паттерны (`async-patterns`).

## Ошибки, найденные во втором проходе

| Раздел | В заметках | На самом деле | Источник |
|---|---|---|---|
| eval | Песочница через `vm` или `vm2` | Модуль `vm` не является защитной песочницей, `vm2` закрыт из-за уязвимостей | [Node.js: vm](https://nodejs.org/api/vm.html) |
| Map/WeakMap | У WeakMap «порядок вставки не гарантируется» | Порядок у WeakMap не имеет смысла: его нельзя перебрать вовсе | [MDN: WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap) |
| Миксины | `Object.assign` «копирует функциональность» | Копирует значения: геттеры вызываются, и копия получает обычное свойство | проверено запуском, урок `js-patterns` |
| Tree-shaking | `import * as mod` «ломает tree-shaking» | Современные сборщики удаляют неиспользуемые экспорты и при импорте пространства имён, если обращение статическое; проблема lodash в том, что это CommonJS | [MDN: Tree shaking](https://developer.mozilla.org/en-US/docs/Glossary/Tree_shaking) |
| Tree-shaking | `import(modName)` с переменной даёт «Runtime ошибку» | В браузере и Node.js работает; сборщик не может разрешить путь заранее и предупреждает | [MDN: import()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) |
| Tree-shaking | Vite «Rollup + esbuild», цифры экономии (95% lodash и т. п.) | Vite 8 собирает на Rolldown и Oxc; цифры без источника | [Vite](https://vite.dev/guide/) |
| WeakRef | Пример `new WeakRef(key)` для строкового ключа | `WeakRef` принимает только объекты и незарегистрированные символы: `TypeError` | [MDN: WeakRef](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakRef) |
| WeakRef | Обработчик события через `WeakRef(handler)` | Если обработчик больше нигде не хранится, его соберут, и событие перестанет обрабатываться | разбор кода |
| WeakRef | «Автоочистка при удалении #counter» в цикле `requestAnimationFrame` | Цикл работает, пока GC не соберёт элемент, момент не определён | [MDN: WeakRef, notes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakRef#notes_on_weakrefs) |
| FinalizationRegistry | Закрытие WebSocket в колбэке реестра | Сокет хранится в той же `Map` и никогда не будет собран; ресурсы закрывают явно | урок `js-memory` |
| FinalizationRegistry | «V8 9.0+ может игнорировать финализаторы ради incremental GC» | Источника нет; спецификация просто не гарантирует вызов | [MDN: FinalizationRegistry](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/FinalizationRegistry) |
| GC | Принудительный GC через `chrome://flags` | В DevTools на вкладке Memory есть кнопка Collect garbage | [Chrome DevTools: memory](https://developer.chrome.com/docs/devtools/memory-problems) |
| `==` | Алгоритм без `BigInt` и `Symbol.toPrimitive` | Объект сначала проверяет `Symbol.toPrimitive`; у `Date` строковая подсказка | [ECMAScript: IsLooselyEqual](https://tc39.es/ecma262/#sec-islooselyequal) |
