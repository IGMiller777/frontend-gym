import type { Localized } from '../i18n/types'
import type { Source } from './sources'

export type TrackGroup = 'platform' | 'language' | 'frameworks' | 'app' | 'quality' | 'scale'

export interface Track {
  id: string
  group: TrackGroup
  emoji: string
  title: Localized
  blurb: Localized
  /** Brand-ish gradient for cards and progress: [from, to]. */
  colors: [string, string]
  /** Plan stage in which the content lands (docs/PLAN.md). */
  stage: number
  docs: Source[]
}

const doc = (title: string, url: string): Source => ({ title, url, kind: 'official' })
const spec = (title: string, url: string): Source => ({ title, url, kind: 'spec' })

export const groupOrder: TrackGroup[] = ['platform', 'language', 'frameworks', 'app', 'quality', 'scale']

export const tracks: Track[] = [
  {
    id: 'browser',
    group: 'platform',
    emoji: '🧭',
    title: { ru: 'Браузер и рендеринг', en: 'Browser & rendering' },
    blurb: { ru: 'Путь от HTML до пикселей, DOM, события, Observer API, воркеры.', en: 'From HTML to pixels, the DOM, events, Observer APIs, workers.' },
    colors: ['#06b6d4', '#3b82f6'],
    stage: 3,
    docs: [doc('MDN: Web APIs', 'https://developer.mozilla.org/en-US/docs/Web/API'), doc('web.dev: Rendering performance', 'https://web.dev/articles/rendering-performance')],
  },
  {
    id: 'network',
    group: 'platform',
    emoji: '🌐',
    title: { ru: 'Сеть и HTTP', en: 'Network & HTTP' },
    blurb: { ru: 'HTTP/2 и HTTP/3, кэширование, CORS, cookies, приоритеты загрузки.', en: 'HTTP/2 and HTTP/3, caching, CORS, cookies, loading priorities.' },
    colors: ['#14b8a6', '#06b6d4'],
    stage: 3,
    docs: [doc('MDN: HTTP', 'https://developer.mozilla.org/en-US/docs/Web/HTTP'), doc('web.dev: HTTP cache', 'https://web.dev/articles/http-cache')],
  },
  {
    id: 'html',
    group: 'platform',
    emoji: '🧱',
    title: { ru: 'HTML и доступность', en: 'HTML & accessibility' },
    blurb: { ru: 'Семантика, формы, ARIA, фокус, WCAG 2.2.', en: 'Semantics, forms, ARIA, focus, WCAG 2.2.' },
    colors: ['#f97316', '#ef4444'],
    stage: 3,
    docs: [
      spec('HTML Living Standard', 'https://html.spec.whatwg.org/multipage/'),
      spec('WCAG 2.2', 'https://www.w3.org/TR/WCAG22/'),
      doc('ARIA Authoring Practices Guide', 'https://www.w3.org/WAI/ARIA/apg/'),
    ],
  },
  {
    id: 'css',
    group: 'platform',
    emoji: '🎨',
    title: { ru: 'CSS', en: 'CSS' },
    blurb: { ru: 'Каскад и @layer, Flexbox и Grid, container queries, :has(), анимации.', en: 'Cascade and @layer, Flexbox and Grid, container queries, :has(), animations.' },
    colors: ['#a855f7', '#6366f1'],
    stage: 3,
    docs: [doc('MDN: CSS', 'https://developer.mozilla.org/en-US/docs/Web/CSS'), doc('web.dev: Learn CSS', 'https://web.dev/learn/css')],
  },
  {
    id: 'js-core',
    group: 'language',
    emoji: '⚡',
    title: { ru: 'JavaScript: основа', en: 'JavaScript: core' },
    blurb: { ru: 'Типы, замыкания, this, прототипы, модули, сборка мусора.', en: 'Types, closures, this, prototypes, modules, garbage collection.' },
    colors: ['#facc15', '#f59e0b'],
    stage: 1,
    docs: [doc('MDN: JavaScript', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript'), spec('ECMAScript specification', 'https://tc39.es/ecma262/')],
  },
  {
    id: 'js-async',
    group: 'language',
    emoji: '🔁',
    title: { ru: 'JavaScript: асинхронность', en: 'JavaScript: async' },
    blurb: { ru: 'Event loop, промисы, async/await, AbortController, воркеры.', en: 'Event loop, promises, async/await, AbortController, workers.' },
    colors: ['#f59e0b', '#ea580c'],
    stage: 3,
    docs: [
      doc('MDN: Using promises', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises'),
      spec('HTML: Event loops', 'https://html.spec.whatwg.org/multipage/webappapis.html#event-loops'),
    ],
  },
  {
    id: 'typescript',
    group: 'language',
    emoji: '🔷',
    title: { ru: 'TypeScript', en: 'TypeScript' },
    blurb: { ru: 'Сужение типов, generics, conditional и mapped types, satisfies.', en: 'Narrowing, generics, conditional and mapped types, satisfies.' },
    colors: ['#3b82f6', '#1d4ed8'],
    stage: 3,
    docs: [
      doc('TypeScript Handbook', 'https://www.typescriptlang.org/docs/handbook/intro.html'),
      doc('TypeScript release notes', 'https://www.typescriptlang.org/docs/handbook/release-notes/overview.html'),
    ],
  },
  {
    id: 'react',
    group: 'frameworks',
    emoji: '⚛️',
    title: { ru: 'React', en: 'React' },
    blurb: { ru: 'Рендер и reconciliation, хуки, Suspense, Actions, React Compiler.', en: 'Rendering and reconciliation, hooks, Suspense, Actions, React Compiler.' },
    colors: ['#22d3ee', '#0ea5e9'],
    stage: 4,
    docs: [doc('react.dev: Learn', 'https://react.dev/learn'), doc('react.dev: API reference', 'https://react.dev/reference/react')],
  },
  {
    id: 'angular',
    group: 'frameworks',
    emoji: '🅰️',
    title: { ru: 'Angular', en: 'Angular' },
    blurb: { ru: 'Signals, zoneless, DI, standalone, RxJS, роутинг, SSR.', en: 'Signals, zoneless, DI, standalone, RxJS, routing, SSR.' },
    colors: ['#f43f5e', '#c026d3'],
    stage: 4,
    docs: [doc('angular.dev: Overview', 'https://angular.dev/overview'), doc('angular.dev: Signals', 'https://angular.dev/guide/signals'), doc('RxJS', 'https://rxjs.dev/guide/overview')],
  },
  {
    id: 'vue',
    group: 'frameworks',
    emoji: '💚',
    title: { ru: 'Vue', en: 'Vue' },
    blurb: { ru: 'Реактивность, Composition API, composables, Vue Router, Pinia.', en: 'Reactivity, Composition API, composables, Vue Router, Pinia.' },
    colors: ['#34d399', '#059669'],
    stage: 4,
    docs: [doc('Vue guide', 'https://vuejs.org/guide/introduction.html'), doc('Vue API', 'https://vuejs.org/api/')],
  },
  {
    id: 'state',
    group: 'app',
    emoji: '🗃️',
    title: { ru: 'Управление состоянием', en: 'State management' },
    blurb: { ru: 'Server state и UI state, Redux Toolkit, TanStack Query, Zustand, MobX, NgRx, Pinia.', en: 'Server vs UI state, Redux Toolkit, TanStack Query, Zustand, MobX, NgRx, Pinia.' },
    colors: ['#8b5cf6', '#ec4899'],
    stage: 5,
    docs: [
      doc('Redux Toolkit', 'https://redux-toolkit.js.org/'),
      doc('TanStack Query', 'https://tanstack.com/query/latest'),
      doc('Zustand', 'https://zustand.docs.pmnd.rs/'),
      doc('Pinia', 'https://pinia.vuejs.org/'),
      doc('NgRx', 'https://ngrx.io/'),
    ],
  },
  {
    id: 'api',
    group: 'app',
    emoji: '🔌',
    title: { ru: 'API и realtime', en: 'APIs & realtime' },
    blurb: { ru: 'REST, GraphQL, WebSocket, SSE, WebRTC: что и когда выбирать.', en: 'REST, GraphQL, WebSocket, SSE, WebRTC: what to pick and when.' },
    colors: ['#10b981', '#14b8a6'],
    stage: 5,
    docs: [
      doc('MDN: WebSocket API', 'https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API'),
      doc('MDN: Server-sent events', 'https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events'),
      doc('GraphQL: Learn', 'https://graphql.org/learn/'),
      doc('MDN: WebRTC API', 'https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API'),
    ],
  },
  {
    id: 'rendering',
    group: 'app',
    emoji: '🖼️',
    title: { ru: 'Архитектуры рендеринга', en: 'Rendering architectures' },
    blurb: { ru: 'CSR, SSR, SSG, ISR, стриминг, гидратация, Server Components.', en: 'CSR, SSR, SSG, ISR, streaming, hydration, Server Components.' },
    colors: ['#6366f1', '#06b6d4'],
    stage: 5,
    docs: [
      doc('web.dev: Rendering on the web', 'https://web.dev/articles/rendering-on-the-web'),
      doc('react.dev: Server Components', 'https://react.dev/reference/rsc/server-components'),
      doc('Next.js docs', 'https://nextjs.org/docs'),
      doc('Nuxt docs', 'https://nuxt.com/docs'),
    ],
  },
  {
    id: 'performance',
    group: 'quality',
    emoji: '🚀',
    title: { ru: 'Производительность', en: 'Performance' },
    blurb: { ru: 'Core Web Vitals (LCP, INP, CLS), бандл, изображения, профилирование.', en: 'Core Web Vitals (LCP, INP, CLS), bundles, images, profiling.' },
    colors: ['#22c55e', '#84cc16'],
    stage: 5,
    docs: [doc('web.dev: Web Vitals', 'https://web.dev/articles/vitals'), doc('web.dev: INP', 'https://web.dev/articles/inp'), doc('web.dev: Learn Performance', 'https://web.dev/learn/performance')],
  },
  {
    id: 'security',
    group: 'quality',
    emoji: '🛡️',
    title: { ru: 'Безопасность', en: 'Security' },
    blurb: { ru: 'XSS, CSRF, CSP, CORS, cookies и хранение токенов.', en: 'XSS, CSRF, CSP, CORS, cookies and token storage.' },
    colors: ['#ef4444', '#f97316'],
    stage: 5,
    docs: [
      doc('MDN: Web security', 'https://developer.mozilla.org/en-US/docs/Web/Security'),
      doc('web.dev: Strict CSP', 'https://web.dev/articles/strict-csp'),
      doc('OWASP Cheat Sheet Series', 'https://cheatsheetseries.owasp.org/'),
    ],
  },
  {
    id: 'testing',
    group: 'quality',
    emoji: '🧪',
    title: { ru: 'Тестирование', en: 'Testing' },
    blurb: { ru: 'Unit, компонентные и e2e-тесты: Vitest, Testing Library, Playwright.', en: 'Unit, component and e2e tests: Vitest, Testing Library, Playwright.' },
    colors: ['#84cc16', '#22c55e'],
    stage: 5,
    docs: [doc('Vitest guide', 'https://vitest.dev/guide/'), doc('Testing Library', 'https://testing-library.com/docs/'), doc('Playwright', 'https://playwright.dev/docs/intro')],
  },
  {
    id: 'tooling',
    group: 'scale',
    emoji: '🛠️',
    title: { ru: 'Инструменты и сборка', en: 'Tooling & builds' },
    blurb: { ru: 'Vite, бандлинг и tree-shaking, монорепо Nx, микрофронтенды.', en: 'Vite, bundling and tree-shaking, Nx monorepos, micro-frontends.' },
    colors: ['#64748b', '#8b5cf6'],
    stage: 5,
    docs: [doc('Vite guide', 'https://vite.dev/guide/'), doc('Nx docs', 'https://nx.dev/getting-started/intro'), doc('Module Federation', 'https://module-federation.io/')],
  },
  {
    id: 'system-design',
    group: 'scale',
    emoji: '🏗️',
    title: { ru: 'Frontend System Design', en: 'Frontend system design' },
    blurb: { ru: 'RADIO: требования, архитектура, модель данных, API, оптимизации.', en: 'RADIO: requirements, architecture, data model, API, optimizations.' },
    colors: ['#ec4899', '#8b5cf6'],
    stage: 5,
    docs: [
      doc('web.dev: Rendering on the web', 'https://web.dev/articles/rendering-on-the-web'),
      doc('ARIA Authoring Practices Guide', 'https://www.w3.org/WAI/ARIA/apg/'),
      doc('web.dev: Learn Performance', 'https://web.dev/learn/performance'),
    ],
  },
]

const byId = new Map(tracks.map((t) => [t.id, t]))
export const getTrack = (id: string) => byId.get(id)
