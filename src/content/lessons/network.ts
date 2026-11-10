import type { Source } from '../sources'
import type { Lesson, Module } from './types'

const mdn = (title: string, path: string): Source => ({ title: `MDN: ${title}`, url: `https://developer.mozilla.org/en-US/docs/${path}`, kind: 'official' })
const webdev = (title: string, path: string): Source => ({ title: `web.dev: ${title}`, url: `https://web.dev/articles/${path}`, kind: 'official' })
const verified = { date: '2026-11', version: 'HTTP Semantics (RFC 9110), HTTP Caching (RFC 9111), Fetch Standard' }

export const networkLessons: Lesson[] = [
  {
    id: 'net-http',
    track: 'network',
    emoji: '📨',
    minutes: 12,
    title: { ru: 'HTTP: запросы, методы, коды', en: 'HTTP: requests, methods, codes' },
    summary: {
      ru: 'URL и origin, безопасные и идемпотентные методы, коды ответа для фронтенда, HTTP/1.1, HTTP/2 и HTTP/3.',
      en: 'URLs and origins, safe and idempotent methods, status codes for the frontend, HTTP/1.1, HTTP/2 and HTTP/3.',
    },
    quiz: {
      ru: [
        { q: 'Какой метод можно безопасно повторить после обрыва сети, не боясь задвоить действие?', options: ['`POST` с телом формы заказа', '`PUT`, заменяющий ресурс целиком', '`PATCH` без ключа идемпотентности', 'Любой метод, сервер сам разберётся'], correct: 1, why: '`PUT` идемпотентен: повторная замена даёт тот же результат. `POST` повторять нельзя без ключа идемпотентности.' },
        { q: 'Чем `401` отличается от `403`?', options: ['Ничем, это синонимы для браузера', '`401` значит не вошли, `403` значит нет прав', '`401` про сервер, `403` про сеть клиента', '`403` значит временную ошибку сервера'], correct: 1, why: '`401` про аутентификацию (кто вы), `403` про авторизацию (вам нельзя). Повтор с тем же пользователем при `403` не поможет.' },
        { q: 'Что даёт HTTP/2 по сравнению с HTTP/1.1?', options: ['Шифрование, которого в HTTP/1.1 не было', 'Много запросов параллельно в одном соединении', 'Работу поверх UDP вместо протокола TCP', 'Отказ от текстовых заголовков в запросах'], correct: 1, why: 'Мультиплексирование убирает очередь из шести соединений. UDP и QUIC появляются в HTTP/3.' },
        { q: 'Что входит в `origin` адреса `https://shop.example.com:8443/cart?x=1`?', options: ['Только хост `shop.example.com`', 'Схема, хост и порт', 'Хост, путь и строка запроса', 'Весь адрес целиком с параметрами'], correct: 1, why: '`origin` это `https://shop.example.com:8443`. Путь и параметры в него не входят.' },
      ],
      en: [
        { q: 'Which method can be safely retried after a network drop without duplicating the action?', options: ['A `POST` with an order form body', 'A `PUT` that replaces the whole resource', 'A `PATCH` without an idempotency key', 'Any method, the server sorts it out'], correct: 1, why: '`PUT` is idempotent: replacing again gives the same result. A `POST` must not be retried without an idempotency key.' },
        { q: 'How does `401` differ from `403`?', options: ['No difference, browsers treat them alike', '`401` means not logged in, `403` means not allowed', '`401` is about the server, `403` the client network', '`403` means a temporary server error'], correct: 1, why: '`401` is about authentication (who you are), `403` about authorization (you may not). Retrying as the same user after `403` will not help.' },
        { q: 'What does HTTP/2 add over HTTP/1.1?', options: ['Encryption that did not exist before', 'Many parallel requests over one connection', 'Running over UDP instead of TCP', 'Dropping headers from requests'], correct: 1, why: 'Multiplexing removes the queue behind six connections. UDP and QUIC arrive with HTTP/3.' },
        { q: 'What makes up the `origin` of `https://shop.example.com:8443/cart?x=1`?', options: ['Only the host `shop.example.com`', 'The scheme, host and port', 'The host, path and query string', 'The whole address with parameters'], correct: 1, why: 'The `origin` is `https://shop.example.com:8443`. The path and parameters are not part of it.' },
      ],
    },
    sources: [
      mdn('HTTP request methods', 'Web/HTTP/Reference/Methods'),
      mdn('HTTP response status codes', 'Web/HTTP/Reference/Status'),
      mdn('Evolution of HTTP', 'Web/HTTP/Guides/Evolution_of_HTTP'),
      mdn('URL', 'Web/API/URL'),
      { title: 'RFC 9110: HTTP Semantics', url: 'https://www.rfc-editor.org/rfc/rfc9110', kind: 'spec' },
    ],
    verified,
  },
  {
    id: 'net-caching',
    track: 'network',
    emoji: '🗄️',
    minutes: 12,
    title: { ru: 'HTTP-кэш', en: 'HTTP caching' },
    summary: {
      ru: 'Cache-Control, no-cache против no-store, ETag и 304, Vary, стратегия по типам файлов, кэш в приложении.',
      en: 'Cache-Control, no-cache versus no-store, ETag and 304, Vary, a strategy per file type, caching in the app.',
    },
    quiz: {
      ru: [
        { q: 'Что значит `Cache-Control: no-cache`?', options: ['Не сохранять ответ ни в каком кэше вообще', 'Хранить, но каждый раз сверять с сервером', 'Хранить только в CDN, но не в кэше браузера', 'Хранить ответ ровно одну минуту, потом удалить'], correct: 1, why: 'Запрет хранения это `no-store`. `no-cache` разрешает кэш, но требует проверки свежести каждый раз.' },
        { q: 'Какой заголовок подходит для `app.3f9c2a.js` с хэшем в имени?', options: ['`no-store, max-age=0, must-revalidate`', '`public, max-age=31536000, immutable`', '`no-cache, stale-while-revalidate=60`', '`private, max-age=0, no-transform`'], correct: 1, why: 'Под этим именем содержимое не меняется: новая версия получит новое имя, поэтому файл можно кэшировать на год.' },
        { q: 'Что приходит в ответ `304 Not Modified`?', options: ['Новое тело с обновлённой версией', 'Только заголовки, тело берётся из кэша', 'Редирект на актуальную версию', 'Ошибка, которую надо показать'], correct: 1, why: 'Сервер подтверждает, что версия по `ETag` не изменилась, и браузер использует сохранённое тело.' },
        { q: 'Почему опасен долгий `max-age` у `index.html`?', options: ['HTML станет грузиться медленнее с каждым днём', 'После релиза пользователи получат старые ссылки на файлы', 'Браузер перестанет кэшировать CSS и картинки', 'CDN откажется отдавать такой файл пользователям'], correct: 1, why: 'HTML ссылается на хэшированные файлы. Пока старый HTML в кэше, новые файлы до пользователя не дойдут.' },
      ],
      en: [
        { q: 'What does `Cache-Control: no-cache` mean?', options: ['Do not store the response at all', 'Store it but revalidate before every use', 'Store it only on the CDN, not in browsers', 'Store the response for exactly a minute'], correct: 1, why: 'Not storing is `no-store`. `no-cache` allows caching but requires a freshness check every time.' },
        { q: 'Which header fits `app.3f9c2a.js`, which has a hash in its name?', options: ['`no-store, max-age=0, must-revalidate`', '`public, max-age=31536000, immutable`', '`no-cache, stale-while-revalidate=60`', '`private, max-age=0, no-transform`'], correct: 1, why: 'The content under that name never changes: a new version gets a new name, so the file can be cached for a year.' },
        { q: 'What comes back in a `304 Not Modified` response?', options: ['A new body with the updated version', 'Only headers; the body comes from the cache', 'A redirect to the current version', 'An error that must be shown to the user'], correct: 1, why: 'The server confirms the `ETag` version has not changed, and the browser uses the stored body.' },
        { q: 'Why is a long `max-age` on `index.html` dangerous?', options: ['The HTML would load more slowly', 'After a release users get old links to files', 'The browser would stop caching CSS', 'The CDN would refuse to serve the file'], correct: 1, why: 'HTML links to hashed files. While the old HTML is cached, the new files never reach the user.' },
      ],
    },
    sources: [
      mdn('HTTP caching', 'Web/HTTP/Guides/Caching'),
      mdn('Cache-Control', 'Web/HTTP/Reference/Headers/Cache-Control'),
      mdn('ETag', 'Web/HTTP/Reference/Headers/ETag'),
      webdev('Prevent unnecessary network requests with the HTTP Cache', 'http-cache'),
      { title: 'RFC 9111: HTTP Caching', url: 'https://www.rfc-editor.org/rfc/rfc9111', kind: 'spec' },
    ],
    verified,
  },
  {
    id: 'net-cors',
    track: 'network',
    emoji: '🚧',
    minutes: 12,
    title: { ru: 'CORS и политика одного источника', en: 'CORS and the same-origin policy' },
    summary: {
      ru: 'Что такое источник, как сервер разрешает чтение, простые запросы и preflight, credentials и что CORS не защищает.',
      en: 'What an origin is, how the server allows reading, simple requests and preflight, credentials, and what CORS does not protect.',
    },
    quiz: {
      ru: [
        { q: 'Почему `fetch` с `Content-Type: application/json` на чужой API сначала отправляет `OPTIONS`?', options: ['Так браузер проверяет доступность сервера', 'Это непростой запрос, нужен preflight', 'JSON всегда отправляется двумя запросами', 'Так сервер получает cookies пользователя'], correct: 1, why: '`application/json` не входит в безопасный список типов, поэтому браузер сначала спрашивает разрешение предзапросом.' },
        { q: 'Можно ли ответить `Access-Control-Allow-Origin: *` на запрос с `credentials: "include"`?', options: ['Да, звёздочка разрешает всё', 'Нет, нужен конкретный источник', 'Да, если добавить `Vary: Origin`', 'Нет, cookies в CORS запрещены вовсе'], correct: 1, why: 'С учётными данными звёздочка запрещена: сервер должен вернуть конкретный источник и `Allow-Credentials: true`.' },
        { q: 'От чего защищает CORS?', options: ['Сервер от любых чужих клиентов и скриптов', 'Пользователя от чтения его данных чужим сайтом', 'Сайт от DDoS-атак и автоматических ботов', 'Cookies пользователя от перехвата в сети'], correct: 1, why: 'CORS работает только в браузере. `curl` и серверы его не соблюдают, поэтому сервер защищают авторизацией и CSRF-токенами.' },
        { q: 'Что вернёт `fetch` с `mode: "no-cors"` на чужой API?', options: ['Обычный ответ, просто без проверки CORS', 'Непрозрачный ответ: ни статус, ни тело не прочитать', 'Ошибку: такой запрос не уйдёт на сервер вообще', 'Ответ только с заголовками, но без тела'], correct: 1, why: 'Запрос уйдёт, но ответ будет opaque. Этот режим не отключает CORS.' },
      ],
      en: [
        { q: 'Why does a `fetch` with `Content-Type: application/json` to another API send `OPTIONS` first?', options: ['The browser first checks the server is up', 'It is not a simple request, so it is preflighted', 'JSON bodies are always sent as two requests', 'That is how the server receives the cookies'], correct: 1, why: '`application/json` is not on the safelist of types, so the browser first asks for permission with a preflight.' },
        { q: 'Can a server answer `Access-Control-Allow-Origin: *` to a request with `credentials: "include"`?', options: ['Yes, the wildcard allows everything', 'No, a specific origin is required', 'Yes, if `Vary: Origin` is added', 'No, cookies are banned in CORS entirely'], correct: 1, why: 'With credentials the wildcard is forbidden: the server must return a specific origin and `Allow-Credentials: true`.' },
        { q: 'What does CORS protect against?', options: ['The server against any foreign client', "Other sites reading the user's data", 'The site against DDoS attacks and bots', 'Cookies being intercepted on the network'], correct: 1, why: 'CORS works only in browsers. `curl` and servers ignore it, so the server is protected by authorization and CSRF tokens.' },
        { q: 'What does `fetch` with `mode: "no-cors"` to another API return?', options: ['A normal response, just without the CORS check', 'An opaque response: neither status nor body readable', 'An error: the request is never sent at all', 'A response with all headers but without a body'], correct: 1, why: 'The request goes out, but the response is opaque. This mode does not turn CORS off.' },
      ],
    },
    sources: [
      mdn('Same-origin policy', 'Web/Security/Same-origin_policy'),
      mdn('Cross-Origin Resource Sharing (CORS)', 'Web/HTTP/Guides/CORS'),
      mdn('Preflight request', 'Glossary/Preflight_request'),
      { title: 'Fetch Standard: CORS protocol', url: 'https://fetch.spec.whatwg.org/#http-cors-protocol', kind: 'spec' },
      { title: 'Vite: server.proxy', url: 'https://vite.dev/config/server-options.html#server-proxy', kind: 'official' },
    ],
    verified,
  },
  {
    id: 'net-cookies-storage',
    track: 'network',
    emoji: '🍪',
    minutes: 12,
    title: { ru: 'Cookies и хранилища', en: 'Cookies and storage' },
    summary: {
      ru: 'Атрибуты cookies, SameSite и сторонние cookies, localStorage, sessionStorage и IndexedDB, где хранить токен.',
      en: 'Cookie attributes, SameSite and third-party cookies, localStorage, sessionStorage and IndexedDB, where to keep a token.',
    },
    quiz: {
      ru: [
        { q: 'Что делает атрибут `HttpOnly`?', options: ['Отправляет cookie только по HTTP без TLS', 'Скрывает cookie от JavaScript на странице', 'Разрешает cookie только для GET-запросов', 'Удаляет cookie при закрытии вкладки'], correct: 1, why: 'Cookie с `HttpOnly` видит только сервер, поэтому сессия не утечёт через `document.cookie` при XSS.' },
        { q: 'Форма на чужом сайте отправляет `POST` на ваш сайт. Уйдёт ли cookie с `SameSite=Lax`?', options: ['Да, `Lax` пропускает любые запросы', 'Нет, `Lax` пропускает только переходы по ссылкам', 'Да, если cookie без атрибута `Secure`', 'Нет, `Lax` блокирует и переходы по ссылкам'], correct: 1, why: '`Lax` отправляет cookie с межсайтовым переходом верхнего уровня методом `GET`, но не с `POST`-формами и `fetch`.' },
        { q: 'Что вернёт `localStorage.getItem("n")` после `setItem("n", 5)`?', options: ['Число `5`', 'Строку `"5"`', '`undefined`', 'Ошибку типа'], correct: 1, why: '`localStorage` хранит только строки. Числа и объекты приводятся к строке, объекты сохраняют через `JSON.stringify`.' },
        { q: 'Где обычно хранят сессию веб-приложения?', options: ['В `localStorage`, чтобы читать её из JS', 'В `HttpOnly`-cookie с `Secure` и `SameSite`', 'В строке запроса каждого URL', 'В `sessionStorage` каждой вкладки'], correct: 1, why: '`HttpOnly`-cookie не читается скриптами даже при XSS, а `SameSite` закрывает большинство CSRF.' },
      ],
      en: [
        { q: 'What does the `HttpOnly` attribute do?', options: ['Sends the cookie over HTTP without TLS', 'Hides the cookie from JavaScript on the page', 'Allows the cookie only for GET requests', 'Deletes the cookie when the tab closes'], correct: 1, why: 'Only the server sees an `HttpOnly` cookie, so the session cannot leak through `document.cookie` during XSS.' },
        { q: 'A form on another site sends a `POST` to your site. Does a `SameSite=Lax` cookie go along?', options: ['Yes, `Lax` lets every request through', 'No, `Lax` allows only link navigations', 'Yes, if the cookie lacks `Secure`', 'No, `Lax` blocks link navigations too'], correct: 1, why: '`Lax` sends the cookie with a top-level cross-site `GET` navigation, but not with `POST` forms or `fetch`.' },
        { q: 'What does `localStorage.getItem("n")` return after `setItem("n", 5)`?', options: ['The number `5`', 'The string `"5"`', '`undefined`', 'A type error'], correct: 1, why: '`localStorage` stores only strings. Numbers and objects are converted to strings; objects are saved with `JSON.stringify`.' },
        { q: "Where is a web app's session usually kept?", options: ['In `localStorage`, so that JS can read it', 'In an `HttpOnly` cookie with `Secure` and `SameSite`', 'In the query string of every request URL', "In each tab's own `sessionStorage` copy"], correct: 1, why: 'An `HttpOnly` cookie cannot be read by scripts even with XSS, and `SameSite` blocks most CSRF.' },
      ],
    },
    sources: [
      mdn('Using HTTP cookies', 'Web/HTTP/Guides/Cookies'),
      mdn('Set-Cookie', 'Web/HTTP/Reference/Headers/Set-Cookie'),
      mdn('Cookies Having Independent Partitioned State (CHIPS)', 'Web/Privacy/Guides/Privacy_sandbox/Partitioned_cookies'),
      mdn('Storage quotas and eviction criteria', 'Web/API/Storage_API/Storage_quotas_and_eviction_criteria'),
      mdn('Using IndexedDB', 'Web/API/IndexedDB_API/Using_IndexedDB'),
      { title: 'OWASP: HTML5 Security Cheat Sheet, Local Storage', url: 'https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html#local-storage', kind: 'official' },
    ],
    verified,
  },
  {
    id: 'net-fetch',
    track: 'network',
    emoji: '📡',
    minutes: 12,
    title: { ru: 'Fetch API в деталях', en: 'The Fetch API in depth' },
    summary: {
      ru: 'response.ok и ошибки, тело читается один раз, Headers, опции запроса, потоковое чтение, sendBeacon и keepalive.',
      en: 'response.ok and errors, a body is read once, Headers, request options, streaming, sendBeacon and keepalive.',
    },
    quiz: {
      ru: [
        { q: 'Сервер ответил `500`. Что сделает `await fetch(url)`?', options: ['Бросит исключение с кодом 500', 'Вернёт ответ с `ok: false`', 'Повторит запрос автоматически', 'Вернёт `undefined` вместо ответа'], correct: 1, why: '`fetch` отклоняется только при сетевой ошибке. Код статуса проверяют через `response.ok` или `response.status`.' },
        { q: 'Что будет при втором вызове `response.json()`?', options: ['Вернётся тот же объект из кэша', '`TypeError`: тело уже прочитано', 'Запрос отправится заново', 'Вернётся пустой объект `{}`'], correct: 1, why: 'Тело это поток, его читают один раз. Для двух чтений сначала делают `response.clone()`.' },
        { q: 'Как отправить аналитику, когда пользователь закрывает вкладку?', options: ['Обычным `fetch` в обработчике события `unload`', '`sendBeacon` или `fetch` с `keepalive` на `visibilitychange`', '`setTimeout` с отправкой запроса через секунду', 'Записать данные в `localStorage` и больше не трогать'], correct: 1, why: 'Браузер доставит такие запросы даже после закрытия. `unload` ненадёжен и ломает кэш «назад-вперёд».' },
        { q: 'Какое значение `credentials` у `fetch` по умолчанию?', options: ['`include`: cookies уходят на любые источники', '`same-origin`: cookies только своему источнику', '`omit`: cookies не уходят никуда и никогда', '`cors`: решает сервер своим ответом'], correct: 1, why: 'По умолчанию cookies уходят только на свой источник. Для чужого нужен `include` и разрешение сервера.' },
      ],
      en: [
        { q: 'The server answered `500`. What does `await fetch(url)` do?', options: ['Throws an exception with code 500', 'Returns a response with `ok: false`', 'Retries the request automatically', 'Returns `undefined` instead of a response'], correct: 1, why: '`fetch` rejects only on a network error. Check the status with `response.ok` or `response.status`.' },
        { q: 'What happens on a second `response.json()` call?', options: ['The same object comes back from cache', 'A `TypeError`: the body is already read', 'The request is sent again', 'An empty object `{}` is returned'], correct: 1, why: 'The body is a stream read once. For two reads, call `response.clone()` first.' },
        { q: 'How do you send analytics when the user closes the tab?', options: ['A plain `fetch` inside an `unload` event handler', '`sendBeacon` or a `keepalive` `fetch` on `visibilitychange`', 'A `setTimeout` that sends the request a second later', 'Write the data to `localStorage` and leave it there'], correct: 1, why: 'The browser delivers such requests even after closing. `unload` is unreliable and breaks the back/forward cache.' },
        { q: 'What is the default `credentials` value of `fetch`?', options: ['`include`: cookies go everywhere', '`same-origin`: cookies only to your origin', '`omit`: cookies never go anywhere', '`cors`: the server decides in its answer'], correct: 1, why: 'By default cookies go only to your own origin. Another origin needs `include` and the server\'s permission.' },
      ],
    },
    sources: [
      mdn('Using the Fetch API', 'Web/API/Fetch_API/Using_Fetch'),
      mdn('RequestInit', 'Web/API/RequestInit'),
      mdn('Response.clone()', 'Web/API/Response/clone'),
      mdn('Using readable streams', 'Web/API/Streams_API/Using_readable_streams'),
      mdn('Navigator.sendBeacon()', 'Web/API/Navigator/sendBeacon'),
    ],
    verified,
  },
  {
    id: 'net-loading',
    track: 'network',
    emoji: '🚀',
    minutes: 10,
    title: { ru: 'Подсказки загрузки, сжатие, CDN', en: 'Resource hints, compression, CDNs' },
    summary: {
      ru: 'preload, preconnect, prefetch и modulepreload, fetchpriority, Speculation Rules, 103 Early Hints, Brotli и zstd, CDN.',
      en: 'preload, preconnect, prefetch and modulepreload, fetchpriority, Speculation Rules, 103 Early Hints, Brotli and zstd, CDNs.',
    },
    quiz: {
      ru: [
        { q: 'Чем `preload` отличается от `prefetch`?', options: ['Ничем, это два имени одного и того же механизма', '`preload` для текущей страницы, `prefetch` для следующей', '`prefetch` грузит с высоким приоритетом, `preload` с низким', '`preload` работает только для картинок и шрифтов'], correct: 1, why: '`preload` загружает нужное сейчас с высоким приоритетом, `prefetch` с низким для будущей навигации.' },
        { q: 'Что обязательно указать у `<link rel="preload">`?', options: ['Атрибут `defer` как у скриптов', 'Атрибут `as` с типом ресурса', 'Атрибут `async` для параллели', 'Атрибут `loading="lazy"`'], correct: 1, why: 'Без `as` браузер не знает тип ресурса: приоритет и проверки неверны, файл может скачаться дважды.' },
        { q: 'Что делает ответ `103 Early Hints`?', options: ['Сообщает браузеру о скором редиректе', 'Даёт начать загрузку ресурсов до основного ответа', 'Заменяет основной ответ сохранённой копией из кэша', 'Ускоряет TLS-рукопожатие с сервером'], correct: 1, why: 'В нём заголовки `Link` с `preload` и `preconnect`: браузер работает, пока сервер генерирует HTML.' },
        { q: 'Для каких страниц нельзя включать prerender через Speculation Rules?', options: ['Для страниц с большими картинками', 'Для страниц, меняющих данные при открытии', 'Для страниц, отданных по HTTP/2', 'Для страниц со сторонними шрифтами'], correct: 1, why: 'Prerender выполняет страницу заранее. Выход из аккаунта или изменение корзины сработали бы без перехода.' },
      ],
      en: [
        { q: 'How does `preload` differ from `prefetch`?', options: ['No difference, two names for one and the same thing', '`preload` is for this page, `prefetch` for the next', '`prefetch` loads at high priority, `preload` at low', '`preload` works only for images and fonts'], correct: 1, why: '`preload` loads what is needed now at high priority, `prefetch` at low priority for a future navigation.' },
        { q: 'What must `<link rel="preload">` include?', options: ['A `defer` attribute, as on scripts', 'An `as` attribute with the resource type', 'An `async` attribute for parallelism', 'A `loading="lazy"` attribute'], correct: 1, why: 'Without `as` the browser does not know the resource type: priority and checks are wrong, and the file may download twice.' },
        { q: 'What does a `103 Early Hints` response do?', options: ['Announces an upcoming redirect', 'Lets loading start before the main response', 'Replaces the main response with a cache', 'Speeds up the TLS handshake with the server'], correct: 1, why: 'It carries `Link` headers with `preload` and `preconnect`: the browser works while the server generates HTML.' },
        { q: 'Which pages must not be prerendered with Speculation Rules?', options: ['Pages with large images', 'Pages that change data when opened', 'Pages served over HTTP/2', 'Pages that use third-party fonts'], correct: 1, why: 'Prerendering runs the page ahead of time. Logging out or changing a cart would happen without a navigation.' },
      ],
    },
    sources: [
      mdn('rel=preload', 'Web/HTML/Reference/Attributes/rel/preload'),
      mdn('rel=modulepreload', 'Web/HTML/Reference/Attributes/rel/modulepreload'),
      mdn('Speculation Rules API', 'Web/API/Speculation_Rules_API'),
      mdn('103 Early Hints', 'Web/HTTP/Reference/Status/103'),
      webdev('Optimize resource loading with the Fetch Priority API', 'fetch-priority'),
      mdn('Content-Encoding', 'Web/HTTP/Reference/Headers/Content-Encoding'),
    ],
    verified,
  },
]

export const networkModule: Module = {
  track: 'network',
  lessons: networkLessons.map((l) => l.id),
  exam: {
    pass: 0.75,
    questions: {
      ru: [
        { q: 'Пользователь нажал «Оплатить» дважды. Какой метод и что защищает от двойного списания?', options: ['`GET` и кэш ответа в браузере', '`POST` и ключ идемпотентности', '`PUT` и заголовок `ETag`', '`DELETE` и строгий CORS'], correct: 1, why: '`POST` неидемпотентен; ключ идемпотентности позволяет серверу узнать повтор.' },
        { q: 'Что значит ответ `429`?', options: ['Ресурс перенесён навсегда по новому адресу', 'Слишком много запросов, нужно подождать', 'Нет прав на запрошенный ресурс', 'Ошибка шлюза между двумя серверами'], correct: 1, why: 'Сервер ограничивает частоту; ждут `Retry-After` и повторяют с задержкой.' },
        { q: 'Какой заголовок запрещает сохранять ответ в кэше?', options: ['`Cache-Control: no-cache`', '`Cache-Control: no-store`', '`Cache-Control: private`', '`Cache-Control: max-age=60`'], correct: 1, why: '`no-cache` разрешает хранение с проверкой, а `no-store` запрещает хранить вообще.' },
        { q: 'Какой адрес того же источника, что `https://app.example.com/`?', options: ['`http://app.example.com/`', '`https://app.example.com/api`', '`https://api.example.com/`', '`https://app.example.com:8443/`'], correct: 1, why: 'Совпадают схема, хост и порт. Путь на источник не влияет.' },
        { q: 'Почему запрос с заголовком `Authorization` на чужой API требует preflight?', options: ['Заголовок не из безопасного списка', 'Авторизация всегда идёт через `OPTIONS`', 'Браузер проверяет токен заранее', 'Сервер так шифрует токен'], correct: 0, why: '`Authorization` не входит в безопасный список, поэтому браузер сначала спрашивает разрешение.' },
        { q: 'Скрипт выполнил `document.cookie = "s=1; HttpOnly"`. Что произошло?', options: ['Cookie сохранилась и скрыта от JS', 'Браузер её проигнорировал', 'Cookie сохранилась без `HttpOnly`', 'Бросилась ошибка безопасности'], correct: 1, why: 'Скрипт не может создать `HttpOnly`-cookie: её ставит только сервер заголовком `Set-Cookie`.' },
        { q: 'Как прочитать тело ответа дважды?', options: ['Вызвать `json()` два раза подряд', 'Сначала `response.clone()`, потом читать оба', 'Включить `cache: "force-cache"` в запросе', 'Передать `keepalive: true` в опциях'], correct: 1, why: 'Тело это поток, читается один раз. `clone()` делает вторую копию до чтения.' },
        { q: 'Что подсказать браузеру для главной картинки, найденной поздно?', options: ['`loading="lazy"` и `decoding="async"` у картинки', '`preload` с `as="image"` и `fetchpriority="high"`', '`prefetch` этой картинки в `<head>`', '`dns-prefetch` для своего же домена'], correct: 1, why: 'Ленивая загрузка LCP-картинки вредна; её загружают раньше и с высоким приоритетом.' },
      ],
      en: [
        { q: 'The user clicked "Pay" twice. Which method is it, and what prevents a double charge?', options: ['`GET` and response caching', '`POST` and an idempotency key', '`PUT` and an `ETag` header', '`DELETE` and CORS'], correct: 1, why: '`POST` is not idempotent; an idempotency key lets the server recognize the repeat.' },
        { q: 'What does a `429` response mean?', options: ['The resource moved permanently', 'Too many requests, wait and retry', 'No permission for the resource', 'A gateway error between servers'], correct: 1, why: 'The server limits the rate; wait for `Retry-After` and retry with a delay.' },
        { q: 'Which header forbids storing the response in a cache?', options: ['`Cache-Control: no-cache`', '`Cache-Control: no-store`', '`Cache-Control: private`', '`Cache-Control: max-age=60`'], correct: 1, why: '`no-cache` allows storing with revalidation, `no-store` forbids storing at all.' },
        { q: 'Which URL has the same origin as `https://app.example.com/`?', options: ['`http://app.example.com/`', '`https://app.example.com/api`', '`https://api.example.com/`', '`https://app.example.com:8443/`'], correct: 1, why: 'The scheme, host and port match. The path does not affect the origin.' },
        { q: 'Why does a request with an `Authorization` header to another API need a preflight?', options: ['The header is not on the safelist', 'Authorization always goes through `OPTIONS`', 'The browser validates the token first', 'That is how the server encrypts it'], correct: 0, why: '`Authorization` is not on the safelist, so the browser asks for permission first.' },
        { q: 'A script ran `document.cookie = "s=1; HttpOnly"`. What happened?', options: ['The cookie was saved and hidden from JS', 'The browser ignored it', 'The cookie was saved without `HttpOnly`', 'A security error was thrown'], correct: 1, why: 'A script cannot create an `HttpOnly` cookie: only the server sets one with `Set-Cookie`.' },
        { q: 'How do you read a response body twice?', options: ['Call `json()` twice in a row', 'Call `response.clone()` first, then read both', 'Turn on `cache: "force-cache"` in the request', 'Pass `keepalive: true` in the options'], correct: 1, why: 'The body is a stream read once. `clone()` makes a second copy before reading.' },
        { q: 'What should you hint for a main image that is discovered late?', options: ['`loading="lazy"` and `decoding="async"` on the image', '`preload` with `as="image"` and `fetchpriority="high"`', '`prefetch` for that image in the `<head>`', '`dns-prefetch` for your own domain'], correct: 1, why: 'Lazy-loading the LCP image hurts; load it earlier and at high priority.' },
      ],
    },
  },
}
