import { asyncTasks } from './tasks-async'
import { coreTasks } from './tasks-core'
import type { CodingTask } from './types'

const order = ['class-names', 'flatten', 'get-by-path', 'curry', 'memoize', 'debounce', 'throttle', 'promise-all', 'deep-equal', 'event-emitter', 'deep-clone', 'map-limit']
const all = new Map([...coreTasks, ...asyncTasks].map((t) => [t.id, t]))

/** Every coding task, easiest first (the order of the practice list). */
export const codingTasks: CodingTask[] = [...order.map((id) => all.get(id)!), ...[...all.values()].filter((t) => !order.includes(t.id))]

export const getCodingTask = (id: string) => all.get(id)

export * from './types'
