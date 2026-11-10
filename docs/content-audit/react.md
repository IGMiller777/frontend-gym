# Аудит заметок: React

Источник: страница Notion «React» (около 214 тысяч знаков без картинок и ссылок), прочитана целиком. Разделы: React Compiler, JSX, Render Flow, Virtual DOM, Fiber, Reconciliation, Concurrent Rendering, Auto-batching, Transitions, Actions, хуки (правила, useEffect и useLayoutEffect, useState, useReducer, useContext, useMemo и useCallback, кастомные хуки, useRef и useImperativeHandle), оптимизация (виртуализация, lazy, Suspense, бандл, DevTools, Service Worker), SSR, события, формы, роутинг (React Router, Connected React Router), Redux (принципы, connect, actions, reducers, middleware, selectors, Redux Form, альтернативы), компоненты (классовые, props, state, memo, refs, context, порталы, паттерны, жизненный цикл), работа с API и моки, WebSocket, частые ошибки, доступность, StrictMode. Подстраница «React Old» не открывалась: её содержание дублируют разделы основной страницы.

Разделы Redux, Redux Form, работа с API, моки и WebSocket относятся к трекам `state` и `api` (этап 5) и будут сверены там. Service Worker, бандл и доступность уже разобраны в треках `browser`, `network` и `html`.

Утверждения сверены с react.dev (документация, блог, руководство по переходу на React 19), журналом изменений React и React Router. Поведение рендера, эффектов, батчинга, StrictMode, порталов, событий, Actions, Suspense и SSR в уроках проверено запуском примеров на React 19.3.1 в jsdom (режим `jsx dom`) и в Node.js; типы проверены `tsc` с `@types/react` 19.

## Актуальные версии (ноябрь 2026)

| Пакет | Версия | Что важно |
|---|---|---|
| `react`, `react-dom` | 19.3.1 (19.3.0 от 9 сентября 2026) | `<ViewTransition>` стабилен, Fragment refs, `use(browser())`, Trusted Types |
| React 19.2 | октябрь 2025 | `<Activity>`, `useEffectEvent`, `cacheSignal`, Performance Tracks, частичный пререндер (`prerender` + `resume`) |
| React 19.0 | декабрь 2024 | Actions, `useActionState`, `useOptimistic`, `use`, `ref` как проп, `<Context>` как провайдер, метаданные документа |
| `babel-plugin-react-compiler` | 1.0 (октябрь 2025) | Стабильный компилятор, правила линтера в `eslint-plugin-react-hooks` |
| `react-router` | 8.5.1 (8.0 от июня 2026) | Только ESM, нужен React 19.2.7+; пакет `react-router-dom` удалён |
| Create React App | — | Объявлен устаревшим в феврале 2025, вместо него фреймворк или Vite |

## Что устарело

| Было в заметках | Сейчас | Источник |
|---|---|---|
| `forwardRef` обязателен, чтобы передать `ref` в функциональный компонент; `useImperativeHandle` «работает только внутри `forwardRef`» | С React 19 `ref` это обычный проп функционального компонента; `forwardRef` больше не нужен и будет объявлен устаревшим | [React 19: ref as a prop](https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop) |
| `<Context.Provider value>` | Контекст рендерят напрямую: `<Context value>`; читать можно через `use(Context)` | [React 19: Context as a provider](https://react.dev/blog/2024/12/05/react-19#context-as-a-provider) |
| `defaultProps` у функций «устаревает с 18.3», `propTypes` как runtime-проверка | В React 19 `propTypes` молча игнорируются, `defaultProps` у функций удалены (остались у классов); значения по умолчанию задают в параметрах | [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide) |
| `ReactDOM.render`, `findDOMNode`, `HostRoot (ReactDOM.render)` | Удалены в React 19; корень создают `createRoot` и `hydrateRoot` | там же |
| `renderToNodeStream`, `renderToStaticNodeStream`; `renderToString` «с `data-reactroot` и контрольными суммами» | Оба потоковых API удалены; атрибутов и контрольных сумм нет с React 16; актуальны `renderToPipeableStream`, `renderToReadableStream`, `prerender`, `resume` | [Server React DOM APIs](https://react.dev/reference/react-dom/server) |
| Пул событий: `e.target` в `setTimeout` равен `null`, нужен `e.persist()` | Пул удалён в React 17, событие можно читать асинхронно | [React changelog 17.0](https://github.com/facebook/react/blob/main/CHANGELOG.md) |
| Делегат событий «на `document` в 17 и ниже, на root в 18» | На корневом контейнере с React 17 | [React 17 release](https://legacy.reactjs.org/blog/2020/10/20/react-v17.html) |
| «React Forget», «в продакшене с 2025–2026» | React Compiler 1.0 стабилен с октября 2025, поддерживает React 17+ | [React Compiler v1.0](https://react.dev/blog/2025/10/07/react-compiler-1) |
| «Concurrent Mode» как режим | Режима нет: конкурентный рендер включается для конкретных обновлений (`startTransition`, `useDeferredValue`, Suspense) в `createRoot` | [React 18 upgrade](https://react.dev/blog/2022/03/08/react-18-upgrade-guide) |
| Offscreen | Стабильный `<Activity mode="hidden">` с React 19.2 | [Activity](https://react.dev/reference/react/Activity) |
| React Router: `defer()` + `<Await>`, `future={{ v7_startTransition: true }}`, `useRouteMatch` «в v7», `activeClassName` у `NavLink`, импорты из `react-router-dom` | `defer` удалён в v7 (возвращают промисы напрямую), флаги v7 сняты, `useRouteMatch` удалён ещё в v6, `NavLink` принимает функцию `className`; в v8 всё импортируется из `react-router` и `react-router/dom` | [React Router CHANGELOG](https://github.com/remix-run/react-router/blob/main/CHANGELOG.md) |
| Server Actions | С сентября 2024 называются Server Functions; `'use server'` помечает функцию, а не компонент | [Server Functions](https://react.dev/reference/rsc/server-functions) |
| Create React App и ручная настройка webpack | CRA устарел (февраль 2025); новые проекты на фреймворке (Next.js, React Router) или на Vite | [Sunsetting Create React App](https://react.dev/blog/2025/02/14/sunsetting-create-react-app) |
| Таблицы «как биндить `this`», жизненный цикл классов как основа | Классы нужны только для error boundary и старого кода; в уроках упоминаются как «раньше так» | [Component](https://react.dev/reference/react/Component) |

## Найденные ошибки

| Раздел | В заметках | На самом деле | Источник |
|---|---|---|---|
| Render Flow | `getBoundingClientRect()` в `useEffect` «даёт 0, потому что layout уже был» | DOM уже обновлён, измерение верное; `useLayoutEffect` нужен, чтобы применить результат до отрисовки и избежать мигания | [useLayoutEffect](https://react.dev/reference/react/useLayoutEffect) |
| Render Flow | `setState` в рендере: предупреждение «Cannot update a component while rendering a different component», «сейчас поведение стабилизировано» | Это предупреждение про **другой** компонент. Своё состояние можно обновить в рендере по условию (хранение данных прошлого рендера), безусловное даёт ошибку «Too many re-renders» | [useState: storing information from previous renders](https://react.dev/reference/react/useState#storing-information-from-previous-renders) |
| Render Flow | Рендер прерывается, «если пользователь переключился на другую вкладку» | Прерывается конкурентный рендер, когда приходит более срочное обновление или нужно отдать поток браузеру | [useTransition](https://react.dev/reference/react/useTransition) |
| Fiber | Планировщик через `requestIdleCallback`, приоритеты «1ms, 5000ms» | Это учебная модель; планировщик React использует `MessageChannel` и полосы (lanes). Внутренние теги и поля Fiber меняются между версиями (например, `IndeterminateComponent` удалён) | [react/packages/scheduler](https://github.com/facebook/react/tree/main/packages/scheduler) |
| Concurrent | «React гарантирует консистентность, разрывов не бывает» | При чтении внешнего изменяемого хранилища во время конкурентного рендера разрыв возможен; для этого `useSyncExternalStore` | [useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore) |
| Auto-batching | Пример React 17: два `setState` в обработчике React дают два рендера | В обработчиках событий React батчил и до 18; новое в 18 только `setTimeout`, промисы и нативные события | [Automatic batching](https://react.dev/blog/2022/03/29/react-v18#new-feature-automatic-batching), проверено запуском |
| Auto-batching | «`ReactDOM.flushSync()` для классовых компонентов» | `flushSync` один и тот же для любых компонентов | [flushSync](https://react.dev/reference/react-dom/flushSync) |
| Transitions | `startTransition(() => setResults(search('R')))`: «поиск по R прерывается, выполнится только поиск по полному слову» | Функция внутри `startTransition` выполняется сразу и синхронно, `search` отработает каждый раз; прерывается только рендер с новым состоянием. Тяжёлый расчёт переносят в рендер (`useDeferredValue`) | [startTransition](https://react.dev/reference/react/startTransition), проверено запуском |
| Transitions | «`useTransition` с async-функциями (React 18.2+)» | Асинхронные переходы появились в React 19 | [React 19: Actions](https://react.dev/blog/2024/12/05/react-19#actions) |
| Actions | `<form onSubmit={handleSubmit}>`, где `handleSubmit(formData)` | `onSubmit` получает событие; `FormData` получает функция в `action` | [form](https://react.dev/reference/react-dom/components/form) |
| Actions | `use(fetchUserData(userId))` прямо в рендере | Промис, созданный при рендере клиентского компонента, создаётся заново на каждом рендере; `use` ждёт кэшированный промис (из Server Component, кэша или библиотеки) | [use](https://react.dev/reference/react/use) |
| Server Actions | «Безопасность: код выполняется на сервере» | Server Function это публичный эндпоинт: аргументы и права проверяют внутри. В декабре 2025 найдены уязвимости RSC (удалённое выполнение кода, DoS, раскрытие кода), нужны исправленные версии | [Critical security vulnerability in RSC](https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components) |
| Хуки | «React хранит хуки в массиве» | В связном списке на Fiber-узле; суть правила та же: порядок вызовов должен совпадать | [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks) |
| Хуки | `usePrevious` пишет и читает `ref.current` во время рендера, `useRef<T>()` без аргумента | Читать и писать `ref.current` при рендере нельзя (кроме ленивой инициализации); в типах React 19 `useRef` требует аргумент | [useRef](https://react.dev/reference/react/useRef), проверено `tsc` |
| Хуки | Зависимые поля через `useEffect(() => setFieldB(calc(fieldA)), [fieldA])` | Лишний рендер с устаревшим значением; производное значение считают при рендере | [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) |
| Хуки | `useLayoutEffect`: «99% случаев: обычный `useEffect` + `flushSync`» | `flushSync` не связан с эффектами; выбор между эффектами зависит от того, нужно ли успеть до отрисовки | [useLayoutEffect](https://react.dev/reference/react/useLayoutEffect) |
| Хуки | `useImperativeHandle(ref, fn, [])` «без deps вызывается при маунте один раз» | Без массива пересоздаётся на каждом рендере, с массивом при изменении зависимостей; в React 19 `ref` приходит пропом | [useImperativeHandle](https://react.dev/reference/react/useImperativeHandle) |
| Context | «`useContextSelector` из kentcdodds/use-context-selector» | Библиотека `use-context-selector` от dai-shi; в React такого API нет | [use-context-selector](https://github.com/dai-shi/use-context-selector) |
| Context | Разделить один контекст на два, и `Header` «перерендерится только при изменении theme» | Если значения провайдеров это новые объекты на каждом рендере, оба контекста меняются при любом обновлении родителя; нужен `useMemo` или вынос провайдера | проверено запуском |
| Memo | `setList(prev => [...prev, item])` ломает `memo` у строк, «потому что `item` новая ссылка» | Старые элементы сохраняют ссылки, перерендерится только новая строка | разбор кода |
| Memo | `React.memo` «появился в 16.6 (2019) специально под хуки» | 16.6 вышел в октябре 2018, хуки в 16.8 (февраль 2019) | [React changelog 16.6](https://github.com/facebook/react/blob/main/CHANGELOG.md) |
| Оптимизация | «Ставим `React.memo` на все чистые компоненты» | Документация советует мемоизировать по результатам профилирования; с React Compiler это делается автоматически | [memo](https://react.dev/reference/react/memo) |
| Оптимизация | react-window «от автора TanStack», `FixedSizeList` как стандарт | react-window написал Brian Vaughn; в версии 2 API `List` с `rowComponent`; TanStack Virtual отдельная библиотека | [react-window](https://github.com/bvaughn/react-window) |
| Оптимизация | Preload роута через `loader: () => { import(...) }` «при наведении» | `loader` вызывается при навигации, а не при наведении; для этого `lazy` у роута и `prefetch` у `Link` | [React Router: lazy](https://reactrouter.com/start/data/route-object#lazy) |
| DevTools | Цвета профайлера «жёлтый props, зелёный state», `$r.memoizedState` | Цвет показывает длительность рендера; причину включают настройкой «Record why each component rendered»; `$r` даёт выбранный компонент, у функциональных нет экземпляра | [React Developer Tools](https://react.dev/learn/react-developer-tools) |
| SSR | Selective hydration: «если один компонент упал, остальные гидратируются» | Границы Suspense гидратируются независимо, и React сначала гидратирует ту часть, с которой взаимодействует пользователь | [hydrateRoot](https://react.dev/reference/react-dom/client/hydrateRoot) |
| SSR | `async function Page()` с `await` «работает и на сервере, и на клиенте» | Асинхронными могут быть только Server Components | [Server Components](https://react.dev/reference/rsc/server-components) |
| SSR | `useEffect`/`useLayoutEffect` на сервере дают «warning + падение» | Эффекты на сервере не выполняются; предупреждение о `useLayoutEffect` убрано в React 19 | [React 19 changelog](https://github.com/facebook/react/blob/main/CHANGELOG.md) |
| SSR | Метрики «LCP 0.8–1.5 с вместо 3–8 с», «Google индексирует 100%» | Цифры без источника | — |
| События | `stopPropagation` в React «останавливает и React-, и нативное всплытие» | Нативные обработчики на элементах между целью и корнем уже сработали к моменту вызова; остановится всплытие выше корня | [Responding to Events](https://react.dev/learn/responding-to-events) |
| События | `onScroll` «не всплывает, только на элементе с overflow» | С React 17 `onScroll` не всплывает; сам `scroll` бывает у любого прокручиваемого элемента и у `document` | [React 17: onScroll](https://legacy.reactjs.org/blog/2020/08/10/react-v17-rc.html) |
| Формы | «Controlled в 95% случаев», у uncontrolled «проблемы с SSR» | В React 19 формы с `action` читают `FormData` из неуправляемых полей и сбрасывают их после успеха; SSR у них не хуже | [form](https://react.dev/reference/react-dom/components/form) |
| Props | Мутация пропсов: «в dev React кинет warning» | В разработке объект пропсов заморожен: присваивание в строгом режиме бросает `TypeError` | разбор кода |
| Роутинг | `useGoBack`: `navigate(-1) ?? navigate(fallback)` | `navigate` ничего полезного не возвращает, запасной путь не сработает никогда | разбор кода |
| Роутинг | `<Route path>` «deprecated с v6.4» | Такого нет: `path` основной проп маршрута | [React Router: Routing](https://reactrouter.com/start/declarative/routing) |
| Частые ошибки | `handleSearch` в `setTimeout` «использует устаревший query», исправление `useCallback` | Функция пересоздаётся на каждом рендере и видит текущий `query`; реальная проблема гонка ответов, её решает флаг отмены, а не `useCallback` | [Fetching data](https://react.dev/reference/react/useEffect#fetching-data-with-effects) |
| Частые ошибки | `Child` перерендерится «из-за новых ссылок на пропсы» | Без `memo` ребёнок рендерится при каждом рендере родителя, ссылки ни при чём | [memo](https://react.dev/reference/react/memo), проверено запуском |
| StrictMode | «`componentDidUpdate` вызывается дважды», «эффект дважды и cleanup тоже дважды» | При монтировании: setup → cleanup → setup (очистка один раз); `componentDidUpdate` не дублируется; дважды вызываются тело компонента, инициализаторы и функции `useMemo` | [StrictMode](https://react.dev/reference/react/StrictMode), проверено запуском |
| StrictMode | `useState(() => …)` «вызывается дважды, но вычисляется один раз» | Функция вызывается дважды, второй результат отбрасывается; в React 19 при повторном рендере компонента `useMemo` и `useCallback` берут результат первого | [React 19 Upgrade Guide: StrictMode](https://react.dev/blog/2024/04/25/react-19-upgrade-guide#strict-mode-improvements) |
| Компилятор | «Не добавляет runtime-магии» | Скомпилированный код использует кэш из `react/compiler-runtime` (`useMemoCache`) | [React Compiler: introduction](https://react.dev/learn/react-compiler/introduction) |

## Пробелы, закрытые в уроках

- Элементы как объекты, автоматический JSX runtime, `ref` как проп, сохранение и сброс состояния по типу, позиции и `key`, ключи-индексы на живом примере.
- Состояние как снимок, функции-обновления, батчинг до и после React 18, `flushSync`, неизменяемые обновления, состояние из пропсов без эффектов.
- Порядок эффектов детей и родителя, очистка при смене зависимостей и размонтировании, гонки запросов, `useEffectEvent`, очистка у ref-колбэков, Fragment refs.
- Когда компонент перерендеривается, `memo` и стабильные пропсы, ловушки контекста, React Compiler 1.0, `useTransition` и `useDeferredValue`, `<Activity>`, `<ViewTransition>`, виртуализация, `useSyncExternalStore`.
- Actions, `useActionState`, `useFormStatus`, `useOptimistic`, `use` с Suspense, метаданные документа, error boundary и `onCaughtError`, библиотеки данных.
- API серверного рендера и что из них удалено, `prerender` против `renderToString`, гидратация и ошибки несовпадения, `useId`, `use(browser())`, Server Components и Server Functions с проверкой прав, фреймворки вместо CRA.
