import type { Source } from '../sources'
import type { Lesson, Module } from './types'

const src = (title: string, url: string): Source => ({ title, url, kind: 'official' })
const vite = (title: string, path: string) => src(`Vite: ${title}`, `https://vite.dev/${path}`)
const nx = (title: string, path: string) => src(`Nx: ${title}`, `https://nx.dev/docs/${path}`)
const mf = (title: string, path: string) => src(`Module Federation: ${title}`, `https://module-federation.io/${path}`)
const verified = { date: '2026-11', version: 'Vite 8.3, Rolldown 1.2, esbuild 0.28, TypeScript 7.0, Nx 24, Module Federation 2.9, Angular 22' }

export const toolingLessons: Lesson[] = [
  {
    id: 'tool-build',
    track: 'tooling',
    emoji: '🏭',
    minutes: 12,
    title: { ru: 'Что делает сборка', en: 'What a build does' },
    summary: {
      ru: 'Шаги сборки от разрешения импортов до хэшей, хуки плагинов, зачем бандл при ES-модулях, разработка и продакшен, сборщики 2026 года.',
      en: 'Build steps from resolving imports to hashes, plugin hooks, why a bundle with ES modules, development and production, bundlers in 2026.',
    },
    quiz: {
      ru: [
        { q: 'Что делает хук `resolveId`?', options: ['Удаляет типы', 'Находит файл по импорту', 'Минифицирует чанк', 'Пишет файлы на диск'], correct: 1, why: 'Строку `./greet` или `react` он превращает в путь к модулю.' },
        { q: 'Зачем бандл, если браузеры понимают ES-модули?', options: ['Водопад импортов и размер', 'Браузеры не знают `import`', 'Для поддержки HTTP/1', 'Без бандла не работает CSS'], correct: 0, why: 'Глубокий граф даёт цепочку запросов, а сжатие и tree shaking лучше на бандле.' },
        { q: 'Что Vite 8 использует для сборки?', options: ['Rollup и esbuild', 'webpack 5', 'Turbopack', 'Rolldown и Oxc'], correct: 3, why: 'С Vite 8 один сборщик в разработке и в продакшене.' },
        { q: 'Верно ли, что «webpack мёртв»?', options: ['Да, он больше не выходит', 'Да, его удалили из npm', 'Нет, он поддерживается', 'Да, его заменил Rollup'], correct: 2, why: 'webpack 5 выходит и работает во многих проектах; Rspack совместим с ним.' },
      ],
      en: [
        { q: 'What does the `resolveId` hook do?', options: ['Strips types from a file', 'Finds a file for an import', 'Minifies a whole chunk', 'Writes the files to disk'], correct: 1, why: 'It turns `./greet` or `react` into a module path.' },
        { q: 'Why a bundle when browsers understand ES modules?', options: ['Import waterfall and size', 'Browsers lack `import`', 'For HTTP/1 support', 'CSS fails without it'], correct: 0, why: 'A deep graph gives a chain of requests, and compression and tree shaking work better on a bundle.' },
        { q: 'What does Vite 8 build with?', options: ['Rollup and esbuild', 'webpack 5', 'Turbopack', 'Rolldown and Oxc'], correct: 3, why: 'Since Vite 8 there is one bundler in development and production.' },
        { q: 'Is it true that "webpack is dead"?', options: ['Yes, no new releases', 'Yes, removed from npm', 'No, it is maintained', 'Yes, Rollup replaced it'], correct: 2, why: 'webpack 5 keeps shipping and runs in many projects; Rspack is compatible with it.' },
      ],
    },
    sources: [
      src('Rolldown: Why do we still need bundlers?', 'https://rolldown.rs/in-depth/why-bundlers'),
      src('Rolldown: Plugin API', 'https://rolldown.rs/apis/plugin-api'),
      vite('Vite 8.0 is out!', 'blog/announcing-vite8'),
      src('MDN: importmap', 'https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap'),
      src('Rspack: Introduction', 'https://rspack.rs/guide/start/introduction'),
      src('Next.js 16', 'https://nextjs.org/blog/next-16'),
      src('angular.dev: Angular application build system', 'https://angular.dev/tools/cli/build-system-migration'),
    ],
    verified,
  },
  {
    id: 'tool-vite',
    track: 'tooling',
    emoji: '⚡',
    minutes: 12,
    title: { ru: 'Vite: разработка и сборка', en: 'Vite: development and build' },
    summary: {
      ru: 'Сервер разработки без бандла, предварительная сборка зависимостей, HMR, переменные VITE_, плагины и виртуальные модули, build, preview и режим библиотеки.',
      en: 'A dev server without a bundle, dependency pre-bundling, HMR, VITE_ variables, plugins and virtual modules, build, preview and library mode.',
    },
    quiz: {
      ru: [
        { q: 'Почему сервер Vite стартует быстро на большом проекте?', options: ['Кэширует весь бандл', 'Собирает в несколько потоков', 'Модули по запросу, без бандла', 'Не обрабатывает TypeScript'], correct: 2, why: 'Обрабатывается только то, что браузер запросил.' },
        { q: 'Зачем предварительная сборка зависимостей?', options: ['CommonJS в ESM, меньше запросов', 'Проверить типы всех пакетов', 'Убрать лицензии из пакетов', 'Сжать пакеты в Brotli заранее'], correct: 0, why: 'Например, 600 модулей `lodash-es` становятся одним файлом.' },
        { q: 'Что из `.env` попадёт в клиентский код?', options: ['Все переменные из файла', 'Только из `.env.local`', 'Ничего из этих файлов', 'Только с префиксом `VITE_`'], correct: 3, why: 'И попадёт как текст в бандле, поэтому секретам там не место.' },
        { q: 'Что такое `vite preview`?', options: ['Продакшен-сервер для `dist`', 'Локальный просмотр `dist`', 'Сервер для рендера SSR', 'Режим горячей замены'], correct: 1, why: 'Он нужен, чтобы проверить сборку, в проде `dist` отдаёт CDN.' },
      ],
      en: [
        { q: 'Why does the Vite server start fast on a large project?', options: ['It caches the whole bundle', 'It builds on many threads', 'Modules on request, no bundle', 'It skips TypeScript'], correct: 2, why: 'Only what the browser requested gets processed.' },
        { q: 'Why pre-bundle dependencies?', options: ['CommonJS to ESM, fewer requests', 'To check package types', 'To strip package licenses', 'To compress them with Brotli'], correct: 0, why: 'For example, the 600 modules of `lodash-es` become one file.' },
        { q: 'What from `.env` gets into client code?', options: ['Every variable in it', 'Only from `.env.local`', 'Nothing from these files', 'Only the `VITE_` prefix'], correct: 3, why: 'And it gets there as text in the bundle, so secrets do not belong there.' },
        { q: 'What is `vite preview`?', options: ['A production server', 'A local view of `dist`', 'A server for SSR', 'The HMR mode'], correct: 1, why: 'It is for checking the build; in production a CDN serves `dist`.' },
      ],
    },
    sources: [
      vite('Why Vite', 'guide/why'),
      vite('Dependency Pre-Bundling', 'guide/dep-pre-bundling'),
      vite('Env Variables and Modes', 'guide/env-and-mode'),
      vite('Plugin API', 'guide/api-plugin'),
      vite('HMR API', 'guide/api-hmr'),
      vite('Building for Production', 'guide/build'),
    ],
    verified,
  },
  {
    id: 'tool-tree-shaking',
    track: 'tooling',
    emoji: '🌳',
    minutes: 13,
    title: { ru: 'Tree shaking в деталях', en: 'Tree shaking in depth' },
    summary: {
      ru: 'Как сборщик решает, что выбросить: побочные эффекты, PURE-аннотация, sideEffects и barrel-файлы, объекты и классы; проверка на Rolldown и esbuild.',
      en: 'How a bundler decides what to drop: side effects, the PURE annotation, sideEffects and barrel files, objects and classes; checked on Rolldown and esbuild.',
    },
    quiz: {
      ru: [
        { q: 'В модуле `console.log` наверху. Что останется от неиспользуемых экспортов?', options: ['Весь модуль целиком', 'Только `console.log`', 'Ничего, даже лог', 'Все экспорты модуля'], correct: 1, why: 'Остаётся сам эффект, неиспользуемые экспорты удаляются.' },
        { q: 'Что делает `/*#__PURE__*/` перед вызовом?', options: ['Ускоряет выполнение', 'Запрещает минификацию', 'Обещает, что эффекта нет', 'Делает вызов ленивым'], correct: 2, why: 'Если результат не нужен, сборщик удалит вызов.' },
        { q: 'Что не удаляется tree shaking?', options: ['Неиспользуемая функция', 'Неиспользуемый `const`', 'Неиспользуемый реэкспорт', 'Неиспользуемый метод класса'], correct: 3, why: 'Обращение к методу может быть вычислено во время выполнения.' },
        { q: 'Что даёт `"sideEffects": false` в `package.json`?', options: ['Удаление ненужных модулей', 'Запрет `console.log`', 'Сборку в CommonJS', 'Отключение tree shaking'], correct: 0, why: 'Модуль, из которого ничего не используется, выбрасывается целиком.' },
      ],
      en: [
        { q: 'A module has `console.log` at the top. What stays of its unused exports?', options: ['The whole module', 'Only the `console.log`', 'Nothing, not even the log', 'All of its exports'], correct: 1, why: 'The effect itself stays; unused exports are removed.' },
        { q: 'What does `/*#__PURE__*/` before a call do?', options: ['Speeds up execution', 'Forbids minification', 'Promises no side effect', 'Makes the call lazy'], correct: 2, why: 'If the result is not needed, the bundler removes the call.' },
        { q: 'What does tree shaking not remove?', options: ['An unused function', 'An unused `const`', 'An unused re-export', 'An unused class method'], correct: 3, why: 'Access to a method may be computed at run time.' },
        { q: 'What does `"sideEffects": false` in `package.json` give?', options: ['Dropping unneeded modules', 'A ban on `console.log`', 'A CommonJS build', 'Disabled tree shaking'], correct: 0, why: 'A module from which nothing is used is dropped entirely.' },
      ],
    },
    sources: [
      src('MDN: Tree shaking', 'https://developer.mozilla.org/en-US/docs/Glossary/Tree_shaking'),
      src('webpack: Tree Shaking', 'https://webpack.js.org/guides/tree-shaking/'),
      src('esbuild: Tree shaking', 'https://esbuild.github.io/api/#tree-shaking'),
      src('web.dev: Reduce JavaScript payloads with tree shaking', 'https://web.dev/articles/reduce-javascript-payloads-with-tree-shaking'),
    ],
    verified,
  },
  {
    id: 'tool-chunks',
    track: 'tooling',
    emoji: '🧩',
    minutes: 12,
    title: { ru: 'Чанки, хэши и деплой', en: 'Chunks, hashes and deployment' },
    summary: {
      ru: 'Чанки входа, динамические, общие и ручные группы, цепочка изменений хэшей, предзагрузка, source map и манифест, старые чанки после деплоя.',
      en: 'Entry, dynamic, shared chunks and manual groups, the chain of hash changes, preloading, source maps and the manifest, old chunks after a deploy.',
    },
    quiz: {
      ru: [
        { q: 'Изменился листовой модуль. У каких файлов сменится хэш?', options: ['Только у самого модуля', 'У каждого чанка сборки', 'У него и его импортёров', 'Ни у одного из файлов'], correct: 2, why: 'Импортирующие файлы содержат его новое имя, и так до входа.' },
        { q: 'Зачем выносить библиотеки в `vendor`?', options: ['Кэш переживает релизы', 'Меньше общий размер', 'Нужно для tree shaking', 'Иначе не работает HMR'], correct: 0, why: 'Пока зависимость не обновилась, имя файла не меняется.' },
        { q: 'Что значит `build.sourcemap: \'hidden\'`?', options: ['Карт нет вообще', 'Карты встроены в код', 'Карты только в разработке', 'Карты есть, ссылки нет'], correct: 3, why: 'Карты загружают в сервис ошибок, пользователям их не отдают.' },
        { q: 'Откуда «Failed to fetch dynamically imported module» после деплоя?', options: ['Ошибка в Vite', 'Старые чанки удалены', 'Кончился кэш браузера', 'Ошибка в `index.html`'], correct: 1, why: 'Открытая вкладка запрашивает чанк прошлого релиза.' },
      ],
      en: [
        { q: 'A leaf module changed. Which files get a new hash?', options: ['Only the module itself', 'Every chunk in the build', 'It and its importers', 'None of the files'], correct: 2, why: 'Importing files contain its new name, and so on up to the entry.' },
        { q: 'Why move libraries into `vendor`?', options: ['Its cache survives releases', 'A smaller total size', 'Tree shaking needs it', 'HMR fails otherwise'], correct: 0, why: 'Until a dependency is updated, the file name does not change.' },
        { q: 'What does `build.sourcemap: \'hidden\'` mean?', options: ['No maps at all', 'Maps inlined in code', 'Maps only in development', 'Maps exist, no link'], correct: 3, why: 'Maps are uploaded to an error service and not served to users.' },
        { q: 'Where does "Failed to fetch dynamically imported module" after a deploy come from?', options: ['A bug in Vite', 'Old chunks were deleted', 'The browser cache expired', 'A bug in `index.html`'], correct: 1, why: 'An open tab requests a chunk from the previous release.' },
      ],
    },
    sources: [
      vite('Building for Production: Load Error Handling', 'guide/build'),
      vite('Features: Async Chunk Loading Optimization', 'guide/features'),
      vite('Build Options', 'config/build-options'),
      vite('Backend Integration', 'guide/backend-integration'),
      src('Rolldown: Manual Code Splitting', 'https://rolldown.rs/in-depth/manual-code-splitting'),
      src('web.dev: Prevent unnecessary network requests with the HTTP Cache', 'https://web.dev/articles/http-cache'),
    ],
    verified,
  },
  {
    id: 'tool-code-quality',
    track: 'tooling',
    emoji: '🧹',
    minutes: 12,
    title: { ru: 'TypeScript, линтеры и форматтеры', en: 'TypeScript, linters and formatters' },
    summary: {
      ru: 'Удаление типов против проверки, настройки tsconfig для сборщиков, TypeScript 7 и .ts в Node.js, преобразование JSX, ESLint 10, Oxlint, Biome, Prettier, где запускать проверки.',
      en: 'Stripping types versus checking them, tsconfig settings for bundlers, TypeScript 7 and .ts in Node.js, the JSX transform, ESLint 10, Oxlint, Biome, Prettier, where to run checks.',
    },
    quiz: {
      ru: [
        { q: 'Почему Vite собирает файл с ошибкой типа?', options: ['Ошибки типов только в тестах', 'Он убирает типы без проверки', 'Он пропускает файлы `.ts`', 'Ошибку исправляет Oxc'], correct: 1, why: 'Удаление типов идёт по файлу; проверяет `tsc --noEmit`.' },
        { q: 'Что запрещает `erasableSyntaxOnly`?', options: ['Импорты только типов', 'Обобщённые типы и `infer`', 'Аннотации `any` и `unknown`', '`enum` и код из типов'], correct: 3, why: 'Остаётся только синтаксис, который можно просто стереть.' },
        { q: 'Что изменилось в TypeScript 7?', options: ['Компилятор на Go, быстрее', 'Новый синтаксис типов', 'Убрали `interface`', 'Только строгий режим'], correct: 0, why: 'Тот же язык, проверка обычно в 8–12 раз быстрее.' },
        { q: 'Что удалено в ESLint 10?', options: ['Система плагинов', 'Правила для React', 'Конфигурация `.eslintrc`', 'Поддержка TypeScript'], correct: 2, why: 'Осталась только плоская конфигурация `eslint.config.js`.' },
      ],
      en: [
        { q: 'Why does Vite build a file with a type error?', options: ['Type errors are for tests', 'It strips types unchecked', 'It skips `.ts` files', 'Oxc fixes the error'], correct: 1, why: 'Type stripping is per file; `tsc --noEmit` does the checking.' },
        { q: 'What does `erasableSyntaxOnly` forbid?', options: ['Type-only imports', 'Generic types and `infer`', '`any` and `unknown` notes', '`enum`, code from types'], correct: 3, why: 'Only syntax that can simply be erased remains.' },
        { q: 'What changed in TypeScript 7?', options: ['A Go compiler, faster', 'New type syntax', '`interface` was removed', 'Strict mode only'], correct: 0, why: 'The same language, checking usually 8–12 times faster.' },
        { q: 'What was removed in ESLint 10?', options: ['The plugin system', 'Rules for React', 'The `.eslintrc` config', 'TypeScript support'], correct: 2, why: 'Only the flat config `eslint.config.js` remains.' },
      ],
    },
    sources: [
      src('TypeScript: TSConfig Reference', 'https://www.typescriptlang.org/tsconfig/'),
      src('Announcing TypeScript 7.0', 'https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/'),
      src('Node.js: Modules: TypeScript', 'https://nodejs.org/api/typescript.html'),
      src('TypeScript: JSX', 'https://www.typescriptlang.org/docs/handbook/jsx.html'),
      src('ESLint v10.0.0 released', 'https://eslint.org/blog/2026/02/eslint-v10.0.0-released/'),
      src('Oxc: Linter', 'https://oxc.rs/docs/guide/usage/linter'),
      src('Biome', 'https://biomejs.dev/'),
      src('Prettier: Docs', 'https://prettier.io/docs/'),
    ],
    verified,
  },
  {
    id: 'tool-monorepo',
    track: 'tooling',
    emoji: '🗂️',
    minutes: 13,
    title: { ru: 'Монорепозиторий и Nx', en: 'Monorepos and Nx' },
    summary: {
      ru: 'Монорепозиторий против polyrepo, workspaces, граф проектов, affected, кэш задач и конвейер, границы модулей, типы библиотек, Nx и Turborepo.',
      en: 'A monorepo versus a polyrepo, workspaces, the project graph, affected, the task cache and pipeline, module boundaries, library types, Nx and Turborepo.',
    },
    quiz: {
      ru: [
        { q: 'Что входит в хэш задачи Nx?', options: ['Только дата и время коммита', 'Файлы, хэши зависимостей, команда', 'Имя ветки и автор коммита', 'Только поля `package.json`'], correct: 1, why: 'Совпал хэш, и результат берётся из кэша.' },
        { q: 'Как `affected` работает в Nx 24 по умолчанию?', options: ['По проектам целиком', 'По всем проектам сразу', 'По задачам', 'Только по тестам'], correct: 2, why: 'Изменился только тест: запустится `test`, а `build` нет.' },
        { q: 'Что значит `dependsOn: ["^build"]`?', options: ['Сначала собрать зависимости', 'Собрать только этот проект', 'Пропустить кэш', 'Запустить после тестов'], correct: 0, why: 'Знак `^` означает «у зависимостей проекта».' },
        { q: 'Какая библиотека не должна знать про стор?', options: ['feature', 'app', 'data-access', 'ui'], correct: 3, why: '`ui` только презентационные компоненты, зависимости идут вниз.' },
      ],
      en: [
        { q: 'What goes into an Nx task hash?', options: ['Only the commit date and time', 'Files, dependency hashes, command', 'The branch and the commit author', 'Only the `package.json` fields'], correct: 1, why: 'If the hash matches, the result comes from the cache.' },
        { q: 'How does `affected` work in Nx 24 by default?', options: ['By whole project', 'Across all projects', 'By task', 'Only for tests'], correct: 2, why: 'Only a test changed: `test` runs, `build` does not.' },
        { q: 'What does `dependsOn: ["^build"]` mean?', options: ['Build dependencies first', 'Build only this project', 'Skip the cache', 'Run after the tests'], correct: 0, why: 'The `^` means "of the project\'s dependencies".' },
        { q: 'Which library must know nothing about the store?', options: ['feature', 'app', 'data-access', 'ui'], correct: 3, why: '`ui` is presentational components only; dependencies go downward.' },
      ],
    },
    sources: [
      nx('Monorepo vs Polyrepo', 'kb/monorepo-vs-polyrepo'),
      nx('Run Only Tasks Affected by a PR', 'features/ci-features/affected'),
      nx('Cache Task Results', 'features/cache-task-results'),
      nx('Defining a Task Pipeline', 'kb/defining-task-pipeline'),
      nx('Enforce Module Boundaries', 'features/enforce-module-boundaries'),
      nx('Monorepo Folder Structure', 'kb/folder-structure'),
      src('Nx 24 release', 'https://nx.dev/blog/nx-24-release'),
      src('pnpm: Workspace', 'https://pnpm.io/workspaces'),
      src('Turborepo: Docs', 'https://turborepo.com/docs'),
    ],
    verified,
  },
  {
    id: 'tool-microfrontends',
    track: 'tooling',
    emoji: '🧱',
    minutes: 13,
    title: { ru: 'Микрофронтенды', en: 'Micro-frontends' },
    summary: {
      ru: 'Когда нужны и когда нет, способы композиции, Module Federation 2.0, общие зависимости и singleton на настоящем рантайме, стили, общение частей, отказоустойчивость.',
      en: 'When they are needed and when not, composition options, Module Federation 2.0, shared dependencies and singleton on the real runtime, styles, communication, resilience.',
    },
    quiz: {
      ru: [
        { q: 'Какую проблему прежде всего решают микрофронтенды?', options: ['Медленный первый показ', 'Большой размер бандла', 'Сложный CSS', 'Команды блокируют релизы'], correct: 3, why: 'Это организационное решение: независимый деплой частей.' },
        { q: 'Два приложения на React 19 и 18 без `singleton`. Что будет?', options: ['Две копии React', 'Одна копия React 19', 'Ошибка загрузки', 'Одна копия React 18'], correct: 0, why: 'Несовместимые диапазоны дают каждому свою копию.' },
        { q: 'Что даёт `singleton: true` при несовместимых версиях?', options: ['Ошибку при загрузке', 'Две копии библиотеки', 'Одну копию и предупреждение', 'Откат на старую версию'], correct: 2, why: 'Ошибкой это станет только со `strictVersion: true`.' },
        { q: 'Как частям лучше общаться между собой?', options: ['Через общий глобальный стор', 'События и URL', 'Через `window.app`', 'Через `localStorage`'], correct: 1, why: 'Маленький явный контракт не связывает команды.' },
      ],
      en: [
        { q: 'What problem do micro-frontends solve first of all?', options: ['A slow first render', 'A large JS bundle', 'Complex shared CSS', 'Teams blocking releases'], correct: 3, why: 'It is an organizational decision: independent deployment of parts.' },
        { q: 'Two apps on React 19 and 18 without `singleton`. What happens?', options: ['Two copies of React', 'One copy of React 19', 'A loading error', 'One copy of React 18'], correct: 0, why: 'Incompatible ranges give each app its own copy.' },
        { q: 'What does `singleton: true` give with incompatible versions?', options: ['A loading error', 'Two copies', 'One copy and a warning', 'A fallback to the old one'], correct: 2, why: 'It becomes an error only with `strictVersion: true`.' },
        { q: 'How should parts communicate?', options: ['Through a shared global store', 'Events and the URL', 'Through `window.app`', 'Through `localStorage`'], correct: 1, why: 'A small explicit contract does not tie teams together.' },
      ],
    },
    sources: [
      mf('Introduction', 'guide/start/index.html'),
      mf('shared', 'configure/shared.html'),
      src('single-spa: Getting Started', 'https://single-spa.js.org/docs/getting-started-overview'),
      src('MDN: importmap', 'https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap'),
      src('MDN: Using custom elements', 'https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements'),
    ],
    verified,
  },
  {
    id: 'tool-practice',
    track: 'tooling',
    emoji: '🎯',
    minutes: 12,
    title: { ru: 'Инструменты на практике и собеседовании', en: 'Tooling in practice and interviews' },
    summary: {
      ru: 'Semver и диапазоны, lock-файл и обновления, библиотека как пакет и Changesets, Angular CLI и бюджеты, что делать с выросшим бандлом и медленным CI.',
      en: 'Semver and ranges, the lockfile and updates, a library as a package and Changesets, Angular CLI and budgets, what to do with a grown bundle and a slow CI.',
    },
    quiz: {
      ru: [
        { q: 'Какие версии разрешает `~1.4.2`?', options: ['Только 1.4.2', '1.4.x от 1.4.2', 'Любые 1.x', 'Любые версии'], correct: 1, why: '`~` разрешает только patch-обновления.' },
        { q: 'Подходит ли 0.5.0 под `^0.4.2`?', options: ['Нет: до 1.0 `^` как `~`', 'Да, это minor-версия', 'Да, это patch-версия', 'Только с флагом `--force`'], correct: 0, why: 'До 1.0 каждый minor считается ломающим.' },
        { q: 'Почему React в `peerDependencies` библиотеки?', options: ['Так быстрее установка', 'Иначе не работает JSX', 'Так требует npm', 'Чтобы не было двух копий'], correct: 3, why: 'Библиотека использует React приложения.' },
        { q: 'Что делать с `ng build --prod` в Angular 22?', options: ['Ничего, флаг работает как раньше', 'Добавить флаг `--aot` к сборке', 'Убрать флаг: production по умолчанию', 'Перейти обратно на сборку webpack'], correct: 2, why: '`--prod` удалён в Angular 14, `ng build` уже в production.' },
      ],
      en: [
        { q: 'Which versions does `~1.4.2` allow?', options: ['Only 1.4.2', '1.4.x from 1.4.2', 'Any 1.x', 'Any version'], correct: 1, why: '`~` allows patch updates only.' },
        { q: 'Does 0.5.0 match `^0.4.2`?', options: ['No: below 1.0 `^` is `~`', 'Yes, it is a minor update', 'Yes, it is a patch update', 'Only with `--force`'], correct: 0, why: 'Before 1.0 every minor counts as breaking.' },
        { q: 'Why is React in a library\'s `peerDependencies`?', options: ['Faster installation', 'JSX fails otherwise', 'npm requires it', 'To avoid two copies'], correct: 3, why: 'The library uses the app\'s React.' },
        { q: 'What to do with `ng build --prod` in Angular 22?', options: ['Nothing, the flag still works', 'Add the `--aot` flag to it', 'Drop it: production is default', 'Switch back to the webpack build'], correct: 2, why: '`--prod` was removed in Angular 14; `ng build` is already production.' },
      ],
    },
    sources: [
      src('Semantic Versioning 2.0.0', 'https://semver.org/'),
      src('npm: About semantic versioning', 'https://docs.npmjs.com/about-semantic-versioning'),
      src('Node.js: Packages, exports', 'https://nodejs.org/api/packages.html'),
      src('angular.dev: Building Angular apps', 'https://angular.dev/tools/cli/build'),
      src('Storybook: Docs', 'https://storybook.js.org/docs'),
      src('pnpm: install', 'https://pnpm.io/cli/install'),
    ],
    verified,
  },
]

export const toolingModule: Module = {
  track: 'tooling',
  lessons: toolingLessons.map((l) => l.id),
  exam: {
    pass: 0.75,
    questions: {
      ru: [
        { q: 'Плагин в хуке `transform` получил файл `.ts`. Что в нём?', options: ['Уже чистый JavaScript', 'Код с типами', 'Минифицированный код', 'Только AST'], correct: 1, why: 'Встроенное удаление типов идёт после пользовательских плагинов.' },
        { q: 'Что сервер Vite делает с зависимостями при первом запуске?', options: ['Собирает их в ESM заранее', 'Проверяет типы каждого пакета', 'Копирует их в папку `dist`', 'Ничего не делает с ними'], correct: 0, why: 'CommonJS переводится в ESM, много файлов склеиваются в один.' },
        { q: 'Где окажется `import.meta.env.VITE_KEY`?', options: ['Только на сервере', 'В переменных окружения CI', 'В бандле как текст', 'Нигде, он секретный'], correct: 2, why: 'Значения подставляются при сборке.' },
        { q: '`export default { add, sub }`, используется `add`. Что с `sub`?', options: ['Удалён Rolldown', 'Удалён esbuild', 'Удалён обоими', 'Остался в бандле'], correct: 3, why: 'Объект целиком считается используемым.' },
        { q: 'Barrel-файл без `sideEffects`, импорт одного экспорта. Что будет?', options: ['Модули с эффектами останутся', 'Всё лишнее будет удалено', 'Сборка упадёт с ошибкой', 'Импорт станет ленивым'], correct: 0, why: 'Сборщик обязан выполнить модули ради их возможных эффектов.' },
        { q: 'Почему правка одного модуля меняет хэш точки входа?', options: ['Хэш зависит от времени', 'В ней имена чанков с хэшами', 'Vite меняет все хэши', 'Из-за source map'], correct: 1, why: 'Новое имя листа меняет текст всех, кто на него ссылается.' },
        { q: 'Как защититься от 404 на старые чанки после деплоя?', options: ['Отключить хэши', 'Кэшировать HTML на год', 'Хранить старые файлы', 'Убрать `import()`'], correct: 2, why: 'И перезагрузить страницу по `vite:preloadError`.' },
        { q: 'Где искать ошибки типов в Vite-проекте?', options: ['В выводе `vite build`', 'В DevTools браузера', 'В оверлее ошибок HMR', 'В `tsc --noEmit` и редакторе'], correct: 3, why: 'Сборщик типы не проверяет.' },
        { q: 'Почему Node.js 24 не запустил `.ts` с `enum`?', options: ['Удаляет только типы', 'Не поддерживает TypeScript', 'Нужен TypeScript 7', 'Ошибка типов в файле'], correct: 0, why: '`enum` требует генерации кода, а не удаления.' },
        { q: 'Что Nx делает, если хэш задачи совпал с кэшем?', options: ['Запускает задачу заново', 'Берёт результат из кэша', 'Пропускает зависимости', 'Сообщает об ошибке'], correct: 1, why: 'Удалённый кэш делает это и для коллег, и для CI.' },
        { q: 'Какой импорт запретит правило границ?', options: ['`feature` из `ui`', '`ui` из библиотеки `util`', '`data-access` из `feature`', '`app` из `feature`'], correct: 2, why: 'Зависимости идут только вниз по слоям.' },
        { q: 'Когда микрофронтенды не нужны?', options: ['Команды не мешают друг другу', 'Больше 10 разработчиков', 'Разные домены продукта', 'Нужен независимый деплой'], correct: 0, why: 'Хватит монорепозитория с границами модулей.' },
        { q: 'Что делает `strictVersion: true` у singleton?', options: ['Загружает две копии', 'Выбирает старую версию', 'Только предупреждает', 'Даёт ошибку загрузки'], correct: 3, why: 'Без него несовместимость только предупреждение.' },
        { q: 'Что гарантирует одинаковые версии на всех машинах?', options: ['Диапазоны `^`', 'Lock-файл', 'Поле `engines`', 'Файл `.npmrc`'], correct: 1, why: 'Диапазон говорит, что можно поставить, lock-файл что поставлено.' },
      ],
      en: [
        { q: 'A plugin got a `.ts` file in the `transform` hook. What is in it?', options: ['Plain JavaScript already', 'Code with types', 'Minified code', 'Only an AST'], correct: 1, why: 'Built-in type stripping runs after user plugins.' },
        { q: 'What does the Vite server do with dependencies on the first run?', options: ['Pre-bundles them into ESM', 'Checks their types', 'Copies them to `dist`', 'Nothing at all'], correct: 0, why: 'CommonJS becomes ESM, many files are merged into one.' },
        { q: 'Where does `import.meta.env.VITE_KEY` end up?', options: ['Only on the server', 'In CI environment variables', 'In the bundle as text', 'Nowhere, it is secret'], correct: 2, why: 'Values are substituted at build time.' },
        { q: '`export default { add, sub }`, `add` is used. What about `sub`?', options: ['Removed by Rolldown', 'Removed by esbuild', 'Removed by both', 'Kept in the bundle'], correct: 3, why: 'The whole object counts as used.' },
        { q: 'A barrel without `sideEffects`, one export imported. What happens?', options: ['Modules with effects stay', 'All extra code is removed', 'The build fails', 'The import becomes lazy'], correct: 0, why: 'The bundler must run the modules for their possible effects.' },
        { q: 'Why does editing one module change the entry point hash?', options: ['The hash depends on time', 'It has hashed chunk names', 'Vite changes all hashes', 'Because of source maps'], correct: 1, why: 'A leaf\'s new name changes the text of everyone referring to it.' },
        { q: 'How do you avoid 404s for old chunks after a deploy?', options: ['Turn off hashes', 'Cache HTML for a year', 'Keep the old files', 'Remove `import()`'], correct: 2, why: 'And reload the page on `vite:preloadError`.' },
        { q: 'Where do you find type errors in a Vite project?', options: ['In the `vite build` output', 'In the browser DevTools', 'In the HMR error overlay', 'In `tsc --noEmit`, the editor'], correct: 3, why: 'The bundler does not check types.' },
        { q: 'Why did Node.js 24 not run a `.ts` file with `enum`?', options: ['It only strips types', 'It lacks TypeScript support', 'It needs TypeScript 7', 'A type error in the file'], correct: 0, why: '`enum` needs code generation, not erasure.' },
        { q: 'What does Nx do when a task hash matches the cache?', options: ['Runs the task again', 'Takes the cached result', 'Skips the dependencies', 'Reports an error'], correct: 1, why: 'A remote cache does this for colleagues and CI too.' },
        { q: 'Which import does the boundary rule forbid?', options: ['`feature` from `ui`', '`ui` from the `util` library', '`data-access` from `feature`', '`app` from `feature`'], correct: 2, why: 'Dependencies go only downward through the layers.' },
        { q: 'When are micro-frontends not needed?', options: ['Teams do not block each other', 'More than 10 developers', 'Different product domains', 'Independent deploys needed'], correct: 0, why: 'A monorepo with module boundaries is enough.' },
        { q: 'What does `strictVersion: true` do for a singleton?', options: ['Loads two copies', 'Picks the older version', 'Only warns', 'Gives a loading error'], correct: 3, why: 'Without it an incompatibility is only a warning.' },
        { q: 'What guarantees the same versions on every machine?', options: ['`^` ranges', 'The lockfile', 'The `engines` field', 'The `.npmrc` file'], correct: 1, why: 'A range says what may be installed, the lockfile what is installed.' },
      ],
    },
  },
}
