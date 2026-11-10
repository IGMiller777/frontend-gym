## What this lesson covers

Every frontend developer runs into "blocked by CORS policy", and almost every candidate is asked how CORS works. We cover the same-origin policy that CORS relaxes, simple and preflighted requests, cookies, and what CORS does and does not protect.

## The same-origin policy

The browser separates pages by **origin**: scheme, host and port. A script may send a request anywhere, but by default it may not **read the response** from another origin. Otherwise any site could read your email, open in the next tab, using your cookies.

```js run
const sameOrigin = (a, b) => new URL(a).origin === new URL(b).origin
const page = "https://app.example.com/settings"
for (const target of [
  "https://app.example.com/api/me",
  "http://app.example.com/api/me",
  "https://api.example.com/me",
  "https://app.example.com:8443/api/me",
]) {
  console.log(sameOrigin(page, target) ? "same  " : "cross ", target)
}
```

```output
same   https://app.example.com/api/me
cross  http://app.example.com/api/me
cross  https://api.example.com/me
cross  https://app.example.com:8443/api/me
```

A subdomain is already another origin. Do not confuse it with a "site": `app.example.com` and `api.example.com` are different origins but the same site, which matters for [SameSite on cookies](/learn/net-cookies-storage).

## CORS: the server allows reading

CORS (Cross-Origin Resource Sharing) is how the **server** tells the browser which other origins may read its responses. The browser sends an `Origin` header, the server answers with `Access-Control-Allow-Origin`. If the origin is not allowed, the request has still reached the server and run, but the browser will not hand the response to the script.

```http
GET /me HTTP/1.1
Host: api.example.com
Origin: https://app.example.com

HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://app.example.com
Vary: Origin
```

`Vary: Origin` is needed when the server echoes different origins in the response: otherwise a CDN may cache the response for one origin and serve it to another.

## Simple and preflighted requests

A request is **simple** if the method is `GET`, `HEAD` or `POST`, the headers are only from a short safelist, and `Content-Type` is one of `text/plain`, `multipart/form-data`, `application/x-www-form-urlencoded`. A plain HTML form could send such a request too, so the browser sends it right away.

Any other request (a `PUT` or `DELETE` method, `Content-Type: application/json`, an `Authorization` header) is **preflighted** first: the browser sends `OPTIONS` and asks for permission.

```http
OPTIONS /orders HTTP/1.1
Origin: https://app.example.com
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: content-type, authorization

HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: content-type, authorization
Access-Control-Max-Age: 600
```

The real `PUT` goes out only after a successful answer to `OPTIONS`. `Access-Control-Max-Age` lets the browser remember the permission instead of preflighting every time. A frequent cause of a "CORS error" is actually the server answering `OPTIONS` with `401` or `404` because it requires authorization for the preflight too.

## Cookies and credentials

By default, `fetch` to another origin does **not** send cookies. To send them you need `credentials: "include"`, and the server must answer with `Access-Control-Allow-Credentials: true` and a **specific** origin in `Access-Control-Allow-Origin`: with credentials, the `*` wildcard is forbidden.

```js
await fetch("https://api.example.com/me", { credentials: "include" })
```

## What CORS does not do

- CORS does **not protect the server**. `curl`, Postman and other servers send requests without any restriction. It protects the user in the browser from other sites.
- CORS does not prevent **sending** a simple request: a form on another site can send a `POST` with the user's cookies. A CSRF token or `SameSite` on the cookie protects against that (see the ["Security"](/track/security) track).
- `mode: "no-cors"` does not "turn CORS off": the request goes out, but the response is opaque, and the script cannot read its status or body.

In development, CORS is usually avoided with the dev server's proxy: Vite forwards `/api` to the backend, and for the browser the request stays on its own origin. In production, the frontend and the API are often served from one origin for the same reason.

## Key points

- An origin is the scheme, host and port; a subdomain is another origin.
- The browser sends cross-origin requests, but lets scripts read the response only if the server returned `Access-Control-Allow-Origin`.
- Non-simple requests (JSON, `PUT`, `Authorization`) go after an `OPTIONS` preflight.
- With `credentials: "include"` you need a specific origin and `Allow-Credentials: true`; the wildcard is forbidden.
- CORS protects the user, not the server; CSRF tokens and `SameSite` protect against forged requests.
