## О чём урок

Из чего собирается приложение на Vue: Vue Router 5 (маршруты, guards, ленивые страницы, файловый роутинг теперь в ядре), серверный рендер и гидратация, Nuxt 4 как фреймворк поверх Vue и тестирование на Vitest с Vue Test Utils. Примеры выполняются на Vue 3.5 и Vue Router 5.4.

## Vue Router

`createRouter({ history, routes })` и `app.use(router)`. История: `createWebHistory()` для обычных адресов (серверу нужен fallback на `index.html`), `createWebHashHistory()` для статического хостинга без настройки, `createMemoryHistory()` для SSR и тестов.

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

- Guard возвращает маршрут для перенаправления, `false` для отмены или ничего для продолжения; `next()` в новом коде не нужен.
- `props: true` передаёт параметры пути в пропсы, и компонент не зависит от `useRoute()`.
- Ленивые страницы: `component: () => import('./OrderPage.vue')`, каждая уходит в свой чанк.
- В компоненте: `useRoute()` (текущий маршрут, реактивный), `useRouter()` (навигация), `onBeforeRouteLeave` для несохранённых форм.
- **Vue Router 5** (январь 2026) включил в ядро файловый роутинг из `unplugin-vue-router`: маршруты строятся из файлов в `src/pages` с типизированными именами и параметрами, плагин подключается из `vue-router/vite`. Для обычной конфигурации маршрутов, как выше, ломающих изменений нет.

## SSR и гидратация

`createSSRApp` и `renderToString` из `vue/server-renderer` рендерят приложение в HTML на сервере; на клиенте `createSSRApp(App).mount('#app')` **гидратирует** готовую разметку вместо создания новой.

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

- HTML первого рендера на клиенте должен совпасть с серверным, иначе Vue предупредит о несовпадении и перерисует узел. Значения, которые неизбежно отличаются (время, локаль), помечают `data-allow-mismatch` (3.5).
- `useId()` (3.5) даёт одинаковые id на сервере и клиенте; `Math.random()` для этого не годится.
- На сервере не выполняются `onMounted` и наблюдатели после рендера, нет `window` и `document`: браузерный код идёт в `onMounted`.
- Состояние нельзя держать в глобальных модулях: сервер обслуживает много запросов в одном процессе. Pinia создаёт свой стор на каждый запрос и передаёт состояние клиенту.
- **Ленивая гидратация** (3.5): `defineAsyncComponent({ loader, hydrate: hydrateOnVisible() })` оставляет компонент статичным HTML, пока он не появится на экране; есть `hydrateOnIdle`, `hydrateOnInteraction`, `hydrateOnMediaQuery`.

## Nuxt

На практике SSR делают через **Nuxt** (версия 4): файловые маршруты в `app/pages`, серверные API в `server/`, автоимпорты, загрузка данных `useFetch` и `useAsyncData` с передачей результата с сервера на клиент, режимы рендера для каждого маршрута (`routeRules`: SSR, статическая генерация, только клиент, кэширование). Для сайтов без сервера подходят SSG Nuxt или VitePress (документация).

## Тесты

- **Vitest** (тот же конфиг, что у Vite) с окружением `jsdom` или `happy-dom`.
- **Vue Test Utils**: `mount(Component, { props, global: { plugins: [router, pinia] } })`, затем `wrapper.find('button').trigger('click')` и `await` для обновления DOM; **Testing Library для Vue** проверяет то, что видит пользователь (роли, подписи).
- Pinia в тестах: `createTestingPinia()` подменяет действия шпионами; `setActivePinia(createPinia())` для тестов самого стора.
- E2E: Playwright или Cypress.

## Главное

- `createRouter` с историей, guards возвращают маршрут или `false`, `props: true` для параметров, ленивые страницы через `import()`.
- Vue Router 5 перенёс файловый роутинг в ядро без ломающих изменений для обычной конфигурации.
- `createSSRApp` и `renderToString` на сервере, гидратация на клиенте; `useId`, `data-allow-mismatch`, ленивая гидратация из 3.5.
- Глобальное состояние в модулях при SSR опасно; Pinia изолирует запросы.
- Nuxt 4 для SSR и SSG; тесты на Vitest и Vue Test Utils или Testing Library.
