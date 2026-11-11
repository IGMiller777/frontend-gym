# Аудит заметок: API и realtime

Источники в Notion: блок «Rest/GraphQl/WebSocket/WebRTC» на корневой странице «Frontend (1)» (пустой), раздел «Server Interaction» страницы «React» (Working with API, Mock servers, WebSockets with React; прочитан целиком), разделы «Server Side Events», «Content Delivery» и «gRPC vs REST» страницы «Browser» (прочитаны целиком; ошибки SSE о лимите соединений, Streams и поле `data:` уже записаны в `network.md`), разделы «I — Interface (API)», «API Design», «Interface definition (API) + payloads», «Optimizations + deep dive» и «Edge cases» страницы «System Design». Раздел HttpClient и интерсепторов Angular разобран в треке Angular (`ng-app`), загрузка данных в React в `react-data`, серверный кэш в треке `state`.

Утверждения сверены с developer.mozilla.org, спецификациями WHATWG (Server-sent events, WebSockets), RFC 6455, RFC 9110, RFC 9457, черновиком IETF Idempotency-Key, спецификациями GraphQL и GraphQL over HTTP, graphql.org, trpc.io, grpc.io, connectrpc.com, mswjs.io, angular.dev, react.dev, vuejs.org, reactrouter.com, nextjs.org. Все примеры уроков выполняются в CI в Node.js 24 на версиях из таблицы ниже.

## Актуальные версии (ноябрь 2026)

| Пакет | Версия | Что важно |
|---|---|---|
| `msw` | 3.0 (сентябрь 2026) | Импорт из подпутей `msw/http`, `msw/graphql`, `msw/ws`, `msw/sse`; GraphQL через `graphql.link(url)`; `onUnhandledRequest` переименован в `onUnhandledFrame`; Node.js 22+; плагин `msw/vite` вместо копирования `mockServiceWorker.js` |
| `graphql` (graphql-js) | 17.1 | Эталонная реализация спецификации; `graphql()`, `buildSchema`, директивы `@defer` и `@stream` в экспериментальном режиме |
| `dataloader` | 2.2 | Группировка загрузок одного тика в один запрос и кэш на запрос |
| `@trpc/server`, `@trpc/client` | 11.x | `initTRPC`, `createCallerFactory`, валидация входа Standard Schema (Zod 4), подписки через SSE (`httpSubscriptionLink`) |
| `@apollo/client` | 4.3 | Нормализованный `InMemoryCache` по `__typename` и `id` |
| `ws` | 8.22 | WebSocket-сервер для Node.js; клиент `WebSocket` встроен в Node.js с версии 22 |
| `zod` | 4.6 | Проверка ответа сервера во время выполнения |
| Браузеры | | `WebSocket`, `EventSource` везде; `WebTransport` Baseline с марта 2026; `WebSocketStream` нестандартный, только Chromium |

## Найденные ошибки

| Где | В заметках | На самом деле | Источник |
|---|---|---|---|
| React, Working with API | Пример «TanStack Query» с `createApi({ queries, mutations })` и `userApi.endpoints.getUser.useQuery(id)` | Такого API в TanStack Query нет: это смесь с RTK Query. В TanStack Query `useQuery({ queryKey, queryFn })`, `queryOptions` и `useMutation` с `invalidateQueries` | [TanStack Query: Queries](https://tanstack.com/query/latest/docs/framework/react/guides/queries) |
| React, Working with API | Запрос в `useEffect` даёт «двойные запросы на SSR» | Эффекты на сервере не выполняются вовсе: данных нет в HTML, загрузка начинается только после гидратации. Двойной запрос бывает в разработке из-за `StrictMode` | [react.dev: useEffect](https://react.dev/reference/react/useEffect#fetching-data-with-effects) |
| React, Working with API | `invalidatesTags: ['User']` в мутации RTK Query | Без `tagTypes` в `createApi` и `providesTags` у запроса инвалидация ничего не перезагрузит | [RTK Query: Automated re-fetching](https://redux-toolkit.js.org/rtk-query/usage/automated-refetching) |
| React, Working with API | Загрузчик React Router возвращает `defer({ user, posts })` | `defer` удалён в React Router 7: загрузчик возвращает объект с промисами, `<Await>` и `Suspense` работают с ними напрямую; проверено по пакету 8.5 | [React Router: Streaming with Suspense](https://reactrouter.com/how-to/suspense) |
| React, Working with API | Next.js: `params: { id: string }` и `fetch('/api/users/…')` в серверном компоненте | С Next.js 15 `params` это промис (`await params`); относительный адрес в серверном `fetch` не работает, серверный компонент читает данные напрямую, а не через свой же API | [Next.js: page.js](https://nextjs.org/docs/app/api-reference/file-conventions/page) |
| React, Working with API | «TanStack Query в 90 % новых проектов», «MSW в 98 %» | Статистика без источника | |
| React, Mock servers | Импорт `http, HttpResponse` из `msw`, `graphql.query('GetUser')`, `onUnhandledRequest` | В MSW 3 подпути `msw/http`, `msw/graphql`, GraphQL через `graphql.link(url).query(...)`, опция `onUnhandledFrame`; проверено запуском | [MSW: Migrating to 3.x](https://mswjs.io/docs/migrations/2.x-to-3.x) |
| React, Mock servers | `delay(2000)` без `await`, `graphql` не импортирован | Без `await` задержки нет; без импорта пример не запустится | [MSW: delay](https://mswjs.io/docs/api/delay) |
| React, Mock servers | MSW «100 % совпадает с реальным API» | Обработчики пишутся вручную и расходятся с API; совпадение даёт генерация из OpenAPI или контрактные тесты | [MSW: Philosophy](https://mswjs.io/docs/philosophy) |
| React, Mock servers | `json-server --watch db.json`, фильтр `?name=John` | json-server 1.0 (beta) следит за файлом без флага, фильтры в виде `?name:eq=John`, пагинация `_page` и `_per_page` | README json-server 1.0.0-beta.15 |
| React, WebSockets | Socket.IO «легаси» | Socket.IO 4.8 развивается; это свой протокол поверх WebSocket (комнаты, подтверждения, переподключение), с обычным WebSocket-сервером не совместим | [socket.io: What Socket.IO is not](https://socket.io/docs/v4/#what-socketio-is-not) |
| React, WebSockets | `new WebSocket()` в `useEffect` «антипаттерн», кастомный хук «приемлемо» | Хук сам создаёт сокет в `useEffect`; проблема не в месте, а в отсутствии очистки, переподключения с паузой и общего соединения | [react.dev: Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects) |
| React, WebSockets | Хук `useWebSocket`: `close()` в очистке, переподключение в `onclose` | `close()` при размонтировании вызывает `onclose`, и хук переподключается к уже ненужному адресу; бесконечный цикл после ухода со страницы; проверено запуском (`api-websocket`) | [MDN: WebSocket close event](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/close_event) |
| React, WebSockets | Ping/Pong «браузер и сервер шлют автоматически» | Браузер только отвечает Pong на Ping сервера; из JavaScript ping не отправить. Обрыв на клиенте обнаруживают сообщениями-heartbeat приложения | [RFC 6455, 5.5.2](https://www.rfc-editor.org/rfc/rfc6455#section-5.5.2), [MDN: WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) |
| React, WebSockets | «SSE + fallback на WS: современный подход для 80 % кейсов», задержки «< 50 мс», «10–30 мс» | Цифры без источника. Выбор транспорта зависит от направления данных: см. урок `api-polling-sse` | |
| Browser, SSE | Пример: две строки `data:` с двумя JSON в одном событии | Строки `data:` одного события склеиваются через `\n`: получится одна строка из двух JSON, `JSON.parse` упадёт; проверено запуском (`api-polling-sse`) | [HTML: Server-sent events](https://html.spec.whatwg.org/multipage/server-sent-events.html#event-stream-interpretation) |
| Browser, SSE | Без заголовков в `EventSource` «используют параметры URL» для аутентификации | Токен в адресе попадает в журналы сервера и прокси; используют cookie (`withCredentials`) или поток через `fetch` с заголовком `Authorization` | [MDN: EventSource()](https://developer.mozilla.org/en-US/docs/Web/API/EventSource/EventSource) |
| Browser, gRPC vs REST | Только ссылки на AWS и Yandex | Браузер не может вызывать gRPC напрямую (нет доступа к HTTP/2-трейлерам): нужен gRPC-Web через прокси или протокол Connect | [gRPC: gRPC-Web](https://grpc.io/docs/platforms/web/), [Connect](https://connectrpc.com/docs/introduction) |
| System Design, Interface | GraphQL: «кеш сложнее (нет URL)» | HTTP-кэш действительно не работает с POST, но клиенты держат нормализованный кэш, а persisted queries по GET кэшируются CDN | [graphql.org: Caching](https://graphql.org/learn/caching/) |

## Покрытие заметок Notion

| Тема в заметках | Где разобрано |
|---|---|
| REST: ресурсы, методы, идемпотентность, overfetch и underfetch | `api-rest` |
| Пагинация, курсоры, `nextCursor` | `api-rest#Пагинация` |
| Плоский или вложенный ответ, полное или дельта-обновление | `api-design` |
| GraphQL: запрос ровно нужных полей, один запрос вместо N | `api-graphql` |
| Проблема N+1 на сервере | `api-graphql#N+1 и DataLoader` |
| Кэш GraphQL | `api-graphql#Кэш и запросы по HTTP` |
| Apollo Server, Apollo Client, URQL, TanStack Query с GraphQL | `api-graphql` |
| tRPC | `api-rpc#tRPC` |
| gRPC против REST | `api-rpc#gRPC` |
| Ошибки сети, идемпотентность, повторы с экспоненциальной паузой | `api-client` |
| Отмена устаревших запросов (`AbortController`) | `api-client#Обёртка над fetch и классы ошибок`, `api-design#Пример: автодополнение` |
| Работа с API в React: useEffect, TanStack Query, RTK Query, загрузчики, серверные компоненты | `react-data` (трек React), `state-server`, `api-client` |
| Mock servers: MSW, json-server, Mockoon, WireMock | `api-mocking` |
| Polling, long polling, Push | `api-polling-sse` |
| Server-Sent Events: формат, `Last-Event-ID`, `retry`, ограничения | `api-polling-sse` |
| Потоковая выдача ответа LLM | `api-polling-sse#Ограничения EventSource и поток через fetch` |
| WebSocket: кейсы, рукопожатие, фреймы, ping/pong, коды закрытия | `api-websocket` |
| Переподключение и heartbeat | `api-websocket#Переподключение` |
| Хук `useWebSocket`, связка с Zustand | `api-realtime-frameworks` |
| Socket.IO, Ably, Pusher, Supabase Realtime | `api-websocket#Библиотеки и сервисы` |
| WebRTC | `api-webrtc` |
| API Design на собеседовании: контракт, механика обновлений, ошибки | `api-design` |

Добавлено сверх заметок, потому что об этом спрашивают: Problem Details (RFC 9457) и версионирование API, GraphQL over HTTP и коды ответа, persisted queries, подписки GraphQL, OpenAPI и генерация типов, проверка ответа Zod, обновление токена при 401 одним запросом, ключ идемпотентности, тесты с MSW в Vitest, WebSocket в Angular (`rxjs/webSocket`) и Vue (VueUse), WebTransport.
