import type { Source } from '../sources'
import type { PredictTask, TraceEvent } from './types'

const mdn = (title: string, path: string): Source => ({ title: `MDN: ${title}`, url: `https://developer.mozilla.org/en-US/docs/${path}`, kind: 'official' })
const verified = { date: '2026-11', version: 'ECMAScript 2025, HTML Living Standard' }
const eventLoop = mdn('JavaScript execution model', 'Web/JavaScript/Reference/Execution_model')
const microtaskGuide = mdn('Using microtasks', 'Web/API/HTML_DOM_API/Microtask_guide')
const loopSpec: Source = { title: 'HTML Standard: Event loops', url: 'https://html.spec.whatwg.org/multipage/webappapis.html#event-loops', kind: 'spec' }

/** Short constructors keep traces readable. */
const call = (label: string, line: number, ru?: string, en?: string): TraceEvent => ({ op: 'call', label, line, ...note(ru, en) })
const ret = (ru?: string, en?: string): TraceEvent => ({ op: 'return', ...note(ru, en) })
const micro = (label: string, line: number, ru?: string, en?: string): TraceEvent => ({ op: 'micro', label, line, ...note(ru, en) })
const timer = (label: string, line: number, ms: number, ru?: string, en?: string): TraceEvent => ({ op: 'timer', label, line, ms, ...note(ru, en) })
const expire = (label: string, ru?: string, en?: string): TraceEvent => ({ op: 'expire', label, ...note(ru, en) })
const runMicro = (ru?: string, en?: string): TraceEvent => ({ op: 'run-micro', ...note(ru, en) })
const runTask = (ru?: string, en?: string): TraceEvent => ({ op: 'run-task', ...note(ru, en) })
const log = (text: string, line: number, ru?: string, en?: string): TraceEvent => ({ op: 'log', text, line, ...note(ru, en) })
function note(ru?: string, en?: string) {
  return ru && en ? { note: { ru, en } } : {}
}

export const asyncPredict: PredictTask[] = [
  {
    id: 'el-basics',
    track: 'js-async',
    difficulty: 'easy',
    title: { ru: 'Синхронный код, микрозадачи, таймер', en: 'Sync code, microtasks, a timer' },
    code: `console.log('1')
setTimeout(() => console.log('2'), 0)
Promise.resolve().then(() => console.log('3'))
queueMicrotask(() => console.log('4'))
console.log('5')
`,
    output: ['1', '5', '3', '4', '2'],
    distractors: ['undefined'],
    explanation: {
      ru: `Сначала до конца выполняется синхронный код: \`1\` и \`5\`. Колбэки не вызываются сразу, а встают в очереди.

- \`then\` и \`queueMicrotask\` попадают в **очередь микрозадач**.
- \`setTimeout\` даже с нулём попадает в **очередь задач** (макрозадач), и только когда истечёт таймер.

Когда стек вызовов опустел, движок выполняет **все** микрозадачи по порядку (\`3\`, \`4\`) и только потом берёт следующую задачу (\`2\`).`,
      en: `Synchronous code runs to the end first: \`1\` and \`5\`. Callbacks are not called at once, they are queued.

- \`then\` and \`queueMicrotask\` go to the **microtask queue**.
- \`setTimeout\`, even with zero, goes to the **task (macrotask) queue**, and only once the timer expires.

When the call stack is empty, the engine runs **all** microtasks in order (\`3\`, \`4\`) and only then takes the next task (\`2\`).`,
    },
    trace: [
      call('script', 1, 'Модуль начинает выполняться: в стеке вызовов один кадр, сам скрипт.', 'The module starts: the call stack holds one frame, the script itself.'),
      log('1', 1),
      timer('setTimeout cb', 2, 0, 'Таймер зарегистрирован в браузере (Web API). Колбэк пока никуда не встал.', 'The timer is registered with the browser (Web API). The callback is not queued yet.'),
      micro('then cb', 3, 'Промис уже выполнен, поэтому колбэк then сразу встаёт в очередь микрозадач.', 'The promise is already fulfilled, so the then callback goes straight to the microtask queue.'),
      micro('queueMicrotask cb', 4),
      log('5', 5),
      ret('Синхронный код закончился, стек пуст.', 'Synchronous code is done, the stack is empty.'),
      expire('setTimeout cb', 'Таймер на 0 мс истёк: колбэк встал в очередь задач, но ему придётся подождать.', 'The 0 ms timer expired: the callback is in the task queue, but it has to wait.'),
      runMicro('Стек пуст, поэтому движок разбирает очередь микрозадач, целиком.', 'The stack is empty, so the engine drains the microtask queue, all of it.'),
      log('3', 3),
      ret(),
      runMicro(),
      log('4', 4),
      ret(),
      runTask('Микрозадач больше нет: event loop берёт одну задачу из очереди задач.', 'No microtasks left: the event loop takes one task from the task queue.'),
      log('2', 2),
      ret(),
    ],
    sources: [eventLoop, microtaskGuide, loopSpec],
    verified,
  },
  {
    id: 'el-promise-executor',
    track: 'js-async',
    difficulty: 'easy',
    title: { ru: 'Исполнитель промиса', en: 'The promise executor' },
    code: `console.log('1')
const p = new Promise((resolve) => {
  console.log('2')
  resolve('3')
  console.log('4')
})
p.then((value) => console.log(value))
console.log('5')
`,
    output: ['1', '2', '4', '5', '3'],
    distractors: ['undefined', 'resolve'],
    explanation: {
      ru: `Функция-исполнитель, переданная в \`new Promise\`, вызывается **синхронно**, прямо внутри конструктора. Поэтому \`2\` печатается сразу после \`1\`.

\`resolve('3')\` не прерывает исполнитель, это не \`return\`: строка \`4\` тоже выполнится. Повторные вызовы \`resolve\` или \`reject\` после первого игнорируются.

Колбэк \`then\` всегда асинхронный, даже если промис уже выполнен: он встаёт в очередь микрозадач и печатает \`3\` после всего синхронного кода.`,
      en: `The executor function passed to \`new Promise\` runs **synchronously**, right inside the constructor. That is why \`2\` is printed right after \`1\`.

\`resolve('3')\` does not stop the executor, it is not a \`return\`: the \`4\` line runs too. Calls to \`resolve\` or \`reject\` after the first one are ignored.

A \`then\` callback is always asynchronous, even when the promise is already fulfilled: it goes to the microtask queue and prints \`3\` after all synchronous code.`,
    },
    trace: [
      call('script', 1),
      log('1', 1),
      call('executor', 2, 'Конструктор Promise сразу вызывает исполнитель, синхронно.', 'The Promise constructor calls the executor at once, synchronously.'),
      log('2', 3),
      log('4', 5, 'resolve() уже выполнил промис, но функция продолжает работать до конца.', 'resolve() has fulfilled the promise, but the function keeps running to its end.'),
      ret(),
      micro('then cb', 7, 'Промис выполнен, поэтому реакция then сразу встаёт в очередь микрозадач.', 'The promise is fulfilled, so the then reaction is queued as a microtask at once.'),
      log('5', 8),
      ret(),
      runMicro(),
      log('3', 7),
      ret(),
    ],
    sources: [mdn('Promise() constructor', 'Web/JavaScript/Reference/Global_Objects/Promise/Promise'), mdn('Promise.prototype.then()', 'Web/JavaScript/Reference/Global_Objects/Promise/then'), eventLoop],
    verified,
  },
  {
    id: 'el-async-await',
    track: 'js-async',
    difficulty: 'easy',
    title: { ru: 'Что происходит на await', en: 'What happens at await' },
    code: `async function load() {
  console.log('A')
  await null
  console.log('B')
}
console.log('start')
load()
console.log('end')
`,
    output: ['start', 'A', 'end', 'B'],
    distractors: ['undefined', 'null'],
    explanation: {
      ru: `Асинхронная функция выполняется синхронно **до первого \`await\`**. Поэтому \`A\` печатается сразу после \`start\`.

На \`await\` функция приостанавливается и возвращает вызывающему коду промис. Продолжение (всё после \`await\`) встаёт в очередь микрозадач, даже если ждём не промис, а \`null\`.

Синхронный код идёт дальше и печатает \`end\`. Когда стек опустел, продолжение выполняется и печатает \`B\`.`,
      en: `An async function runs synchronously **up to its first \`await\`**. That is why \`A\` comes right after \`start\`.

At \`await\` the function pauses and returns a promise to the caller. The continuation (everything after \`await\`) is queued as a microtask, even when the awaited value is \`null\`, not a promise.

Synchronous code continues and prints \`end\`. Once the stack is empty, the continuation runs and prints \`B\`.`,
    },
    trace: [
      call('script', 6),
      log('start', 6),
      call('load()', 7, 'Вызов async-функции: её тело выполняется синхронно до первого await.', 'Calling an async function: its body runs synchronously up to the first await.'),
      log('A', 2),
      micro('load: after await', 3, 'await приостановил функцию; продолжение встало в очередь микрозадач.', 'await paused the function; the continuation is queued as a microtask.'),
      ret('load() вернула промис, управление снова у скрипта.', 'load() returned a promise, control is back in the script.'),
      log('end', 8),
      ret(),
      runMicro('Стек пуст: функция load продолжается с места остановки.', 'The stack is empty: load resumes where it paused.'),
      log('B', 4),
      ret(),
    ],
    sources: [mdn('async function', 'Web/JavaScript/Reference/Statements/async_function'), mdn('await', 'Web/JavaScript/Reference/Operators/await'), eventLoop],
    verified,
  },
  {
    id: 'el-two-chains',
    track: 'js-async',
    difficulty: 'medium',
    title: { ru: 'Две цепочки then', en: 'Two then chains' },
    code: `Promise.resolve()
  .then(() => console.log('a1'))
  .then(() => console.log('a2'))
Promise.resolve()
  .then(() => console.log('b1'))
  .then(() => console.log('b2'))
`,
    output: ['a1', 'b1', 'a2', 'b2'],
    distractors: ['a3', 'b3'],
    explanation: {
      ru: `Каждый \`then\` возвращает **новый** промис. Второй \`then\` в цепочке ждёт этот новый промис, а он выполнится только когда отработает первый колбэк.

Поэтому в начале в очереди микрозадач только \`a1\` и \`b1\`. Выполнился \`a1\`: его промис выполнен, и \`a2\` встаёт в **конец** очереди, за \`b1\`. Цепочки чередуются: \`a1\`, \`b1\`, \`a2\`, \`b2\`.

Практический вывод: независимые цепочки промисов не выполняются одна за другой целиком, они перемежаются по шагам.`,
      en: `Every \`then\` returns a **new** promise. The second \`then\` in a chain waits for that new promise, which is fulfilled only after the first callback runs.

So at first only \`a1\` and \`b1\` are in the microtask queue. When \`a1\` runs, its promise is fulfilled and \`a2\` goes to the **end** of the queue, behind \`b1\`. The chains interleave: \`a1\`, \`b1\`, \`a2\`, \`b2\`.

The practical takeaway: independent promise chains do not run one after another as a whole, they interleave step by step.`,
    },
    trace: [
      call('script', 1),
      micro('a1', 2, 'Первый then цепочки A: промис уже выполнен, колбэк в очереди.', 'The first then of chain A: the promise is already fulfilled, the callback is queued.'),
      micro('b1', 5, 'Второй then каждой цепочки ждёт ещё не выполненный промис и в очередь не попадает.', 'The second then of each chain waits for a promise that is not fulfilled yet, so it is not queued.'),
      ret(),
      runMicro(),
      log('a1', 2),
      micro('a2', 3, 'Колбэк a1 закончился, его промис выполнен: a2 встаёт в конец очереди, за b1.', 'The a1 callback finished and fulfilled its promise: a2 goes to the end of the queue, behind b1.'),
      ret(),
      runMicro(),
      log('b1', 5),
      micro('b2', 6),
      ret(),
      runMicro(),
      log('a2', 3),
      ret(),
      runMicro(),
      log('b2', 6),
      ret(),
    ],
    sources: [mdn('Promise.prototype.then()', 'Web/JavaScript/Reference/Global_Objects/Promise/then'), mdn('Using promises', 'Web/JavaScript/Guide/Using_promises'), microtaskGuide],
    verified,
  },
  {
    id: 'el-nested-micro',
    track: 'js-async',
    difficulty: 'medium',
    title: { ru: 'Микрозадача из микрозадачи', en: 'A microtask from a microtask' },
    code: `setTimeout(() => console.log('timeout'), 0)
Promise.resolve()
  .then(() => {
    console.log('then 1')
    queueMicrotask(() => console.log('nested'))
  })
  .then(() => console.log('then 2'))
console.log('sync')
`,
    output: ['sync', 'then 1', 'nested', 'then 2', 'timeout'],
    distractors: ['then 3'],
    explanation: {
      ru: `Очередь микрозадач разбирается **до пустой**, включая микрозадачи, добавленные по ходу. Таймер ждёт, пока она не опустеет.

Внутри \`then 1\` сначала ставится \`nested\`. Потом колбэк заканчивается, его промис выполняется, и в очередь встаёт \`then 2\`, уже **после** \`nested\`.

Отсюда риск: если микрозадачи бесконечно добавляют новые микрозадачи, задачи и отрисовка никогда не получат очередь, и страница зависнет.`,
      en: `The microtask queue is drained **until it is empty**, including microtasks added along the way. The timer waits until then.

Inside \`then 1\`, \`nested\` is queued first. Then the callback ends, its promise is fulfilled, and \`then 2\` is queued **after** \`nested\`.

That is also the risk: if microtasks keep queueing new microtasks forever, tasks and rendering never get a turn and the page freezes.`,
    },
    trace: [
      call('script', 1),
      timer('setTimeout cb', 1, 0),
      micro('then 1', 3),
      log('sync', 8),
      ret(),
      expire('setTimeout cb', 'Таймер истёк, задача ждёт в очереди задач.', 'The timer expired; the task waits in the task queue.'),
      runMicro(),
      log('then 1', 4),
      micro('nested', 5, 'Новая микрозадача добавлена прямо во время разбора очереди.', 'A new microtask is added while the queue is being drained.'),
      micro('then 2', 7, 'Колбэк then 1 завершается, его промис выполнен: then 2 встаёт за nested.', 'The then 1 callback completes and fulfils its promise: then 2 is queued behind nested.'),
      ret(),
      runMicro(),
      log('nested', 5),
      ret(),
      runMicro(),
      log('then 2', 7),
      ret(),
      runTask('Очередь микрозадач наконец пуста, очередь дошла до таймера.', 'The microtask queue is finally empty; the timer gets its turn.'),
      log('timeout', 1),
      ret(),
    ],
    sources: [microtaskGuide, mdn('queueMicrotask()', 'Web/API/Window/queueMicrotask'), loopSpec],
    verified,
  },
  {
    id: 'el-timers',
    track: 'js-async',
    difficulty: 'medium',
    title: { ru: 'Несколько таймеров и промис внутри', en: 'Several timers and a promise inside' },
    code: `setTimeout(() => console.log('B: 10 ms'), 10)
setTimeout(() => {
  console.log('A: 0 ms')
  Promise.resolve().then(() => console.log('micro in A'))
}, 0)
setTimeout(() => console.log('C: 0 ms'), 0)
console.log('sync')
`,
    output: ['sync', 'A: 0 ms', 'micro in A', 'C: 0 ms', 'B: 10 ms'],
    distractors: ['micro in C'],
    explanation: {
      ru: `Таймеры попадают в очередь задач, когда **истекают**. Таймер на 10 мс поставлен первым, но истечёт позже двух нулевых, поэтому \`B\` последний.

Главное здесь: после **каждой** задачи event loop разбирает очередь микрозадач. Промис, созданный внутри \`A\`, выполнится раньше, чем следующий таймер \`C\`, хотя \`C\` уже ждёт в очереди.

Ноль в \`setTimeout\` не означает «сейчас»: это «не раньше, чем через 0 мс». Браузеры ещё и поднимают задержку до 4 мс у глубоко вложенных таймеров.`,
      en: `Timers enter the task queue when they **expire**. The 10 ms timer is set first but expires after the two zero ones, so \`B\` is last.

The key point: after **every** task the event loop drains the microtask queue. The promise created inside \`A\` runs before the next timer \`C\`, even though \`C\` is already waiting in the queue.

Zero in \`setTimeout\` does not mean "now": it means "no sooner than in 0 ms". Browsers also raise the delay to 4 ms for deeply nested timers.`,
    },
    trace: [
      call('script', 1),
      timer('B (10 ms)', 1, 10),
      timer('A (0 ms)', 2, 0),
      timer('C (0 ms)', 6, 0),
      log('sync', 7),
      ret(),
      expire('A (0 ms)', 'Первыми истекают нулевые таймеры, в порядке установки.', 'The zero timers expire first, in the order they were set.'),
      expire('C (0 ms)'),
      runTask(),
      log('A: 0 ms', 3),
      micro('then cb', 4),
      ret(),
      runMicro('Задача A закончилась. Перед следующей задачей разбирается очередь микрозадач.', 'Task A is done. Before the next task the microtask queue is drained.'),
      log('micro in A', 4),
      ret(),
      runTask(),
      log('C: 0 ms', 6),
      ret(),
      expire('B (10 ms)', 'Прошло 10 мс: последний таймер истёк.', '10 ms have passed: the last timer expired.'),
      runTask(),
      log('B: 10 ms', 1),
      ret(),
    ],
    sources: [mdn('setTimeout()', 'Web/API/Window/setTimeout'), eventLoop, loopSpec],
    verified,
  },
  {
    id: 'el-await-order',
    track: 'js-async',
    difficulty: 'hard',
    title: { ru: 'await против then', en: 'await versus then' },
    code: `async function a() {
  console.log('a start')
  await b()
  console.log('a end')
}
async function b() {
  console.log('b')
}
a()
Promise.resolve().then(() => console.log('then'))
console.log('sync')
`,
    output: ['a start', 'b', 'sync', 'a end', 'then'],
    distractors: ['b end', 'undefined'],
    explanation: {
      ru: `\`a()\` печатает \`a start\` и синхронно вызывает \`b()\`, которая печатает \`b\` и возвращает уже выполненный промис.

\`await\` на нативном промисе ставит продолжение \`a\` в очередь микрозадач **сразу**, раньше, чем строка с \`then\` вообще выполнится. Поэтому \`a end\` идёт перед \`then\`.

До ES2019 \`await\` тратил на нативный промис три микрозадачи, и \`then\` успевал раньше. Спецификацию упростили, и современные движки дают ответ выше. Порядок между независимыми асинхронными цепочками всё равно лучше не делать частью логики программы.`,
      en: `\`a()\` prints \`a start\` and synchronously calls \`b()\`, which prints \`b\` and returns an already fulfilled promise.

\`await\` on a native promise queues the continuation of \`a\` as a microtask **at once**, before the \`then\` line even runs. That is why \`a end\` comes before \`then\`.

Before ES2019, \`await\` on a native promise took three microtasks and \`then\` won. The spec was simplified, and modern engines give the answer above. Still, do not make the order between independent async chains part of your program logic.`,
    },
    sources: [mdn('await', 'Web/JavaScript/Reference/Operators/await'), mdn('async function', 'Web/JavaScript/Reference/Statements/async_function'), { title: 'ECMAScript: Await', url: 'https://tc39.es/ecma262/#await', kind: 'spec' }],
    verified,
  },
]
