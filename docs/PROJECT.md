# Frontend Gym: состояние проекта и карта для доработок

Этот файл обновляется в каждом PR. Он отвечает на три вопроса: что уже сделано, где это лежит в коде и как добавить новое, ничего не сломав. План по этапам находится в [PLAN.md](PLAN.md), команды запуска в [README](../README.md).

Последнее обновление: 2026-11-14, этап 8 «Выпуск», все этапы плана завершены: звания, 23 достижения и квесты дня (`src/game/`), уведомления, страница профиля `/profile`, проверенная сборка GitHub Pages без ИИ, README на двух языках.

## Что реализовано

### Этапы плана

| Этап | Статус | PR |
|---|---|---|
| 0. Каркас: i18n, темы, 18 треков с обзорами, API, CI | готово | #3 |
| 1. Контент-инструменты и модуль «JavaScript: основа» | готово | #4 |
| 2. Раннер кода, 12 кодинг-задач, «Что выведет код?» с визуализатором | готово | #5 |
| 3. Платформа и язык: 6 треков | готово: `js-async`, `typescript`, `browser`, `network`, `html`, `css` | #6–#11 |
| 4. React, Angular, Vue (и iframe-раннер компонентов) | уроки `react`, `angular`, `vue` (с проходами покрытия) и 6 компонентных задач React в песочнице готовы; компонентные задачи Vue и Angular не делались | #12–#19 |
| 5. Состояние, API, рендеринг, производительность, безопасность, тесты, инструменты, system design | готово: `state`, `api`, `rendering`, `performance`, `security`, `testing`, `tooling`, `system-design` | #20–#27 |
| 6. Mock-интервью | готово: теория, live-coding, system design | #28 |
| 7. Симулятор инцидентов | готово: движок, 8 сценариев, интерфейс | #29 |
| 8. Выпуск: достижения, GitHub Pages | готово: звания, достижения, квесты дня, профиль, сборка Pages без ИИ проверена, README | #30 |

### Треки

18 треков описаны в `src/content/tracks.ts`, у каждого есть обзор на странице трека (`src/content/overviews.ts`). Полноценные модули (уроки, квиз в каждом уроке, экзамен) есть у всех восемнадцати. Число уроков в треке определяется таблицей покрытия заметок в аудите (все темы из Notion плюс основные вопросы собеседований), а не шаблоном; проход покрытия сделан для JS, React, Angular и Vue:

| Трек | Уроки | Аудит заметок | Кодинг-задачи | «Что выведет» |
|---|---|---|---|---|
| `js-core` | 16 | `docs/content-audit/js-core.md` (там же таблица покрытия страницы «JS» для обоих JS-треков) | 18 | 6 |
| `js-async` | 7 | `docs/content-audit/js-async.md` | 6 | 7 (6 с трассой) |
| `typescript` | 6 | `docs/content-audit/typescript.md` | — | — |
| `browser` | 6 | `docs/content-audit/browser.md` (там же ошибки для `network`, `html`, `rendering`, `react`, `angular`) | 2 (DOM) | — |
| `network` | 6 | `docs/content-audit/network.md` | — | — |
| `html` | 6 | `docs/content-audit/html.md` | — | — |
| `css` | 6 | `docs/content-audit/css.md` | — | — |
| `react` | 15 | `docs/content-audit/react.md` (версии, «Что устарело», таблица покрытия страницы «React») | 6 (компоненты и хуки) | — |
| `angular` | 15 | `docs/content-audit/angular.md` (версии 19–22, «Что устарело», таблица покрытия страницы «Angular») | — | — |
| `vue` | 12 | `docs/content-audit/vue.md` (Vue 3.5, 3.6 RC, Router 5, Pinia 4, таблица покрытия страницы «Vue.js») | — | — |
| `state` | 10 | `docs/content-audit/state.md` (версии RTK 2.14, TanStack Query 5.107, Zustand 5, Jotai 3, MobX 7, XState 5, NgRx 22; таблица покрытия Redux, NgRx и разделов System Design) | — | — |
| `api` | 10 | `docs/content-audit/api.md` (версии MSW 3.0, graphql-js 17, tRPC 11, ws 8, Zod 4; таблица покрытия Server Interaction из React, SSE и gRPC из Browser, API Design из System Design) | — | — |
| `rendering` | 8 | `docs/content-audit/rendering.md` (версии React 19.3, Vue 3.5, Next.js 16.4, Nuxt 4.6, Angular 22, Astro 7, SvelteKit 3; таблица покрытия SSR, Streaming и Hydration из Browser и Architecture из System Design) | — | — |
| `performance` | 9 | `docs/content-audit/performance.md` (Core Web Vitals, web-vitals 6, Lighthouse 13, soft navigations с Chrome 151, `scheduler.yield`; таблица покрытия Optimization из React, FMP и TTI из Browser, Optimizations из System Design) | — | — |
| `security` | 8 | `docs/content-audit/security.md` (OWASP Top 10:2025, Trusted Types во всех браузерах, Sanitizer API, Fetch Metadata, RFC 10017 и BFF, npm trusted publishing, pnpm 11; таблица покрытия Security issues из Angular, eval из JS, Server Actions из React, токены из System Design) | — | — |
| `testing` | 7 | `docs/content-audit/testing.md` (Vitest 5.1, Playwright 1.65, Testing Library 10, Angular 22 на Vitest, axe-core 4.14; таблица покрытия Testing из Angular, Mock servers из React, Accessibility testing из Browser) | — | — |
| `tooling` | 8 | `docs/content-audit/tooling.md` (Vite 8.3 на Rolldown, esbuild 0.28, TypeScript 7, Nx 24, Module Federation 2.9, Angular CLI 22; таблица покрытия страниц Nx и MicroFrontends, Tree-shaking из JS и Angular, Bundle optimization из React, Architecture из System Design) | — | — |
| `system-design` | 8 | `docs/content-audit/system-design.md` (WCAG 2.2, ARIA APG; опора на заметки Notion и плейбук GreatFrontEnd; таблица покрытия страницы System Design) | — | — |

### Режимы

| Режим | Маршрут | Статус |
|---|---|---|
| Уроки с квизом и экзамен модуля | `/learn/:id`, `/track/:id/exam` | готово |
| Кодинг-задачи (редактор, тесты в воркере, разбор, ИИ-ревью) | `/practice/coding`, `/code/:id` | готово |
| Компонентные задачи React (TSX, тесты и превью в песочнице) | те же маршруты | готово |
| DOM-задачи (TypeScript с настоящим DOM в той же песочнице) | те же маршруты | готово |
| Схемы в уроках (Mermaid, лениво, в цветах темы) | блоки ```` ```mermaid ```` в уроках | готово |
| «Что выведет код?» с пошаговым event loop | `/practice/predict`, `/predict/:id` | готово |
| Наставник (вопрос по теме, стрим) | `/api/ask/stream` | только API, кнопки в интерфейсе нет |
| Mock-интервью: теория, live-coding, system design | `/interview`, `/api/interview/turn/stream`, `/api/interview/grade` | готово |
| Симулятор инцидентов (Core Web Vitals, релизы, события, разбор) | `/practice/incidents`, `/incident/:id` | готово |
| Профиль: звания по XP, достижения, квесты дня, уведомления | `/profile`, уведомления на всех страницах | готово |

## Карта кода

| Путь | Что там |
|---|---|
| `src/App.tsx` | Маршруты, все страницы грузятся лениво |
| `src/pages/` | Страницы: `Home`, `TrackPage`, `LessonPage`, `ExamPage`, `CodingListPage`, `CodingTaskPage`, `PredictListPage`, `PredictTaskPage`, `InterviewPage` (выбор, раунд, разбор), `IncidentListPage`, `IncidentPage` (игра и разбор; партия хранится в localStorage), `ProfilePage` (звание, квесты дня, статистика, достижения) |
| `src/interview/` | Mock-интервью: `types.ts` (общие с сервером типы запроса и разбора), `phases.ts` (фазы и их доли времени по форматам, RU/EN), `problems.ts` (10 задач system design: подсказка, скрытые факты, что покрыть, урок для подготовки), `session.ts` (сессия в localStorage, контекст для сервера в языке сессии, ключ результата `interview:<формат>:<id>`), `speech.ts` (Web Speech API: диктовка и озвучка), `DesignBoard.tsx` (холст `@xyflow/react` и заметки RADIO, грузится только в раундах design), `strings.ts` (строки интерфейса интервью: лежат отдельно от главных словарей, чтобы не попадать в первую загрузку) |
| `src/components/` | `Markdown` (рендер уроков, блок вывода), `Diagram` (блоки `mermaid`: Mermaid грузится лениво, тема из токенов `--surface`, `--ink`, `--brand-*`, перерисовка при смене темы, натуральный размер с горизонтальной прокруткой), `Quiz`, `ReadMore` (источники в конце страницы), `CodeEditor` (CodeMirror), `EventLoopViz`, `Layout`, `Settings` |
| `src/content/tracks.ts`, `overviews.ts` | Треки и их обзоры (RU/EN) |
| `src/content/sources.ts` | Список официальных доменов (MDN, спецификации WHATWG, W3C, TC39, RFC, документация фреймворков), тип `Source` и `Verified` |
| `src/content/lessons/` | Метаданные уроков, квизы и экзамены: `js-core.ts`, `react.ts`, `angular.ts` и `vue.ts` (порядок уроков задаёт массив `order`), `js-core-more.ts`, `react-more.ts`, `angular-more.ts` и `vue-more.ts` (уроки прохода покрытия), `js-async.ts`, `typescript.ts`, `browser.ts`, `network.ts`, `html.ts`, `css.ts`, `react.ts`, `angular.ts`, `vue.ts`, `state.ts`, `api.ts`, `rendering.ts`, `performance.ts`, `security.ts`, `testing.ts`, `tooling.ts`, `system-design.ts`; `index.ts` собирает их |
| `content/lessons/<track>/<id>.{ru,en}.md` | Тексты уроков |
| `src/content/coding/` | Кодинг-задачи: тесты, заготовка, эталон; `tasks-core.ts`, `tasks-async.ts`, `tasks-more.ts` (задачи из GFE 75 и LRU), `tasks-dom.ts` (DOM-задачи), `tasks-react.ts` (компонентные); `coding.test.ts` прогоняет эталоны в Node, `coding.dom.test.ts` и `coding.react.test.ts` в jsdom |
| `content/tasks/<id>.{ru,en}.md` | Условие и разбор задачи, разделены строкой `<!-- solution -->` |
| `src/content/predict/` | Задачи «что выведет», `trace.ts` это модель трассы event loop и её проверка |
| `src/content/progress.ts` | Что считается пройденным, XP (интервью: 40 XP за каждый формат и тему с лучшим результатом от 70; инцидент: 35 XP за победу, ключ `incident:<id>`) |
| `src/game/` | Игровой слой, вычисляется только из сохранённых результатов: `game.ts` (5 званий по XP, 23 достижения с прогрессом, пул квестов дня и выбор трёх на день по хэшу даты; квест считает попытки за сегодня), `watcher.ts` (подписка на прогресс после загрузки сохранения: новые достижения, выполненные квесты и повышение звания становятся уведомлениями), `Toaster.tsx` (уведомления в живом регионе; CSS-анимация появления только при `motion-safe`, без библиотеки, чтобы не утяжелять первую загрузку), `strings.ts` (строки профиля) |
| `src/perf/` | Симулятор инцидентов: `types.ts` (страница, ресурсы, взаимодействия, сдвиги, аудитория, сценарий), `engine.ts` (модель: канал по приоритетам, обнаружение ресурсов из HTML, CSS и JS, блокирующие ресурсы, главный поток, CSR, ленивые картинки, шрифты с блокировкой текста; метрики TTFB, FCP, LCP, CLS, INP, TBT; три сегмента аудитории с разбросом, p75 и здоровье как доля пользователей с хорошими LCP, INP и CLS; пороги web.dev), `actions.ts` (26 действий с ценой в часах, описанием и разбором, ловушки, разовые действия, удаление сторонних тегов), `game.ts` (ходы-релизы, бюджет часов, события, журнал, `play` для тестов), `scenarios.ts` (8 сценариев с эталонным планом), `Waterfall.tsx` (водопад загрузки в SVG с таблицей для скринридеров), `strings.ts` (строки симулятора отдельно от главных словарей) |
| `src/runner/` | Раннер тестов: `harness.ts` (работает в воркере, во фрейме и в Node; опции `jsx`, `modules`, `globals`, `afterEach`), `expect.ts`, `clock.ts` (поддельные таймеры), `worker.ts`, `run.ts` (лимит 6 с) |
| `src/runner/react-runtime.ts`, `dom-testing.ts` | Компонентные задачи: модули React для `import`, помощники тестов `render`, `screen` (`getByRole`, `getByText`, `getByLabelText`), `user` (`click`, `type`, `clear`, `keyboard`), `waitFor`, `flush`, `sleep` |
| `src/runner/react-frame.ts`, `run-frame.ts` | Песочница: точка входа фрейма и запуск из страницы (`runInFrame(source, tests, 'react' \| 'dom')`, `mountPreview`) |
| `src/runner/dom-runtime.ts` | DOM-задачи: помощник тестов `html(markup)` возвращает новый контейнер в документе, после теста он удаляется |
| `scripts/build-frame.ts` | Собирает песочницу в `public/runner/react-frame.js` (React внутри, не коммитится); запускается в `pnpm dev` и `pnpm build`, вручную `pnpm build:frame` |
| `src/i18n/` | Словари интерфейса; `ru.ts` задаёт форму, `en.ts` обязан её повторить |
| `src/store.ts` | Прогресс: файл через API и localStorage |
| `src/index.css` | Дизайн-токены, светлая и тёмная темы, цвета подсветки кода |
| `server/` | Hono API: прогресс (`progress.ts`), наставник (`ask.ts`), ревью кода (`review.ts`), интервьюер и комиссия (`interview.ts`: правила по формату и режиму, промпт реплики со скрытыми фактами, кодом или схемой, промпт разбора без скрытых фактов, шесть осей на формат), вызов `claude -p` (`claude.ts`) |
| `scripts/content-checks.ts` | Все проверки контента; `check-content.ts` запускает их из консоли |
| `scripts/snippets.ts`, `typecheck.ts` | Извлечение и запуск примеров из уроков, проверка TypeScript и TSX в памяти (с типами `@types/react`) |
| `scripts/dom-env.mjs` | Глобальные объекты страницы jsdom для режима `dom`; подключается через `node --import`, чтобы появиться раньше импортов примера |
| `scripts/check-snippets.ts` | Быстрая проверка примеров одного файла урока во время написания |
| `scripts/check-diagrams-file.ts`, `parse-diagrams.mjs` | Разбор схем Mermaid в указанных файлах настоящим парсером Mermaid под jsdom; `diagramProblems` в `content-checks.ts` делает то же для всех уроков в CI |
| `scripts/quiz-lengths.ts` | Какие вопросы квизов выдают ответ длиной варианта и какой длины нужны остальные варианты |
| `scripts/check-links.ts` | Проверка, что внешние источники отвечают |
| `docs/content-audit/` | Аудит заметок Notion по трекам: ошибки, исправления, источники |

## Как добавить

### Урок в существующий модуль

1. Метаданные и квиз (4 вопроса на каждом языке) добавить в `src/content/lessons/<track>.ts`, в массив уроков модуля.
2. Тексты положить в `content/lessons/<track>/<id>.ru.md` и `.en.md`. Заголовки только `##`, первый раздел «О чём урок», последний «Главное». Количество разделов и блоков кода в двух языках одинаковое.
3. Примеры кода:
   - ```` ```js run ```` или ```` ```ts run ````, а сразу за ним ```` ```output ````: код выполнится, вывод сравнится с текстом;
   - ```` ```js dom ```` и ```` ```output ````: то же, но на странице jsdom с адресом `https://app.example.com/` (`document`, события, Custom Elements, Shadow DOM, `document.cookie`, `localStorage`, формы и `FormData`; раскладки, стилей, `<dialog>.showModal()` и Popover API нет). Роли и доступные имена считают импортом `dom-accessibility-api` (`getRole`, `computeAccessibleName`); она не знает `<search>` и роль `<header>` внутри `<article>`;
   - ```` ```jsx dom ```` или ```` ```tsx dom ```` и ```` ```output ````: примеры React (19.3, сборка для разработки, поэтому StrictMode повторяет вызовы) на той же странице jsdom. JSX компилируется автоматическим runtime, `IS_REACT_ACT_ENVIRONMENT` включён: пример сам импортирует `act` и `createRoot` и оборачивает рендер и клики в `await act(...)`. Для серверного рендера ```` ```jsx run ```` (Node без DOM: `react-dom/server`, `react-dom/static`);
   - примеры Angular: обычные ```` ```ts run ```` (сигналы, DI, RxJS в Node) и ```` ```ts dom ```` (компоненты, роутер, HttpClient в jsdom). Если код импортирует `@angular/*`, раннер компилирует его в JIT-режиме, как Angular CLI для модульных тестов: TS-программа с трансформом `angularJitApplicationTransform` (иначе компилятор не видит `input()`, `model()`, `output()`), Node заранее загружает `@angular/compiler`, баннер dev-режима убирается. Приложение поднимают `createApplication()` и `app.bootstrap(App)`, ждут `await app.whenStable()` (оно же дожидается `resource`);
   - примеры Vue: ```` ```js run ```` или ```` ```ts run ```` (реактивность, Pinia, `vue/server-renderer`, `vue/compiler-sfc`) и ```` ```js dom ```` (компоненты через `createApp` со строковым шаблоном, Vue Router с `createMemoryHistory`). Шаблоны компилируются во время выполнения: Node-сборка `vue` содержит компилятор. Макросы `<script setup>` (`defineProps`, `defineModel`) показывают обычным блоком ```` ```vue ````, а запускаемый пример пишут тем же API без макросов (`useModel` вместо `defineModel`). В окружении jsdom есть глобальные `history` и `location`; `click()` по чекбоксу в jsdom меняет его и шлёт `change`, только если элемент вставлен в документ (`document.body.append(el)`);
   - примеры трека `state`: библиотеки состояния без фреймворка в Node (`legacy_createStore` и `configureStore` из `@reduxjs/toolkit`, `QueryClient`, `QueryObserver` и `MutationObserver` из `@tanstack/query-core`, `zustand/vanilla`, `jotai/vanilla`, `mobx`, `xstate`). Zustand и контекст в React показывают ```` ```jsx dom ```` с подсчётом рендеров. NgRx SignalStore и сервисы Angular запускаются через `Injector.create({ providers: [Store] })` (сервис с `providedIn: 'root'` тоже надо перечислить в `providers`: это не корневой инжектор). У `QueryClient` в примерах `gcTime: Infinity`, а `staleTime` большой, если пример сам вызывает инвалидацию, иначе исход зависит от скорости машины. Все эти пакеты в `devDependencies`; `zustand` остаётся в `dependencies`, потому что на нём стор приложения;
   - примеры трека `api`: сервер вместо сети даёт MSW 3 (`setupServer` из `msw/node`, обработчики из `msw/http`, `msw/graphql`, `msw/ws`), запросы идут настоящим `fetch` и встроенным в Node.js `WebSocket`; рукопожатие и переподключение показаны на настоящем сервере `ws` с портом `0`; GraphQL на `graphql` и `dataloader`, tRPC на `@trpc/server` и `@trpc/client` с `fetchRequestHandler` вместо HTTP-сервера. Адреса в примерах абсолютные (`https://api.example.com/...`): в Node нет `location`. Ждать событие сокета надо условием (`until(() => ...)` с пределом), а не фиксированной паузой: в CI примеры идут параллельно, и паузы в десятки миллисекунд не хватает;
   - примеры трека `rendering`: серверный рендер React (`renderToString`, `renderToReadableStream`, `prerender` и `resume`) в ```` ```tsx run ````, гидратация и ленивая гидратация Vue в ```` ```tsx dom ```` и ```` ```js dom ```` (сервер и клиент в одном процессе, поэтому для Vue нужна фабрика приложения: `defineAsyncComponent` кэширует загруженный компонент). Пример Vue со стримингом написан на JS: типы `vue/server-renderer` требуют типов Node, которых нет в проверке примеров. Метки в выводе ставят по событию (пришли ли данные), а не по времени;
   - примеры трека `performance`: расчёты метрик (p75, INP с отбрасыванием выбросов, окна сессий CLS, разбивка LCP) на данных без случайности; tree shaking и разбиение кода на `rolldown` (тот же, что внутри Vite 8; модули подставляет маленький плагин из объекта); замер долгой задачи на настоящем цикле событий печатает только сравнения (`>=`, «меньше в три раза»), а не миллисекунды;
   - примеры трека `security`: серверная защита на настоящем Hono через `app.request()` без сети (CSP с nonce из `hono/secure-headers`, проверка `Sec-Fetch-Site` и `Origin`), криптография на Web Crypto (`crypto.subtle`: подписанный CSRF-токен, PKCE со сверкой по тестовому вектору RFC 7636, хэш для SRI), санитизация на DOMPurify в ```` ```js dom ````, экранирование React через `renderToString`, секрет в бандле на `rolldown` с `transform.define`. Случайные значения (nonce, verifier) в вывод не печатаются: только сравнения и длины;
   - примеры трека `testing`: настоящий Vitest запускается из примера через `startVitest` из `vitest/node` на файлах во временной папке `node_modules/.vt-*` (оттуда тестовые файлы находят `vitest`; папку удаляют в конце, `process.exitCode = 0`, вывод `reporters: [{}]` глушится, печатаются состояния тестов). `vi` вне раннера не работает, а `expect` работает. Testing Library, `user-event` и `axe-core` в ```` ```js dom ````. Время в примерах моделируется заданными задержками, а не случайностью;
   - примеры трека `tooling`: настоящие сборщики на модулях из объекта (`rolldown` с плагином `resolveId` и `load`, `esbuild` с `onResolve` и `onLoad`; `sideEffects` пакета передаётся флагом `moduleSideEffects` и `sideEffects`), сборка Vite через `build()` из `vite` с `write: false` во временной папке `node_modules/.vt-*`, компилятор TypeScript (`transpileModule` против `createProgram`), запуск `.ts` в Node во временной папке ОС (Node не убирает типы внутри `node_modules`), настоящий рантайм `@module-federation/runtime` (общий scope хоста передаётся удалённым экземплярам через `initShareScopeMap`, как при инициализации контейнера), `semver`. Метки в строках-маркерах (`'difference '`) переживают минификацию, хэши в именах файлов заменяются на `<hash>`, порядок параллельных хуков в выводе не печатается. Раннер запускает примеры без `NODE_ENV` из окружения Vitest, иначе `vite build` внутри примера оставляет код для разработки. Пример без импортов, тянущих типы Node, начинается с `/// <reference types="node" />`;
   - ```` ```ts check ```` и ```` ```tsx check ````: код должен пройти `tsc --strict` (для TSX с типами React); строку с ожидаемой ошибкой пометить `// @ts-expect-error: пояснение`;
   - в `js run` можно импортировать пакеты из devDependencies: так в уроке CSS специфичность считает `@bramus/specificity`;
   - в примерах React доступны React Router (`createMemoryRouter`, `RouterProvider` из `react-router/dom`), TanStack Query, MSW (`msw/node`), Testing Library (`render`, `screen`, `renderHook`) и `user-event`. Пример с TanStack Query задаёт `gcTime: Infinity`, иначе пятиминутные таймеры кэша не дают процессу завершиться за 10 с;
   - код в RU и EN одинаковый до символа, поэтому комментарии в коде пишутся на английском;
   - ```` ```mermaid ````: схема (flowchart, sequenceDiagram, stateDiagram-v2, mindmap). Подписи на языке урока, поэтому в EN схема пишется своя. Схема должна помещаться примерно в 700 px (колонка урока): цепочки длиннее трёх-четырёх узлов рисовать сверху вниз (`TD`), а не `LR`; не ставить в ряд больше четырёх узлов (у узлов Mermaid есть минимальная ширина); вопросы в скруглённых узлах `([...])`, а не ромбах; переносы `<br/>`; в заметках диаграмм последовательностей без точек с запятой (ломают разбор). Подписи переносятся по ширине 200 px; если схеме нужно шире, её настраивают frontmatter-блоком в начале схемы (`---` / `config:` / `flowchart:` / `wrappingWidth: 340` / `---`), а не глобально. Ширину проверяют в браузере: `svg.getBoundingClientRect().width` у `figure svg[aria-roledescription]`. Схема нужна в каждом уроке, где есть процесс, структура или сравнение.
4. Во время написания: `pnpm tsx scripts/check-snippets.ts content/lessons/<track>/<id>.ru.md`, схемы `pnpm tsx scripts/check-diagrams-file.ts <файлы>`; квизы: `pnpm tsx scripts/quiz-lengths.ts <track>`.
   Английскую версию удобно писать шаблоном с местами под блоки кода из русской: так код в языках совпадает гарантированно.
5. В конце: `pnpm check:content` и `pnpm check:links`.

### Новый модуль трека

1. Файл `src/content/lessons/<track>.ts` с уроками и `Module` (экзамен из 8 вопросов, `pass: 0.75`), подключить в `src/content/lessons/index.ts`.
2. Перед написанием прочитать страницу трека в Notion целиком и вести `docs/content-audit/<track>.md`: «в заметках → на самом деле → источник».
3. Страница трека, прогресс и XP подхватят модуль сами.

### Кодинг-задача

Объект в `src/content/coding/tasks-*.ts` (заготовка, эталон, видимые и скрытые тесты), id в порядке списка в `src/content/coding/index.ts`, тексты в `content/tasks/<id>.{ru,en}.md`. Тесты обязаны: эталон проходит всё, заготовка проваливает хотя бы один тест, оба проходят `tsc --strict`.

### DOM-задача

Объект в `src/content/coding/tasks-dom.ts` с `runtime: 'dom'`: обычный TypeScript, но выполняется в песочнице-iframe с настоящим DOM (в CI в jsdom, `coding.dom.test.ts`). В тестах есть `html(markup)`: разбирает разметку в новый контейнер, добавленный в документ (вычисленные стили работают), и возвращает его. Запрет встроенных методов проверяют скрытым тестом, который временно подменяет их на `Element.prototype`.

### Компонентная задача React

Объект в `src/content/coding/tasks-react.ts` с `runtime: 'react'` и `preview: '<имя экспорта>'`, id в порядке `src/content/coding/index.ts`, тексты в `content/tasks/<id>.{ru,en}.md`.

- Заготовка и эталон это TSX; импортировать можно только `react`, `react-dom`, `react-dom/client`. Экспорт из `preview` (обычно `Demo` с готовыми пропсами) показывается в превью.
- Тесты тоже TSX: в них есть `render`, `screen`, `user`, `waitFor`, `flush`, `sleep`, `expect`, `fn`; после каждого теста всё размонтируется. Элементы ищут как пользователь: по роли и имени, подписи, тексту.
- «Появилось» проверяют через `waitFor`, а не фиксированной паузой: таймеры во фрейме с другим origin браузер может запускать с опозданием. `sleep` и `waitFor` считают реальное время через `MessageChannel`.
- Асинхронный Action, который никогда не завершается, задерживает переходы во всех следующих тестах (React объединяет их с ним): промисы в тестах должны завершаться.
- Заготовка не должна оставлять необработанных отклонений промисов: Vitest считает их ошибкой прогона.
- В CI `coding.react.test.ts` проверяет те же гарантии, что для обычных задач, плюс наличие экспорта для превью.

### Задача «что выведет код»

Объект в `src/content/predict/tasks-*.ts`. Поле `output` сверяется с реальным запуском в Node. Если есть `trace`, её логи должны совпасть с выводом, а шаги подчиняться правилам event loop (см. `foldTrace`).

### Задача system design для интервью

Объект в `src/interview/problems.ts`: `prompt` нарочно расплывчатый, `facts` интервьюер раскрывает только по вопросу, `focus` направляет разбор и проверяется комиссией, `lesson` ведёт на урок для подготовки. Количество пунктов `facts` и `focus` в RU и EN должно совпадать (тест `src/interview/interview.test.ts`). Теория и live-coding берут темы из модулей треков и кодинг-задач сами.

### Сценарий инцидента

Объект в `src/perf/scenarios.ts`: страница (ресурсы, взаимодействия, сдвиги), аудитория, список предлагаемых действий из `src/perf/actions.ts`, события по ходам и эталонный план `solution`. Тест `src/perf/perf.test.ts` проверяет, что без действий сценарий проигрывается, эталонный план выигрывает, ловушки не помогают ни в начале, ни после эталонного плана, а повтор действия не улучшает страницу. Для подбора чисел удобно временно напечатать `measure()` по ходам эталонного плана.

### Достижение или квест

Объект в `src/game/game.ts`. Условие `test` получает `{ results, days }` и не должно читать ничего, кроме них: так достижения и квесты не расходятся с прогрессом и не требуют своего хранения. Квест считает попытки за сегодняшний день (`dayKey` из стора). Без ИИ (`VITE_AI=off`) квест интервью не выдаётся. Тесты в `src/game/game.test.ts`.

### Строки интерфейса

Добавить ключ в `src/i18n/ru.ts` и тот же ключ в `en.ts`: TypeScript не даст забыть перевод.

## Правила контента

- Объяснение целиком на странице; ссылки только в конце, в блоке «Читать подробнее».
- Каждый материал ссылается на официальный источник из `src/content/sources.ts` и хранит дату сверки (`verified`).
- Заметки в Notion это черновик с ошибками: каждое утверждение сверяется с документацией или запуском.
- В квизах правильный ответ не должен выделяться длиной: проверка `quizProblems` падает, если он заметно длиннее остальных. Длину неправильных вариантов подтягивают правдоподобными уточнениями, а не правильный ответ обрезают до бессмыслицы.

## Проверки

| Команда | Что делает |
|---|---|
| `pnpm test` | Vitest: раннер, эталоны задач, контент (паритет языков, источники, ссылки, квизы, запуск примеров, `tsc` для TS-примеров, разбор схем Mermaid, трассы) |
| `pnpm typecheck`, `pnpm lint`, `pnpm build` | Типы, oxlint, сборка |
| `pnpm check:content` | Те же проверки контента с понятным выводом |

Примеры уроков выполняются параллельно (`snippetProblems`, пул по числу ядер, до 20 с на пример). Поэтому пример не должен зависеть от того, успел ли таймер сработать раньше рендера: асинхронность в примерах задают `Promise.withResolvers()` и явным `resolve`, а не короткими `setTimeout`.
| `pnpm check:links` | Все внешние источники отвечают (нужна сеть, в CI не входит) |

## Процесс

- Ветка и PR на каждый блок; PR открываются от аккаунта IGMiller777 (`GH_TOKEN=$(gh auth token --user IGMiller777) gh pr create …`), push идёт через SSH-алиас `github-personal`.
- Перед новой веткой проверить, что предыдущий PR действительно смержен; если нет, ветка строится поверх него, и это пишется в описании PR.
- После проверки в браузере удалить свои тестовые результаты из `data/frontend-gym.json`.
- Этот файл обновляется в том же PR, что и изменения.

## Известные ограничения

- Чанк страницы задачи около 519 КБ (CodeMirror). Страница интервью около 47 КБ, холст system design около 164 КБ (`@xyflow/react`), оба грузятся лениво; первая загрузка с этапом 6 выросла на сотни байт.
- Главный чанк около 1206 КБ без шага `build-frame` (1217 КБ после `pnpm build`): Rolldown перенёс в него общие модули React, роутера и стора, которые раньше лежали отдельным чанком первой загрузки, поэтому сумма первой загрузки почти не изменилась (около 1207 КБ). В главном чанке метаданные всех уроков, квизы, экзамены и данные задач (для XP в шапке и списков). На `main` до прохода покрытия JS было около 642 КБ. Тексты уроков и Mermaid (около 100 КБ) грузятся лениво. Вынести квизы и задачи в ленивые чанки стоит отдельной задачей.
- Песочница компонентов: `<iframe sandbox="allow-scripts allow-forms">` без `allow-same-origin`, у фрейма непрозрачный origin, доступа к странице, `localStorage` и cookies нет. Страница сама скачивает бандл и передаёт код во фрейм через `postMessage`, поэтому из фрейма не уходит ни одного запроса (встроенный браузер Claude такие запросы блокирует). Отправка формы без `preventDefault` не уводит фрейм, а пишет предупреждение в консоль задачи.
- В песочнице production-сборка React: предупреждения разработки (ключи, `act`) там не появляются; в CI задачи идут на dev-сборке в jsdom.
- Бесконечный цикл в компоненте: тайм-аут 6 с сработает, только если браузер выполняет фрейм в отдельном процессе; иначе вкладка зависнет, как от бесконечного цикла на обычной странице. Логические задачи без DOM по-прежнему идут в Web Worker и от этого защищены. Vue-задачи пока не сделаны.
- В jsdom нет раскладки: размеры элементов в примерах всегда 0, поэтому измерения в `useLayoutEffect` объясняются текстом, а не примером.
- Проверка TS-примеров использует API TypeScript 6.0: у TypeScript 7 пока нет совместимого JS API.
