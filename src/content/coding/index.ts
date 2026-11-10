import { asyncTasks } from './tasks-async'
import { coreTasks } from './tasks-core'
import { domTasks } from './tasks-dom'
import { moreTasks } from './tasks-more'
import { reactTasks } from './tasks-react'
import type { CodingTask } from './types'

const order = [
  'class-names', 'type-utilities', 'array-reduce', 'flatten', 'get-by-path', 'deep-omit', 'squash-object', 'data-merging', 'list-format', 'curry', 'function-call', 'memoize', 'lru-cache',
  'debounce', 'throttle', 'promisify', 'promise-all', 'promise-any', 'deep-equal', 'event-emitter', 'deep-clone', 'html-serializer', 'json-stringify', 'map-limit',
  'get-elements-by-class-name', 'get-elements-by-style',
  'todo-list', 'accordion', 'use-debounced-value', 'tabs', 'search-users', 'like-button']
const all = new Map([...coreTasks, ...moreTasks, ...asyncTasks, ...domTasks, ...reactTasks].map((t) => [t.id, t]))

/** Every coding task, easiest first (the order of the practice list). */
export const codingTasks: CodingTask[] = [...order.map((id) => all.get(id)!), ...[...all.values()].filter((t) => !order.includes(t.id))]

export const getCodingTask = (id: string) => all.get(id)

export * from './types'
