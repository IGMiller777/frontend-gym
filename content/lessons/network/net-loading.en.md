## What this lesson covers

The browser decides by itself what to load and in which order, but it does not know what you know: which image is the main one, which font is needed right away and where the user will go next. We cover resource hints (`preload`, `preconnect`, `prefetch`, `modulepreload`), priorities, Speculation Rules, `103 Early Hints`, compression and CDNs.

## Resource hints

| Hint | What it does | When to use it |
|---|---|---|
| `<link rel="preconnect" href="https://cdn.example.com">` | opens a connection early: DNS, TCP, TLS | 1–3 of the most important third-party domains; extra connections cost resources |
| `<link rel="dns-prefetch" href="…">` | DNS only | domains used "just in case", cheap |
| `<link rel="preload" href="…" as="…">` | load a resource of the current page at high priority | it is needed at once but discovered late: a font from CSS, an LCP image from CSS, data for the first screen |
| `<link rel="modulepreload" href="…">` | load and parse an ES module and its dependencies | modules needed soon after start |
| `<link rel="prefetch" href="…">` | load at low priority for the **next** navigation | a resource of the next page |

`preload` requires `as` (`font`, `image`, `style`, `script`, `fetch`): without it the priority and checks are wrong, and the resource is downloaded twice. Fonts also need `crossorigin`, even from your own domain. If a preloaded resource is not used within the first seconds, the browser logs a console warning: a needless `preload` takes bandwidth from what really matters.

## Priorities

The `fetchpriority="high"` or `"low"` attribute on `<img>`, `<link>` and `<script>`, and the `priority` option of `fetch`, move a resource relative to others of the same type. The main use: `fetchpriority="high"` on the LCP image (otherwise the browser learns it matters only after layout) and `"low"` on carousel images that are not visible yet.

```html
<img src="/hero.avif" width="1200" height="600" alt="…" fetchpriority="high" />
<img src="/slide-2.avif" width="1200" height="600" alt="…" loading="lazy" fetchpriority="low" />
```

## The next page: Speculation Rules

The Speculation Rules API describes in JSON which pages to fetch ahead (`prefetch`) or even fully render in the background (`prerender`), and how early (`eagerness`: on hover, on press and so on). Navigating to a prerendered page feels instant.

```html
<script type="speculationrules">
  {
    "prerender": [{ "where": { "href_matches": "/products/*" }, "eagerness": "moderate" }]
  }
</script>
```

Today this works in Chromium-based browsers, and `prefetch` is in recent Safari; other browsers simply ignore the block, so it is safe to add. Never prerender pages that change data when opened (logout, cart).

## 103 Early Hints

The server spends time generating HTML while the browser sits idle. A `103 Early Hints` response arrives before the main one and carries `Link` headers with `preload` and `preconnect`: the browser starts loading styles and fonts while the server is still thinking. It is supported in Chrome, Firefox and Safari and is usually configured on the CDN. It replaces the removed HTTP/2 Server Push.

```http
HTTP/1.1 103 Early Hints
Link: </app.3f9c2a.css>; rel=preload; as=style
Link: <https://fonts.example.com>; rel=preconnect

HTTP/1.1 200 OK
Content-Type: text/html
```

## Compression

Text resources (HTML, CSS, JS, JSON, SVG) are compressed on the server or CDN, and the browser announces support in `Accept-Encoding`:

- `gzip` is supported everywhere;
- `br` (Brotli) compresses text better than gzip and is supported by all modern browsers;
- `zstd` (Zstandard) is faster at comparable ratios, available in recent Chrome, Firefox and Safari.

Static files are compressed ahead of time, at build, with the highest level; dynamic responses are compressed on the fly at a fast level. Images and video are already compressed by their formats (AVIF, WebP, AV1), so compressing them again gains nothing.

## CDNs

A CDN keeps copies of resources on servers closer to users: less latency and less load on your server. It also terminates TLS, supports HTTP/3, compresses, and sends Early Hints. What to keep and for how long, the CDN learns from `Cache-Control` (`s-maxage` for it, `max-age` for the browser, see [caching](/learn/net-caching)). After a release, hashed resources need no purge, while HTML and API responses are purged or given a short lifetime.

## Key points

- `preconnect` for a couple of key domains, `preload` with `as` for late-discovered resources, `prefetch` for the next page.
- `fetchpriority="high"` on the LCP image, `"low"` on unimportant ones.
- Speculation Rules fetch or render the next pages ahead; not for pages with side effects.
- `103 Early Hints` starts loading while the server generates HTML.
- Compress text with `br` or `zstd` with a `gzip` fallback; a CDN brings resources closer and follows `Cache-Control`.
