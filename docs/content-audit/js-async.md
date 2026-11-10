# Аудит заметок: JavaScript, асинхронность

Источник: страница Notion «JS» и её подстраница «Event Loop (Micro|Macro)». Прочитаны целиком разделы Promises (упражнения, статические методы, общее описание), Async/Await, EventLoop (+ Browser) со всеми вложенными блоками (упражнения с ответами, «Цикл выполнения», фазы, rAF, Layout thrashing, пример работы, Web Workers, Service Workers), AbortController, «How stop setTimeout | setInterval», а также подстраница «Event Loop (Micro|Macro)» целиком.

Раздел про рендеринг (Style, Layout, Paint, Composite, layout thrashing) относится к треку `browser`; найденные там ошибки записаны ниже, чтобы не потерять их, а уроки по ним будут в треке браузера.

Каждое утверждение уроков сверено с MDN, спецификациями HTML, DOM и ECMAScript, документацией Node.js и web.dev. Данные о поддержке браузерами взяты из MDN Browser Compat Data 8.1.8. Все примеры с выводом выполняются в CI (`scripts/content.test.ts`).

## Найденные ошибки

| Раздел | В заметках | На самом деле | Источник |
|---|---|---|---|
| Упражнения event loop, №9 | `timeout 1 → promise 1 → promise 2 → timeout 2 → …` | `promise 1 → promise 2 → timeout 1 → timeout 2 → promise inside timeout`: микрозадачи скрипта выполняются раньше первого таймера | проверено запуском |
| Упражнения event loop, №12 | `A → D → B → C` | `D → B → C → A`: таймер на 100 мс истекает последним | проверено запуском |
| Упражнения event loop, №7 | Node.js: `… 2 → 3`, `setImmediate` раньше `setTimeout(0)` | В главном модуле порядок `setImmediate` и `setTimeout(fn, 0)` не гарантирован | [Node.js: setImmediate() vs setTimeout()](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick#setimmediate-vs-settimeout) |
| «Цикл выполнения» | `queueMicrotask` отдельный шаг после микрозадач; `requestIdleCallback` перед макрозадачей | `queueMicrotask` кладёт в ту же очередь микрозадач. Виток: одна задача, все микрозадачи, отрисовка (rAF, стили, layout, paint), затем idle-колбэки | [HTML: Event loop processing model](https://html.spec.whatwg.org/multipage/webappapis.html#event-loop-processing-model) |
| «Пример работы» | Итоговый порядок `… 6 (rAF) → 11 → 2 (setTimeout)` подан как гарантированный | Порядок `setTimeout(0)` и `requestAnimationFrame` не гарантирован, обычно таймер раньше | там же; урок `async-event-loop` |
| rAF | Код, который меняет и читает размеры, «может зафорсить requestAnimationFrame» | Чтение размеров после записи форсирует синхронный layout, но не вызывает колбэки rAF | [MDN: requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame) |
| rAF против setTimeout | `setTimeout` «работает на неактивных вкладках, тратит ресурсы»; «минимальная задержка ~4 мс» | В фоне таймеры замедляются до раза в секунду и реже. 4 мс только с пятого уровня вложенности | [MDN: setTimeout, reasons for delays](https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout#reasons_for_delays_longer_than_specified) |
| Подстраница Event Loop | `queueMicrotask` «предоставляется стандартом ECMAScript» | Определена в стандарте HTML (`WindowOrWorkerGlobalScope`) | [MDN: queueMicrotask()](https://developer.mozilla.org/en-US/docs/Web/API/Window/queueMicrotask) |
| Подстраница Event Loop | Из очереди задач выполняется «одно или несколько заданий, стараясь уложиться в 16,6 мс» | По модели обработки HTML за виток выполняется одна задача, после неё микрозадачи и, если пора, отрисовка | [HTML: Event loop processing model](https://html.spec.whatwg.org/multipage/webappapis.html#event-loop-processing-model) |
| Подстраница Event Loop | `async/await`: «функция, которая возвращает Promise, создаёт микрозадачу» | Микрозадачу создаёт `await`: продолжение функции встаёт в очередь, когда ожидаемое значение готово | [MDN: await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await) |
| Подстраница Event Loop, рендеринг | HTML-парсер «приостанавливается, пока не загрузится CSS» | CSS блокирует отрисовку и выполнение скриптов, но не сам разбор HTML | [web.dev: Render-blocking CSS](https://web.dev/articles/critical-rendering-path/render-blocking-css) |
| Async/Await | `await` можно использовать только внутри async-функций | Ещё на верхнем уровне ES-модулей (ES2022) | [MDN: await, top-level await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await#top_level_await) |
| Async/Await | Пример цепочки промисов использует `user` в последнем `then` | `user` не в области видимости этого колбэка: `ReferenceError` | разбор кода |
| Promise.any | «Возвращает массив с причинами отказа»; своя реализация кладёт ошибки через `push` | Отклоняется `AggregateError`, причины в `errors` идут в порядке входа; `push` даёт порядок по времени | [MDN: Promise.any()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/any), проверено запуском |
| Promise.all, allSettled | Реализации используют `promises.length` | Методы принимают любой iterable (генератор, `Set`), у которых нет `length` | [MDN: Promise.all()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all) |
| AbortController | «Встроенный API в JavaScript (с ES2018)» | Это стандарт DOM, а не ECMAScript | [DOM Standard: Aborting ongoing activities](https://dom.spec.whatwg.org/#aborting-ongoing-activities) |
| AbortController | `abort()` «выбрасывает AbortError в операциях»; пример `controller1.abort('Первый сработал')` с `err.message` | С переданной причиной операции отклоняются этой причиной (здесь строкой, у неё нет `message`); `AbortError` только без причины | [MDN: AbortController.abort()](https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort), проверено запуском |
| AbortController | Отменяет «таймеры», IntersectionObserver, ResizeObserver | Эти API сигнал не принимают, их останавливают вручную | [MDN: AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal) |
| AbortController | `fetchWithTimeout` на `setTimeout` + `abort()` | Таймер не очищается; правильнее `AbortSignal.timeout(ms)` с причиной `TimeoutError` | [MDN: AbortSignal.timeout()](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout_static) |
| Layout thrashing | Каждая запись стиля в цикле подписана как отдельный reflow | Запись только помечает layout устаревшим; reflow происходит при следующем чтении геометрии | [web.dev: Avoid layout thrashing](https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing) |
| Layout thrashing | «Браузер пересчитает layout асинхронно в requestAnimationFrame» | Layout пересчитывается на этапе отрисовки кадра, после колбэков rAF | [HTML: Update the rendering](https://html.spec.whatwg.org/multipage/webappapis.html#update-the-rendering) |
| Composite | `opacity` вызывает Paint и одновременно указан как composite-свойство; `transform: scale` на hover назван «только paint» | Анимация `transform` и `opacity` может обойтись композицией без layout и paint | [web.dev: Stick to compositor-only properties](https://web.dev/articles/stick-to-compositor-only-properties-and-manage-layer-count) |
| requestIdleCallback | «3–5 мс в конце каждого кадра» | Источника для чисел нет; спецификация ограничивает дедлайн 50 мс. В Safari API нет | [MDN: requestIdleCallback()](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback) |

## Пробелы, закрытые в уроках

- Разделы «Параллельное выполнение» и «Распространённые ошибки» в Async/Await были пустыми: в уроке `async-await` есть параллельность через `Promise.all`, `forEach` и async-колбэки, `return await` в `try`, забытый `await`, `fetch` и `response.ok`.
- Цепочка `then`: что возвращает колбэк и что становится с новым промисом, забытый `return`, `then(ok, fail)` против `then(ok).catch(fail)`, поведение `finally`.
- Необработанные отклонения (`unhandledrejection`, поведение Node.js).
- `Promise.withResolvers` (ES2024) и `Promise.try` (ES2025).
- `AbortSignal.timeout`, `AbortSignal.any`, `throwIfAborted`, отписка от событий через `signal`, свои отменяемые функции, гонки ответов в поиске.
- Разбиение долгих задач: `scheduler.yield()` (Chrome 129+, Firefox 142+, в Safari нет) с запасным `setTimeout`; почему микрозадача не отдаёт управление браузеру.
- Передача (transfer) `ArrayBuffer` между потоками, module workers, отличие Service Worker от Web Worker.
- Отличия цикла событий Node.js: фазы libuv, `process.nextTick`, `setImmediate`.
