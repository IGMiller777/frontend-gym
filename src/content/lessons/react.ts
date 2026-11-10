import type { Source } from '../sources'
import { reactMoreLessons } from './react-more'
import type { Lesson, Module } from './types'

const docs = (title: string, path: string): Source => ({ title: `react.dev: ${title}`, url: `https://react.dev/${path}`, kind: 'official' })
const verified = { date: '2026-11', version: 'React 19.3, React Compiler 1.0' }

const baseLessons: Lesson[] = [
  {
    id: 'react-rendering',
    track: 'react',
    emoji: '🌳',
    minutes: 12,
    title: { ru: 'Рендер, commit и reconciliation', en: 'Render, commit and reconciliation' },
    summary: {
      ru: 'Элементы и JSX runtime, три шага обновления, сохранение состояния по типу и позиции, ключи, Fiber, StrictMode.',
      en: 'Elements and the JSX runtime, the three steps of an update, state kept by type and position, keys, Fiber, StrictMode.',
    },
    quiz: {
      ru: [
        { q: 'Что возвращает выражение `<Button size="s" />`?', options: ['Готовый DOM-узел этой кнопки', 'Объект с полями `type` и `props`', 'Экземпляр компонента `Button`', 'HTML-строку для вставки в страницу'], correct: 1, why: 'JSX компилируется в вызов `jsx()`, который возвращает неизменяемый объект; DOM создаётся только при фиксации.' },
        { q: 'На одном месте дерева `<Counter />` сменился на `<Counter />` с другим `key`. Что с его состоянием?', options: ['Сохранится, тип ведь тот же', 'Сбросится: компонент смонтируется заново', 'Сохранится только при наличии `memo`', 'Сбросится только у дочерних компонентов'], correct: 1, why: 'Другой `key` на той же позиции для React то же, что другой тип: старое поддерево размонтируется.' },
        { q: 'Почему ключ по индексу ломает список с полями ввода при вставке в начало?', options: ['React запрещает числа в качестве ключей', 'Состояние остаётся на позициях', 'Индексы перестают быть уникальными', 'React перестаёт отслеживать изменения'], correct: 1, why: 'Новый элемент получает ключ `0` и наследует DOM и состояние бывшего первого элемента.' },
        { q: 'Что делает StrictMode с эффектом при монтировании в разработке?', options: ['Запускает setup и cleanup по два раза', 'setup, затем cleanup, затем снова setup', 'Откладывает эффект до второго рендера', 'Запускает setup два раза без очистки'], correct: 1, why: 'React имитирует размонтирование и повторное монтирование: очистка вызывается один раз между двумя setup.' },
      ],
      en: [
        { q: 'What does the expression `<Button size="s" />` return?', options: ['A ready DOM node for the button', 'An object with `type` and `props`', 'An instance of the `Button` component', 'An HTML string to insert in the page'], correct: 1, why: 'JSX compiles to a `jsx()` call that returns an immutable object; DOM is created only at commit.' },
        { q: 'At the same place in the tree `<Counter />` is replaced by `<Counter />` with a different `key`. What happens to its state?', options: ['It is kept, since the type is the same', 'It resets: the component mounts again', 'It is kept only if `memo` is used', 'It resets only in child components'], correct: 1, why: 'A different `key` at the same position is the same to React as a different type: the old subtree unmounts.' },
        { q: 'Why does an index key break a list with inputs when an item is inserted at the start?', options: ['React does not allow numbers as keys', 'State stays at the old positions', 'The indexes stop being unique', 'React stops tracking the changes'], correct: 1, why: 'The new item gets key `0` and inherits the DOM and state of the former first item.' },
        { q: 'What does StrictMode do with an effect on mount in development?', options: ['Runs setup and cleanup twice each', 'setup, then cleanup, then setup again', 'Delays the effect until the second render', 'Runs setup twice with no cleanup'], correct: 1, why: 'React simulates an unmount and a remount: cleanup is called once between the two setups.' },
      ],
    },
    sources: [
      docs('Render and Commit', 'learn/render-and-commit'),
      docs('Preserving and Resetting State', 'learn/preserving-and-resetting-state'),
      docs('Rendering Lists: keys', 'learn/rendering-lists'),
      docs('StrictMode', 'reference/react/StrictMode'),
      docs('React 19 Upgrade Guide', 'blog/2024/04/25/react-19-upgrade-guide'),
    ],
    verified,
  },
  {
    id: 'react-state',
    track: 'react',
    emoji: '🎛️',
    minutes: 12,
    title: { ru: 'Состояние, события и формы', en: 'State, events and forms' },
    summary: {
      ru: 'Состояние как снимок, функции-обновления, батчинг и flushSync, неизменяемые обновления, useReducer, события и порталы, формы.',
      en: 'State as a snapshot, updater functions, batching and flushSync, immutable updates, useReducer, events and portals, forms.',
    },
    quiz: {
      ru: [
        { q: '`count` равен 0. Обработчик трижды вызывает `setCount(count + 1)`. Сколько будет после рендера?', options: ['3', '1', '0', '2'], correct: 1, why: 'Все три вызова видят снимок `count = 0` и записывают 1. Для +3 нужна функция `c => c + 1`.' },
        { q: 'Сколько рендеров дадут `setA(1); setB(1)` внутри `setTimeout` в React 19 с `createRoot`?', options: ['Два, по одному на каждый вызов', 'Один: обновления батчатся везде', 'Ни одного без `flushSync`', 'Два, `setTimeout` батчинг отключает'], correct: 1, why: 'С React 18 автоматический батчинг работает и в таймерах, промисах и нативных обработчиках.' },
        { q: 'Код делает `user.city = "Rome"; setUser(user)`. Что произойдёт?', options: ['Обычный рендер с новым городом', 'Рендера не будет: ссылка та же', 'Ошибка: объект состояния заморожен', 'Рендер произойдёт только у детей'], correct: 1, why: 'React сравнивает состояние по `Object.is`; тот же объект значит «ничего не изменилось».' },
        { q: 'Кнопка внутри портала в `document.body`, обработчик `onClick` висит на родительском `<div>` в дереве React. Сработает ли он?', options: ['Нет, в DOM кнопка вне этого `div`', 'Да: событие всплывает по дереву React', 'Только если добавить `onClickCapture`', 'Только если портал внутри этого `div`'], correct: 1, why: 'React-события всплывают по дереву компонентов, поэтому порталы ведут себя так, будто стоят на своём месте.' },
      ],
      en: [
        { q: '`count` is 0. A handler calls `setCount(count + 1)` three times. What is it after the render?', options: ['3', '1', '0', '2'], correct: 1, why: 'All three calls see the snapshot `count = 0` and write 1. For +3 you need the function `c => c + 1`.' },
        { q: 'How many renders do `setA(1); setB(1)` inside `setTimeout` cause in React 19 with `createRoot`?', options: ['Two, one for each call', 'One: updates are batched everywhere', 'None without `flushSync`', 'Two, `setTimeout` disables batching'], correct: 1, why: 'Since React 18 automatic batching also works in timers, promises and native handlers.' },
        { q: 'Code does `user.city = "Rome"; setUser(user)`. What happens?', options: ['A normal render with the new city', 'No render: the reference is the same', 'An error: the state object is frozen', 'Only the children render'], correct: 1, why: 'React compares state with `Object.is`; the same object means "nothing changed".' },
        { q: 'A button is inside a portal in `document.body`, and an `onClick` sits on a parent `<div>` in the React tree. Does it fire?', options: ['No, in the DOM the button is outside the `div`', 'Yes: the event bubbles through the React tree', 'Only if `onClickCapture` is added', 'Only if the portal is inside that `div`'], correct: 1, why: 'React events bubble through the component tree, so portals behave as if they were in place.' },
      ],
    },
    sources: [
      docs('State as a Snapshot', 'learn/state-as-a-snapshot'),
      docs('Queueing a Series of State Updates', 'learn/queueing-a-series-of-state-updates'),
      docs('Updating Objects in State', 'learn/updating-objects-in-state'),
      docs('Responding to Events', 'learn/responding-to-events'),
      docs('Common components (events)', 'reference/react-dom/components/common'),
      docs('createPortal', 'reference/react-dom/createPortal'),
    ],
    verified,
  },
  {
    id: 'react-effects',
    track: 'react',
    emoji: '🔌',
    minutes: 13,
    title: { ru: 'Эффекты и refs', en: 'Effects and refs' },
    summary: {
      ru: 'Порядок эффектов и очисток, гонки запросов, лишние эффекты, useEffectEvent, useLayoutEffect, ref как проп, очистка ref-колбэков, Fragment refs.',
      en: 'The order of effects and cleanups, request races, unnecessary effects, useEffectEvent, useLayoutEffect, ref as a prop, ref callback cleanup, Fragment refs.',
    },
    quiz: {
      ru: [
        { q: 'В каком порядке запускаются `useEffect` родителя и ребёнка после монтирования?', options: ['Сначала родитель, потом ребёнок', 'Сначала ребёнок, потом родитель', 'Одновременно, в одной микрозадаче', 'Порядок не определён'], correct: 1, why: 'Дерево обходится снизу вверх, поэтому эффекты детей идут раньше, и родитель может на них опираться.' },
        { q: 'Как не показать ответ на устаревший запрос в эффекте?', options: ['Добавить `useCallback` к загрузчику', 'Флаг `ignore` в очистке или `abort()`', 'Убрать зависимость из массива', 'Обернуть `fetch` в `startTransition`'], correct: 1, why: 'Очистка прошлого запуска помечает ответ устаревшим или отменяет сам запрос.' },
        { q: 'Зачем `useEffectEvent`?', options: ['Подписаться на события DOM без эффекта', 'Читать свежие значения, не перезапуская эффект', 'Запустить эффект синхронно до отрисовки', 'Заменить обработчики `onClick` в JSX'], correct: 1, why: 'Функция видит актуальные пропсы и состояние, но не входит в зависимости, поэтому эффект не переподключается.' },
        { q: 'Как в React 19 передать `ref` во вложенный `<input>` своего компонента?', options: ['Только через `forwardRef`', 'Принять `ref` как обычный проп', 'Через `useImperativeHandle` без пропа', 'Через `ReactDOM.findDOMNode`'], correct: 1, why: 'С React 19 `ref` это проп функционального компонента; `findDOMNode` удалён.' },
      ],
      en: [
        { q: 'In what order do a parent\'s and a child\'s `useEffect` run after mount?', options: ['The parent first, then the child', 'The child first, then the parent', 'Together, in one microtask', 'The order is undefined'], correct: 1, why: 'The tree is walked bottom-up, so children\'s effects run first and the parent can rely on them.' },
        { q: 'How do you avoid showing the response to a stale request in an effect?', options: ['Add `useCallback` to the loader', 'An `ignore` flag in cleanup, or `abort()`', 'Remove the dependency from the array', 'Wrap `fetch` in `startTransition`'], correct: 1, why: 'The previous run\'s cleanup marks the response as stale or cancels the request itself.' },
        { q: 'What is `useEffectEvent` for?', options: ['Subscribing to DOM events without an effect', 'Reading fresh values without re-running the effect', 'Running an effect synchronously before paint', 'Replacing `onClick` handlers in JSX'], correct: 1, why: 'The function sees current props and state but is not a dependency, so the effect does not reconnect.' },
        { q: 'How do you pass a `ref` to the inner `<input>` of your component in React 19?', options: ['Only through `forwardRef`', 'Accept `ref` as a regular prop', 'With `useImperativeHandle`, no prop', 'With `ReactDOM.findDOMNode`'], correct: 1, why: 'Since React 19 `ref` is a prop of a function component; `findDOMNode` was removed.' },
      ],
    },
    sources: [
      docs('Synchronizing with Effects', 'learn/synchronizing-with-effects'),
      docs('You Might Not Need an Effect', 'learn/you-might-not-need-an-effect'),
      docs('useEffectEvent', 'reference/react/useEffectEvent'),
      docs('useLayoutEffect', 'reference/react/useLayoutEffect'),
      docs('useRef', 'reference/react/useRef'),
      docs('Fragment', 'reference/react/Fragment'),
    ],
    verified,
  },
  {
    id: 'react-performance',
    track: 'react',
    emoji: '⚡',
    minutes: 13,
    title: { ru: 'Производительность: memo, Compiler, переходы', en: 'Performance: memo, Compiler, transitions' },
    summary: {
      ru: 'Почему компонент рендерится, memo и стабильные пропсы, ловушка контекста, React Compiler 1.0, переходы и useDeferredValue, Activity, виртуализация.',
      en: 'Why a component renders, memo and stable props, the context trap, React Compiler 1.0, transitions and useDeferredValue, Activity, virtualization.',
    },
    quiz: {
      ru: [
        { q: 'Родитель обновил своё состояние. Ребёнок без `memo` получает те же пропсы. Отрендерится ли он?', options: ['Нет, пропсы ведь не изменились', 'Да, вместе с родителем', 'Только если пропсы это объекты', 'Только в режиме StrictMode'], correct: 1, why: 'Без `memo` пропсы не сравниваются: рендер родителя рендерит всех детей.' },
        { q: 'Контекст разделили на `ThemeContext` и `UserContext`, значения это объекты, созданные в рендере. Изменился пользователь. Что с читателями темы?', options: ['Не отрендерятся, их контекст другой', 'Отрендерятся: объект темы тоже новый', 'Отрендерятся, только если без `memo`', 'Получат старое значение темы'], correct: 1, why: 'Рендер провайдера создаёт новый объект для обоих контекстов; нужен `useMemo` для значения.' },
        { q: 'Что выполнится синхронно в `startTransition(() => setList(filter(items)))`?', options: ['Ничего, всё отложится на потом', '`filter` и постановка обновления', 'Только рендер с новым списком', 'Только постановка обновления'], correct: 1, why: 'Функция-аргумент выполняется сразу; прерываемым становится только рендер с новым состоянием.' },
        { q: 'Что делает `<Activity mode="hidden">`?', options: ['Размонтирует детей и теряет состояние', 'Прячет детей, сохраняя состояние и DOM', 'Ставит детям `visibility: hidden`', 'Не рендерит детей до показа'], correct: 1, why: 'Скрытое поддерево остаётся в DOM с `display: none`, его эффекты снимаются, а рендер идёт с низким приоритетом.' },
      ],
      en: [
        { q: 'A parent updated its state. A child without `memo` gets the same props. Does it render?', options: ['No, its props did not change', 'Yes, along with the parent', 'Only if the props are objects', 'Only in StrictMode in development'], correct: 1, why: 'Without `memo` props are not compared: a parent render renders every child.' },
        { q: 'Context is split into `ThemeContext` and `UserContext`, and the values are objects created in render. The user changes. What about theme readers?', options: ['They do not render, it is another context', 'They render: the theme object is new too', 'They render only without `memo`', 'They get the old theme value'], correct: 1, why: 'The provider render creates a new object for both contexts; the value needs `useMemo`.' },
        { q: 'What runs synchronously in `startTransition(() => setList(filter(items)))`?', options: ['Nothing, it is all deferred', '`filter` and queuing the update', 'Only the render with the new list', 'Only queuing the state update'], correct: 1, why: 'The callback runs at once; only the render with the new state becomes interruptible.' },
        { q: 'What does `<Activity mode="hidden">` do?', options: ['Unmounts the children, losing state', 'Hides the children, keeping state and DOM', 'Sets `visibility: hidden` on the children', 'Skips rendering until it is shown'], correct: 1, why: 'The hidden subtree stays in the DOM with `display: none`, its effects are removed, and it renders at low priority.' },
      ],
    },
    sources: [
      docs('memo', 'reference/react/memo'),
      docs('useMemo', 'reference/react/useMemo'),
      docs('React Compiler: Introduction', 'learn/react-compiler/introduction'),
      docs('useTransition', 'reference/react/useTransition'),
      docs('useDeferredValue', 'reference/react/useDeferredValue'),
      docs('Activity', 'reference/react/Activity'),
      docs('useSyncExternalStore', 'reference/react/useSyncExternalStore'),
    ],
    verified,
  },
  {
    id: 'react-actions',
    track: 'react',
    emoji: '📮',
    minutes: 13,
    title: { ru: 'Actions, формы и Suspense', en: 'Actions, forms and Suspense' },
    summary: {
      ru: 'Асинхронные переходы, form action и useActionState, useFormStatus, useOptimistic, use с Suspense, error boundary, метаданные документа.',
      en: 'Async transitions, form actions and useActionState, useFormStatus, useOptimistic, use with Suspense, error boundaries, document metadata.',
    },
    quiz: {
      ru: [
        { q: 'Какие аргументы получает функция, переданная в `useActionState`?', options: ['Только `FormData`', 'Прошлое состояние и `FormData`', 'Событие `submit` и `FormData`', 'Текущие пропсы и состояние'], correct: 1, why: 'Первым приходит результат прошлого вызова (или начальное состояние), вторым данные формы.' },
        { q: 'Что происходит с оптимистичным значением, если Action завершился ошибкой?', options: ['Остаётся, пока его не уберут вручную', 'Исчезает: React берёт настоящее состояние', 'Превращается в сообщение об ошибке', 'Записывается в настоящее состояние'], correct: 1, why: '`useOptimistic` действует только на время Action; после него показывается настоящее состояние.' },
        { q: 'Почему нельзя писать `use(fetch(url))` в клиентском компоненте?', options: ['`use` не работает с промисами', 'Каждый рендер создаёт новый промис', '`fetch` запрещён внутри компонентов', 'Нужен `await` перед вызовом `use`'], correct: 1, why: 'Промис для `use` должен быть кэширован; новый промис на каждом рендере снова показывает fallback.' },
        { q: 'Что React 19 делает с `<title>` внутри компонента?', options: ['Выводит его внутри компонента', 'Переносит его в `<head>` документа', 'Игнорирует с предупреждением', 'Требует пакет react-helmet'], correct: 1, why: 'React 19 поддерживает метаданные документа: `<title>`, `<meta>` и `<link>` поднимаются в `<head>`.' },
      ],
      en: [
        { q: 'Which arguments does the function passed to `useActionState` receive?', options: ['Only `FormData`', 'The previous state and `FormData`', 'The `submit` event and `FormData`', 'The current props and state'], correct: 1, why: 'First comes the result of the previous call (or the initial state), then the form data.' },
        { q: 'What happens to the optimistic value if the Action fails?', options: ['It stays until removed by hand', 'It goes away: the real state shows', 'It turns into an error message', 'It is written into the real state'], correct: 1, why: '`useOptimistic` applies only while the Action runs; afterwards the real state is shown.' },
        { q: 'Why not write `use(fetch(url))` in a client component?', options: ['`use` does not work with promises', 'Every render creates a new promise', '`fetch` is not allowed in components', '`await` is needed before `use`'], correct: 1, why: 'The promise for `use` must be cached; a new promise on every render shows the fallback again.' },
        { q: 'What does React 19 do with a `<title>` inside a component?', options: ['Outputs it inside the component', 'Moves it into the document `<head>`', 'Ignores it with a warning', 'Requires the react-helmet package'], correct: 1, why: 'React 19 supports document metadata: `<title>`, `<meta>` and `<link>` are hoisted into `<head>`.' },
      ],
    },
    sources: [
      docs('React 19', 'blog/2024/12/05/react-19'),
      docs('useActionState', 'reference/react/useActionState'),
      docs('<form>', 'reference/react-dom/components/form'),
      docs('useOptimistic', 'reference/react/useOptimistic'),
      docs('use', 'reference/react/use'),
      docs('Suspense', 'reference/react/Suspense'),
      docs('Catching rendering errors with an error boundary', 'reference/react/Component#catching-rendering-errors-with-an-error-boundary'),
    ],
    verified,
  },
  {
    id: 'react-server',
    track: 'react',
    emoji: '🛰️',
    minutes: 13,
    title: { ru: 'SSR, гидратация и Server Components', en: 'SSR, hydration and Server Components' },
    summary: {
      ru: 'Серверные API и что удалено, prerender против renderToString, гидратация и несовпадения, useId, use(browser()), Server Components и серверные функции.',
      en: 'Server APIs and what was removed, prerender vs renderToString, hydration and mismatches, useId, use(browser()), Server Components and server functions.',
    },
    quiz: {
      ru: [
        { q: 'Что вернёт `renderToString`, если компонент внутри `<Suspense>` ждёт данные?', options: ['Дождётся данных и вернёт полный HTML', 'Сразу вернёт HTML с fallback', 'Бросит ошибку и ничего не вернёт', 'Вернёт пустую строку'], correct: 1, why: '`renderToString` не поддерживает ожидание данных; ждут `prerender` и потоковые API.' },
        { q: 'Как получить одинаковые `id` для `htmlFor` на сервере и клиенте?', options: ['`Math.random()` при первом рендере', 'Хук `useId`', 'Счётчик в модуле компонента', '`crypto.randomUUID()` в эффекте'], correct: 1, why: '`useId` выдаёт стабильные значения, совпадающие при гидратации.' },
        { q: 'Что из этого может сделать Server Component?', options: ['Хранить состояние через `useState`', 'Быть `async` и читать базу напрямую', 'Повесить `onClick` на кнопку', 'Передать клиенту обычную функцию'], correct: 1, why: 'Серверный компонент может быть асинхронным; состояния, обработчиков и несериализуемых пропсов у него нет.' },
        { q: 'Кнопку с серверной функцией удаления видит только админ. Нужна ли проверка прав внутри функции?', options: ['Нет, обычный пользователь её не вызовет', 'Да: это публичный эндпоинт', 'Нет, React проверяет права сам', 'Только при вызове из формы'], correct: 1, why: 'Серверную функцию можно вызвать запросом напрямую; аргументы и права проверяют на сервере.' },
      ],
      en: [
        { q: 'What does `renderToString` return if a component inside `<Suspense>` is waiting for data?', options: ['It waits and returns the full HTML', 'HTML with the fallback, right away', 'It throws and returns nothing', 'An empty string'], correct: 1, why: '`renderToString` does not wait for data; `prerender` and the streaming APIs do.' },
        { q: 'How do you get identical `id`s for `htmlFor` on the server and the client?', options: ['`Math.random()` on the first render', 'The `useId` hook', 'A counter in the component module', '`crypto.randomUUID()` in an effect'], correct: 1, why: '`useId` gives stable values that match during hydration.' },
        { q: 'Which of these can a Server Component do?', options: ['Keep its state with `useState`', 'Be `async` and query the database', 'Attach `onClick` to a button', 'Pass a regular function to the client'], correct: 1, why: 'A server component can be async; it has no state, no handlers and no non-serializable props.' },
        { q: 'Only admins see the button that calls a delete server function. Is a permission check inside the function needed?', options: ['No, a regular user cannot call it', 'Yes: it is a public endpoint', 'No, React checks permissions itself', 'Only when called from a form'], correct: 1, why: 'A server function can be called with a direct request; arguments and permissions are checked on the server.' },
      ],
    },
    sources: [
      docs('Server React DOM APIs', 'reference/react-dom/server'),
      docs('prerender', 'reference/react-dom/static/prerender'),
      docs('hydrateRoot', 'reference/react-dom/client/hydrateRoot'),
      docs('useId', 'reference/react/useId'),
      docs('Server Components', 'reference/rsc/server-components'),
      docs("'use server'", 'reference/rsc/use-server'),
      docs('Critical security vulnerability in React Server Components', 'blog/2025/12/03/critical-security-vulnerability-in-react-server-components'),
      docs('Creating a React App', 'learn/creating-a-react-app'),
    ],
    verified,
  },
]

/** Path order: basics, state and hooks, composition, performance and internals, data, server, quality. */
const order = [
  'react-jsx-components', 'react-rendering', 'react-state', 'react-hooks', 'react-effects', 'react-forms', 'react-patterns',
  'react-performance', 'react-internals', 'react-router', 'react-data', 'react-actions', 'react-server', 'react-debugging', 'react-a11y-testing',
]
const all = new Map([...baseLessons, ...reactMoreLessons].map((l) => [l.id, l]))
export const reactLessons: Lesson[] = order.map((id) => all.get(id)!)
if (reactLessons.length !== all.size || reactLessons.some((l) => !l)) throw new Error('react: lesson order is out of sync with lesson list')

export const reactModule: Module = {
  track: 'react',
  lessons: reactLessons.map((l) => l.id),
  exam: {
    pass: 0.75,
    questions: {
      ru: [
        { q: 'Компонент объявлен внутри другого компонента. Что будет с его состоянием при каждом рендере родителя?', options: ['Сохранится, React кэширует функцию', 'Сбросится: каждый раз это новый тип', 'Сохранится при наличии `key`', 'Сбросится только в StrictMode'], correct: 1, why: 'Функция, созданная при рендере, это новый `type`, и React размонтирует её поддерево.' },
        { q: 'Как правильно увеличить счётчик на 2 в одном обработчике?', options: ['`setCount(count + 1)` дважды', '`setCount(c => c + 1)` дважды', '`setCount(count++)` дважды', '`flushSync` вокруг `setCount(count + 1)`'], correct: 1, why: 'Функции-обновления применяются по очереди к результату предыдущей.' },
        { q: 'Где лучше вычислить `fullName` из `first` и `last`?', options: ['В `useEffect` с `setFullName`', 'Прямо при рендере', 'В `useLayoutEffect`', 'В ref, чтобы не было рендера'], correct: 1, why: 'Производные данные считают при рендере; эффект даёт лишний рендер с устаревшим значением.' },
        { q: 'В каком порядке идут очистки и setup эффектов при изменении зависимостей у родителя и ребёнка?', options: ['Очистка и setup по очереди у каждого', 'Сначала все очистки, потом все setup', 'Сначала все setup, потом все очистки', 'Порядок задаёт массив зависимостей'], correct: 1, why: 'React сначала вызывает очистки прошлого запуска во всём дереве, затем новые setup.' },
        { q: 'Что гарантирует `memo(Child)`?', options: ['Ребёнок не рендерится никогда', 'Пропуск рендера при равных пропсах', 'Глубокое сравнение всех пропсов', 'Пропуск рендера при смене контекста'], correct: 1, why: '`memo` сравнивает пропсы поверхностно; контекст и своё состояние всё равно вызывают рендер.' },
        { q: 'Зачем `useSyncExternalStore`?', options: ['Синхронизировать состояние двух компонентов', 'Читать внешнее хранилище без разрывов', 'Сохранять состояние в `localStorage`', 'Ускорить рендер списка'], correct: 1, why: 'Хук делает чтение изменяемого внешнего источника согласованным при конкурентном рендере.' },
        { q: 'Что делает React после успешного `<form action={fn}>`?', options: ['Перезагружает страницу', 'Сбрасывает неуправляемые поля формы', 'Очищает всё состояние компонента', 'Отправляет форму второй раз'], correct: 1, why: 'После успешного Action React сбрасывает неуправляемые поля; сохранить значения можно через `defaultValue` из состояния.' },
        { q: 'Чем Server Components отличаются от SSR?', options: ['Ничем, это одно и то же явление', 'Их кода нет в клиентском бандле', 'Они работают без сервера', 'Они рендерятся только в браузере'], correct: 1, why: 'SSR превращает в HTML и клиентские компоненты, а серверные компоненты выполняются только на сервере и не входят в бандл.' },
        { q: 'Что отрисует `{0 && <b>x</b>}`?', options: ['Ничего', 'Символ `0`', 'Элемент `<b>x</b>`', 'Бросит ошибку'], correct: 1, why: 'Ложные значения, кроме чисел, не рисуются; `0` и `NaN` выводятся текстом.' },
        { q: 'Почему при `if (x) useState()` React бросает ошибку на следующем рендере?', options: ['Условия в хуках медленные', 'Сбился порядок ячеек хуков', 'useState требует ключ', 'Хуки работают только в классах'], correct: 1, why: 'Ячейки хуков сопоставляются по порядку вызова; число вызовов изменилось.' },
        { q: 'В каком порядке выполнятся `useEffect` родителя и ребёнка после монтирования?', options: ['Сначала родителя', 'Сначала ребёнка', 'В порядке объявления', 'Одновременно'], correct: 1, why: 'Фиксация и эффекты идут снизу вверх.' },
        { q: 'Куда всплывёт клик из портала?', options: ['Только к `document.body`', 'К React-родителю портала', 'Никуда', 'К `window` минуя React'], correct: 1, why: 'Портал меняет место в DOM, но не в дереве React.' },
        { q: 'Как в React Router 8 не пустить гостя на страницу до рендера?', options: ['useEffect с navigate', '`throw redirect()` в loader', 'Скрыть страницу CSS', 'Проверить в onClick'], correct: 1, why: 'Загрузчик выполняется до рендера, редирект не даёт странице мелькнуть; для групп маршрутов middleware.' },
        { q: 'Какой запрос Testing Library первым по приоритету?', options: ['`getByTestId` по атрибуту', '`getByText` по тексту', '`getByRole` с именем', '`querySelector` по узлу'], correct: 2, why: 'Поиск по роли и доступному имени повторяет то, как элемент находит пользователь и скринридер.' },
      ],
      en: [
        { q: 'A component is declared inside another component. What happens to its state on every parent render?', options: ['It is kept, React caches the function', 'It resets: it is a new type each time', 'It is kept if it has a `key`', 'It resets only in StrictMode'], correct: 1, why: 'A function created during render is a new `type`, and React unmounts its subtree.' },
        { q: 'How do you correctly add 2 to a counter in one handler?', options: ['`setCount(count + 1)` twice', '`setCount(c => c + 1)` twice', '`setCount(count++)` twice', '`flushSync` around `setCount(count + 1)`'], correct: 1, why: 'Updater functions are applied in turn to the previous result.' },
        { q: 'Where is the best place to compute `fullName` from `first` and `last`?', options: ['In `useEffect` with `setFullName`', 'Right during render', 'In `useLayoutEffect`', 'In a ref, to avoid a render'], correct: 1, why: 'Derived data is computed during render; an effect adds an extra render with a stale value.' },
        { q: 'In what order do effect cleanups and setups run when dependencies change in a parent and a child?', options: ['Cleanup and setup in turn for each', 'All cleanups first, then all setups', 'All setups first, then all cleanups', 'The dependency array sets the order'], correct: 1, why: 'React first calls the previous run\'s cleanups across the tree, then the new setups.' },
        { q: 'What does `memo(Child)` guarantee?', options: ['The child never renders', 'Skipping a render when props are equal', 'A deep comparison of all props', 'Skipping a render on context changes'], correct: 1, why: '`memo` compares props shallowly; context and the component\'s own state still cause renders.' },
        { q: 'What is `useSyncExternalStore` for?', options: ['Syncing state between two components', 'Reading an outside store without tearing', 'Saving state to `localStorage`', 'Rendering a long list faster'], correct: 1, why: 'The hook keeps reads of a mutable external source consistent during concurrent rendering.' },
        { q: 'What does React do after a successful `<form action={fn}>`?', options: ['Reloads the whole page', 'Resets uncontrolled form fields', 'Clears all of the component\'s state', 'Submits the form a second time'], correct: 1, why: 'After a successful Action React resets uncontrolled fields; values can be kept through `defaultValue` from state.' },
        { q: 'How do Server Components differ from SSR?', options: ['They do not, it is the same thing', 'Their code is not in the client bundle', 'They work without a server', 'They render only in the browser'], correct: 1, why: 'SSR turns client components into HTML too, while server components run only on the server and are not bundled.' },
        { q: 'What does `{0 && <b>x</b>}` render?', options: ['Nothing', 'The character `0`', 'The element `<b>x</b>`', 'It throws'], correct: 1, why: 'Falsy values other than numbers render nothing; `0` and `NaN` render as text.' },
        { q: 'Why does React throw on the next render after `if (x) useState()`?', options: ['Conditions in hooks are slow', 'The hook slot order broke', 'useState needs a key', 'Hooks only work in classes'], correct: 1, why: 'Hook slots are matched by call order; the number of calls changed.' },
        { q: 'In which order do the parent and child `useEffect` run after mounting?', options: ['The parent first', 'The child first', 'In declaration order', 'At the same time'], correct: 1, why: 'The commit and effects go bottom-up.' },
        { q: 'Where does a click from a portal bubble?', options: ['Only to `document.body`', 'To the portal React parent', 'Nowhere', 'To `window`, skipping React'], correct: 1, why: 'A portal moves the DOM, not the React tree.' },
        { q: 'How do you keep a guest off a page before render in React Router 8?', options: ['A useEffect calling navigate', '`throw redirect()` in a loader', 'Hide the whole page with CSS', 'A check inside onClick'], correct: 1, why: 'The loader runs before render, so the redirect keeps the page from flashing; middleware for route groups.' },
        { q: 'Which Testing Library query comes first by priority?', options: ['`getByTestId` with an id', '`getByText` with a text', '`getByRole` with a name', '`querySelector` on a node'], correct: 2, why: 'Role and accessible name find an element the way a user and a screen reader do.' },
      ],
    },
  },
}
