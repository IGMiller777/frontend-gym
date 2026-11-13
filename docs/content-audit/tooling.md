# Аудит заметок: инструменты и сборка

Источники в Notion: страница «Nx» (преимущества, команды генераторов, `nx graph`, структура `libs/`; прочитана целиком), страница «MicroFrontends» (когда нужны, плюсы, минусы, дублирование зависимостей; прочитана целиком), разделы «Tree-shaking mechanics» и «ESM vs CJS» страницы «JS» (ошибки ESM и CJS уже записаны в `js-core.md`), разделы «Tree Shaking» (два) и «Experimental Webpack 5 Support» страницы «Angular», раздел «Bundle optimization» страницы «React» (lazy, tree shaking, Import Cost, «webpack мёртв», чанки), раздел «Architecture» и «Технологический стек» страницы «System Design» (монорепозиторий против polyrepo, микрофронтенды, дизайн-система, Differential Serving). Отдельных страниц про Vite, источники кода, линтеры и версии пакетов нет: эти темы написаны с нуля.

Утверждения сверены с vite.dev (Vite 8, миграция, предварительная сборка, плагины, сборка), rolldown.rs, esbuild.github.io, nx.dev (Nx 24, affected, кэш, конвейер задач, границы модулей, структура папок), module-federation.io (MF 2.0, `shared`), angular.dev (сборщик `application`, бюджеты), typescriptlang.org и devblogs.microsoft.com (TypeScript 7), nodejs.org (удаление типов), eslint.org (ESLint 10), semver.org и docs.npmjs.com. Примеры выполняются в CI: настоящие Rolldown, esbuild, Vite 8, компилятор TypeScript, рантайм Module Federation и библиотека `semver`.

## Актуальные версии и состояние (ноябрь 2026)

| Что | Версия | Что важно |
|---|---|---|
| Vite | 8.3 (8.0 от 12 марта 2026) | Rolldown и Oxc и в разработке, и в сборке; минификация JS через Oxc, CSS через Lightning CSS; Node.js 20.19+ или 22.12+ |
| Rolldown | 1.3 | API плагинов Rollup; `output.codeSplitting` вместо устаревшего `manualChunks` |
| webpack | 5.112 | Поддерживается |
| Rspack | 2.3 (2.0 от апреля 2026) | Совместим с API webpack |
| Next.js | 16.4 | Turbopack по умолчанию для разработки и сборки |
| Angular CLI | 22.2 | Сборщик `application` на esbuild и Vite по умолчанию с Angular 17 |
| TypeScript | 7.0 (8 июля 2026) | Компилятор на Go, проверка в 8–12 раз быстрее; 6.0 последняя версия на JavaScript |
| Node.js | 24 | Запуск `.ts` удалением типов по умолчанию (с 22.18 и 23.6), без `enum` |
| ESLint | 10.14 | `.eslintrc` удалён, только плоская конфигурация |
| Oxlint, Oxfmt, Biome | 1.93, 0.78, 2.6 | Линтеры и форматтеры на Rust |
| Nx | 24.0 (29 октября 2026) | `affected` по задачам по умолчанию; плагин `@nx/oxlint` с правилом границ |
| Turborepo | 2.11 | `turbo run --affected` |
| Module Federation | 2.9 (`@module-federation/runtime`) | Манифест, рантайм, подсказки типов; webpack, Rspack, Vite, Rsbuild |
| pnpm | 12.18 (переписан на Rust) | В проекте используется 11.7: команды и lock-файл совместимы |

## Найденные ошибки

| Где | В заметках | На самом деле | Источник |
|---|---|---|---|
| JS, Tree-shaking | Код с побочным эффектом наверху модуля (`console.log`) «блокирует весь файл» | Остаётся только сам эффект, неиспользуемые экспорты удаляются; проверено на Rolldown и esbuild | пример `tool-tree-shaking` |
| JS, Tree-shaking | `export default` плохо, `export { App }` хорошо | Плохо не `export default`, а объект со всеми функциями (`export default { add, sub }`): его свойства не удаляются ни Rolldown, ни esbuild; `export default function` удаляется как именованный экспорт | пример `tool-tree-shaking` |
| JS, Tree-shaking | Динамический `import()` «не анализируется» | Деструктуризация `const { add } = await import()` даёт Rolldown удалить лишнее из динамического чанка; esbuild 0.28 оставляет всё. Поведение зависит от сборщика | пример `tool-tree-shaking` |
| JS, Tree-shaking | `"sideEffects": ["*.css"]` с пометкой «❌ только CSS имеет side effects» | Массив это правильная форма: перечисленные файлы сохраняются ради эффекта, остальные можно выбрасывать. С `false` стили пропадут из сборки | [webpack: Tree Shaking](https://webpack.js.org/guides/tree-shaking/) |
| Angular, Tree Shaking | Angular CLI анализирует импорты через webpack | С Angular 17 новые проекты собираются сборщиком `application` на esbuild, сервер разработки на Vite; webpack только в старом сборщике `browser` | [angular.dev: build system](https://angular.dev/tools/cli/build-system-migration) |
| Angular, Tree Shaking | `ng build --prod` и `ng serve --prod` включают AOT и tree shaking | `--prod` устарел в Angular 12 и удалён в Angular 14 («Unknown argument»). `ng build` использует конфигурацию `production` по умолчанию с Angular 12, AOT по умолчанию с Angular 9 | [angular.dev: Building Angular apps](https://angular.dev/tools/cli/build) |
| Angular, Experimental Webpack 5 Support | Раздел о webpack 5 как о будущем сборки | Устарел: Angular перешёл на esbuild и Vite | там же |
| React, Bundle optimization | «Webpack мёртв», проекты на нём «живут в прошлом» | webpack 5 поддерживается (5.112) и работает в огромном числе проектов; Rspack 2 совместим с ним. Новые проекты обычно начинают на Vite или в метафреймворке | [webpack](https://webpack.js.org/concepts/), [Rspack](https://rspack.rs/guide/start/introduction) |
| React, Bundle optimization | Vite «на Rollup + esbuild» | С Vite 8 один сборщик Rolldown и компилятор Oxc (записано и в `js-core.md`) | [Vite 8](https://vite.dev/blog/announcing-vite8) |
| React, Bundle optimization | «Браузер кеширует чанки навсегда», при деплое старые остаются в кэше | Кэш навсегда даёт заголовок `Cache-Control: immutable`, а не хэш в имени. Если деплой удалил файлы прошлого релиза, открытая вкладка получает «Failed to fetch dynamically imported module» | [Vite: Load Error Handling](https://vite.dev/guide/build) |
| React, Лучшие практики | `loader={() => { import('./editor/Editor') }}` у `<Route>` как «preload при hover» | `loader` вызывается при переходе, а не при наведении, и работает только в роутере данных (`createBrowserRouter`); для загрузки кода маршрута есть свойство `lazy` | [React Router: lazy](https://reactrouter.com/start/data/route-object#lazy) |
| MicroFrontends | «В 2026 Rspack с MF 2.0 автоматизирует дедупликацию лучше, чем Webpack» | Правила разделения задаёт одна конфигурация `shared` и один рантайм `@module-federation/runtime`, от сборщика они не зависят. Проверено на рантайме: без `singleton` несовместимые версии дают две копии, с `singleton` одну и предупреждение, со `strictVersion` ошибку | [MF: shared](https://module-federation.io/configure/shared.html) |
| MicroFrontends | Порог «больше 8–10 разработчиков», «больше 500 тысяч строк» | Ориентиры без источника; решает то, блокируют ли команды релизы друг друга. Модульный монолит в монорепозитории часто достаточен | [MF: Introduction](https://module-federation.io/guide/start/index.html) |
| MicroFrontends | «Автономия команд: выбор фреймворка, версии зависимостей» | Технически возможно, но несовместимые версии React на одной странице ломают хуки и контекст; фреймворк и дизайн-систему делят как `singleton` и согласуют мажорные версии | там же |
| Nx | «Centralized state management» как преимущество монорепозитория | К монорепозиторию не относится; в Nx состояние делят по доменам (`data-access` в каждом домене) | [Nx: Folder Structure](https://nx.dev/docs/kb/folder-structure) |
| Nx | Структура `libs/core`, `shared/components`, `shared/pipes`, `state/feature-stores` | Деление по техническому типу; Nx рекомендует группировать по домену, затем по типу (`feature`, `ui`, `data-access`, `util`), иначе границы между доменами не проверить | там же |
| System Design, Optimizations | Differential Serving: ES2020+ современным браузерам, ES5 с полифилами старым через `type="module"` | Устарело: все поддерживаемые браузеры выполняют ES-модули; Vite собирает под Baseline Widely Available (записано и в `performance.md`) | [Vite: migration](https://vite.dev/guide/migration) |

## Покрытие заметок Notion

| Тема в заметках | Где разобрано |
|---|---|
| Tree-shaking mechanics, предусловия, `sideEffects`, антипаттерны | `tool-tree-shaking`; основы в `perf-javascript` |
| ESM и CJS, совместимость | `js-modules`; влияние на сборку в `tool-tree-shaking` |
| Bundler-специфика: Rollup, webpack, esbuild, Parcel, Vite | `tool-build#Сборщики в 2026 году` |
| Отладка tree shaking: анализаторы, Coverage | `tool-practice#Бандл вырос`, `perf-javascript` |
| Angular: AOT, Ivy, `--prod`, webpack 5 | `tool-practice#Angular CLI`, `ng-internals` |
| React: lazy, чанки с хэшем, кэш | `tool-chunks`, `perf-javascript`, `react-performance` |
| Import Cost, выбор лёгких библиотек | `perf-javascript`, `tool-practice` |
| Babel и JSX | `tool-code-quality#JSX` |
| Линтеры (ESLint), source map | `tool-code-quality`, `tool-chunks#Source map и манифест` |
| Nx: преимущества, команды, граф, affected, структура libs | `tool-monorepo` |
| Монорепозиторий против polyrepo | `tool-monorepo#Монорепозиторий или нет` |
| MicroFrontends: когда, плюсы, минусы, дублирование | `tool-microfrontends` |
| Дизайн-система отдельным пакетом, Storybook | `tool-practice#Общая библиотека как пакет` |
| Differential Serving | `perf-javascript#Сборщик и цель сборки` |
| Vite PWA plugin | `browser` (Service Worker); отдельно не разбирается |

Написано с нуля: шаги сборки и хуки плагинов, сервер Vite, HMR, переменные `VITE_`, виртуальные модули, цепочка изменения хэшей, деплой и старые чанки, удаление типов против проверки, TypeScript 7, удаление типов в Node.js, ESLint 10, Oxlint и Biome, workspaces, кэш и конвейер задач Nx, границы модулей, способы композиции микрофронтендов, Module Federation 2.0, semver и lock-файл, Changesets, бюджеты Angular, диагностика выросшего бандла и медленного CI.
