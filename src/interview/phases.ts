import type { Localized } from '../i18n/types'
import type { InterviewFormat } from './types'

export interface Phase {
  /** The phase lasts until this share of the round has passed. */
  until: number
  name: Localized
  /** What the interviewer should be getting from the candidate in this phase. */
  goal: Localized
}

/**
 * Timeboxes per format. Design follows RADIO with GreatFrontEnd's guide of about 10/20/10/20/40%;
 * coding follows the usual live-coding flow; theory goes from basics to depth.
 */
export const phases: Record<InterviewFormat, Phase[]> = {
  design: [
    { until: 0.1, name: { ru: 'Требования', en: 'Requirements' }, goal: { ru: 'сценарии, функциональные и нефункциональные требования, границы, устройства, объём данных', en: 'use cases, functional and non-functional requirements, scope, devices, data volume' } },
    { until: 0.3, name: { ru: 'Архитектура', en: 'Architecture' }, goal: { ru: 'блоки клиента (представление, стор, слой данных), рендеринг и навигация, поток данных', en: 'client blocks (view, store, data layer), rendering and navigation, data flow' } },
    { until: 0.4, name: { ru: 'Данные', en: 'Data model' }, goal: { ru: 'сущности, поля, откуда данные, нормализация, где хранится состояние', en: 'entities, fields, data origin, normalization, where state lives' } },
    { until: 0.6, name: { ru: 'API', en: 'API' }, goal: { ru: 'запросы и ответы, пагинация, обновления в реальном времени, API компонентов', en: 'requests and responses, pagination, real-time updates, component APIs' } },
    { until: 0.92, name: { ru: 'Оптимизации', en: 'Optimizations' }, goal: { ru: 'главные темы продукта: производительность, сеть, UX, доступность, i18n, безопасность, сбои', en: 'the key product topics: performance, network, UX, accessibility, i18n, security, failures' } },
    { until: 1.01, name: { ru: 'Итог', en: 'Wrap-up' }, goal: { ru: 'краткий итог решения и компромиссов, что улучшить дальше', en: 'a short summary of the solution and tradeoffs, what to improve next' } },
  ],
  coding: [
    { until: 0.12, name: { ru: 'Условие', en: 'Clarify' }, goal: { ru: 'понимание условия, входы и выходы, краевые случаи', en: 'understanding the task, inputs and outputs, edge cases' } },
    { until: 0.25, name: { ru: 'Подход', en: 'Approach' }, goal: { ru: 'план решения до кода, выбор структур данных', en: 'a plan before coding, choice of data structures' } },
    { until: 0.7, name: { ru: 'Код', en: 'Coding' }, goal: { ru: 'реализация, рассуждения вслух, запуск тестов', en: 'implementation, thinking out loud, running the tests' } },
    { until: 0.88, name: { ru: 'Проверка', en: 'Testing' }, goal: { ru: 'краевые случаи, сложность по времени и памяти', en: 'edge cases, time and space complexity' } },
    { until: 1.01, name: { ru: 'Вопросы', en: 'Follow-ups' }, goal: { ru: 'развитие задачи: новые требования, ограничения, улучшения', en: 'extending the task: new requirements, constraints, improvements' } },
  ],
  theory: [
    { until: 0.15, name: { ru: 'Разминка', en: 'Warm-up' }, goal: { ru: 'опыт кандидата с темой, базовые понятия', en: "the candidate's experience with the topic, basic concepts" } },
    { until: 0.55, name: { ru: 'Основы', en: 'Core' }, goal: { ru: 'ключевые механизмы темы и как они работают', en: 'the key mechanisms of the topic and how they work' } },
    { until: 0.88, name: { ru: 'Глубина', en: 'Depth' }, goal: { ru: 'внутреннее устройство, компромиссы, современные практики, практические кейсы', en: 'internals, tradeoffs, current practices, practical cases' } },
    { until: 1.01, name: { ru: 'Итог', en: 'Wrap-up' }, goal: { ru: 'последний вопрос и вопросы кандидата', en: "a last question and the candidate's questions" } },
  ],
}

export function phaseAt(format: InterviewFormat, elapsedMin: number, durationMin: number): { index: number; phase: Phase; share: number } {
  const share = Math.min(1, Math.max(0, elapsedMin / durationMin))
  const list = phases[format]
  const index = Math.max(0, list.findIndex((p) => share < p.until))
  return { index, phase: list[index] ?? list[list.length - 1], share }
}
