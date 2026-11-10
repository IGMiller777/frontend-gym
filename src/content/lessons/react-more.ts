import type { Source } from '../sources'
import type { Lesson } from './types'

/** React lessons added in the coverage pass (Notion topics + interview essentials); ordered in react.ts. */
const docs = (title: string, path: string): Source => ({ title: `react.dev: ${title}`, url: `https://react.dev/${path}`, kind: 'official' })
const verified = { date: '2026-11', version: 'React 19.3, React Router 8.5, TanStack Query 5' }

export const reactMoreLessons: Lesson[] = [
  {
    id: 'react-jsx-components',
    track: 'react',
    emoji: '🧱',
    minutes: 14,
    title: { ru: 'JSX и компоненты', en: 'JSX and components' },
    summary: {
      ru: 'Правила JSX, условный рендер и ловушка с нулём, пропсы и children, PropTypes и defaultProps в React 19, React без JSX, классовые компоненты и жизненный цикл.',
      en: 'JSX rules, conditional rendering and the zero trap, props and children, PropTypes and defaultProps in React 19, React without JSX, class components and the lifecycle.',
    },
    quiz: {
      ru: [
        { q: 'Что отрисует `{items.length && <List />}` при пустом массиве?', options: ['Ничего не отрисует', 'Число `0`', 'Пустой `<List />`', 'Бросит ошибку'], correct: 1, why: '`false`, `null` и `undefined` не рисуются, а число `0` рисуется; условие приводят к булеву значению.' },
        { q: 'Почему компонент не должен менять свои пропсы?', options: ['Это замедляет рендер', 'Пропсы принадлежат родителю', 'Иначе сломается JSX', 'Так требует TypeScript'], correct: 1, why: 'Данные идут сверху вниз; в разработке React замораживает объект пропсов, и запись бросает ошибку.' },
        { q: 'Чем заменить `componentWillUnmount` в функциональном компоненте?', options: ['`useMemo` с пустым массивом', '`useLayoutEffect` без deps', 'Очисткой, возвращённой из эффекта', 'Вызовом `root.unmount()`'], correct: 2, why: 'Функция, которую возвращает эффект, вызывается при размонтировании и перед повторным запуском.' },
        { q: 'Что React 19 сделал с `defaultProps` у функциональных компонентов?', options: ['Сделал обязательными', 'Перестал их учитывать', 'Перенёс в TypeScript', 'Ничего не поменял'], correct: 1, why: 'У функций значения по умолчанию задают деструктуризацией; `defaultProps` остался только у классов.' },
      ],
      en: [
        { q: 'What does `{items.length && <List />}` render for an empty array?', options: ['It renders nothing', 'The number `0`', 'An empty `<List />`', 'It throws an error'], correct: 1, why: '`false`, `null` and `undefined` render nothing, but the number `0` is rendered; convert the condition to a boolean.' },
        { q: 'Why must a component not change its props?', options: ['It slows down rendering', 'Props belong to the parent', 'Otherwise JSX breaks', 'TypeScript requires it'], correct: 1, why: 'Data flows down; in development React freezes the props object, and a write throws.' },
        { q: 'What replaces `componentWillUnmount` in a function component?', options: ['`useMemo` with an empty array', '`useLayoutEffect` with no deps', 'The cleanup returned by an effect', 'Calling `root.unmount()`'], correct: 2, why: 'The function an effect returns runs on unmount and before the effect re-runs.' },
        { q: 'What did React 19 do to `defaultProps` on function components?', options: ['Made them required', 'Stopped applying them', 'Moved them to TypeScript', 'Changed nothing'], correct: 1, why: 'Functions use destructuring defaults; `defaultProps` remains only for classes.' },
      ],
    },
    sources: [
      docs('Writing markup with JSX', 'learn/writing-markup-with-jsx'),
      docs('Conditional rendering', 'learn/conditional-rendering'),
      docs('Passing props to a component', 'learn/passing-props-to-a-component'),
      docs('React 19 upgrade guide: removed propTypes and defaultProps', 'blog/2024/04/25/react-19-upgrade-guide#removed-proptypes-and-defaultprops'),
      docs('Component (class components)', 'reference/react/Component'),
      docs('createElement', 'reference/react/createElement'),
    ],
    verified,
  },
  {
    id: 'react-hooks',
    track: 'react',
    emoji: '🪝',
    minutes: 15,
    title: { ru: 'Хуки: устройство, правила, свои хуки', en: 'Hooks: internals, rules, custom hooks' },
    summary: {
      ru: 'Зачем хуки, список ячеек и правила хуков, ветвление, useReducer, контекст и use, ref как проп и useImperativeHandle, useId, useSyncExternalStore, свои хуки.',
      en: 'Why hooks, the list of slots and the rules of hooks, branching, useReducer, context and use, ref as a prop and useImperativeHandle, useId, useSyncExternalStore, custom hooks.',
    },
    quiz: {
      ru: [
        { q: 'Почему хуки нельзя вызывать в условии?', options: ['Условия в JSX запрещены совсем', 'Хуки работают только в классах', 'Так быстрее работает линтер', 'Хуки сверяются по порядку вызова'], correct: 3, why: 'Ячейки хуков хранятся списком без имён; другой порядок или число вызовов отдаст значения не тем хукам.' },
        { q: 'Какой из этих вызовов можно делать внутри `if`?', options: ['`useState`', '`useEffect`', '`use(Context)`', '`useMemo`'], correct: 2, why: '`use` читает ресурс (промис или контекст), а не хранит ячейку, поэтому его разрешено вызывать в условиях.' },
        { q: 'Два компонента вызывают один и тот же свой хук. Что они делят?', options: ['Общее состояние', 'Только код логики', 'Один экземпляр эффекта', 'Общий ref'], correct: 1, why: 'Каждый вызов хука получает свои ячейки; чтобы разделить состояние, его поднимают или кладут во внешний стор.' },
        { q: 'Зачем `useSyncExternalStore`?', options: ['Ускорить работу useState', 'Синхронизировать вкладки', 'Читать внешний стор без tearing', 'Заменить useEffect для запросов'], correct: 2, why: 'Он гарантирует, что при конкурентном рендере все компоненты видят одно значение внешнего источника.' },
      ],
      en: [
        { q: 'Why can hooks not be called inside a condition?', options: ['JSX forbids any conditions', 'Hooks only work in classes', 'It makes the linter faster', 'Hooks are matched by call order'], correct: 3, why: 'Hook slots are stored as a nameless list; a different order or count hands values to the wrong hooks.' },
        { q: 'Which of these calls is allowed inside an `if`?', options: ['`useState`', '`useEffect`', '`use(Context)`', '`useMemo`'], correct: 2, why: '`use` reads a resource (a promise or context) instead of holding a slot, so it may be called conditionally.' },
        { q: 'Two components call the same custom hook. What do they share?', options: ['Common state', 'Only the logic code', 'One effect instance', 'A shared ref'], correct: 1, why: 'Every hook call gets its own slots; to share state, lift it up or put it in an external store.' },
        { q: 'What is `useSyncExternalStore` for?', options: ['Making useState run faster', 'Syncing open browser tabs', 'Reading a store without tearing', 'Replacing useEffect for fetching'], correct: 2, why: 'It guarantees that during concurrent rendering every component sees the same value of the external source.' },
      ],
    },
    sources: [
      docs('Rules of Hooks', 'reference/rules/rules-of-hooks'),
      docs('Reusing logic with custom Hooks', 'learn/reusing-logic-with-custom-hooks'),
      docs('useReducer', 'reference/react/useReducer'),
      docs('use', 'reference/react/use'),
      docs('useImperativeHandle', 'reference/react/useImperativeHandle'),
      docs('useSyncExternalStore', 'reference/react/useSyncExternalStore'),
      docs('useId', 'reference/react/useId'),
    ],
    verified,
  },
  {
    id: 'react-internals',
    track: 'react',
    emoji: '🔬',
    minutes: 14,
    title: { ru: 'Под капотом: Virtual DOM, Fiber, конкурентный рендер', en: 'Under the hood: Virtual DOM, Fiber, concurrent rendering' },
    summary: {
      ru: 'Зачем Virtual DOM, stack reconciler и Fiber, деревья current и work-in-progress, фазы рендера и фиксации, приоритеты, tearing, батчинг от React 17 к 18 и flushSync.',
      en: 'Why a Virtual DOM, the stack reconciler and Fiber, current and work-in-progress trees, render and commit phases, priorities, tearing, batching from React 17 to 18 and flushSync.',
    },
    quiz: {
      ru: [
        { q: 'Какую проблему решил Fiber?', options: ['Большой размер бандла', 'Нельзя было прервать рендер', 'Отсутствие хуков в классах', 'Медленный серверный рендер'], correct: 1, why: 'Старый рекурсивный алгоритм занимал поток до конца; Fiber делит работу на единицы и может уступать поток.' },
        { q: 'В каком порядке выполняются эффекты родителя и ребёнка?', options: ['Родитель, потом ребёнок', 'Ребёнок, потом родитель', 'В случайном порядке', 'Одновременно в микрозадаче'], correct: 1, why: 'Фиксация идёт снизу вверх: родитель видит уже готовых детей.' },
        { q: 'Сколько рендеров дадут два `setState` в `setTimeout` при `createRoot`?', options: ['Ноль', 'Один', 'Два', 'Зависит от браузера'], correct: 1, why: 'С React 18 батчинг автоматический везде, не только в обработчиках событий.' },
        { q: 'Какая фаза может выполниться несколько раз для одного обновления?', options: ['Фиксация в DOM', 'Вызов useEffect', 'Рендер компонентов', 'Ref-колбэки'], correct: 2, why: 'Рендер чистый и может быть прерван или повторён; фиксация синхронна и выполняется один раз.' },
      ],
      en: [
        { q: 'Which problem did Fiber solve?', options: ['A large bundle size', 'Render could not pause', 'No hooks in classes', 'Slow server rendering'], correct: 1, why: 'The old recursive algorithm held the thread to the end; Fiber splits work into units and can yield.' },
        { q: 'In which order do parent and child effects run?', options: ['Parent, then child', 'Child, then parent', 'In random order', 'Together in a microtask'], correct: 1, why: 'The commit goes bottom-up: a parent sees its children already set up.' },
        { q: 'How many renders do two `setState` calls in a `setTimeout` cause with `createRoot`?', options: ['Zero', 'One', 'Two', 'Depends on the browser'], correct: 1, why: 'Since React 18 batching is automatic everywhere, not only in event handlers.' },
        { q: 'Which phase can run more than once for one update?', options: ['The DOM commit', 'Running useEffect', 'Rendering components', 'Ref callbacks'], correct: 2, why: 'Rendering is pure and may be interrupted or repeated; the commit is synchronous and runs once.' },
      ],
    },
    sources: [
      docs('Render and commit', 'learn/render-and-commit'),
      docs('Preserving and resetting state', 'learn/preserving-and-resetting-state'),
      docs('React 18: automatic batching', 'blog/2022/03/29/react-v18#new-feature-automatic-batching'),
      docs('flushSync', 'reference/react-dom/flushSync'),
      docs('useTransition', 'reference/react/useTransition'),
      docs('useSyncExternalStore', 'reference/react/useSyncExternalStore'),
    ],
    verified,
  },
  {
    id: 'react-forms',
    track: 'react',
    emoji: '📝',
    minutes: 12,
    title: { ru: 'Формы и детали событий', en: 'Forms and event details' },
    summary: {
      ru: 'Перехват и всплытие, события без всплытия, фокус, ловушки управляемых полей, валидация браузера, React Hook Form, TanStack Form и схемы, доступные ошибки.',
      en: 'Capture and bubbling, events that do not bubble, focus, controlled field pitfalls, browser validation, React Hook Form, TanStack Form and schemas, accessible errors.',
    },
    quiz: {
      ru: [
        { q: 'В каком порядке сработают `onClickCapture` и `onClick` у родителя и кнопки?', options: ['Кнопка, родитель, затем перехваты', 'Перехваты сверху, затем всплытие', 'Родитель, кнопка, затем перехваты', 'Только обработчики самой кнопки'], correct: 1, why: 'Сначала перехват сверху вниз, затем всплытие снизу вверх.' },
        { q: 'Какое событие React не всплывает?', options: ['`onClick`', '`onFocus`', '`onMouseEnter`', '`onKeyDown`'], correct: 2, why: '`onMouseEnter` и `onMouseLeave` не всплывают; `onFocus` в React всплывает (focusin).' },
        { q: 'Что вернёт `e.target.value` у `<input type="number">`?', options: ['Число', 'Строку', '`NaN` без ввода', 'Объект ValidityState'], correct: 1, why: 'Значение поля всегда строка; число дают `valueAsNumber` или явное преобразование.' },
        { q: 'Почему React Hook Form быстрее формы на `useState`?', options: ['Он хранит поля в Redux', 'Он отключает валидацию', 'Ввод не рендерит всю форму', 'Он работает в веб-воркере'], correct: 2, why: 'Значения живут в DOM, а рендерятся только части, подписанные на ошибки и состояние.' },
      ],
      en: [
        { q: 'In which order do `onClickCapture` and `onClick` fire on a parent and a button?', options: ['Button, parent, then the captures', 'Captures top-down, then bubbling', 'Parent, button, then the captures', 'Only the handlers of the button'], correct: 1, why: 'Capture goes top-down first, then bubbling goes bottom-up.' },
        { q: 'Which React event does not bubble?', options: ['`onClick`', '`onFocus`', '`onMouseEnter`', '`onKeyDown`'], correct: 2, why: '`onMouseEnter` and `onMouseLeave` do not bubble; `onFocus` bubbles in React (focusin).' },
        { q: 'What does `e.target.value` return for `<input type="number">`?', options: ['A number', 'A string', '`NaN` without input', 'A ValidityState object'], correct: 1, why: 'A field value is always a string; `valueAsNumber` or an explicit conversion gives a number.' },
        { q: 'Why is React Hook Form faster than a `useState` form?', options: ['It keeps every field in Redux', 'It turns form validation off', 'Typing does not re-render it', 'It runs inside a web worker'], correct: 2, why: 'Values live in the DOM, and only the parts subscribed to errors and state re-render.' },
      ],
    },
    sources: [
      docs('Responding to events: capture phase events', 'learn/responding-to-events#capture-phase-events'),
      docs('Common components: React event object', 'reference/react-dom/components/common#react-event-object'),
      docs('<input>: controlling an input with a state variable', 'reference/react-dom/components/input#controlling-an-input-with-a-state-variable'),
      { title: 'MDN: Client-side form validation', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation', kind: 'official' },
      { title: 'TanStack Form', url: 'https://tanstack.com/form/latest/docs/overview', kind: 'official' },
    ],
    verified,
  },
  {
    id: 'react-patterns',
    track: 'react',
    emoji: '🧩',
    minutes: 14,
    title: { ru: 'Паттерны: контекст, составные компоненты, порталы', en: 'Patterns: context, compound components, portals' },
    summary: {
      ru: 'Композиция и слоты, когда нужен контекст, провайдер со своим хуком, составные компоненты, управляемый и неуправляемый API, порталы, HOC и render props сегодня.',
      en: 'Composition and slots, when context fits, a provider with its own hook, compound components, controlled and uncontrolled APIs, portals, HOCs and render props today.',
    },
    quiz: {
      ru: [
        { q: 'Для каких данных контекст подходит хуже всего?', options: ['Тема оформления сайта', 'Текущий пользователь', 'Поле поиска при вводе', 'Язык интерфейса сайта'], correct: 2, why: 'Каждое новое значение рендерит всех читателей; частые изменения держат локально или во внешнем сторе.' },
        { q: 'Зачем свой хук `useCart` бросает ошибку без провайдера?', options: ['Чтобы рендер шёл быстрее', 'Забытый провайдер станет заметен', 'Так требует `createContext`', 'Чтобы спрятать данные корзины'], correct: 1, why: 'Иначе компонент тихо получит значение по умолчанию и сломается позже в непонятном месте.' },
        { q: 'Куда всплывёт клик из портала, рендеренного в `document.body`?', options: ['Только до `body`', 'К React-родителю портала', 'Никуда, порталы изолированы', 'Только в нативные слушатели'], correct: 1, why: 'Портал меняет место в DOM, но не в дереве React, и события всплывают по дереву React.' },
        { q: 'Чем сегодня обычно заменяют HOC?', options: ['Классами', 'Своими хуками', 'Порталами', 'Контекстом без провайдера'], correct: 1, why: 'Хук переиспользует логику без обёрток в дереве и неявных пропсов.' },
      ],
      en: [
        { q: 'Which data fits context worst?', options: ['The site color theme', 'The current user', 'Search text while typing', 'The interface language'], correct: 2, why: 'Every new value re-renders all readers; frequent changes stay local or in an external store.' },
        { q: 'Why does a custom `useCart` hook throw without a provider?', options: ['So that rendering gets faster', 'A missing provider is obvious', 'Because `createContext` needs it', 'To hide the cart data inside'], correct: 1, why: 'Otherwise the component silently gets the default value and fails later in an obscure place.' },
        { q: 'Where does a click from a portal rendered into `document.body` bubble?', options: ['Only up to `body`', 'To the portal React parent', 'Nowhere: portals are isolated', 'Only to native DOM listeners'], correct: 1, why: 'A portal moves the DOM, not the React tree, and events bubble along the React tree.' },
        { q: 'What usually replaces a HOC today?', options: ['Classes', 'Custom hooks', 'Portals', 'Context without a provider'], correct: 1, why: 'A hook reuses logic without wrappers in the tree or implicit props.' },
      ],
    },
    sources: [
      docs('Passing data deeply with context', 'learn/passing-data-deeply-with-context'),
      docs('Scaling up with reducer and context', 'learn/scaling-up-with-reducer-and-context'),
      docs('createPortal', 'reference/react-dom/createPortal'),
      docs('Sharing state between components', 'learn/sharing-state-between-components'),
      docs('Passing JSX as children', 'learn/passing-props-to-a-component#passing-jsx-as-children'),
    ],
    verified,
  },
  {
    id: 'react-router',
    track: 'react',
    emoji: '🧭',
    minutes: 13,
    title: { ru: 'Роутинг: React Router 8', en: 'Routing: React Router 8' },
    summary: {
      ru: 'Клиентский роутинг и History API, режимы Declarative, Data и Framework, вложенные маршруты, загрузчики и действия, редиректы и ошибки, хуки, ленивые маршруты, что изменилось с v5.',
      en: 'Client routing and the History API, Declarative, Data and Framework modes, nested routes, loaders and actions, redirects and errors, hooks, lazy routes, what changed since v5.',
    },
    quiz: {
      ru: [
        { q: 'Откуда в React Router 8 импортируют `RouterProvider`?', options: ['`react-router-dom`', '`react-router/dom`', '`react-dom/router`', '`@react-router/dev`'], correct: 1, why: 'В v8 пакет `react-router-dom` удалён; DOM-часть живёт в `react-router/dom`, остальное в `react-router`.' },
        { q: 'Где лучше проверить, что пользователь вошёл, перед показом страницы?', options: ['В useEffect самой страницы', 'В loader или middleware', 'В CSS-классе страницы', 'В обработчике клика'], correct: 1, why: 'Проверка до рендера: `throw redirect()` не даёт странице мелькнуть.' },
        { q: 'Что заменило `useHistory().push`?', options: ['`useLocation()`', '`useNavigate()`', '`useParams()`', '`window.location`'], correct: 1, why: '`navigate(path)` или `navigate(-1)`; объект history из v5 убран в v6.' },
        { q: 'Где хранить фильтры списка, чтобы ссылкой можно было поделиться?', options: ['В локальном useState', 'В поисковой строке', 'В общем контексте', 'В sessionStorage'], correct: 1, why: 'Поисковая строка переживает перезагрузку и копируется вместе со ссылкой.' },
      ],
      en: [
        { q: 'Where is `RouterProvider` imported from in React Router 8?', options: ['`react-router-dom`', '`react-router/dom`', '`react-dom/router`', '`@react-router/dev`'], correct: 1, why: 'v8 removed `react-router-dom`; the DOM part lives in `react-router/dom`, the rest in `react-router`.' },
        { q: 'Where is it best to check login before showing a page?', options: ['In the page useEffect', 'In the loader or middleware', 'In a CSS class name', 'In a click handler'], correct: 1, why: 'A check before rendering: `throw redirect()` keeps the page from flashing.' },
        { q: 'What replaced `useHistory().push`?', options: ['`useLocation()`', '`useNavigate()`', '`useParams()`', '`window.location`'], correct: 1, why: '`navigate(path)` or `navigate(-1)`; the v5 history object was removed in v6.' },
        { q: 'Where do list filters go so the link can be shared?', options: ['In a local useState', 'In URL search params', 'In a shared context', 'In sessionStorage'], correct: 1, why: 'Search params survive a reload and travel with the link.' },
      ],
    },
    sources: [
      { title: 'React Router: Picking a mode', url: 'https://reactrouter.com/start/modes', kind: 'official' },
      { title: 'React Router: Data loading', url: 'https://reactrouter.com/start/data/data-loading', kind: 'official' },
      { title: 'React Router: Upgrading to v8', url: 'https://reactrouter.com/upgrading/v7', kind: 'official' },
      { title: 'MDN: History API', url: 'https://developer.mozilla.org/en-US/docs/Web/API/History_API', kind: 'official' },
    ],
    verified,
  },
  {
    id: 'react-data',
    track: 'react',
    emoji: '🔄',
    minutes: 14,
    title: { ru: 'Данные с сервера: TanStack Query, MSW, WebSocket', en: 'Server data: TanStack Query, MSW, WebSocket' },
    summary: {
      ru: 'Почему не useEffect, TanStack Query (ключи, свежесть, мутации, инвалидация), загрузчики роутера и серверные компоненты, MSW, WebSocket и Server-Sent Events.',
      en: 'Why not useEffect, TanStack Query (keys, freshness, mutations, invalidation), router loaders and Server Components, MSW, WebSocket and Server-Sent Events.',
    },
    quiz: {
      ru: [
        { q: 'Два компонента вызвали `useQuery` с одним ключом одновременно. Сколько запросов?', options: ['Ноль', 'Один', 'Два', 'Зависит от staleTime'], correct: 1, why: 'Запросы с одним ключом объединяются, оба компонента получают один ответ из кэша.' },
        { q: 'Что сделать после успешной мутации, чтобы список обновился?', options: ['Перезагрузить страницу', 'Инвалидировать его ключ', 'Увеличить gcTime', 'Обнулить staleTime'], correct: 1, why: '`invalidateQueries` помечает данные устаревшими и перезагружает активные запросы.' },
        { q: 'Чем MSW лучше `vi.mock("./api")` в тестах?', options: ['Он работает быстрее', 'Не нужны обработчики', 'Проверяет путь запроса', 'Работает без fetch вовсе'], correct: 2, why: 'Код делает обычный `fetch`, и проверяются URL, метод, заголовки и разбор ответа.' },
        { q: 'Где закрывать WebSocket, открытый в эффекте?', options: ['Прямо в рендере', 'В очистке эффекта', 'В обработчике клика', 'Нигде: закроет браузер'], correct: 1, why: 'Иначе при каждом монтировании и в StrictMode останется лишнее соединение.' },
      ],
      en: [
        { q: 'Two components call `useQuery` with one key at once. How many requests?', options: ['Zero', 'One', 'Two', 'Depends on staleTime'], correct: 1, why: 'Requests with the same key are deduplicated, and both components get one answer from the cache.' },
        { q: 'What do you do after a successful mutation so the list updates?', options: ['Reload the page', 'Invalidate its key', 'Increase gcTime', 'Set staleTime to zero'], correct: 1, why: '`invalidateQueries` marks the data stale and refetches active queries.' },
        { q: 'Why is MSW better than `vi.mock("./api")` in tests?', options: ['It runs faster', 'It needs no handlers', 'It tests the request path', 'It works with no fetch'], correct: 2, why: 'The code makes a normal `fetch`, so the URL, method, headers and response parsing are tested.' },
        { q: 'Where do you close a WebSocket opened in an effect?', options: ['In render', 'In the effect cleanup', 'In a click handler', 'Nowhere, the browser does it'], correct: 1, why: 'Otherwise every mount, and StrictMode, leaves an extra connection.' },
      ],
    },
    sources: [
      { title: 'TanStack Query: Overview', url: 'https://tanstack.com/query/latest/docs/framework/react/overview', kind: 'official' },
      { title: 'TanStack Query: Query invalidation', url: 'https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation', kind: 'official' },
      docs('You might not need an effect: fetching data', 'learn/you-might-not-need-an-effect#fetching-data'),
      { title: 'MDN: EventSource', url: 'https://developer.mozilla.org/en-US/docs/Web/API/EventSource', kind: 'official' },
      { title: 'MDN: WebSocket', url: 'https://developer.mozilla.org/en-US/docs/Web/API/WebSocket', kind: 'official' },
    ],
    verified,
  },
  {
    id: 'react-debugging',
    track: 'react',
    emoji: '🐞',
    minutes: 12,
    title: { ru: 'Частые ошибки и отладка', en: 'Common mistakes and debugging' },
    summary: {
      ru: 'Мутация состояния, бесконечный рендер, устаревшие замыкания, лишнее состояние и эффекты, React DevTools и Profiler, компонент Profiler, StrictMode и сообщения React.',
      en: 'State mutation, infinite renders, stale closures, redundant state and effects, React DevTools and the Profiler, the Profiler component, StrictMode and React messages.',
    },
    quiz: {
      ru: [
        { q: 'Почему `items.push(x); setItems(items)` не обновляет экран?', options: ['Метод push асинхронный', 'Ссылка та же, React пропускает', 'setItems ждёт только функцию', 'Не хватает вызова forceUpdate'], correct: 1, why: 'React сравнивает состояние по `Object.is`; нужен новый массив.' },
        { q: 'Что вызывает «Too many re-renders»?', options: ['Слишком много компонентов', 'Медленный компьютер', 'setState прямо в рендере', 'Отсутствие key у списка'], correct: 2, why: 'Рендер ставит обновление, обновление запускает рендер, и так без конца.' },
        { q: 'Двойной запрос из эффекта только в разработке. Что это значит?', options: ['Это баг самого React', 'Не хватает очистки', 'Надо выключить StrictMode', 'Сервер отвечает медленно'], correct: 1, why: 'StrictMode монтирует компонент дважды, чтобы показать отсутствие очистки.' },
        { q: 'Что показывает вкладка Profiler в React DevTools?', options: ['Все сетевые запросы', 'Утечки памяти в куче', 'Размер JS-бандла', 'Причины и время рендеров'], correct: 3, why: 'Она записывает коммиты, время рендера и причину каждого рендера.' },
      ],
      en: [
        { q: 'Why does `items.push(x); setItems(items)` not update the screen?', options: ['The push method is async', 'Same reference, React skips', 'setItems takes only a function', 'A forceUpdate call is missing'], correct: 1, why: 'React compares state with `Object.is`; a new array is needed.' },
        { q: 'What causes "Too many re-renders"?', options: ['Too many components', 'A slow computer', 'setState during render', 'A missing key in a list'], correct: 2, why: 'Render queues an update, the update triggers a render, and so on forever.' },
        { q: 'An effect fetches twice only in development. What does it mean?', options: ['A bug in React itself', 'It lacks a cleanup', 'StrictMode must go off', 'The server is slow'], correct: 1, why: 'StrictMode mounts the component twice to reveal a missing cleanup.' },
        { q: 'What does the Profiler tab in React DevTools show?', options: ['All network requests', 'Memory leaks in the heap', 'The JS bundle size', 'Render causes and times'], correct: 3, why: 'It records commits, render times and the reason for each render.' },
      ],
    },
    sources: [
      docs('Updating arrays in state', 'learn/updating-arrays-in-state'),
      docs('Choosing the state structure', 'learn/choosing-the-state-structure'),
      docs('Profiler', 'reference/react/Profiler'),
      docs('StrictMode', 'reference/react/StrictMode'),
      docs('React Developer Tools', 'learn/react-developer-tools'),
    ],
    verified,
  },
  {
    id: 'react-a11y-testing',
    track: 'react',
    emoji: '🧪',
    minutes: 13,
    title: { ru: 'Доступность и тесты', en: 'Accessibility and testing' },
    summary: {
      ru: 'Частые ошибки доступности в JSX, фокус в SPA, живые регионы, уровни тестов, Testing Library и приоритет запросов, user-event, renderHook, MSW, Playwright.',
      en: 'Common accessibility mistakes in JSX, focus in an SPA, live regions, test levels, Testing Library and query priority, user-event, renderHook, MSW, Playwright.',
    },
    quiz: {
      ru: [
        { q: 'Какой запрос Testing Library предпочтительнее всего?', options: ['`getByTestId`', '`getByRole` с именем', '`container.querySelector`', '`getByText`'], correct: 1, why: 'Роль и доступное имя ищут элемент как пользователь и скринридер.' },
        { q: 'Чем `<div onClick>` хуже `<button>`?', options: ['Медленнее рендерится', 'Нет фокуса, Enter и роли', 'Не стилизуется', 'Не всплывает клик'], correct: 1, why: 'Кнопка получает фокус, нажимается с клавиатуры и объявляется скринридером как кнопка.' },
        { q: 'Как проверить, что элемента нет на экране?', options: ['`getBy...` в try', '`queryBy...` и `null`', '`findBy...` с таймаутом', '`getAllBy...` пустой'], correct: 1, why: '`queryBy` возвращает `null`, а `getBy` бросает ошибку.' },
        { q: 'Какие тесты дают больше всего пользы за свою цену?', options: ['Снимки всей разметки', 'Тесты компонентов', 'Только тесты E2E', 'Тесты приватных методов'], correct: 1, why: 'Они проверяют настоящее поведение с детьми и сетью (MSW) и остаются быстрыми.' },
      ],
      en: [
        { q: 'Which Testing Library query is most preferred?', options: ['`getByTestId`', '`getByRole` with a name', '`container.querySelector`', '`getByText`'], correct: 1, why: 'Role and accessible name find the element like a user and a screen reader do.' },
        { q: 'Why is `<div onClick>` worse than `<button>`?', options: ['It renders slower', 'No focus, Enter or role', 'It cannot be styled', 'Its click does not bubble'], correct: 1, why: 'A button is focusable, works with the keyboard and is announced as a button.' },
        { q: 'How do you check an element is not on the screen?', options: ['`getBy...` in a try', '`queryBy...` and `null`', '`findBy...` with a timeout', 'An empty `getAllBy...`'], correct: 1, why: '`queryBy` returns `null`, while `getBy` throws.' },
        { q: 'Which tests give the most value for their cost?', options: ['Snapshots of all markup', 'Component tests', 'Only end-to-end tests', 'Tests of private methods'], correct: 1, why: 'They test real behavior with children and the network (MSW) and stay fast.' },
      ],
    },
    sources: [
      { title: 'Testing Library: Which query should I use?', url: 'https://testing-library.com/docs/queries/about/#priority', kind: 'official' },
      { title: 'Testing Library: user-event', url: 'https://testing-library.com/docs/user-event/intro', kind: 'official' },
      { title: 'Testing Library: renderHook', url: 'https://testing-library.com/docs/react-testing-library/api#renderhook', kind: 'official' },
      { title: 'Playwright: Locators', url: 'https://playwright.dev/docs/locators', kind: 'official' },
      { title: 'MDN: ARIA live regions', url: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions', kind: 'official' },
      { title: 'Vitest: Browser Mode', url: 'https://vitest.dev/guide/browser/', kind: 'official' },
    ],
    verified,
  },
]
