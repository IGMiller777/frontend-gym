## О чём урок

Из чего собирается приложение на Angular 22: роутер с функциональными guards и привязкой параметров к входам, `HttpClient` с функциональными интерсепторами, формы (reactive и signal forms), ленивая загрузка через маршруты и `@defer`, серверный рендер с `@angular/ssr` и гидратацией, тесты на Vitest. Примеры выполняются в jsdom на Angular 22.2.

## Роутер

Маршруты подключают `provideRouter(routes, ...features)` в `bootstrapApplication` (`RouterModule.forRoot` остался для NgModule). Современные приёмы:

- ленивые страницы: `loadComponent: () => import('./order')` и `loadChildren: () => import('./admin.routes')`;
- guards и резолверы это функции (`CanActivateFn`, `CanMatchFn`, `ResolveFn`) с `inject()` внутри; классовые `implements CanActivate` устарели;
- `withComponentInputBinding()` передаёт параметры пути, query и `data` прямо во входы компонента;
- guard может вернуть `UrlTree`, и навигация перенаправится.

```ts dom
import { Component, inject, input, signal } from '@angular/core'
import { createApplication } from '@angular/platform-browser'
import { CanActivateFn, Router, provideRouter, RouterOutlet, withComponentInputBinding } from '@angular/router'

const session = signal<string | null>(null)

const authGuard: CanActivateFn = (_route, state) =>
  session() ? true : inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } })

@Component({ template: `<p>Login page</p>` })
class Login {}

@Component({ template: `<p>Order {{ id() }}</p>` })
class Order {
  id = input.required<string>() // filled from the :id route parameter
}

@Component({ selector: 'app-root', imports: [RouterOutlet], template: `<router-outlet />` })
class App {}

document.body.innerHTML = '<app-root></app-root>'
const app = await createApplication({
  providers: [
    provideRouter(
      [
        { path: 'login', component: Login },
        { path: 'orders/:id', component: Order, canActivate: [authGuard] },
      ],
      withComponentInputBinding(),
    ),
  ],
})
app.bootstrap(App)
const router = app.injector.get(Router)
const page = () => document.querySelector('app-root')!.textContent!.trim()

await router.navigateByUrl('/orders/42')
await app.whenStable()
console.log(router.url, '→', page())

session.set('ann')
await router.navigateByUrl('/orders/42')
await app.whenStable()
console.log(router.url, '→', page())
```

```output
/login?returnUrl=%2Forders%2F42 → Login page
/orders/42 → Order 42
```

Guard защищает интерфейс, а не данные: проверка прав всё равно нужна на сервере. `CanDeactivate` спрашивает подтверждение при уходе со страницы с несохранённой формой. С v22 по умолчанию `paramsInheritanceStrategy: 'always'`: дочерние маршруты видят параметры всех родителей.

## HttpClient и интерсепторы

`provideHttpClient(withInterceptors([...]))`. С v22 по умолчанию запросы идут через `fetch` (`withFetch` больше не нужен); для прогресса загрузки файлов есть `withXhr`. Интерсептор это функция `(req, next) => next(modifiedReq)`; запрос неизменяемый, его меняют через `clone`. Интерсепторы выполняются в порядке массива на запросе и в обратном порядке на ответе.

```ts dom
import { HttpClient, HttpEventType, HttpInterceptorFn, provideHttpClient, withInterceptors } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { inject, InjectionToken } from '@angular/core'
import { createApplication } from '@angular/platform-browser'
import { firstValueFrom, tap } from 'rxjs'

const TOKEN = new InjectionToken<string>('TOKEN', { factory: () => 'secret' })

const auth: HttpInterceptorFn = (req, next) => {
  console.log('auth: adds the header')
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${inject(TOKEN)}` } }))
}
const logging: HttpInterceptorFn = (req, next) => {
  console.log('logging: request', req.method, req.url)
  return next(req).pipe(tap((event) => event.type === HttpEventType.Response && console.log('logging: response', event.status)))
}

const app = await createApplication({
  providers: [provideHttpClient(withInterceptors([logging, auth])), provideHttpClientTesting()],
})
const http = app.injector.get(HttpClient)
const backend = app.injector.get(HttpTestingController)

const users = firstValueFrom(http.get<string[]>('/api/users'))
const req = backend.expectOne('/api/users')
console.log('server sees:', req.request.headers.get('Authorization'))
req.flush(['Ann', 'Bob'])
console.log('component gets:', await users)
```

```output
logging: request GET /api/users
auth: adds the header
server sees: Bearer secret
logging: response 200
component gets: [ 'Ann', 'Bob' ]
```

- Интерсептор получает поток `HttpEvent`, а не только ответ: первым приходит событие `Sent`, поэтому ответ отбирают по `HttpEventType.Response`.
- Обновление токена делают в интерсепторе: поймать `401`, получить новый access-токен (один запрос на всех ждущих, например через `shareReplay`), повторить запрос.
- `HttpClient` возвращает холодный Observable: без подписки запрос не уйдёт, каждая подписка это новый запрос.
- Для чтения данных в сигналы есть `httpResource(() => '/api/users/' + id())`: статусы загрузки и отмена устаревших запросов из коробки.

## Формы

- **Reactive forms** (`FormGroup`, `FormControl`, типизированные с v14) остаются основным выбором в существующих приложениях.
- **Template-driven** (`ngModel`) годятся для простых форм.
- **Signal forms** (`@angular/forms/signals`, публичный API с v22): модель формы это сигнал, схема описывает правила, а директива `[formField]` связывает поле ввода с полем модели в обе стороны.

```ts dom
import { runInInjectionContext, signal } from '@angular/core'
import { createApplication } from '@angular/platform-browser'
import { email, form, minLength, required } from '@angular/forms/signals'

const app = await createApplication()
const model = signal({ email: '', password: '' })
const signup = runInInjectionContext(app.injector, () =>
  form(model, (path) => {
    required(path.email, { message: 'Email is required' })
    email(path.email, { message: 'Not an email' })
    minLength(path.password, 8, { message: 'At least 8 characters' })
  }),
)

const errors = () => [...signup.email().errors(), ...signup.password().errors()].map((e) => e.message)
console.log('valid:', signup().valid(), errors())
signup.email().value.set('ann@example')
model.update((m) => ({ ...m, password: 'secret123' }))
console.log('valid:', signup().valid(), errors(), '| model:', JSON.stringify(model()))
```

```output
valid: false [ 'Email is required' ]
valid: true [] | model: {"email":"ann@example","password":"secret123"}
```

Изменение поля формы сразу меняет модель, и наоборот. Правило `minLength` не проверяет пустое поле: обязательность отдельно задаёт `required`. `ann@example` проходит проверку `email`, потому что формат взят из спецификации HTML, где домен верхнего уровня не обязателен.

## Ленивая загрузка и @defer

Код страницы делят по маршрутам (`loadComponent`), а внутри страницы через `@defer`: компоненты из блока попадают в отдельный чанк и загружаются по триггеру.

```html
@defer (on viewport; prefetch on idle) {
  <comments-section [postId]="post().id" />
} @placeholder (minimum 300ms) {
  <p>Comments</p>
} @loading (after 100ms) {
  <spinner />
} @error {
  <p>Could not load comments</p>
}
```

Триггеры: `on idle` (по умолчанию, через `requestIdleCallback`), `on viewport`, `on interaction`, `on hover`, `on immediate`, `on timer(2s)` и `when <условие>`. `prefetch` загружает код заранее, а показывает по основному триггеру. Отложить можно только standalone-компоненты, которые больше нигде в этом файле не используются.

## SSR и гидратация

`ng new --ssr` или `ng add @angular/ssr` (бывший Angular Universal). Режим выбирается для каждого маршрута в серверных маршрутах:

```ts
// app.routes.server.ts
import { RenderMode, ServerRoute } from '@angular/ssr'

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender }, // HTML at build time
  { path: 'products/:id', renderMode: RenderMode.Server }, // HTML per request
  { path: 'account/**', renderMode: RenderMode.Client }, // plain SPA
]
```

- **Гидратация** (`provideClientHydration()`) переиспользует серверный DOM вместо перерисовки; HTML сервера и первый рендер клиента должны совпадать. Ответы `HttpClient` с сервера передаются клиенту, и запрос не повторяется.
- **Инкрементальная гидратация** включена по умолчанию с v22: блоки `@defer (hydrate on viewport)` остаются статичным HTML, пока не понадобятся.
- **Event replay** запоминает клики до гидратации и воспроизводит их после.
- На сервере нет `window` и `localStorage`: код для браузера запускают в `afterNextRender` или проверяют платформу.

## Тесты

Новые проекты (v21+) тестируются на **Vitest с jsdom** вместо Karma и Jasmine; Protractor закрыт, для e2e берут Playwright или Cypress. `TestBed` остался: standalone-компоненты подключают через `imports`, HTTP подменяют `provideHttpClientTesting()` и `HttpTestingController` (как в примере выше), а `await fixture.whenStable()` дожидается проверки в zoneless-режиме.

## Главное

- Роутер: `provideRouter`, ленивые `loadComponent`, функциональные guards с `UrlTree`, параметры во входы через `withComponentInputBinding`.
- `HttpClient` на `fetch` по умолчанию (v22), функциональные интерсепторы, ответ отбирают по `HttpEventType.Response`, `httpResource` для сигналов.
- Формы: reactive для существующего кода, signal forms (v22) с моделью-сигналом и `[formField]`.
- `@defer` с триггерами и `prefetch` делит код внутри страницы.
- SSR через `@angular/ssr` и `RenderMode` для каждого маршрута; гидратация, инкрементальная по умолчанию с v22, и event replay.
- Тесты: Vitest и jsdom по умолчанию, `TestBed` с `imports`.
