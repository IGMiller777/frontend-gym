# Аудит заметок: Браузер

Источник: страница Notion «Browser», прочитана целиком (около 85 тысяч знаков): этапы отрисовки, critical render path, FMP и TTI, кэширование и 304, Server-Sent Events, потоковая доставка, DOM (создание, изменение, обход, свойства, Shadow DOM), SSR, Streaming SSR, гидратация, Pointer Events, Custom Events, `preventDefault` и `stopPropagation`, пассивные обработчики, Mutation-, Intersection-, Resize- и PerformanceObserver, управление фокусом, gRPC против REST, различия браузера и Node.js, инструменты доступности, скринридеры, landmark-роли. Дополнительно учтены ошибки о рендеринге из раздела EventLoop страницы «JS» (см. `js-async.md`).

Уроки трека `browser` покрывают рендеринг, DOM, события, layout и paint, наблюдатели и Web Components. Ошибки из разделов о сети, SSR и доступности записаны здесь, а исправляться будут в треках `network`, `rendering`, `react`, `html` и `api`: в колонке «Трек» указано, где.

Примеры уроков с DOM и событиями выполняются в jsdom (блоки ` ```js dom `), и их вывод сверяется с текстом урока в CI.

## Найденные ошибки

| Трек | В заметках | На самом деле | Источник |
|---|---|---|---|
| browser | Метрики FMP и TTI как цель оптимизации | FMP объявлен устаревшим в Lighthouse 6, TTI удалён в Lighthouse 10; актуальны LCP, CLS, INP | [Chrome: Time to Interactive](https://developer.chrome.com/docs/lighthouse/performance/interactive), [web.dev: Web Vitals](https://web.dev/articles/vitals) |
| browser, network | HTTP/2 Server Push для ускорения | Удалён из Chrome; вместо него `preload` и `103 Early Hints` | [Chrome: Removing HTTP/2 Server Push](https://developer.chrome.com/blog/removing-push) |
| browser | Обработчики событий «обычно всплывают (кроме focus)» | Не всплывают и `blur`, `mouseenter`, `mouseleave`, `load` у ресурсов и другие | [MDN: Event bubbling](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling) |
| browser | `return false` = `preventDefault` + `stopPropagation` «в inline-обработчиках и jQuery» | В обработчиках-атрибутах и свойствах `onclick` это только отмена действия по умолчанию; оба действия делает лишь jQuery | [HTML: event handler processing](https://html.spec.whatwg.org/multipage/webappapis.html#the-event-handler-processing-algorithm), проверено в jsdom |
| browser | `bubbles: true` в `CustomEvent` с комментарием «bubbling через границы Shadow DOM» | Через границу теневого дерева событие проходит только с `composed: true` | [MDN: Event.composed](https://developer.mozilla.org/en-US/docs/Web/API/Event/composed), проверено в jsdom |
| browser | `preventDefault()` на Pointer Events «отключает эмуляцию для чистой обработки» | Отменяет совместимые mouse-события, но не `click`; прокрутку жестами отключают CSS-свойством `touch-action` | [MDN: Pointer events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events) |
| browser | Closed Shadow DOM: «shadowRoot недоступен даже автору компонента» | `attachShadow` возвращает корень, автор хранит ссылку; `el.shadowRoot` равен `null` только для внешнего кода | [MDN: Element.attachShadow()](https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow), проверено в jsdom |
| browser | Стили внутри Shadow DOM «не перебиваются внешними, кроме :host, ::part, custom properties» | Внутрь проходят ещё и наследуемые свойства (`color`, `font-family`) | [MDN: Using shadow DOM](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM) |
| browser | `innerHTML` «может перезагружать события» | `innerHTML` пересоздаёт узлы: обработчики на старых дочерних элементах теряются | [MDN: innerHTML](https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML) |
| browser | MutationObserver «не блокирует основной поток» | Колбэк выполняется в главном потоке, микрозадачей после текущего кода | [MDN: MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver), проверено в jsdom |
| browser | Все три наблюдателя «работают после layout» | Это верно для ResizeObserver; MutationObserver вызывается микрозадачей и не связан с layout | там же; [MDN: ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) |
| browser | ResizeObserver: «нет опций в observe(), box задаётся в конструкторе» | Наоборот: `observe(el, { box })`, у конструктора опций нет | [MDN: ResizeObserver.observe()](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver/observe) |
| browser | `observe({ entryTypes: [...], buffered: true })` | `buffered` работает только с опцией `type`; с `entryTypes` игнорируется | [MDN: PerformanceObserver.observe()](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver/observe) |
| browser | Фазы event loop браузера: timers, pending callbacks, idle/prepare, poll, check, close | Это фазы libuv в Node.js; у браузера по спецификации HTML очереди задач, микрозадачи и шаг отрисовки | [HTML: Event loops](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops) |
| browser | В браузере `require('fs')` и `import … from 'fs'` дают `SyntaxError` | `require` не определён: `ReferenceError`; импорт `fs` падает на разрешении модуля (`TypeError`) | проверено в браузере |
| browser | `Buffer.from` в браузере «работает, но по-разному» | `Buffer` в браузере не определён | [Node.js: Buffer](https://nodejs.org/api/buffer.html) |
| browser | Node «эмулирует browser APIs: npm i node-fetch» | `fetch` встроен в Node.js (стабилен с 21) | [Node.js: fetch](https://nodejs.org/api/globals.html#fetch) |
| browser | Таблица: память Node «Unlimited», браузер «Single thread», время старта 50–200 мс | Куча V8 ограничена (`--max-old-space-size`); в браузере есть Web Workers; цифры без источника | [Node.js: --max-old-space-size](https://nodejs.org/api/cli.html#--max-old-space-sizesize-in-mib) |
| html | `tabindex="0"` «фокусируется после нативных элементов» | Элементы с `tabindex="0"` идут в общем порядке документа вместе с нативными | [MDN: tabindex](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/tabindex) |
| html | Модалка через `div` с ручной ловушкой фокуса как основной способ | Нативный `<dialog>` с `showModal()` делает фон инертным, закрывается по Esc и возвращает фокус | [MDN: dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog) |
| html | «NVDA: aria-hidden блокирует Tab» | `aria-hidden` не убирает элемент из порядка Tab; фокусируемое внутри `aria-hidden` это ошибка доступности | [MDN: aria-hidden](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-hidden) |
| html | `<header>` «только один на body», `nav` внутри `main` «плохо» | `header` становится landmark `banner` только вне `article`, `section` и т. п., таких `header` может быть много; `nav` внутри `main` допустим | [MDN: header](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/header) |
| html | Поиск: `<form role="search">` | Есть элемент `<search>` | [MDN: search](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/search) |
| html | Различия NVDA и VoiceOver (VoiceOver «игнорирует tabindex=0», «предпочитает aria-label») | Источник не указан, утверждения не подтверждены документацией; в урок не берутся | — |
| network | SSE: ограничение «обычно 6» соединений с домена | 6 это лимит HTTP/1.1; по HTTP/2 соединения мультиплексируются (по умолчанию до 100 потоков) | [MDN: EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource) |
| network | Fetch + Streams «только HTTP/2+» | Потоковое чтение ответа работает и по HTTP/1.1 | [MDN: Using readable streams](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams) |
| react, rendering | Vue 3: `createApp(App).$mount('#app')` для гидратации | В Vue 3 `createSSRApp(App).mount('#app')`; `$mount` из Vue 2 | [Vue: SSR, client hydration](https://vuejs.org/guide/scaling-up/ssr.html#client-hydration) |
| angular, rendering | `bootstrapApplication(AppComponent, { hydration: true })` | Гидратация включается провайдером `provideClientHydration()` | [Angular: Hydration](https://angular.dev/guide/hydration) |
| react, rendering | При несовпадении React «полностью отбрасывает серверный HTML и рендерит всё дерево» | React перерисовывает на клиенте до ближайшей границы `Suspense` (или корня) | [React: hydrateRoot](https://react.dev/reference/react-dom/client/hydrateRoot) |
| react, rendering | `onAllReady` «fallback для старых браузеров» | `onAllReady` нужен для поисковых роботов и статической генерации: ждёт весь контент | [React: renderToPipeableStream](https://react.dev/reference/react-dom/server/renderToPipeableStream) |
| rendering | Streaming SSR снижает perceived load «на 30–50%», «Safari хуже поддерживает» | Источников нет; в уроки не берутся | — |

## Пробелы, закрытые в уроках

- Блокировка рендеринга: CSS против скриптов, `defer`, `async`, модули; preload scanner; `preload`, `preconnect`, `fetchpriority`, `loading="lazy"`.
- Живые и статические коллекции, `DocumentFragment`, `<template>`, атрибуты против свойств, `dataset`.
- `target` против `currentTarget`, делегирование через `closest`, `dispatchEvent` и `defaultPrevented`, опции `once` и `signal`, `setPointerCapture`, `touch-action`.
- Какие свойства запускают layout и paint, принудительный layout, `contain`, `content-visibility`, причины CLS.
- Общая схема наблюдателей, `contentBoxSize`, ошибка цикла ResizeObserver, container queries, `web-vitals`.
- Custom Elements и жизненный цикл, слоты, `::part`, `:host`, `composedPath()`, Declarative Shadow DOM, `ElementInternals`.
