## What this lesson covers

What a Vue application is built from: Vue Router 5 (routes, guards, lazy pages, file-based routing now in the core), server rendering and hydration, Nuxt 4 as the framework on top of Vue, and testing with Vitest and Vue Test Utils. The examples run on Vue 3.5 and Vue Router 5.4.

## Vue Router

`createRouter({ history, routes })` and `app.use(router)`. History: `createWebHistory()` for normal URLs (the server needs a fallback to `index.html`), `createWebHashHistory()` for static hosting without configuration, `createMemoryHistory()` for SSR and tests.

```js dom
import { createApp, nextTick } from 'vue'
import { createMemoryHistory, createRouter, RouterView } from 'vue-router'

const session = { user: null }

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/login', component: { template: `<p>Login page</p>` } },
    {
      path: '/orders/:id',
      component: { props: ['id'], template: `<p>Order {{ id }}</p>` },
      props: true, // route params become component props
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !session.user) return { path: '/login', query: { redirect: to.fullPath } }
})

const el = document.createElement('div')
createApp({ components: { RouterView }, template: `<RouterView />` }).use(router).mount(el)

await router.push('/orders/42')
await nextTick()
console.log(router.currentRoute.value.fullPath, '→', el.textContent)

session.user = 'ann'
await router.push('/orders/42')
await nextTick()
console.log(router.currentRoute.value.fullPath, '→', el.textContent)
```

```output
/login?redirect=/orders/42 → Login page
/orders/42 → Order 42
```

- A guard returns a route to redirect to, `false` to cancel, or nothing to continue; `next()` is not needed in new code.
- `props: true` passes path parameters as props, so the component does not depend on `useRoute()`.
- Lazy pages: `component: () => import('./OrderPage.vue')`, each in its own chunk.
- In a component: `useRoute()` (the current route, reactive), `useRouter()` (navigation), `onBeforeRouteLeave` for unsaved forms.
- **Vue Router 5** (January 2026) moved file-based routing from `unplugin-vue-router` into the core: routes are built from files in `src/pages` with typed names and params, and the plugin is imported from `vue-router/vite`. Ordinary route configuration, as above, has no breaking changes.

## SSR and hydration

`createSSRApp` and `renderToString` from `vue/server-renderer` render the app to HTML on the server; on the client `createSSRApp(App).mount('#app')` **hydrates** the existing markup instead of creating new nodes.

```js run
import { createSSRApp, ref, useId } from 'vue'
import { renderToString } from 'vue/server-renderer'

const Field = {
  props: ['label'],
  setup: () => ({ id: useId() }),
  template: `<label :for="id">{{ label }}</label><input :id="id">`,
}

const app = createSSRApp({
  components: { Field },
  setup: () => ({ items: ref(['Ann', 'Bob']) }),
  template: `<form><Field label="Name" /><Field label="Email" /></form><ul><li v-for="i in items" :key="i">{{ i }}</li></ul>`,
})

const html = await renderToString(app)
console.log(html.replace(/<!--[[\]]-->/g, ''))
```

```output
<form><label for="v-0">Name</label><input id="v-0"><label for="v-1">Email</label><input id="v-1"></form><ul><li>Ann</li><li>Bob</li></ul>
```

- The client's first render must produce the same HTML as the server, otherwise Vue warns about a mismatch and re-renders the node. Values that inevitably differ (time, locale) are marked with `data-allow-mismatch` (3.5).
- `useId()` (3.5) gives identical ids on the server and the client; `Math.random()` does not work for this.
- On the server `onMounted` and post-render watchers do not run, and there is no `window` or `document`: browser code goes into `onMounted`.
- State must not live in global modules: the server handles many requests in one process. Pinia creates a store per request and passes the state to the client.
- **Lazy hydration** (3.5): `defineAsyncComponent({ loader, hydrate: hydrateOnVisible() })` keeps a component as static HTML until it appears on screen; there are also `hydrateOnIdle`, `hydrateOnInteraction`, `hydrateOnMediaQuery`.

## Nuxt

In practice SSR is done with **Nuxt** (version 4): file-based routes in `app/pages`, server APIs in `server/`, auto-imports, data loading with `useFetch` and `useAsyncData` that passes results from the server to the client, and a rendering mode per route (`routeRules`: SSR, static generation, client-only, caching). For sites without a server there is Nuxt SSG or VitePress (documentation).

## Tests

- **Vitest** (the same config as Vite) with a `jsdom` or `happy-dom` environment.
- **Vue Test Utils**: `mount(Component, { props, global: { plugins: [router, pinia] } })`, then `wrapper.find('button').trigger('click')` and `await` for the DOM update; **Testing Library for Vue** checks what the user sees (roles, labels).
- Pinia in tests: `createTestingPinia()` replaces actions with spies; `setActivePinia(createPinia())` for testing a store itself.
- E2E: Playwright or Cypress.

## Key points

- `createRouter` with a history, guards return a route or `false`, `props: true` for params, lazy pages through `import()`.
- Vue Router 5 moved file-based routing into the core with no breaking changes for ordinary configuration.
- `createSSRApp` and `renderToString` on the server, hydration on the client; `useId`, `data-allow-mismatch`, lazy hydration from 3.5.
- Global module state is dangerous under SSR; Pinia isolates requests.
- Nuxt 4 for SSR and SSG; tests with Vitest and Vue Test Utils or Testing Library.
