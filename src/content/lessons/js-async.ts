import type { Source } from '../sources'
import type { Lesson, Module } from './types'

const mdn = (title: string, path: string): Source => ({ title: `MDN: ${title}`, url: `https://developer.mozilla.org/en-US/docs/${path}`, kind: 'official' })
const verified = { date: '2026-11', version: 'ECMAScript 2025, HTML and DOM Living Standards' }

export const jsAsyncLessons: Lesson[] = [
  {
    id: 'async-event-loop',
    track: 'js-async',
    emoji: '🔄',
    minutes: 12,
    title: { ru: 'Цикл событий', en: 'The event loop' },
    summary: {
      ru: 'Стек вызовов, задачи и микрозадачи, где в цикле отрисовка и requestAnimationFrame, чем отличается Node.js.',
      en: 'The call stack, tasks and microtasks, where rendering and requestAnimationFrame fit, how Node.js differs.',
    },
    quiz: {
      ru: [
        { q: 'Что выполнится раньше после синхронного кода: колбэк `setTimeout(fn, 0)` или колбэк `then` уже выполненного промиса?', options: ['Колбэк `setTimeout`', 'Колбэк `then`', 'В порядке написания', 'Порядок не определён'], correct: 1, why: 'После каждой задачи, в том числе после самого скрипта, разбирается вся очередь микрозадач, а колбэк `then` это микрозадача. Таймер это задача, она ждёт следующего витка.' },
        { q: 'Микрозадача в цикле ставит новую микрозадачу, и так бесконечно. Что будет со страницей?', options: ['Ничего: браузер сам чередует микрозадачи с отрисовкой кадров', 'Браузер прервёт цепочку через 50 мс как долгую задачу', 'Вкладка зависнет: ни таймеры, ни отрисовка не получат очередь', 'Бросится `RangeError`, как при переполнении стека вызовов'], correct: 2, why: 'Очередь микрозадач разбирается до пустой, а пустой она не станет. Бесконечная цепочка `setTimeout` такого не делает: между задачами браузер рисует.' },
        { q: 'Где правильнее менять стили для анимации на JavaScript?', options: ['В таймере `setTimeout(fn, 16)`', 'В колбэке `requestAnimationFrame`', 'В колбэке `queueMicrotask`', 'В колбэке `requestIdleCallback`'], correct: 1, why: '`requestAnimationFrame` вызывается прямо перед отрисовкой кадра и подстраивается под частоту экрана. Таймер на 16 мс расходится с кадрами и даёт рывки.' },
        { q: 'В каком порядке выведут `setTimeout(() => log("t"), 0)` и `requestAnimationFrame(() => log("f"))`?', options: ['Всегда `t`, потом `f`', 'Всегда `f`, потом `t`', 'Порядок не гарантирован', 'Выведется только `t`'], correct: 2, why: 'Кадр рисуется, когда пора обновить экран. Обычно таймер успевает раньше, но если кадр как раз должен рисоваться, первым будет `f`.' },
      ],
      en: [
        { q: 'After synchronous code, which runs first: a `setTimeout(fn, 0)` callback or a `then` callback of an already fulfilled promise?', options: ['The `setTimeout` callback', 'The `then` callback', 'In the order they were written', 'The order is undefined'], correct: 1, why: 'After every task, including the script itself, the whole microtask queue is drained, and a `then` callback is a microtask. A timer is a task and waits for the next turn.' },
        { q: 'A microtask keeps queueing a new microtask forever. What happens to the page?', options: ['Nothing: the browser interleaves microtasks with frames', 'The browser cuts the chain after 50 ms as a long task', 'The tab freezes: timers and rendering never get a turn', 'A `RangeError` is thrown, like on a stack overflow'], correct: 2, why: 'The microtask queue is drained until empty, and it never becomes empty. An endless `setTimeout` chain does not do this: the browser paints between tasks.' },
        { q: 'Where should a JavaScript animation change styles?', options: ['In a `setTimeout(fn, 16)` timer', 'In a `requestAnimationFrame` callback', 'In a `queueMicrotask` callback', 'In a `requestIdleCallback` callback'], correct: 1, why: '`requestAnimationFrame` runs right before the frame is painted and follows the screen refresh rate. A 16 ms timer drifts from the frames and stutters.' },
        { q: 'In what order do `setTimeout(() => log("t"), 0)` and `requestAnimationFrame(() => log("f"))` print?', options: ['Always `t`, then `f`', 'Always `f`, then `t`', 'The order is not guaranteed', 'Only `t` is printed'], correct: 2, why: 'A frame is painted when it is time to update the screen. Usually the timer wins, but if a frame is due right now, `f` comes first.' },
      ],
    },
    sources: [
      mdn('JavaScript execution model', 'Web/JavaScript/Reference/Execution_model'),
      mdn('Using microtasks', 'Web/API/HTML_DOM_API/Microtask_guide'),
      { title: 'HTML Standard: Event loops', url: 'https://html.spec.whatwg.org/multipage/webappapis.html#event-loops', kind: 'spec' },
      { title: 'Node.js: The event loop, timers and process.nextTick()', url: 'https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick', kind: 'official' },
    ],
    verified,
  },
  {
    id: 'async-promises',
    track: 'js-async',
    emoji: '🤝',
    minutes: 12,
    title: { ru: 'Промисы', en: 'Promises' },
    summary: {
      ru: 'Состояния, цепочка then, распространение ошибок, catch и finally, забытый return, Promise.withResolvers и Promise.try.',
      en: 'States, the then chain, error propagation, catch and finally, the forgotten return, Promise.withResolvers and Promise.try.',
    },
    quiz: {
      ru: [
        { q: 'Что выведет `new Promise((res) => { res(1); res(2) }).then(console.log)`?', options: ['`1`', '`2`', '`1` и `2`', 'Ничего'], correct: 0, why: 'Промис завершается один раз. Второй `res(2)` игнорируется.' },
        { q: 'Колбэк `then` вернул промис, который выполнится через секунду. Что будет с промисом, который вернул `then`?', options: ['Выполнится сразу этим промисом как значением', 'Дождётся его и выполнится его значением', 'Отклонится с `TypeError`', 'Останется в `pending` навсегда'], correct: 1, why: 'Если колбэк возвращает промис (или thenable), новый промис повторяет его состояние, когда тот завершится. Поэтому цепочки пишут плоскими.' },
        { q: 'Чем `p.then(ok, fail)` отличается от `p.then(ok).catch(fail)`?', options: ['Ничем: это две записи одного и того же кода', 'Во втором `fail` поймает и ошибку, брошенную в `ok`', 'В первом варианте `fail` вызовется дважды при ошибке', 'Второй вариант не поймает отклонение самого `p`'], correct: 1, why: 'Обработчики одного `then` не видят друг друга: ошибка из `ok` уйдёт дальше по цепочке. `catch` после `then` ловит и её.' },
        { q: 'Что делает `finally` с результатом промиса?', options: ['Заменяет результат значением, которое вернул колбэк `finally`', 'Пропускает значение или ошибку дальше без изменений, если сам не бросил', 'Превращает любую ошибку в успешный результат с `undefined`', 'Превращает успешный результат в `undefined`, ошибку не трогает'], correct: 1, why: '`finally` не получает значения и не меняет результат. Только брошенное внутри `finally` исключение заменит результат.' },
      ],
      en: [
        { q: 'What does `new Promise((res) => { res(1); res(2) }).then(console.log)` print?', options: ['`1`', '`2`', '`1` and `2`', 'Nothing'], correct: 0, why: 'A promise settles once. The second `res(2)` is ignored.' },
        { q: 'A `then` callback returns a promise that fulfills in one second. What happens to the promise returned by `then`?', options: ['Fulfills at once with that promise as its value', 'Waits for it and fulfills with its value', 'Rejects with `TypeError`', 'Stays `pending` forever'], correct: 1, why: 'If the callback returns a promise (or a thenable), the new promise follows its state once it settles. That is why chains are written flat.' },
        { q: 'How does `p.then(ok, fail)` differ from `p.then(ok).catch(fail)`?', options: ['No difference: they are two spellings of the same code', 'In the second, `fail` also catches an error thrown in `ok`', 'In the first, `fail` runs twice when `p` rejects', 'The second form does not catch a rejection of `p` itself'], correct: 1, why: 'The two handlers of one `then` do not see each other: an error from `ok` moves on down the chain. A `catch` after `then` catches it.' },
        { q: 'What does `finally` do to the promise result?', options: ['Replaces the result with whatever the `finally` callback returns', 'Passes the value or error through unchanged unless it throws itself', 'Turns any error into a success with the value `undefined`', 'Turns a success into `undefined` and leaves errors alone'], correct: 1, why: '`finally` gets no value and does not change the result. Only an exception thrown inside `finally` replaces the result.' },
      ],
    },
    sources: [
      mdn('Using promises', 'Web/JavaScript/Guide/Using_promises'),
      mdn('Promise', 'Web/JavaScript/Reference/Global_Objects/Promise'),
      mdn('Promise.withResolvers()', 'Web/JavaScript/Reference/Global_Objects/Promise/withResolvers'),
      mdn('Promise.try()', 'Web/JavaScript/Reference/Global_Objects/Promise/try'),
      mdn('unhandledrejection event', 'Web/API/Window/unhandledrejection_event'),
    ],
    verified,
  },
  {
    id: 'async-combinators',
    track: 'js-async',
    emoji: '🧩',
    minutes: 10,
    title: { ru: 'all, allSettled, race, any', en: 'all, allSettled, race, any' },
    summary: {
      ru: 'Параллельное ожидание, какой комбинатор когда выбрать, таймауты и почему ни один из них ничего не отменяет.',
      en: 'Waiting in parallel, which combinator to pick when, timeouts, and why none of them cancels anything.',
    },
    quiz: {
      ru: [
        { q: 'Нужно показать дашборд, даже если часть виджетов не загрузилась. Что взять?', options: ['`Promise.all`', '`Promise.allSettled`', '`Promise.race`', '`Promise.any`'], correct: 1, why: '`allSettled` ждёт все промисы и даёт статус каждого, ошибка одного не мешает остальным.' },
        { q: 'Все промисы в `Promise.any` отклонены. Что получим?', options: ['`undefined`, потому что успешных значений нет', 'Ошибку того промиса, что отклонился последним', '`AggregateError` с причинами в порядке входа', 'Массив объектов `{ status, reason }` по порядку'], correct: 2, why: '`any` отклоняется `AggregateError`, причины в поле `errors` идут в порядке входа, а не в порядке ошибок.' },
        { q: 'Один запрос в `Promise.all` упал. Что с остальными запросами?', options: ['Отменяются автоматически вместе с общим промисом', 'Продолжают выполняться, их результаты никто не ждёт', 'Перезапускаются, чтобы `Promise.all` попробовал снова', 'Ставятся на паузу до следующего вызова `then`'], correct: 1, why: 'Комбинаторы только перестают ждать. Для отмены передают в запросы `AbortSignal`.' },
        { q: 'Чем `Promise.race` отличается от `Promise.any`?', options: ['`race` ждёт все промисы, а `any` только первый из них', '`race` берёт первый завершившийся, `any` первый успешный', '`any` работает только с двумя промисами, `race` с любым числом', '`race` игнорирует ошибки, а `any` отклоняется на первой'], correct: 1, why: 'В `race` первая ошибка выигрывает так же, как первый успех. `any` игнорирует ошибки, пока есть шанс на успех.' },
      ],
      en: [
        { q: 'A dashboard must render even if some widgets fail to load. Which one?', options: ['`Promise.all`', '`Promise.allSettled`', '`Promise.race`', '`Promise.any`'], correct: 1, why: '`allSettled` waits for all promises and reports each status; one failure does not affect the rest.' },
        { q: 'Every promise passed to `Promise.any` rejects. What do you get?', options: ['`undefined`, since there is no fulfilled value', 'The reason of the promise that rejected last', 'An `AggregateError` with reasons in input order', 'An array of `{ status, reason }` objects in order'], correct: 2, why: '`any` rejects with `AggregateError`; its `errors` field lists reasons in input order, not failure order.' },
        { q: 'One request inside `Promise.all` fails. What happens to the others?', options: ['They are cancelled together with the combined promise', 'They keep running; nobody waits for their results', 'They restart so that `Promise.all` can try again', 'They pause until the next `then` call'], correct: 1, why: 'Combinators only stop waiting. Cancelling needs an `AbortSignal` passed to the requests.' },
        { q: 'How does `Promise.race` differ from `Promise.any`?', options: ['`race` waits for every promise, `any` only for the first', '`race` takes the first to settle, `any` the first success', '`any` only works with two promises, `race` with any number', '`race` ignores failures, while `any` rejects on the first one'], correct: 1, why: 'In `race` the first failure wins just like the first success. `any` ignores failures while success is still possible.' },
      ],
    },
    sources: [
      mdn('Promise.all()', 'Web/JavaScript/Reference/Global_Objects/Promise/all'),
      mdn('Promise.allSettled()', 'Web/JavaScript/Reference/Global_Objects/Promise/allSettled'),
      mdn('Promise.race()', 'Web/JavaScript/Reference/Global_Objects/Promise/race'),
      mdn('Promise.any()', 'Web/JavaScript/Reference/Global_Objects/Promise/any'),
    ],
    verified,
  },
  {
    id: 'async-await',
    track: 'js-async',
    emoji: '⏳',
    minutes: 12,
    title: { ru: 'async и await', en: 'async and await' },
    summary: {
      ru: 'Что делает await, обработка ошибок, fetch и response.ok, параллельность, циклы и forEach, top-level await.',
      en: 'What await does, error handling, fetch and response.ok, parallelism, loops and forEach, top-level await.',
    },
    quiz: {
      ru: [
        { q: 'Что вернёт async-функция `async function f() { return 1 }` при вызове `f()`?', options: ['Число `1`, потому что внутри нет `await`', 'Промис, выполненный значением `1`', '`undefined`, пока промис не выполнится', 'Функцию, которую нужно вызвать ещё раз'], correct: 1, why: 'async-функция всегда возвращает промис; `return` задаёт его значение.' },
        { q: '`fetch` получил ответ 404. Что произойдёт с промисом?', options: ['Отклонится с `Error`, где будет код 404', 'Выполнится, `response.ok` будет `false`', 'Останется в `pending`, пока сервер не ответит 200', 'Отклонится с `AbortError`, запрос будет прерван'], correct: 1, why: '`fetch` отклоняется только при сетевой ошибке или отмене. HTTP-ошибки нужно проверять через `response.ok` или `response.status`.' },
        { q: 'Почему `items.forEach(async (x) => await save(x))` с последующим `console.log("done")` печатает `done` раньше сохранения?', options: ['`forEach` не поддерживает async-функции в колбэке', '`forEach` не ждёт промисы, которые возвращают колбэки', '`console.log` всегда выполняется раньше промисов', '`save` выполняется синхронно, а лог асинхронно'], correct: 1, why: '`forEach` вызывает колбэки и сразу завершается. Нужен `for...of` с `await` или `Promise.all(items.map(...))`.' },
        { q: 'Зачем писать `return await promise` внутри `try`?', options: ['Так функция работает быстрее: промис не оборачивается ещё раз', 'Иначе ошибка промиса вылетит после выхода из `try` и `catch` её не поймает', 'Без `await` функция вернёт `undefined` вместо значения промиса', 'Этого требует спецификация: `return` промиса без `await` запрещён'], correct: 1, why: 'Без `await` функция вернёт промис, не дожидаясь его внутри `try`, и отклонение уйдёт вызывающему коду мимо `catch`.' },
      ],
      en: [
        { q: 'What does calling `f()` return for `async function f() { return 1 }`?', options: ['The number `1`, since there is no `await`', 'A promise fulfilled with `1`', '`undefined` until the promise settles', 'A function you have to call once more'], correct: 1, why: 'An async function always returns a promise; `return` sets its value.' },
        { q: '`fetch` got a 404 response. What happens to the promise?', options: ['It rejects with an `Error` carrying code 404', 'It fulfills, and `response.ok` is `false`', 'It stays `pending` until the server answers 200', 'It rejects with `AbortError` and the request stops'], correct: 1, why: '`fetch` rejects only on a network error or an abort. Check HTTP errors with `response.ok` or `response.status`.' },
        { q: 'Why does `items.forEach(async (x) => await save(x))` followed by `console.log("done")` print `done` before saving finishes?', options: ['`forEach` does not support async functions as callbacks', '`forEach` does not wait for the promises its callbacks return', '`console.log` always runs before any promise settles', '`save` runs synchronously and the log asynchronously'], correct: 1, why: '`forEach` calls the callbacks and returns at once. Use `for...of` with `await` or `Promise.all(items.map(...))`.' },
        { q: 'Why write `return await promise` inside `try`?', options: ['It makes the function faster, since the promise is not wrapped again', 'Otherwise the rejection surfaces after leaving `try` and `catch` misses it', 'Without `await` the function returns `undefined` instead of the value', 'The spec requires it: returning a promise without `await` is not allowed'], correct: 1, why: 'Without `await` the function returns the promise without waiting for it inside `try`, so the rejection reaches the caller past the `catch`.' },
      ],
    },
    sources: [
      mdn('async function', 'Web/JavaScript/Reference/Statements/async_function'),
      mdn('await', 'Web/JavaScript/Reference/Operators/await'),
      mdn('Using the Fetch API', 'Web/API/Fetch_API/Using_Fetch'),
      mdn('for await...of', 'Web/JavaScript/Reference/Statements/for-await...of'),
    ],
    verified,
  },
  {
    id: 'async-cancellation',
    track: 'js-async',
    emoji: '🛑',
    minutes: 12,
    title: { ru: 'Отмена: AbortController', en: 'Cancellation: AbortController' },
    summary: {
      ru: 'AbortController и AbortSignal, отмена fetch и обработчиков, таймауты, свои отменяемые функции, гонки ответов.',
      en: 'AbortController and AbortSignal, aborting fetch and listeners, timeouts, your own cancellable functions, response races.',
    },
    quiz: {
      ru: [
        { q: 'Вызвали `controller.abort("bye")`. С чем отклонится `fetch(url, { signal: controller.signal })`?', options: ['С `DOMException` `AbortError`', 'Со строкой `"bye"`', 'С `TypeError`', 'Не отклонится'], correct: 1, why: 'Операции отклоняются причиной сигнала. `AbortError` будет только если `abort()` вызвали без причины.' },
        { q: 'Какой способ таймаута для `fetch` по-настоящему прерывает запрос?', options: ['`Promise.race` с промисом-таймером на `ms`', '`AbortSignal.timeout(ms)` в опции `signal`', '`setTimeout` с `throw` вокруг `await fetch`', '`Promise.any` с промисом-таймером на `ms`'], correct: 1, why: '`race` и `any` только перестают ждать, запрос продолжается. Сигнал прерывает сам запрос, причиной будет `TimeoutError`.' },
        { q: 'Как снять сразу несколько обработчиков событий при размонтировании компонента?', options: ['Только вызвать `removeEventListener` для каждого', 'Передать всем один `signal` и вызвать `abort()`', 'Присвоить элементу `null`, обработчики уйдут сами', 'Вызвать `event.stopPropagation()` в каждом обработчике'], correct: 1, why: '`addEventListener(type, fn, { signal })` снимает обработчик при отмене сигнала; один контроллер снимает их все.' },
        { q: 'Ответ на старый поисковый запрос пришёл позже нового и затёр результаты. Что это и как чинить?', options: ['Утечка памяти; увеличить кэш и очищать его при каждом вводе', 'Гонка ответов; отменять прошлый запрос или отбрасывать старые ответы', 'Ошибка CORS; добавить заголовок `Access-Control-Allow-Origin`', 'Ошибка сервера; повторять запрос, пока ответ не станет свежим'], correct: 1, why: 'Это race condition. Отмена через `AbortController` или проверка номера последнего запроса решают её.' },
      ],
      en: [
        { q: 'You call `controller.abort("bye")`. What does `fetch(url, { signal: controller.signal })` reject with?', options: ['A `DOMException` `AbortError`', 'The string `"bye"`', 'A `TypeError`', 'It does not reject'], correct: 1, why: 'Operations reject with the signal\'s reason. `AbortError` appears only when `abort()` is called without a reason.' },
        { q: 'Which `fetch` timeout actually aborts the request?', options: ['`Promise.race` with a timer promise of `ms`', '`AbortSignal.timeout(ms)` in the `signal` option', '`setTimeout` with a `throw` around `await fetch`', '`Promise.any` with a timer promise of `ms`'], correct: 1, why: '`race` and `any` only stop waiting; the request goes on. The signal aborts the request itself, with a `TimeoutError` reason.' },
        { q: 'How do you remove several event listeners at once when a component unmounts?', options: ['Only by calling `removeEventListener` for each', 'Pass them all one `signal` and call `abort()`', 'Set the element variable to `null`, they go away', 'Call `event.stopPropagation()` in every handler'], correct: 1, why: '`addEventListener(type, fn, { signal })` removes the listener when the signal aborts; one controller removes them all.' },
        { q: 'The response to an old search request arrived after the new one and overwrote the results. What is it and how do you fix it?', options: ['A memory leak; grow the cache and clear it on every keystroke', 'A response race; abort the previous request or drop stale responses', 'A CORS error; add the `Access-Control-Allow-Origin` header', 'A server error; retry until the response is fresh enough'], correct: 1, why: 'This is a race condition. Aborting with `AbortController` or checking the number of the latest request fixes it.' },
      ],
    },
    sources: [
      mdn('AbortController', 'Web/API/AbortController'),
      mdn('AbortSignal', 'Web/API/AbortSignal'),
      mdn('AbortSignal.timeout()', 'Web/API/AbortSignal/timeout_static'),
      { title: 'DOM Standard: Aborting ongoing activities', url: 'https://dom.spec.whatwg.org/#aborting-ongoing-activities', kind: 'spec' },
    ],
    verified,
  },
  {
    id: 'async-timers-workers',
    track: 'js-async',
    emoji: '⏱️',
    minutes: 12,
    title: { ru: 'Таймеры, кадры и воркеры', en: 'Timers, frames and workers' },
    summary: {
      ru: 'Как на самом деле работают таймеры, requestAnimationFrame и requestIdleCallback, разбиение долгих задач, Web Workers и Service Worker.',
      en: 'How timers really work, requestAnimationFrame and requestIdleCallback, splitting long tasks, Web Workers and Service Workers.',
    },
    quiz: {
      ru: [
        { q: 'Почему опрос сервера лучше писать цепочкой `setTimeout`, а не `setInterval`?', options: ['`setInterval` устарел и будет удалён из стандарта HTML', 'Следующий запуск ставится после окончания текущего', '`setTimeout` точнее отсчитывает время, чем `setInterval`', '`setInterval` не умеет ждать промисы внутри колбэка'], correct: 1, why: '`setInterval` ставит вызовы по расписанию, не дожидаясь окончания предыдущего. Медленный запрос приведёт к наложению вызовов.' },
        { q: 'Как отдать управление браузеру между частями долгой работы, чтобы он успел обработать ввод?', options: ['`await Promise.resolve()` после каждой части', '`await scheduler.yield()` или `setTimeout`', '`queueMicrotask` с продолжением работы', 'Ничего: браузер сам прервёт долгую задачу'], correct: 1, why: 'Микрозадачи выполняются в той же задаче, браузер между ними ничего не делает. `scheduler.yield()` и `setTimeout` завершают задачу и дают браузеру ход.' },
        { q: 'Чего нет внутри Web Worker?', options: ['Функции `fetch`', 'Доступа к DOM', 'Промисов и `await`', 'Таймеров вроде `setTimeout`'], correct: 1, why: 'Воркер работает в отдельном потоке без `window` и `document`. Сеть, таймеры и промисы в нём есть.' },
        { q: 'Что станет с `ArrayBuffer` в отправителе после `worker.postMessage(buf, [buf])`?', options: ['Ничего: данные скопированы, буфер остался', 'Он станет пустым: владение передано воркеру', 'Он станет только для чтения, как после `freeze`', 'Бросится ошибка: передавать буферы нельзя'], correct: 1, why: 'Второй аргумент передаёт буфер без копирования. У отправителя остаётся буфер нулевой длины.' },
      ],
      en: [
        { q: 'Why is server polling better as a `setTimeout` chain than `setInterval`?', options: ['`setInterval` is deprecated and will leave the HTML spec', 'The next run is scheduled after the current one ends', '`setTimeout` keeps time more precisely than `setInterval`', '`setInterval` cannot wait for promises in its callback'], correct: 1, why: '`setInterval` schedules calls on a fixed rhythm without waiting for the previous one. A slow request makes calls overlap.' },
        { q: 'How do you give control back to the browser between chunks of long work so it can handle input?', options: ['`await Promise.resolve()` after each chunk', '`await scheduler.yield()` or `setTimeout`', '`queueMicrotask` with the rest of the work', 'Nothing: the browser interrupts long tasks itself'], correct: 1, why: 'Microtasks run inside the same task; the browser does nothing between them. `scheduler.yield()` and `setTimeout` end the task and give the browser a turn.' },
        { q: 'What is missing inside a Web Worker?', options: ['The `fetch` function', 'Access to the DOM', 'Promises and `await`', 'Timers like `setTimeout`'], correct: 1, why: 'A worker runs on a separate thread without `window` or `document`. Network, timers and promises are there.' },
        { q: 'What happens to the sender\'s `ArrayBuffer` after `worker.postMessage(buf, [buf])`?', options: ['Nothing: the data is copied, the buffer stays', 'It becomes empty: ownership moves to the worker', 'It becomes read-only, as after `freeze`', 'An error is thrown: buffers cannot be sent'], correct: 1, why: 'The second argument transfers the buffer without copying. The sender is left with a zero-length buffer.' },
      ],
    },
    sources: [
      mdn('setTimeout(): reasons for delays', 'Web/API/Window/setTimeout#reasons_for_delays_longer_than_specified'),
      mdn('Window.requestAnimationFrame()', 'Web/API/Window/requestAnimationFrame'),
      mdn('Window.requestIdleCallback()', 'Web/API/Window/requestIdleCallback'),
      mdn('Scheduler.yield()', 'Web/API/Scheduler/yield'),
      mdn('Using Web Workers', 'Web/API/Web_Workers_API/Using_web_workers'),
      { title: 'web.dev: Optimize long tasks', url: 'https://web.dev/articles/optimize-long-tasks', kind: 'official' },
    ],
    verified,
  },
  {
    id: 'async-patterns',
    track: 'js-async',
    emoji: '🧰',
    minutes: 14,
    title: { ru: 'Асинхронные паттерны', en: 'Async patterns' },
    summary: {
      ru: 'Повтор с экспоненциальной задержкой, таймаут, ограничение параллельности, последовательная очередь, «побеждает последний», пачки запросов и Promise.withResolvers.',
      en: 'Retry with exponential backoff, timeouts, a concurrency limit, a serial queue, "latest wins", request batching and Promise.withResolvers.',
    },
    quiz: {
      ru: [
        { q: 'Зачем к задержке повтора добавляют случайный разброс?', options: ['Чтобы повтор был быстрее', 'Чтобы клиенты не повторили разом', 'Так требует спецификация', 'Чтобы обойти кэш браузера'], correct: 1, why: 'Без разброса тысячи клиентов после сбоя повторят запрос в один и тот же момент и снова перегрузят сервер.' },
        { q: 'Какой запрос нельзя повторять без ключа идемпотентности?', options: ['`GET /users`', '`HEAD /health`', '`POST /payments`', '`GET /config`'], correct: 2, why: 'Повтор неидемпотентной операции может выполнить её дважды, например дважды списать деньги.' },
        { q: 'Что делает `Promise.race([task, timeout])` с самой задачей?', options: ['Отменяет её по таймауту', 'Ничего: задача продолжается', 'Ставит её на паузу', 'Перезапускает её снова'], correct: 1, why: 'Промис нельзя отменить снаружи; `race` только перестаёт ждать. Для `fetch` нужен `AbortSignal`.' },
        { q: 'Как пул работников сохраняет порядок результатов?', options: ['Сортирует их в конце', 'Пишет по индексу задачи', 'Ждёт задачи по одной', 'Никак, порядок случайный'], correct: 1, why: 'Каждый работник берёт индекс синхронно и кладёт результат в `results[index]`.' },
      ],
      en: [
        { q: 'Why add random jitter to the retry delay?', options: ['To make each retry faster', 'So clients do not retry at once', 'The HTTP spec requires it', 'To bypass the browser cache'], correct: 1, why: 'Without jitter, thousands of clients retry at the same moment after an outage and overload the server again.' },
        { q: 'Which request must not be retried without an idempotency key?', options: ['`GET /users`', '`HEAD /health`', '`POST /payments`', '`GET /config`'], correct: 2, why: 'Retrying a non-idempotent operation can run it twice, for example charge money twice.' },
        { q: 'What does `Promise.race([task, timeout])` do to the task itself?', options: ['Cancels it on timeout', 'Nothing: the task goes on', 'Pauses it for a while', 'Restarts it again'], correct: 1, why: 'A promise cannot be cancelled from outside; `race` only stops waiting. `fetch` needs an `AbortSignal`.' },
        { q: 'How does a worker pool keep results in order?', options: ['It sorts them at the end', 'It writes by task index', 'It awaits tasks one by one', 'It does not: order is random'], correct: 1, why: 'Each worker takes an index synchronously and stores the result in `results[index]`.' },
      ],
    },
    sources: [
      mdn('AbortSignal.timeout()', 'Web/API/AbortSignal/timeout_static'),
      mdn('Promise.withResolvers()', 'Web/JavaScript/Reference/Global_Objects/Promise/withResolvers'),
      mdn('queueMicrotask()', 'Web/API/Window/queueMicrotask'),
      mdn('Idempotent (glossary)', 'Glossary/Idempotent'),
    ],
    verified,
  },
]

export const jsAsyncModule: Module = {
  track: 'js-async',
  lessons: jsAsyncLessons.map((l) => l.id),
  exam: {
    pass: 0.75,
    questions: {
      ru: [
        { q: 'Что выведет: `setTimeout(() => log(1)); Promise.resolve().then(() => log(2)); log(3)`?', options: ['`1 2 3`', '`3 2 1`', '`3 1 2`', '`2 3 1`'], correct: 1, why: 'Сначала синхронный `3`, затем микрозадача `2`, затем задача таймера `1`.' },
        { q: 'Что выведет: `async function f() { log("a"); await 0; log("b") } f(); log("c")`?', options: ['`a b c`', '`a c b`', '`c a b`', '`c b a`'], correct: 1, why: 'Тело async-функции синхронно до первого `await`; продолжение `b` это микрозадача после синхронного `c`.' },
        { q: 'В цепочке `p.then(a).then(b).catch(c).then(d)` колбэк `a` бросил ошибку. Что вызовется?', options: ['`b`, `c`, `d`', '`c` и `d`', 'Только `c`', 'Только `d`'], correct: 1, why: 'Ошибка пропускает `b` до `catch`. `c` её обработал и ничего не бросил, поэтому цепочка продолжается успешно и вызывается `d`.' },
        { q: 'Какой комбинатор отклоняется только если отклонены все промисы?', options: ['`Promise.all`', '`Promise.allSettled`', '`Promise.race`', '`Promise.any`'], correct: 3, why: '`any` ждёт первого успеха; если его нет, отклоняется `AggregateError`.' },
        { q: 'Как запустить два независимых запроса так, чтобы общее время равнялось самому долгому?', options: ['Два `await` подряд: `await a(); await b()`', '`await Promise.all([a(), b()])`', '`for...of` по запросам с `await`', '`await a(); b()` без второго ожидания'], correct: 1, why: 'Промисы создаются сразу и выполняются параллельно, `Promise.all` ждёт оба.' },
        { q: '`fetch` с `signal: AbortSignal.timeout(100)` не успел за 100 мс. С чем отклонится промис?', options: ['`AbortError`', '`TimeoutError`', '`TypeError`', '`RangeError`'], correct: 1, why: 'Сигнал из `AbortSignal.timeout` отменяется с причиной `DOMException` по имени `TimeoutError`.' },
        { q: 'Что из этого ставит задачу, а не микрозадачу?', options: ['`queueMicrotask`', '`await`', '`setTimeout`', '`Promise.then`'], correct: 2, why: 'Таймеры, события и `postMessage` это задачи. Реакции промисов, `await` и `queueMicrotask` это микрозадачи.' },
        { q: 'Где выполнять тяжёлый разбор файла на 50 МБ, чтобы интерфейс не зависал?', options: ['В `requestAnimationFrame`', 'В микрозадачах', 'В Web Worker', 'В Service Worker'], correct: 2, why: 'Web Worker это отдельный поток для вычислений. Service Worker нужен для сети и кэша, а микрозадачи и `requestAnimationFrame` идут в главном потоке.' },
        { q: 'Какие ошибки стоит повторять с экспоненциальной задержкой?', options: ['Любые ошибки подряд', 'Временные: 503, сеть', 'Ответы 404 и 400', 'Только синтаксические'], correct: 1, why: 'Повторяют временные сбои; ошибки клиента (`4xx`) от повтора не исчезнут.' },
        { q: 'Как ограничить число одновременных запросов при загрузке 500 файлов?', options: ['`Promise.all` всех сразу', 'Пул из N работников', '`Promise.race` по одному', '`for await` без пула'], correct: 1, why: 'Пул берёт задачи из общей очереди и держит в полёте не больше N.' },
      ],
      en: [
        { q: 'What does `setTimeout(() => log(1)); Promise.resolve().then(() => log(2)); log(3)` print?', options: ['`1 2 3`', '`3 2 1`', '`3 1 2`', '`2 3 1`'], correct: 1, why: 'First the synchronous `3`, then the microtask `2`, then the timer task `1`.' },
        { q: 'What does `async function f() { log("a"); await 0; log("b") } f(); log("c")` print?', options: ['`a b c`', '`a c b`', '`c a b`', '`c b a`'], correct: 1, why: 'An async function body is synchronous up to the first `await`; the continuation `b` is a microtask after the synchronous `c`.' },
        { q: 'In `p.then(a).then(b).catch(c).then(d)`, callback `a` throws. What gets called?', options: ['`b`, `c`, `d`', '`c` and `d`', 'Only `c`', 'Only `d`'], correct: 1, why: 'The error skips `b` up to `catch`. `c` handled it without throwing, so the chain continues as a success and `d` runs.' },
        { q: 'Which combinator rejects only when every promise rejects?', options: ['`Promise.all`', '`Promise.allSettled`', '`Promise.race`', '`Promise.any`'], correct: 3, why: '`any` waits for the first success; if there is none, it rejects with `AggregateError`.' },
        { q: 'How do you run two independent requests so the total time equals the slowest one?', options: ['Two `await`s in a row: `await a(); await b()`', '`await Promise.all([a(), b()])`', 'A `for...of` over requests with `await`', '`await a(); b()` without the second wait'], correct: 1, why: 'Both promises are created at once and run in parallel; `Promise.all` waits for both.' },
        { q: 'A `fetch` with `signal: AbortSignal.timeout(100)` took longer than 100 ms. What does it reject with?', options: ['`AbortError`', '`TimeoutError`', '`TypeError`', '`RangeError`'], correct: 1, why: 'A signal from `AbortSignal.timeout` aborts with a `DOMException` named `TimeoutError`.' },
        { q: 'Which of these queues a task, not a microtask?', options: ['`queueMicrotask`', '`await`', '`setTimeout`', '`Promise.then`'], correct: 2, why: 'Timers, events and `postMessage` are tasks. Promise reactions, `await` and `queueMicrotask` are microtasks.' },
        { q: 'Where should a heavy parse of a 50 MB file run so the UI does not freeze?', options: ['In `requestAnimationFrame`', 'In microtasks', 'In a Web Worker', 'In a Service Worker'], correct: 2, why: 'A Web Worker is a separate thread for computation. A Service Worker is for network and caching; microtasks and `requestAnimationFrame` run on the main thread.' },
        { q: 'Which errors are worth retrying with exponential backoff?', options: ['Any errors at all', 'Temporary: 503, network', 'Responses 404 and 400', 'Only syntax errors'], correct: 1, why: 'Retry temporary failures; client errors (`4xx`) will not go away on retry.' },
        { q: 'How do you limit concurrent requests when uploading 500 files?', options: ['`Promise.all` on all at once', 'A pool of N workers', '`Promise.race` one by one', '`for await` with no pool'], correct: 1, why: 'A pool takes tasks from a shared queue and keeps at most N in flight.' },
      ],
    },
  },
}
