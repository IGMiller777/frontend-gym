import type { Source } from '../sources'
import type { CodingTask } from './types'

/** Utility and async tasks added to cover the GFE 75 "JavaScript functions" list (own statements and tests). */
const mdn = (title: string, path: string): Source => ({ title: `MDN: ${title}`, url: `https://developer.mozilla.org/en-US/docs/${path}`, kind: 'official' })
const verified = { date: '2026-11', version: 'ECMAScript 2025' }

export const moreTasks: CodingTask[] = [
  {
    id: 'array-reduce',
    track: 'js-core',
    difficulty: 'easy',
    minutes: 15,
    title: { ru: 'Свой Array.prototype.reduce', en: 'Your own Array.prototype.reduce' },
    summary: {
      ru: 'Повторить reduce с начальным значением и без него, с дырами в массиве и правильной ошибкой на пустом массиве.',
      en: 'Rebuild reduce with and without an initial value, with holes in the array and the right error on an empty array.',
    },
    starter: `export function reduce<T, A>(array: T[], callback: (acc: A, value: T, index: number, array: T[]) => A, ...initial: [A?]): A {
  // Без array.reduce и array.reduceRight. / Without array.reduce and array.reduceRight.
  return undefined as A
}
`,
    solution: `export function reduce<T, A>(array: T[], callback: (acc: A, value: T, index: number, array: T[]) => A, ...initial: [A?]): A {
  if (typeof callback !== 'function') throw new TypeError(\`\${callback} is not a function\`)
  const length = array.length // elements pushed by the callback are not visited
  let i = 0
  let acc: A
  if (initial.length > 0) {
    acc = initial[0] as A
  } else {
    while (i < length && !(i in array)) i++ // skip leading holes
    if (i >= length) throw new TypeError('Reduce of empty array with no initial value')
    acc = array[i++] as unknown as A
  }
  for (; i < length; i++) {
    if (i in array) acc = callback(acc, array[i], i, array) // holes are skipped
  }
  return acc
}
`,
    tests: [
      {
        name: { ru: 'сумма с начальным значением', en: 'sum with an initial value' },
        code: `expect(reduce([1, 2, 3], (s, x) => s + x, 10)).toBe(16)`,
      },
      {
        name: { ru: 'без начального значения берёт первый элемент', en: 'without an initial value uses the first element' },
        code: `const calls = []
expect(reduce([1, 2, 3], (s, x, i) => (calls.push(i), s + x))).toBe(6)
expect(calls).toEqual([1, 2])`,
      },
      {
        name: { ru: 'пустой массив без начального значения: TypeError', en: 'empty array without an initial value: TypeError' },
        code: `expect(() => reduce([], (a, b) => a + b)).toThrow(TypeError)
expect(reduce([], (a, b) => a + b, 0)).toBe(0)`,
      },
      {
        name: { ru: 'передаёт индекс и массив', en: 'passes the index and the array' },
        code: `const arr = ['a', 'b']
expect(reduce(arr, (acc, v, i, a) => [...acc, \`\${v}\${i}\${a === arr}\`], [])).toEqual(['a0true', 'b1true'])`,
      },
      {
        name: { ru: 'начальное значение undefined это тоже значение', en: 'an initial value of undefined still counts' },
        hidden: true,
        code: `expect(reduce([1], (acc, x) => [acc, x], undefined)).toEqual([undefined, 1])`,
      },
      {
        name: { ru: 'пропускает дыры, в том числе в начале', en: 'skips holes, including leading ones' },
        hidden: true,
        code: `const sparse = [, , 2, , 3]
const seen = []
expect(reduce(sparse, (s, x, i) => (seen.push(i), s + x))).toBe(5)
expect(seen).toEqual([4])`,
      },
      {
        name: { ru: 'не обходит элементы, добавленные во время обхода', en: 'does not visit elements added during the walk' },
        hidden: true,
        code: `const arr = [1, 2]
expect(reduce(arr, (s, x, i, a) => (a.push(100), s + x), 0)).toBe(3)`,
      },
    ],
    sources: [mdn('Array.prototype.reduce()', 'Web/JavaScript/Reference/Global_Objects/Array/reduce'), mdn('Sparse arrays', 'Web/JavaScript/Guide/Indexed_collections#sparse_arrays')],
    verified,
  },
  {
    id: 'function-call',
    track: 'js-core',
    difficulty: 'medium',
    minutes: 15,
    title: { ru: 'Свой Function.prototype.call', en: 'Your own Function.prototype.call' },
    summary: {
      ru: 'Вызвать функцию с заданным this и аргументами без call, apply и bind.',
      en: 'Call a function with a given this and arguments without call, apply and bind.',
    },
    starter: `export function callWith<R>(fn: (...args: any[]) => R, thisArg: unknown, ...args: unknown[]): R {
  // Без fn.call, fn.apply, fn.bind и Reflect.apply. / Without fn.call, fn.apply, fn.bind and Reflect.apply.
  return fn(...args)
}
`,
    solution: `export function callWith<R>(fn: (...args: any[]) => R, thisArg: unknown, ...args: unknown[]): R {
  if (typeof fn !== 'function') throw new TypeError('callWith: fn must be a function')
  if (thisArg === null || thisArg === undefined) return fn(...args) // plain call: this stays undefined in strict code
  const target = Object(thisArg) // primitives are boxed: we need an object to hang the method on
  const key = Symbol('fn') // a unique key never clashes with the object's own properties
  target[key] = fn
  try {
    return target[key](...args) // called as a method: this === target
  } finally {
    delete target[key] // leave the object as it was, even if fn throws
  }
}
`,
    tests: [
      {
        name: { ru: 'this становится thisArg', en: 'this becomes thisArg' },
        code: `function greet(greeting, mark) { return \`\${greeting}, \${this.name}\${mark}\` }
expect(callWith(greet, { name: 'Ann' }, 'Hi', '!')).toBe('Hi, Ann!')`,
      },
      {
        name: { ru: 'возвращает результат функции', en: 'returns the function result' },
        code: `expect(callWith(function () { return this.a + this.b }, { a: 2, b: 3 })).toBe(5)`,
      },
      {
        name: { ru: 'не оставляет следов на объекте', en: 'leaves no trace on the object' },
        code: `const obj = { x: 1 }
callWith(function () { return Reflect.ownKeys(this).length }, obj)
expect(Reflect.ownKeys(obj)).toEqual(['x'])`,
      },
      {
        name: { ru: 'null и undefined: обычный вызов', en: 'null and undefined: a plain call' },
        code: `// tests run as sloppy scripts: 'use strict' keeps this as it was passed
expect(callWith(function () { 'use strict'; return this }, null)).toBe(undefined)
expect(callWith((a, b) => a * b, undefined, 6, 7)).toBe(42)`,
      },
      {
        name: { ru: 'не ломает свойство с таким же именем', en: 'does not clobber a property with the same name' },
        hidden: true,
        code: `const obj = { fn: 'keep me' }
expect(callWith(function () { return this.fn }, obj)).toBe('keep me')
expect(obj.fn).toBe('keep me')`,
      },
      {
        name: { ru: 'убирает временное свойство и при ошибке', en: 'removes the temporary property on error too' },
        hidden: true,
        code: `const obj = {}
expect(() => callWith(function () { throw new Error('boom') }, obj)).toThrow('boom')
expect(Reflect.ownKeys(obj)).toEqual([])`,
      },
      {
        name: { ru: 'работает без встроенных call, apply и bind', en: 'works without built-in call, apply and bind' },
        hidden: true,
        code: `const saved = { call: Function.prototype.call, apply: Function.prototype.apply, bind: Function.prototype.bind, rapply: Reflect.apply }
let result
const ban = () => { throw new Error('built-in used') }
Object.assign(Function.prototype, { call: ban, apply: ban, bind: ban })
Reflect.apply = ban
try {
  result = callWith(function (x) { return this.k + x }, { k: 1 }, 2)
} finally {
  Object.assign(Function.prototype, { call: saved.call, apply: saved.apply, bind: saved.bind })
  Reflect.apply = saved.rapply
}
expect(result).toBe(3)`,
      },
    ],
    sources: [mdn('Function.prototype.call()', 'Web/JavaScript/Reference/Global_Objects/Function/call'), mdn('this', 'Web/JavaScript/Reference/Operators/this'), mdn('Symbol', 'Web/JavaScript/Reference/Global_Objects/Symbol')],
    verified,
  },
  {
    id: 'type-utilities',
    track: 'js-core',
    difficulty: 'easy',
    minutes: 10,
    title: { ru: 'Проверки типов', en: 'Type checks' },
    summary: {
      ru: 'isArray, isFunction, isObject и isPlainObject: где typeof врёт и чем обычный объект отличается от экземпляра класса.',
      en: 'isArray, isFunction, isObject and isPlainObject: where typeof lies and how a plain object differs from a class instance.',
    },
    starter: `export function isArray(value: unknown): boolean {
  return false
}

export function isFunction(value: unknown): boolean {
  return false
}

/** Objects and functions, not null. */
export function isObject(value: unknown): boolean {
  return false
}

/** Created by {} / new Object() / Object.create(null). */
export function isPlainObject(value: unknown): boolean {
  return false
}
`,
    solution: `export function isArray(value: unknown): boolean {
  return Array.isArray(value) // also true for arrays from other frames, unlike instanceof
}

export function isFunction(value: unknown): boolean {
  return typeof value === 'function' // classes, async functions and generators included
}

/** Objects and functions, not null. */
export function isObject(value: unknown): boolean {
  return value !== null && (typeof value === 'object' || typeof value === 'function')
}

/** Created by {} / new Object() / Object.create(null). */
export function isPlainObject(value: unknown): boolean {
  if (value === null || typeof value !== 'object') return false
  const proto = Object.getPrototypeOf(value)
  return proto === null || proto === Object.prototype
}
`,
    tests: [
      {
        name: { ru: 'isArray', en: 'isArray' },
        code: `expect(isArray([])).toBe(true)
expect(isArray({ length: 0 })).toBe(false)
expect(isArray('abc')).toBe(false)`,
      },
      {
        name: { ru: 'isFunction', en: 'isFunction' },
        code: `expect(isFunction(() => {})).toBe(true)
expect(isFunction(class {})).toBe(true)
expect(isFunction(async () => {})).toBe(true)
expect(isFunction({})).toBe(false)`,
      },
      {
        name: { ru: 'isObject: null не объект', en: 'isObject: null is not an object' },
        code: `expect(isObject(null)).toBe(false)
expect(isObject({})).toBe(true)
expect(isObject([])).toBe(true)
expect(isObject(() => {})).toBe(true)
expect(isObject('s')).toBe(false)`,
      },
      {
        name: { ru: 'isPlainObject', en: 'isPlainObject' },
        code: `expect(isPlainObject({ a: 1 })).toBe(true)
expect(isPlainObject(Object.create(null))).toBe(true)
expect(isPlainObject([])).toBe(false)
expect(isPlainObject(new Date())).toBe(false)`,
      },
      {
        name: { ru: 'экземпляр класса не обычный объект', en: 'a class instance is not a plain object' },
        hidden: true,
        code: `class User {}
expect(isPlainObject(new User())).toBe(false)
expect(isPlainObject(Object.create({}))).toBe(false)
expect(isPlainObject(null)).toBe(false)`,
      },
      {
        name: { ru: 'примитивы и обёртки', en: 'primitives and wrappers' },
        hidden: true,
        code: `expect(isObject(new String('x'))).toBe(true)
expect(isPlainObject(new String('x'))).toBe(false)
expect(isObject(undefined)).toBe(false)
expect(isFunction(null)).toBe(false)`,
      },
    ],
    sources: [mdn('typeof', 'Web/JavaScript/Reference/Operators/typeof'), mdn('Array.isArray()', 'Web/JavaScript/Reference/Global_Objects/Array/isArray'), mdn('Object.getPrototypeOf()', 'Web/JavaScript/Reference/Global_Objects/Object/getPrototypeOf')],
    verified,
  },
  {
    id: 'squash-object',
    track: 'js-core',
    difficulty: 'medium',
    minutes: 20,
    title: { ru: 'Сплющить объект в пути', en: 'Squash an object into paths' },
    summary: {
      ru: 'Превратить вложенный объект в одноуровневый с ключами-путями через точку, включая массивы.',
      en: 'Turn a nested object into a single level with dot-separated path keys, arrays included.',
    },
    starter: `export function squash(value: Record<string, unknown>): Record<string, unknown> {
  return {}
}
`,
    solution: `export function squash(value: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  const walk = (node: unknown, path: string[]) => {
    if (node !== null && typeof node === 'object' && !(node instanceof Date)) {
      // Arrays are walked by index: Object.entries gives ['0', x], ['1', y]
      for (const [key, child] of Object.entries(node)) walk(child, key === '' ? path : [...path, key])
      return
    }
    out[path.join('.')] = node
  }
  walk(value, [])
  return out
}
`,
    tests: [
      {
        name: { ru: 'вложенные объекты', en: 'nested objects' },
        code: `expect(squash({ a: 1, b: { c: 2, d: { e: 3 } } })).toEqual({ a: 1, 'b.c': 2, 'b.d.e': 3 })`,
      },
      {
        name: { ru: 'массивы по индексам', en: 'arrays by index' },
        code: `expect(squash({ tags: ['x', 'y'], list: [{ id: 1 }] })).toEqual({ 'tags.0': 'x', 'tags.1': 'y', 'list.0.id': 1 })`,
      },
      {
        name: { ru: 'пустой ключ не добавляет сегмент', en: 'an empty key adds no segment' },
        code: `expect(squash({ a: { '': { b: 1 } }, '': 2 })).toEqual({ 'a.b': 1, '': 2 })`,
      },
      {
        name: { ru: 'null, undefined и даты остаются значениями', en: 'null, undefined and dates stay values' },
        hidden: true,
        code: `const d = new Date(0)
expect(squash({ a: null, b: { c: undefined }, at: d })).toEqual({ a: null, 'b.c': undefined, at: d })`,
      },
      {
        name: { ru: 'пустые вложенные объекты исчезают', en: 'empty nested objects disappear' },
        hidden: true,
        code: `expect(squash({ a: {}, b: [], c: 1 })).toEqual({ c: 1 })`,
      },
      {
        name: { ru: 'не меняет вход', en: 'does not mutate the input' },
        hidden: true,
        code: `const input = { a: { b: 1 } }
squash(input)
expect(input).toEqual({ a: { b: 1 } })`,
      },
    ],
    sources: [mdn('Object.entries()', 'Web/JavaScript/Reference/Global_Objects/Object/entries'), mdn('Recursion (glossary)', 'Glossary/Recursion')],
    verified,
  },
  {
    id: 'deep-omit',
    track: 'js-core',
    difficulty: 'easy',
    minutes: 15,
    title: { ru: 'deepOmit: убрать ключи на любой глубине', en: 'deepOmit: drop keys at any depth' },
    summary: {
      ru: 'Вернуть копию данных без указанных ключей во всех вложенных объектах и массивах.',
      en: 'Return a copy of the data without the given keys in every nested object and array.',
    },
    starter: `export function deepOmit<T>(value: T, keys: string[]): T {
  return value
}
`,
    solution: `export function deepOmit<T>(value: T, keys: string[]): T {
  const banned = new Set(keys) // O(1) lookups
  const walk = (node: unknown): unknown => {
    if (Array.isArray(node)) return node.map(walk)
    if (node !== null && typeof node === 'object' && Object.getPrototypeOf(node) === Object.prototype) {
      const out: Record<string, unknown> = {}
      for (const [key, child] of Object.entries(node)) if (!banned.has(key)) out[key] = walk(child)
      return out
    }
    return node // primitives, dates, maps and class instances are kept as is
  }
  return walk(value) as T
}
`,
    tests: [
      {
        name: { ru: 'убирает ключ на верхнем уровне', en: 'drops a top-level key' },
        code: `expect(deepOmit({ a: 1, b: 2 }, ['b'])).toEqual({ a: 1 })`,
      },
      {
        name: { ru: 'убирает на любой глубине и в массивах', en: 'drops at any depth and inside arrays' },
        code: `const input = { id: 1, password: 'x', profile: { password: 'y', name: 'Ann' }, list: [{ password: 'z', ok: true }] }
expect(deepOmit(input, ['password'])).toEqual({ id: 1, profile: { name: 'Ann' }, list: [{ ok: true }] })`,
      },
      {
        name: { ru: 'не меняет вход', en: 'does not mutate the input' },
        code: `const input = { a: { b: 1, c: 2 } }
const out = deepOmit(input, ['c'])
expect(input).toEqual({ a: { b: 1, c: 2 } })
expect(out.a === input.a).toBe(false)`,
      },
      {
        name: { ru: 'примитивы и массивы примитивов', en: 'primitives and arrays of primitives' },
        hidden: true,
        code: `expect(deepOmit(5, ['a'])).toBe(5)
expect(deepOmit([1, 'a', null], ['a'])).toEqual([1, 'a', null])`,
      },
      {
        name: { ru: 'несколько ключей сразу', en: 'several keys at once' },
        hidden: true,
        code: `expect(deepOmit({ a: 1, b: { a: 2, c: 3, d: 4 } }, ['a', 'd'])).toEqual({ b: { c: 3 } })`,
      },
    ],
    sources: [mdn('Object.entries()', 'Web/JavaScript/Reference/Global_Objects/Object/entries'), mdn('Set', 'Web/JavaScript/Reference/Global_Objects/Set')],
    verified,
  },
  {
    id: 'data-merging',
    track: 'js-core',
    difficulty: 'medium',
    minutes: 20,
    title: { ru: 'Слияние записей по пользователю', en: 'Merging records per user' },
    summary: {
      ru: 'Объединить заказы одного пользователя: сумма, уникальные отсортированные теги, порядок первого появления.',
      en: 'Merge orders of the same user: summed totals, unique sorted tags, order of first appearance.',
    },
    starter: `export interface Order {
  userId: number
  total: number
  tags: string[]
}

export function mergeOrders(orders: Order[]): Order[] {
  return orders
}
`,
    solution: `export interface Order {
  userId: number
  total: number
  tags: string[]
}

export function mergeOrders(orders: Order[]): Order[] {
  // Map keeps insertion order, so users stay in the order they first appeared.
  const byUser = new Map<number, { userId: number; total: number; tags: Set<string> }>()
  for (const order of orders) {
    const entry = byUser.get(order.userId)
    if (entry) {
      entry.total += order.total
      for (const tag of order.tags) entry.tags.add(tag)
    } else {
      byUser.set(order.userId, { userId: order.userId, total: order.total, tags: new Set(order.tags) })
    }
  }
  // New objects: the input is never mutated.
  return [...byUser.values()].map((e) => ({ userId: e.userId, total: e.total, tags: [...e.tags].sort() }))
}
`,
    tests: [
      {
        name: { ru: 'суммирует и объединяет теги', en: 'sums totals and merges tags' },
        code: `expect(
  mergeOrders([
    { userId: 1, total: 10, tags: ['b', 'a'] },
    { userId: 1, total: 5, tags: ['a', 'c'] },
  ]),
).toEqual([{ userId: 1, total: 15, tags: ['a', 'b', 'c'] }])`,
      },
      {
        name: { ru: 'порядок первого появления', en: 'order of first appearance' },
        code: `const out = mergeOrders([
  { userId: 2, total: 1, tags: [] },
  { userId: 1, total: 1, tags: [] },
  { userId: 2, total: 1, tags: [] },
])
expect(out.map((o) => [o.userId, o.total])).toEqual([[2, 2], [1, 1]])`,
      },
      {
        name: { ru: 'пустой вход', en: 'empty input' },
        code: `expect(mergeOrders([])).toEqual([])`,
      },
      {
        name: { ru: 'не меняет вход', en: 'does not mutate the input' },
        hidden: true,
        code: `const input = [{ userId: 1, total: 1, tags: ['z'] }, { userId: 1, total: 2, tags: ['a'] }]
const copy = structuredClone(input)
mergeOrders(input)
expect(input).toEqual(copy)`,
      },
      {
        name: { ru: 'одна запись тоже сортирует теги без дублей', en: 'a single record also gets sorted unique tags' },
        hidden: true,
        code: `expect(mergeOrders([{ userId: 7, total: 3, tags: ['b', 'a', 'b'] }])).toEqual([{ userId: 7, total: 3, tags: ['a', 'b'] }])`,
      },
    ],
    sources: [mdn('Map', 'Web/JavaScript/Reference/Global_Objects/Map'), mdn('Set', 'Web/JavaScript/Reference/Global_Objects/Set'), mdn('Object.groupBy()', 'Web/JavaScript/Reference/Global_Objects/Object/groupBy')],
    verified,
  },
  {
    id: 'list-format',
    track: 'js-core',
    difficulty: 'medium',
    minutes: 20,
    title: { ru: 'Форматирование списка имён', en: 'Formatting a list of names' },
    summary: {
      ru: '"Ann, Bob and 2 others": порядок, уникальность, лимит и единственное или множественное число.',
      en: '"Ann, Bob and 2 others": order, uniqueness, a limit and singular or plural.',
    },
    starter: `export interface ListOptions {
  sorted?: boolean
  unique?: boolean
  /** Show at most this many names, then "and N other(s)". */
  limit?: number
}

export function formatList(items: string[], options: ListOptions = {}): string {
  return items.join(', ')
}
`,
    solution: `export interface ListOptions {
  sorted?: boolean
  unique?: boolean
  /** Show at most this many names, then "and N other(s)". */
  limit?: number
}

export function formatList(items: string[], options: ListOptions = {}): string {
  let list = items.filter((s) => s.trim() !== '') // empty names say nothing
  if (options.unique) list = [...new Set(list)]
  if (options.sorted) list = list.toSorted((a, b) => a.localeCompare(b))
  if (list.length === 0) return ''
  if (list.length === 1) return list[0]

  const { limit } = options
  if (limit !== undefined && limit > 0 && limit < list.length) {
    const rest = list.length - limit
    return \`\${list.slice(0, limit).join(', ')} and \${rest} \${rest === 1 ? 'other' : 'others'}\`
  }
  return \`\${list.slice(0, -1).join(', ')} and \${list.at(-1)}\`
}
`,
    tests: [
      {
        name: { ru: 'одно, два и три имени', en: 'one, two and three names' },
        code: `expect(formatList(['Ann'])).toBe('Ann')
expect(formatList(['Ann', 'Bob'])).toBe('Ann and Bob')
expect(formatList(['Ann', 'Bob', 'Eve'])).toBe('Ann, Bob and Eve')`,
      },
      {
        name: { ru: 'лимит и "others"', en: 'a limit and "others"' },
        code: `expect(formatList(['Ann', 'Bob', 'Eve', 'Max'], { limit: 2 })).toBe('Ann, Bob and 2 others')
expect(formatList(['Ann', 'Bob', 'Eve'], { limit: 2 })).toBe('Ann, Bob and 1 other')`,
      },
      {
        name: { ru: 'сортировка и уникальность', en: 'sorting and uniqueness' },
        code: `expect(formatList(['Bob', 'Ann', 'Bob'], { sorted: true, unique: true })).toBe('Ann and Bob')`,
      },
      {
        name: { ru: 'пустой список и пустые строки', en: 'an empty list and empty strings' },
        hidden: true,
        code: `expect(formatList([])).toBe('')
expect(formatList(['', 'Ann', ' '])).toBe('Ann')`,
      },
      {
        name: { ru: 'лимит не меньше длины ничего не прячет', en: 'a limit not below the length hides nothing' },
        hidden: true,
        code: `expect(formatList(['Ann', 'Bob'], { limit: 2 })).toBe('Ann and Bob')
expect(formatList(['Ann', 'Bob'], { limit: 0 })).toBe('Ann and Bob')`,
      },
      {
        name: { ru: 'не меняет входной массив', en: 'does not mutate the input array' },
        hidden: true,
        code: `const input = ['b', 'a']
formatList(input, { sorted: true })
expect(input).toEqual(['b', 'a'])`,
      },
    ],
    sources: [mdn('Intl.ListFormat', 'Web/JavaScript/Reference/Global_Objects/Intl/ListFormat'), mdn('Array.prototype.toSorted()', 'Web/JavaScript/Reference/Global_Objects/Array/toSorted')],
    verified,
  },
  {
    id: 'json-stringify',
    track: 'js-core',
    difficulty: 'hard',
    minutes: 35,
    title: { ru: 'Свой JSON.stringify', en: 'Your own JSON.stringify' },
    summary: {
      ru: 'Сериализовать значение как JSON.stringify: экранирование строк, undefined и функции, toJSON, NaN, циклы и BigInt.',
      en: 'Serialize a value like JSON.stringify: string escaping, undefined and functions, toJSON, NaN, cycles and BigInt.',
    },
    starter: `export function stringify(value: unknown): string | undefined {
  // Без JSON.stringify. / Without JSON.stringify.
  return String(value)
}
`,
    solution: `const ESCAPES: Record<string, string> = { '"': '\\\\"', '\\\\': '\\\\\\\\', '\\b': '\\\\b', '\\f': '\\\\f', '\\n': '\\\\n', '\\r': '\\\\r', '\\t': '\\\\t' }

function quote(s: string): string {
  let out = '"'
  for (const ch of s) {
    const code = ch.charCodeAt(0)
    if (ESCAPES[ch]) out += ESCAPES[ch]
    else if (code < 0x20) out += '\\\\u' + code.toString(16).padStart(4, '0') // other control characters
    else out += ch
  }
  return out + '"'
}

export function stringify(value: unknown): string | undefined {
  const stack: object[] = [] // objects on the current path: a repeat means a cycle

  const write = (key: string, holder: unknown): string | undefined => {
    let v = (holder as Record<string, unknown>)[key]
    if (v !== null && typeof v === 'object' && typeof (v as { toJSON?: unknown }).toJSON === 'function') v = (v as { toJSON: (k: string) => unknown }).toJSON(key)
    if (v instanceof Number || v instanceof String || v instanceof Boolean) v = v.valueOf() // boxed primitives

    if (v === null) return 'null'
    switch (typeof v) {
      case 'boolean':
        return String(v)
      case 'number':
        return Number.isFinite(v) ? String(v) : 'null' // NaN and Infinity become null
      case 'string':
        return quote(v)
      case 'bigint':
        throw new TypeError('Do not know how to serialize a BigInt')
      case 'undefined':
      case 'function':
      case 'symbol':
        return undefined // skipped in objects, null in arrays
    }

    const obj = v as Record<string, unknown>
    if (stack.includes(obj)) throw new TypeError('Converting circular structure to JSON')
    stack.push(obj)
    let out: string
    if (Array.isArray(obj)) {
      out = '[' + obj.map((_, i) => write(String(i), obj) ?? 'null').join(',') + ']'
    } else {
      const parts: string[] = []
      for (const k of Object.keys(obj)) {
        const s = write(k, obj)
        if (s !== undefined) parts.push(quote(k) + ':' + s)
      }
      out = '{' + parts.join(',') + '}'
    }
    stack.pop()
    return out
  }

  return write('', { '': value })
}
`,
    tests: [
      {
        name: { ru: 'примитивы', en: 'primitives' },
        code: `for (const v of [null, true, false, 0, -1.5, 'hi', 1e21]) expect(stringify(v)).toBe(JSON.stringify(v))`,
      },
      {
        name: { ru: 'объекты и массивы', en: 'objects and arrays' },
        code: `const v = { a: [1, { b: 'x' }], c: {}, d: [] }
expect(stringify(v)).toBe(JSON.stringify(v))`,
      },
      {
        name: { ru: 'undefined, функции и символы', en: 'undefined, functions and symbols' },
        code: `const v = { a: undefined, f() {}, s: Symbol('x'), list: [undefined, () => 1, Symbol('y')] }
expect(stringify(v)).toBe('{"list":[null,null,null]}')
expect(stringify(undefined)).toBe(undefined)`,
      },
      {
        name: { ru: 'экранирование строк', en: 'string escaping' },
        code: `const s = 'quote " slash \\\\ line\\nend\\ttab \\u0001'
expect(stringify(s)).toBe(JSON.stringify(s))`,
      },
      {
        name: { ru: 'NaN и Infinity становятся null', en: 'NaN and Infinity become null' },
        hidden: true,
        code: `expect(stringify([NaN, Infinity, -Infinity])).toBe('[null,null,null]')`,
      },
      {
        name: { ru: 'toJSON и даты', en: 'toJSON and dates' },
        hidden: true,
        code: `const v = { at: new Date(0), money: { toJSON: (key) => \`custom:\${key}\` } }
expect(stringify(v)).toBe(JSON.stringify(v))`,
      },
      {
        name: { ru: 'цикл и BigInt бросают TypeError', en: 'a cycle and a BigInt throw TypeError' },
        hidden: true,
        code: `const a = { name: 'a' }
a.self = a
expect(() => stringify(a)).toThrow(TypeError)
expect(() => stringify({ n: 1n })).toThrow(TypeError)`,
      },
      {
        name: { ru: 'общая ссылка без цикла не ошибка', en: 'a shared reference without a cycle is fine' },
        hidden: true,
        code: `const shared = { x: 1 }
const v = { a: shared, b: [shared, shared] }
expect(stringify(v)).toBe(JSON.stringify(v))`,
      },
      {
        name: { ru: 'обёртки примитивов', en: 'primitive wrappers' },
        hidden: true,
        code: `const v = [new Number(3), new String('s'), new Boolean(false)]
expect(stringify(v)).toBe(JSON.stringify(v))`,
      },
    ],
    sources: [mdn('JSON.stringify()', 'Web/JavaScript/Reference/Global_Objects/JSON/stringify'), { title: 'ECMAScript: SerializeJSONProperty', url: 'https://tc39.es/ecma262/#sec-serializejsonproperty', kind: 'spec' }],
    verified,
  },
  {
    id: 'html-serializer',
    track: 'js-core',
    difficulty: 'medium',
    minutes: 20,
    title: { ru: 'Сериализация дерева в HTML', en: 'Serializing a tree to HTML' },
    summary: {
      ru: 'Превратить дерево { tag, children } в HTML-строку с отступами: рекурсия, глубина и экранирование текста.',
      en: 'Turn a { tag, children } tree into an indented HTML string: recursion, depth and text escaping.',
    },
    starter: `export interface HtmlNode {
  tag: string
  children: (HtmlNode | string)[]
}

export function serialize(node: HtmlNode, indent = '  '): string {
  return ''
}
`,
    solution: `export interface HtmlNode {
  tag: string
  children: (HtmlNode | string)[]
}

const escapeText = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export function serialize(node: HtmlNode, indent = '  '): string {
  const lines: string[] = []
  const walk = (current: HtmlNode | string, depth: number) => {
    const pad = indent.repeat(depth)
    if (typeof current === 'string') {
      lines.push(pad + escapeText(current)) // text is data, never markup
      return
    }
    lines.push(\`\${pad}<\${current.tag}>\`)
    for (const child of current.children) walk(child, depth + 1)
    lines.push(\`\${pad}</\${current.tag}>\`)
  }
  walk(node, 0)
  return lines.join('\\n')
}
`,
    tests: [
      {
        name: { ru: 'один элемент с текстом', en: 'one element with text' },
        code: `expect(serialize({ tag: 'p', children: ['Hi'] })).toBe('<p>\\n  Hi\\n</p>')`,
      },
      {
        name: { ru: 'вложенность и отступы', en: 'nesting and indentation' },
        code: `const tree = { tag: 'ul', children: [{ tag: 'li', children: ['a'] }, { tag: 'li', children: ['b'] }] }
expect(serialize(tree)).toBe(['<ul>', '  <li>', '    a', '  </li>', '  <li>', '    b', '  </li>', '</ul>'].join('\\n'))`,
      },
      {
        name: { ru: 'свой отступ', en: 'a custom indent' },
        code: `expect(serialize({ tag: 'div', children: [{ tag: 'span', children: ['x'] }] }, '\\t')).toBe('<div>\\n\\t<span>\\n\\t\\tx\\n\\t</span>\\n</div>')`,
      },
      {
        name: { ru: 'пустой элемент', en: 'an empty element' },
        hidden: true,
        code: `expect(serialize({ tag: 'br', children: [] })).toBe('<br>\\n</br>')`,
      },
      {
        name: { ru: 'текст экранируется', en: 'text is escaped' },
        hidden: true,
        code: `expect(serialize({ tag: 'b', children: ['<script>&'] })).toBe('<b>\\n  &lt;script&gt;&amp;\\n</b>')`,
      },
      {
        name: { ru: 'смешанные дети', en: 'mixed children' },
        hidden: true,
        code: `const tree = { tag: 'p', children: ['Hello, ', { tag: 'em', children: ['world'] }, '!'] }
expect(serialize(tree).split('\\n')).toEqual(['<p>', '  Hello, ', '  <em>', '    world', '  </em>', '  !', '</p>'])`,
      },
    ],
    sources: [mdn('Element.innerHTML: security considerations', 'Web/API/Element/innerHTML#security_considerations'), mdn('String.prototype.repeat()', 'Web/JavaScript/Reference/Global_Objects/String/repeat')],
    verified,
  },
  {
    id: 'promise-any',
    track: 'js-async',
    difficulty: 'medium',
    minutes: 20,
    title: { ru: 'Свой Promise.any', en: 'Your own Promise.any' },
    summary: {
      ru: 'Первый успешный результат; если отклонены все, AggregateError со всеми причинами в порядке входа.',
      en: 'The first fulfilled result; if all reject, an AggregateError with every reason in input order.',
    },
    starter: `export function promiseAny<T>(values: Iterable<T | PromiseLike<T>>): Promise<Awaited<T>> {
  // Без Promise.any, Promise.all, Promise.allSettled и Promise.race.
  // Without Promise.any, Promise.all, Promise.allSettled and Promise.race.
  return new Promise(() => {})
}
`,
    solution: `export function promiseAny<T>(values: Iterable<T | PromiseLike<T>>): Promise<Awaited<T>> {
  return new Promise((resolve, reject) => {
    const errors: unknown[] = []
    let count = 0
    let rejected = 0

    for (const value of values) {
      const index = count++
      Promise.resolve(value).then(resolve, (reason) => {
        errors[index] = reason // keep input order, not completion order
        if (++rejected === count) reject(new AggregateError(errors, 'All promises were rejected'))
      })
    }

    // Unlike Promise.all, an empty input rejects: there is no value to fulfill with.
    if (count === 0) reject(new AggregateError([], 'All promises were rejected'))
  })
}
`,
    tests: [
      {
        name: { ru: 'первый успешный, даже если ошибки раньше', en: 'the first fulfilled one, even if errors come earlier' },
        fakeTimers: true,
        code: `const later = (ms, v, ok = true) => {
  const p = new Promise((res, rej) => setTimeout(() => (ok ? res(v) : rej(new Error(v))), ms))
  p.catch(() => {})
  return p
}
const p = promiseAny([later(10, 'e1', false), later(30, 'slow'), later(20, 'fast')])
await clock.tickAsync(30)
await expect(p).resolves.toBe('fast')`,
      },
      {
        name: { ru: 'принимает обычные значения', en: 'accepts plain values' },
        code: `const rejected = (e) => { const p = Promise.reject(e); p.catch(() => {}); return p }
await expect(promiseAny([rejected(new Error('x')), 7])).resolves.toBe(7)`,
      },
      {
        name: { ru: 'все отклонены: AggregateError', en: 'all rejected: AggregateError' },
        code: `let error
const rejected = (e) => { const p = Promise.reject(e); p.catch(() => {}); return p }
await promiseAny([rejected(1), rejected(2)]).catch((e) => (error = e))
expect(error instanceof AggregateError).toBe(true)
expect(error.errors).toEqual([1, 2])`,
      },
      {
        name: { ru: 'ошибки в порядке входа', en: 'errors in input order' },
        hidden: true,
        fakeTimers: true,
        code: `const fail = (ms, v) => {
  const p = new Promise((_, rej) => setTimeout(() => rej(v), ms))
  p.catch(() => {})
  return p
}
let error
promiseAny([fail(30, 'a'), fail(10, 'b'), fail(20, 'c')]).catch((e) => (error = e))
await clock.tickAsync(30)
expect(error.errors).toEqual(['a', 'b', 'c'])`,
      },
      {
        name: { ru: 'пустой вход отклоняется', en: 'an empty input rejects' },
        hidden: true,
        code: `let error
await promiseAny([]).catch((e) => (error = e))
expect(error instanceof AggregateError).toBe(true)
expect(error.errors).toEqual([])`,
      },
      {
        name: { ru: 'работает без встроенных комбинаторов', en: 'works without built-in combinators' },
        hidden: true,
        code: `const saved = { all: Promise.all, allSettled: Promise.allSettled, any: Promise.any, race: Promise.race }
const ban = () => { throw new Error('built-in combinator used') }
Object.assign(Promise, { all: ban, allSettled: ban, any: ban, race: ban })
let result
try {
  const rejected = Promise.reject(0)
  rejected.catch(() => {})
  result = promiseAny([rejected, Promise.resolve(1)])
} finally {
  Object.assign(Promise, saved)
}
await expect(result).resolves.toBe(1)`,
      },
    ],
    sources: [mdn('Promise.any()', 'Web/JavaScript/Reference/Global_Objects/Promise/any'), mdn('AggregateError', 'Web/JavaScript/Reference/Global_Objects/AggregateError')],
    verified,
  },
  {
    id: 'promisify',
    track: 'js-async',
    difficulty: 'easy',
    minutes: 15,
    title: { ru: 'promisify', en: 'promisify' },
    summary: {
      ru: 'Превратить функцию с колбэком (err, result) в функцию, возвращающую промис, сохранив this.',
      en: 'Turn a function with an (err, result) callback into one that returns a promise, keeping this.',
    },
    starter: `type Callback<T> = (error: unknown, result?: T) => void

export function promisify<T>(fn: (...args: any[]) => void): (...args: any[]) => Promise<T> {
  return () => Promise.resolve(undefined as T)
}
`,
    solution: `type Callback<T> = (error: unknown, result?: T) => void

export function promisify<T>(fn: (...args: any[]) => void): (...args: any[]) => Promise<T> {
  // A regular function, not an arrow: it must receive the caller's this.
  return function (this: unknown, ...args: any[]): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const callback: Callback<T> = (error, result) => (error ? reject(error) : resolve(result as T))
      Reflect.apply(fn, this, [...args, callback]) // the callback goes last, Node.js style
    })
  }
}
`,
    tests: [
      {
        name: { ru: 'результат колбэка становится значением промиса', en: 'the callback result becomes the promise value' },
        code: `const add = (a, b, cb) => setTimeout(() => cb(null, a + b), 0)
await expect(promisify(add)(2, 3)).resolves.toBe(5)`,
      },
      {
        name: { ru: 'ошибка колбэка отклоняет промис', en: 'a callback error rejects the promise' },
        code: `const fail = (cb) => cb(new Error('nope'))
await expect(promisify(fail)()).rejects.toEqual(new Error('nope'))`,
      },
      {
        name: { ru: 'сохраняет this', en: 'keeps this' },
        code: `const store = { prefix: '#', get(id, cb) { cb(null, this.prefix + id) } }
store.getAsync = promisify(store.get)
await expect(store.getAsync(7)).resolves.toBe('#7')`,
      },
      {
        name: { ru: 'синхронный колбэк тоже работает', en: 'a synchronous callback works too' },
        hidden: true,
        code: `const sync = (x, cb) => cb(null, x * 2)
await expect(promisify(sync)(21)).resolves.toBe(42)`,
      },
      {
        name: { ru: 'передаёт все аргументы, колбэк последним', en: 'passes every argument, the callback last' },
        hidden: true,
        code: `const spy = fn((...args) => args.at(-1)(null, args.length))
await expect(promisify(spy)(1, 2, 3)).resolves.toBe(4)`,
      },
      {
        name: { ru: 'ошибка null или undefined это успех', en: 'a null or undefined error means success' },
        hidden: true,
        code: `const ok = (cb) => cb(undefined, 'done')
await expect(promisify(ok)()).resolves.toBe('done')`,
      },
    ],
    sources: [{ title: 'Node.js: util.promisify', url: 'https://nodejs.org/api/util.html#utilpromisifyoriginal', kind: 'official' }, mdn('Using promises', 'Web/JavaScript/Guide/Using_promises')],
    verified,
  },
]
