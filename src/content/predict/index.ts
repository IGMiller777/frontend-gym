import { asyncPredict } from './tasks-async'
import { corePredict } from './tasks-core'

/** Language basics first, then the event loop. */
export const predictTasks = [...corePredict, ...asyncPredict]

const byId = new Map(predictTasks.map((t) => [t.id, t]))
export const getPredictTask = (id: string) => byId.get(id)

export * from './types'
