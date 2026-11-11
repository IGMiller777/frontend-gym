import type { Source } from '../sources'
import type { Lesson, Module } from './types'

const src = (title: string, url: string): Source => ({ title, url, kind: 'official' })
const redux = (title: string, path: string) => src(`redux.js.org: ${title}`, `https://redux.js.org/${path}`)
const rtk = (title: string, path: string) => src(`redux-toolkit.js.org: ${title}`, `https://redux-toolkit.js.org/${path}`)
const tanstack = (title: string, path: string) => src(`tanstack.com: ${title}`, `https://tanstack.com/query/latest/docs/framework/react/${path}`)
const react = (title: string, path: string) => src(`react.dev: ${title}`, `https://react.dev/${path}`)
const ngrx = (title: string, path: string) => src(`ngrx.io: ${title}`, `https://ngrx.io/${path}`)
const verified = { date: '2026-11', version: 'Redux Toolkit 2.14, TanStack Query 5.107, Zustand 5, Jotai 3, MobX 7, XState 5.33, NgRx 22' }

export const stateLessons: Lesson[] = [
  {
    id: 'state-kinds',
    track: 'state',
    emoji: '🧭',
    minutes: 12,
    title: { ru: 'Виды состояния и где его держать', en: 'Kinds of state and where to keep them' },
    summary: {
      ru: 'Зачем менеджер состояний, серверное, клиентское, адрес, форма, производное и эфемерное состояние, копия пропса в useState, колокация и подъём, фильтры в адресе.',
      en: 'Why a state manager, server, client, URL, form, derived and ephemeral state, a prop copied into useState, colocation and lifting, filters in the URL.',
    },
    quiz: {
      ru: [
        { q: 'Где держать список заказов, загруженный с сервера?', options: ['В Redux вместе с `isLoading`', 'В `localStorage` браузера', 'В библиотеке запросов', 'В контексте React'], correct: 2, why: 'Серверные данные это кэш: устаревание, дедупликация, повторная загрузка решаются библиотекой запросов.' },
        { q: 'Что покажет `useState(price)`, когда родитель передаст новую цену?', options: ['Прежнюю цену', 'Новую цену', 'Значение `undefined`', 'Ошибку в консоли'], correct: 0, why: 'Пропс используется только как начальное значение; производное вычисляют в рендере.' },
        { q: 'Где хранить фильтры и номер страницы выдачи?', options: ['В глобальном сторе', 'В `sessionStorage`', 'В локальном `useState`', 'В адресе страницы'], correct: 3, why: 'Адрес даёт ссылку, переживает перезагрузку и работает с кнопкой «Назад».' },
        { q: 'Состояние нужно двум соседним компонентам. Что сделать в первую очередь?', options: ['Завести глобальный стор', 'Поднять в общего предка', 'Скопировать в оба', 'Передать через `window`'], correct: 1, why: 'Подъём состояния в ближайшего общего предка; стор нужен, когда данные нужны разным веткам надолго.' },
      ],
      en: [
        { q: 'Where do you keep an order list loaded from the server?', options: ['In Redux with `isLoading`', 'In browser `localStorage`', 'In a query library', 'In a React context'], correct: 2, why: 'Server data is a cache: staleness, deduplication and refetching are solved by a query library.' },
        { q: 'What does `useState(price)` show when the parent passes a new price?', options: ['The old price', 'The new price', 'The value `undefined`', 'An error in the console'], correct: 0, why: 'The prop is only the initial value; derived values are computed during render.' },
        { q: 'Where do you keep result filters and the page number?', options: ['In a global store', 'In `sessionStorage`', 'In local `useState`', 'In the page URL'], correct: 3, why: 'The URL gives a link, survives reloads and works with the Back button.' },
        { q: 'Two sibling components need some state. What comes first?', options: ['Create a global store', 'Lift it to the parent', 'Copy it into both', 'Pass it via `window`'], correct: 1, why: 'Lift state to the nearest common parent; a store is for data many branches need for long.' },
      ],
    },
    sources: [
      react('Choosing the state structure', 'learn/choosing-the-state-structure'),
      react('Sharing state between components', 'learn/sharing-state-between-components'),
      tanstack('Does TanStack Query replace Redux?', 'guides/does-this-replace-client-state'),
      src('reactrouter.com: useSearchParams', 'https://reactrouter.com/api/hooks/useSearchParams'),
    ],
    verified,
  },
  {
    id: 'state-machines',
    track: 'state',
    emoji: '🚦',
    minutes: 11,
    title: { ru: 'Конечные автоматы и невозможные состояния', en: 'State machines and impossible states' },
    summary: {
      ru: 'Флаги против статуса, размеченные объединения, редьюсер-автомат, который отсекает устаревшие ответы, XState с guards и invoke.',
      en: 'Flags versus a status, discriminated unions, a reducer machine that drops stale responses, XState with guards and invoke.',
    },
    quiz: {
      ru: [
        { q: 'Чем плохи флаги `isLoading` и `isError`?', options: ['Заметно замедляют рендер', 'Допускают невозможные сочетания', 'Не работают в строгом TypeScript', 'Не сериализуются в JSON'], correct: 1, why: 'Независимые флаги дают состояния вроде «загружается и ошибка одновременно».' },
        { q: 'Как редьюсер поиска отсекает ответ на старый запрос?', options: ['Сравнивает `requestId`', 'Через `setTimeout`', 'Сортирует ответы', 'Повторяет запрос'], correct: 0, why: 'Ответ принимается, только если его `requestId` совпадает с текущим запросом в состоянии `loading`.' },
        { q: 'Что делает XState с событием, которое в текущем состоянии не описано?', options: ['Бросает исключение', 'Ставит его в очередь', 'Переходит в начало', 'Ничего не меняет'], correct: 3, why: 'Непредусмотренное событие не вызывает перехода: автомат остаётся в том же состоянии.' },
        { q: 'Где TypeScript знает, что в `state` есть `data`?', options: ['Везде после проверки `null`', 'Только после `as`', "Внутри `case 'success'`", 'Нигде без `!`'], correct: 2, why: 'Размеченное объединение сужается по полю `status`.' },
      ],
      en: [
        { q: 'What is wrong with `isLoading` and `isError` flags?', options: ['They slow down every render', 'They allow impossible combos', 'They fail in strict TypeScript', 'They cannot be serialized'], correct: 1, why: 'Independent flags allow states like "loading and failed at once".' },
        { q: 'How does the search reducer drop a response to an old request?', options: ['It compares `requestId`', 'Through `setTimeout`', 'It sorts responses', 'It repeats the request'], correct: 0, why: 'A response is accepted only if its `requestId` matches the current request in the `loading` state.' },
        { q: 'What does XState do with an event the current state does not describe?', options: ['Throws an exception', 'Queues it for later', 'Goes to the start', 'Changes nothing'], correct: 3, why: 'An unexpected event causes no transition: the machine stays in the same state.' },
        { q: 'Where does TypeScript know that `state` has `data`?', options: ['Anywhere after a `null` check', 'Only after `as`', "Inside `case 'success'`", 'Nowhere without `!`'], correct: 2, why: 'A discriminated union narrows on the `status` field.' },
      ],
    },
    sources: [
      src('stately.ai: XState documentation', 'https://stately.ai/docs/xstate'),
      src('typescriptlang.org: Discriminated unions', 'https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions'),
      react('Choosing the state structure: avoid contradictions', 'learn/choosing-the-state-structure#avoid-contradictions-in-state'),
    ],
    verified,
  },
  {
    id: 'state-redux',
    track: 'state',
    emoji: '🔁',
    minutes: 14,
    title: { ru: 'Redux: принципы, actions, reducers, middleware', en: 'Redux: principles, actions, reducers, middleware' },
    summary: {
      ru: 'Однонаправленный поток и три принципа, createStore своими руками, actions, чистые неизменяемые reducers, middleware и thunk, connect против хуков.',
      en: 'One-way data flow and the three principles, createStore by hand, actions, pure immutable reducers, middleware and thunk, connect versus hooks.',
    },
    quiz: {
      ru: [
        { q: 'Что сделает Redux с `dispatch({ payload: 1 })`?', options: ['Проигнорирует action', 'Бросит ошибку', 'Вызовет все reducers', 'Сохранит в очередь'], correct: 1, why: 'Action без `type` Redux отвергает: «Actions may not have an undefined "type" property».' },
        { q: 'Reducer изменил `state.todos[0].done` и вернул `state`. Что увидит `useSelector`?', options: ['Новые данные', 'Ошибку мутации', 'Двойной рендер', 'Отсутствие изменений'], correct: 3, why: 'Ссылки остались прежними, а подписчики сравнивают по ссылке.' },
        { q: 'Что получает middleware первым аргументом?', options: ['`getState` и `dispatch`', 'Весь объект store', 'Текущий action', 'Функцию `next`'], correct: 0, why: 'Сигнатура `api => next => action`, где `api` это `{ getState, dispatch }`.' },
        { q: 'Устарел ли redux-thunk?', options: ['Да, удалён в Redux 5', 'Да, заменён Saga', 'Нет, включён в RTK', 'Да, работает только с connect'], correct: 2, why: '`configureStore` включает thunk по умолчанию, на нём построен `createAsyncThunk`.' },
      ],
      en: [
        { q: 'What does Redux do with `dispatch({ payload: 1 })`?', options: ['Ignores the action', 'Throws an error', 'Calls every reducer', 'Queues it for later'], correct: 1, why: 'Redux rejects an action without a `type`: "Actions may not have an undefined "type" property".' },
        { q: 'A reducer changed `state.todos[0].done` and returned `state`. What does `useSelector` see?', options: ['The new data', 'A mutation error', 'A double render', 'No change at all'], correct: 3, why: 'The references stayed the same, and subscribers compare by reference.' },
        { q: 'What does a middleware get as its first argument?', options: ['`getState` and `dispatch`', 'The whole store object', 'The current action', 'The `next` function'], correct: 0, why: 'The signature is `api => next => action`, where `api` is `{ getState, dispatch }`.' },
        { q: 'Is redux-thunk outdated?', options: ['Yes, removed in Redux 5', 'Yes, replaced by Saga', 'No, RTK includes it', 'Yes, works only with connect'], correct: 2, why: '`configureStore` includes thunk by default, and `createAsyncThunk` is built on it.' },
      ],
    },
    sources: [
      redux('Redux fundamentals: concepts and data flow', 'tutorials/fundamentals/part-2-concepts-data-flow'),
      redux('Three principles', 'understanding/thinking-in-redux/three-principles'),
      redux('Writing custom middleware', 'usage/writing-custom-middleware'),
      redux('Immutable update patterns', 'usage/structuring-reducers/immutable-update-patterns'),
      src('react-redux.js.org: Hooks', 'https://react-redux.js.org/api/hooks'),
    ],
    verified,
  },
  {
    id: 'state-rtk',
    track: 'state',
    emoji: '🧰',
    minutes: 14,
    title: { ru: 'Redux Toolkit', en: 'Redux Toolkit' },
    summary: {
      ru: 'createSlice и Immer, умолчания configureStore, createAsyncThunk с condition и rejectWithValue, мемоизированные селекторы и их ловушка, entity adapter, listener middleware, RTK Query.',
      en: 'createSlice and Immer, configureStore defaults, createAsyncThunk with condition and rejectWithValue, memoized selectors and their trap, the entity adapter, listener middleware, RTK Query.',
    },
    quiz: {
      ru: [
        { q: 'Почему в reducer `createSlice` можно писать `state.items.push(x)`?', options: ['RTK отключает проверку мутаций', 'Immer строит из этого новое состояние', 'Redux 5 разрешил мутации в reducers', 'Массивы копируются автоматически'], correct: 1, why: '`state` это черновик Immer; изменения записываются и дают новое неизменяемое состояние.' },
        { q: 'Что вернёт `await dispatch(thunk())`, если запрос упал?', options: ['Бросит исключение', 'Вернёт `undefined`', 'Вернёт состояние store', 'Вернёт action `rejected`'], correct: 3, why: 'Бросает только `.unwrap()`; сам `dispatch` возвращает итоговый action.' },
        { q: 'Чем плох селектор `s => s.todos.filter(t => !t.done)` в `useSelector`?', options: ['Новый массив на каждый вызов', 'Он не видит изменений', 'Он мутирует состояние', 'Его нельзя типизировать'], correct: 0, why: 'Новая ссылка после каждого action перерисовывает компонент; `createSelector` решает это.' },
        { q: 'Что будет при `middleware: [logger]` в `configureStore` RTK 2?', options: ['logger заменит все стандартные', 'logger добавится в конец списка', 'Ошибка: нужна функция', 'Store совсем без middleware'], correct: 2, why: 'В RTK 2 `middleware` обязан быть функцией `getDefault => ...`.' },
      ],
      en: [
        { q: 'Why can a `createSlice` reducer write `state.items.push(x)`?', options: ['RTK turns off mutation checks', 'Immer turns it into new state', 'Redux 5 allows mutations', 'Arrays are copied automatically'], correct: 1, why: '`state` is an Immer draft; changes are recorded and produce a new immutable state.' },
        { q: 'What does `await dispatch(thunk())` give when the request fails?', options: ['It throws an exception', 'It returns `undefined`', 'It returns the store state', 'The `rejected` action'], correct: 3, why: 'Only `.unwrap()` throws; `dispatch` itself returns the final action.' },
        { q: 'What is wrong with `s => s.todos.filter(t => !t.done)` in `useSelector`?', options: ['A new array on every call', 'It does not see changes', 'It mutates the state', 'It cannot be typed'], correct: 0, why: 'A new reference after every action re-renders the component; `createSelector` fixes it.' },
        { q: 'What happens with `middleware: [logger]` in RTK 2 `configureStore`?', options: ['logger replaces all the defaults', 'logger is appended to them', 'An error: a function is needed', 'A store with no middleware at all'], correct: 2, why: 'In RTK 2 `middleware` must be a `getDefault => ...` function.' },
      ],
    },
    sources: [
      rtk('createSlice', 'api/createSlice'),
      rtk('configureStore', 'api/configureStore'),
      rtk('createAsyncThunk', 'api/createAsyncThunk'),
      redux('Deriving data with selectors', 'usage/deriving-data-selectors'),
      rtk('createEntityAdapter', 'api/createEntityAdapter'),
      rtk('RTK Query overview', 'rtk-query/overview'),
    ],
    verified,
  },
  {
    id: 'state-server',
    track: 'state',
    emoji: '☁️',
    minutes: 14,
    title: { ru: 'Серверное состояние: TanStack Query', en: 'Server state: TanStack Query' },
    summary: {
      ru: 'Почему данные сервера это кэш, ключи и дедупликация, staleTime и gcTime, stale-while-revalidate, инвалидация по префиксу, оптимистичные мутации с откатом, аналоги в Redux, Vue и Angular.',
      en: 'Why server data is a cache, keys and deduplication, staleTime and gcTime, stale-while-revalidate, prefix invalidation, optimistic mutations with rollback, equivalents in Redux, Vue and Angular.',
    },
    quiz: {
      ru: [
        { q: 'Какой `staleTime` у запроса по умолчанию?', options: ['0', '5 минут', '30 секунд', 'Бесконечность'], correct: 0, why: 'Данные устаревают сразу; 5 минут это `gcTime` для неиспользуемых данных.' },
        { q: 'Что видит компонент во время фоновой перезагрузки данных?', options: ['Спиннер вместо данных', 'Ошибку загрузки', 'Пустой список', 'Прежние данные'], correct: 3, why: 'Stale-while-revalidate: `status: success` и `fetchStatus: fetching` одновременно.' },
        { q: 'Зачем `cancelQueries` в начале оптимистичной мутации?', options: ['Чтобы сэкономить мобильный трафик', 'Чтобы загрузка не затёрла изменение', 'Чтобы сбросить весь кэш запросов', 'Чтобы отменить саму мутацию'], correct: 1, why: 'Загрузка, начатая до мутации, вернёт старый список и перепишет оптимистичный.' },
        { q: 'Какие ключи задевает `invalidateQueries({ queryKey: ["todos", "list"] })`?', options: ['Только точно такой ключ', "Все ключи с `'todos'`", 'Ключи с этим началом', 'Все ключи кэша'], correct: 2, why: 'Инвалидация работает по префиксу ключа; точное совпадение задаётся `exact: true`.' },
      ],
      en: [
        { q: 'What is the default `staleTime` of a query?', options: ['0', '5 minutes', '30 seconds', 'Infinity'], correct: 0, why: 'Data is stale at once; 5 minutes is the `gcTime` for unused data.' },
        { q: 'What does a component show during a background refetch?', options: ['A spinner instead of data', 'A loading error', 'An empty list', 'The previous data'], correct: 3, why: 'Stale-while-revalidate: `status: success` and `fetchStatus: fetching` at once.' },
        { q: 'Why call `cancelQueries` at the start of an optimistic mutation?', options: ['To save mobile network traffic', 'So a refetch cannot overwrite it', 'To reset the whole query cache', 'To cancel the mutation itself'], correct: 1, why: 'A refetch started before the mutation would return the old list and overwrite the optimistic one.' },
        { q: 'Which keys does `invalidateQueries({ queryKey: ["todos", "list"] })` hit?', options: ['Only that exact key', "Every key with `'todos'`", 'Keys with that prefix', 'Every key in the cache'], correct: 2, why: 'Invalidation matches by key prefix; `exact: true` asks for an exact match.' },
      ],
    },
    sources: [
      tanstack('Important defaults', 'guides/important-defaults'),
      tanstack('Query keys', 'guides/query-keys'),
      tanstack('Query invalidation', 'guides/query-invalidation'),
      tanstack('Optimistic updates', 'guides/optimistic-updates'),
      src('angular.dev: httpResource', 'https://angular.dev/guide/http/http-resource'),
    ],
    verified,
  },
  {
    id: 'state-zustand-jotai',
    track: 'state',
    emoji: '🐻',
    minutes: 12,
    title: { ru: 'Context, Zustand и Jotai', en: 'Context, Zustand and Jotai' },
    summary: {
      ru: 'Почему контекст перерисовывает всех потребителей (с подсчётом рендеров), Zustand со слиянием set и селекторами, атомы Jotai и их зависимости, как выбрать.',
      en: 'Why a context re-renders every consumer (with a render count), Zustand with a merging set and selectors, Jotai atoms and their dependencies, how to choose.',
    },
    quiz: {
      ru: [
        { q: 'В контексте `{ user, theme }` изменился `user`. Что с компонентом, читающим только `theme` и обёрнутым в `memo`?', options: ['Не перерисуется', 'Перерисуется', 'Получит ошибку', 'Отпишется'], correct: 1, why: 'Значение контекста стало новым объектом, и React перерисовывает всех потребителей; `memo` не помогает.' },
        { q: 'Что сделает `setState({ items: [] })` в Zustand?', options: ['Заменит всё состояние', 'Удалит действия стора', 'Сольёт с состоянием', 'Бросит ошибку'], correct: 2, why: '`set` поверхностно сливает объект; полная замена вторым аргументом `true`.' },
        { q: 'Когда пересчитывается производный атом Jotai?', options: ['При изменении прочитанных атомов', 'При любом изменении в сторе', 'При каждом рендере компонента', 'Только по ручному вызову'], correct: 0, why: 'Зависимости отслеживаются автоматически по вызовам `get`.' },
        { q: 'Для чего контекст подходит лучше всего?', options: ['Ввод в поле поиска', 'Позиция курсора', 'Список с сервера', 'Тема и локаль'], correct: 3, why: 'Контекст для редко меняющихся значений; частые изменения перерисовывают всех потребителей.' },
      ],
      en: [
        { q: 'A `{ user, theme }` context changed `user`. What happens to a `memo` component reading only `theme`?', options: ['It does not re-render', 'It re-renders', 'It gets an error', 'It unsubscribes'], correct: 1, why: 'The context value became a new object, and React re-renders every consumer; `memo` does not help.' },
        { q: 'What does `setState({ items: [] })` do in Zustand?', options: ['Replaces the whole state', 'Deletes the store actions', 'Merges into the state', 'Throws an error'], correct: 2, why: '`set` shallow-merges the object; a second argument `true` replaces it.' },
        { q: 'When does a Jotai derived atom recompute?', options: ['When atoms it read change', 'On any change in the store', 'On every component render', 'Only when called by hand'], correct: 0, why: 'Dependencies are tracked automatically through the `get` calls.' },
        { q: 'What is a context best suited for?', options: ['Search field input', 'The cursor position', 'A list from the server', 'Theme and locale'], correct: 3, why: 'Context suits rarely changing values; frequent changes re-render every consumer.' },
      ],
    },
    sources: [
      react('useContext: optimizing re-renders', 'reference/react/useContext#optimizing-re-renders-when-passing-objects-and-functions'),
      src('zustand.docs.pmnd.rs: Introduction', 'https://zustand.docs.pmnd.rs/learn/getting-started/introduction'),
      src('zustand.docs.pmnd.rs: Prevent rerenders with useShallow', 'https://zustand.docs.pmnd.rs/learn/guides/prevent-rerenders-with-use-shallow'),
      src('jotai.org: Core: atom', 'https://jotai.org/docs/core/atom'),
    ],
    verified,
  },
  {
    id: 'state-mobx',
    track: 'state',
    emoji: '👁️',
    minutes: 11,
    title: { ru: 'MobX: наблюдаемое состояние', en: 'MobX: observable state' },
    summary: {
      ru: 'makeAutoObservable, computed, autorun и reaction, action как транзакция, строгий режим, разыменование и деструктуризация, observer в React, сравнение с Redux и сигналами.',
      en: 'makeAutoObservable, computed, autorun and reaction, an action as a transaction, strict mode, dereferencing and destructuring, observer in React, a comparison with Redux and signals.',
    },
    quiz: {
      ru: [
        { q: 'Что сделает `makeAutoObservable` с методами класса?', options: ['Сделает их computed', 'Оставит как есть', 'Сделает их actions', 'Заморозит их'], correct: 2, why: 'Поля становятся observable, геттеры computed, методы actions.' },
        { q: 'Сколько раз выполнится `autorun` после двух изменений внутри одного `runInAction`?', options: ['Один раз', 'Два раза', 'Ни разу', 'Три раза'], correct: 0, why: 'Action это транзакция: реакции запускаются один раз после её завершения.' },
        { q: 'Почему `const { name } = user` ломает реакцию?', options: ['MobX запрещает деструктуризацию', 'Объект при этом замораживается', 'Сначала нужен вызов `toJS`', 'Копируется значение, а не чтение'], correct: 3, why: 'MobX отслеживает чтение свойства наблюдаемого объекта; копия строки не отслеживается.' },
        { q: 'Чем `reaction` отличается от `autorun`?', options: ['Не запускает эффект при создании', 'Работает только с массивами', 'Не отслеживает зависимости', 'Выполняется синхронно в рендере'], correct: 0, why: '`reaction` разделяет выражение отслеживания и эффект, который вызывается только при изменении.' },
      ],
      en: [
        { q: 'What does `makeAutoObservable` do with class methods?', options: ['Makes them computed', 'Leaves them as they are', 'Makes them actions', 'Freezes them'], correct: 2, why: 'Fields become observable, getters computed, methods actions.' },
        { q: 'How many times does an `autorun` run after two changes inside one `runInAction`?', options: ['Once', 'Twice', 'Never', 'Three times'], correct: 0, why: 'An action is a transaction: reactions run once after it ends.' },
        { q: 'Why does `const { name } = user` break a reaction?', options: ['MobX forbids destructuring', 'The object gets frozen', 'It needs `toJS`', 'A value is copied, not a read'], correct: 3, why: 'MobX tracks property reads of an observable object; a copied string is not tracked.' },
        { q: 'How does `reaction` differ from `autorun`?', options: ['It does not run the effect at start', 'It works only with arrays', 'It tracks no dependencies', 'It runs synchronously in render'], correct: 0, why: '`reaction` separates the tracking expression from the effect, which runs only on change.' },
      ],
    },
    sources: [
      src('mobx.js.org: The gist of MobX', 'https://mobx.js.org/the-gist-of-mobx.html'),
      src('mobx.js.org: Understanding reactivity', 'https://mobx.js.org/understanding-reactivity.html'),
      src('mobx.js.org: Updating state using actions', 'https://mobx.js.org/actions.html'),
      src('mobx.js.org: React integration', 'https://mobx.js.org/react-integration.html'),
    ],
    verified,
  },
  {
    id: 'state-angular',
    track: 'state',
    emoji: '🅰️',
    minutes: 14,
    title: { ru: 'Состояние в Angular: сигналы, NgRx, NGXS', en: 'State in Angular: signals, NgRx, NGXS' },
    summary: {
      ru: 'Сервис с сигналами и asReadonly, NgRx SignalStore с patchState и watchState, NgRx Store: actions, createFeature, функциональные effects и выбор оператора, NGXS, фасад.',
      en: 'A service with signals and asReadonly, NgRx SignalStore with patchState and watchState, NgRx Store: actions, createFeature, functional effects and choosing an operator, NGXS, facades.',
    },
    quiz: {
      ru: [
        { q: 'Почему `items().push(x)` в сервисе с сигналом не обновит экран?', options: ['Сигнал не видит мутацию', 'Push запрещён в Angular', 'Нужен `markForCheck`', 'Массив заморожен'], correct: 0, why: 'Сигнал сравнивает значения через `Object.is`; нужен новый массив через `update`.' },
        { q: 'Какой оператор в effect для кнопки «Оплатить», чтобы игнорировать повторные нажатия?', options: ['`switchMap`', '`mergeMap`', '`concatMap`', '`exhaustMap`'], correct: 3, why: '`exhaustMap` игнорирует новые события, пока выполняется текущее.' },
        { q: 'Где ставить `catchError` в effect?', options: ['В конце внешнего потока', 'Внутри `switchMap`', 'В reducer', 'В компоненте'], correct: 1, why: 'Снаружи ошибка завершит весь effect, и он перестанет слушать actions.' },
        { q: 'Как защищено состояние SignalStore от `patchState` снаружи?', options: ['Бросается ошибка', 'Object.freeze', 'Проверкой типов', 'Никак'], correct: 2, why: '`protectedState: true` запрещает это на уровне типов TypeScript.' },
      ],
      en: [
        { q: 'Why does `items().push(x)` in a signal service not update the screen?', options: ['The signal misses mutations', 'Push is forbidden in Angular', 'It needs `markForCheck`', 'The array is frozen'], correct: 0, why: 'A signal compares values with `Object.is`; use `update` with a new array.' },
        { q: 'Which effect operator ignores repeated clicks on "Pay"?', options: ['`switchMap`', '`mergeMap`', '`concatMap`', '`exhaustMap`'], correct: 3, why: '`exhaustMap` ignores new events while the current one is running.' },
        { q: 'Where does `catchError` go in an effect?', options: ['At the end of the outer stream', 'Inside `switchMap`', 'In the reducer', 'In the component'], correct: 1, why: 'Outside, the error would complete the whole effect, and it would stop listening to actions.' },
        { q: 'How is SignalStore state protected from outside `patchState`?', options: ['It throws an error', 'Object.freeze', 'By type checking', 'It is not'], correct: 2, why: '`protectedState: true` forbids it at the TypeScript type level.' },
      ],
    },
    sources: [
      ngrx('SignalStore', 'guide/signals/signal-store'),
      ngrx('Store: getting started', 'guide/store'),
      ngrx('Effects', 'guide/effects'),
      src('angular.dev: Signals', 'https://angular.dev/guide/signals'),
      src('ngxs.io: Introduction', 'https://www.ngxs.io/'),
    ],
    verified,
  },
  {
    id: 'state-patterns',
    track: 'state',
    emoji: '🧩',
    minutes: 13,
    title: { ru: 'Нормализация, undo/redo, сохранение, вкладки', en: 'Normalization, undo/redo, persistence, tabs' },
    summary: {
      ru: 'Нормализация в ids и entities и денормализация селектором, пессимистичные и оптимистичные обновления, конфликты, undo/redo редьюсером высшего порядка, сохранение с миграциями, BroadcastChannel.',
      en: 'Normalization into ids and entities and denormalizing selectors, pessimistic and optimistic updates, conflicts, undo/redo with a higher-order reducer, persistence with migrations, BroadcastChannel.',
    },
    quiz: {
      ru: [
        { q: 'Зачем нормализовать данные в сторе?', options: ['Чтобы уменьшить размер JSON', 'Каждая сущность хранится раз', 'Чтобы ускорить сетевые запросы', 'Так требует сам Redux'], correct: 1, why: 'Одна копия сущности: обновление видно везде, поиск по id за O(1).' },
        { q: 'Что происходит с `future` при новом изменении после отмены?', options: ['Очищается', 'Сохраняется', 'Переносится в `past`', 'Применяется'], correct: 0, why: 'Ветка повторов больше не имеет смысла после нового изменения.' },
        { q: 'Что делать с сохранённым состоянием старой формы после релиза?', options: ['Удалять без проверки', 'Читать как есть', 'Хранить две версии', 'Мигрировать по версии'], correct: 3, why: 'Сохранённое состояние переживает релизы: версия и миграции шаг за шагом.' },
        { q: 'Кто получает событие `storage` при записи в `localStorage`?', options: ['Только эта вкладка', 'Все вкладки, включая эту', 'Другие вкладки источника', 'Только Service Worker'], correct: 2, why: 'Событие приходит другим вкладкам того же источника, не той, что записала.' },
      ],
      en: [
        { q: 'Why normalize data in a store?', options: ['To shrink the JSON', 'Each entity is stored once', 'To speed up the network', 'Redux requires it'], correct: 1, why: 'One copy per entity: an update shows everywhere, lookup by id is O(1).' },
        { q: 'What happens to `future` on a new change after an undo?', options: ['It is cleared', 'It is kept', 'It moves to `past`', 'It is applied'], correct: 0, why: 'The redo branch no longer makes sense after a new change.' },
        { q: 'What to do with saved state of an old shape after a release?', options: ['Delete it unchecked', 'Read it as is', 'Keep both versions', 'Migrate by version'], correct: 3, why: 'Saved state outlives releases: a version and step-by-step migrations.' },
        { q: 'Who receives the `storage` event on a `localStorage` write?', options: ['Only this tab', 'All tabs, this one included', 'Other tabs of the origin', 'Only the Service Worker'], correct: 2, why: 'The event reaches other tabs of the same origin, not the one that wrote.' },
      ],
    },
    sources: [
      redux('Normalizing state shape', 'usage/structuring-reducers/normalizing-state-shape'),
      redux('Implementing undo history', 'usage/implementing-undo-history'),
      src('MDN: BroadcastChannel', 'https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel'),
      src('MDN: Window: storage event', 'https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event'),
    ],
    verified,
  },
  {
    id: 'state-choosing',
    track: 'state',
    emoji: '🎯',
    minutes: 9,
    title: { ru: 'Как выбрать менеджер состояния', en: 'Choosing a state manager' },
    summary: {
      ru: 'Порядок рассуждения от серверных данных до глобального стора, сводная таблица библиотек, соответствие в React, Vue и Angular, признаки плохой архитектуры, ответ для собеседования.',
      en: 'The reasoning order from server data to a global store, a summary table of libraries, equivalents in React, Vue and Angular, signs of a bad architecture, an interview answer.',
    },
    quiz: {
      ru: [
        { q: 'С чего начинают выбор менеджера состояния?', options: ['С популярности библиотек', 'С размера бандла приложения', 'С деления состояния по видам', 'С выбора удобных DevTools'], correct: 2, why: 'Сначала серверное, адрес, производное и локальное уходят в свои инструменты, затем остаток в стор.' },
        { q: 'Что из этого признак плохой архитектуры состояния?', options: ['Сумма корзины в сторе', 'Фильтры в адресе', 'Модалка в компоненте', 'Тема в контексте'], correct: 0, why: 'Сумма это производное значение: его вычисляют, а не хранят.' },
        { q: 'Что в Vue соответствует Zustand или Redux в React?', options: ['`provide`/`inject`', 'Vue Router', '`computed`', 'Pinia'], correct: 3, why: 'Pinia это официальный стор Vue для глобального клиентского состояния.' },
        { q: 'Что обычно остаётся в глобальном сторе после разделения?', options: ['Почти все данные', 'Немного клиентских данных', 'Только серверные данные', 'Только формы'], correct: 1, why: 'Пользователь, настройки, корзина, черновик: остальное ушло в запросы, адрес и компоненты.' },
      ],
      en: [
        { q: 'Where does choosing a state manager start?', options: ['With library popularity', 'With bundle size', 'With splitting state by kind', 'With picking DevTools'], correct: 2, why: 'Server, URL, derived and local state go to their tools first, then the rest goes to a store.' },
        { q: 'Which of these is a sign of a bad state architecture?', options: ['A cart total in the store', 'Filters in the URL', 'A modal in a component', 'The theme in a context'], correct: 0, why: 'A total is a derived value: compute it, do not store it.' },
        { q: 'What in Vue corresponds to Zustand or Redux in React?', options: ['`provide`/`inject`', 'Vue Router', '`computed`', 'Pinia'], correct: 3, why: 'Pinia is the official Vue store for global client state.' },
        { q: 'What usually stays in the global store after the split?', options: ['Almost all data', 'A little client data', 'Only server data', 'Only forms'], correct: 1, why: 'User, settings, cart, draft: the rest went to queries, the URL and components.' },
      ],
    },
    sources: [
      redux('FAQ: when should I use Redux?', 'faq/general#when-should-i-use-redux'),
      tanstack('Does TanStack Query replace Redux?', 'guides/does-this-replace-client-state'),
      src('pinia.vuejs.org: Introduction', 'https://pinia.vuejs.org/introduction.html'),
      ngrx('SignalStore', 'guide/signals/signal-store'),
    ],
    verified,
  },
]

export const stateModule: Module = {
  track: 'state',
  lessons: stateLessons.map((l) => l.id),
  exam: {
    pass: 0.75,
    questions: {
      ru: [
        { q: 'Какой вид состояния лучше всего держать в библиотеке запросов?', options: ['Открыта ли модалка', 'Данные с сервера', 'Текст в поле ввода', 'Тему оформления'], correct: 1, why: 'Серверные данные это кэш с устареванием и повторной загрузкой.' },
        { q: 'Почему сумму корзины не хранят в состоянии?', options: ['Это производное значение', 'Числа нельзя хранить', 'Её не сериализовать', 'Redux это запрещает'], correct: 0, why: 'Копия рано или поздно разойдётся с исходными данными; производное вычисляют.' },
        { q: 'Какие три принципа у Redux?', options: ['Слоты, сигналы и эффекты', 'Модули, сервисы и внедрение DI', 'Один store, чтение, чистые reducers', 'Атомы, селекторы и провайдеры'], correct: 2, why: 'Единственный источник правды, изменение только через actions, чистые функции.' },
        { q: 'Как Redux узнаёт, что состояние изменилось?', options: ['Глубоким сравнением', 'По счётчику версий', 'Через Proxy', 'По новой ссылке'], correct: 3, why: 'Неизменяемое обновление создаёт новые объекты на пути к изменению, сравнение идёт по ссылке.' },
        { q: 'Что делает thunk middleware?', options: ['Вызывает функцию вместо action', 'Логирует все actions в консоль', 'Замораживает всё состояние', 'Кэширует ответы на запросы'], correct: 0, why: 'Если в `dispatch` пришла функция, thunk вызывает её; внутри можно ждать запросов.' },
        { q: 'Что делает `createSelector`?', options: ['Создаёт новый slice', 'Отправляет action в store', 'Пересчёт при смене входов', 'Нормализует коллекции'], correct: 2, why: 'Мемоизация: тот же результат по ссылке, пока входные селекторы вернули те же значения.' },
        { q: 'Что такое stale-while-revalidate?', options: ['Удаление устаревшего кэша', 'Старые данные во время загрузки', 'Запрет повторных запросов', 'Загрузка только при фокусе окна'], correct: 1, why: 'Пользователь сразу видит то, что было, а свежие данные приходят в фоне.' },
        { q: 'Какой шаг в оптимистичной мутации откатывает изменение?', options: ['`onMutate`', '`onSettled`', '`mutationFn`', '`onError`'], correct: 3, why: '`onError` получает снимок из `onMutate` и возвращает его в кэш.' },
        { q: 'Почему контекст плохо подходит для часто меняющегося общего состояния?', options: ['Перерисовывает всех потребителей', 'Не работает вместе с хуками', 'Теряет значение при рендере', 'Медленно читается из дерева'], correct: 0, why: 'Любое изменение значения уведомляет всех, кто читает контекст.' },
        { q: 'Чем Jotai отличается от Zustand по модели?', options: ['Jotai только для серверных данных', 'Атомы снизу вверх, не один стор', 'Jotai требует писать reducers', 'Jotai работает без React'], correct: 1, why: 'Zustand это один стор с селекторами, Jotai строит состояние из атомов и производных атомов.' },
        { q: 'Что объединяет MobX, реактивность Vue и сигналы Angular?', options: ['Неизменяемые обновления', 'Обязательные actions везде', 'Отслеживание чтений', 'Один глобальный store'], correct: 2, why: 'Все три отслеживают, что прочитано, и обновляют только зависимых.' },
        { q: 'Как редьюсер поиска защищается от ответа на устаревший запрос?', options: ['Задержкой', 'Отменой рендера', 'Повтором запроса', 'Сверкой `requestId`'], correct: 3, why: 'Ответ принимается, только если совпадает с текущим запросом.' },
        { q: 'Что в NgRx отвечает за HTTP-запросы?', options: ['Effects', 'Reducers', 'Selectors', 'Actions'], correct: 0, why: 'Effect слушает actions, делает запрос и отправляет новый action; reducers остаются чистыми.' },
        { q: 'Где хранить фильтры каталога, чтобы ими можно было поделиться ссылкой?', options: ['В сторе', 'В `sessionStorage`', 'В адресе', 'В cookie'], correct: 2, why: 'Адрес сохраняет выдачу в ссылке, истории и закладках.' },
      ],
      en: [
        { q: 'Which kind of state belongs in a query library?', options: ['Whether a modal is open', 'Data from the server', 'Text in an input', 'The color theme'], correct: 1, why: 'Server data is a cache with staleness and refetching.' },
        { q: 'Why is a cart total not stored in state?', options: ['It is a derived value', 'Numbers cannot be stored', 'It cannot be serialized', 'Redux forbids it'], correct: 0, why: 'A copy sooner or later drifts from the source data; derived values are computed.' },
        { q: 'What are the three Redux principles?', options: ['Slots, signals and side effects', 'Modules, services and DI tokens', 'One store, read-only, pure reducers', 'Atoms, selectors and providers'], correct: 2, why: 'A single source of truth, changes only through actions, pure functions.' },
        { q: 'How does Redux know that state changed?', options: ['By deep comparison', 'By a version counter', 'Through a Proxy', 'By a new reference'], correct: 3, why: 'An immutable update creates new objects along the changed path, compared by reference.' },
        { q: 'What does thunk middleware do?', options: ['Calls a function given as an action', 'Logs every action to the console', 'Freezes the whole state', 'Caches responses to requests'], correct: 0, why: 'If `dispatch` receives a function, thunk calls it; inside you can await requests.' },
        { q: 'What does `createSelector` do?', options: ['Creates a new slice', 'Dispatches an action', 'Recomputes on input change', 'Normalizes collections'], correct: 2, why: 'Memoization: the same result by reference while the input selectors return the same values.' },
        { q: 'What is stale-while-revalidate?', options: ['Deleting the stale cache', 'Old data shown while refetching', 'Forbidding repeated requests', 'Loading only on window focus'], correct: 1, why: 'The user sees what was there at once, and fresh data arrives in the background.' },
        { q: 'Which step of an optimistic mutation rolls the change back?', options: ['`onMutate`', '`onSettled`', '`mutationFn`', '`onError`'], correct: 3, why: '`onError` gets the snapshot from `onMutate` and puts it back into the cache.' },
        { q: 'Why does context suit frequently changing shared state poorly?', options: ['It re-renders every consumer', 'It does not work with hooks', 'It loses its value on render', 'It is slow to read'], correct: 0, why: 'Any value change notifies everyone who reads the context.' },
        { q: 'How does Jotai differ from Zustand in its model?', options: ['Jotai is only for server data', 'Atoms bottom-up, not one store', 'Jotai requires reducers', 'Jotai works without React'], correct: 1, why: 'Zustand is one store with selectors, Jotai builds state from atoms and derived atoms.' },
        { q: 'What do MobX, Vue reactivity and Angular signals share?', options: ['Immutable updates only', 'Mandatory actions', 'Tracking of reads', 'One global store'], correct: 2, why: 'All three track what was read and update only the dependents.' },
        { q: 'How does a search reducer guard against a response to a stale request?', options: ['With a delay', 'By cancelling the render', 'By repeating the request', 'By checking `requestId`'], correct: 3, why: 'A response is accepted only if it matches the current request.' },
        { q: 'What handles HTTP requests in NgRx?', options: ['Effects', 'Reducers', 'Selectors', 'Actions'], correct: 0, why: 'An effect listens to actions, makes the request and dispatches a new action; reducers stay pure.' },
        { q: 'Where do you keep catalog filters so they can be shared by link?', options: ['In the store', 'In `sessionStorage`', 'In the URL', 'In a cookie'], correct: 2, why: 'The URL keeps the results in the link, history and bookmarks.' },
      ],
    },
  },
}
