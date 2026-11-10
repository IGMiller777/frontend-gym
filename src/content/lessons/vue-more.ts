import type { Source } from '../sources'
import type { Lesson } from './types'

/** Vue lessons added in the coverage pass (Notion topics + interview essentials); ordered in vue.ts. */
const docs = (title: string, path: string): Source => ({ title: `vuejs.org: ${title}`, url: `https://vuejs.org/${path}`, kind: 'official' })
const router = (title: string, path: string): Source => ({ title: `router.vuejs.org: ${title}`, url: `https://router.vuejs.org/${path}`, kind: 'official' })
const verified = { date: '2026-11', version: 'Vue 3.5, Vue Router 5.4' }

export const vueMoreLessons: Lesson[] = [
  {
    id: 'vue-template-syntax',
    track: 'vue',
    emoji: '🏷️',
    minutes: 14,
    title: { ru: 'Шаблоны, директивы, списки и события', en: 'Templates, directives, lists and events' },
    summary: {
      ru: 'Анатомия директивы, :class и :style, v-if против v-show, v-for и ключи, модификаторы событий, v-model на полях формы, v-html и XSS, свои директивы.',
      en: 'Directive anatomy, :class and :style, v-if versus v-show, v-for and keys, event modifiers, v-model on form fields, v-html and XSS, custom directives.',
    },
    quiz: {
      ru: [
        { q: 'Что случится с введённым текстом при `:key="index"` и вставке строки в начало списка?', options: ['Останется у своей строки', 'Окажется у чужой строки', 'Сотрётся во всех строках', 'Vue выдаст ошибку ключа'], correct: 1, why: 'С ключом-индексом Vue переиспользует элементы по позиции: текст меняется, а состояние поля остаётся на месте.' },
        { q: 'Что выбрать для панели, которую часто открывают и закрывают?', options: ['`v-if` с `v-else`', '`v-for` по одному элементу', '`v-show`', '`v-once`'], correct: 2, why: '`v-show` только переключает `display`, а `v-if` каждый раз создаёт и уничтожает поддерево.' },
        { q: 'Во что превращается `v-model="name"` на `<input>`?', options: ['`:value` и `@input`', '`:checked` и `@change`', '`:modelValue` и `@update`', '`v-bind` и `v-once`'], correct: 0, why: 'Для текстового поля `v-model` это привязка `value` и обработчик `input`; для чекбокса `checked` и `change`.' },
        { q: 'Какая привязка выведет HTML пользователя без экранирования?', options: ['`{{ text }}`', '`:title="text"`', '`v-text="text"`', '`v-html="text"`'], correct: 3, why: 'Интерполяция и атрибуты экранируются; `v-html` вставляет строку как HTML и опасен с недоверенными данными.' },
      ],
      en: [
        { q: 'What happens to typed text with `:key="index"` when a row is inserted at the top?', options: ['It stays with its own row', 'It ends up on another row', 'It is erased in every row', 'Vue throws a key error'], correct: 1, why: 'With an index key Vue reuses elements by position: the text changes, but the field state stays in place.' },
        { q: 'What suits a panel that is opened and closed often?', options: ['`v-if` with `v-else`', '`v-for` over one item', '`v-show`', '`v-once`'], correct: 2, why: '`v-show` only toggles `display`, while `v-if` creates and destroys the subtree each time.' },
        { q: 'What does `v-model="name"` on an `<input>` become?', options: ['`:value` and `@input`', '`:checked` and `@change`', '`:modelValue` and `@update`', '`v-bind` and `v-once`'], correct: 0, why: 'For a text field `v-model` is a `value` binding plus an `input` handler; for a checkbox `checked` and `change`.' },
        { q: 'Which binding outputs user HTML without escaping?', options: ['`{{ text }}`', '`:title="text"`', '`v-text="text"`', '`v-html="text"`'], correct: 3, why: 'Interpolation and attributes are escaped; `v-html` inserts the string as HTML and is dangerous with untrusted data.' },
      ],
    },
    sources: [
      docs('Template syntax', 'guide/essentials/template-syntax.html'),
      docs('Class and style bindings', 'guide/essentials/class-and-style.html'),
      docs('List rendering', 'guide/essentials/list.html'),
      docs('Event handling', 'guide/essentials/event-handling.html'),
      docs('Form input bindings', 'guide/essentials/forms.html'),
      docs('Custom directives', 'guide/reusability/custom-directives.html'),
      docs('Built-in directives', 'api/built-in-directives.html'),
    ],
    verified,
  },
  {
    id: 'vue-lifecycle',
    track: 'vue',
    emoji: '🔄',
    minutes: 12,
    title: { ru: 'Жизненный цикл компонента', en: 'Component lifecycle' },
    summary: {
      ru: 'Схема хуков, setup один раз, порядок у родителя и ребёнка, Options API против Composition API, что делать в каком хуке, onErrorCaptured и errorHandler.',
      en: 'The hook diagram, setup runs once, parent and child order, Options API versus Composition API, what goes in which hook, onErrorCaptured and errorHandler.',
    },
    quiz: {
      ru: [
        { q: 'Что выполняется заново при обновлении компонента?', options: ['Функция `setup` целиком', 'Только render-функция', 'Хук `onMounted` компонента', 'Регистрация всех хуков'], correct: 1, why: '`setup` выполняется один раз при создании; при обновлении повторяется рендер.' },
        { q: 'Чей `onMounted` вызывается последним при первом монтировании?', options: ['Самого глубокого ребёнка', 'Первого ребёнка в шаблоне', 'Родителя', 'Порядок не определён'], correct: 2, why: '«After»-хуки идут снизу вверх: родитель смонтирован, когда смонтировано всё поддерево.' },
        { q: 'Что выполняется раньше в компоненте с `setup` и опциями?', options: ['`setup()`', '`beforeCreate`', '`data()`', '`created`'], correct: 0, why: '`setup` выполняется до `beforeCreate`; затем инициализируются опции и вызывается `created`.' },
        { q: 'Как `onErrorCaptured` останавливает всплытие ошибки?', options: ['Бросает ошибку дальше', 'Вызывает `preventDefault`', 'Ставит `error.handled`', 'Возвращает `false`'], correct: 3, why: 'Возврат `false` останавливает передачу ошибки предкам и в `app.config.errorHandler`.' },
      ],
      en: [
        { q: 'What runs again when a component updates?', options: ['The whole `setup` function', 'Only the render function', 'The `onMounted` hook', 'Registering all the hooks'], correct: 1, why: '`setup` runs once on creation; an update repeats the render.' },
        { q: 'Whose `onMounted` runs last on the first mount?', options: ['The deepest child', 'The first child in the template', 'The parent', 'The order is undefined'], correct: 2, why: '"After" hooks go bottom-up: the parent is mounted once its whole subtree is.' },
        { q: 'What runs first in a component with `setup` and options?', options: ['`setup()`', '`beforeCreate`', '`data()`', '`created`'], correct: 0, why: '`setup` runs before `beforeCreate`; then options are initialized and `created` is called.' },
        { q: 'How does `onErrorCaptured` stop an error from propagating?', options: ['It rethrows the error', 'It calls `preventDefault`', 'It sets `error.handled`', 'It returns `false`'], correct: 3, why: 'Returning `false` stops the error from reaching ancestors and `app.config.errorHandler`.' },
      ],
    },
    sources: [
      docs('Lifecycle hooks', 'guide/essentials/lifecycle.html'),
      docs('Composition API: lifecycle hooks', 'api/composition-api-lifecycle.html'),
      docs('Options: lifecycle', 'api/options-lifecycle.html'),
      docs('Application API: errorHandler', 'api/application.html#app-config-errorhandler'),
    ],
    verified,
  },
  {
    id: 'vue-built-ins',
    track: 'vue',
    emoji: '🧰',
    minutes: 12,
    title: { ru: 'Встроенные компоненты', en: 'Built-in components' },
    summary: {
      ru: 'component :is, KeepAlive с include, max и onActivated, Teleport и defer, классы Transition и TransitionGroup, defineAsyncComponent, экспериментальный Suspense.',
      en: 'component :is, KeepAlive with include, max and onActivated, Teleport and defer, Transition and TransitionGroup classes, defineAsyncComponent, the experimental Suspense.',
    },
    quiz: {
      ru: [
        { q: 'Что происходит с компонентом в `<KeepAlive>`, когда его скрыли?', options: ['Размонтируется с состоянием', 'Деактивируется и хранится', 'Рендерится в скрытый `div`', 'Переносится в `<body>`'], correct: 1, why: '`KeepAlive` вызывает `onDeactivated` и держит экземпляр в кэше; при возврате `onActivated`.' },
        { q: 'Модалка внутри `<Teleport to="body">` вызывает `$emit`. Где слушать событие?', options: ['На `document.body`', 'Через `window.postMessage`', 'На компоненте, как обычно', 'Его не получить'], correct: 2, why: 'Teleport переносит только DOM; в дереве компонентов модалка остаётся ребёнком, события и `inject` работают.' },
        { q: 'Зачем у `defineAsyncComponent` есть `delay`?', options: ['Не мигать загрузкой на быстрой сети', 'Задержать загрузку кода компонента', 'Ограничить общее время загрузки', 'Повторить загрузку после ошибки'], correct: 0, why: 'Компонент загрузки показывается только если ожидание дольше `delay` (по умолчанию 200 мс); для лимита есть `timeout`.' },
        { q: 'Какой класс задаёт начальное состояние анимации появления?', options: ['`v-enter-active`', '`v-enter-to`', '`v-leave-from`', '`v-enter-from`'], correct: 3, why: '`v-enter-from` действует в первый кадр, `v-enter-active` всю анимацию, `v-enter-to` конечное состояние.' },
      ],
      en: [
        { q: 'What happens to a component inside `<KeepAlive>` when it is hidden?', options: ['Unmounted with its state', 'Deactivated and kept', 'Rendered into a hidden `div`', 'Moved into `<body>`'], correct: 1, why: '`KeepAlive` calls `onDeactivated` and keeps the instance cached; coming back calls `onActivated`.' },
        { q: 'A modal inside `<Teleport to="body">` calls `$emit`. Where do you listen?', options: ['On `document.body`', 'Through `window.postMessage`', 'On the component as usual', 'You cannot get it'], correct: 2, why: 'Teleport moves only the DOM; in the component tree the modal is still a child, so events and `inject` work.' },
        { q: 'Why does `defineAsyncComponent` have a `delay`?', options: ['No loading flash on fast networks', 'To postpone loading the code', 'To cap the loading time', 'To retry loading on errors'], correct: 0, why: 'The loading component shows only if waiting takes longer than `delay` (200 ms by default); `timeout` sets the limit.' },
        { q: 'Which class sets the start state of an enter animation?', options: ['`v-enter-active`', '`v-enter-to`', '`v-leave-from`', '`v-enter-from`'], correct: 3, why: '`v-enter-from` applies for the first frame, `v-enter-active` for the whole animation, `v-enter-to` is the end state.' },
      ],
    },
    sources: [
      docs('KeepAlive', 'guide/built-ins/keep-alive.html'),
      docs('Teleport', 'guide/built-ins/teleport.html'),
      docs('Transition', 'guide/built-ins/transition.html'),
      docs('TransitionGroup', 'guide/built-ins/transition-group.html'),
      docs('Async components', 'guide/components/async.html'),
      docs('Suspense', 'guide/built-ins/suspense.html'),
    ],
    verified,
  },
  {
    id: 'vue-options-vs-composition',
    track: 'vue',
    emoji: '⚖️',
    minutes: 13,
    title: { ru: 'Options и Composition API, Vue 2 и Vue 3, плагины', en: 'Options and Composition API, Vue 2 and Vue 3, plugins' },
    summary: {
      ru: 'Один компонент двумя способами, таблица различий, почему миксины уступили composables, defineProperty против Proxy, что изменилось в Vue 3, createApp и плагины.',
      en: 'One component written both ways, a table of differences, why mixins gave way to composables, defineProperty versus Proxy, what changed in Vue 3, createApp and plugins.',
    },
    quiz: {
      ru: [
        { q: 'Зачем в Vue 2 был нужен `Vue.set`?', options: ['Для ускорения рендера больших списков', 'Сеттеры есть лишь у исходных ключей', 'Чтобы обойти ограничения строгого режима', 'Для записи в вычисляемые свойства'], correct: 1, why: '`Object.defineProperty` вешает сеттер на существующие ключи; новый ключ без `Vue.set` не реактивен. Proxy в Vue 3 это снял.' },
        { q: 'Какая проблема миксинов решена в composables?', options: ['Миксины медленнее функций', 'Миксины нельзя тестировать', 'Неясно, откуда свойство', 'Миксины не работают с SSR'], correct: 2, why: 'Свойства миксина появляются на `this` неявно и конфликтуют по именам; composable возвращает их явно.' },
        { q: 'Что из этого появилось только в Vue 3?', options: ['`Teleport` и фрагменты', 'Директива `v-model`', 'Слоты с данными ребёнка', 'Хук `mounted`'], correct: 0, why: 'Несколько корневых элементов, `Teleport` и `Suspense` пришли в Vue 3; остальное было и в Vue 2.' },
        { q: 'Что получает метод `install` плагина?', options: ['Корневой компонент', 'Экземпляр роутера', 'Глобальный объект `Vue`', 'Приложение и опции'], correct: 3, why: '`app.use(plugin, options)` вызывает `install(app, options)`, где плагин регистрирует компоненты, директивы и `provide`.' },
      ],
      en: [
        { q: 'Why did Vue 2 need `Vue.set`?', options: ['To speed up rendering of long lists', 'Setters existed only for initial keys', 'To get around strict mode limits', 'To write into computed properties'], correct: 1, why: '`Object.defineProperty` puts setters on existing keys; a new key without `Vue.set` is not reactive. Vue 3 Proxies removed this.' },
        { q: 'Which mixin problem do composables solve?', options: ['Mixins are slower than functions', 'Mixins cannot be tested', 'Unclear where a property comes from', 'Mixins do not work with SSR'], correct: 2, why: 'Mixin properties appear on `this` implicitly and clash by name; a composable returns them explicitly.' },
        { q: 'Which of these arrived only in Vue 3?', options: ['`Teleport` and fragments', 'The `v-model` directive', 'Slots with child data', 'The `mounted` hook'], correct: 0, why: 'Multiple root elements, `Teleport` and `Suspense` came with Vue 3; the rest existed in Vue 2.' },
        { q: 'What does a plugin `install` method receive?', options: ['The root component', 'The router instance', 'The global `Vue` object', 'The app and the options'], correct: 3, why: '`app.use(plugin, options)` calls `install(app, options)`, where the plugin registers components, directives and `provide`.' },
      ],
    },
    sources: [
      docs('Composition API FAQ', 'guide/extras/composition-api-faq.html'),
      docs('Reactivity in depth', 'guide/extras/reactivity-in-depth.html'),
      docs('Plugins', 'guide/reusability/plugins.html'),
      docs('Composables vs mixins', 'guide/reusability/composables.html#vs-mixins'),
      { title: 'v3-migration.vuejs.org: Vue 3 migration guide', url: 'https://v3-migration.vuejs.org/', kind: 'official' },
    ],
    verified,
  },
  {
    id: 'vue-router',
    track: 'vue',
    emoji: '🧭',
    minutes: 15,
    title: { ru: 'Vue Router подробно', en: 'Vue Router in depth' },
    summary: {
      ru: 'Режимы истории, guards и meta, полный порядок навигации, переиспользование компонента при смене параметра, синтаксис путей, ошибки навигации, вложенные маршруты, файловый роутинг.',
      en: 'History modes, guards and meta, the full navigation order, component reuse on a param change, path syntax, navigation failures, nested routes, file-based routing.',
    },
    quiz: {
      ru: [
        { q: 'Переход `/users/1` → `/users/2`. Что вызовется в компоненте `User`?', options: ['`onMounted` заново', '`beforeRouteUpdate`', '`beforeRouteEnter`', 'Ничего из этого'], correct: 1, why: 'Тот же маршрут с другим параметром переиспользует экземпляр: вызывается `beforeRouteUpdate`, а не монтирование.' },
        { q: 'Какой guard выполняется первым при уходе со страницы?', options: ['Глобальный `beforeEach`', '`beforeEnter` маршрута', '`beforeRouteLeave` компонента', 'Глобальный `beforeResolve`'], correct: 2, why: 'Навигация начинается с `beforeRouteLeave` в уходящих компонентах, затем `beforeEach`.' },
        { q: 'Что вернёт `await router.push(...)`, если guard вернул `false`?', options: ['Ошибку навигации', 'Исключение `Aborted`', 'Значение `false`', 'Маршрут `/`'], correct: 0, why: '`push` не бросает исключение, а возвращает объект ошибки навигации; проверка `isNavigationFailure`.' },
        { q: 'Какой путь выберется для `/orders/new` при маршрутах `/orders/:id` и `/orders/new`?', options: ['Объявленный первым', 'Объявленный последним', '`/orders/:id`', '`/orders/new`'], correct: 3, why: 'Роутер ранжирует пути по специфичности: статический сегмент важнее параметра, порядок объявления не важен.' },
      ],
      en: [
        { q: 'Navigating `/users/1` → `/users/2`. What runs in the `User` component?', options: ['`onMounted` again', '`beforeRouteUpdate`', '`beforeRouteEnter`', 'None of these'], correct: 1, why: 'The same route with another param reuses the instance: `beforeRouteUpdate` runs instead of mounting.' },
        { q: 'Which guard runs first when leaving a page?', options: ['The global `beforeEach`', 'The route `beforeEnter`', 'The component `beforeRouteLeave`', 'The global `beforeResolve`'], correct: 2, why: 'Navigation starts with `beforeRouteLeave` in the leaving components, then `beforeEach`.' },
        { q: 'What does `await router.push(...)` give when a guard returns `false`?', options: ['A navigation failure', 'An `Aborted` exception', 'The value `false`', 'The route `/`'], correct: 0, why: '`push` does not throw; it resolves to a navigation failure object, checked with `isNavigationFailure`.' },
        { q: 'Which path matches `/orders/new` given `/orders/:id` and `/orders/new`?', options: ['The one declared first', 'The one declared last', '`/orders/:id`', '`/orders/new`'], correct: 3, why: 'The router ranks paths by specificity: a static segment beats a param, and declaration order does not matter.' },
      ],
    },
    sources: [
      router('Navigation guards', 'guide/advanced/navigation-guards.html'),
      router('Routes matching syntax', 'guide/essentials/route-matching-syntax.html'),
      router('Dynamic route matching', 'guide/essentials/dynamic-matching.html'),
      router('Waiting for the result of a navigation', 'guide/advanced/navigation-failures.html'),
      router('Scroll behavior', 'guide/advanced/scroll-behavior.html'),
      router('Migrating to Vue Router 5', 'guide/migration/v4-to-v5.html'),
    ],
    verified,
  },
  {
    id: 'vue-best-practices',
    track: 'vue',
    emoji: '🛡️',
    minutes: 12,
    title: { ru: 'Производительность, доступность, безопасность', en: 'Performance, accessibility, security' },
    summary: {
      ru: 'Загрузка против обновлений, стабильные пропсы на примере 1000 строк, v-memo и виртуализация, фокус после смены маршрута, формы и useId, что Vue экранирует, v-html и javascript: в ссылках.',
      en: 'Loading versus updates, stable props on 1000 rows, v-memo and virtualization, focus after a route change, forms and useId, what Vue escapes, v-html and javascript: in links.',
    },
    quiz: {
      ru: [
        { q: 'Список из 1000 строк получает `:active-id="activeId"`. Сколько строк обновится при смене выбора?', options: ['Две строки', 'Ни одной строки', 'Только новая', 'Все 1000 строк'], correct: 3, why: 'Проп `activeId` изменился у всех строк; передача готового флага `active` обновила бы только две.' },
        { q: 'Что Vue делает с `:href="userUrl"`, где строка начинается с `javascript:`?', options: ['Вырезает опасный протокол', 'Экранирует как текст', 'Оставляет как есть', 'Бросает ошибку в dev'], correct: 2, why: 'Vue не проверяет URL: протокол нужно проверять самому, как в `safeUrl`.' },
        { q: 'Что делать после смены маршрута в SPA для скринридера?', options: ['Перенести фокус и сменить title', 'Перезагрузить страницу целиком', 'Добавить `aria-hidden` к `<main>`', 'Ничего, это делает браузер'], correct: 0, why: 'Клиентская навигация не объявляется как загрузка страницы; фокус на заголовок или ссылку пропуска и `document.title`.' },
        { q: 'Что документация называет правилом безопасности номер один?', options: ['Всегда использовать `v-text`', 'Не брать шаблон из ввода пользователя', 'Отключить `v-html` в сборке', 'Хранить токены в `sessionStorage`'], correct: 1, why: 'Шаблон компилируется в JavaScript; недоверенный шаблон равен выполнению чужого кода.' },
      ],
      en: [
        { q: 'A list of 1000 rows gets `:active-id="activeId"`. How many rows update when the selection changes?', options: ['Two rows', 'No rows at all', 'Only the new one', 'All 1000 rows'], correct: 3, why: 'The `activeId` prop changed for every row; passing a ready `active` flag would update only two.' },
        { q: 'What does Vue do with `:href="userUrl"` when the string starts with `javascript:`?', options: ['Strips the dangerous protocol', 'Escapes it as text', 'Leaves it as it is', 'Throws an error in dev'], correct: 2, why: 'Vue does not check URLs: check the protocol yourself, as `safeUrl` does.' },
        { q: 'What should an SPA do for screen readers after a route change?', options: ['Move focus and update the title', 'Reload the whole page', 'Add `aria-hidden` to `<main>`', 'Nothing, the browser does it'], correct: 0, why: 'Client-side navigation is not announced like a page load; focus the heading or skip link and set `document.title`.' },
        { q: 'What do the docs call security rule number one?', options: ['Always use `v-text` for output', 'Never take a template from user input', 'Turn off `v-html` in production builds', 'Keep tokens in `sessionStorage`'], correct: 1, why: 'A template compiles to JavaScript; an untrusted template equals running someone else’s code.' },
      ],
    },
    sources: [
      docs('Performance', 'guide/best-practices/performance.html'),
      docs('Accessibility', 'guide/best-practices/accessibility.html'),
      docs('Security', 'guide/best-practices/security.html'),
      { title: 'MDN: <dialog>', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog', kind: 'official' },
    ],
    verified,
  },
]
