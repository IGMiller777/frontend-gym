import { jsAsyncLessons, jsAsyncModule } from './js-async'
import { jsCoreLessons, jsCoreModule } from './js-core'
import type { Lesson, Module } from './types'

export const lessons: Lesson[] = [...jsCoreLessons, ...jsAsyncLessons]
export const modules: Module[] = [jsCoreModule, jsAsyncModule]

const byId = new Map(lessons.map((l) => [l.id, l]))
export const getLesson = (id: string) => byId.get(id)
export const getModule = (track: string) => modules.find((m) => m.track === track)

export * from './types'
