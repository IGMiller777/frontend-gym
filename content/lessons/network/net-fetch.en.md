## What this lesson covers

`fetch` looks simple but has plenty of traps: it does not treat a 500 as an error, a body can be read only once, cookies do not go to another domain by default, and a request is cut off when the tab closes. We cover `Request`, `Response` and `Headers`, error handling, streaming, and sending data when the user leaves. `Response` and `Headers` exist in Node.js too, so the examples run without a network.

## The response: ok, status, body

`fetch` rejects only on a network error (no connection, CORS, an abort). A `404` or `500` response arrives as a normal response, and you check it yourself with `response.ok` (status 200–299) or `response.status`.

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

The body is a stream and can be read once, with any one of `json()`, `text()`, `blob()`, `arrayBuffer()`, `formData()`. If you need the body twice (to log it and parse it, say), call `response.clone()` first.

A wrapper written in almost every project:

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

## Headers

`Headers` is case-insensitive about names and joins repeated values with a comma. You set `Content-Type` for JSON yourself: `fetch` sets it automatically only for `FormData`, `URLSearchParams` and strings.

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

## Important request options

| Option | Values and meaning |
|---|---|
| `method`, `body` | the method and body: a string, `FormData`, `Blob`, `URLSearchParams`, a stream |
| `credentials` | `same-origin` (default: cookies only to your own origin), `include` (to other origins too), `omit` (never) |
| `mode` | `cors` (default), `same-origin`, `no-cors` (an opaque response, see [CORS](/learn/net-cors)) |
| `cache` | how to use the HTTP cache: `no-store`, `reload`, `no-cache`, `force-cache` |
| `signal` | cancellation and timeouts with `AbortController` and `AbortSignal.timeout` (see [the cancellation lesson](/learn/async-cancellation)) |
| `keepalive` | the request survives the page closing (body up to 64 KB) |
| `priority` | `high` or `low` relative to other requests |

## Reading a stream

`response.body` is a `ReadableStream`: the response can be processed as it arrives, without waiting for the end. That is how download progress is shown and how AI answers appear word by word.

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

## Data when the user leaves

The browser may cut off a plain `fetch` in a page-close handler. For analytics and saving drafts use `navigator.sendBeacon(url, data)` or `fetch(url, { method: "POST", body, keepalive: true })`: the browser delivers the request even after the tab closes. Send on the `visibilitychange` event (when `document.visibilityState === "hidden"`) or `pagehide`: the `unload` event is unreliable on mobile and breaks the back/forward cache.

## Key points

- `fetch` rejects only on network errors; check `404` and `500` with `response.ok`.
- A body is read once; two reads need `clone()`.
- `Headers` is case-insensitive; set `Content-Type` for JSON yourself.
- `credentials` controls cookies, `signal` cancellation, `keepalive` delivery after closing.
- `response.body` is a stream: progress and partial responses.
- When leaving the page, send with `sendBeacon` or `keepalive` on `visibilitychange`.
