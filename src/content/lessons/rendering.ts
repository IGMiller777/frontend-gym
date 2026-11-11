import type { Source } from '../sources'
import type { Lesson, Module } from './types'

const src = (title: string, url: string): Source => ({ title, url, kind: 'official' })
const react = (title: string, path: string) => src(`react.dev: ${title}`, `https://react.dev/${path}`)
const next = (title: string, path: string) => src(`nextjs.org: ${title}`, `https://nextjs.org/${path}`)
const webdev = src('web.dev: Rendering on the web', 'https://web.dev/articles/rendering-on-the-web')
const verified = { date: '2026-11', version: 'React 19.3, Vue 3.5, Next.js 16.4, Nuxt 4.6, Angular 22, Astro 7, SvelteKit 3' }

export const renderingLessons: Lesson[] = [
  {
    id: 'render-patterns',
    track: 'rendering',
    emoji: '🗺️',
    minutes: 11,
    title: { ru: 'Карта стратегий рендеринга', en: 'A map of rendering strategies' },
    summary: {
      ru: 'Где и когда строится HTML: CSR, SSR, SSG, ISR, стриминг, частичный пререндер, острова; что видит робот, шкала времени и метрики, SPA и MPA, режим на маршрут.',
      en: 'Where and when HTML is built: CSR, SSR, SSG, ISR, streaming, partial prerendering, islands; what a crawler sees, the timeline and metrics, SPA and MPA, a mode per route.',
    },
    quiz: {
      ru: [
        { q: 'Чем SSG отличается от SSR?', options: ['SSG не нужен JavaScript', 'SSG рендерит в браузере', 'HTML строится при сборке', 'SSG только для React'], correct: 2, why: 'Обе стратегии отдают готовый HTML; SSR строит его на каждый запрос, SSG один раз при сборке.' },
        { q: 'Что ускоряет SSR по сравнению с CSR?', options: ['Показ контента (FCP, LCP)', 'Интерактивность страницы', 'Объём JavaScript', 'Загрузку данных в браузере'], correct: 0, why: 'HTML виден сразу, но для интерактивности нужна гидратация того же JavaScript.' },
        { q: 'Что увидит бот превью ссылки на странице с чистым CSR?', options: ['Полную карточку товара', 'Оболочку без контента', 'Ошибку 500', 'Скриншот страницы'], correct: 1, why: 'Боты превью обычно не выполняют JavaScript, а CSR отдаёт пустую оболочку.' },
        { q: 'Как обычно выбирают стратегию в большом приложении?', options: ['Одну для всего приложения', 'По популярности фреймворка', 'Только SSR, это надёжнее', 'Отдельно для каждого маршрута'], correct: 3, why: 'Главная и блог статичны, каталог перестраивается, кабинет клиентский: режим задают на маршрут.' },
      ],
      en: [
        { q: 'How does SSG differ from SSR?', options: ['SSG needs no JavaScript', 'SSG renders in the browser', 'The HTML is built at build time', 'SSG is only for React'], correct: 2, why: 'Both send ready HTML; SSR builds it on every request, SSG once at build time.' },
        { q: 'What does SSR speed up compared with CSR?', options: ['Showing content (FCP, LCP)', 'Page interactivity', 'The JavaScript size', 'Loading data in the browser'], correct: 0, why: 'The HTML is visible at once, but interactivity needs hydration of the same JavaScript.' },
        { q: 'What does a link preview bot see on a pure CSR page?', options: ['The full product card', 'A shell with no content', 'A 500 error', 'A page screenshot'], correct: 1, why: 'Preview bots usually do not run JavaScript, and CSR sends an empty shell.' },
        { q: 'How is a strategy usually chosen in a large app?', options: ['One for the whole app', 'By framework popularity', 'Only SSR, it is safer', 'Separately for each route'], correct: 3, why: 'The home page and blog are static, the catalog is rebuilt, the account is client-side: the mode is set per route.' },
      ],
    },
    sources: [webdev, src('web.dev: Web Vitals', 'https://web.dev/articles/vitals'), next('Rendering philosophy: caching', 'docs/app/getting-started/caching'), src('angular.dev: Server-side and hybrid rendering', 'https://angular.dev/guide/ssr')],
    verified,
  },
  {
    id: 'render-ssr',
    track: 'rendering',
    emoji: '🖥️',
    minutes: 13,
    title: { ru: 'SSR: запрос, данные, кэш', en: 'SSR: request, data, cache' },
    summary: {
      ru: 'Путь запроса, код на сервере и утечки между запросами, передача данных клиенту без XSS, dehydrate и hydrate кэша запросов, кэширование HTML на CDN, цена SSR.',
      en: 'The request path, code on the server and cross-request leaks, passing data to the client without XSS, dehydrating and hydrating the query cache, caching HTML on a CDN, the cost of SSR.',
    },
    quiz: {
      ru: [
        { q: 'Почему стор или кэш запросов на сервере создают внутри обработчика запроса?', options: ['Так быстрее рендер', 'Иначе данные смешаются', 'Этого требует Node.js', 'Чтобы работал HMR'], correct: 1, why: 'Один процесс обслуживает всех пользователей: общий модуль смешает данные разных запросов.' },
        { q: 'Чем опасен `<script>window.__DATA__ = ${JSON.stringify(data)}</script>`?', options: ['`</script>` в данных закроет тег', 'JSON не работает в script', 'Данные не дойдут до клиента', 'Медленный разбор JSON'], correct: 0, why: 'HTML-парсер закрывает тег на `</script>` внутри строки, остаток данных выполнится как код: XSS.' },
        { q: 'Данные пришли с сервера, но клиент запросил их снова. Что поправить в TanStack Query?', options: ['Убрать `gcTime` из настроек', 'Выключить `retry` у запроса', 'Добавить `enabled: false`', 'Поставить `staleTime` больше нуля'], correct: 3, why: 'Со `staleTime: 0` данные устаревшие сразу, и при монтировании уходит повторный запрос.' },
        { q: 'Какой `Cache-Control` нужен HTML с именем пользователя?', options: ['`public, s-maxage=60`', '`immutable`', '`private` или `no-store`', '`stale-while-revalidate`'], correct: 2, why: 'Персональный HTML в общем кэше CDN показал бы одному пользователю данные другого.' },
      ],
      en: [
        { q: 'Why is a store or query cache created inside the request handler on the server?', options: ['Rendering becomes faster', 'Otherwise data leaks to others', 'Node.js requires it that way', 'So that HMR keeps working'], correct: 1, why: 'One process serves all users: a shared module mixes the data of different requests.' },
        { q: 'What is dangerous about `<script>window.__DATA__ = ${JSON.stringify(data)}</script>`?', options: ['`</script>` in data ends the tag', 'JSON does not work in a script', 'The data never reaches the client', 'Slow JSON parsing'], correct: 0, why: 'The HTML parser closes the tag at `</script>` inside a string, and the rest of the data runs as code: XSS.' },
        { q: 'The data came from the server, but the client requested it again. What to fix in TanStack Query?', options: ['Remove `gcTime` entirely', 'Turn `retry` off for it', 'Add `enabled: false`', 'Set `staleTime` above zero'], correct: 3, why: 'With `staleTime: 0` the data is stale at once, and a repeat request goes out on mount.' },
        { q: 'Which `Cache-Control` does HTML with the user\'s name need?', options: ['`public, s-maxage=60`', '`immutable`', '`private` or `no-store`', '`stale-while-revalidate`'], correct: 2, why: 'Personal HTML in a shared CDN cache would show one user another user\'s data.' },
      ],
    },
    sources: [
      webdev,
      src('vuejs.org: Server-side rendering', 'https://vuejs.org/guide/scaling-up/ssr.html'),
      src('tanstack.com: Server rendering and hydration', 'https://tanstack.com/query/latest/docs/framework/react/guides/ssr'),
      src('OWASP: XSS prevention cheat sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html'),
      src('MDN: Cache-Control', 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control'),
    ],
    verified,
  },
  {
    id: 'render-hydration',
    track: 'rendering',
    emoji: '💧',
    minutes: 13,
    title: { ru: 'Гидратация и несовпадения', en: 'Hydration and mismatches' },
    summary: {
      ru: 'Что выполняет гидратация и сколько стоит, клики до неё, причины несовпадения HTML, недопустимая вложенность, два прохода, use(browser()) в React 19.3, useId и атрибуты для допустимых расхождений.',
      en: 'What hydration runs and what it costs, clicks before it, causes of HTML mismatches, invalid nesting, two passes, use(browser()) in React 19.3, useId and attributes for allowed differences.',
    },
    quiz: {
      ru: [
        { q: 'Что делает фреймворк при гидратации?', options: ['Только навешивает обработчики', 'Заново выполняет код компонентов', 'Перерисовывает весь DOM', 'Загружает данные заново'], correct: 1, why: 'Он вызывает компоненты, строит дерево в памяти и сверяет с готовым DOM; не создаёт только узлы.' },
        { q: 'Что делает React при несовпадении текста?', options: ['Игнорирует расхождение', 'Перезагружает страницу', 'Бросает необработанную ошибку', 'Рендерит заново до `Suspense`'], correct: 3, why: 'Сообщает через `onRecoverableError` и рендерит на клиенте часть дерева до ближайшей границы.' },
        { q: 'Зачем `useSyncExternalStore` третий аргумент `getServerSnapshot`?', options: ['Значение для сервера и гидратации', 'Чтобы подписка вообще работала', 'Для работы в режиме StrictMode', 'Для отмены подписки при уходе'], correct: 0, why: 'При гидратации берётся то же значение, что на сервере, а клиентское сразу после неё.' },
        { q: 'Сервер отправил `<p>Цена: <div>120</div></p>`. Что будет?', options: ['Ничего, так писать можно', 'Ошибка рендера на сервере', 'Браузер перестроит DOM иначе', 'React исправит HTML сам'], correct: 2, why: '`<p>` не может содержать `<div>`: абзац закроется раньше, и гидратация найдёт другую структуру.' },
      ],
      en: [
        { q: 'What does a framework do during hydration?', options: ['Only attaches handlers', 'Runs component code again', 'Redraws the whole DOM', 'Loads the data again'], correct: 1, why: 'It calls components, builds the tree in memory and compares it with the existing DOM; it only skips creating nodes.' },
        { q: 'What does React do on a text mismatch?', options: ['Ignores the difference', 'Reloads the whole page', 'Throws an unhandled error', 'Re-renders up to `Suspense`'], correct: 3, why: 'It reports through `onRecoverableError` and renders the part of the tree up to the nearest boundary on the client.' },
        { q: 'Why does `useSyncExternalStore` take a third argument `getServerSnapshot`?', options: ['A value for server and hydration', 'So the subscription works', 'For running in StrictMode', 'For unsubscribing on unmount'], correct: 0, why: 'During hydration it uses the same value as the server, and the client value right after.' },
        { q: 'The server sent `<p>Price: <div>120</div></p>`. What happens?', options: ['Nothing, it is allowed', 'An error on the server', 'The browser builds other DOM', 'React fixes the HTML itself'], correct: 2, why: 'A `<p>` cannot contain a `<div>`: the paragraph closes early, and hydration finds a different structure.' },
      ],
    },
    sources: [
      react('hydrateRoot', 'reference/react-dom/client/hydrateRoot'),
      react('useSyncExternalStore', 'reference/react/useSyncExternalStore'),
      react('React 19.3: browser()', 'blog/2026/09/09/react-19-3'),
      react('React Performance tracks', 'reference/dev-tools/react-performance-tracks'),
      src('angular.dev: Hydration', 'https://angular.dev/guide/hydration'),
      src('vuejs.org: Hydration mismatch', 'https://vuejs.org/guide/scaling-up/ssr.html#hydration-mismatch'),
    ],
    verified,
  },
  {
    id: 'render-streaming',
    track: 'rendering',
    emoji: '🌊',
    minutes: 12,
    title: { ru: 'Стриминг SSR', en: 'Streaming SSR' },
    summary: {
      ru: 'Блокирующий SSR против потока, как React отправляет части не по порядку, почему Vue стримит по порядку, выборочная гидратация, onShellReady и onAllReady, статус и заголовки, буферизация, CLS.',
      en: 'Blocking SSR versus a stream, how React sends parts out of order, why Vue streams in order, selective hydration, onShellReady and onAllReady, status and headers, buffering, CLS.',
    },
    quiz: {
      ru: [
        { q: 'Что задаёт границы потока в React?', options: ['Маршруты', 'Хуки `useEffect`', 'Границы `Suspense`', 'Атрибут `async`'], correct: 2, why: 'Всё, что внутри приостановилось, приходит позже, а до этого показывается `fallback`.' },
        { q: 'Как Vue 3 стримит асинхронный компонент внутри `Suspense`?', options: ['Заглушка сначала, контент потом', 'Ждёт его на месте, по порядку', 'Отдаёт его отдельным запросом', 'Рендерит только в браузере'], correct: 1, why: 'Vue стримит в порядке документа, и заглушка `Suspense` в HTML не попадает.' },
        { q: 'Для кого нужен `onAllReady`?', options: ['Для поисковых роботов и SSG', 'Для старых браузеров', 'Для мобильных устройств', 'Для ускорения TTFB'], correct: 0, why: 'Он ждёт весь контент, когда поток не нужен: роботам и статической генерации.' },
        { q: 'Товара нет, но выяснилось это после отправки оболочки. Что не получится?', options: ['Показать текст ошибки', 'Залогировать ошибку', 'Отправить остаток потока', 'Поставить статус `404`'], correct: 3, why: 'Статус и заголовки уходят с первым байтом; важное проверяют до оболочки.' },
      ],
      en: [
        { q: 'What sets the stream boundaries in React?', options: ['Routes', '`useEffect` hooks', 'Suspense boundaries', 'The `async` attribute'], correct: 2, why: 'Whatever suspended inside arrives later, and the `fallback` is shown until then.' },
        { q: 'How does Vue 3 stream an async component inside `Suspense`?', options: ['Fallback first, content later', 'Waits for it in place, in order', 'Sends it as a separate request', 'Renders it only in the browser'], correct: 1, why: 'Vue streams in document order, and the Suspense fallback never reaches the HTML.' },
        { q: 'Who needs `onAllReady`?', options: ['Search crawlers and SSG', 'Old desktop browsers', 'Slow mobile devices', 'Getting a faster TTFB'], correct: 0, why: 'It waits for all content when a stream is not needed: for crawlers and static generation.' },
        { q: 'The product does not exist, but that turned out after the shell was sent. What is impossible now?', options: ['Showing an error text', 'Logging the error', 'Sending the rest of the stream', 'Setting the `404` status'], correct: 3, why: 'Status and headers leave with the first byte; check what matters before the shell.' },
      ],
    },
    sources: [
      react('renderToReadableStream', 'reference/react-dom/server/renderToReadableStream'),
      react('Suspense', 'reference/react/Suspense'),
      src('vuejs.org: Server-side rendering API', 'https://vuejs.org/api/ssr.html'),
      next('Streaming', 'docs/app/guides/streaming'),
      webdev,
    ],
    verified,
  },
  {
    id: 'render-static',
    track: 'rendering',
    emoji: '🧊',
    minutes: 13,
    title: { ru: 'SSG, ISR и частичный пререндер', en: 'SSG, ISR and partial prerendering' },
    summary: {
      ru: 'Статическая генерация и её ограничения, ISR как stale-while-revalidate, перестройка по событию, частичный пререндер на prerender и resume, Cache Components в Next.js 16.4.',
      en: 'Static generation and its limits, ISR as stale-while-revalidate, rebuilding on events, partial prerendering with prerender and resume, Cache Components in Next.js 16.4.',
    },
    quiz: {
      ru: [
        { q: 'Когда ISR перестраивает страницу со сроком 60 секунд?', options: ['Каждые 60 секунд по таймеру', 'При каждом новом запросе', 'По запросу после истечения срока', 'Только при новой сборке'], correct: 2, why: 'Это stale-while-revalidate: тот, кто пришёл после срока, получает старую версию, следующий новую.' },
        { q: 'Как показать новую цену сразу после правки в CMS?', options: ['Перестройка по событию', 'Уменьшить срок до 1 с', 'Отключить CDN', 'Перейти на CSR'], correct: 0, why: 'Вебхук CMS вызывает `revalidateTag` или `revalidatePath`, срок остаётся страховкой.' },
        { q: 'Что возвращает `prerender` из `react-dom/static` после `abort()`?', options: ['Только ошибку', 'Готовый HTML всей страницы', 'Поток RSC', '`prelude` и `postponed`'], correct: 3, why: 'Оболочку с заглушками и описание дыр, которые `resume` дорендерит при запросе.' },
        { q: 'Что в Next.js 16 должно быть внутри `Suspense` при Cache Components?', options: ['Всё статическое содержимое', 'Чтение данных запроса без кэша', 'Все клиентские компоненты', 'Только картинки и шрифты'], correct: 1, why: 'Так Next.js знает, где кончается статическая оболочка; иначе сборка сообщит об ошибке.' },
      ],
      en: [
        { q: 'When does ISR rebuild a page with a 60-second period?', options: ['Every 60 s on a timer', 'On every single request', 'On a request after it expires', 'Only on a new build'], correct: 2, why: 'It is stale-while-revalidate: whoever comes after the period gets the old version, the next one the new.' },
        { q: 'How do you show a new price right after a CMS edit?', options: ['Rebuild on an event', 'Shorten the period to 1 s', 'Turn off the CDN', 'Switch to CSR'], correct: 0, why: 'A CMS webhook calls `revalidateTag` or `revalidatePath`, and the period stays as insurance.' },
        { q: 'What does `prerender` from `react-dom/static` return after `abort()`?', options: ['Only an error object', 'The full page HTML', 'An RSC stream of the page', '`prelude` and `postponed`'], correct: 3, why: 'The shell with placeholders and a description of the holes that `resume` finishes at request time.' },
        { q: 'What must be inside Suspense with Cache Components in Next.js 16?', options: ['All the static content', 'Uncached request data reads', 'All client components', 'Only images and fonts'], correct: 1, why: 'That is how Next.js knows where the static shell ends; otherwise the build reports an error.' },
      ],
    },
    sources: [
      next('Incremental Static Regeneration', 'docs/app/guides/incremental-static-regeneration'),
      next('Caching (Cache Components)', 'docs/app/getting-started/caching'),
      next('Next.js 16.4', 'blog/next-16-4'),
      react('prerender', 'reference/react-dom/static/prerender'),
      react('resume', 'reference/react-dom/server/resume'),
      src('nuxt.com: Hybrid rendering', 'https://nuxt.com/docs/4.x/guide/concepts/rendering'),
    ],
    verified,
  },
  {
    id: 'render-less-js',
    track: 'rendering',
    emoji: '🏝️',
    minutes: 14,
    title: { ru: 'Меньше JavaScript: острова и не только', en: 'Less JavaScript: islands and more' },
    summary: {
      ru: 'Выборочная, ленивая и частичная гидратация, острова Astro и серверные острова, ленивая гидратация во Vue и Nuxt, инкрементальная в Angular, возобновляемость Qwik, Server Components.',
      en: 'Selective, lazy and partial hydration, Astro islands and server islands, lazy hydration in Vue and Nuxt, incremental hydration in Angular, Qwik resumability, Server Components.',
    },
    quiz: {
      ru: [
        { q: 'Сколько JavaScript получает компонент Astro без директивы `client:*`?', options: ['Весь код компонента', 'Только обработчики', 'Нисколько', 'Код после простоя'], correct: 2, why: 'Без директивы компонент рендерится в HTML и CSS, JavaScript удаляется.' },
        { q: 'Что откладывает `hydrateOnInteraction` во Vue 3.5?', options: ['Выполнение и гидратацию', 'Только загрузку кода', 'Серверный рендер', 'Загрузку стилей'], correct: 0, why: 'Код загружается сразу, а `setup` и гидратация ждут первого взаимодействия.' },
        { q: 'Что сериализует Qwik в HTML?', options: ['Стек вызовов и промисы', 'Весь бандл приложения', 'Только стили CSS', 'Состояние и обработчики'], correct: 3, why: 'Код обработчика загружается при первом событии, а стек вызовов не сохраняется.' },
        { q: 'Чем Server Components отличаются от SSR?', options: ['Работают только при сборке', 'Их код не попадает в бандл', 'Не умеют грузить данные', 'Это одно и то же'], correct: 1, why: 'SSR превращает в HTML всё дерево, которое потом гидратируется; серверные компоненты не гидратируются вовсе.' },
      ],
      en: [
        { q: 'How much JavaScript does an Astro component without a `client:*` directive get?', options: ['All of its code', 'Only the handlers', 'None', 'The code after idle'], correct: 2, why: 'Without a directive the component renders to HTML and CSS, and the JavaScript is removed.' },
        { q: 'What does `hydrateOnInteraction` in Vue 3.5 defer?', options: ['Execution and hydration', 'Only the code download', 'Server rendering', 'Loading styles'], correct: 0, why: 'The code loads at once, while `setup` and hydration wait for the first interaction.' },
        { q: 'What does Qwik serialize into the HTML?', options: ['The call stack, promises', 'The whole app bundle', 'Only the CSS styles', 'State and handler refs'], correct: 3, why: "A handler's code loads on the first event, and the call stack is not saved." },
        { q: 'How do Server Components differ from SSR?', options: ['They run only at build time', 'Their code skips the bundle', 'They cannot load data', 'They are the same thing'], correct: 1, why: 'SSR turns the whole tree into HTML that then hydrates; server components are not hydrated at all.' },
      ],
    },
    sources: [
      src('docs.astro.build: Islands architecture', 'https://docs.astro.build/en/concepts/islands/'),
      src('docs.astro.build: Server islands', 'https://docs.astro.build/en/guides/server-islands/'),
      src('vuejs.org: Lazy hydration', 'https://vuejs.org/guide/components/async.html#lazy-hydration'),
      src('angular.dev: Incremental hydration', 'https://angular.dev/guide/incremental-hydration'),
      src('qwik.dev: Resumable', 'https://qwik.dev/docs/concepts/resumable/'),
      react('Server Components', 'reference/rsc/server-components'),
    ],
    verified,
  },
  {
    id: 'render-frameworks',
    track: 'rendering',
    emoji: '🧩',
    minutes: 11,
    title: { ru: 'Метафреймворки и edge', en: 'Meta-frameworks and the edge' },
    summary: {
      ru: 'Что делает метафреймворк, режим на маршрут в Next.js, Nuxt, Angular, SvelteKit, React Router и Astro, как они грузят данные, edge-рендер и его ловушка, proxy.ts в Next.js 16.',
      en: 'What a meta-framework does, a mode per route in Next.js, Nuxt, Angular, SvelteKit, React Router and Astro, how they load data, edge rendering and its trap, proxy.ts in Next.js 16.',
    },
    quiz: {
      ru: [
        { q: 'Как в Nuxt отключить серверный рендер для `/account/**`?', options: ['`{ prerender: false }`', '`{ isr: 0 }`', '`{ swr: false }`', '`{ ssr: false }`'], correct: 3, why: 'Правило маршрута `ssr: false` делает этот раздел клиентским.' },
        { q: 'Какой режим Angular рендерит HTML при сборке?', options: ['`RenderMode.Prerender`', '`RenderMode.Server`', '`RenderMode.Client`', '`RenderMode.Static`'], correct: 0, why: '`Prerender` при сборке, `Server` на запрос, `Client` как SPA; `Static` не существует.' },
        { q: 'Когда edge-рендер медленнее сервера рядом с базой?', options: ['Для простых редиректов', 'Для страниц из кэша edge', 'При запросах к далёкой базе', 'Для A/B-тестов на edge'], correct: 2, why: 'Каждый запрос к базе в другом регионе добавляет задержку, и они умножаются.' },
        { q: 'Как называется в Next.js 16 бывший `middleware.ts`?', options: ['`edge.ts`', '`proxy.ts`', '`gateway.ts`', '`router.ts`'], correct: 1, why: 'Соглашение `middleware` устарело и переименовано в `proxy`, назначение прежнее.' },
      ],
      en: [
        { q: 'How do you turn off server rendering for `/account/**` in Nuxt?', options: ['`{ prerender: false }`', '`{ isr: 0 }`', '`{ swr: false }`', '`{ ssr: false }`'], correct: 3, why: 'The `ssr: false` route rule makes that section client-side.' },
        { q: 'Which Angular mode renders HTML at build time?', options: ['`RenderMode.Prerender`', '`RenderMode.Server`', '`RenderMode.Client`', '`RenderMode.Static`'], correct: 0, why: '`Prerender` at build, `Server` per request, `Client` as an SPA; `Static` does not exist.' },
        { q: 'When is edge rendering slower than a server next to the database?', options: ['For simple redirects', 'For pages from the cache', 'With queries to a distant DB', 'For A/B tests at the edge'], correct: 2, why: 'Every query to a database in another region adds latency, and they multiply.' },
        { q: 'What is the former `middleware.ts` called in Next.js 16?', options: ['`edge.ts`', '`proxy.ts`', '`gateway.ts`', '`router.ts`'], correct: 1, why: 'The `middleware` convention is deprecated and renamed to `proxy`, with the same purpose.' },
      ],
    },
    sources: [
      next('proxy.js', 'docs/app/api-reference/file-conventions/proxy'),
      src('nuxt.com: Hybrid rendering', 'https://nuxt.com/docs/4.x/guide/concepts/rendering'),
      src('angular.dev: Server-side and hybrid rendering', 'https://angular.dev/guide/ssr'),
      src('svelte.dev: Page options', 'https://svelte.dev/docs/kit/page-options'),
      src('reactrouter.com: Pre-rendering', 'https://reactrouter.com/how-to/pre-rendering'),
    ],
    verified,
  },
  {
    id: 'render-choosing',
    track: 'rendering',
    emoji: '🧭',
    minutes: 11,
    title: { ru: 'Как выбрать стратегию', en: 'How to choose a strategy' },
    summary: {
      ru: 'Порядок рассуждения, что видит поисковый робот и бот превью, мягкий 404 в SPA, влияние на Core Web Vitals, сценарии от блога до дашборда, ответ на собеседовании.',
      en: 'The order of reasoning, what a search crawler and a preview bot see, the soft 404 in SPAs, impact on Core Web Vitals, scenarios from a blog to a dashboard, an interview answer.',
    },
    quiz: {
      ru: [
        { q: 'Где должны быть теги `og:title` и `og:image`?', options: ['В ответе сервера', 'В бандле приложения', 'В `localStorage`', 'В манифесте PWA'], correct: 0, why: 'Боты превью ссылок обычно читают только первый HTML и не выполняют JavaScript.' },
        { q: 'Что такое мягкий 404 в SPA?', options: ['Ошибка сборки проекта', 'Медленный ответ сервера', 'Статус `200` вместо `404`', 'Пустой бандл после сборки'], correct: 2, why: 'Сервер SPA отдаёт оболочку на любой адрес, и робот считает страницу нормальной.' },
        { q: 'Что чаще всего портит INP у страницы с SSR?', options: ['Медленный TTFB', 'Тяжёлая гидратация', 'Картинки без `alt`', 'Шрифты с CDN'], correct: 1, why: 'Страница видна, но гидратация занимает главный поток, и ввод обрабатывается с задержкой.' },
        { q: 'Что разумно для личного кабинета за логином?', options: ['SSG', 'ISR', 'Частичный пререндер', 'CSR'], correct: 3, why: 'SEO не нужно, много интерактива и данных пользователя.' },
      ],
      en: [
        { q: 'Where must the `og:title` and `og:image` tags be?', options: ['In the server response', 'In the app bundle', 'In `localStorage`', 'In the PWA manifest'], correct: 0, why: 'Link preview bots usually read only the first HTML and do not run JavaScript.' },
        { q: 'What is a soft 404 in an SPA?', options: ['An error during the build', 'A slow server response', 'Status `200` instead of `404`', 'An empty JS bundle'], correct: 2, why: 'The SPA server sends the shell for any URL, and a crawler treats the page as normal.' },
        { q: 'What most often hurts INP on an SSR page?', options: ['A slow TTFB', 'Heavy hydration', 'Images without `alt`', 'Fonts from a CDN'], correct: 1, why: 'The page is visible, but hydration holds the main thread, and input is handled late.' },
        { q: 'What makes sense for an account area behind a login?', options: ['SSG', 'ISR', 'Partial prerendering', 'CSR'], correct: 3, why: 'No SEO needed, lots of interactivity and user data.' },
      ],
    },
    sources: [
      src('Google Search Central: JavaScript SEO basics', 'https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics'),
      webdev,
      src('web.dev: Web Vitals', 'https://web.dev/articles/vitals'),
      src('web.dev: Interaction to Next Paint', 'https://web.dev/articles/inp'),
    ],
    verified,
  },
]

export const renderingModule: Module = {
  track: 'rendering',
  lessons: renderingLessons.map((l) => l.id),
  exam: {
    pass: 0.75,
    questions: {
      ru: [
        { q: 'Какая стратегия строит HTML на каждый запрос?', options: ['SSG', 'ISR', 'SSR', 'CSR'], correct: 2, why: 'SSR рендерит на сервере при каждом запросе; SSG и ISR заранее, CSR в браузере.' },
        { q: 'Почему SSR не ускоряет интерактивность?', options: ['Гидратация выполняет тот же JS', 'Сервер отдаёт неполный HTML', 'Браузер не кэширует HTML', 'Нет поддержки событий'], correct: 0, why: 'Чтобы ожить, страница скачивает и выполняет код компонентов, как при CSR.' },
        { q: 'Что нельзя делать на сервере при рендере?', options: ['Читать cookie запроса', 'Ставить статус ответа', 'Грузить данные параллельно', 'Читать `localStorage`'], correct: 3, why: 'На сервере нет `localStorage` и `window`; браузерные API читают после гидратации.' },
        { q: 'Как безопасно положить данные в `<script>` на странице?', options: ['`JSON.stringify` без изменений', 'Экранировать `<` как `\\u003c`', 'Обернуть в комментарий', 'Закодировать в URL'], correct: 1, why: 'Без `<` строка не закроет тег `script`; это делают `devalue` и фреймворки.' },
        { q: 'Что значит несовпадение при гидратации?', options: ['Сервер не ответил вовремя', 'Бандл не загрузился в браузер', 'Клиент отрендерил другой HTML', 'Стили сервера не совпали'], correct: 2, why: 'Первый рендер в браузере должен совпасть с серверным HTML.' },
        { q: 'Что делает `use(browser())` в React 19.3?', options: ['Не рендерит часть на сервере', 'Проверяет тип браузера', 'Включает режим SPA целиком', 'Загружает нужные полифилы'], correct: 0, why: 'На сервере компонент приостанавливается, и в HTML попадает заглушка ближайшего `Suspense`.' },
        { q: 'Как React отправляет медленный блок при стриминге?', options: ['Ждёт его на месте', 'Отдельным HTTP-запросом', 'Через отдельный WebSocket', 'Позже, на место заглушки'], correct: 3, why: 'Скрытый `<div>` и встроенный скрипт переносят контент туда, где стояла заглушка.' },
        { q: 'Чем выборочная гидратация отличается от частичной?', options: ['Ничем, это синонимы', 'Гидратирует всё, но по частям', 'Не гидратирует статику', 'Работает только во Vue'], correct: 1, why: 'Выборочная (React) оживляет всю страницу по границам; частичная (острова) часть не гидратирует никогда.' },
        { q: 'Что получит посетитель, пришедший сразу после истечения срока ISR?', options: ['Новую версию', 'Ошибку `503`', 'Старую версию', 'Пустую страницу'], correct: 2, why: 'Старая версия отдаётся сразу, новая строится в фоне для следующих.' },
        { q: 'Что такое частичный пререндер?', options: ['Оболочка заранее, дыры на запрос', 'Пререндер половины страниц', 'SSG без стилей и скриптов', 'Гидратация страницы по частям'], correct: 0, why: 'Оболочка строится заранее и идёт с CDN, персональные части рендерятся при запросе в том же ответе.' },
        { q: 'Что откладывает инкрементальная гидратация Angular, кроме выполнения?', options: ['Серверный рендер', 'Загрузку CSS', 'Запросы к API', 'Загрузку кода блока'], correct: 3, why: 'Блок `@defer (hydrate on ...)` это отдельный чанк, он скачивается только по триггеру.' },
        { q: 'Какой HTML нельзя класть в общий кэш CDN?', options: ['Статью из блога компании', 'HTML с именем пользователя', 'Страницу документации', 'Маркетинговый лендинг'], correct: 1, why: 'Персональный HTML из общего кэша увидят другие пользователи.' },
        { q: 'Что видит бот превью ссылки у страницы на чистом CSR?', options: ['Полный контент', 'Картинку товара', 'Пустую оболочку', 'Ошибку CORS'], correct: 2, why: 'Боты превью обычно не выполняют JavaScript.' },
        { q: 'Что разумно для каталога магазина из 50 тысяч товаров?', options: ['ISR или частичный пререндер', 'Только CSR в браузере', 'SSR без всякого кэша', 'Пересборка на каждый заказ'], correct: 0, why: 'Страницы на CDN, перестройка по сроку и событию, персональное в динамических частях.' },
      ],
      en: [
        { q: 'Which strategy builds HTML on every request?', options: ['SSG', 'ISR', 'SSR', 'CSR'], correct: 2, why: 'SSR renders on the server for every request; SSG and ISR ahead of time, CSR in the browser.' },
        { q: 'Why does SSR not speed up interactivity?', options: ['Hydration runs the same JS', 'The server sends partial HTML', 'Browsers do not cache HTML', 'Events are not supported'], correct: 0, why: 'To come alive, the page downloads and runs the component code, as with CSR.' },
        { q: 'What must you not do on the server during render?', options: ['Read request cookies', 'Set the response status', 'Load data in parallel', 'Read `localStorage`'], correct: 3, why: 'There is no `localStorage` or `window` on the server; browser APIs are read after hydration.' },
        { q: 'How do you safely put data into a `<script>` on the page?', options: ['Plain `JSON.stringify`', 'Escape `<` as `\\u003c`', 'Wrap it in a comment', 'URL-encode it'], correct: 1, why: 'Without `<` the string cannot close the script tag; `devalue` and frameworks do this.' },
        { q: 'What does a hydration mismatch mean?', options: ['The server did not answer', 'The bundle did not load', 'The client rendered other HTML', 'The server styles differed'], correct: 2, why: 'The first render in the browser must match the server HTML.' },
        { q: 'What does `use(browser())` do in React 19.3?', options: ['Skips a part on the server', 'Checks the browser type', 'Turns on SPA mode', 'Loads polyfills'], correct: 0, why: 'On the server the component suspends, and the nearest Suspense fallback goes into the HTML.' },
        { q: 'How does React send a slow block when streaming?', options: ['Waits for it in place', 'In a separate HTTP request', 'Over a separate WebSocket', 'Later, into the placeholder'], correct: 3, why: 'A hidden `<div>` and an inline script move the content where the placeholder stood.' },
        { q: 'How does selective hydration differ from partial hydration?', options: ['No difference', 'It hydrates all, in parts', 'It skips static parts', 'It works only in Vue'], correct: 1, why: 'Selective (React) brings the whole page to life by boundaries; partial (islands) never hydrates some parts.' },
        { q: 'What does a visitor who comes right after the ISR period expires get?', options: ['The new version', 'A `503` error', 'The old version', 'An empty page'], correct: 2, why: 'The old version is served at once, the new one is built in the background for later visitors.' },
        { q: 'What is partial prerendering?', options: ['A static shell, holes per request', 'Prerendering half of the pages', 'SSG without styles or scripts', 'Hydrating the page in parts'], correct: 0, why: 'The shell is built ahead and comes from a CDN, personal parts render per request in the same response.' },
        { q: 'Besides execution, what does Angular incremental hydration defer?', options: ['Server-side rendering', 'Loading the CSS', 'Sending API requests', "Loading the block's code"], correct: 3, why: 'An `@defer (hydrate on ...)` block is a separate chunk downloaded only on the trigger.' },
        { q: 'Which HTML must not go into a shared CDN cache?', options: ['A company blog post', "A page with the user's name", 'A documentation page', 'A marketing landing page'], correct: 1, why: 'Personal HTML from a shared cache would be seen by other users.' },
        { q: 'What does a link preview bot see on a pure CSR page?', options: ['The full content', 'The product image', 'An empty shell', 'A CORS error'], correct: 2, why: 'Preview bots usually do not run JavaScript.' },
        { q: 'What makes sense for a shop catalog of 50 thousand products?', options: ['ISR or partial prerendering', 'CSR only, in the browser', 'SSR with no cache at all', 'A rebuild on every order'], correct: 0, why: 'Pages on a CDN, rebuilt after a period and on events, personal data in dynamic parts.' },
      ],
    },
  },
}
