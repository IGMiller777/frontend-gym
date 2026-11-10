import type { Source } from '../sources'
import type { CodingTask } from './types'

const mdn = (title: string, path: string): Source => ({ title: `MDN: ${title}`, url: `https://developer.mozilla.org/en-US/docs/${path}`, kind: 'official' })
const verified = { date: '2026-11', version: 'ECMAScript 2025' }

export const coreTasks: CodingTask[] = [
  {
    id: 'class-names',
    track: 'js-core',
    difficulty: 'easy',
    minutes: 10,
    title: { ru: 'classNames', en: 'classNames' },
    summary: {
      ru: 'Собрать строку CSS-классов из строк, объектов-флагов и вложенных массивов.',
      en: 'Build a CSS class string from strings, flag objects and nested arrays.',
    },
    starter: `type ClassValue = string | number | boolean | null | undefined | ClassValue[] | Record<string, unknown>

export function classNames(...args: ClassValue[]): string {
  return ''
}
`,
    solution: `type ClassValue = string | number | boolean | null | undefined | ClassValue[] | Record<string, unknown>

export function classNames(...args: ClassValue[]): string {
  const out: string[] = []
  for (const arg of args) {
    if (!arg) continue // false, null, undefined, 0, ''
    if (typeof arg === 'string' || typeof arg === 'number') {
      out.push(String(arg))
    } else if (Array.isArray(arg)) {
      const inner = classNames(...arg)
      if (inner) out.push(inner)
    } else if (typeof arg === 'object') {
      for (const key of Object.keys(arg)) if (arg[key]) out.push(key)
    }
    // true is ignored: it says nothing about which class to add
  }
  return out.join(' ')
}
`,
    tests: [
      {
        name: { ru: 'склеивает строки через пробел', en: 'joins strings with spaces' },
        code: `expect(classNames('btn', 'btn-primary')).toBe('btn btn-primary')`,
      },
      {
        name: { ru: 'пропускает ложные значения', en: 'skips falsy values' },
        code: `expect(classNames('a', null, undefined, false, 0, '', 'b')).toBe('a b')`,
      },
      {
        name: { ru: 'объект: ключи с истинным значением', en: 'object: keys with truthy values' },
        code: `expect(classNames({ active: true, disabled: false, big: 1 })).toBe('active big')`,
      },
      {
        name: { ru: 'вложенные массивы', en: 'nested arrays' },
        code: `expect(classNames('a', ['b', ['c', { d: true }]], [])).toBe('a b c d')`,
      },
      {
        name: { ru: 'числа кроме 0 и true игнорируется', en: 'numbers except 0; true is ignored' },
        hidden: true,
        code: `expect(classNames(1, true, 'x', 0)).toBe('1 x')`,
      },
      {
        name: { ru: 'нет лишних пробелов', en: 'no stray spaces' },
        hidden: true,
        code: `expect(classNames([], {}, [[]], 'x', [null])).toBe('x')`,
      },
    ],
    sources: [mdn('class attribute', 'Web/HTML/Reference/Global_attributes/class'), mdn('Element.classList', 'Web/API/Element/classList'), mdn('Rest parameters', 'Web/JavaScript/Reference/Functions/rest_parameters')],
    verified,
  },
  {
    id: 'flatten',
    track: 'js-core',
    difficulty: 'easy',
    minutes: 10,
    title: { ru: 'flatten без .flat()', en: 'flatten without .flat()' },
    summary: {
      ru: 'Развернуть вложенные массивы на заданную глубину, как Array.prototype.flat.',
      en: 'Flatten nested arrays to a given depth, like Array.prototype.flat.',
    },
    starter: `export function flatten(arr: readonly unknown[], depth = Infinity): unknown[] {
  // Без Array.prototype.flat / Without Array.prototype.flat
  return [...arr]
}
`,
    solution: `export function flatten(arr: readonly unknown[], depth = Infinity): unknown[] {
  const out: unknown[] = []
  const walk = (list: readonly unknown[], level: number) => {
    // forEach skips holes in sparse arrays, exactly like .flat() does
    list.forEach((item) => {
      if (Array.isArray(item) && level > 0) walk(item, level - 1)
      else out.push(item)
    })
  }
  walk(arr, depth)
  return out
}
`,
    tests: [
      {
        name: { ru: 'по умолчанию разворачивает полностью', en: 'flattens fully by default' },
        code: `expect(flatten([1, [2, [3, [4]]], 5])).toEqual([1, 2, 3, 4, 5])`,
      },
      {
        name: { ru: 'учитывает глубину', en: 'respects depth' },
        code: `expect(flatten([1, [2, [3, [4]]]], 1)).toEqual([1, 2, [3, [4]]])
expect(flatten([1, [2, [3, [4]]]], 2)).toEqual([1, 2, 3, [4]])`,
      },
      {
        name: { ru: 'не меняет исходный массив', en: 'does not mutate the input' },
        code: `const input = [1, [2]]
const out = flatten(input)
expect(input).toEqual([1, [2]])
expect(out).not.toBe(input)`,
      },
      {
        name: { ru: 'пустые массивы исчезают', en: 'empty arrays disappear' },
        code: `expect(flatten([[], [1, []], [[]]])).toEqual([1])`,
      },
      {
        name: { ru: 'depth 0 даёт неглубокую копию', en: 'depth 0 gives a shallow copy' },
        hidden: true,
        code: `const inner = [2]
const out = flatten([1, inner], 0)
expect(out).toEqual([1, [2]])
expect(out[1]).toBe(inner)`,
      },
      {
        name: { ru: 'пропускает дыры, как .flat()', en: 'skips holes, like .flat()' },
        hidden: true,
        code: `const sparse = [1]
sparse[2] = [3]
expect(flatten(sparse)).toEqual([1, 3])`,
      },
      {
        name: { ru: 'работает без Array.prototype.flat', en: 'works without Array.prototype.flat' },
        hidden: true,
        code: `const flat = Array.prototype.flat
Array.prototype.flat = function () { throw new Error('flat() used') }
try {
  expect(flatten([1, [2, [3]]])).toEqual([1, 2, 3])
} finally {
  Array.prototype.flat = flat
}`,
      },
    ],
    sources: [mdn('Array.prototype.flat()', 'Web/JavaScript/Reference/Global_Objects/Array/flat'), mdn('Array.isArray()', 'Web/JavaScript/Reference/Global_Objects/Array/isArray'), mdn('Sparse arrays', 'Web/JavaScript/Guide/Indexed_collections#sparse_arrays')],
    verified,
  },
  {
    id: 'get-by-path',
    track: 'js-core',
    difficulty: 'easy',
    minutes: 10,
    title: { ru: 'get по пути', en: 'get by path' },
    summary: {
      ru: 'Достать значение по строке пути вида "a.b[0].c" со значением по умолчанию.',
      en: 'Read a value by a path string like "a.b[0].c" with a default value.',
    },
    starter: `export function get(obj: unknown, path: string | readonly PropertyKey[], defaultValue?: unknown): unknown {
  return undefined
}
`,
    solution: `export function get(obj: unknown, path: string | readonly PropertyKey[], defaultValue?: unknown): unknown {
  // "a.b[0].c" → ["a", "b", "0", "c"]
  const keys = typeof path === 'string' ? (path.match(/[^.[\\]]+/g) ?? []) : path
  let current = obj
  for (const key of keys) {
    if (current === null || current === undefined) return defaultValue
    current = (current as Record<PropertyKey, unknown>)[key]
  }
  return current === undefined ? defaultValue : current
}
`,
    tests: [
      {
        name: { ru: 'точечный путь', en: 'dotted path' },
        code: `expect(get({ a: { b: { c: 3 } } }, 'a.b.c')).toBe(3)`,
      },
      {
        name: { ru: 'индексы массивов в скобках', en: 'array indexes in brackets' },
        code: `const data = { users: [{ name: 'Ada' }, { name: 'Linus' }] }
expect(get(data, 'users[1].name')).toBe('Linus')`,
      },
      {
        name: { ru: 'путь массивом', en: 'path as an array' },
        code: `expect(get({ a: [{ b: 'x' }] }, ['a', 0, 'b'])).toBe('x')`,
      },
      {
        name: { ru: 'значение по умолчанию, если пути нет', en: 'default value when the path is missing' },
        code: `expect(get({ a: {} }, 'a.b.c', 'none')).toBe('none')
expect(get({ a: null }, 'a.b', 0)).toBe(0)`,
      },
      {
        name: { ru: 'ложные значения не заменяются умолчанием', en: 'falsy values are not replaced by the default' },
        hidden: true,
        code: `const obj = { zero: 0, empty: '', no: false, nil: null }
expect(get(obj, 'zero', 1)).toBe(0)
expect(get(obj, 'empty', 'x')).toBe('')
expect(get(obj, 'no', true)).toBe(false)
expect(get(obj, 'nil', 'x')).toBe(null)`,
      },
      {
        name: { ru: 'читает свойства примитивов и прототипа', en: 'reads primitive and prototype properties' },
        hidden: true,
        code: `expect(get({ s: 'abc' }, 's.length')).toBe(3)
expect(get(null, 'a', 'd')).toBe('d')`,
      },
    ],
    sources: [mdn('Property accessors', 'Web/JavaScript/Reference/Operators/Property_accessors'), mdn('Optional chaining (?.)', 'Web/JavaScript/Reference/Operators/Optional_chaining'), mdn('Nullish coalescing (??)', 'Web/JavaScript/Reference/Operators/Nullish_coalescing')],
    verified,
  },
  {
    id: 'curry',
    track: 'js-core',
    difficulty: 'medium',
    minutes: 15,
    title: { ru: 'curry', en: 'curry' },
    summary: {
      ru: 'Превратить функцию от N аргументов в цепочку вызовов, принимающих аргументы любыми порциями.',
      en: 'Turn an N-argument function into a chain of calls that accept arguments in any groups.',
    },
    starter: `export function curry(fn: (...args: any[]) => unknown) {
  return fn
}
`,
    solution: `export function curry(fn: (...args: any[]) => unknown) {
  // fn.length is the number of declared parameters (before the first default or rest one).
  return function curried(...args: unknown[]): unknown {
    if (args.length >= fn.length) return fn(...args)
    // A new closure per call: partially applied functions are independent and reusable.
    return (...more: unknown[]) => curried(...args, ...more)
  }
}
`,
    tests: [
      {
        name: { ru: 'по одному аргументу', en: 'one argument at a time' },
        code: `const add = curry((a, b, c) => a + b + c)
expect(add(1)(2)(3)).toBe(6)`,
      },
      {
        name: { ru: 'аргументы любыми порциями', en: 'arguments in any groups' },
        code: `const add = curry((a, b, c) => a + b + c)
expect(add(1, 2)(3)).toBe(6)
expect(add(1)(2, 3)).toBe(6)
expect(add(1, 2, 3)).toBe(6)`,
      },
      {
        name: { ru: 'частичные функции переиспользуются', en: 'partial functions are reusable' },
        code: `const add = curry((a, b) => a + b)
const inc = add(1)
expect(inc(1)).toBe(2)
expect(inc(10)).toBe(11)`,
      },
      {
        name: { ru: 'функция без параметров вызывается сразу', en: 'a zero-parameter function is called at once' },
        hidden: true,
        code: `const now = curry(() => 42)
expect(now()).toBe(42)`,
      },
      {
        name: { ru: 'лишние аргументы передаются в fn', en: 'extra arguments are passed to fn' },
        hidden: true,
        code: `const spy = fn()
const mul = curry((a, b, ...rest) => {
  spy(a, b, ...rest)
  return a * b
})
expect(mul(2)(3, 4)).toBe(6)
expect(spy).toHaveBeenCalledWith(2, 3, 4)`,
      },
    ],
    sources: [mdn('Function: length', 'Web/JavaScript/Reference/Global_Objects/Function/length'), mdn('Closures', 'Web/JavaScript/Guide/Closures'), mdn('Spread syntax', 'Web/JavaScript/Reference/Operators/Spread_syntax')],
    verified,
  },
  {
    id: 'memoize',
    track: 'js-core',
    difficulty: 'medium',
    minutes: 15,
    title: { ru: 'memoize', en: 'memoize' },
    summary: {
      ru: 'Кэшировать результат функции по аргументам, не путая 1 и "1" и не теряя undefined.',
      en: 'Cache a function result by its arguments without mixing up 1 and "1" or losing undefined.',
    },
    starter: `export function memoize<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => R {
  return fn
}
`,
    solution: `const RESULT = Symbol('result')

export function memoize<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => R {
  // A tree of Maps: one level per argument. Map compares keys with SameValueZero,
  // so 1 and "1" differ, NaN matches NaN and objects match by reference.
  const root = new Map<unknown, unknown>()
  return (...args: A): R => {
    let node = root
    for (const arg of args) {
      if (!node.has(arg)) node.set(arg, new Map())
      node = node.get(arg) as Map<unknown, unknown>
    }
    if (!node.has(RESULT)) node.set(RESULT, fn(...args))
    return node.get(RESULT) as R
  }
}
`,
    tests: [
      {
        name: { ru: 'повторный вызов берёт результат из кэша', en: 'a repeated call reads from the cache' },
        code: `const slow = fn((a, b) => a + b)
const add = memoize(slow)
expect(add(1, 2)).toBe(3)
expect(add(1, 2)).toBe(3)
expect(slow).toHaveBeenCalledTimes(1)`,
      },
      {
        name: { ru: 'разные аргументы считаются отдельно', en: 'different arguments are computed separately' },
        code: `const slow = fn((x) => x * 2)
const double = memoize(slow)
double(1); double(2); double(1)
expect(slow.calls).toEqual([[1], [2]])`,
      },
      {
        name: { ru: '1 и "1" это разные ключи', en: '1 and "1" are different keys' },
        code: `const type = memoize((x) => typeof x)
expect(type(1)).toBe('number')
expect(type('1')).toBe('string')`,
      },
      {
        name: { ru: 'кэширует и undefined', en: 'caches undefined too' },
        code: `const slow = fn(() => undefined)
const m = memoize(slow)
m('x'); m('x')
expect(slow).toHaveBeenCalledTimes(1)`,
      },
      {
        name: { ru: 'объекты сравниваются по ссылке', en: 'objects are compared by reference' },
        hidden: true,
        code: `const slow = fn((o) => o.n)
const m = memoize(slow)
const a = { n: 1 }
m(a); m(a); m({ n: 1 })
expect(slow).toHaveBeenCalledTimes(2)`,
      },
      {
        name: { ru: 'f(1) и f(1, undefined) не путаются', en: 'f(1) and f(1, undefined) are not mixed up' },
        hidden: true,
        code: `const m = memoize((...args) => args.length)
expect(m(1)).toBe(1)
expect(m(1, undefined)).toBe(2)
expect(m()).toBe(0)`,
      },
    ],
    sources: [mdn('Map', 'Web/JavaScript/Reference/Global_Objects/Map'), mdn('Equality comparisons and sameness', 'Web/JavaScript/Guide/Equality_comparisons_and_sameness'), mdn('Closures', 'Web/JavaScript/Guide/Closures')],
    verified,
  },
  {
    id: 'deep-equal',
    track: 'js-core',
    difficulty: 'medium',
    minutes: 20,
    title: { ru: 'deepEqual', en: 'deepEqual' },
    summary: {
      ru: 'Сравнить два значения по содержимому: объекты, массивы, даты, NaN и циклические ссылки.',
      en: 'Compare two values by content: objects, arrays, dates, NaN and circular references.',
    },
    starter: `export function deepEqual(a: unknown, b: unknown): boolean {
  return a === b
}
`,
    solution: `export function deepEqual(a: unknown, b: unknown, seen = new Map<object, object>()): boolean {
  if (Object.is(a, b)) return true
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false
  if (Array.isArray(a) !== Array.isArray(b)) return false
  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false
  if (a instanceof Date) return a.getTime() === (b as Date).getTime()

  // Already comparing this pair further up the recursion: assume equal, otherwise a cycle never ends.
  if (seen.get(a) === b) return true
  seen.set(a, b)

  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  if (keysA.length !== keysB.length) return false
  return keysA.every(
    (key) => Object.hasOwn(b, key) && deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key], seen),
  )
}
`,
    tests: [
      {
        name: { ru: 'вложенные объекты и массивы', en: 'nested objects and arrays' },
        code: `expect(deepEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] })).toBe(true)
expect(deepEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 3 }] })).toBe(false)`,
      },
      {
        name: { ru: 'порядок ключей не важен', en: 'key order does not matter' },
        code: `expect(deepEqual({ x: 1, y: 2 }, { y: 2, x: 1 })).toBe(true)`,
      },
      {
        name: { ru: 'примитивы по Object.is: NaN равен NaN', en: 'primitives by Object.is: NaN equals NaN' },
        code: `expect(deepEqual(NaN, NaN)).toBe(true)
expect(deepEqual(1, '1')).toBe(false)
expect(deepEqual(null, undefined)).toBe(false)`,
      },
      {
        name: { ru: 'лишний ключ со значением undefined делает объекты разными', en: 'an extra key holding undefined makes objects differ' },
        code: `expect(deepEqual({ a: 1, b: undefined }, { a: 1 })).toBe(false)`,
      },
      {
        name: { ru: 'массив не равен объекту с теми же ключами', en: 'an array is not equal to an object with the same keys' },
        hidden: true,
        code: `expect(deepEqual([1, 2], { 0: 1, 1: 2 })).toBe(false)
expect(deepEqual([], {})).toBe(false)`,
      },
      {
        name: { ru: 'даты сравниваются по времени', en: 'dates are compared by time' },
        hidden: true,
        code: `expect(deepEqual(new Date(0), new Date(0))).toBe(true)
expect(deepEqual(new Date(0), new Date(1))).toBe(false)
expect(deepEqual(new Date(0), {})).toBe(false)`,
      },
      {
        name: { ru: 'не зависает на циклических ссылках', en: 'does not hang on circular references' },
        hidden: true,
        code: `const a = { name: 'a' }
a.self = a
const b = { name: 'a' }
b.self = b
expect(deepEqual(a, b)).toBe(true)`,
      },
    ],
    sources: [mdn('Equality comparisons and sameness', 'Web/JavaScript/Guide/Equality_comparisons_and_sameness'), mdn('Object.is()', 'Web/JavaScript/Reference/Global_Objects/Object/is'), mdn('Object.keys()', 'Web/JavaScript/Reference/Global_Objects/Object/keys')],
    verified,
  },
  {
    id: 'event-emitter',
    track: 'js-core',
    difficulty: 'medium',
    minutes: 20,
    title: { ru: 'EventEmitter', en: 'EventEmitter' },
    summary: {
      ru: 'Подписка, отписка, once и emit: паттерн «издатель-подписчик», на котором стоят DOM-события и Node.js.',
      en: 'Subscribe, unsubscribe, once and emit: the publish-subscribe pattern behind DOM events and Node.js.',
    },
    starter: `type Listener = (...args: any[]) => void

export class EventEmitter {
  on(event: string, listener: Listener): () => void {
    return () => {}
  }
  off(event: string, listener: Listener): void {}
  once(event: string, listener: Listener): () => void {
    return () => {}
  }
  emit(event: string, ...args: unknown[]): boolean {
    return false
  }
}
`,
    solution: `type Listener = ((...args: any[]) => void) & { original?: Listener }

export class EventEmitter {
  #listeners = new Map<string, Listener[]>()

  on(event: string, listener: Listener): () => void {
    const list = this.#listeners.get(event) ?? []
    list.push(listener)
    this.#listeners.set(event, list)
    return () => this.off(event, listener)
  }

  off(event: string, listener: Listener): void {
    const list = this.#listeners.get(event)
    if (!list) return
    // Removes one subscription; a once() wrapper is found by its original listener.
    const i = list.findLastIndex((l) => l === listener || l.original === listener)
    if (i !== -1) list.splice(i, 1)
    if (list.length === 0) this.#listeners.delete(event)
  }

  once(event: string, listener: Listener): () => void {
    const wrapper: Listener = (...args) => {
      this.off(event, wrapper)
      listener.apply(this, args)
    }
    wrapper.original = listener
    return this.on(event, wrapper)
  }

  emit(event: string, ...args: unknown[]): boolean {
    const list = this.#listeners.get(event)
    if (!list) return false
    // A copy: listeners added or removed during emit do not change this round.
    for (const listener of [...list]) listener.apply(this, args)
    return true
  }
}
`,
    tests: [
      {
        name: { ru: 'emit вызывает подписчиков с аргументами', en: 'emit calls listeners with the arguments' },
        code: `const e = new EventEmitter()
const a = fn(), b = fn()
e.on('save', a)
e.on('save', b)
expect(e.emit('save', 1, 'x')).toBe(true)
expect(a).toHaveBeenCalledWith(1, 'x')
expect(b).toHaveBeenCalledWith(1, 'x')`,
      },
      {
        name: { ru: 'emit без подписчиков возвращает false', en: 'emit with no listeners returns false' },
        code: `expect(new EventEmitter().emit('nothing')).toBe(false)`,
      },
      {
        name: { ru: 'on возвращает функцию отписки', en: 'on returns an unsubscribe function' },
        code: `const e = new EventEmitter()
const spy = fn()
const unsubscribe = e.on('tick', spy)
unsubscribe()
e.emit('tick')
expect(spy).toHaveBeenCalledTimes(0)`,
      },
      {
        name: { ru: 'off снимает подписчика', en: 'off removes a listener' },
        code: `const e = new EventEmitter()
const spy = fn()
e.on('tick', spy)
e.off('tick', spy)
expect(e.emit('tick')).toBe(false)
expect(spy).toHaveBeenCalledTimes(0)`,
      },
      {
        name: { ru: 'once срабатывает один раз', en: 'once fires only once' },
        code: `const e = new EventEmitter()
const spy = fn()
e.once('ready', spy)
e.emit('ready', 1)
e.emit('ready', 2)
expect(spy.calls).toEqual([[1]])`,
      },
      {
        name: { ru: 'отписка во время emit не ломает текущий проход', en: 'unsubscribing during emit does not break the current round' },
        hidden: true,
        code: `const e = new EventEmitter()
const calls = []
const first = () => { calls.push('first'); e.off('x', second) }
const second = () => calls.push('second')
e.on('x', first)
e.on('x', second)
e.emit('x')
e.emit('x')
expect(calls).toEqual(['first', 'second', 'first'])`,
      },
      {
        name: { ru: 'off с исходной функцией снимает once-подписку', en: 'off with the original function removes a once subscription' },
        hidden: true,
        code: `const e = new EventEmitter()
const spy = fn()
e.once('x', spy)
e.off('x', spy)
e.emit('x')
expect(spy).toHaveBeenCalledTimes(0)`,
      },
      {
        name: { ru: 'одна функция, подписанная дважды, вызывается дважды', en: 'a function subscribed twice is called twice' },
        hidden: true,
        code: `const e = new EventEmitter()
const spy = fn()
e.on('x', spy)
e.on('x', spy)
e.emit('x')
expect(spy).toHaveBeenCalledTimes(2)
e.off('x', spy)
e.emit('x')
expect(spy).toHaveBeenCalledTimes(3)`,
      },
    ],
    sources: [
      { title: 'Node.js: Events', url: 'https://nodejs.org/api/events.html', kind: 'official' },
      mdn('EventTarget', 'Web/API/EventTarget'),
      mdn('Private elements', 'Web/JavaScript/Reference/Classes/Private_elements'),
    ],
    verified,
  },
  {
    id: 'deep-clone',
    track: 'js-core',
    difficulty: 'hard',
    minutes: 25,
    title: { ru: 'deepClone', en: 'deepClone' },
    summary: {
      ru: 'Глубокая копия с Date, Map, Set, общими и циклическими ссылками. И почему обычно хватает structuredClone.',
      en: 'A deep copy with Date, Map, Set, shared and circular references. And why structuredClone is usually enough.',
    },
    starter: `export function deepClone<T>(value: T): T {
  // Без structuredClone / Without structuredClone
  return value
}
`,
    solution: `export function deepClone<T>(value: T, seen = new WeakMap<object, unknown>()): T {
  if (value === null || typeof value !== 'object') return value // primitives and functions
  // Already copied: return that copy. Keeps shared references shared and ends cycles.
  if (seen.has(value)) return seen.get(value) as T

  if (value instanceof Date) return new Date(value.getTime()) as T
  if (value instanceof RegExp) return new RegExp(value.source, value.flags) as T

  if (value instanceof Map) {
    const copy = new Map()
    seen.set(value, copy) // register before recursing, or a cycle recurses forever
    value.forEach((v, k) => copy.set(deepClone(k, seen), deepClone(v, seen)))
    return copy as T
  }
  if (value instanceof Set) {
    const copy = new Set()
    seen.set(value, copy)
    value.forEach((v) => copy.add(deepClone(v, seen)))
    return copy as T
  }

  const copy: Record<string, unknown> = Array.isArray(value) ? new Array(value.length) : Object.create(Object.getPrototypeOf(value))
  seen.set(value, copy)
  for (const key of Object.keys(value)) copy[key] = deepClone((value as Record<string, unknown>)[key], seen)
  return copy as T
}
`,
    tests: [
      {
        name: { ru: 'копия вложенных объектов независима', en: 'nested objects are copied independently' },
        code: `const src = { user: { name: 'Ada', tags: ['a'] } }
const copy = deepClone(src)
copy.user.name = 'Bob'
copy.user.tags.push('b')
expect(src).toEqual({ user: { name: 'Ada', tags: ['a'] } })
expect(copy.user).not.toBe(src.user)`,
      },
      {
        name: { ru: 'массивы остаются массивами', en: 'arrays stay arrays' },
        code: `const copy = deepClone([1, [2, 3]])
expect(Array.isArray(copy)).toBe(true)
expect(Array.isArray(copy[1])).toBe(true)
expect(copy).toEqual([1, [2, 3]])`,
      },
      {
        name: { ru: 'Date копируется как Date', en: 'Date is copied as a Date' },
        code: `const d = new Date(2026, 0, 1)
const copy = deepClone({ d })
expect(copy.d).toBeInstanceOf(Date)
expect(copy.d).not.toBe(d)
expect(copy.d.getTime()).toBe(d.getTime())`,
      },
      {
        name: { ru: 'Map и Set копируются глубоко', en: 'Map and Set are copied deeply' },
        code: `const inner = { n: 1 }
const src = { m: new Map([['k', inner]]), s: new Set([inner]) }
const copy = deepClone(src)
expect(copy.m).toBeInstanceOf(Map)
expect(copy.m.get('k')).toEqual({ n: 1 })
expect(copy.m.get('k')).not.toBe(inner)
expect(copy.s).toBeInstanceOf(Set)
expect([...copy.s][0]).not.toBe(inner)`,
      },
      {
        name: { ru: 'циклическая ссылка не роняет функцию', en: 'a circular reference does not crash it' },
        hidden: true,
        code: `const node = { id: 1 }
node.self = node
const copy = deepClone(node)
expect(copy.self).toBe(copy)
expect(copy).not.toBe(node)`,
      },
      {
        name: { ru: 'общая ссылка остаётся общей', en: 'a shared reference stays shared' },
        hidden: true,
        code: `const shared = { x: 1 }
const copy = deepClone({ a: shared, b: shared })
expect(copy.a).toBe(copy.b)
expect(copy.a).not.toBe(shared)`,
      },
      {
        name: { ru: 'функции копируются по ссылке', en: 'functions are copied by reference' },
        hidden: true,
        code: `const handler = () => 1
expect(deepClone({ handler }).handler).toBe(handler)`,
      },
      {
        name: { ru: 'работает без structuredClone', en: 'works without structuredClone' },
        hidden: true,
        code: `const saved = globalThis.structuredClone
globalThis.structuredClone = () => { throw new Error('structuredClone used') }
try {
  expect(deepClone({ a: [1] })).toEqual({ a: [1] })
} finally {
  globalThis.structuredClone = saved
}`,
      },
    ],
    sources: [
      mdn('structuredClone()', 'Web/API/Window/structuredClone'),
      mdn('The structured clone algorithm', 'Web/API/Web_Workers_API/Structured_clone_algorithm'),
      mdn('WeakMap', 'Web/JavaScript/Reference/Global_Objects/WeakMap'),
    ],
    verified,
  },
]
