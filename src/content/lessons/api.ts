import type { Source } from '../sources'
import type { Lesson, Module } from './types'

const src = (title: string, url: string): Source => ({ title, url, kind: 'official' })
const spec = (title: string, url: string): Source => ({ title, url, kind: 'spec' })
const mdn = (title: string, path: string) => src(`MDN: ${title}`, `https://developer.mozilla.org/en-US/docs/${path}`)
const msw = (title: string, path: string) => src(`mswjs.io: ${title}`, `https://mswjs.io/docs/${path}`)
const tanstack = (title: string, path: string) => src(`tanstack.com: ${title}`, `https://tanstack.com/query/latest/docs/${path}`)
const verified = { date: '2026-11', version: 'MSW 3.0, graphql-js 17.1, tRPC 11, ws 8.22, Zod 4.6, Node.js 24' }

export const apiLessons: Lesson[] = [
  {
    id: 'api-rest',
    track: 'api',
    emoji: '🧱',
    minutes: 13,
    title: { ru: 'REST: ресурсы, ошибки, пагинация', en: 'REST: resources, errors, pagination' },
    summary: {
      ru: 'Ресурсы и адреса, идемпотентность методов на живом API, коды ответа, Problem Details, пагинация смещением и курсором, версионирование и OpenAPI.',
      en: 'Resources and URLs, method idempotency on a live API, status codes, Problem Details, offset and cursor pagination, versioning and OpenAPI.',
    },
    quiz: {
      ru: [
        { q: 'Какой метод создаст дубль, если запрос повторить после таймаута?', options: ['`PUT /todos/1`', '`DELETE /todos/1`', '`POST /todos`', '`GET /todos`'], correct: 2, why: '`POST` не идемпотентен: каждый вызов создаёт новый ресурс. `PUT` и `DELETE` оставляют то же состояние.' },
        { q: 'Второй `DELETE` того же ресурса вернул `404`. Он идемпотентен?', options: ['Да, состояние то же', 'Нет, ответ другой', 'Только с `If-Match`', 'Только по HTTP/2'], correct: 0, why: 'Идемпотентность про состояние сервера: ресурса нет после первого и после второго запроса.' },
        { q: 'Пользователь листает ленту, сверху появляются новые посты. Какая пагинация не даст дублей?', options: ['`?page=2`', '`?offset=20`', '`?limit=20` без всего', '`?after=<курсор>`'], correct: 3, why: 'Курсор указывает на конкретный элемент, а смещение считает позиции, которые сдвинулись от вставки.' },
        { q: 'Что такое `application/problem+json`?', options: ['Стандартное тело ошибки', 'Формат JSON Patch', 'Тип ответа GraphQL', 'Схема OpenAPI'], correct: 0, why: 'Problem Details (RFC 9457): поля `type`, `title`, `status`, `detail`, `instance` для любых ошибок API.' },
      ],
      en: [
        { q: 'Which method creates a duplicate if retried after a timeout?', options: ['`PUT /todos/1`', '`DELETE /todos/1`', '`POST /todos`', '`GET /todos`'], correct: 2, why: '`POST` is not idempotent: every call creates a new resource. `PUT` and `DELETE` leave the same state.' },
        { q: 'A second `DELETE` of the same resource returned `404`. Is it idempotent?', options: ['Yes, the state is the same', 'No, the response differs', 'Only with `If-Match`', 'Only over HTTP/2'], correct: 0, why: 'Idempotency is about server state: the resource is gone after the first and after the second request.' },
        { q: 'A user scrolls a feed while new posts appear on top. Which pagination gives no duplicates?', options: ['`?page=2`', '`?offset=20`', '`?limit=20` alone', '`?after=<cursor>`'], correct: 3, why: 'A cursor points at a specific item, while an offset counts positions that shifted after the insert.' },
        { q: 'What is `application/problem+json`?', options: ['A standard error body', 'The JSON Patch format', 'A GraphQL response type', 'An OpenAPI schema'], correct: 0, why: 'Problem Details (RFC 9457): `type`, `title`, `status`, `detail`, `instance` fields for any API error.' },
      ],
    },
    sources: [
      mdn('HTTP request methods', 'Web/HTTP/Reference/Methods'),
      spec('RFC 9110: Idempotent methods', 'https://www.rfc-editor.org/rfc/rfc9110#name-idempotent-methods'),
      spec('RFC 9457: Problem Details for HTTP APIs', 'https://www.rfc-editor.org/rfc/rfc9457'),
      mdn('HTTP response status codes', 'Web/HTTP/Reference/Status'),
      tanstack('Infinite queries', 'framework/react/guides/infinite-queries'),
      src('OpenAPI: Getting started', 'https://learn.openapis.org/'),
    ],
    verified,
  },
  {
    id: 'api-graphql',
    track: 'api',
    emoji: '🕸️',
    minutes: 15,
    title: { ru: 'GraphQL', en: 'GraphQL' },
    summary: {
      ru: 'Схема и операции, запрос нужных полей, частичные ошибки, резолверы, N+1 и DataLoader, фрагменты, GraphQL over HTTP, persisted queries, нормализованный кэш, подписки.',
      en: 'Schema and operations, asking for exact fields, partial errors, resolvers, N+1 and DataLoader, fragments, GraphQL over HTTP, persisted queries, a normalized cache, subscriptions.',
    },
    quiz: {
      ru: [
        { q: 'Резолвер поля `avatarUrl` бросил ошибку. Что получит клиент?', options: ['Только `errors`, без `data`', 'Статус `500` с пустым телом', '`data` с `null` и `errors`', 'Пустой объект `data: {}`'], correct: 2, why: 'Упавшее поле становится `null`, ошибка приходит в `errors` с путём, остальные данные на месте.' },
        { q: 'Что решает DataLoader?', options: ['Кэш на CDN', 'N+1 запросов к базе', 'Проверку схемы', 'Подписки по WebSocket'], correct: 1, why: 'Он собирает `load()` одного тика в один пакетный запрос и убирает повторы ключей.' },
        { q: 'Сервер ответил `200`. Можно ли считать запрос успешным?', options: ['Да, статус всё решает', 'Да, если это мутация', 'Да, если запрос по `GET`', 'Нет, проверить `errors`'], correct: 3, why: 'С `application/json` многие серверы отвечают `200` и на ошибки: смотреть нужно поле `errors`.' },
        { q: 'Как нормализованный кэш узнаёт, что два ответа про одного пользователя?', options: ['По `__typename` и `id`', 'По тексту запроса', 'По адресу запроса', 'По имени операции'], correct: 0, why: 'Записи кэша имеют ключ `User:1`, и мутация, вернувшая `User` с `id`, обновляет его везде.' },
      ],
      en: [
        { q: 'The `avatarUrl` resolver threw. What does the client get?', options: ['Only `errors`, no `data`', 'Status `500` with an empty body', '`data` with `null` and `errors`', 'An empty `data` object `{}`'], correct: 2, why: 'The failed field becomes `null`, the error arrives in `errors` with a path, the rest of the data is there.' },
        { q: 'What does DataLoader solve?', options: ['CDN caching', 'N+1 database queries', 'Schema validation', 'WebSocket subscriptions'], correct: 1, why: 'It collects the `load()` calls of one tick into one batch query and removes duplicate keys.' },
        { q: 'The server answered `200`. Can the request be considered successful?', options: ['Yes, the status decides', 'Yes, if it is a mutation', 'Yes, if it went over `GET`', 'No, check `errors`'], correct: 3, why: 'With `application/json` many servers answer `200` even to errors: look at the `errors` field.' },
        { q: 'How does a normalized cache know two responses are about one user?', options: ['By `__typename` and `id`', 'By the query text', 'By the request URL', 'By the operation name'], correct: 0, why: 'Cache entries are keyed `User:1`, and a mutation that returns a `User` with an `id` updates it everywhere.' },
      ],
    },
    sources: [
      src('graphql.org: Learn', 'https://graphql.org/learn/'),
      src('graphql.org: Execution', 'https://graphql.org/learn/execution/'),
      src('graphql.org: Performance (N+1, DataLoader)', 'https://graphql.org/learn/performance/'),
      src('graphql.org: Caching', 'https://graphql.org/learn/caching/'),
      spec('GraphQL over HTTP (working draft)', 'https://http-spec.graphql.org/draft/'),
      src('Apollo Client: Caching overview', 'https://www.apollographql.com/docs/react/caching/overview'),
    ],
    verified,
  },
  {
    id: 'api-rpc',
    track: 'api',
    emoji: '📞',
    minutes: 11,
    title: { ru: 'tRPC, gRPC и выбор стиля API', en: 'tRPC, gRPC and choosing an API style' },
    summary: {
      ru: 'RPC против REST, tRPC с типами без генерации и пакетными запросами, gRPC и Protobuf, gRPC-Web и Connect в браузере, сравнение REST, GraphQL, tRPC и gRPC.',
      en: 'RPC versus REST, tRPC with types without codegen and batched requests, gRPC and Protobuf, gRPC-Web and Connect in the browser, comparing REST, GraphQL, tRPC and gRPC.',
    },
    quiz: {
      ru: [
        { q: 'Откуда клиент tRPC знает типы процедур?', options: ['Из сгенерированного SDK', 'Из файла `.proto`', 'Из типа `AppRouter`', 'Из схемы OpenAPI'], correct: 2, why: 'Клиент импортирует только тип роутера: `createTRPCClient<AppRouter>`, генерации кода нет.' },
        { q: 'Зачем tRPC схема Zod на входе, если есть типы?', options: ['Типов нет при выполнении', 'Для генерации типов', 'Для HTTP-кэша', 'Для пакетных запросов'], correct: 0, why: 'Типы стираются при сборке; проверку данных от клиента делает схема во время выполнения.' },
        { q: 'Почему браузер не вызывает gRPC-сервис напрямую?', options: ['Нет поддержки формата JSON', 'Не видно HTTP/2-трейлеров', 'Это запрещает политика CORS', 'Браузер не умеет TLS 1.3'], correct: 1, why: 'gRPC передаёт статус в трейлерах, а `fetch` их не отдаёт; поэтому gRPC-Web через прокси или Connect.' },
        { q: 'Публичный API для внешних партнёров. Что разумнее всего?', options: ['tRPC', 'gRPC без прокси', 'Свой протокол', 'REST и OpenAPI'], correct: 3, why: 'Партнёрам нужен контракт, не зависящий от языка, с привычным HTTP и кэшем.' },
      ],
      en: [
        { q: 'Where does a tRPC client get the procedure types from?', options: ['A generated SDK', 'A `.proto` file', 'The `AppRouter` type', 'An OpenAPI schema'], correct: 2, why: 'The client imports only the router type: `createTRPCClient<AppRouter>`, there is no code generation.' },
        { q: 'Why does tRPC need a Zod input schema if there are types?', options: ['Types vanish at runtime', 'To generate types', 'For the HTTP cache', 'For batched requests'], correct: 0, why: 'Types are erased at build time; checking the client data is the schema\'s job at runtime.' },
        { q: 'Why can a browser not call a gRPC service directly?', options: ['JSON is not supported', 'HTTP/2 trailers are hidden', 'The CORS policy forbids it', 'Browsers lack TLS 1.3'], correct: 1, why: 'gRPC sends the status in trailers, and `fetch` does not expose them; hence gRPC-Web through a proxy or Connect.' },
        { q: 'A public API for external partners. What is the most sensible choice?', options: ['tRPC', 'gRPC with no proxy', 'A custom protocol', 'REST and OpenAPI'], correct: 3, why: 'Partners need a language-independent contract with familiar HTTP and caching.' },
      ],
    },
    sources: [
      src('trpc.io: Introduction', 'https://trpc.io/docs'),
      src('trpc.io: HTTP Batch Link', 'https://trpc.io/docs/client/links/httpBatchLink'),
      src('grpc.io: Introduction to gRPC', 'https://grpc.io/docs/what-is-grpc/introduction/'),
      src('grpc.io: gRPC-Web', 'https://grpc.io/docs/platforms/web/'),
      src('connectrpc.com: Introduction', 'https://connectrpc.com/docs/introduction'),
      src('protobuf.dev: Overview', 'https://protobuf.dev/overview/'),
    ],
    verified,
  },
  {
    id: 'api-client',
    track: 'api',
    emoji: '🧰',
    minutes: 14,
    title: { ru: 'Клиентский слой API', en: 'The client API layer' },
    summary: {
      ru: 'Обёртка над fetch, виды ошибок, таймауты через AbortSignal, проверка ответа Zod, какие запросы повторять, ключ идемпотентности, обновление токена одним запросом, интерсепторы и OpenAPI.',
      en: 'A fetch wrapper, error kinds, timeouts with AbortSignal, checking responses with Zod, which requests to retry, an idempotency key, single-flight token refresh, interceptors and OpenAPI.',
    },
    quiz: {
      ru: [
        { q: 'Что сделает `fetch`, если сервер ответил `500`?', options: ['Отклонит промис с ошибкой', 'Бросит `TypeError` сразу', 'Повторит запрос три раза', 'Вернёт ответ, `ok: false`'], correct: 3, why: '`fetch` отклоняется только при сетевой ошибке; статус проверяют через `res.ok`.' },
        { q: 'Какой запрос можно повторить автоматически после таймаута?', options: ['`GET` или `POST` с ключом', '`POST` без ключа', 'Любой с `4xx`', 'Отменённый пользователем'], correct: 0, why: 'Повторяют идемпотентные запросы; `POST` становится безопасным с ключом идемпотентности.' },
        { q: 'Три запроса одновременно получили `401`. Сколько запросов на обновление токена нужно?', options: ['Три, по одному на каждый', 'Один общий', 'Ни одного, сразу на вход', 'Два, второй про запас'], correct: 1, why: 'Single flight: первый `401` создаёт промис обновления, остальные ждут его же.' },
        { q: 'Зачем проверять ответ схемой, если есть типы TypeScript?', options: ['Чтобы ускорить разбор JSON', 'Чтобы сжать тело ответа', 'Типов нет при выполнении', 'Чтобы работал HTTP-кэш'], correct: 2, why: 'Переименованное на сервере поле иначе дойдёт до интерфейса как `undefined`.' },
      ],
      en: [
        { q: 'What does `fetch` do when the server answers `500`?', options: ['Rejects the promise with an error', 'Throws a `TypeError` at once', 'Retries the request 3 times', 'Returns a response, `ok: false`'], correct: 3, why: '`fetch` rejects only on a network error; the status is checked through `res.ok`.' },
        { q: 'Which request can be retried automatically after a timeout?', options: ['`GET` or `POST` with a key', '`POST` with no key', 'Any with a `4xx`', 'One the user cancelled'], correct: 0, why: 'Idempotent requests are retried; a `POST` becomes safe with an idempotency key.' },
        { q: 'Three requests got `401` at once. How many token refresh requests are needed?', options: ['Three, one for each', 'One shared', 'None, go to sign-in', 'Two, one spare'], correct: 1, why: 'Single flight: the first `401` creates the refresh promise, the others await the same one.' },
        { q: 'Why check a response with a schema if there are TypeScript types?', options: ['To parse JSON faster', 'To compress the body', 'Types vanish at runtime', 'So the HTTP cache works'], correct: 2, why: 'Otherwise a field renamed on the server reaches the UI as `undefined`.' },
      ],
    },
    sources: [
      mdn('Response.ok', 'Web/API/Response/ok'),
      mdn('AbortSignal.timeout()', 'Web/API/AbortSignal/timeout_static'),
      mdn('AbortSignal.any()', 'Web/API/AbortSignal/any_static'),
      spec('IETF draft: The Idempotency-Key HTTP header', 'https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/'),
      src('angular.dev: Interceptors', 'https://angular.dev/guide/http/interceptors'),
      src('zod.dev', 'https://zod.dev/'),
      tanstack('Important defaults', 'framework/react/guides/important-defaults'),
    ],
    verified,
  },
  {
    id: 'api-mocking',
    track: 'api',
    emoji: '🎭',
    minutes: 12,
    title: { ru: 'Моки API: MSW', en: 'Mocking APIs: MSW' },
    summary: {
      ru: 'Мок на уровне сети против подмены модуля, MSW 3 в браузере и Node.js, обработчики для тестов, замена ответа в одном тесте, мок WebSocket, моки и контракт, другие инструменты.',
      en: 'Network-level mocking versus module substitution, MSW 3 in the browser and Node.js, handlers for tests, overriding a response in one test, mocking WebSocket, mocks and the contract, other tools.',
    },
    quiz: {
      ru: [
        { q: 'Чем мок на уровне сети лучше, чем `vi.mock(\'./api\')`?', options: ['Работает без Node.js', 'Тест проверяет и сам запрос', 'Не нужны обработчики', 'Он быстрее выполняется'], correct: 1, why: 'Код приложения настоящий: проверяются адрес, заголовки, разбор ответа и обработка ошибок.' },
        { q: 'Как в одном тесте вернуть ошибку, не ломая остальные тесты?', options: ['Изменить общий обработчик', 'Выключить MSW на время теста', '`server.use` и `resetHandlers`', 'Перезапустить `setupServer`'], correct: 2, why: '`server.use` добавляет обработчик поверх общих, `resetHandlers` после теста его убирает.' },
        { q: 'Как называется опция для запросов без обработчика в MSW 3?', options: ['`onUnhandledFrame`', '`onUnhandledRequest`', '`onBypass`', '`strict`'], correct: 0, why: 'В MSW 3 `onUnhandledRequest` переименован в `onUnhandledFrame` и охватывает WebSocket.' },
        { q: 'Главная слабость ручных моков?', options: ['Тесты с ними медленные', 'Нет поддержки GraphQL', 'Не запускаются в CI', 'Расходятся с настоящим API'], correct: 3, why: 'Помогают генерация из OpenAPI, типизация обработчиков, проверка ответа схемой и контрактные тесты.' },
      ],
      en: [
        { q: 'Why is network-level mocking better than `vi.mock(\'./api\')`?', options: ['It works without Node.js', 'The test checks the request too', 'No handlers are needed', 'It is noticeably faster to run'], correct: 1, why: 'The application code is real: the URL, headers, response parsing and error handling are checked.' },
        { q: 'How do you return an error in one test without breaking the others?', options: ['Edit the shared handler file', 'Turn MSW off for that test', '`server.use` and `resetHandlers`', 'Restart the `setupServer`'], correct: 2, why: '`server.use` adds a handler on top of the shared ones, `resetHandlers` removes it after the test.' },
        { q: 'What is the option for requests without a handler called in MSW 3?', options: ['`onUnhandledFrame`', '`onUnhandledRequest`', '`onBypass`', '`strict`'], correct: 0, why: 'In MSW 3 `onUnhandledRequest` was renamed to `onUnhandledFrame` and covers WebSocket.' },
        { q: 'The main weakness of hand-written mocks?', options: ['They make tests slow', 'They lack GraphQL support', 'They fail to run in CI', 'They drift from the real API'], correct: 3, why: 'Generation from OpenAPI, typed handlers, schema checks of responses and contract tests help.' },
      ],
    },
    sources: [
      msw('Introduction', ''),
      msw('Migrating from 2.x to 3.x', 'migrations/2.x-to-3.x'),
      msw('Mocking WebSocket', 'websocket/'),
      msw('Philosophy', 'philosophy'),
      src('vitest.dev: Mocking', 'https://vitest.dev/guide/mocking'),
      src('angular.dev: Testing HTTP requests', 'https://angular.dev/guide/http/testing'),
      src('playwright.dev: Mock APIs', 'https://playwright.dev/docs/mock'),
    ],
    verified,
  },
  {
    id: 'api-polling-sse',
    track: 'api',
    emoji: '📡',
    minutes: 13,
    title: { ru: 'Опрос, long polling и SSE', en: 'Polling, long polling and SSE' },
    summary: {
      ru: 'Способы доставки обновлений, опрос с ETag и 304, длинный опрос, формат text/event-stream, EventSource, Last-Event-ID, поток через fetch для ответов LLM, ограничения.',
      en: 'Ways to deliver updates, polling with ETag and 304, long polling, the text/event-stream format, EventSource, Last-Event-ID, streaming through fetch for LLM answers, limits.',
    },
    quiz: {
      ru: [
        { q: 'В одном событии SSE две строки `data:` с двумя JSON. Что получит `onmessage`?', options: ['Два отдельных события', 'Только первую строку', 'Строки через перевод строки', 'Ошибку разбора потока'], correct: 2, why: 'Строки `data:` одного события склеиваются через `\\n`, и такой текст `JSON.parse` не разберёт.' },
        { q: 'Что отправит `EventSource` при переподключении?', options: ['`Last-Event-ID`', '`If-None-Match`', '`Retry-After`', '`Authorization`'], correct: 0, why: 'Браузер присылает последний полученный `id`, и сервер может отдать пропущенные события.' },
        { q: 'Нужен поток ответа LLM на `POST` с заголовком `Authorization`. Что использовать?', options: ['`EventSource` с токеном', 'Длинный опрос по `GET`', 'WebTransport по HTTP/3', '`fetch` и разбор потока'], correct: 3, why: '`EventSource` умеет только `GET` без своих заголовков; поток читают через `fetch` с буфером строк.' },
        { q: 'Когда ограничение в 6 соединений мешает SSE?', options: ['Всегда', 'Только по HTTP/1.1', 'Только по HTTP/3', 'Только с cookie'], correct: 1, why: 'Лимит 6 на домен действует для HTTP/1.1; по HTTP/2 потоки идут через одно соединение.' },
      ],
      en: [
        { q: 'One SSE event has two `data:` lines with two JSON objects. What does `onmessage` get?', options: ['Two separate events', 'Only the first data line', 'The lines joined by a newline', 'A stream parse error'], correct: 2, why: 'The `data:` lines of one event are joined with `\\n`, and `JSON.parse` cannot parse such text.' },
        { q: 'What does `EventSource` send when reconnecting?', options: ['`Last-Event-ID`', '`If-None-Match`', '`Retry-After`', '`Authorization`'], correct: 0, why: 'The browser sends the last `id` received, and the server can send the missed events.' },
        { q: 'You need an LLM answer stream for a `POST` with an `Authorization` header. What do you use?', options: ['`EventSource` with a token', 'Long polling over `GET`', 'WebTransport over HTTP/3', '`fetch` and stream parsing'], correct: 3, why: '`EventSource` can only `GET` without custom headers; the stream is read through `fetch` with a line buffer.' },
        { q: 'When does the 6-connection limit hurt SSE?', options: ['Always', 'Only over HTTP/1.1', 'Only over HTTP/3', 'Only with cookies'], correct: 1, why: 'The limit of 6 per domain applies to HTTP/1.1; over HTTP/2 streams share one connection.' },
      ],
    },
    sources: [
      mdn('Using server-sent events', 'Web/API/Server-sent_events/Using_server-sent_events'),
      mdn('EventSource', 'Web/API/EventSource'),
      spec('HTML: Server-sent events', 'https://html.spec.whatwg.org/multipage/server-sent-events.html'),
      mdn('Using readable streams', 'Web/API/Streams_API/Using_readable_streams'),
      tanstack('useQuery: refetchInterval', 'framework/react/reference/useQuery'),
    ],
    verified,
  },
  {
    id: 'api-websocket',
    track: 'api',
    emoji: '🔁',
    minutes: 16,
    title: { ru: 'WebSocket', en: 'WebSocket' },
    summary: {
      ru: 'Рукопожатие на живом сервере, фреймы, ping и pong, коды закрытия, авторизация и Origin, ошибка хука из заметок, переподключение с паузой, heartbeat, потеря сообщений, протокол, масштабирование, Socket.IO.',
      en: 'The handshake on a live server, frames, ping and pong, close codes, auth and Origin, the bug in the hook from the notes, reconnecting with a pause, a heartbeat, lost messages, a protocol, scaling, Socket.IO.',
    },
    quiz: {
      ru: [
        { q: 'Что сервер отвечает на рукопожатие WebSocket?', options: ['`200 OK` с телом JSON', '`204 No Content`', '`101 Switching Protocols`', '`426 Upgrade Required`'], correct: 2, why: 'Ответ `101` с `Sec-WebSocket-Accept`, и то же соединение дальше передаёт фреймы.' },
        { q: 'Как клиенту заметить «мёртвое» соединение?', options: ['Своими сообщениями ping', 'Методом `ws.ping()`', 'По `bufferedAmount`', 'Никак, браузер сообщит'], correct: 0, why: 'В API браузера нет `ping()`, а обрыв без фрейма `close` может долго оставаться незамеченным.' },
        { q: 'Что значит код закрытия `1006`?', options: ['Нормальное закрытие', 'Сообщение слишком большое', 'Сервер перезапускается', 'Обрыв без фрейма `close`'], correct: 3, why: 'Код никто не отправляет, его только наблюдают в `onclose`; это повод переподключиться.' },
        { q: 'Почему серверу WebSocket нужно проверять `Origin`?', options: ['Этого требует протокол TLS', 'CORS на сокеты не действует', 'Иначе сервер не вернёт `101`', 'Для сжатия сообщений'], correct: 1, why: 'Cookie уходят в рукопожатии с любой страницы: без проверки чужой сайт откроет сокет от имени пользователя.' },
      ],
      en: [
        { q: 'What does the server answer to a WebSocket handshake?', options: ['`200 OK` with a JSON body', '`204 No Content`', '`101 Switching Protocols`', '`426 Upgrade Required`'], correct: 2, why: 'A `101` response with `Sec-WebSocket-Accept`, and the same connection then carries frames.' },
        { q: 'How can a client notice a "dead" connection?', options: ['With its own ping messages', 'With `ws.ping()`', 'From `bufferedAmount`', 'It cannot, the browser tells'], correct: 0, why: 'The browser API has no `ping()`, and a drop without a `close` frame can go unnoticed for a long time.' },
        { q: 'What does close code `1006` mean?', options: ['A normal, clean closure', 'The message is too big', 'The server is restarting', 'A drop without a `close` frame'], correct: 3, why: 'Nobody sends this code, it is only observed in `onclose`; it is a reason to reconnect.' },
        { q: 'Why must a WebSocket server check `Origin`?', options: ['The TLS protocol requires it', 'CORS does not cover sockets', 'Otherwise there is no `101`', 'For message compression'], correct: 1, why: 'Cookies go into the handshake from any page: without the check, a foreign site opens a socket as the user.' },
      ],
    },
    sources: [
      mdn('The WebSocket API', 'Web/API/WebSockets_API'),
      mdn('WebSocket.close()', 'Web/API/WebSocket/close'),
      spec('RFC 6455: The WebSocket Protocol', 'https://www.rfc-editor.org/rfc/rfc6455'),
      mdn('WebSocketStream', 'Web/API/WebSocketStream'),
      src('socket.io: Introduction', 'https://socket.io/docs/v4/'),
    ],
    verified,
  },
  {
    id: 'api-realtime-frameworks',
    track: 'api',
    emoji: '⚡',
    minutes: 13,
    title: { ru: 'Realtime в React, Angular и Vue', en: 'Realtime in React, Angular and Vue' },
    summary: {
      ru: 'Одно соединение и подписки по темам, useSyncExternalStore, события в кэше TanStack Query, RxJS webSocket с multiplex, retry и repeat, toSignal, composable и VueUse.',
      en: 'One connection and topic subscriptions, useSyncExternalStore, events in the TanStack Query cache, RxJS webSocket with multiplex, retry and repeat, toSignal, a composable and VueUse.',
    },
    quiz: {
      ru: [
        { q: 'Как React-компоненту читать данные из общего сокета?', options: ['`useState` и `useEffect`', '`useSyncExternalStore`', '`useMemo`', '`useLayoutEffect`'], correct: 1, why: 'Официальный способ подписки на внешний источник без «разрыва» при конкурентном рендеринге.' },
        { q: 'Событие «заказ 7 изменился» без данных. Что сделать с кэшем TanStack Query?', options: ['`invalidateQueries`', '`setQueryData`', '`removeQueries`', '`resetQueries`'], correct: 0, why: 'Сигнал без данных: запрос перезапрашивается, если он на экране.' },
        { q: 'Сервер закрыл сокет кодом `1012`. Почему `retry` в RxJS не сработал?', options: ['Нужен ещё `catchError`', 'Код `1012` не поддержан', 'Поток завершён: нужен `repeat`', 'Не хватает оператора `share`'], correct: 2, why: 'Чистое закрытие завершает поток, `retry` ловит только ошибки.' },
        { q: 'Что делает `multiplex` у `WebSocketSubject`?', options: ['Открывает сокет на тему', 'Сжимает каждое сообщение', 'Повторяет при обрыве', 'Поток темы в общем сокете'], correct: 3, why: 'При подписке отправляет `subscribe`, при отписке `unsubscribe`, пропускает только свои сообщения.' },
      ],
      en: [
        { q: 'How should a React component read data from a shared socket?', options: ['`useState` and `useEffect`', '`useSyncExternalStore`', '`useMemo`', '`useLayoutEffect`'], correct: 1, why: 'The official way to subscribe to an external source without tearing during concurrent rendering.' },
        { q: 'An "order 7 changed" event without data. What do you do with the TanStack Query cache?', options: ['`invalidateQueries`', '`setQueryData`', '`removeQueries`', '`resetQueries`'], correct: 0, why: 'A signal without data: the query is refetched if it is on screen.' },
        { q: 'The server closed the socket with `1012`. Why did `retry` in RxJS not fire?', options: ['`catchError` is needed', 'The code `1012` is unsupported', 'It completed: use `repeat`', '`share` is needed too'], correct: 2, why: 'A clean close completes the stream, and `retry` catches only errors.' },
        { q: 'What does `multiplex` on a `WebSocketSubject` do?', options: ['Opens a socket per topic', 'Compresses every message', 'Retries after each drop', 'Topic stream on one socket'], correct: 3, why: 'It sends `subscribe` on subscription, `unsubscribe` on unsubscription, and passes only its own messages.' },
      ],
    },
    sources: [
      src('react.dev: useSyncExternalStore', 'https://react.dev/reference/react/useSyncExternalStore'),
      tanstack('QueryClient reference', 'reference/QueryClient'),
      src('rxjs.dev: webSocket', 'https://rxjs.dev/api/webSocket/webSocket'),
      src('angular.dev: RxJS interop with signals', 'https://angular.dev/ecosystem/rxjs-interop'),
      src('vueuse.org: useWebSocket', 'https://vueuse.org/core/useWebSocket/'),
      src('vuejs.org: onScopeDispose', 'https://vuejs.org/api/reactivity-advanced.html#onscopedispose'),
    ],
    verified,
  },
  {
    id: 'api-webrtc',
    track: 'api',
    emoji: '🎥',
    minutes: 12,
    title: { ru: 'WebRTC и WebTransport', en: 'WebRTC and WebTransport' },
    summary: {
      ru: 'Соединение браузеров напрямую, сигнализация, SDP и ICE, NAT, STUN и TURN, медиа и каналы данных, шифрование, mesh, SFU и MCU, WebTransport поверх HTTP/3.',
      en: 'Connecting browsers directly, signaling, SDP and ICE, NAT, STUN and TURN, media and data channels, encryption, mesh, SFU and MCU, WebTransport over HTTP/3.',
    },
    quiz: {
      ru: [
        { q: 'Кто передаёт предложение (SDP) от одного браузера другому?', options: ['STUN-сервер по UDP', 'Браузер сам, без сервера', 'Сигнализация приложения', 'TURN-сервер ретрансляции'], correct: 2, why: 'WebRTC не определяет сигнализацию: SDP и ICE-кандидаты передаёт приложение, обычно через WebSocket.' },
        { q: 'Зачем нужен TURN-сервер?', options: ['Ретранслировать трафик', 'Сообщать внешний адрес', 'Шифровать медиапотоки', 'Хранить записи звонков'], correct: 0, why: 'TURN ретранслирует весь трафик при симметричном NAT или закрытом UDP; внешний адрес сообщает STUN.' },
        { q: 'Конференция на 30 участников. Какая топология?', options: ['Mesh', 'Один TURN', 'Только каналы данных', 'SFU'], correct: 3, why: 'В mesh исходящий трафик растёт с каждым участником; SFU принимает один поток и пересылает его остальным.' },
        { q: 'Чем WebTransport отличается от WebRTC?', options: ['Работает без шифрования', 'Это клиент-сервер по HTTP/3', 'Только для видео', 'Нужна сигнализация'], correct: 1, why: 'WebTransport соединяет с сервером, как WebSocket, но поверх QUIC с потоками и датаграммами.' },
      ],
      en: [
        { q: 'Who delivers the offer (SDP) from one browser to the other?', options: ['A STUN server over UDP', 'The browser, on its own', "The app's signaling server", 'A relaying TURN server'], correct: 2, why: 'WebRTC does not define signaling: SDP and ICE candidates are delivered by the app, usually over WebSocket.' },
        { q: 'Why is a TURN server needed?', options: ['To relay the traffic', 'To report the public address', 'To encrypt media', 'To store call recordings'], correct: 0, why: 'TURN relays all traffic under symmetric NAT or blocked UDP; STUN reports the public address.' },
        { q: 'A conference with 30 participants. Which topology?', options: ['Mesh', 'A single TURN', 'Data channels only', 'SFU'], correct: 3, why: 'In mesh, outgoing traffic grows with every participant; an SFU takes one stream and forwards it to the others.' },
        { q: 'How does WebTransport differ from WebRTC?', options: ['It works without encryption', 'Client-server over HTTP/3', 'It is for video only', 'It needs signaling'], correct: 1, why: 'WebTransport connects to a server, like WebSocket, but over QUIC with streams and datagrams.' },
      ],
    },
    sources: [
      mdn('WebRTC API', 'Web/API/WebRTC_API'),
      mdn('Perfect negotiation', 'Web/API/WebRTC_API/Perfect_negotiation'),
      mdn('WebRTC protocols: ICE, STUN, TURN, SDP', 'Web/API/WebRTC_API/Protocols'),
      mdn('RTCDataChannel', 'Web/API/RTCDataChannel'),
      mdn('WebTransport API', 'Web/API/WebTransport_API'),
    ],
    verified,
  },
  {
    id: 'api-design',
    track: 'api',
    emoji: '🗺️',
    minutes: 14,
    title: { ru: 'API в frontend system design', en: 'API in frontend system design' },
    summary: {
      ru: 'Контракт, механика и отказы, точки входа для ленты с рядами, BFF и частичный отказ, автодополнение с задержкой, отменой и кэшем, дельта-обновления, работа без сети, ответ на собеседовании.',
      en: 'Contract, mechanics and failures, endpoints for a feed with rows, a BFF and partial failure, autocomplete with debounce, cancellation and a cache, delta updates, working offline, an interview answer.',
    },
    quiz: {
      ru: [
        { q: 'Фильм встречается в нескольких рядах. Какая форма ответа?', options: ['Вложенная копия в каждом ряду', 'Плоская: `itemIds` и словарь', 'Отдельный запрос на фильм', 'Строка CSV на каждый ряд'], correct: 1, why: 'Сущность хранится один раз, ряды ссылаются по id; одно обновление видно везде.' },
        { q: 'Сервис рекомендаций упал. Что должен вернуть BFF главной страницы?', options: ['Остальное и ошибку секции', 'Статус `503` на всю страницу', 'Пустой ответ', 'Повторять до успеха'], correct: 0, why: 'Секции независимы: частичный отказ описывают явно, страница работает без одной секции.' },
        { q: 'Зачем автодополнению отменять старый запрос?', options: ['Чтобы экономить трафик', 'Этого требует `fetch`', 'Чтобы работал кэш ответов', 'Старый ответ не заменит новый'], correct: 3, why: 'Медленный ответ на `am` пришёл бы позже ответа на `ams` и показал бы неправильные подсказки.' },
        { q: 'Клиент применяет дельта-события и видит пропуск номера `seq`. Что делать?', options: ['Не обращать внимания', 'Применить следующие события', 'Загрузить состояние заново', 'Закрыть соединение'], correct: 2, why: 'Пропуск значит потерю событий: надёжнее загрузить состояние целиком и продолжить с его версии.' },
      ],
      en: [
        { q: 'A title appears in several rows. Which response shape?', options: ['A nested copy in every row', 'Flat: `itemIds` and a dictionary', 'A separate request per title', 'A CSV string per row'], correct: 1, why: 'The entity is stored once and rows reference it by id; one update is visible everywhere.' },
        { q: 'The recommendations service is down. What should the home page BFF return?', options: ['The rest plus a section error', 'Status `503` for the whole page', 'An empty response', 'Retry until it succeeds'], correct: 0, why: 'Sections are independent: describe the partial failure explicitly, and the page works without one section.' },
        { q: 'Why does an autocomplete cancel the old request?', options: ["To save the server's traffic", '`fetch` requires it', 'So the cache works', 'An old answer must not win'], correct: 3, why: 'A slow `am` answer would arrive after the `ams` one and show the wrong suggestions.' },
        { q: 'The client applies delta events and sees a gap in `seq`. What now?', options: ['Ignore the gap', 'Apply the next ones', 'Refetch the full state', 'Close the connection'], correct: 2, why: 'A gap means lost events: it is safer to load the whole state and continue from its version.' },
      ],
    },
    sources: [
      mdn('Promise.allSettled()', 'Web/JavaScript/Reference/Global_Objects/Promise/allSettled'),
      mdn('combobox role', 'Web/Accessibility/ARIA/Reference/Roles/combobox_role'),
      tanstack('Network mode', 'framework/react/guides/network-mode'),
      mdn('Background Synchronization API', 'Web/API/Background_Synchronization_API'),
      mdn('AbortSignal.timeout()', 'Web/API/AbortSignal/timeout_static'),
    ],
    verified,
  },
]

export const apiModule: Module = {
  track: 'api',
  lessons: apiLessons.map((l) => l.id),
  exam: {
    pass: 0.75,
    questions: {
      ru: [
        { q: 'Какой из методов не идемпотентен?', options: ['`PUT`', '`DELETE`', '`GET`', '`POST`'], correct: 3, why: 'Повтор `POST` создаёт новый ресурс; остальные оставляют то же состояние сервера.' },
        { q: 'Что лучше для бесконечной ленты, где сверху появляются записи?', options: ['Курсор', 'Смещение', 'Номер страницы', 'Весь список'], correct: 0, why: 'Курсор продолжает с конкретного элемента, а смещение даёт дубли после вставок.' },
        { q: 'Как сервер GraphQL сообщает об ошибке одного поля?', options: ['Статусом `500`', '`null` в поле и `errors`', 'Пустым ответом', 'Заголовком `Warning`'], correct: 1, why: 'Остальные данные приходят, а ошибка указывает путь к полю.' },
        { q: 'Что объединяет DataLoader?', options: ['Ответы разных пользователей', 'Схемы нескольких сервисов', 'Загрузки одного тика в пакет', 'Подписки в один сокет'], correct: 2, why: 'Пакет на тик и кэш на запрос решают проблему N+1.' },
        { q: 'Когда tRPC подходит хуже всего?', options: ['Приложение на Next.js', 'Монорепозиторий на TS', 'Общий релизный цикл', 'Публичный API для партнёров'], correct: 3, why: 'Типы tRPC существуют только в TypeScript; внешним клиентам нужен языконезависимый контракт.' },
        { q: 'Что делает `AbortSignal.any([a, b])`?', options: ['Срабатывает с первым', 'Ждёт оба сигнала', 'Отменяет сразу оба', 'Ставит общий таймаут'], correct: 0, why: 'Объединяет отмену пользователем и таймаут: срабатывает тот, что раньше.' },
        { q: 'Как защитить повтор `POST /payments` от двойного списания?', options: ['Заменить на `PUT`', 'Ключом идемпотентности', 'Повтором через `GET`', 'Задержкой на сервере'], correct: 1, why: 'Сервер хранит результат по ключу и отвечает на повтор им же, не выполняя действие снова.' },
        { q: 'Что делает `server.resetHandlers()` в MSW?', options: ['Останавливает перехват', 'Удаляет общие обработчики', 'Убирает добавленные в тесте', 'Сбрасывает кэш fetch'], correct: 2, why: 'Обработчики из `server.use()` удаляются, общие остаются; тесты не влияют друг на друга.' },
        { q: 'Чем `EventSource` удобнее своего разбора потока через `fetch`?', options: ['Умеет `POST`', 'Позволяет свои заголовки', 'Передаёт двоичные данные', 'Сам переподключается'], correct: 3, why: 'Переподключение и `Last-Event-ID` встроены; зато `fetch` нужен для `POST` и `Authorization`.' },
        { q: 'Какой транспорт для статуса заказа, который меняется раз в несколько минут?', options: ['Опрос', 'WebSocket', 'WebRTC', 'WebTransport'], correct: 0, why: 'Редкие изменения только от сервера проще всего получать опросом с `ETag` и `304`.' },
        { q: 'Почему хук `useWebSocket` из заметок переподключался после размонтирования?', options: ['Не было сообщений heartbeat', '`onclose` ловил свой `close()`', 'Не хватало `useCallback`', 'Сервер присылал код `1012`'], correct: 1, why: 'Нужен флаг закрытия по своей инициативе и отмена таймера переподключения.' },
        { q: 'Сообщение отправлено сразу после обрыва, пока `readyState` ещё `OPEN`. Что с ним?', options: ['Ляжет в очередь', 'Бросит ошибку', 'Может пропасть', 'Придёт дважды'], correct: 2, why: 'WebSocket не гарантирует доставку между переподключениями: нужны `id` и подтверждения.' },
        { q: 'Что такое SFU в видеозвонках?', options: ['Сервер, смешивающий видео', 'Сервер обхода NAT', 'Протокол сигнализации', 'Сервер, пересылающий потоки'], correct: 3, why: 'SFU принимает один поток от участника и пересылает его остальным без перекодирования.' },
        { q: 'Что BFF делает с медленным сервисом при сборке экрана?', options: ['Таймаут и ошибка секции', 'Ждёт до конца', 'Повторяет запрос бесконечно', 'Отвечает `504` всему экрану'], correct: 0, why: 'У каждого запроса свой таймаут, частичный отказ описан явно, остальной экран работает.' },
      ],
      en: [
        { q: 'Which of these methods is not idempotent?', options: ['`PUT`', '`DELETE`', '`GET`', '`POST`'], correct: 3, why: 'A repeated `POST` creates a new resource; the others leave the same server state.' },
        { q: 'What is better for an infinite feed where entries appear on top?', options: ['A cursor', 'An offset', 'A page number', 'The whole list'], correct: 0, why: 'A cursor continues from a specific item, while an offset gives duplicates after inserts.' },
        { q: 'How does a GraphQL server report an error in one field?', options: ['With status `500`', 'A `null` field plus `errors`', 'With an empty response', 'With a `Warning` header'], correct: 1, why: 'The rest of the data arrives, and the error points to the field path.' },
        { q: 'What does DataLoader combine?', options: ["Different users' responses", 'Schemas of several services', "One tick's loads into a batch", 'Subscriptions into one socket'], correct: 2, why: 'A batch per tick and a cache per request solve the N+1 problem.' },
        { q: 'When does tRPC fit worst?', options: ['An app built on Next.js', 'A TypeScript monorepo', 'A shared release cycle', 'A public API for partners'], correct: 3, why: 'tRPC types exist only in TypeScript; external clients need a language-independent contract.' },
        { q: 'What does `AbortSignal.any([a, b])` do?', options: ['Fires with the first one', 'Waits for both signals', 'Aborts both at once', 'Sets a shared timeout'], correct: 0, why: 'It combines a user cancellation and a timeout: whichever fires first.' },
        { q: 'How do you protect a retried `POST /payments` from a double charge?', options: ['Switch to `PUT`', 'With an idempotency key', 'Retry through `GET`', 'A delay on the server'], correct: 1, why: 'The server stores the result by key and answers the retry with it, without acting again.' },
        { q: 'What does `server.resetHandlers()` do in MSW?', options: ['Stops interception', 'Removes the shared handlers', 'Removes those added in a test', 'Clears the fetch cache'], correct: 2, why: 'Handlers from `server.use()` are removed, the shared ones stay; tests do not affect each other.' },
        { q: 'What makes `EventSource` easier than parsing a stream through `fetch`?', options: ['It can `POST`', 'It allows custom headers', 'It carries binary data', 'It reconnects by itself'], correct: 3, why: 'Reconnecting and `Last-Event-ID` are built in; but `fetch` is needed for `POST` and `Authorization`.' },
        { q: 'Which transport for an order status that changes every few minutes?', options: ['Polling', 'WebSocket', 'WebRTC', 'WebTransport'], correct: 0, why: 'Rare server-only changes are simplest to get by polling with `ETag` and `304`.' },
        { q: 'Why did the `useWebSocket` hook from the notes reconnect after unmounting?', options: ['There were no heartbeats', '`onclose` saw its own `close()`', 'It lacked a `useCallback`', 'The server sent code `1012`'], correct: 1, why: 'You need a flag for closing on your own initiative and to cancel the reconnect timer.' },
        { q: 'A message is sent right after a drop, while `readyState` is still `OPEN`. What happens?', options: ['It goes into a queue', 'It throws an error', 'It may be lost', 'It arrives twice'], correct: 2, why: 'WebSocket does not guarantee delivery across reconnects: you need ids and acknowledgements.' },
        { q: 'What is an SFU in video calls?', options: ['A server that mixes video', 'A NAT traversal server', 'A signaling protocol', 'A server that forwards streams'], correct: 3, why: 'An SFU takes one stream from a participant and forwards it to the others without re-encoding.' },
        { q: 'What does a BFF do with a slow service when assembling a screen?', options: ['A timeout and a section error', 'Waits until it finishes', 'Retries forever', 'Answers `504` for the whole screen'], correct: 0, why: 'Each request has its own timeout, the partial failure is explicit, the rest of the screen works.' },
      ],
    },
  },
}
