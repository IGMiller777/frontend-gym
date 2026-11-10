import type { Source } from '../sources'
import type { Lesson, Module } from './types'

const docs = (title: string, path: string): Source => ({ title: `vuejs.org: ${title}`, url: `https://vuejs.org/${path}`, kind: 'official' })
const verified = { date: '2026-11', version: 'Vue 3.5, Pinia 4.1, Vue Router 5.4' }

export const vueLessons: Lesson[] = [
  {
    id: 'vue-reactivity',
    track: 'vue',
    emoji: '🔗',
    minutes: 12,
    title: { ru: 'Реактивность: ref, reactive, computed', en: 'Reactivity: ref, reactive, computed' },
    summary: {
      ru: 'Прокси reactive и .value у ref, где теряется реактивность и toRefs, разворачивание, ленивый computed, shallowRef и readonly.',
      en: 'The reactive proxy and ref .value, where reactivity is lost and toRefs, unwrapping, lazy computed, shallowRef and readonly.',
    },
    quiz: {
      ru: [
        { q: 'Что вернёт `reactive(obj)`?', options: ['Тот же объект с геттерами', 'Прокси исходного объекта', 'Глубокую копию объекта', 'Объект `{ value: obj }`'], correct: 1, why: '`reactive` возвращает Proxy; изменения через исходный объект Vue не отслеживает.' },
        { q: 'Что произойдёт при `const { count } = reactive({ count: 0 })` и `count++`?', options: ['Изменится и `state.count`', 'Изменится только локальная переменная', 'Vue бросит ошибку записи', 'Изменение применится после `nextTick`'], correct: 1, why: 'Деструктуризация копирует число из прокси; ссылку сохраняют `toRefs` или `toRef`.' },
        { q: 'Что делает `reactive(0)` в Vue 3.5?', options: ['Бросает `TypeError` сразу', 'Предупреждает и возвращает `0`', 'Возвращает `ref(0)` вместо прокси', 'Возвращает прокси вокруг числа'], correct: 1, why: 'Примитив нельзя сделать реактивным: в разработке предупреждение, возвращается исходное значение.' },
        { q: 'Когда выполняется геттер `computed`?', options: ['Сразу при создании и на каждом рендере', 'При первом чтении и после смены зависимостей', 'Только во время рендера шаблона компонента', 'В каждой микрозадаче после любых изменений'], correct: 1, why: '`computed` ленивый и кэширует результат до изменения прочитанных зависимостей.' },
      ],
      en: [
        { q: 'What does `reactive(obj)` return?', options: ['The same object with getters', 'A proxy of the original object', 'A deep copy of the object', 'An object `{ value: obj }`'], correct: 1, why: '`reactive` returns a Proxy; Vue does not track changes made through the original object.' },
        { q: 'What happens with `const { count } = reactive({ count: 0 })` and `count++`?', options: ['`state.count` changes as well', 'Only the local variable changes', 'Vue throws a write error', 'The change applies after `nextTick`'], correct: 1, why: 'Destructuring copies the number out of the proxy; `toRefs` or `toRef` keep the link.' },
        { q: 'What does `reactive(0)` do in Vue 3.5?', options: ['Throws a `TypeError`', 'Warns and returns `0`', 'Returns `ref(0)`', 'Returns a proxy of the number'], correct: 1, why: 'A primitive cannot be made reactive: a warning in development, and the original value is returned.' },
        { q: 'When does a `computed` getter run?', options: ['On creation and on every render', 'On first read and after deps change', 'Only while the template renders', 'In every microtask after any changes'], correct: 1, why: '`computed` is lazy and caches its result until the dependencies it read change.' },
      ],
    },
    sources: [
      docs('Reactivity fundamentals', 'guide/essentials/reactivity-fundamentals.html'),
      docs('Computed properties', 'guide/essentials/computed.html'),
      docs('Reactivity in depth', 'guide/extras/reactivity-in-depth.html'),
      docs('Reactivity API: advanced', 'api/reactivity-advanced.html'),
    ],
    verified,
  },
  {
    id: 'vue-watchers',
    track: 'vue',
    emoji: '👀',
    minutes: 12,
    title: { ru: 'Наблюдатели и nextTick', en: 'Watchers and nextTick' },
    summary: {
      ru: 'watch против watchEffect, flush pre, post и sync, группировка и nextTick, глубина и геттеры, once, onWatcherCleanup и гонки.',
      en: 'watch versus watchEffect, flush pre, post and sync, batching and nextTick, depth and getters, once, onWatcherCleanup and races.',
    },
    quiz: {
      ru: [
        { q: 'Когда выполняется `watch` с настройками по умолчанию после двух присваиваний подряд?', options: ['Дважды, на каждое присваивание', 'Один раз до обновления DOM', 'Один раз после обновления DOM', 'Сразу при первом присваивании'], correct: 1, why: 'По умолчанию `flush: \'pre\'`: изменения группируются, колбэк вызывается один раз перед обновлением компонентов.' },
        { q: 'Что увидит код сразу после `count.value = 5`, читая DOM?', options: ['Новое значение 5 сразу', 'Старое значение до `nextTick`', 'Пустую строку до рендера', 'Ошибку чтения DOM до рендера'], correct: 1, why: 'DOM обновляется в следующем проходе планировщика; дождаться можно `await nextTick()`.' },
        { q: '`watch(userRef, cb)` без опций. Сработает ли он на `userRef.value.name = "Bob"`?', options: ['Да, `watch` всегда глубокий', 'Нет, нужен `deep: true`', 'Да, но только один раз', 'Нет, нужен `flush: \'sync\'`'], correct: 1, why: '`watch` на ref реагирует на замену `.value`; мутации внутри видны с `deep`.' },
        { q: 'Где нельзя вызывать `onWatcherCleanup` в асинхронном колбэке?', options: ['До первого `await`', 'После первого `await`', 'Внутри `try`', 'В колбэке с `immediate: true`'], correct: 1, why: 'После `await` Vue не знает, к какому наблюдателю относится вызов; аргумент `onCleanup` работает всегда.' },
      ],
      en: [
        { q: 'When does a `watch` with default options run after two assignments in a row?', options: ['Twice, once per assignment', 'Once, before the DOM update', 'Once, after the DOM update', 'Right on the first assignment'], correct: 1, why: 'The default is `flush: \'pre\'`: changes are batched, and the callback runs once before components update.' },
        { q: 'What does code see in the DOM right after `count.value = 5`?', options: ['The new value 5 at once', 'The old value until `nextTick`', 'An empty string until render', 'A DOM read error before render'], correct: 1, why: 'The DOM updates in the next scheduler pass; wait for it with `await nextTick()`.' },
        { q: '`watch(userRef, cb)` without options. Does it fire on `userRef.value.name = "Bob"`?', options: ['Yes, `watch` is always deep', 'No, it needs `deep: true`', 'Yes, but only once', 'No, it needs `flush: \'sync\'`'], correct: 1, why: '`watch` on a ref reacts to replacing `.value`; mutations inside need `deep`.' },
        { q: 'Where can you not call `onWatcherCleanup` in an async callback?', options: ['Before the first `await`', 'After the first `await`', 'Inside a `try` block', 'In a callback with `immediate: true`'], correct: 1, why: 'After `await` Vue no longer knows which watcher the call belongs to; the `onCleanup` argument always works.' },
      ],
    },
    sources: [
      docs('Watchers', 'guide/essentials/watchers.html'),
      docs('nextTick', 'api/general.html#nexttick'),
      docs('Reactivity API: core', 'api/reactivity-core.html'),
    ],
    verified,
  },
  {
    id: 'vue-components',
    track: 'vue',
    emoji: '🧩',
    minutes: 14,
    title: { ru: 'Компоненты: script setup, v-model, слоты', en: 'Components: script setup, v-model, slots' },
    summary: {
      ru: 'SFC и script setup, реактивные пропсы 3.5, defineModel, scoped-слоты, provide и inject, useTemplateRef, директивы, KeepAlive и Teleport.',
      en: 'SFC and script setup, reactive props in 3.5, defineModel, scoped slots, provide and inject, useTemplateRef, directives, KeepAlive and Teleport.',
    },
    quiz: {
      ru: [
        { q: 'Что такое `defineProps` в `<script setup>`?', options: ['Функция из пакета `vue`', 'Макрос компилятора', 'Хук жизненного цикла', 'Декоратор класса компонента'], correct: 1, why: 'Макросы `defineProps`, `defineEmits`, `defineModel` не импортируют: компилятор SFC заменяет их кодом.' },
        { q: 'Реактивна ли переменная из `const { size } = defineProps()` в Vue 3.5?', options: ['Нет, нужен `toRefs(props)`', 'Да, компилятор читает через `props`', 'Только вместе с `withDefaults`', 'Только если в пропсе объект'], correct: 1, why: 'С 3.5 деструктуризация пропсов в `<script setup>` реактивна и поддерживает значения по умолчанию.' },
        { q: 'Зачем scoped-слот?', options: ['Ограничить стили слота компонентом', 'Отдать данные ребёнка разметке родителя', 'Загрузить содержимое лениво', 'Передать слот через несколько уровней'], correct: 1, why: 'Scoped-слот передаёт данные в шаблон родителя: логика в компоненте, внешний вид у родителя.' },
        { q: 'Чем `v-show` отличается от `v-if`?', options: ['`v-show` удаляет элемент из DOM', '`v-show` только переключает `display`', '`v-show` работает только с компонентами', '`v-show` нельзя использовать в `v-for`'], correct: 1, why: '`v-if` создаёт и уничтожает элемент с состоянием, `v-show` оставляет его и меняет `display`.' },
      ],
      en: [
        { q: 'What is `defineProps` in `<script setup>`?', options: ['A function from the `vue` package', 'A compiler macro', 'A lifecycle hook', 'A component class decorator'], correct: 1, why: 'The `defineProps`, `defineEmits`, `defineModel` macros are not imported: the SFC compiler replaces them with code.' },
        { q: 'Is the variable from `const { size } = defineProps()` reactive in Vue 3.5?', options: ['No, it needs `toRefs(props)`', 'Yes, the compiler reads via `props`', 'Only together with `withDefaults`', 'Only if the prop holds an object'], correct: 1, why: 'Since 3.5 destructured props in `<script setup>` are reactive and support default values.' },
        { q: 'What is a scoped slot for?', options: ['Limiting slot styles to the component', 'Handing child data to the parent\'s markup', 'Loading the content lazily', 'Passing a slot through several levels'], correct: 1, why: 'A scoped slot passes data into the parent\'s template: logic in the component, look in the parent.' },
        { q: 'How does `v-show` differ from `v-if`?', options: ['`v-show` removes the element from the DOM', '`v-show` only toggles `display`', '`v-show` works only with components', '`v-show` cannot be used in `v-for`'], correct: 1, why: '`v-if` creates and destroys the element with its state, `v-show` keeps it and changes `display`.' },
      ],
    },
    sources: [
      docs('<script setup>', 'api/sfc-script-setup.html'),
      docs('Props', 'guide/components/props.html'),
      docs('Component v-model', 'guide/components/v-model.html'),
      docs('Slots', 'guide/components/slots.html'),
      docs('Provide / Inject', 'guide/components/provide-inject.html'),
      docs('Template refs', 'guide/essentials/template-refs.html'),
    ],
    verified,
  },
  {
    id: 'vue-composables',
    track: 'vue',
    emoji: '🧪',
    minutes: 12,
    title: { ru: 'Composables и Pinia', en: 'Composables and Pinia' },
    summary: {
      ru: 'Правила composables, toValue и MaybeRefOrGetter, effectScope и onScopeDispose, setup-сторы Pinia, storeToRefs, подписки, состояние при SSR.',
      en: 'Rules of composables, toValue and MaybeRefOrGetter, effectScope and onScopeDispose, Pinia setup stores, storeToRefs, subscriptions, state under SSR.',
    },
    quiz: {
      ru: [
        { q: 'Что лучше возвращать из composable?', options: ['Объект `reactive` со всеми полями', 'Обычный объект из ref', 'Массив значений', 'Экземпляр класса'], correct: 1, why: 'Объект из ref можно деструктурировать без потери реактивности.' },
        { q: 'Почему composable вызывают синхронно в `setup`?', options: ['Иначе composable работает медленнее', 'После `await` хуки уже не у компонента', 'Так требует проверка типов TypeScript', 'Асинхронные функции запрещены'], correct: 1, why: 'Хуки и эффекты регистрируются в текущем экземпляре, а после `await` его уже нет.' },
        { q: 'Как деструктурировать состояние стора Pinia без потери реактивности?', options: ['`const { total } = store`', '`storeToRefs(store)`', '`toRaw(store)`', '`store.$state` и spread'], correct: 1, why: 'Стор это `reactive`; `storeToRefs` превращает состояние и геттеры в ref, действия берут напрямую.' },
        { q: 'Почему глобальный `reactive` в модуле опасен при SSR?', options: ['Он не работает в среде Node.js', 'Он общий для всех запросов сервера', 'Он не сериализуется в HTML', 'Он ломает гидратацию стилей'], correct: 1, why: 'Модуль загружается один раз на процесс, и данные одного пользователя попадут другому; Pinia создаёт состояние на запрос.' },
      ],
      en: [
        { q: 'What should a composable return?', options: ['A `reactive` object with all fields', 'A plain object of refs', 'An array of values', 'An instance of a class'], correct: 1, why: 'An object of refs can be destructured without losing reactivity.' },
        { q: 'Why is a composable called synchronously in `setup`?', options: ['Otherwise the composable runs slower', 'After `await` hooks lose the component', 'TypeScript type checking requires it', 'Async functions are forbidden in setup'], correct: 1, why: 'Hooks and effects register on the current instance, and after `await` it is gone.' },
        { q: 'How do you destructure Pinia store state without losing reactivity?', options: ['`const { total } = store`', '`storeToRefs(store)`', '`toRaw(store)`', 'Spread `store.$state`'], correct: 1, why: 'A store is `reactive`; `storeToRefs` turns state and getters into refs, and actions are taken directly.' },
        { q: 'Why is a global `reactive` in a module dangerous under SSR?', options: ['It does not work in Node.js', 'It is shared by all server requests', 'It cannot be serialized to HTML', 'It breaks style hydration'], correct: 1, why: 'A module loads once per process, so one user\'s data leaks to another; Pinia creates state per request.' },
      ],
    },
    sources: [
      docs('Composables', 'guide/reusability/composables.html'),
      docs('effectScope', 'api/reactivity-advanced.html#effectscope'),
      { title: 'pinia.vuejs.org: Defining a store', url: 'https://pinia.vuejs.org/core-concepts/', kind: 'official' },
      { title: 'pinia.vuejs.org: Server Side Rendering', url: 'https://pinia.vuejs.org/ssr/', kind: 'official' },
    ],
    verified,
  },
  {
    id: 'vue-rendering',
    track: 'vue',
    emoji: '🎨',
    minutes: 11,
    title: { ru: 'Рендер: компилятор и Vapor Mode', en: 'Rendering: the compiler and Vapor Mode' },
    summary: {
      ru: 'Вывод компилятора 3.5: кэш статики, patch flags, блоки; какие компоненты рендерятся и отличие от React, v-memo, Vapor Mode в 3.6.',
      en: 'The 3.5 compiler output: cached statics, patch flags, blocks; which components render and how it differs from React, v-memo, Vapor Mode in 3.6.',
    },
    quiz: {
      ru: [
        { q: 'Родитель перерисовался, пропсы ребёнка не изменились. Перерисуется ли ребёнок?', options: ['Да, как дети в React', 'Нет, у него свои зависимости', 'Только с директивой `v-memo`', 'Только в режиме разработки'], correct: 1, why: 'Компонент Vue это отдельный эффект: он рендерится из-за своих зависимостей или изменённых пропсов.' },
        { q: 'Что значит patch flag `3 /* TEXT, CLASS */` у элемента?', options: ['Элемент полностью статичный', 'Сравнивать только текст и класс', 'Элемент рендерится три раза', 'Класс задан трижды'], correct: 1, why: 'Флаг говорит рантайму, какие части узла динамические, и остальное не сравнивается.' },
        { q: 'Где компилируются шаблоны SFC в проекте на Vite?', options: ['В браузере при первом рендере', 'При сборке плагином Vue', 'На сервере при каждом запросе', 'В Web Worker'], correct: 1, why: '`@vitejs/plugin-vue` компилирует шаблоны при сборке; компилятор не попадает в бандл.' },
        { q: 'Что такое Vapor Mode?', options: ['Новый стор вместо Pinia и Vuex', 'Компиляция без Virtual DOM', 'Режим SSR без гидратации', 'Ленивая загрузка компонентов'], correct: 1, why: 'Vapor Mode (3.6, RC) компилирует выбранные компоненты в прямую работу с DOM без Virtual DOM.' },
      ],
      en: [
        { q: 'A parent re-rendered and the child\'s props did not change. Does the child re-render?', options: ['Yes, like children in React', 'No, it has its own dependencies', 'Only with the `v-memo` directive', 'Only in development mode'], correct: 1, why: 'A Vue component is a separate effect: it renders because of its own dependencies or changed props.' },
        { q: 'What does the patch flag `3 /* TEXT, CLASS */` on an element mean?', options: ['The element is fully static', 'Compare only the text and the class', 'The element renders three times', 'The class is set three times'], correct: 1, why: 'The flag tells the runtime which parts of the node are dynamic, and the rest is not compared.' },
        { q: 'Where are SFC templates compiled in a Vite project?', options: ['In the browser on first render', 'At build time by the Vue plugin', 'On the server on every request', 'In a Web Worker'], correct: 1, why: '`@vitejs/plugin-vue` compiles templates at build time; the compiler does not reach the bundle.' },
        { q: 'What is Vapor Mode?', options: ['A new store replacing Pinia and Vuex', 'Compiling without a Virtual DOM', 'An SSR mode without hydration', 'Lazy loading of components'], correct: 1, why: 'Vapor Mode (3.6, RC) compiles chosen components into direct DOM work without a Virtual DOM.' },
      ],
    },
    sources: [
      docs('Rendering mechanism', 'guide/extras/rendering-mechanism.html'),
      docs('Performance', 'guide/best-practices/performance.html'),
      docs('Built-in directives: v-memo', 'api/built-in-directives.html#v-memo'),
    ],
    verified,
  },
  {
    id: 'vue-app',
    track: 'vue',
    emoji: '🗺️',
    minutes: 12,
    title: { ru: 'Роутер, SSR, Nuxt и тесты', en: 'Router, SSR, Nuxt and tests' },
    summary: {
      ru: 'Vue Router 5 и guards, props из параметров, SSR и гидратация, useId и data-allow-mismatch, ленивая гидратация, Nuxt 4, Vitest и Vue Test Utils.',
      en: 'Vue Router 5 and guards, props from params, SSR and hydration, useId and data-allow-mismatch, lazy hydration, Nuxt 4, Vitest and Vue Test Utils.',
    },
    quiz: {
      ru: [
        { q: 'Как глобальный guard Vue Router 5 перенаправляет на страницу входа?', options: ['Вызывает `next(\'/login\')` обязательно', 'Возвращает маршрут `{ path: \'/login\' }`', 'Бросает исключение `Redirect`', 'Меняет `window.location` вручную'], correct: 1, why: 'Guard возвращает маршрут для редиректа, `false` для отмены или ничего; `next` больше не нужен.' },
        { q: 'Что нового в Vue Router 5?', options: ['Отказ от Composition API', 'Файловый роутинг в ядре', 'Удаление navigation guards', 'Новый синтаксис маршрутов'], correct: 1, why: 'Vue Router 5 включил `unplugin-vue-router` в ядро; для обычной конфигурации ломающих изменений нет.' },
        { q: 'Зачем `useId()` в приложении с SSR?', options: ['Чтобы ускорить рендер списков', 'Одинаковые id на сервере и клиенте', 'Для ключей элементов в `v-for`', 'Чтобы шифровать атрибуты в HTML'], correct: 1, why: '`useId` (3.5) даёт стабильные id для `label` и `aria-*` без несовпадений при гидратации.' },
        { q: 'Что делает `hydrateOnVisible()` у асинхронного компонента?', options: ['Загружает его при наведении', 'Гидратирует, когда он виден', 'Рендерит его только на клиенте', 'Отключает SSR для страницы'], correct: 1, why: 'Ленивая гидратация (3.5) оставляет компонент статичным HTML, пока он не появится на экране.' },
      ],
      en: [
        { q: 'How does a global Vue Router 5 guard redirect to the login page?', options: ['It must call `next(\'/login\')`', 'It returns a route `{ path: \'/login\' }`', 'It throws a `Redirect` exception', 'It changes `window.location` by hand'], correct: 1, why: 'A guard returns a route to redirect to, `false` to cancel, or nothing; `next` is no longer needed.' },
        { q: 'What is new in Vue Router 5?', options: ['Dropping the Composition API', 'File-based routing in the core', 'Removing navigation guards', 'A new route syntax'], correct: 1, why: 'Vue Router 5 moved `unplugin-vue-router` into the core; ordinary configuration has no breaking changes.' },
        { q: 'Why use `useId()` in an SSR app?', options: ['To speed up list rendering', 'Same ids on server and client', 'For item keys in `v-for` loops', 'To encrypt attributes in the HTML'], correct: 1, why: '`useId` (3.5) gives stable ids for `label` and `aria-*` with no hydration mismatches.' },
        { q: 'What does `hydrateOnVisible()` do for an async component?', options: ['Loads its code on hover', 'Hydrates it once visible', 'Renders it only on the client', 'Turns off SSR for the page'], correct: 1, why: 'Lazy hydration (3.5) keeps the component as static HTML until it appears on screen.' },
      ],
    },
    sources: [
      { title: 'router.vuejs.org: Navigation guards', url: 'https://router.vuejs.org/guide/advanced/navigation-guards.html', kind: 'official' },
      { title: 'router.vuejs.org: Migrating to Vue Router 5', url: 'https://router.vuejs.org/guide/migration/v4-to-v5.html', kind: 'official' },
      docs('Server-side rendering', 'guide/scaling-up/ssr.html'),
      docs('Async components: lazy hydration', 'guide/components/async.html'),
      { title: 'nuxt.com: Rendering modes', url: 'https://nuxt.com/docs/guide/concepts/rendering', kind: 'official' },
      docs('Testing', 'guide/scaling-up/testing.html'),
    ],
    verified,
  },
]

export const vueModule: Module = {
  track: 'vue',
  lessons: vueLessons.map((l) => l.id),
  exam: {
    pass: 0.75,
    questions: {
      ru: [
        { q: 'Почему документация рекомендует `ref` по умолчанию?', options: ['`ref` заметно быстрее `reactive`', 'Меньше ловушек при деструктуризации', '`reactive` объявлен устаревшим в 3.5', '`ref` не требует писать `.value`'], correct: 1, why: '`ref` работает с любыми значениями и переживает замену `.value`; у `reactive` больше способов потерять реактивность.' },
        { q: '`watchEffect` создан, затем `a.value = 1; a.value = 2`. Сколько раз выполнится функция к концу `nextTick`?', options: ['Три раза, по разу на запись', 'Дважды: при создании и после', 'Один раз, только после изменений', 'Один раз, только при создании'], correct: 1, why: '`watchEffect` выполняется сразу при создании, а изменения группируются в один повторный запуск.' },
        { q: 'Наблюдатель должен читать DOM уже после обновления. Что указать?', options: ['`deep: true`', '`flush: \'post\'`', '`immediate: true`', '`once: true`'], correct: 1, why: '`flush: \'post\'` (`watchPostEffect`) выполняется после патча DOM.' },
        { q: 'Родитель держит значение через `v-model`. Ребёнок записал `model.value = 4` и сразу читает `model.value`. Что он получит?', options: ['4', 'Прежнее значение', '`undefined`', 'Ошибку записи'], correct: 1, why: 'Запись отправляет `update:modelValue`, а новое значение придёт пропом при следующем обновлении.' },
        { q: 'Как передать данные потомку на пятом уровне без пропсов на каждом уровне?', options: ['Через глобальную переменную модуля', '`provide` в предке, `inject` ниже', 'Через `$parent` пять раз', 'Через scoped-слот на каждом уровне'], correct: 1, why: '`provide`/`inject` передаёт значение всему поддереву.' },
        { q: 'Что делает `scope.stop()` у `effectScope`?', options: ['Приостанавливает рендер этого компонента', 'Гасит её эффекты и `onScopeDispose`', 'Удаляет компонент вместе с DOM', 'Очищает всё состояние стора Pinia'], correct: 1, why: 'Область останавливает свои `computed` и наблюдатели и вызывает колбэки `onScopeDispose`; так компонент очищается при размонтировании.' },
        { q: 'Новый объект `:options="{ a: 1 }"` в шаблоне родителя. Что с ребёнком при каждом рендере родителя?', options: ['Ничего, Vue сравнивает глубоко', 'Обновится: проп это новый объект', 'Ошибка в режиме разработки', 'Обновится только с `v-memo`'], correct: 1, why: 'Пропсы сравниваются поверхностно; объект, созданный в шаблоне, каждый раз новый.' },
        { q: 'Какая история Vue Router подходит для SSR и тестов?', options: ['`createWebHistory()`', '`createMemoryHistory()`', '`createWebHashHistory()`', 'Любая из трёх'], correct: 1, why: 'На сервере и в тестах нет адресной строки браузера; `createMemoryHistory` хранит историю в памяти.' },
      ],
      en: [
        { q: 'Why do the docs recommend `ref` by default?', options: ['`ref` is much faster than `reactive`', 'Fewer traps when destructuring', '`reactive` was deprecated in 3.5', '`ref` does not need `.value`'], correct: 1, why: '`ref` works with any value and survives replacing `.value`; `reactive` has more ways to lose reactivity.' },
        { q: 'A `watchEffect` is created, then `a.value = 1; a.value = 2`. How many times has the function run by the end of `nextTick`?', options: ['Three times, once per write', 'Twice: on creation and after', 'Once, only after the changes', 'Once, only on creation'], correct: 1, why: '`watchEffect` runs at once on creation, and the changes are batched into one more run.' },
        { q: 'A watcher must read the DOM after the update. What do you set?', options: ['`deep: true`', '`flush: \'post\'`', '`immediate: true`', '`once: true`'], correct: 1, why: '`flush: \'post\'` (`watchPostEffect`) runs after the DOM patch.' },
        { q: 'The parent holds a value through `v-model`. The child writes `model.value = 4` and reads `model.value` right away. What does it get?', options: ['4, the new value', 'The previous value', '`undefined` for now', 'A write error'], correct: 1, why: 'Writing emits `update:modelValue`, and the new value arrives as a prop on the next update.' },
        { q: 'How do you pass data to a descendant five levels down without props on every level?', options: ['Through a global module variable', '`provide` above, `inject` below', 'Through `$parent` five times', 'Through a scoped slot on each level'], correct: 1, why: '`provide`/`inject` passes a value to the whole subtree.' },
        { q: 'What does `scope.stop()` on an `effectScope` do?', options: ['Pauses rendering of the component', 'Stops its effects, runs disposers', 'Removes the component from the DOM', 'Clears all state of the Pinia store'], correct: 1, why: 'A scope stops its `computed`s and watchers and runs its `onScopeDispose` callbacks; this is how a component cleans up on unmount.' },
        { q: 'A new object `:options="{ a: 1 }"` in the parent template. What happens to the child on each parent render?', options: ['Nothing, Vue compares props deeply', 'It updates: the prop is a new object', 'An error in development mode', 'It updates only with `v-memo`'], correct: 1, why: 'Props are compared shallowly; an object created in the template is new every time.' },
        { q: 'Which Vue Router history suits SSR and tests?', options: ['`createWebHistory()`', '`createMemoryHistory()`', '`createWebHashHistory()`', 'Any of the three'], correct: 1, why: 'Servers and tests have no browser address bar; `createMemoryHistory` keeps the history in memory.' },
      ],
    },
  },
}
