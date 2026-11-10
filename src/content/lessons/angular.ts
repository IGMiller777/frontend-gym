import type { Source } from '../sources'
import type { Lesson, Module } from './types'

const docs = (title: string, path: string): Source => ({ title: `angular.dev: ${title}`, url: `https://angular.dev/${path}`, kind: 'official' })
const rxjs = (title: string, path: string): Source => ({ title: `rxjs.dev: ${title}`, url: `https://rxjs.dev/${path}`, kind: 'official' })
const verified = { date: '2026-11', version: 'Angular 22.2, RxJS 7.8' }

export const angularLessons: Lesson[] = [
  {
    id: 'ng-components',
    track: 'angular',
    emoji: '🧩',
    minutes: 12,
    title: { ru: 'Компоненты и шаблоны', en: 'Components and templates' },
    summary: {
      ru: 'Standalone по умолчанию, input(), output() и model(), @if и @for с track, проекция, host и сигнальные запросы.',
      en: 'Standalone by default, input(), output() and model(), @if and @for with track, projection, host and signal queries.',
    },
    quiz: {
      ru: [
        { q: 'Как подключить дочерний компонент к шаблону standalone-компонента?', options: ['Объявить его в `declarations` модуля', 'Добавить в `imports` компонента', 'Импортировать файл, и он подхватится сам', 'Указать в `providers` компонента'], correct: 1, why: 'С v19 компоненты standalone по умолчанию: всё, что использует шаблон, перечисляют в `imports`.' },
        { q: 'Зачем в `@for` выражение `track`?', options: ['Для сортировки элементов списка', 'Чтобы сопоставлять элементы между проверками', 'Чтобы включить ленивую загрузку элементов', 'Оно нужно только для вывода `$index`'], correct: 1, why: 'По `track` Angular понимает, какой элемент какой, и переиспользует DOM; выражение обязательно.' },
        { q: 'Что делает `model()` в компоненте?', options: ['Создаёт сервис для хранения модели', 'Вход, который компонент может менять сам', 'Подключает компонент к форме', 'Заменяет `computed` для объектов'], correct: 1, why: '`model()` создаёт пару из входа и выхода `<имя>Change`, и родитель пишет `[(value)]`.' },
        { q: 'Где в современном компоненте настраивают класс и обработчики хост-элемента?', options: ['В `@HostBinding` и `@HostListener`', 'В поле `host` декоратора', 'Только через `ElementRef`', 'В `viewProviders` компонента'], correct: 1, why: 'Документация рекомендует `host: { ... }`; декораторы работают, но считаются старым стилем.' },
      ],
      en: [
        { q: 'How do you make a child component available to a standalone component\'s template?', options: ['Declare it in a module\'s `declarations`', 'Add it to the component\'s `imports`', 'Import the file and it is picked up', 'List it in the component\'s `providers`'], correct: 1, why: 'Since v19 components are standalone by default: everything the template uses goes into `imports`.' },
        { q: 'Why does `@for` need a `track` expression?', options: ['To sort the items in the list', 'To match items between checks', 'To enable lazy loading of items', 'It is only needed to show `$index`'], correct: 1, why: 'With `track` Angular knows which item is which and reuses the DOM; the expression is required.' },
        { q: 'What does `model()` do in a component?', options: ['Creates a service to hold the model', 'An input the component can change itself', 'Connects the component to a form', 'Replaces `computed` for objects'], correct: 1, why: '`model()` creates an input plus a `<name>Change` output, and the parent writes `[(value)]`.' },
        { q: 'Where does a modern component set its host element\'s class and listeners?', options: ['In `@HostBinding` and `@HostListener`', 'In the decorator\'s `host` field', 'Only through `ElementRef`', 'In the component\'s `viewProviders`'], correct: 1, why: 'The docs recommend `host: { ... }`; the decorators work but are the older style.' },
      ],
    },
    sources: [
      docs('Anatomy of components', 'guide/components/anatomy-of-components'),
      docs('Inputs', 'guide/components/inputs'),
      docs('Outputs', 'guide/components/outputs'),
      docs('Control flow', 'guide/templates/control-flow'),
      docs('Content projection', 'guide/components/content-projection'),
      docs('Queries', 'guide/components/queries'),
      docs('Lifecycle', 'guide/components/lifecycle'),
    ],
    verified,
  },
  {
    id: 'ng-signals',
    track: 'angular',
    emoji: '📡',
    minutes: 14,
    title: { ru: 'Сигналы, effect и resource', en: 'Signals, effect and resource' },
    summary: {
      ru: 'Ленивый computed и динамические зависимости, равенство, тайминг и очистка effect, untracked, linkedSignal, resource, toSignal.',
      en: 'Lazy computed and dynamic dependencies, equality, effect timing and cleanup, untracked, linkedSignal, resource, toSignal.',
    },
    quiz: {
      ru: [
        { q: 'Когда выполняется функция `computed`, созданная и ни разу не прочитанная?', options: ['Сразу при создании', 'Только при первом чтении', 'На ближайшей проверке изменений', 'В ближайшей микрозадаче'], correct: 1, why: '`computed` ленивый: вычисляет значение, только когда его читают.' },
        { q: 'Эффект читает `count`. Подряд вызвали `count.set(1)` и `count.set(2)`. Что будет?', options: ['Два синхронных запуска: с 1 и с 2', 'Один отложенный запуск со значением 2', 'Ошибка записи в сигнал внутри эффекта', 'Два отложенных запуска подряд'], correct: 1, why: 'Эффект планируется, а не выполняется синхронно; изменения склеиваются в один запуск.' },
        { q: 'Можно ли писать в сигнал внутри `effect` в Angular 22?', options: ['Нет, только с `allowSignalWrites`', 'Да, ограничение снято в v19', 'Только в корневых эффектах', 'Только через `untracked`'], correct: 1, why: 'С v19 запись разрешена, а `allowSignalWrites` ничего не делает; производное лучше делать через `computed`.' },
        { q: 'Что показывает `resource` при `reload()` после успешной загрузки?', options: ['Статус `loading`, значение `undefined`', 'Статус `reloading`, прежнее значение', 'Статус `idle` до конца загрузки', 'Статус `error`, пока нет ответа'], correct: 1, why: 'При `reload()` старое значение остаётся, а статус `reloading`; при новых `params` значение сбрасывается.' },
      ],
      en: [
        { q: 'When does the function of a `computed` that was created but never read run?', options: ['Right when it is created', 'Only on the first read', 'At the next change detection', 'In the next microtask'], correct: 1, why: '`computed` is lazy: it computes the value only when it is read.' },
        { q: 'An effect reads `count`. `count.set(1)` and `count.set(2)` are called in a row. What happens?', options: ['Two synchronous runs: with 1 and 2', 'One deferred run with the value 2', 'An error about writing to a signal', 'Two deferred runs one after another'], correct: 1, why: 'An effect is scheduled rather than run synchronously; the changes are batched into one run.' },
        { q: 'Can you write to a signal inside an `effect` in Angular 22?', options: ['No, only with `allowSignalWrites`', 'Yes, the restriction was lifted in v19', 'Only in root effects, not in components', 'Only inside an `untracked` callback'], correct: 1, why: 'Since v19 writes are allowed and `allowSignalWrites` does nothing; derived state is better done with `computed`.' },
        { q: 'What does a `resource` show on `reload()` after a successful load?', options: ['Status `loading`, value `undefined`', 'Status `reloading`, the previous value', 'Status `idle` until the load ends', 'Status `error` until there is a response'], correct: 1, why: 'On `reload()` the old value stays and the status is `reloading`; with new `params` the value resets.' },
      ],
    },
    sources: [
      docs('Signals', 'guide/signals'),
      docs('Effects', 'guide/signals/effect'),
      docs('linkedSignal', 'guide/signals/linked-signal'),
      docs('Async reactivity with resources', 'guide/signals/resource'),
      docs('RxJS interop with signals', 'ecosystem/rxjs-interop/signals-interop'),
    ],
    verified,
  },
  {
    id: 'ng-change-detection',
    track: 'angular',
    emoji: '🔄',
    minutes: 12,
    title: { ru: 'Обнаружение изменений: zoneless и OnPush', en: 'Change detection: zoneless and OnPush' },
    summary: {
      ru: 'Zone.js и что его заменило, что планирует проверку в zoneless, OnPush по умолчанию и Eager, markForCheck, NG0100.',
      en: 'Zone.js and what replaced it, what schedules a check in zoneless mode, OnPush by default and Eager, markForCheck, NG0100.',
    },
    quiz: {
      ru: [
        { q: 'Zoneless-приложение: обычное поле компонента изменили в `setTimeout`. Что будет на экране?', options: ['Обновится сразу после таймера', 'Останется старым до следующей проверки', 'Будет ошибка `NG0100` в консоли', 'Обновится через одну микрозадачу'], correct: 1, why: 'Без Zone.js о таймере никто не сообщает; нужен сигнал, `markForCheck` или событие шаблона.' },
        { q: 'Какой режим обнаружения изменений у компонента без явной настройки в Angular 22?', options: ['`Default`', '`OnPush`', '`Eager`', 'Зависит от zoneless'], correct: 1, why: 'С v22 `OnPush` по умолчанию; прежнее поведение задают явно через `Eager`.' },
        { q: 'Чем `markForCheck()` отличается от `detectChanges()`?', options: ['Ничем, это два имени одного метода', 'Первый планирует проверку, второй сразу', 'Первый проверяет детей, второй предков', 'Первый работает только в приложениях с Zone.js'], correct: 1, why: '`markForCheck` помечает компонент и предков к ближайшей проверке, `detectChanges` проверяет синхронно сейчас.' },
        { q: 'Как правильно исправить `NG0100`, возникший в `ngAfterViewInit`?', options: ['Обернуть изменение в `setTimeout`', 'Вынести значение в `computed` или событие', 'Отключить режим разработки в сборке', 'Перевести компонент в `Eager`'], correct: 1, why: 'Ошибка говорит о нарушении потока данных; `setTimeout` лишь прячет её.' },
      ],
      en: [
        { q: 'A zoneless app: a plain component field is changed in `setTimeout`. What is on screen?', options: ['It updates right after the timer', 'It stays stale until the next check', 'There is an `NG0100` error', 'It updates after a microtask'], correct: 1, why: 'Without Zone.js nobody reports the timer; you need a signal, `markForCheck` or a template event.' },
        { q: 'Which change detection mode does a component without explicit settings get in Angular 22?', options: ['`Default`', '`OnPush`', '`Eager`', 'It depends on zoneless'], correct: 1, why: 'Since v22 `OnPush` is the default; the previous behavior is set explicitly with `Eager`.' },
        { q: 'How does `markForCheck()` differ from `detectChanges()`?', options: ['No difference, they are two names for one', 'The first schedules a check, the second runs now', 'The first checks children, the second ancestors', 'The first works only in apps with Zone.js'], correct: 1, why: '`markForCheck` marks the component and ancestors for the next check, `detectChanges` checks synchronously now.' },
        { q: 'What is the right fix for `NG0100` raised in `ngAfterViewInit`?', options: ['Wrap the change in `setTimeout`', 'Move the value to `computed` or an event', 'Turn off development mode in the build', 'Switch the component to `Eager`'], correct: 1, why: 'The error means the data flow is broken; `setTimeout` only hides it.' },
      ],
    },
    sources: [
      docs('Zoneless', 'guide/zoneless'),
      docs('Advanced component configuration', 'guide/components/advanced-configuration'),
      docs('Skipping component subtrees', 'best-practices/skipping-subtrees'),
      docs('NG0100: Expression has changed after it was checked', 'errors/NG0100'),
    ],
    verified,
  },
  {
    id: 'ng-di',
    track: 'angular',
    emoji: '💉',
    minutes: 13,
    title: { ru: 'Внедрение зависимостей', en: 'Dependency injection' },
    summary: {
      ru: 'inject() и @Service(), виды провайдеров, InjectionToken, иерархия инжекторов, опции поиска, providers и viewProviders.',
      en: 'inject() and @Service(), kinds of providers, InjectionToken, the injector hierarchy, lookup options, providers and viewProviders.',
    },
    quiz: {
      ru: [
        { q: 'Что такое `@Service()` в Angular 22?', options: ['Замена `@Component` для классов с логикой', 'Короткая запись `providedIn: \'root\'`', 'Декоратор для серверных функций в SSR', 'Сервис, создаваемый на каждый компонент'], correct: 1, why: '`@Service()` объявляет root-синглтон с tree shaking; для `useClass` и других областей остаётся `@Injectable`.' },
        { q: 'Root-сервис внедряет токен `API_URL`. В дочернем инжекторе `API_URL` переопределён. Что увидит сервис, полученный из дочернего?', options: ['Значение из дочернего инжектора', 'Значение из корня', 'Ошибку `NG0201`', 'Значение `undefined`'], correct: 1, why: 'Сервис получает зависимости из инжектора, где создан; root-сервис не видит переопределений ниже.' },
        { q: 'Что делает `{ provide: Logger, useExisting: ConsoleLogger }`?', options: ['Создаёт новый экземпляр `ConsoleLogger`', 'Даёт тот же экземпляр под токеном `Logger`', 'Наследует `Logger` от `ConsoleLogger`', 'Регистрирует несколько логгеров сразу'], correct: 1, why: '`useExisting` создаёт псевдоним: оба токена указывают на один экземпляр.' },
        { q: 'Чем `viewProviders` отличаются от `providers` компонента?', options: ['Создаются один раз на приложение', 'Не видны проецируемому содержимому', 'Доступны только в тестах', 'Не поддерживают `useFactory`'], correct: 1, why: '`viewProviders` видит только собственный шаблон компонента, а содержимое из `ng-content` их не видит.' },
      ],
      en: [
        { q: 'What is `@Service()` in Angular 22?', options: ['A replacement for `@Component` for logic', 'Shorthand for `providedIn: \'root\'`', 'A decorator for server functions', 'A service created per component'], correct: 1, why: '`@Service()` declares a tree-shakable root singleton; `@Injectable` remains for `useClass` and other scopes.' },
        { q: 'A root service injects an `API_URL` token. A child injector overrides `API_URL`. What does the service obtained from the child see?', options: ['The value from the child injector', 'The value from the root', 'An `NG0201` error', 'The value `undefined`'], correct: 1, why: 'A service gets dependencies from the injector where it was created; a root service does not see overrides below.' },
        { q: 'What does `{ provide: Logger, useExisting: ConsoleLogger }` do?', options: ['Creates a new `ConsoleLogger` instance', 'Gives the same instance under the `Logger` token', 'Makes `Logger` inherit from `ConsoleLogger`', 'Registers several loggers at once'], correct: 1, why: '`useExisting` creates an alias: both tokens point to one instance.' },
        { q: 'How do `viewProviders` differ from a component\'s `providers`?', options: ['They are created once per app', 'Projected content cannot see them', 'They are available only in tests', 'They do not support `useFactory`'], correct: 1, why: '`viewProviders` are visible only to the component\'s own template, not to content from `ng-content`.' },
      ],
    },
    sources: [
      docs('Dependency injection overview', 'guide/di'),
      docs('Creating and using services', 'guide/di/creating-and-using-services'),
      docs('Defining dependency providers', 'guide/di/defining-dependency-providers'),
      docs('Hierarchical injectors', 'guide/di/hierarchical-dependency-injection'),
      docs('Injection context', 'guide/di/dependency-injection-context'),
    ],
    verified,
  },
  {
    id: 'ng-rxjs',
    track: 'angular',
    emoji: '🌊',
    minutes: 13,
    title: { ru: 'RxJS в Angular', en: 'RxJS in Angular' },
    summary: {
      ru: 'Observable и Promise, холодные и горячие потоки, Subject-ы, switchMap и родня на одном примере, share, ошибки, отписка.',
      en: 'Observable and Promise, cold and hot streams, Subjects, switchMap and friends on one example, share, errors, unsubscribing.',
    },
    quiz: {
      ru: [
        { q: 'Два компонента подписались на один `http.get(...)`. Сколько запросов уйдёт?', options: ['Один, ответ разделится', 'Два: поток холодный', 'Ни одного без `async`', 'Один, если включён кэш браузера'], correct: 1, why: '`HttpClient` возвращает холодный Observable: каждая подписка это новый запрос; делят его через `shareReplay`.' },
        { q: 'Какой оператор подходит для поиска по мере ввода?', options: ['`mergeMap`', '`switchMap`', '`concatMap`', '`exhaustMap`'], correct: 1, why: '`switchMap` отписывается от прошлого запроса, и устаревший ответ не придёт.' },
        { q: 'Что получит новый подписчик `BehaviorSubject`?', options: ['Ничего до следующего `next`', 'Последнее значение сразу', 'Все прошлые значения', 'Только начальное значение'], correct: 1, why: '`BehaviorSubject` хранит текущее значение и отдаёт его при подписке.' },
        { q: 'Почему `catchError` ставят внутри `switchMap`, а не после него?', options: ['Так быстрее работает', 'Ошибка завершает внешний поток', 'Иначе не работает `retry`', 'Так требует `HttpClient`'], correct: 1, why: 'После ошибки поток завершается; ловля на внутреннем запросе сохраняет поток кликов живым.' },
      ],
      en: [
        { q: 'Two components subscribe to one `http.get(...)`. How many requests are sent?', options: ['One, the response is shared', 'Two: the stream is cold', 'None without `async`', 'One, if the browser cache is on'], correct: 1, why: '`HttpClient` returns a cold Observable: each subscription is a new request; share it with `shareReplay`.' },
        { q: 'Which operator fits search as you type?', options: ['`mergeMap`', '`switchMap`', '`concatMap`', '`exhaustMap`'], correct: 1, why: '`switchMap` unsubscribes from the previous request, so a stale response never arrives.' },
        { q: 'What does a new subscriber of a `BehaviorSubject` get?', options: ['Nothing until the next `next`', 'The latest value right away', 'All previous values', 'Only the initial value'], correct: 1, why: '`BehaviorSubject` keeps the current value and gives it on subscription.' },
        { q: 'Why does `catchError` go inside `switchMap` rather than after it?', options: ['It runs noticeably faster that way', 'An error completes the outer stream', 'Otherwise `retry` does not work', '`HttpClient` requires it to be there'], correct: 1, why: 'A stream ends after an error; catching on the inner request keeps the click stream alive.' },
      ],
    },
    sources: [
      rxjs('Observable', 'guide/observable'),
      rxjs('Subject', 'guide/subject'),
      rxjs('Operators', 'guide/operators'),
      rxjs('Conversion to promises', 'deprecations/to-promise'),
      docs('Unsubscribing with takeUntilDestroyed', 'ecosystem/rxjs-interop/take-until-destroyed'),
    ],
    verified,
  },
  {
    id: 'ng-app',
    track: 'angular',
    emoji: '🗺️',
    minutes: 14,
    title: { ru: 'Роутер, HTTP, формы и SSR', en: 'Router, HTTP, forms and SSR' },
    summary: {
      ru: 'Функциональные guards и параметры во входы, HttpClient на fetch и интерсепторы, signal forms, @defer, RenderMode и гидратация, Vitest.',
      en: 'Functional guards and parameters as inputs, HttpClient on fetch and interceptors, signal forms, @defer, RenderMode and hydration, Vitest.',
    },
    quiz: {
      ru: [
        { q: 'Как guard в современном Angular перенаправляет на страницу входа?', options: ['Вызывает `router.navigate` и возвращает `true`', 'Возвращает `UrlTree`', 'Бросает исключение `Redirect`', 'Меняет `window.location`'], correct: 1, why: 'Функциональный guard возвращает `UrlTree`, и роутер отменяет текущую навигацию и выполняет редирект.' },
        { q: 'Какой транспорт использует `HttpClient` по умолчанию в Angular 22?', options: ['`XMLHttpRequest`', '`fetch`', 'WebSocket', 'Зависит от браузера'], correct: 1, why: 'С v22 по умолчанию `FetchBackend`; `withFetch` больше не нужен, для прогресса загрузки есть `withXhr`.' },
        { q: 'Что делает `prefetch on idle` в `@defer (on viewport; prefetch on idle)`?', options: ['Показывает блок, когда браузер свободен', 'Загружает код заранее, показывает по viewport', 'Гидратирует этот блок прямо на сервере', 'Отменяет загрузку, если браузер простаивает'], correct: 1, why: '`prefetch` загружает чанк заранее, а основной триггер определяет, когда показать блок.' },
        { q: 'Какой `RenderMode` отдаёт HTML, сгенерированный при сборке?', options: ['`RenderMode.Server`', '`RenderMode.Prerender`', '`RenderMode.Client`', '`RenderMode.Static`'], correct: 1, why: '`Prerender` рендерит маршрут на этапе сборки, `Server` на каждый запрос, `Client` отдаёт обычное SPA.' },
      ],
      en: [
        { q: 'How does a guard redirect to the login page in modern Angular?', options: ['It calls `router.navigate` and returns `true`', 'It returns a `UrlTree`', 'It throws a `Redirect` exception', 'It changes `window.location`'], correct: 1, why: 'A functional guard returns a `UrlTree`, and the router cancels the navigation and redirects.' },
        { q: 'Which transport does `HttpClient` use by default in Angular 22?', options: ['`XMLHttpRequest`', '`fetch`', 'WebSocket', 'It depends on the browser'], correct: 1, why: 'Since v22 `FetchBackend` is the default; `withFetch` is no longer needed, and `withXhr` covers upload progress.' },
        { q: 'What does `prefetch on idle` do in `@defer (on viewport; prefetch on idle)`?', options: ['Shows the block when the browser is idle', 'Loads code early, shows it on viewport', 'Hydrates the block on the server', 'Cancels loading when idle'], correct: 1, why: '`prefetch` loads the chunk early, while the main trigger decides when to show the block.' },
        { q: 'Which `RenderMode` serves HTML generated at build time?', options: ['`RenderMode.Server`', '`RenderMode.Prerender`', '`RenderMode.Client`', '`RenderMode.Static`'], correct: 1, why: '`Prerender` renders the route at build time, `Server` per request, `Client` serves a plain SPA.' },
      ],
    },
    sources: [
      docs('Route guards', 'guide/routing/route-guards'),
      docs('Interceptors', 'guide/http/interceptors'),
      docs('Signal forms', 'guide/forms/signals/overview'),
      docs('Deferred loading with @defer', 'guide/templates/defer'),
      docs('Server-side and hybrid rendering', 'guide/ssr'),
      docs('Hydration', 'guide/hydration'),
      docs('Testing', 'guide/testing'),
    ],
    verified,
  },
]

export const angularModule: Module = {
  track: 'angular',
  lessons: angularLessons.map((l) => l.id),
  exam: {
    pass: 0.75,
    questions: {
      ru: [
        { q: 'С какой версии компоненты Angular standalone по умолчанию?', options: ['v14', 'v19', 'v17', 'v21'], correct: 1, why: 'В v19 значение `standalone` по умолчанию стало `true`.' },
        { q: 'Сигнал хранит объект, код делает `user().age = 31` и `user.update(u => u)`. Обновятся ли зависимые?', options: ['Да, `update` всегда уведомляет', 'Нет, ссылка та же', 'Только эффекты, но не `computed`', 'Только шаблон компонента'], correct: 1, why: 'Сигнал сравнивает по `Object.is`: тот же объект значит «не изменилось».' },
        { q: 'Что вернёт `count()` внутри функции очистки эффекта?', options: ['Значение прошлого запуска', 'Текущее значение сигнала', 'Всегда `undefined`', 'Ошибку чтения сигнала'], correct: 1, why: 'Сигнал всегда возвращает текущее значение; значение прошлого запуска берут из замыкания.' },
        { q: 'С какой версии новые приложения Angular zoneless по умолчанию?', options: ['v18', 'v21', 'v20', 'v22'], correct: 1, why: 'Zoneless стал стабильным в 20.2 и режимом по умолчанию в v21.' },
        { q: '`OnPush`-компонент получил вход-объект, родитель изменил поле объекта. Что на экране?', options: ['Новое значение', 'Старое значение', 'Ошибка `NG0100`', 'Пустая строка'], correct: 1, why: 'Ссылка на вход не изменилась, компонент не помечен и не проверяется.' },
        { q: 'Где вызов `inject()` даст ошибку `NG0203`?', options: ['В поле класса сервиса', 'В обработчике клика', 'В фабрике провайдера', 'В функциональном guard'], correct: 1, why: 'Обработчик события выполняется вне контекста внедрения; зависимость достают заранее в поле.' },
        { q: 'Какой оператор подходит для кнопки «Отправить», чтобы игнорировать повторные клики?', options: ['`switchMap`', '`exhaustMap`', '`mergeMap`', '`concatMap`'], correct: 1, why: '`exhaustMap` игнорирует новые значения, пока прошлый внутренний поток не завершился.' },
        { q: 'Как передать параметр `:id` маршрута во вход компонента без `ActivatedRoute`?', options: ['Через `@Input` и функцию-резолвер', 'Включить `withComponentInputBinding()`', 'Через `RouterModule.forChild`', 'Это возможно только при включённом SSR'], correct: 1, why: '`withComponentInputBinding()` заполняет входы из параметров пути, query и `data`.' },
      ],
      en: [
        { q: 'Since which version are Angular components standalone by default?', options: ['v14', 'v19', 'v17', 'v21'], correct: 1, why: 'In v19 the default value of `standalone` became `true`.' },
        { q: 'A signal holds an object; code does `user().age = 31` and `user.update(u => u)`. Do dependents update?', options: ['Yes, `update` always notifies', 'No, the reference is the same', 'Only effects, not `computed`', 'Only the component template'], correct: 1, why: 'A signal compares with `Object.is`: the same object means "unchanged".' },
        { q: 'What does `count()` return inside an effect\'s cleanup function?', options: ['The value from the previous run', 'The current value of the signal', 'Always `undefined` inside cleanup', 'An error about reading a signal'], correct: 1, why: 'A signal always returns its current value; take the previous run\'s value from the closure.' },
        { q: 'Since which version are new Angular apps zoneless by default?', options: ['v18', 'v21', 'v20', 'v22'], correct: 1, why: 'Zoneless became stable in 20.2 and the default in v21.' },
        { q: 'An `OnPush` component got an object input, and the parent changed a field of that object. What is on screen?', options: ['The new value', 'The old value', 'An `NG0100` error', 'An empty string'], correct: 1, why: 'The input reference did not change, so the component is not marked and not checked.' },
        { q: 'Where does calling `inject()` give an `NG0203` error?', options: ['In a service class field', 'In a click handler', 'In a provider factory', 'In a functional guard'], correct: 1, why: 'An event handler runs outside an injection context; get the dependency into a field beforehand.' },
        { q: 'Which operator suits a "Submit" button that must ignore repeated clicks?', options: ['`switchMap`', '`exhaustMap`', '`mergeMap`', '`concatMap`'], correct: 1, why: '`exhaustMap` ignores new values until the previous inner stream completes.' },
        { q: 'How do you pass a route\'s `:id` parameter into a component input without `ActivatedRoute`?', options: ['With `@Input` and a resolver function', 'Enable `withComponentInputBinding()`', 'Through `RouterModule.forChild`', 'It only works with SSR turned on'], correct: 1, why: '`withComponentInputBinding()` fills inputs from path parameters, query and `data`.' },
      ],
    },
  },
}
