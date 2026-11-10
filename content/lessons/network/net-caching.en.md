## What this lesson covers

The fastest request is the one never made. The browser HTTP cache and CDNs save network and time, but wrong headers give you either a site that stays stale after every release or no caching at all. We cover `Cache-Control`, revalidation with `ETag` and `304`, a strategy per file type, and caching inside the application.

## Fresh and stale

A cached response is either **fresh** (it may be used without asking the server) or **stale** (it must be checked with the server before use). How long a response stays fresh is set by the `Cache-Control` header.

| Directive | Meaning |
|---|---|
| `max-age=N` | fresh for N seconds after the response |
| `s-maxage=N` | the same for shared caches (CDNs, proxies); overrides `max-age` for them |
| `no-cache` | may be stored, but must be revalidated with the server **every time** before use |
| `no-store` | do not store at all: for personal and sensitive data |
| `private` | only the user's browser cache, not a CDN |
| `public` | may be stored in shared caches too, even for a request with authorization |
| `immutable` | do not revalidate while fresh, even on reload (Chrome does not support it, but it does not revalidate fresh subresources on a normal reload anyway) |
| `stale-while-revalidate=N` | for N more seconds after going stale, serve the old copy and refresh in the background |

The most common confusion: `no-cache` does not mean "do not cache". It means "cache, but always ask". Not caching at all is `no-store`.

Without any `Cache-Control`, the browser may cache a response heuristically, based on its age from `Last-Modified`. So set the header explicitly every time.

## Revalidation: ETag and 304

When a response is stale, the browser does not blindly download it again; it sends a **conditional request** with a validator from the previous response:

```http
GET /api/profile HTTP/1.1
If-None-Match: "v42"

HTTP/1.1 304 Not Modified
ETag: "v42"
Cache-Control: no-cache
```

If the version has not changed, the server answers `304 Not Modified` without a body, and the browser takes the body from its cache. If it has changed, a `200` arrives with the new body and a new `ETag`. A date can be used instead of an `ETag`: `Last-Modified` in the response and `If-Modified-Since` in the request, but `ETag` is more precise.

`Vary` lists the request headers the response depends on (`Vary: Accept-Encoding`, `Vary: Accept-Language`): the cache keeps a separate copy for each value.

## A strategy per file type

| What | Header | Why |
|---|---|---|
| JS, CSS, fonts, images with a hash in the name (`app.3f9c2a.js`) | `public, max-age=31536000, immutable` | the content under that name never changes; a new version gets a new name |
| App HTML pages | `no-cache` (with an `ETag`) | links to new hashed files must reach users right after a release |
| API responses shared by everyone | `public, max-age=60, stale-while-revalidate=300` | the data may be shown slightly stale |
| Personal data | `private, no-cache` or `no-store` | must not end up in a shared cache |

Bundlers (Vite, webpack) add a content hash to file names themselves. The main mistake with this scheme is a long `max-age` on `index.html`: after a release users keep getting the old HTML with links to the old files.

## Caching in the application

On top of the HTTP cache, the application caches data itself: in memory, in libraries such as TanStack Query, in a Service Worker via the Cache API. Two techniques show up everywhere:

- **Deduplicating concurrent requests** (in-flight deduplication): if a request for the same key is already in flight, a second call gets the same promise.
- **Stale-while-revalidate**: return what is in the cache at once and refresh it in the background.

```js run
const calls = []
const fakeFetch = (key) => {
  calls.push(key)
  return new Promise((resolve) => setTimeout(() => resolve(`${key} v${calls.length}`), 10))
}

const inflight = new Map()
const cache = new Map()

function load(key) {
  if (inflight.has(key)) return inflight.get(key)
  const promise = fakeFetch(key)
    .then((value) => {
      cache.set(key, value)
      return value
    })
    .finally(() => inflight.delete(key))
  inflight.set(key, promise)
  return promise
}

// Return the cached value at once and refresh it in the background.
function swr(key) {
  const refresh = load(key)
  return cache.has(key) ? Promise.resolve(cache.get(key)) : refresh
}

const [a, b] = await Promise.all([load("/me"), load("/me")])
console.log(a, b, "requests:", calls.length)
console.log("stale:", await swr("/me"))
await new Promise((r) => setTimeout(r, 20))
console.log("fresh:", cache.get("/me"), "requests:", calls.length)
```

```output
/me v1 /me v1 requests: 1
stale: /me v1
fresh: /me v2 requests: 2
```

An in-memory cache is bounded by size (an LRU on a `Map`, which remembers insertion order) or by time to live (TTL). Otherwise it grows for as long as the tab is open.

## Key points

- `max-age` sets freshness, `no-cache` means "revalidate every time", `no-store` means "do not store".
- A stale response is revalidated with a conditional request (`If-None-Match`); `304` comes with an empty body and allows using the cache.
- Hashed files are cached for a year, HTML with `no-cache`, personal data `private` or `no-store`.
- `Vary` separates copies by request headers.
- In the app, deduplicate concurrent requests and show stale data while refreshing in the background.
