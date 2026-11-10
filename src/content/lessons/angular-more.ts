import type { Source } from '../sources'
import type { Lesson } from './types'

/** Angular lessons added in the coverage pass (Notion topics + interview essentials); ordered in angular.ts. */
const docs = (title: string, path: string): Source => ({ title: `angular.dev: ${title}`, url: `https://angular.dev/${path}`, kind: 'official' })
const verified = { date: '2026-11', version: 'Angular 22.2' }

export const angularMoreLessons: Lesson[] = [
  {
    id: 'ng-lifecycle',
    track: 'angular',
    emoji: '🔄',
    minutes: 12,
    title: { ru: 'Жизненный цикл компонента', en: 'Component lifecycle' },
    summary: {
      ru: 'Порядок всех хуков, конструктор против ngOnInit, контентные и видовые хуки, afterNextRender и afterEveryRender, DestroyRef, реакция на изменение входа.',
      en: 'The order of all hooks, constructor vs ngOnInit, content and view hooks, afterNextRender and afterEveryRender, DestroyRef, reacting to input changes.',
    },
    quiz: {
      ru: [
        { q: 'Есть ли значения входов в конструкторе компонента?', options: ['Да, всегда', 'Нет, они приходят позже', 'Только у сигнальных', 'Только при OnPush'], correct: 1, why: 'Входы устанавливаются после создания экземпляра; в `ngOnInit` они уже есть.' },
        { q: 'Какой хук вызывается на каждой проверке компонента?', options: ['ngOnInit', 'ngAfterViewInit', 'ngAfterViewChecked', 'ngOnDestroy'], correct: 2, why: 'Хуки `...Checked` и `ngDoCheck` идут на каждой проверке, `...Init` один раз.' },
        { q: 'Где безопасно работать с `window` и DOM при SSR?', options: ['В конструкторе', 'В ngOnInit', 'В afterNextRender', 'В ngOnChanges'], correct: 2, why: '`afterNextRender` и `afterEveryRender` выполняются только в браузере после отрисовки.' },
        { q: 'Что заполнено к `ngAfterContentInit`?', options: ['Свой шаблон и viewChild', 'Проекция и contentChild', 'Все сервисы приложения', 'Данные из резолвера'], correct: 1, why: 'Content это то, что родитель передал внутрь тегов; View это собственный шаблон, он готов к `ngAfterViewInit`.' },
      ],
      en: [
        { q: 'Are input values available in a component constructor?', options: ['Yes, always', 'No, they arrive later', 'Only signal inputs', 'Only with OnPush'], correct: 1, why: 'Inputs are set after the instance is created; they are there in `ngOnInit`.' },
        { q: 'Which hook runs on every check of a component?', options: ['ngOnInit', 'ngAfterViewInit', 'ngAfterViewChecked', 'ngOnDestroy'], correct: 2, why: 'The `...Checked` hooks and `ngDoCheck` run on every check, `...Init` once.' },
        { q: 'Where is it safe to use `window` and the DOM with SSR?', options: ['In the constructor', 'In ngOnInit', 'In afterNextRender', 'In ngOnChanges'], correct: 2, why: '`afterNextRender` and `afterEveryRender` run only in the browser after rendering.' },
        { q: 'What is ready by `ngAfterContentInit`?', options: ['Own template and viewChild', 'Projection and contentChild', 'All of the app services', 'The data from resolvers'], correct: 1, why: 'Content is what the parent passed between the tags; the View is the own template, ready by `ngAfterViewInit`.' },
      ],
    },
    sources: [
      docs('Component lifecycle', 'guide/components/lifecycle'),
      docs('afterNextRender', 'api/core/afterNextRender'),
      docs('DestroyRef', 'api/core/DestroyRef'),
      docs('linkedSignal', 'guide/signals/linked-signal'),
    ],
    verified,
  },
  {
    id: 'ng-templates',
    track: 'angular',
    emoji: '🪟',
    minutes: 14,
    title: { ru: 'Шаблоны и динамические компоненты', en: 'Templates and dynamic components' },
    summary: {
      ru: 'ElementRef, TemplateRef, ViewContainerRef, ng-template, ng-container и ng-content со слотами, ngTemplateOutlet с контекстом, запросы, Renderer2, createComponent с привязками.',
      en: 'ElementRef, TemplateRef, ViewContainerRef, ng-template, ng-container and ng-content with slots, ngTemplateOutlet with context, queries, Renderer2, createComponent with bindings.',
    },
    quiz: {
      ru: [
        { q: 'Что делает `ng-container`?', options: ['Создаёт div-обёртку', 'Группирует без DOM-узла', 'Проецирует содержимое', 'Откладывает рендер'], correct: 1, why: '`ng-container` не создаёт элемента; проекция это `ng-content`, отложенный шаблон это `ng-template`.' },
        { q: 'Как передать данные в шаблон через `ngTemplateOutlet`?', options: ['Через входы шаблона', 'Объектом context', 'Через сервис', 'Никак'], correct: 1, why: '`context: { $implicit: item, index }` читается как `let-item` и `let-i="index"`.' },
        { q: 'Что заменило `ComponentFactoryResolver`?', options: ['ngModule.factory()', '`createComponent(Cmp)`', 'Сервис ComponentFactory', 'Только ngComponentOutlet'], correct: 1, why: 'С Ivy компонент передают напрямую в `ViewContainerRef.createComponent` или `createComponent`; резолвер удалён в v22.' },
        { q: 'Как связать вход динамического компонента с сигналом?', options: ['`inputBinding(name, signal)`', 'Присвоить полю экземпляра', 'Через `ngOnChanges`', 'Только через setInput в цикле'], correct: 0, why: '`inputBinding` в `bindings` держит вход связанным с сигналом; `setInput` задаёт значение один раз.' },
      ],
      en: [
        { q: 'What does `ng-container` do?', options: ['Creates a div wrapper', 'Groups with no DOM node', 'Projects content', 'Defers rendering'], correct: 1, why: '`ng-container` creates no element; projection is `ng-content`, a deferred template is `ng-template`.' },
        { q: 'How do you pass data to a template via `ngTemplateOutlet`?', options: ['Through template inputs', 'With a context object', 'Through a service', 'You cannot'], correct: 1, why: '`context: { $implicit: item, index }` is read as `let-item` and `let-i="index"`.' },
        { q: 'What replaced `ComponentFactoryResolver`?', options: ['ngModule.factory()', '`createComponent(Cmp)`', 'A ComponentFactory service', 'Only ngComponentOutlet'], correct: 1, why: 'Since Ivy the component is passed directly to `ViewContainerRef.createComponent` or `createComponent`; the resolver was removed in v22.' },
        { q: 'How do you bind a dynamic component input to a signal?', options: ['`inputBinding(name, signal)`', 'Assign an instance field', 'Through `ngOnChanges`', 'Only setInput in a loop'], correct: 0, why: '`inputBinding` in `bindings` keeps the input bound to the signal; `setInput` sets a value once.' },
      ],
    },
    sources: [
      docs('Create template fragments with ng-template', 'guide/templates/ng-template'),
      docs('Grouping elements with ng-container', 'guide/templates/ng-container'),
      docs('Content projection with ng-content', 'guide/components/content-projection'),
      docs('Programmatically rendering components', 'guide/components/programmatic-rendering'),
      docs('Referencing component children with queries', 'guide/components/queries'),
    ],
    verified,
  },
  {
    id: 'ng-pipes-directives',
    track: 'angular',
    emoji: '🧪',
    minutes: 13,
    title: { ru: 'Пайпы и директивы', en: 'Pipes and directives' },
    summary: {
      ru: 'Чистые и нечистые пайпы против метода в шаблоне, async, атрибутные директивы с host, свои структурные директивы, hostDirectives, параметры декораторов.',
      en: 'Pure and impure pipes vs a method in the template, async, attribute directives with host, custom structural directives, hostDirectives, decorator options.',
    },
    quiz: {
      ru: [
        { q: 'Когда пересчитывается чистый пайп?', options: ['На каждой проверке шаблона', 'При новой ссылке на вход', 'Раз в секунду по таймеру', 'Только при включённом OnPush'], correct: 1, why: 'Чистый пайп мемоизирован по ссылке входа и аргументам; мутацию он не видит.' },
        { q: 'Чем метод в шаблоне хуже чистого пайпа?', options: ['Не умеет принимать аргументы', 'Вызывается на каждой проверке', 'Его нельзя типизировать', 'Не работает с сигналами'], correct: 1, why: 'Шаблон вызывает метод при каждой проверке компонента, а в режиме разработки ещё раз в `checkNoChanges`.' },
        { q: 'Что структурная директива получает через `inject`?', options: ['ElementRef и сервис Renderer2', 'TemplateRef и ViewContainerRef', 'NgZone и корневой Injector', 'ChangeDetectorRef и Router'], correct: 1, why: 'Шаблон под `*` и контейнер, куда его рисовать.' },
        { q: 'Зачем `hostDirectives`?', options: ['Ускорить проверку изменений', 'Подключить старый NgModule', 'Директивы к хосту без атрибутов', 'Заменить пайпы в шаблоне'], correct: 2, why: 'Поведение компонента собирают из директив, пробрасывая их входы и выходы.' },
      ],
      en: [
        { q: 'When does a pure pipe recompute?', options: ['On every template check', 'On a new input reference', 'Once per second on a timer', 'Only when OnPush is on'], correct: 1, why: 'A pure pipe is memoized by input reference and arguments; it does not see mutation.' },
        { q: 'Why is a method in the template worse than a pure pipe?', options: ['It takes no arguments', 'It runs on every check', 'It cannot be typed', 'It fails with signals'], correct: 1, why: 'The template calls the method on every component check, and once more in development for `checkNoChanges`.' },
        { q: 'What does a structural directive get through `inject`?', options: ['ElementRef and the Renderer2', 'TemplateRef and ViewContainerRef', 'NgZone and the root Injector', 'ChangeDetectorRef and Router'], correct: 1, why: 'The template under `*` and the container to render it into.' },
        { q: 'What is `hostDirectives` for?', options: ['Making change detection faster', 'Importing an old NgModule', 'Host directives, no attributes', 'Replacing pipes in the template'], correct: 2, why: 'A component composes its behavior from directives, forwarding their inputs and outputs.' },
      ],
    },
    sources: [
      docs('Pipes', 'guide/templates/pipes'),
      docs('Attribute directives', 'guide/directives/attribute-directives'),
      docs('Structural directives', 'guide/directives/structural-directives'),
      docs('Directive composition API', 'guide/directives/directive-composition-api'),
      docs('Component host elements', 'guide/components/host-elements'),
    ],
    verified,
  },
  {
    id: 'ng-forms',
    track: 'angular',
    emoji: '📝',
    minutes: 14,
    title: { ru: 'Формы: reactive, template-driven, signal forms', en: 'Forms: reactive, template-driven, signal forms' },
    summary: {
      ru: 'Три подхода и когда какой, типизированные FormGroup и FormArray, валидаторы полей и групп, touched и dirty, valueChanges, ControlValueAccessor, signal forms в v22.',
      en: 'Three approaches and when to use each, typed FormGroup and FormArray, field and group validators, touched and dirty, valueChanges, ControlValueAccessor, signal forms in v22.',
    },
    quiz: {
      ru: [
        { q: 'Где валидатор «пароли совпадают»?', options: ['На поле confirm', 'На FormGroup', 'В шаблоне', 'В сервисе формы'], correct: 1, why: 'Проверка нескольких полей вместе это валидатор группы; ошибка попадает в `group.errors`.' },
        { q: 'Что меняет `control.setValue()` из кода?', options: ['touched', 'dirty', 'Только value', 'touched и dirty'], correct: 2, why: '`touched` и `dirty` выставляет взаимодействие пользователя, а не программная запись.' },
        { q: 'Какой метод `ControlValueAccessor` передаёт значение из формы в компонент?', options: ['registerOnChange', 'writeValue', 'registerOnTouched', 'setDisabledState'], correct: 1, why: '`writeValue` получает значение формы; `registerOnChange` даёт функцию для обратного направления.' },
        { q: 'Что источник правды в signal forms?', options: ['Объекты FormControl', 'Ваш сигнал с моделью', 'DOM-поля ввода', 'Сервис NgForm'], correct: 1, why: '`form(model)` не хранит копию: правка поля меняет сигнал модели и наоборот.' },
      ],
      en: [
        { q: 'Where does a "passwords match" validator go?', options: ['On the confirm field', 'On the FormGroup', 'In the template', 'In a form service'], correct: 1, why: 'Checking several fields together is a group validator; the error lands in `group.errors`.' },
        { q: 'What does `control.setValue()` from code change?', options: ['touched', 'dirty', 'Only the value', 'touched and dirty'], correct: 2, why: '`touched` and `dirty` are set by user interaction, not by programmatic writes.' },
        { q: 'Which `ControlValueAccessor` method passes the value from the form to the component?', options: ['registerOnChange', 'writeValue', 'registerOnTouched', 'setDisabledState'], correct: 1, why: '`writeValue` receives the form value; `registerOnChange` provides the function for the other direction.' },
        { q: 'What is the source of truth in signal forms?', options: ['FormControl objects', 'Your model signal', 'The DOM inputs', 'An NgForm service'], correct: 1, why: '`form(model)` keeps no copy: editing a field changes the model signal and vice versa.' },
      ],
    },
    sources: [
      docs('Reactive forms', 'guide/forms/reactive-forms'),
      docs('Typed forms', 'guide/forms/typed-forms'),
      docs('Validating form input', 'guide/forms/form-validation'),
      docs('ControlValueAccessor', 'api/forms/ControlValueAccessor'),
      docs('Signal forms', 'guide/forms/signals/overview'),
    ],
    verified,
  },
  {
    id: 'ng-router',
    track: 'angular',
    emoji: '🧭',
    minutes: 13,
    title: { ru: 'Роутер подробно', en: 'The router in depth' },
    summary: {
      ru: 'Этапы навигации и события, canMatch, canActivate, canDeactivate, резолверы против загрузки в компоненте, переиспользование компонента, ленивые маршруты и предзагрузка.',
      en: 'Navigation stages and events, canMatch, canActivate, canDeactivate, resolvers vs loading in the component, component reuse, lazy routes and preloading.',
    },
    quiz: {
      ru: [
        { q: 'Чем `canMatch` отличается от `canActivate`?', options: ['Ничем, это синонимы', 'Отказ пробует следующий маршрут', 'Вызывается после резолверов', 'Работает только с детьми'], correct: 1, why: '`canMatch` решает, подходит ли маршрут, до загрузки ленивого кода; отказ даёт шанс маршруту с тем же путём.' },
        { q: 'Переход `/users/1` → `/users/2` на той же странице. Что с компонентом?', options: ['Создаётся заново', 'Переиспользуется', 'Уничтожается навсегда', 'Ошибка навигации'], correct: 1, why: 'Экземпляр остаётся, поэтому параметр читают реактивно: вход или `paramMap`.' },
        { q: 'Какой guard защищает несохранённые изменения?', options: ['canActivate', 'canMatch', 'canDeactivate', 'canActivateChild'], correct: 2, why: '`canDeactivate` решает, можно ли уйти со страницы.' },
        { q: 'Что делает `withPreloading(PreloadAllModules)`?', options: ['Грузит всё сразу при старте', 'Качает ленивые чанки в фоне', 'Отключает ленивые маршруты', 'Кэширует ответы API'], correct: 1, why: 'После запуска приложения ленивые маршруты скачиваются в фоне, переход по ним становится мгновенным.' },
      ],
      en: [
        { q: 'How does `canMatch` differ from `canActivate`?', options: ['No difference: synonyms', 'A refusal tries the next route', 'It runs after the resolvers', 'It only works for children'], correct: 1, why: '`canMatch` decides whether the route fits, before lazy code loads; a refusal lets a route with the same path match.' },
        { q: 'Navigating `/users/1` → `/users/2` on the same page. What happens to the component?', options: ['It is recreated', 'It is reused', 'It is destroyed for good', 'Navigation fails'], correct: 1, why: 'The instance stays, so read the parameter reactively: an input or `paramMap`.' },
        { q: 'Which guard protects unsaved changes?', options: ['canActivate', 'canMatch', 'canDeactivate', 'canActivateChild'], correct: 2, why: '`canDeactivate` decides whether you may leave the page.' },
        { q: 'What does `withPreloading(PreloadAllModules)` do?', options: ['Loads all code at startup', 'Fetches lazy chunks later', 'Disables all lazy routes', 'Caches every API response'], correct: 1, why: 'After the app starts, lazy routes download in the background and navigating to them becomes instant.' },
      ],
    },
    sources: [
      docs('Control route access with guards', 'guide/routing/route-guards'),
      docs('Data resolvers', 'guide/routing/data-resolvers'),
      docs('Router lifecycle and events', 'guide/routing/lifecycle-and-events'),
      docs('Route loading strategies', 'guide/routing/loading-strategies'),
      docs('Read route state', 'guide/routing/read-route-state'),
    ],
    verified,
  },
  {
    id: 'ng-performance',
    track: 'angular',
    emoji: '🚀',
    minutes: 15,
    title: { ru: 'Производительность, SSR, SSG и PWA', en: 'Performance, SSR, SSG and PWA' },
    summary: {
      ru: 'SPA, SSR, SSG и гибрид, детали гидратации, NgOptimizedImage, чек-лист производительности и Angular DevTools, Service Worker и обновления, анимации animate.enter и animate.leave.',
      en: 'SPA, SSR, SSG and hybrid rendering, hydration details, NgOptimizedImage, a performance checklist and Angular DevTools, the Service Worker and updates, animate.enter and animate.leave.',
    },
    quiz: {
      ru: [
        { q: 'Какой режим для каталога, одинакового для всех и редко меняющегося?', options: ['RenderMode.Client', 'RenderMode.Prerender', 'RenderMode.Server', 'Только SPA'], correct: 1, why: 'Пререндер даёт HTML при сборке, его раздаёт CDN без нагрузки на сервер.' },
        { q: 'Что делает атрибут `priority` у `NgOptimizedImage`?', options: ['Сжимает картинку на лету', 'Высокий приоритет, без lazy', 'Включает набор srcset', 'Добавляет плейсхолдер'], correct: 1, why: '`fetchpriority="high"`, без ленивой загрузки, при SSR ещё и preload: для LCP-изображения.' },
        { q: 'Как узнать, что Service Worker скачал новую версию?', options: ['Подписка на SwUpdate.available', 'Событие VERSION_READY', 'Обработчик window.onupdate', 'Подписка на Router.events'], correct: 1, why: 'Старые `available` и `activated` удалены; событие `VERSION_READY` приходит в `versionUpdates`.' },
        { q: 'Что заменило `@angular/animations`?', options: ['Только Web Animations API', 'CSS и animate.enter/leave', 'Анимации на RxJS', 'Пакет cdk/motion'], correct: 1, why: 'Пакет устарел с v20.2; появление и удаление описывают атрибутами `animate.enter` и `animate.leave` с CSS.' },
      ],
      en: [
        { q: 'Which mode suits a catalog that is the same for everyone and rarely changes?', options: ['RenderMode.Client', 'RenderMode.Prerender', 'RenderMode.Server', 'Only an SPA'], correct: 1, why: 'Prerendering produces HTML at build time, served by a CDN with no server load.' },
        { q: 'What does `priority` on `NgOptimizedImage` do?', options: ['Compresses the image', 'High priority, not lazy', 'Turns on srcset', 'Adds a placeholder'], correct: 1, why: '`fetchpriority="high"`, no lazy loading, plus a preload with SSR: for the LCP image.' },
        { q: 'How do you learn the Service Worker downloaded a new version?', options: ['Subscribe to SwUpdate.available', 'The VERSION_READY event', 'A window.onupdate handler', 'Subscribe to Router.events'], correct: 1, why: 'The old `available` and `activated` are removed; `VERSION_READY` arrives in `versionUpdates`.' },
        { q: 'What replaced `@angular/animations`?', options: ['The Web Animations API only', 'CSS and animate.enter/leave', 'Animations built on RxJS', 'A cdk/motion package'], correct: 1, why: 'The package is deprecated since v20.2; enter and leave are described with `animate.enter` and `animate.leave` plus CSS.' },
      ],
    },
    sources: [
      docs('Server and hybrid rendering', 'guide/ssr'),
      docs('Hydration', 'guide/hydration'),
      docs('Incremental hydration', 'guide/incremental-hydration'),
      docs('Getting started with NgOptimizedImage', 'guide/image-optimization'),
      docs('Service worker overview', 'ecosystem/service-workers'),
      docs('Animating your application with animate.enter and animate.leave', 'guide/animations'),
    ],
    verified,
  },
  {
    id: 'ng-architecture',
    track: 'angular',
    emoji: '🏛️',
    minutes: 15,
    title: { ru: 'Архитектура и безопасность', en: 'Architecture and security' },
    summary: {
      ru: 'Умные и презентационные компоненты, фасад на сигналах, паттерны поверх DI, SOLID, аутентификация и авторизация, токены и интерсептор обновления, санитизация, XSRF и XSSI.',
      en: 'Smart and presentational components, a signal facade, DI-based patterns, SOLID, authentication and authorization, tokens and a refresh interceptor, sanitization, XSRF and XSSI.',
    },
    quiz: {
      ru: [
        { q: 'Что знает презентационный компонент?', options: ['Откуда грузятся данные', 'Только входы и выходы', 'Текущий маршрут', 'Состояние всего стора'], correct: 1, why: 'Он получает данные через `input()` и сообщает о событиях через `output()`, поэтому легко переиспользуется.' },
        { q: 'Где хранить refresh-токен?', options: ['В localStorage', 'В HttpOnly cookie', 'В sessionStorage', 'В URL запроса'], correct: 1, why: 'Cookie `HttpOnly; Secure; SameSite` недоступна JavaScript, внедрённый скрипт её не прочитает.' },
        { q: 'Что сделает Angular с `<script>` в `[innerHTML]`?', options: ['Выполнит его', 'Удалит при санитизации', 'Бросит ошибку', 'Покажет как текст'], correct: 1, why: 'Санитайзер вырезает опасные теги и атрибуты; текстом разметку показывает интерполяция.' },
        { q: 'Где проходит настоящая проверка прав?', options: ['В guard роутера', 'На сервере', 'В шаблоне', 'В интерсепторе'], correct: 1, why: 'Клиентский код можно изменить; guards и скрытые кнопки только улучшают интерфейс.' },
      ],
      en: [
        { q: 'What does a presentational component know?', options: ['Where the data comes from', 'Only its inputs and outputs', 'The current route', 'The whole store state'], correct: 1, why: 'It gets data through `input()` and reports events through `output()`, so it is easy to reuse.' },
        { q: 'Where should a refresh token live?', options: ['In localStorage', 'In an HttpOnly cookie', 'In sessionStorage', 'In the request URL'], correct: 1, why: 'An `HttpOnly; Secure; SameSite` cookie is unreachable from JavaScript, so an injected script cannot read it.' },
        { q: 'What does Angular do with `<script>` in `[innerHTML]`?', options: ['Runs the script', 'Strips it when sanitizing', 'Throws a security error', 'Shows it as plain text'], correct: 1, why: 'The sanitizer removes dangerous tags and attributes; interpolation is what shows markup as text.' },
        { q: 'Where does the real permission check happen?', options: ['In a router guard', 'On the server', 'In the template', 'In an interceptor'], correct: 1, why: 'Client code can be changed; guards and hidden buttons only improve the interface.' },
      ],
    },
    sources: [
      docs('Security', 'best-practices/security'),
      docs('Interceptors', 'guide/http/interceptors'),
      docs('Testing requests', 'guide/http/testing'),
      docs('Dependency injection', 'guide/di'),
      { title: 'OWASP: JSON Web Token cheat sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html', kind: 'official' },
    ],
    verified,
  },
  {
    id: 'ng-testing',
    track: 'angular',
    emoji: '🧪',
    minutes: 12,
    title: { ru: 'Тестирование', en: 'Testing' },
    summary: {
      ru: 'Уровни тестов, Vitest в v21, TestBed и ComponentFixture без Zone.js, setInput, подмена провайдерами, HttpTestingController, RouterTestingHarness, харнессы, Testing Library и Playwright.',
      en: 'Test levels, Vitest in v21, TestBed and ComponentFixture without Zone.js, setInput, provider overrides, HttpTestingController, RouterTestingHarness, harnesses, Testing Library and Playwright.',
    },
    quiz: {
      ru: [
        { q: 'Как задать сигнальный вход в тесте?', options: ['Присвоить полю', 'componentRef.setInput', 'Через ngOnChanges', 'Через TestBed.inject'], correct: 1, why: '`fixture.componentRef.setInput(name, value)` задаёт вход так же, как шаблон родителя.' },
        { q: 'Как подключить standalone-компонент в TestBed?', options: ['declarations', 'imports', 'providers', 'schemas'], correct: 1, why: 'Standalone-компоненты передают в `imports`; `declarations` для компонентов из NgModule.' },
        { q: 'Чем проверить HTTP-запрос без сети?', options: ['Реальным сервером', 'HttpTestingController', 'Шпионом на fetch', 'Перехватом XHR'], correct: 1, why: '`expectOne` возвращает перехваченный запрос, `flush` отвечает, `verify` ловит лишние запросы.' },
        { q: 'Что даёт харнесс компонента?', options: ['Ускорение тестов', 'API без привязки к DOM', 'Снимки разметки', 'E2E в браузере'], correct: 1, why: 'Тест работает через методы харнесса, и изменение вёрстки компонента не ломает тесты.' },
      ],
      en: [
        { q: 'How do you set a signal input in a test?', options: ['Assign the field', 'componentRef.setInput', 'Through ngOnChanges', 'Through TestBed.inject'], correct: 1, why: '`fixture.componentRef.setInput(name, value)` sets the input the way a parent template does.' },
        { q: 'How do you add a standalone component to TestBed?', options: ['declarations', 'imports', 'providers', 'schemas'], correct: 1, why: 'Standalone components go into `imports`; `declarations` is for NgModule components.' },
        { q: 'What tests an HTTP request without a network?', options: ['A real server', 'HttpTestingController', 'A spy on fetch', 'Intercepting XHR'], correct: 1, why: '`expectOne` returns the intercepted request, `flush` answers, `verify` catches extra requests.' },
        { q: 'What does a component harness give you?', options: ['Faster test runs', 'An API not tied to the DOM', 'Snapshots of the markup', 'E2E runs in a browser'], correct: 1, why: 'The test works through harness methods, so changes in the component markup do not break tests.' },
      ],
    },
    sources: [
      docs('Testing', 'guide/testing'),
      docs('Basics of testing components', 'guide/testing/components-basics'),
      docs('Testing requests', 'guide/http/testing'),
      docs('Component harnesses overview', 'guide/testing/component-harnesses-overview'),
      { title: 'Playwright: Locators', url: 'https://playwright.dev/docs/locators', kind: 'official' },
    ],
    verified,
  },
  {
    id: 'ng-internals',
    track: 'angular',
    emoji: '🔬',
    minutes: 13,
    title: { ru: 'Как устроен Angular: Ivy, AOT, история', en: 'How Angular works: Ivy, AOT, history' },
    summary: {
      ru: 'Запуск приложения, Ivy и Incremental DOM с режимами создания и обновления, AOT и JIT, NgModule и standalone, AngularJS и Angular, MVVM и MVC, версии и что когда появилось.',
      en: 'App startup, Ivy and Incremental DOM with creation and update modes, AOT and JIT, NgModule and standalone, AngularJS vs Angular, MVVM vs MVC, versions and what came when.',
    },
    quiz: {
      ru: [
        { q: 'Что делает режим обновления шаблонной функции Ivy?', options: ['Строит весь DOM заново', 'Сравнивает значения привязок', 'Создаёт Virtual DOM', 'Компилирует шаблон снова'], correct: 1, why: 'Режим создания строит DOM один раз, режим обновления сравнивает значения привязок с прошлыми и меняет изменившиеся узлы.' },
        { q: 'Главный выигрыш AOT перед JIT?', options: ['Код не виден в браузере', 'Нет компилятора в бандле', 'Работает без TypeScript', 'Не нужен Node.js'], correct: 1, why: 'Шаблоны компилируются при сборке: меньше бандл, быстрее запуск, ошибки шаблонов на сборке.' },
        { q: 'С какой версии компоненты standalone по умолчанию?', options: ['v14', 'v15', 'v19', 'v22'], correct: 2, why: 'v14 превью, v15 стабильный API, v19 `standalone: true` по умолчанию.' },
        { q: 'На какой шаблон похож компонент Angular?', options: ['MVC с контроллером', 'MVVM', 'Flux', 'MVP'], correct: 1, why: 'Шаблон декларативно привязан к классу компонента, который играет роль ViewModel.' },
      ],
      en: [
        { q: 'What does the update mode of an Ivy template function do?', options: ['Rebuilds the DOM', 'Compares binding values', 'Builds a Virtual DOM', 'Compiles the template'], correct: 1, why: 'Creation mode builds the DOM once; update mode compares binding values with the previous ones and changes only those nodes.' },
        { q: 'The main advantage of AOT over JIT?', options: ['Code is hidden in the browser', 'No compiler in the bundle', 'Works without TypeScript', 'Needs no Node.js'], correct: 1, why: 'Templates compile at build time: a smaller bundle, faster startup, template errors at build time.' },
        { q: 'Since which version are components standalone by default?', options: ['v14', 'v15', 'v19', 'v22'], correct: 2, why: 'v14 preview, v15 stable API, v19 `standalone: true` by default.' },
        { q: 'Which pattern does an Angular component resemble?', options: ['MVC with a controller', 'MVVM', 'Flux', 'MVP'], correct: 1, why: 'The template is declaratively bound to the component class, which plays the ViewModel.' },
      ],
    },
    sources: [
      docs('Ahead-of-time (AOT) compilation', 'tools/cli/aot-compiler'),
      docs('Standalone components migration', 'reference/migrations/standalone'),
      docs('NgModules overview', 'guide/ngmodules/overview'),
      docs('Versioning and releases', 'reference/releases'),
      docs('bootstrapApplication', 'api/platform-browser/bootstrapApplication'),
    ],
    verified,
  },
]
