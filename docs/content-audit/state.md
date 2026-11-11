# Аудит заметок: управление состоянием

Источники в Notion: список «State Managers» на корневой странице «Frontend (1)» (Redux, Redux Toolkit, TanStack, Zustand, MobX, без содержания), раздел «Redux» страницы «React» (три принципа, `connect`, actions, reducers, middleware, selectors, Redux Form, альтернативы, Connected React Router), раздел «NGRX | NGXS» страницы «Angular» (зачем менеджер состояний, три правила Redux, NgRx, NGXS), разделы «D — Data Model» и «UI State & Schema Design» страницы «System Design» (виды состояния, нормализация, оптимистичные обновления, гонки, выбор между Zustand, Jotai и Redux). Pinia разобрана в треке Vue (`vue-composables`).

Утверждения сверены с redux.js.org, redux-toolkit.js.org, react-redux.js.org, tanstack.com, zustand.docs.pmnd.rs, jotai.org, mobx.js.org, stately.ai, ngrx.io, ngxs.io. Все примеры уроков выполняются в CI на версиях из таблицы ниже.

## Актуальные версии (ноябрь 2026)

| Пакет | Версия | Что важно |
|---|---|---|
| `@reduxjs/toolkit` | 2.14 | Redux 5, Immer 11, Reselect 5 (`weakMapMemoize`), redux-thunk 3 внутри; `middleware` в `configureStore` только функцией |
| `redux` | 5.0 | `createStore` помечен как `legacy_createStore`, новый код пишут на RTK |
| `react-redux` | 9.3 | Хуки, `useSelector.withTypes`, проверки стабильности селекторов в разработке |
| `@tanstack/query-core` | 5.107 | `gcTime` вместо `cacheTime`, `status: 'pending'`, `isPending`; адаптер Angular по-прежнему `angular-query-experimental` |
| `zustand` | 5.1 | `useShallow` из `zustand/react/shallow`, стор из `zustand/vanilla` |
| `jotai` | 3.0 | Атомы, `jotai/vanilla` `createStore`, `store.sub` |
| `mobx` | 7.1 | `makeAutoObservable`, декораторы стандарта TC39 (`accessor`), строгий режим `observed` по умолчанию |
| `xstate` | 5.33 | `setup().createMachine`, `createActor`, `fromPromise`, `waitFor` |
| `@ngrx/signals`, `@ngrx/store` | 22.0 | SignalStore: `protectedState` по умолчанию, `watchState`, `withProps`; Store: `createFeature`, функциональные effects, `selectSignal` |
| `@ngxs/store` | 22.0 | Классы с `@State`, `@Action`, `@Selector` |

## Найденные ошибки

| Где | В заметках | На самом деле | Источник |
|---|---|---|---|
| React, Actions | `{ payload: 'data' } // Redux просто проигнорирует` | Redux бросает ошибку «Actions may not have an undefined "type" property» | проверено запуском, [Actions](https://redux.js.org/tutorials/fundamentals/part-2-concepts-data-flow) |
| React, Middleware | redux-thunk в таблице со статусом «Легаси» | Thunk включён в `configureStore` по умолчанию, на нём построен `createAsyncThunk` | [configureStore](https://redux-toolkit.js.org/api/configureStore), проверено запуском |
| React, Selectors | Фабрика `makeSelectTodosByListId` с `useMemo` как «самый частый паттерн» | С Reselect 5 по умолчанию `weakMapMemoize` кэширует результаты для разных аргументов; фабрика на компонент обычно не нужна | [Deriving data with selectors](https://redux.js.org/usage/deriving-data-selectors) |
| React, Selectors | Селектор с `filter` «плохо, потому что пересчитывается» | Главная проблема в новой ссылке на каждый вызов: компонент перерисовывается после **любого** action, react-redux предупреждает в разработке | проверено запуском, [useSelector](https://react-redux.js.org/api/hooks#useselector) |
| React, Selectors | «reselect в 95% проектов» | Статистика без источника; `createSelector` RTK это Reselect | [createSelector](https://redux-toolkit.js.org/api/createSelector) |
| React, HOC connect | «Плохая поддержка React 18+» у `connect` | `connect` в react-redux 8+ построен на `useSyncExternalStore` и работает с React 18 и 19; его не используют в новом коде из-за обёрток и типизации, а не из-за несовместимости | [react-redux: connect](https://react-redux.js.org/api/connect) |
| React, Connected React Router | «React Router v7 вышла в 2025» | v7 вышла в ноябре 2024; текущая версия 8.5 | [React Router changelog](https://reactrouter.com/changelog) |
| System Design | «Zustand/Jotai/Recoil» как варианты стора | Recoil заархивирован в 2025 году; атомарное состояние в React сейчас это Jotai | [Jotai](https://jotai.org/) |
| Angular, State Manager | Менеджер состояний «повышает производительность» | Производительность дают точечные подписки (селекторы, сигналы); сам стор её не повышает, а контекст с большим объектом её ухудшает | проверено запуском (`state-zustand-jotai`) |
| System Design | `staleTime` и `gcTime` без значений по умолчанию | `staleTime` по умолчанию 0 (данные устаревают сразу), `gcTime` 5 минут; это частый вопрос | [Important defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults) |

## Покрытие заметок Notion

| Тема в заметках | Где разобрано |
|---|---|
| Что такое менеджер состояний и зачем | `state-kinds#Зачем менеджер состояний` |
| Виды состояния: server, client (UI), URL, derived, ephemeral | `state-kinds#Виды состояния` |
| Производное состояние не хранить | `state-kinds#Производное состояние не хранят` |
| State colocation | `state-kinds#Где держать: колокация и подъём` |
| URL state, shareable links | `state-kinds#Адрес страницы как хранилище` |
| Состояния loading, empty, error, partial | `state-machines#Невозможные состояния` |
| Race conditions, отмена устаревших запросов | `state-machines#Редьюсер как конечный автомат`, `state-server` |
| Redux: три принципа | `state-redux#Однонаправленный поток данных` |
| Redux: actions, именование типов | `state-redux#Actions` |
| Redux: reducers, чистота, неизменяемость, OCP через slices | `state-redux#Reducers и неизменяемость`, `state-rtk#createSlice и Immer` |
| Redux: middleware, свои middleware, порядок цепочки | `state-redux#Middleware и асинхронность` |
| Redux: HOC connect против хуков | `state-redux#connect и хуки` |
| Redux Toolkit: createSlice, createAsyncThunk, configureStore | `state-rtk` |
| Redux: selectors, мемоизация, параметризованные селекторы, денормализация | `state-rtk#Селекторы и мемоизация`, `state-patterns#Нормализация` |
| Redux-Saga | `state-redux#Middleware и асинхронность` |
| Redux Form | `react-forms` (трек React; библиотека устарела) |
| Connected React Router | ошибка в таблице выше; роутер в треке React (`react-router`) |
| TanStack Query: server state, дедупликация, SWR, stale time, gc time | `state-server` |
| Optimistic updates, rollback, invalidation | `state-server#Мутации и оптимистичные обновления`, `state-patterns#Стратегии обновления и конфликты` |
| Нормализация byId/allIds | `state-patterns#Нормализация` |
| Zustand | `state-zustand-jotai#Zustand` |
| Jotai и выбор «Zustand/Jotai против Redux» | `state-zustand-jotai#Jotai`, `#Как выбрать` |
| MobX | `state-mobx` |
| NgRx: actions, reducers, selectors, effects, `createActionGroup`, фасад | `state-angular#NgRx Store: Redux на RxJS` |
| NGXS (CQRS, классы и декораторы) | `state-angular#NGXS` |
| Pinia | `vue-composables` (трек Vue), `state-choosing#Сводная таблица` |
| Обоснование выбора стека состояния на собеседовании | `state-choosing` |

Добавлено сверх заметок, потому что об этом спрашивают: конечные автоматы и XState (`state-machines`), контекст React и его перерисовки (`state-zustand-jotai`), сервис с сигналами и NgRx SignalStore (`state-angular`), undo/redo, сохранение с миграциями и синхронизация вкладок (`state-patterns`).
