# Аудит заметок: Сеть и HTTP

Источники в Notion: разделы «Кэширование ETag и Cache-Control и 304», «Server Side Events», «Content Delivery» и «Как улучшить метрики FMP и TTI» со страницы «Browser» (страница прочитана целиком в аудите `browser.md`), разделы «Кэширование» и «Preload & Prefetch» со страницы «JS» (прочитаны целиком). Блок «Rest/GraphQl/WebSocket/WebRTC» на главной странице пуст; тема реального времени относится к треку `api`.

Утверждения уроков сверены с MDN, RFC 9110 и 9111, Fetch Standard и web.dev. Поддержка браузерами взята из MDN Browser Compat Data. Примеры с `URL`, `Response`, `Headers` и потоками выполняются в Node.js, примеры с cookies и `localStorage` в jsdom на странице `https://app.example.com/`.

## Найденные ошибки

| Раздел | В заметках | На самом деле | Источник |
|---|---|---|---|
| Метрики | Улучшать FMP и TTI | Метрики выведены из Lighthouse; актуальны LCP, CLS, INP (см. `browser.md`) | [web.dev: Web Vitals](https://web.dev/articles/vitals) |
| HTTP/2 | Server Push как способ ускорения | Удалён из браузеров; вместо него `preload` и `103 Early Hints` | [Chrome: Removing HTTP/2 Server Push](https://developer.chrome.com/blog/removing-push), [MDN: 103 Early Hints](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/103) |
| Cache-Control | `immutable` «позволяет не проверять свежесть во время текущей сессии» | Не перепроверять, пока ответ свежий, даже при перезагрузке; Chrome директиву не поддерживает | [MDN: Cache-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control) |
| 304 | Получив 304, клиент «обновляет таймер max-age» | Обновляются сохранённые заголовки из ответа 304; свежесть считается по новым `Cache-Control` и `Date` | [RFC 9111, 4.3.4](https://www.rfc-editor.org/rfc/rfc9111#section-4.3.4) |
| SSE | Браузер ограничивает «обычно 6» SSE-соединений с домена | 6 это лимит HTTP/1.1; по HTTP/2 соединения мультиплексируются (по умолчанию до 100 потоков) | [MDN: EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource) |
| SSE | Fetch + Streams работают «только по HTTP/2+» | Потоковое чтение ответа работает и по HTTP/1.1 | [MDN: Using readable streams](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams) |
| SSE | Поле `data:` обязательно | Сообщение может состоять из одного комментария или `event:`; `message` без данных просто не вызывается | [HTML: Server-sent events](https://html.spec.whatwg.org/multipage/server-sent-events.html#event-stream-interpretation) |
| Кэширование в JS | Мемоизация с ключом `JSON.stringify(args)` как «простой способ» | Теряет `undefined` и функции, `NaN` превращает в `null`, объекты одинакового содержимого склеивает; см. задачу `memoize` | разбор кода |
| Кэширование в JS | `LRUCache.get` возвращает `-1` при промахе | Нельзя отличить промах от закэшированного `-1`; возвращают `undefined` и проверяют `has` | разбор кода |
| Preload & Prefetch | `preload` «загрузить и кэшировать скрипт или стили», без `as` | Атрибут `as` обязателен: без него неверен приоритет и ресурс может скачаться дважды; шрифтам нужен `crossorigin` | [MDN: rel=preload](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/preload) |
| Preload & Prefetch | Нет `modulepreload`, `fetchpriority`, Speculation Rules | Добавлены в урок `net-loading` с текущей поддержкой браузеров | [MDN: Speculation Rules API](https://developer.mozilla.org/en-US/docs/Web/API/Speculation_Rules_API) |

## Пробелы, закрытые в уроках

- Методы: безопасность и идемпотентность, ключ идемпотентности, коды ответа с действиями фронтенда, `401` против `403`.
- HTTP/1.1, HTTP/2 и HTTP/3: мультиплексирование, блокировка начала очереди в TCP, QUIC.
- `no-cache` против `no-store`, `s-maxage`, `stale-while-revalidate`, эвристическое кэширование, `Vary`, стратегия по типам файлов, ошибка с долгим `max-age` у `index.html`.
- Политика одного источника и CORS целиком: простые запросы, preflight, `credentials`, звёздочка, `Vary: Origin`, `no-cors`, прокси dev-сервера.
- Cookies: атрибуты, `__Host-`, `SameSite` и что Lax по умолчанию только в Chrome, сторонние cookies, `Partitioned`; хранилища и где держать токен.
- Fetch: `response.ok`, однократное чтение тела и `clone()`, `Headers`, опции `credentials`, `mode`, `cache`, `keepalive`, `priority`, потоки, `sendBeacon` и `visibilitychange`.
- Сжатие `br` и `zstd`, CDN и `s-maxage`, `103 Early Hints`.
