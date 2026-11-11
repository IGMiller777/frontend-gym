# Аудит заметок: архитектуры рендеринга

Источники в Notion: разделы «SSR» (General, SSR Mismatch Causes, Streaming SSR) и «Hydration» страницы «Browser» (прочитаны целиком; часть ошибок уже записана в `browser.md` с пометкой «rendering» и исправлена здесь), раздел «A — Architecture» страницы «System Design» (CSR, SSR, SSG, ISR, микрофронтенды), раздел «Optimization: SSR» страницы «React» (API React сверены в треке React, урок `react-server`). Серверный рендер Angular разобран в `ng-performance` и `ng-app`, Vue и Nuxt в `vue-app`. Этот трек про архитектуру, общую для всех фреймворков, и ссылается на эти уроки, а не повторяет их.

Утверждения сверены с web.dev, react.dev (`hydrateRoot`, `renderToReadableStream`, `prerender`, `resume`, блог React 19.3), vuejs.org (SSR, ленивая гидратация), angular.dev (гидратация, инкрементальная гидратация, гибридный рендер), nextjs.org (блог 16.4, Cache Components), nuxt.com (route rules), docs.astro.build (острова), qwik.dev, svelte.dev, reactrouter.com, Google Search Central (JavaScript SEO), MDN (`Cache-Control`). Примеры уроков выполняются в CI на React 19.3, Vue 3.5 и TanStack Query 5.

## Актуальные версии (ноябрь 2026)

| Пакет | Версия | Что важно |
|---|---|---|
| `react`, `react-dom` | 19.3 | `renderToReadableStream`, `prerender` и `resume` (частичный пререндер), `use(browser())` вместо флага «смонтирован» (19.3), дорожки React во вкладке Performance |
| `vue` | 3.5 | `renderToWebStream` отдаёт HTML по порядку; ленивая гидратация `hydrateOnVisible`, `hydrateOnIdle`, `hydrateOnInteraction`, `hydrateOnMediaQuery` |
| `next` | 16.4 | Cache Components (`'use cache'`, `cacheLife`, `cacheTag`) рекомендованы для всех приложений и включены в новых проектах, по умолчанию с Next.js 17; это продолжение Partial Prerendering; `ensureStatic` |
| `nuxt` | 4.6 | Универсальный рендер по умолчанию, `routeRules`: `prerender`, `swr`, `isr`, `ssr: false` |
| `@angular/ssr` | 22.2 | `RenderMode.Server`, `Prerender`, `Client` на маршрут; инкрементальная гидратация `@defer (hydrate on ...)` по умолчанию |
| `astro` | 7.4 | Острова: без директивы ноль JavaScript, `client:load`, `client:idle`, `client:visible`; серверные острова `server:defer`. Astro 7 (июнь 2026) это компилятор на Rust и Vite 8, модель островов прежняя |
| `@sveltejs/kit` | 3.2 | Опции страницы `ssr`, `csr`, `prerender`; SvelteKit 3 (октябрь 2026) требует Node.js 22.17, TypeScript 6, Vite 8 |
| `react-router` | 8.5 | Режим фреймворка: SSR, `prerender` в конфиге, SPA-режим `ssr: false` |
| Qwik | 1.20 (2.0 в release candidate) | Возобновляемость вместо гидратации |

## Найденные ошибки

| Где | В заметках | На самом деле | Источник |
|---|---|---|---|
| Browser, SSR | «SSR в браузере это процесс hydration» | SSR это рендер HTML на сервере, гидратация отдельный шаг на клиенте; без гидратации серверный HTML остаётся статичным | [web.dev: Rendering on the web](https://web.dev/articles/rendering-on-the-web) |
| Browser, SSR | Таблица CSR против SSR: при SSR браузер делает «только event listeners» | Гидратация заново выполняет код всех компонентов и строит дерево в памяти; не создаёт только DOM-узлы. Поэтому большая страница долго не отвечает на ввод после показа | [web.dev: Rendering on the web](https://web.dev/articles/rendering-on-the-web), проверено запуском (`render-hydration`) |
| Browser, SSR | Vue 3: `createApp(App).$mount('#app')` для гидратации | `createSSRApp(App).mount('#app')`; `$mount` из Vue 2 | [Vue: Client hydration](https://vuejs.org/guide/scaling-up/ssr.html#client-hydration) |
| Browser, SSR | Angular: `bootstrapApplication(AppComponent, { hydration: true })` | Гидратацию включает `provideClientHydration()` | [Angular: Hydration](https://angular.dev/guide/hydration) |
| Browser, Mismatch | Исправлять несовпадение через `useLayoutEffect` «до paint» | На сервере эффекты не выполняются, а в браузере серверный HTML уже показан, поэтому мигание остаётся. Правильно: одинаковый первый рендер и уточнение после гидратации (`useSyncExternalStore` с `getServerSnapshot`, `useEffect`) или `use(browser())` с `Suspense` (React 19.3) | [React: hydrateRoot](https://react.dev/reference/react-dom/client/hydrateRoot), [React 19.3](https://react.dev/blog/2026/09/09/react-19-3) |
| Browser, Mismatch | `dynamic(..., { ssr: false })` как общий способ | В App Router `ssr: false` нельзя в Server Components, только в клиентских; в React 19.3 есть `use(browser())` | [Next.js: Lazy loading](https://nextjs.org/docs/app/guides/lazy-loading) |
| Browser, Mismatch | «Lighthouse покажет hydration время в Performance панели» | Lighthouse этого не показывает; гидратацию видно во вкладке Performance Chrome DevTools (дорожки React) | [React: Performance tracks](https://react.dev/reference/dev-tools/react-performance-tracks) |
| Browser, Streaming | `onAllReady` «fallback для старых браузеров» | Нужен поисковым роботам и статической генерации: ждёт весь контент | [React: renderToReadableStream](https://react.dev/reference/react-dom/server/renderToReadableStream) |
| Browser, Streaming | Поддержка стриминга с Suspense: «React 18+, Next.js 13+, Vue 3+» | Vue 3 стримит HTML по порядку: ждёт асинхронный компонент на месте, заглушку `Suspense` в поток не отправляет; вывод не по порядку с заглушками есть в React; проверено запуском | [Vue: Streaming render](https://vuejs.org/api/ssr.html#rendertowebstream) |
| Browser, Streaming | «Полная загрузка страницы: при стриминге позже» | Утверждение без источника; при стриминге `<head>` с CSS и JS уходит раньше, и загрузка ресурсов начинается раньше | [web.dev: Rendering on the web](https://web.dev/articles/rendering-on-the-web) |
| Browser, Streaming | Perceived load «на 30–50 %», «Safari хуже поддерживает» | Цифры и утверждение без источника | — |
| Browser, Hydration | React при несовпадении «полностью отбрасывает серверный HTML» | Перерисовывает на клиенте до ближайшей границы `Suspense` (или корня) и сообщает через `onRecoverableError`; проверено запуском | [React: hydrateRoot](https://react.dev/reference/react-dom/client/hydrateRoot) |
| Browser, Hydration | Selective hydration и partial hydration как одно и то же («в Next.js/Astro») | Selective hydration (React) гидратирует всё, но по частям и в порядке приоритета; partial hydration (острова Astro) часть страницы не гидратирует вовсе | [docs.astro.build: Islands](https://docs.astro.build/en/concepts/islands/) |
| Browser, Hydration | Resumability: «сервер сериализует стек вызовов, промисы» | Qwik сериализует в HTML состояние, обработчики и границы компонентов; код обработчика загружается при первом событии | [qwik.dev: Resumable](https://qwik.dev/docs/concepts/resumable/) |
| Browser, Hydration | Данные для клиента: `<script>window.__DATA__ = {...}</script>` | `JSON.stringify` не экранирует `</script>`: строка из данных закрывает тег и выполняет чужой код (XSS). Экранируют `<` (`<`) или берут `devalue`, `serialize-javascript`; фреймворки делают это сами; проверено запуском | [OWASP: XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html) |
| System Design, Architecture | «ISR — страницы регенерируются по таймеру» | Страница перестраивается по запросу после истечения срока: этот посетитель получает старую версию, следующий новую (stale-while-revalidate); плюс перестройка по событию (`revalidateTag`) | [Next.js: ISR](https://nextjs.org/docs/app/guides/incremental-static-regeneration), [Nuxt: route rules](https://nuxt.com/docs/4.x/guide/concepts/rendering) |
| System Design, Architecture | CSR «плохой SEO» без оговорок | Google выполняет JavaScript, но отложенно, в очереди рендера; другие роботы и превью ссылок в соцсетях JavaScript часто не выполняют. Google рекомендует серверный рендер или пререндер | [Google: JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) |

## Покрытие заметок Notion

| Тема в заметках | Где разобрано |
|---|---|
| CSR, SSR, SSG, ISR и их сравнение | `render-patterns` |
| Что происходит в браузере при SSR | `render-ssr`, `render-hydration` |
| Передача данных с сервера на клиент, водопад запросов | `render-ssr#Данные с сервера на клиент` |
| Гидратация: принцип, стоимость | `render-hydration` |
| Причины несовпадения и исправления | `render-hydration#Почему HTML не совпадает`, `#Как исправить` |
| Streaming SSR, shell, Suspense, `onShellReady`, `onAllReady` | `render-streaming` |
| Минусы стриминга: статус и заголовки, прокси, кэш | `render-streaming#Ограничения стриминга` |
| Selective hydration | `render-streaming#Выборочная гидратация` |
| Partial и progressive hydration, острова, resumability | `render-less-js` |
| ISR и регенерация | `render-static` |
| Next.js App Router, Server Components | `render-less-js#Server Components`, `render-frameworks`; API в `react-server` |
| Выбор стратегии рендера в system design | `render-choosing` |

Добавлено сверх заметок, потому что об этом спрашивают: частичный пререндер (`prerender` и `resume` в React, Cache Components в Next.js), кэширование HTML на CDN и персональные данные, edge-рендер, метафреймворки и режим рендера на маршрут, SEO-детали (статус 404 в SPA, мета-теги для превью), влияние на Core Web Vitals, `use(browser())`, ленивая гидратация во Vue и инкрементальная в Angular.
