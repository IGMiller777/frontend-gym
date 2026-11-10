import type { Source } from '../sources'
import type { CodingTask } from './types'

const mdn = (title: string, path: string): Source => ({ title: `MDN: ${title}`, url: `https://developer.mozilla.org/en-US/docs/${path}`, kind: 'official' })
const verified = { date: '2026-11', version: 'ECMAScript 2025' }

export const asyncTasks: CodingTask[] = [
  {
    id: 'debounce',
    track: 'js-async',
    difficulty: 'medium',
    minutes: 15,
    title: { ru: 'debounce', en: 'debounce' },
    summary: {
      ru: 'Вызвать функцию один раз, когда серия вызовов затихла. Поиск по мере ввода, resize, автосохранение.',
      en: 'Call a function once a burst of calls has gone quiet. Search as you type, resize, autosave.',
    },
    starter: `export function debounce<A extends unknown[]>(fn: (...args: A) => void, wait: number) {
  // Верните функцию, которая вызывает fn через wait мс после последнего вызова,
  // и добавьте ей метод cancel().
  // Return a function that calls fn wait ms after the last call,
  // and give it a cancel() method.
}
`,
    solution: `export function debounce<A extends unknown[], T>(fn: (this: T, ...args: A) => void, wait: number) {
  let timer: ReturnType<typeof setTimeout> | undefined

  function debounced(this: T, ...args: A) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), wait)
  }

  debounced.cancel = () => {
    clearTimeout(timer)
    timer = undefined
  }

  return debounced
}
`,
    tests: [
      {
        name: { ru: 'вызывает fn один раз через wait после серии вызовов', en: 'calls fn once, wait ms after a burst' },
        fakeTimers: true,
        code: `const spy = fn()
const d = debounce(spy, 100)
d(); d(); d()
clock.tick(99)
expect(spy).toHaveBeenCalledTimes(0)
clock.tick(1)
expect(spy).toHaveBeenCalledTimes(1)`,
      },
      {
        name: { ru: 'передаёт аргументы последнего вызова', en: 'passes the arguments of the last call' },
        fakeTimers: true,
        code: `const spy = fn()
const d = debounce(spy, 50)
d('a'); d('b', 2)
clock.tick(50)
expect(spy).toHaveBeenCalledTimes(1)
expect(spy).toHaveBeenLastCalledWith('b', 2)`,
      },
      {
        name: { ru: 'каждый вызов откладывает срабатывание заново', en: 'every call restarts the wait' },
        fakeTimers: true,
        code: `const spy = fn()
const d = debounce(spy, 100)
d()
clock.tick(80)
d()
clock.tick(80)
expect(spy).toHaveBeenCalledTimes(0)
clock.tick(20)
expect(spy).toHaveBeenCalledTimes(1)`,
      },
      {
        name: { ru: 'сохраняет this', en: 'keeps this' },
        fakeTimers: true,
        code: `const spy = fn()
const input = { value: 'x', onInput: debounce(spy, 10) }
input.onInput()
clock.tick(10)
expect(spy.contexts[0]).toBe(input)`,
      },
      {
        name: { ru: 'cancel() отменяет запланированный вызов', en: 'cancel() drops the pending call' },
        fakeTimers: true,
        code: `const spy = fn()
const d = debounce(spy, 100)
d()
d.cancel()
clock.tick(500)
expect(spy).toHaveBeenCalledTimes(0)`,
      },
      {
        name: { ru: 'две серии с паузой дают два вызова', en: 'two bursts with a pause give two calls' },
        hidden: true,
        fakeTimers: true,
        code: `const spy = fn()
const d = debounce(spy, 100)
d(1); d(2)
clock.tick(100)
d(3)
clock.tick(100)
expect(spy.calls).toEqual([[2], [3]])`,
      },
      {
        name: { ru: 'после cancel() функция снова работает', en: 'works again after cancel()' },
        hidden: true,
        fakeTimers: true,
        code: `const spy = fn()
const d = debounce(spy, 30)
d(1)
d.cancel()
d(2)
clock.tick(30)
expect(spy.calls).toEqual([[2]])`,
      },
    ],
    sources: [mdn('Debounce', 'Glossary/Debounce'), mdn('setTimeout()', 'Web/API/Window/setTimeout'), mdn('Function.prototype.apply()', 'Web/JavaScript/Reference/Global_Objects/Function/apply')],
    verified,
  },
  {
    id: 'throttle',
    track: 'js-async',
    difficulty: 'medium',
    minutes: 20,
    title: { ru: 'throttle', en: 'throttle' },
    summary: {
      ru: 'Не чаще одного вызова за интервал: первый сразу, последний в конце окна. Скролл, mousemove, drag.',
      en: 'At most one call per interval: the first at once, the latest at the end of the window. Scroll, mousemove, drag.',
    },
    starter: `export function throttle<A extends unknown[]>(fn: (...args: A) => void, wait: number) {
  // Первый вызов сразу, дальше не чаще раза в wait мс;
  // вызов во время паузы выполняется в конце окна с последними аргументами.
  // First call at once, then at most once per wait ms;
  // a call during the pause runs at the end of the window with the latest arguments.
}
`,
    solution: `export function throttle<A extends unknown[], T>(fn: (this: T, ...args: A) => void, wait: number) {
  let timer: ReturnType<typeof setTimeout> | undefined
  let pending: { self: T; args: A } | null = null

  // An open window means "fn ran recently". When it closes, run the call that waited, if any,
  // and open a new window for it.
  const openWindow = () => {
    timer = setTimeout(() => {
      timer = undefined
      if (pending) {
        const { self, args } = pending
        pending = null
        fn.apply(self, args)
        openWindow()
      }
    }, wait)
  }

  return function throttled(this: T, ...args: A) {
    if (timer === undefined) {
      fn.apply(this, args)
      openWindow()
    } else {
      pending = { self: this, args }
    }
  }
}
`,
    tests: [
      {
        name: { ru: 'первый вызов выполняется сразу', en: 'the first call runs at once' },
        fakeTimers: true,
        code: `const spy = fn()
const t = throttle(spy, 100)
t('a')
expect(spy).toHaveBeenCalledWith('a')`,
      },
      {
        name: { ru: 'вызовы внутри окна сливаются в один в конце окна', en: 'calls inside the window merge into one at its end' },
        fakeTimers: true,
        code: `const spy = fn()
const t = throttle(spy, 100)
t(1)
clock.tick(30); t(2)
clock.tick(30); t(3)
expect(spy.calls).toEqual([[1]])
clock.tick(40)
expect(spy.calls).toEqual([[1], [3]])`,
      },
      {
        name: { ru: 'без вызовов в окне лишнего вызова нет', en: 'no extra call when the window was quiet' },
        fakeTimers: true,
        code: `const spy = fn()
const t = throttle(spy, 100)
t()
clock.tick(1000)
expect(spy).toHaveBeenCalledTimes(1)
t()
expect(spy).toHaveBeenCalledTimes(2)`,
      },
      {
        name: { ru: 'сохраняет this', en: 'keeps this' },
        fakeTimers: true,
        code: `const spy = fn()
const obj = { onScroll: throttle(spy, 50) }
obj.onScroll()
obj.onScroll()
clock.tick(50)
expect(spy.contexts).toEqual([obj, obj])`,
      },
      {
        name: { ru: 'отложенный вызов открывает новое окно', en: 'the trailing call opens a new window' },
        hidden: true,
        fakeTimers: true,
        code: `const spy = fn()
const t = throttle(spy, 100)
t(1)
clock.tick(50); t(2)
clock.tick(50)
expect(spy.calls).toEqual([[1], [2]])
clock.tick(20); t(3)
expect(spy).toHaveBeenCalledTimes(2)
clock.tick(80)
expect(spy.calls).toEqual([[1], [2], [3]])`,
      },
      {
        name: { ru: 'частые вызовы 1 с: не чаще раза в 100 мс', en: '1 s of rapid calls: at most once per 100 ms' },
        hidden: true,
        fakeTimers: true,
        code: `const spy = fn()
const t = throttle(spy, 100)
for (let i = 0; i < 100; i++) { t(i); clock.tick(10) }
clock.tick(200)
expect(spy.calls.length).toBeGreaterThanOrEqual(10)
expect(spy.calls.length).toBeLessThanOrEqual(11)
expect(spy).toHaveBeenLastCalledWith(99)`,
      },
    ],
    sources: [mdn('Throttle', 'Glossary/Throttle'), mdn('setTimeout()', 'Web/API/Window/setTimeout'), mdn('scroll event', 'Web/API/Element/scroll_event')],
    verified,
  },
  {
    id: 'promise-all',
    track: 'js-async',
    difficulty: 'medium',
    minutes: 20,
    title: { ru: 'Свой Promise.all', en: 'Your own Promise.all' },
    summary: {
      ru: 'Дождаться всех промисов, сохранить порядок результатов, упасть на первой ошибке.',
      en: 'Wait for every promise, keep results in input order, reject on the first failure.',
    },
    starter: `export function promiseAll<T>(values: Iterable<T | PromiseLike<T>>): Promise<Awaited<T>[]> {
  // Без Promise.all, Promise.allSettled, Promise.any и Promise.race.
  // Without Promise.all, Promise.allSettled, Promise.any and Promise.race.
  return new Promise((resolve, reject) => {})
}
`,
    solution: `export function promiseAll<T>(values: Iterable<T | PromiseLike<T>>): Promise<Awaited<T>[]> {
  return new Promise((resolve, reject) => {
    const results: Awaited<T>[] = []
    let count = 0
    let settled = 0

    for (const value of values) {
      const index = count++
      // Promise.resolve accepts plain values, promises and any thenable.
      Promise.resolve(value).then((result) => {
        results[index] = result
        if (++settled === count) resolve(results)
      }, reject)
    }

    if (count === 0) resolve(results)
  })
}
`,
    tests: [
      {
        name: { ru: 'результаты в порядке входа, а не завершения', en: 'results in input order, not completion order' },
        fakeTimers: true,
        code: `const wait = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms))
const p = promiseAll([wait(30, 'a'), wait(10, 'b'), wait(20, 'c')])
await clock.tickAsync(30)
await expect(p).resolves.toEqual(['a', 'b', 'c'])`,
      },
      {
        name: { ru: 'принимает обычные значения', en: 'accepts plain values' },
        code: `await expect(promiseAll([1, Promise.resolve(2), 3])).resolves.toEqual([1, 2, 3])`,
      },
      {
        name: { ru: 'пустой вход даёт []', en: 'empty input resolves to []' },
        code: `await expect(promiseAll([])).resolves.toEqual([])`,
      },
      {
        name: { ru: 'отклоняется причиной первой ошибки', en: 'rejects with the first failure' },
        fakeTimers: true,
        code: `const fail = (ms, message) => {
  const p = new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms))
  p.catch(() => {}) // the test itself does not care about this rejection
  return p
}
let error
promiseAll([new Promise((r) => setTimeout(() => r(1), 50)), fail(30, 'slow'), fail(10, 'fast')]).catch((e) => (error = e))
await clock.tickAsync(50)
expect(error).toEqual(new Error('fast'))`,
      },
      {
        name: { ru: 'принимает любой iterable', en: 'accepts any iterable' },
        hidden: true,
        code: `function* gen() { yield 1; yield Promise.resolve(2) }
await expect(promiseAll(gen())).resolves.toEqual([1, 2])
await expect(promiseAll(new Set(['x']))).resolves.toEqual(['x'])`,
      },
      {
        name: { ru: 'работает без встроенного Promise.all', en: 'works without the built-in Promise.all' },
        hidden: true,
        code: `const saved = { all: Promise.all, allSettled: Promise.allSettled, any: Promise.any, race: Promise.race }
const ban = () => { throw new Error('built-in combinator used') }
Object.assign(Promise, { all: ban, allSettled: ban, any: ban, race: ban })
let result
try {
  result = promiseAll([Promise.resolve(1), 2])
} finally {
  Object.assign(Promise, saved) // restore before awaiting: other code may need them
}
await expect(result).resolves.toEqual([1, 2])`,
      },
      {
        name: { ru: 'понимает thenable-объекты', en: 'understands thenables' },
        hidden: true,
        code: `const thenable = { then(resolve) { resolve(42) } }
await expect(promiseAll([thenable])).resolves.toEqual([42])`,
      },
    ],
    sources: [
      mdn('Promise.all()', 'Web/JavaScript/Reference/Global_Objects/Promise/all'),
      mdn('Promise.resolve()', 'Web/JavaScript/Reference/Global_Objects/Promise/resolve'),
      mdn('Using promises', 'Web/JavaScript/Guide/Using_promises'),
    ],
    verified,
  },
  {
    id: 'map-limit',
    track: 'js-async',
    difficulty: 'hard',
    minutes: 30,
    title: { ru: 'Пул запросов с лимитом', en: 'Request pool with a limit' },
    summary: {
      ru: 'Обработать список асинхронно, но не больше N задач одновременно. Загрузка файлов, пачки запросов к API.',
      en: 'Process a list asynchronously with at most N tasks at a time. File uploads, batches of API requests.',
    },
    starter: `export function mapLimit<T, R>(
  items: readonly T[],
  limit: number,
  mapper: (item: T, index: number) => Promise<R> | R,
): Promise<R[]> {
  // Не больше limit вызовов mapper одновременно; результаты в порядке items.
  // At most limit mapper calls at a time; results in the order of items.
  return Promise.resolve([])
}
`,
    solution: `export function mapLimit<T, R>(
  items: readonly T[],
  limit: number,
  mapper: (item: T, index: number) => Promise<R> | R,
): Promise<R[]> {
  return new Promise((resolve, reject) => {
    const results: R[] = new Array(items.length)
    let next = 0
    let done = 0
    let failed = false

    if (items.length === 0) return resolve(results)

    // Each "worker" takes the next item as soon as its previous one is finished.
    const runNext = () => {
      if (failed || next >= items.length) return
      const index = next++
      let result: Promise<R>
      try {
        result = Promise.resolve(mapper(items[index], index))
      } catch (error) {
        result = Promise.reject(error)
      }
      result.then(
        (value) => {
          results[index] = value
          if (++done === items.length) resolve(results)
          else runNext()
        },
        (error) => {
          failed = true
          reject(error)
        },
      )
    }

    for (let i = 0; i < Math.min(limit, items.length); i++) runNext()
  })
}
`,
    tests: [
      {
        name: { ru: 'результаты в порядке входа', en: 'results in input order' },
        fakeTimers: true,
        code: `const p = mapLimit([30, 10, 20], 2, (ms) => new Promise((r) => setTimeout(() => r(ms * 2), ms)))
await clock.tickAsync(100)
await expect(p).resolves.toEqual([60, 20, 40])`,
      },
      {
        name: { ru: 'одновременно не больше limit', en: 'never more than limit at once' },
        fakeTimers: true,
        code: `let running = 0
let peak = 0
const p = mapLimit([1, 2, 3, 4, 5, 6, 7], 3, async (x) => {
  running++
  peak = Math.max(peak, running)
  await new Promise((r) => setTimeout(r, 10 * x))
  running--
  return x
})
await clock.tickAsync(1000)
await expect(p).resolves.toEqual([1, 2, 3, 4, 5, 6, 7])
expect(peak).toBe(3)`,
      },
      {
        name: { ru: 'освободившееся место занимается сразу, а не пачками', en: 'a free slot is reused at once, not in batches' },
        fakeTimers: true,
        code: `const mapper = fn((ms) => new Promise((r) => setTimeout(() => r(ms), ms)))
const p = mapLimit([100, 10, 10, 10], 2, mapper)
expect(mapper).toHaveBeenCalledTimes(2)
await clock.tickAsync(30)
expect(mapper).toHaveBeenCalledTimes(4)
await clock.tickAsync(70)
await expect(p).resolves.toEqual([100, 10, 10, 10])`,
      },
      {
        name: { ru: 'пустой список даёт []', en: 'an empty list resolves to []' },
        code: `const mapper = fn()
await expect(mapLimit([], 2, mapper)).resolves.toEqual([])
expect(mapper).toHaveBeenCalledTimes(0)`,
      },
      {
        name: { ru: 'ошибка отклоняет результат и останавливает новые запуски', en: 'a failure rejects and stops new starts' },
        hidden: true,
        fakeTimers: true,
        code: `const mapper = fn((x) => new Promise((resolve, reject) => setTimeout(() => (x === 2 ? reject(new Error('boom')) : resolve(x)), 10)))
let error
mapLimit([1, 2, 3, 4, 5], 2, mapper).catch((e) => (error = e))
await clock.tickAsync(100)
expect(error).toEqual(new Error('boom'))
expect(mapper.calls.length).toBeLessThanOrEqual(3)`,
      },
      {
        name: { ru: 'limit больше длины списка', en: 'limit larger than the list' },
        hidden: true,
        code: `await expect(mapLimit(['a', 'b'], 10, (s, i) => s + i)).resolves.toEqual(['a0', 'b1'])`,
      },
      {
        name: { ru: 'синхронная ошибка mapper тоже отклоняет', en: 'a synchronous throw in mapper rejects too' },
        hidden: true,
        code: `await expect(mapLimit([1], 1, () => { throw new Error('sync') })).rejects.toEqual(new Error('sync'))`,
      },
    ],
    sources: [
      mdn('Promise', 'Web/JavaScript/Reference/Global_Objects/Promise'),
      mdn('async function', 'Web/JavaScript/Reference/Statements/async_function'),
      mdn('Using promises', 'Web/JavaScript/Guide/Using_promises'),
    ],
    verified,
  },
]
