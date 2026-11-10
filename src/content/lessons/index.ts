import { browserLessons, browserModule } from './browser'
import { cssLessons, cssModule } from './css'
import { htmlLessons, htmlModule } from './html'
import { jsAsyncLessons, jsAsyncModule } from './js-async'
import { jsCoreLessons, jsCoreModule } from './js-core'
import { networkLessons, networkModule } from './network'
import { typescriptLessons, typescriptModule } from './typescript'
import type { Lesson, Module } from './types'

export const lessons: Lesson[] = [...jsCoreLessons, ...jsAsyncLessons, ...typescriptLessons, ...browserLessons, ...networkLessons, ...htmlLessons, ...cssLessons]
export const modules: Module[] = [jsCoreModule, jsAsyncModule, typescriptModule, browserModule, networkModule, htmlModule, cssModule]

const byId = new Map(lessons.map((l) => [l.id, l]))
export const getLesson = (id: string) => byId.get(id)
export const getModule = (track: string) => modules.find((m) => m.track === track)

export * from './types'
