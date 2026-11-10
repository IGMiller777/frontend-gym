## О чём урок

`fetch` выглядит просто, но в нём хватает ловушек: он не считает ошибкой код 500, тело можно прочитать только один раз, cookies на чужой домен по умолчанию не уходят, а запрос при закрытии вкладки обрывается. Здесь разберём `Request`, `Response` и `Headers`, обработку ошибок, потоковое чтение и отправку данных при уходе со страницы. `Response` и `Headers` есть и в Node.js, поэтому примеры выполняются без сети.

## Ответ: ok, status, тело

`fetch` отклоняет промис только при сетевой ошибке (нет соединения, CORS, отмена). Ответ `404` или `500` приходит как обычный ответ, и проверять его надо самим через `response.ok` (статус 200–299) или `response.status`.

```js run
const res = new Response(JSON.stringify({ error: "not found" }), {
  status: 404,
  headers: { "Content-Type": "application/json" },
})
console.log(res.ok, res.status, res.headers.get("content-type"))
const body = await res.json()
console.log(body.error, res.bodyUsed)
try {
  await res.json()
} catch (e) {
  console.log("second read:", e.name)
}
```

```output
false 404 application/json
not found true
second read: TypeError
```

Тело это поток, и прочитать его можно один раз любым из методов: `json()`, `text()`, `blob()`, `arrayBuffer()`, `formData()`. Если тело нужно дважды (например, залогировать и разобрать), сначала делают `response.clone()`.

Обёртка, которую пишут почти в каждом проекте:

```js run
async function request(input, init) {
  const res = await (globalThis.mockFetch ?? fetch)(input, init)
  if (!res.ok) {
    const details = await res.text()
    throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status, details })
  }
  return res.status === 204 ? null : res.json()
}

globalThis.mockFetch = async (url) =>
  url.endsWith("/missing") ? new Response("no such user", { status: 404 }) : Response.json({ id: 1 })

console.log(await request("/api/users/1"))
await request("/api/users/missing").catch((e) => console.log(e.message, e.status, e.details))
```

```output
{ id: 1 }
HTTP 404 404 no such user
```

## Заголовки

`Headers` нечувствителен к регистру имён, а повторяющиеся значения склеивает через запятую. Заголовок `Content-Type` для JSON нужно ставить самому: `fetch` выставит его автоматически только для `FormData`, `URLSearchParams` и строк.

```js run
const headers = new Headers({ "Content-Type": "application/json" })
headers.append("Accept-Language", "ru")
headers.append("accept-language", "en")
console.log(headers.get("content-type"), "|", headers.get("ACCEPT-LANGUAGE"))
console.log([...headers.keys()].join(", "))
```

```output
application/json | ru, en
accept-language, content-type
```

## Важные опции запроса

| Опция | Значения и смысл |
|---|---|
| `method`, `body` | метод и тело: строка, `FormData`, `Blob`, `URLSearchParams`, поток |
| `credentials` | `same-origin` (по умолчанию: cookies только своему источнику), `include` (и чужим), `omit` (никогда) |
| `mode` | `cors` (по умолчанию), `same-origin`, `no-cors` (непрозрачный ответ, см. [CORS](/learn/net-cors)) |
| `cache` | как использовать HTTP-кэш: `no-store`, `reload`, `no-cache`, `force-cache` |
| `signal` | отмена и таймауты через `AbortController` и `AbortSignal.timeout` (см. [урок об отмене](/learn/async-cancellation)) |
| `keepalive` | запрос переживёт закрытие страницы (тело до 64 КБ) |
| `priority` | `high` или `low` относительно других запросов |

## Потоковое чтение

`response.body` это `ReadableStream`: ответ можно обрабатывать по мере поступления, не дожидаясь конца. Так показывают прогресс загрузки и выводят ответ ИИ по словам.

```js run
const encoder = new TextEncoder()
const stream = new ReadableStream({
  start(controller) {
    for (const word of ["Hello", ", ", "stream", "!"]) controller.enqueue(encoder.encode(word))
    controller.close()
  },
})
const res = new Response(stream)
const reader = res.body.pipeThrough(new TextDecoderStream()).getReader()
const parts = []
for (;;) {
  const { done, value } = await reader.read()
  if (done) break
  parts.push(value)
}
console.log(parts.length, parts.join(""))
```

```output
4 Hello, stream!
```

## Данные при уходе со страницы

Обычный `fetch` в обработчике закрытия страницы браузер может оборвать. Для аналитики и сохранения черновика используют `navigator.sendBeacon(url, data)` или `fetch(url, { method: "POST", body, keepalive: true })`: браузер доставит запрос даже после закрытия вкладки. Отправлять лучше на событие `visibilitychange` (когда `document.visibilityState === "hidden"`) или `pagehide`: событие `unload` ненадёжно на мобильных и мешает кэшу «назад-вперёд».

## Главное

- `fetch` отклоняется только при сетевой ошибке; `404` и `500` проверяют через `response.ok`.
- Тело читается один раз; для двух чтений нужен `clone()`.
- `Headers` нечувствителен к регистру; `Content-Type` для JSON ставят сами.
- `credentials` управляет cookies, `signal` отменой, `keepalive` доставкой после закрытия.
- `response.body` это поток: прогресс и ответы по частям.
- При уходе со страницы отправляют через `sendBeacon` или `keepalive` на `visibilitychange`.
