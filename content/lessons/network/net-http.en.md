## What this lesson covers

The frontend talks to servers over HTTP, and half of all loading, caching and error problems are explained by how the protocol works. We cover requests and responses, methods and their properties, the status codes worth knowing by heart, and why HTTP/2 and HTTP/3 beat HTTP/1.1 for the frontend.

## Request and response

A request consists of a method, a URL, headers and (not always) a body. A response has a status code, headers and a body. Parse URLs with `URL` and query strings with `URLSearchParams`: it encodes special characters itself, so there is no need to glue strings by hand.

```js run
const url = new URL("https://shop.example.com:8443/search?q=red+shoes&page=2#results")
console.log(url.protocol, url.hostname, url.port, url.pathname)
console.log(url.searchParams.get("q"), url.searchParams.get("page"), url.hash)
console.log(url.origin)

const params = new URLSearchParams({ q: "кофе & чай", sort: "price" })
console.log(params.toString())
```

```output
https: shop.example.com 8443 /search
red shoes 2 #results
https://shop.example.com:8443
q=%D0%BA%D0%BE%D1%84%D0%B5+%26+%D1%87%D0%B0%D0%B9&sort=price
```

`origin` is the scheme, host and port. It defines the same-origin policy that [CORS](/learn/net-cors) and [cookies](/learn/net-cookies-storage) are built on.

## Methods

| Method | Purpose | Safe | Idempotent |
|---|---|---|---|
| `GET` | fetch a resource | yes | yes |
| `HEAD` | the same without a body | yes | yes |
| `POST` | create, perform an action | no | no |
| `PUT` | replace a resource entirely | no | yes |
| `PATCH` | change part of a resource | no | not necessarily |
| `DELETE` | delete | no | yes |
| `OPTIONS` | ask about capabilities, CORS preflight | yes | yes |

A **safe** method does not change server state: such a request can be sent ahead of time, repeated or cached. An **idempotent** method gives the same result when repeated: that is why browsers and libraries may retry a `PUT` after a network drop, but not a `POST`. Submitting a payment form twice is exactly a non-idempotent `POST`; an idempotency key in a header protects against it.

## Status codes

| Code | Meaning | What the frontend does |
|---|---|---|
| `200`, `201`, `204` | success, created, success without a body | shows the result |
| `301`, `308` | permanent redirect | the browser follows `Location` itself |
| `302`, `307` | temporary redirect | the same; `307` and `308` keep the method and body |
| `304` | not modified | uses the cached response (see [caching](/learn/net-caching)) |
| `400`, `422` | bad request, validation error | shows field errors |
| `401` | not authenticated | sends to login or refreshes the token |
| `403` | forbidden | shows "no access", retrying will not help |
| `404` | not found | a "not found" page or message |
| `409` | version conflict | offers to reload the data |
| `429` | too many requests | waits for `Retry-After` and retries |
| `500`, `502`, `503`, `504` | server or gateway error | retries idempotent requests with a delay |

`401` and `403` get mixed up most often: the first is about "who are you", the second about "you may not".

## HTTP/1.1, HTTP/2, HTTP/3

- **HTTP/1.1**: one connection serves one request at a time. The browser opens up to six connections per host, and other requests wait. Hence old tricks: bundling files, sprites, serving from several domains.
- **HTTP/2**: many requests at once over one TCP connection (multiplexing), compressed headers, priorities. Bundling everything and domain sharding are no longer needed and even hurt. But losing one TCP packet delays every stream on the connection (head-of-line blocking at the TCP level).
- **HTTP/3**: the same ideas over QUIC (UDP). Streams are independent, a lost packet delays only its own stream, connections are set up faster and survive a network change (Wi-Fi → mobile). Lossy mobile networks gain the most.

The server and browser choose the protocol; frontend code does not change. HTTP/2 Server Push, which was in the standard, is not supported by browsers; for early hints use `103 Early Hints` (see [the loading lesson](/learn/net-loading)).

## Key points

- `URL` and `URLSearchParams` parse and build addresses without manual encoding; `origin` is the scheme, host and port.
- Safe methods do not change data, idempotent ones may be retried; never retry a `POST` blindly.
- `401` "log in", `403` "not allowed", `304` "use the cache", `429` "wait".
- HTTP/2 multiplexes requests over one connection, HTTP/3 removes TCP blocking with QUIC.
