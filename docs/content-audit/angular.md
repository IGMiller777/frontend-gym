# Аудит заметок: Angular

Источник: страница Notion «Angular» (около 249 тысяч знаков без картинок и ссылок), прочитана целиком. Разделы: Incremental DOM и Ivy, NgModule, токены доступа, SOLID, SPA и SSR, JIT и AOT, история версий 11–13, хуки жизненного цикла, Change Detection, Zone.js и NgZone, Zoneless, ChangeDetectorRef, DI (иерархия, провайдеры, модификаторы, токены, `providedIn`), RxJS (Observable, Subject, операторы, мультикаст, отписка, планировщики), сигналы (задачник из 15 задач, push/pull, effect, интероп с RxJS), шаблоны (`ElementRef`, `TemplateRef`, `ng-template`, `ng-container`, `ng-content`, outlets, запросы), динамические компоненты, tree shaking, пайпы, директивы, параметры декораторов, роутинг, формы, standalone, резолверы, интерсепторы, `@defer`, SSR, SSG, гидратация, анимации, безопасность, PWA и Service Worker, производительность, паттерны, тестирование, NgRx и NGXS, ExpressionChangedAfterItHasBeenChecked.

NgRx и NGXS относятся к треку `state`, PWA и Service Worker к треку `browser`, безопасность к треку `security`; общие ошибки отмечены здесь, подробности в соответствующих треках.

Утверждения сверены с angular.dev (руководства из репозитория `angular/angular`, `adev/src/content/guide`), журналами изменений Angular и Angular CLI, rxjs.dev. Примеры уроков выполняются в CI на Angular 22.2.5 и RxJS 7.8: сигналы и RxJS в Node.js, компоненты, роутер и HttpClient в jsdom в JIT-режиме с трансформом `angularJitApplicationTransform`, как в модульных тестах Angular CLI.

## Актуальные версии (ноябрь 2026)

| Версия | Дата | Что важно |
|---|---|---|
| 22.2 | сентябрь 2026 | `@boundary` (developer preview), программные error boundaries, ресурсы роутера в публичном API |
| 22.0 | июнь 2026 | `OnPush` по умолчанию (`ChangeDetectionStrategy.Eager` для старого поведения), декоратор `@Service()`, signal forms в публичном API, `HttpClient` на `fetch` по умолчанию, инкрементальная гидратация по умолчанию, удалены `ComponentFactoryResolver` и `provideRoutes`, TypeScript 6+ |
| 21.0 | ноябрь 2025 | Приложения zoneless по умолчанию, Vitest вместо Karma в новых проектах, экспериментальные signal forms, удалены `moduleId` и `interpolation` |
| 20.0–20.2 | май–август 2025 | Стабильны `effect`, `linkedSignal`, `toSignal`, инкрементальная гидратация; zoneless стабилен в 20.2; `@angular/animations` объявлен устаревшим в 20.2; `afterRender` переименован в `afterEveryRender` |
| 19.0 | ноябрь 2024 | `standalone: true` по умолчанию, `linkedSignal` и `resource` (экспериментальные), новый тайминг `effect`, запись в сигналы внутри эффектов разрешена |

## Что устарело

| Было в заметках | Сейчас | Источник |
|---|---|---|
| NgModule как основа приложения, `declarations`, `entryComponents`, `bootstrapModule` | Компоненты standalone по умолчанию с v19, запуск `bootstrapApplication`, зависимости в `imports` компонента; `entryComponents` удалены | [Angular 19 changelog](https://github.com/angular/angular/blob/main/CHANGELOG.md), [NgModules](https://angular.dev/guide/ngmodules/overview) |
| `@Input()`, `@Output() EventEmitter`, `@ViewChild` | `input()`, `input.required()`, `model()`, `output()`, `viewChild()`, `contentChild()`; декораторы работают, но новый код на функциях | [Inputs](https://angular.dev/guide/components/inputs) |
| `*ngIf`, `*ngFor` с `trackBy`, `*ngSwitch` | Встроенный control flow `@if`, `@for` с обязательным `track`, `@switch`, `@let` | [Control flow](https://angular.dev/guide/templates/control-flow) |
| `constructor(private http: HttpClient)`, `@Inject`, `@Optional` | `inject()` с опциями `{ optional, self, skipSelf, host }`; `@Service()` (v22) для root-сервисов | [Creating services](https://angular.dev/guide/di/creating-and-using-services) |
| Zone.js и `NgZone.run` как основа обновлений | Zoneless по умолчанию с v21: обновление по сигналам, событиям шаблона, `markForCheck` и `AsyncPipe` | [Zoneless](https://angular.dev/guide/zoneless) |
| `ChangeDetectionStrategy.Default` | `OnPush` по умолчанию с v22; прежний режим называется `Eager` | [Advanced component configuration](https://angular.dev/guide/components/advanced-configuration) |
| Классовые guards, резолверы и интерсепторы (`implements CanActivate`, `HttpInterceptor`), `RouterModule.forRoot` | Функции `CanActivateFn`, `ResolveFn`, `HttpInterceptorFn` с `withInterceptors`, `provideRouter` | [Route guards](https://angular.dev/guide/routing/route-guards), [Interceptors](https://angular.dev/guide/http/interceptors) |
| `ComponentFactoryResolver` | Удалён в v22; `ViewContainerRef.createComponent(Component)` или `createComponent()` | [Angular 22 changelog](https://github.com/angular/angular/blob/main/CHANGELOG.md) |
| Angular Universal, `@nguniversal/express-engine`, `ng run :serve-ssr`, `zone.js/dist/zone-node` | `@angular/ssr`, `ng new --ssr`, режимы маршрутов `RenderMode.Server`, `Prerender`, `Client` | [SSR](https://angular.dev/guide/ssr) |
| `@angular/animations` (`trigger`, `state`, `transition`) | Пакет устарел с v20.2; анимации через CSS и `animate.enter` / `animate.leave` | [Animations migration](https://angular.dev/guide/animations/migration) |
| Karma, Jasmine, Protractor, `ng e2e` | Vitest + jsdom по умолчанию в новых проектах (v21); Protractor закрыт, для e2e Playwright или Cypress | [Testing](https://angular.dev/guide/testing) |
| `ng build --prod`, `ng serve --prod`, Webpack внутри CLI | Флаг `--prod` удалён; сборщик `application` на esbuild и Vite по умолчанию с v17 | [Angular CLI build](https://angular.dev/tools/cli/build) |
| `SwUpdate.available`, `SwUpdate.activated` | `SwUpdate.versionUpdates` с событием `VERSION_READY` | [Service worker communication](https://angular.dev/ecosystem/service-workers/communications) |
| `publish`, `multicast`, `refCount`, `pluck`, `retryWhen`, `toPromise`, `flatMap`, импорт из `rxjs/operators` | Устарели в RxJS 7: `share`/`connectable`, `map`, `retry({ delay })`, `firstValueFrom`/`lastValueFrom`, `mergeMap`; всё импортируется из `rxjs` | [RxJS 7 deprecations](https://rxjs.dev/deprecations/to-promise) |

## Найденные ошибки

| Раздел | В заметках | На самом деле | Источник |
|---|---|---|---|
| Zoneless | «С версии 15 экспериментальный, с 17 стабильный» | Экспериментальный в 18, developer preview в 20.0, стабильный в 20.2, по умолчанию в 21 | [Angular changelog](https://github.com/angular/angular/blob/main/CHANGELOG.md) |
| Zoneless | «HttpClient, timer, interval, fromEvent запускают CD автоматически», «клик не запускает» | Наоборот: обработчик события из шаблона планирует проверку, а значение из `HttpClient` или таймера, записанное в обычное поле, не попадёт на экран без сигнала, `AsyncPipe` или `markForCheck` | [Zoneless](https://angular.dev/guide/zoneless), проверено запуском |
| Zoneless | «Zoneless + OnPush: только @Input + вручную» | Плюс сигналы в шаблоне и события шаблона: OnPush-компонент проверяется, когда его помечают | [Advanced component configuration](https://angular.dev/guide/components/advanced-configuration) |
| Сигналы, задача 2 и 12 | `effect` «выполняется синхронно при создании» | Эффект планируется и выполняется позже (корневые при проверке приложения, компонентные во время её); несколько `set` подряд дают один запуск | [Effects](https://angular.dev/guide/signals/effect), проверено запуском |
| Сигналы, задача 5 | Cleanup «видит старое значение 0» и выполняется после нового запуска | Cleanup вызывается перед новым запуском, а `count()` внутри него возвращает текущее значение; старое значение видно только через замыкание | проверено запуском |
| Сигналы, задача 9 | Запись в сигнал внутри `effect` «запрещена по умолчанию», нужен `allowSignalWrites` | С v19 запись разрешена, `allowSignalWrites` ничего не делает; цикл остаётся на совести автора | [Angular 19 changelog](https://github.com/angular/angular/blob/main/CHANGELOG.md), проверено запуском |
| Сигналы | Метод `.mutate()` | Удалён в v17 до стабилизации сигналов; используют `update` с новой ссылкой | [Angular 17 changelog](https://github.com/angular/angular/blob/main/CHANGELOG.md) |
| Сигналы, задача 15 | `resource({ request, loader: ({ request }) })`, «value() сбрасывается в undefined», лоадер вызывается с `null` | С v20 `params` и `loader({ params, abortSignal })`; при `undefined` в `params` лоадер не вызывается (статус `idle`); при перезагрузке `reload()` значение сохраняется (`reloading`) | [Resource](https://angular.dev/guide/signals/resource), проверено запуском |
| Сигналы, задача 7 | «ERROR: Circular dependency detected» | Сообщение `Detected cycle in computations.` | проверено запуском |
| Сигналы | Сигналы в шаблоне «обновляют DOM точечно, без обхода дерева», «O(1)» | Сигнал помечает представление компонента; проверяется этот компонент (предки только проходятся), а не отдельная привязка | [Skipping subtrees](https://angular.dev/best-practices/skipping-subtrees) |
| ChangeDetection | Обход дерева и `ExpressionChanged…` в двух циклах всегда | Повторная проверка `checkNoChanges` только в режиме разработки; с `OnPush` по умолчанию (v22) изменённое после проверки поле молча не попадает на экран, ошибка `NG0100` видна только у `Eager` | проверено запуском |
| DI | Платформенный инжектор даёт `Title`, `Location`, `DomSanitizer` | Это сервисы `providedIn: 'root'`; на уровне платформы `PlatformRef`, `PLATFORM_ID` и подобное | [Hierarchical DI](https://angular.dev/guide/di/hierarchical-dependency-injection) |
| DI | «Каждый Angular-модуль имеет свой инжектор» | Свой инжектор создают корень, лениво загруженные модули и маршруты с `providers`; обычные модули сливаются в корневой | там же |
| DI | `@Injectable()` «создаёт единственный экземпляр для всех» | Сам декоратор ничего не предоставляет; синглтон даёт `providedIn: 'root'` или `@Service()` | [Creating services](https://angular.dev/guide/di/creating-and-using-services) |
| DI | `providedIn: 'any'` «псевдоним отсутствия значения» | `'any'` создавал экземпляр на каждый ленивый инжектор; он и `providedIn: SomeModule` устарели | [Injectable API](https://angular.dev/api/core/Injectable) |
| DI | `viewProviders` «свой экземпляр для каждого компонента» как главное отличие | Главное отличие: `viewProviders` не видны проецируемому содержимому (`ng-content`), `providers` видны | [Hierarchical DI](https://angular.dev/guide/di/hierarchical-dependency-injection), проверено запуском |
| RxJS | `concatMap` «работает синхронно», `switchMap` «завершает старые Observable» | `concatMap` выполняет внутренние потоки по очереди, но асинхронно; `switchMap` отписывается от старого, не завершая его | [RxJS operators](https://rxjs.dev/guide/operators), проверено запуском |
| RxJS | «Every @Output() is a hot observable» | `output()` возвращает `OutputEmitterRef`, не Observable; `EventEmitter` наследует `Subject` | [Outputs](https://angular.dev/guide/components/outputs) |
| RxJS | `share()` «делает Observable горячим и эмитит без подписчиков» | `share` подписывается на источник с первым подписчиком и сбрасывает его, когда подписчиков нет или источник завершился; поздний подписчик на завершённый источник запускает его заново | проверено запуском |
| Шаблоны | `static: true` «разрешается на этапе компиляции» | Запрос разрешается до первой проверки (доступен в `ngOnInit`), если элемент не внутри встроенного шаблона; `static: false` после проверки, в `ngAfterViewInit` | [Queries](https://angular.dev/guide/components/queries) |
| Шаблоны | `preserveWhitespaces: true` «удаляет лишние пробелы» | Наоборот, сохраняет их; по умолчанию пробелы схлопываются | [Advanced component configuration](https://angular.dev/guide/components/advanced-configuration) |
| JIT и AOT | AOT «безопаснее, так как код не виден», JIT «для разработки» | Код виден в обоих случаях; AOT убирает компиляцию шаблонов в браузере. С Ivy (v9) AOT используется и в `ng serve` | [AOT compiler](https://angular.dev/tools/cli/aot-compiler) |
| Безопасность | `[innerHTML]` «не очищается» | Привязка `[innerHTML]` очищается санитайзером; опасны прямые `nativeElement.innerHTML` и `bypassSecurityTrust*` | [Security](https://angular.dev/guide/security) |
| Гидратация | «Не подходит для приложений с пользовательскими данными» | Подходит; несовпадение HTML сервера и клиента нужно устранять, а данные передаются через кэш `HttpClient` (transfer state) | [Hydration](https://angular.dev/guide/hydration) |
| Tree shaking | «Динамический импорт оставляет весь файл», совет предпочитать статические импорты | Динамический импорт выносит код в отдельный чанк; ленивые маршруты и `@defer` как раз на нём построены | [Lazy loading](https://angular.dev/guide/routing/loading-strategies) |
| Тесты | Асинхронные проверки в `.then()` без `await`/`async` | Тест завершится раньше, чем выполнится `expect`, и пройдёт всегда | разбор кода |
| Тесты | `declarations: [MyComponent]` в `TestBed` | Standalone-компонент подключают через `imports` | [Testing components](https://angular.dev/guide/testing/components-basics) |
| Лучшие практики | `params.get('orgId')` у `ActivatedRoute.params` | `params` это объект, `get` есть у `paramMap`; сейчас удобнее `withComponentInputBinding()` и `input()` | [Read route state](https://angular.dev/guide/routing/read-route-state) |
| ExpressionChanged | Исправлять через `setTimeout` | Это прячет ошибку потока данных; правильнее производное через `computed`, изменение в обработчике или сигнал | [NG0100](https://angular.dev/errors/NG0100) |
| Zoneless | Zone.js «25–40 КБ gzip», SSR-метрики, «TTI на 3G» | Цифры без источника | — |

## Пробелы, закрытые в уроках

- Standalone и `imports`, `input()`/`model()`/`output()`, control flow с `track`, `@let`, `host` вместо `@HostBinding`, сигнальные запросы, `DestroyRef`, `afterNextRender`.
- Сигналы на запуске: ленивость и мемоизация `computed`, динамические зависимости, равенство, тайминг и очистка `effect`, `untracked`, `linkedSignal`, `resource` со статусами, `toSignal`.
- Zoneless и `OnPush` по умолчанию: что именно планирует проверку, `Eager`, `markForCheck` против `detectChanges`, `NG0100`.
- `inject()`, `@Service()`, виды провайдеров, `InjectionToken` с фабрикой, иерархия, где живёт root-сервис, `viewProviders` и проекция.
- RxJS 7: холодные и горячие потоки, Subject-ы, четыре оператора отображения на одном примере, `share` и `shareReplay`, `retry({ delay })`, `firstValueFrom`, `takeUntilDestroyed`.
- Функциональные интерсепторы и guards, привязка параметров маршрута к `input()`, signal forms, `@defer` и триггеры, SSR с `RenderMode`, инкрементальная гидратация, Vitest.
