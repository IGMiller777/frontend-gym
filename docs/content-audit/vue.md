# Аудит заметок: Vue

Источник: страница Notion «Vue.js» (около 14 тысяч знаков), прочитана целиком. Заполнены разделы: рендер и ререндер, хуки жизненного цикла, `ref` и `reactive`, эффекты (`computed`, `watch`, `watchEffect`, `watchPostEffect`, `watchSyncEffect`). Восемь тем из оглавления пустые: директивы, списки, обработка событий, наблюдатели, асинхронные компоненты и SSR, composables, встроенные компоненты, роутинг; они написаны в уроках с нуля.

Утверждения сверены с vuejs.org (руководство и API), блогом Vue (анонсы 3.4 и 3.5), журналами изменений Pinia и Vue Router. Примеры уроков выполняются в CI на Vue 3.5.45, Pinia 4.1 и Vue Router 5.4: реактивность в Node.js, компоненты в jsdom (шаблоны компилируются во время выполнения, как в полной сборке Vue).

## Актуальные версии (ноябрь 2026)

| Пакет | Версия | Что важно |
|---|---|---|
| `vue` | 3.5.45 (3.5.0 от сентября 2024) | Переработанная реактивность (−56% памяти), реактивная деструктуризация `defineProps`, `useTemplateRef`, `useId`, `onWatcherCleanup`, ленивая гидратация, `Teleport defer`, `data-allow-mismatch` |
| `vue` 3.6 | release candidate | Vapor Mode (компиляция без Virtual DOM, по желанию для отдельных компонентов) и новая реализация реактивности на alien-signals; пока не стабильна |
| Vue 3.4 | декабрь 2023 | `defineModel` стабилен, сокращение `:id` для `:id="id"`, ускоренный парсер шаблонов |
| `vue-router` | 5.4 (5.0 от января 2026) | Файловый роутинг из `unplugin-vue-router` перенесён в ядро, для обычного Vue Router 4 без ломающих изменений |
| `pinia` | 4.1 (4.0 от июля 2026) | Только ESM, `@vue/devtools-api` устанавливается отдельно; Pinia 3 отказалась от Vue 2 |
| `nuxt` | 4.6 | Каталог `app/`, новые умолчания загрузки данных |
| Vue 2 | — | Поддержка закончилась 31 декабря 2023 |

## Что устарело

| Было в заметках | Сейчас | Источник |
|---|---|---|
| Компонент как объект с `setup()` и `return { … }` | `<script setup>` в SFC: всё объявленное доступно шаблону, `defineProps`, `defineEmits`, `defineModel` | [script setup](https://vuejs.org/api/sfc-script-setup.html) |
| `withDefaults(defineProps(...))` | С 3.5 значения по умолчанию задают деструктуризацией: `const { size = 'md' } = defineProps<…>()`, и переменные остаются реактивными | [Vue 3.5](https://blog.vuejs.org/posts/vue-3-5) |
| Пара `modelValue` + `emit('update:modelValue')` для `v-model` | `defineModel()` (стабилен с 3.4) | [Component v-model](https://vuejs.org/guide/components/v-model.html) |
| `ref="el"` и одноимённая переменная | `useTemplateRef('el')` (3.5) | [Template refs](https://vuejs.org/guide/essentials/template-refs.html) |
| `onCleanup` как единственный способ очистки | Также `onWatcherCleanup()` (3.5) в `watch` и `watchEffect` | [Watchers](https://vuejs.org/guide/essentials/watchers.html) |
| `getCurrentInstance().proxy.$forceUpdate()` | `getCurrentInstance` не предназначен для кода приложений; принудительный рендер почти всегда признак нереактивного состояния | [Reactivity in depth](https://vuejs.org/guide/extras/reactivity-in-depth.html) |

## Найденные ошибки

| Раздел | В заметках | На самом деле | Источник |
|---|---|---|---|
| ref и reactive | `reactive(0)` «Ошибка!» | Не бросает: в разработке предупреждение `value cannot be made reactive`, возвращается исходное значение | проверено запуском |
| ref и reactive | `user.value.name = 'Jane'` у `ref({ ... })` как обычная запись | Верно, но важно почему: `ref` с объектом оборачивает его в `reactive`, поэтому вложенные поля реактивны; без этого не объяснить `shallowRef` | [Reactivity fundamentals](https://vuejs.org/guide/essentials/reactivity-fundamentals.html) |
| ref и reactive | Не упомянуто, что `reactive()` возвращает прокси, а исходный объект не реактивен | Изменения через исходный объект не отслеживаются; `reactive(obj) === reactive(obj)`, но `!==` исходному | там же, проверено запуском |
| watch | `watch(user, …)` для `ref` объекта без `deep` не сработает | Верно для `ref`, но `watch(reactiveObj, …)` глубокий по умолчанию; с 3.5 `deep` принимает число уровней | [Watchers](https://vuejs.org/guide/essentials/watchers.html), проверено запуском |
| watchEffect | «Выполняется до обновления DOM» без оговорок | `flush: 'pre'` по умолчанию: эффект запускается в очереди перед обновлением компонента, но после создания; первый запуск синхронный при создании | там же, проверено запуском |
| Рендер | «Работа с DOM медленная, поэтому Virtual DOM» | Vue использует Virtual DOM с подсказками компилятора: статические узлы поднимаются, динамические помечаются patch flags, и при обновлении сравниваются только они | [Rendering mechanism](https://vuejs.org/guide/extras/rendering-mechanism.html) |
| Рендер | Шаблон «компилируется в render-функцию один раз» в браузере | В проектах на Vite шаблоны SFC компилируются при сборке; компиляция в браузере нужна только полной сборке с компилятором | там же |
| Ререндер | `updated` хук: «избегайте изменения state, это бесконечный цикл» | Изменение в `updated` вызывает ещё один рендер; цикл бесконечен, только если каждое обновление снова меняет состояние; правильнее `computed` или `watch` | [Lifecycle](https://vuejs.org/guide/essentials/lifecycle.html) |
| Ререндер | Пропсы родителя перерисовывают ребёнка «если он использует message» | Ребёнок обновляется, когда меняются его пропсы (Vue сравнивает их поверхностно) или реактивные данные, прочитанные при его рендере; дочерние компоненты не рендерятся вместе с родителем без причины, в отличие от React | [Rendering mechanism](https://vuejs.org/guide/extras/rendering-mechanism.html) |

## Пробелы, закрытые в уроках

- Прокси `reactive`, разворачивание `ref` в шаблоне и в `reactive`, `shallowRef`, `toRefs`, `readonly`, потеря реактивности при деструктуризации и её возвращение в `defineProps` 3.5.
- Порядок и тайминг `watch`/`watchEffect` (`flush`), `nextTick`, `once`, `deep` с числом, `onWatcherCleanup`, остановка и пауза.
- `<script setup>`, `defineProps`, `defineEmits`, `defineModel`, слоты и scoped-слоты, `provide`/`inject`, `useTemplateRef`, `useId`, ключи в `v-for`, `v-if` против `v-show`, `KeepAlive`, `Teleport`, асинхронные компоненты.
- Composables как замена миксинам, VueUse, Pinia: setup-сторы, `storeToRefs`, плагины.
- Компилятор и рендер: поднятие статики, patch flags, планировщик, `v-memo`, `v-once`, Vapor Mode в 3.6.
- Vue Router 5 (файловые маршруты в ядре, guards), SSR и Nuxt 4, ленивая гидратация, тесты на Vitest и Vue Test Utils.

## Покрытие заметок Notion (второй проход)

Второй проход (ноябрь 2026) по правилу «все темы из заметок плюс основные вопросы собеседований» добавил 6 уроков (теперь их 12), разделы в 5 старых уроках и схемы во все уроки. Каждая тема страницы «Vue.js» и место, где она разобрана:

| Тема в заметках | Где разобрано |
|---|---|
| Directives | `vue-template-syntax#Анатомия директивы`, `#Остальные встроенные директивы`, `#Собственные директивы` |
| Списки | `vue-template-syntax#Привязки, условия и списки`, `#Ключи в v-for` |
| Обработка событий | `vue-template-syntax#События` |
| Наблюдатели | `vue-watchers` целиком |
| Асинхронные компоненты и SSR | `vue-built-ins#Асинхронные компоненты`, `#Suspense`, `vue-app#SSR и гидратация` |
| Composables | `vue-composables#Composable`, `#Области эффектов и очистка` |
| Встроенные компоненты | `vue-built-ins` целиком |
| Роутинг | `vue-router` целиком |
| Render: схема, этапы Template → Render → VDOM → Diff → Patch | `vue-rendering#Шаблон → render-функция → Virtual DOM → DOM` (схема и вывод компилятора) |
| Первичный рендер и ререндер, хуки при них | `vue-lifecycle#Порядок у родителя и ребёнка` |
| Оптимизация: отслеживание зависимостей, `v-once`, `v-memo` | `vue-rendering#Ручные подсказки`, `vue-best-practices#Производительность: две разные задачи` |
| Асинхронность рендера, батчинг, `nextTick` | `vue-watchers#Когда выполняется: flush и nextTick`, `vue-rendering#Какие компоненты рендерятся` |
| Что вызывает ререндер (ref, reactive, props, computed, `$forceUpdate`) | `vue-rendering#Что вызывает повторный рендер, а что нет` |
| Что не вызывает ререндер (обычные переменные, неиспользуемые данные) | там же, проверено запуском |
| Хуки жизненного цикла по фазам, связь с ререндером, `setup` один раз | `vue-lifecycle` целиком |
| `ref`: когда использовать, разворачивание в шаблоне | `vue-reactivity#ref и reactive`, `#Разворачивание ref` |
| `reactive`: ограничения, деструктуризация, переприсвоение, `toRefs` | `vue-reactivity#Где теряется реактивность` |
| Что лучше: `ref` или `reactive` | `vue-reactivity#ref и reactive` |
| Что такое эффект, `activeEffect` | `vue-reactivity#Как Vue узнаёт о зависимостях` (модель track/trigger, выполняется) |
| `computed`: ленивость, кэш, чистота, синхронность, writable | `vue-reactivity#computed` |
| `watch`: источники, опции, use cases, остановка | `vue-watchers#watch и watchEffect`, `#Глубина: deep, getter, once`, `#Очистка и гонки` |
| `watchEffect` и cleanup с `AbortController` | `vue-watchers#Очистка и гонки` |
| `watchPostEffect`, `watchSyncEffect` | `vue-watchers#watchEffect, watchPostEffect, watchSyncEffect` |
| Сравнительная таблица всех эффектов | `vue-watchers#Сравнение всех эффектов` |
| Производительность (ссылка) | `vue-best-practices#Производительность: две разные задачи` |
| Доступность (ссылка) | `vue-best-practices#Доступность` |
| Безопасность (ссылка) | `vue-best-practices#Безопасность` |

Добавлено сверх заметок, потому что об этом спрашивают на собеседованиях: Options API против Composition API, миксины, отличия Vue 2 и Vue 3, плагины (`vue-options-vs-composition`); валидация пропсов, проброс атрибутов, обобщённые компоненты (`vue-components`); полный порядок guards, ошибки навигации, синтаксис путей (`vue-router`); обработка ошибок (`vue-lifecycle`); режимы рендера Nuxt и тесты (`vue-app`).

## Ошибки, найденные во втором проходе

| Раздел | В заметках | На самом деле | Источник |
|---|---|---|---|
| Таблица эффектов | `watchPostEffect`: «Выполнение сразу: Да» | Первый запуск тоже откладывается до окончания рендера (`flush: 'post'`): при создании ничего не выполняется | проверено запуском, [Watchers](https://vuejs.org/guide/essentials/watchers.html#post-watchers) |
| Таблица эффектов | `computed`: «Доступ к old/new: Нет» | С 3.4 геттер `computed` получает предыдущее значение первым аргументом | [Computed: getting the previous value](https://vuejs.org/guide/essentials/computed.html#getting-the-previous-value) |
| watch | `watch(state, …, { deep: true })` для `reactive` | Для `reactive` наблюдатель и так глубокий; `deep: true` лишний | [Deep watchers](https://vuejs.org/guide/essentials/watchers.html#deep-watchers), проверено запуском |
| watch | «Без deep не сработает» для `ref` с объектом | Верно, но с 3.5 `deep` может быть числом уровней, а не только `true` | там же |
| Хуки | `beforeMount`: «Шаблон скомпилирован» | В проекте на Vite шаблон скомпилирован ещё при сборке; в `beforeMount` готова render-функция, DOM ещё нет | [Rendering mechanism](https://vuejs.org/guide/extras/rendering-mechanism.html) |
| Хуки | `updated`: «изменение state вызовет бесконечный цикл» | Цикл только если каждое обновление снова меняет состояние; в разработке Vue останавливает его ошибкой о превышении числа рекурсивных обновлений | [Lifecycle](https://vuejs.org/guide/essentials/lifecycle.html) |
| Ререндер | Порядок хуков при ререндере без упоминания детей | `onBeforeUpdate` идёт сверху вниз, `onUpdated` снизу вверх; ребёнок обновляется только при изменении своих пропсов или зависимостей | проверено запуском |
| Ререндер | `$forceUpdate` как способ обновления | Маскирует нереактивное состояние; правильнее сделать данные `ref` | [Reactivity in depth](https://vuejs.org/guide/extras/reactivity-in-depth.html) |
