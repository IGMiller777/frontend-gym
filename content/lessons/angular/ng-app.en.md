## What this lesson covers

What an Angular 22 application is built from: the router with functional guards and parameters bound to inputs, `HttpClient` with functional interceptors, forms (reactive and signal forms), lazy loading through routes and `@defer`, server rendering with `@angular/ssr` and hydration, and tests on Vitest. The examples run in jsdom on Angular 22.2.

## The router

Routes are registered with `provideRouter(routes, ...features)` in `bootstrapApplication` (`RouterModule.forRoot` remains for NgModules). Modern techniques:

- lazy pages: `loadComponent: () => import('./order')` and `loadChildren: () => import('./admin.routes')`;
- guards and resolvers are functions (`CanActivateFn`, `CanMatchFn`, `ResolveFn`) with `inject()` inside; class-based `implements CanActivate` is deprecated;
- `withComponentInputBinding()` passes path parameters, query and `data` straight into component inputs;
- a guard can return a `UrlTree`, and navigation is redirected.

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

A guard protects the interface, not the data: permission checks are still needed on the server. `CanDeactivate` asks for confirmation when leaving a page with an unsaved form. Since v22 `paramsInheritanceStrategy: 'always'` is the default: child routes see the parameters of all parents.

## HttpClient and interceptors

`provideHttpClient(withInterceptors([...]))`. Since v22 requests go through `fetch` by default (`withFetch` is no longer needed); for upload progress there is `withXhr`. An interceptor is a function `(req, next) => next(modifiedReq)`; a request is immutable and is changed with `clone`. Interceptors run in array order on the request and in reverse order on the response.

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

- An interceptor receives a stream of `HttpEvent`s, not just the response: the `Sent` event comes first, so the response is picked by `HttpEventType.Response`.
- Token refresh is done in an interceptor: catch `401`, get a new access token (one request for everyone waiting, for example with `shareReplay`), retry the request.
- `HttpClient` returns a cold Observable: without a subscription no request is sent, and each subscription is a new request.
- For reading data into signals there is `httpResource(() => '/api/users/' + id())`: loading statuses and cancellation of stale requests out of the box.

## Forms

- **Reactive forms** (`FormGroup`, `FormControl`, typed since v14) remain the main choice in existing apps.
- **Template-driven** forms (`ngModel`) fit simple forms.
- **Signal forms** (`@angular/forms/signals`, public API since v22): the form model is a signal, a schema describes the rules, and the `[formField]` directive binds an input to a model field both ways.

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

Changing a form field changes the model at once, and vice versa. The `minLength` rule does not check an empty field: requiredness is set separately with `required`. `ann@example` passes the `email` check because the format comes from the HTML spec, where a top-level domain is not required.

## Lazy loading and @defer

Code is split by route (`loadComponent`) and, inside a page, with `@defer`: the components in the block go into a separate chunk and load on a trigger.

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

Triggers: `on idle` (the default, via `requestIdleCallback`), `on viewport`, `on interaction`, `on hover`, `on immediate`, `on timer(2s)` and `when <condition>`. `prefetch` loads the code early but shows it on the main trigger. Only standalone components that are not used elsewhere in the same file can be deferred.

## SSR and hydration

`ng new --ssr` or `ng add @angular/ssr` (formerly Angular Universal). The mode is chosen per route in the server routes:

```ts
// app.routes.server.ts
import { RenderMode, ServerRoute } from '@angular/ssr'

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender }, // HTML at build time
  { path: 'products/:id', renderMode: RenderMode.Server }, // HTML per request
  { path: 'account/**', renderMode: RenderMode.Client }, // plain SPA
]
```

- **Hydration** (`provideClientHydration()`) reuses the server DOM instead of re-rendering; the server HTML and the client's first render must match. `HttpClient` responses from the server are handed to the client, and the request is not repeated.
- **Incremental hydration** is on by default since v22: `@defer (hydrate on viewport)` blocks stay static HTML until needed.
- **Event replay** records clicks before hydration and replays them afterwards.
- There is no `window` or `localStorage` on the server: browser-only code runs in `afterNextRender` or checks the platform.

## Tests

New projects (v21+) test with **Vitest and jsdom** instead of Karma and Jasmine; Protractor is discontinued, and e2e uses Playwright or Cypress. `TestBed` remains: standalone components go into `imports`, HTTP is replaced with `provideHttpClientTesting()` and `HttpTestingController` (as in the example above), and `await fixture.whenStable()` waits for the check in zoneless mode.

## Key points

- The router: `provideRouter`, lazy `loadComponent`, functional guards with `UrlTree`, parameters into inputs with `withComponentInputBinding`.
- `HttpClient` uses `fetch` by default (v22), interceptors are functions, the response is picked by `HttpEventType.Response`, `httpResource` for signals.
- Forms: reactive for existing code, signal forms (v22) with a signal model and `[formField]`.
- `@defer` with triggers and `prefetch` splits code inside a page.
- SSR with `@angular/ssr` and a `RenderMode` per route; hydration, incremental by default since v22, and event replay.
- Tests: Vitest and jsdom by default, `TestBed` with `imports`.
