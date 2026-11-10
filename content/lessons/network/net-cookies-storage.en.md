## What this lesson covers

Where should the session, settings and drafts live: in cookies, `localStorage`, `sessionStorage` or IndexedDB? It depends on who must read the data (the server or only the client), how much of it there is and how sensitive it is. We cover cookie attributes, `SameSite` and third-party cookies, a comparison of the storages, and where to keep tokens. The examples run in jsdom on the page `https://app.example.com/`.

## Cookies: what goes to the server

A cookie is set by the server with a `Set-Cookie` header (or by a script via `document.cookie`), and the browser attaches it to every matching request in the `Cookie` header. Attributes define the behaviour:

| Attribute | What it does |
|---|---|
| `Max-Age`, `Expires` | lifetime; without them the cookie lives until the browser closes (a session cookie); `Max-Age=0` deletes it |
| `Domain` | which hosts: without it only the current host, with it subdomains too |
| `Path` | which paths |
| `Secure` | HTTPS only |
| `HttpOnly` | not readable from JavaScript (`document.cookie`), only for the server |
| `SameSite` | whether the cookie goes with requests started from other sites |
| `Partitioned` | a separate copy per top-level site (CHIPS), for embedded widgets |

```js dom
document.cookie = "theme=dark; Path=/; Max-Age=31536000"
document.cookie = "session=abc123; HttpOnly"
document.cookie = "tracker=1; Domain=ads.example.org"
document.cookie = "promo=spring; Max-Age=0"
console.log(document.cookie)
```

```output
theme=dark
```

A script cannot set an `HttpOnly` cookie or a cookie for another domain, and `Max-Age=0` deletes it. That is exactly why the server issues the session as `HttpOnly`: even with XSS, an attacker's script cannot read it through `document.cookie`.

The `__Host-` name prefix makes the browser require `Secure`, `Path=/` and no `Domain`: a subdomain cannot overwrite such a cookie.

## SameSite

A "site" is the registrable domain plus scheme: `app.example.com` and `api.example.com` are one site, `example.com` and `example.org` are different ones.

| Value | When the cookie goes with a cross-site request |
|---|---|
| `Strict` | never: even following a link from another site arrives without it |
| `Lax` | only on a top-level `GET` navigation (clicking a link); not with `fetch`, images or `POST` forms from other sites |
| `None` | always; requires `Secure` |

`SameSite=Lax` blocks most CSRF attacks: a form on another site sends its `POST` without the session cookie. Chrome treats a cookie without a `SameSite` attribute as `Lax`, but Firefox and Safari do not, so set the value explicitly.

**Third-party cookies** (from domains other than the site in the address bar) are blocked by Safari and isolated per top-level site by Firefox. A chat or payment widget on other people's pages uses `SameSite=None; Secure; Partitioned`.

## Browser storage

| | Cookies | `localStorage` | `sessionStorage` | IndexedDB |
|---|---|---|---|---|
| Size | about 4 KB per cookie | about 5 MB per origin | about 5 MB | hundreds of MB and more, per the browser quota |
| Lifetime | until expiry or browser close | until removed | while the tab is open | until removed |
| Visible to | the server and (without `HttpOnly`) JS | JS of its origin | JS of this tab | JS of its origin, workers |
| API | the `document.cookie` string | synchronous, strings only | synchronous, strings only | asynchronous, objects, indexes, transactions |

`localStorage` stores only strings: an object turns into `"[object Object]"`, a number comes back as a string. Save with `JSON.stringify`, read with `JSON.parse` inside `try`: in private mode or with a full quota, writing throws.

```js dom
localStorage.setItem("count", 1)
localStorage.setItem("user", { name: "Ada" })
localStorage.setItem("prefs", JSON.stringify({ theme: "dark" }))
console.log(typeof localStorage.getItem("count"), localStorage.getItem("user"))
console.log(JSON.parse(localStorage.getItem("prefs")).theme, localStorage.getItem("missing"))
```

```output
string [object Object]
dark null
```

`localStorage` is synchronous: large data blocks the main thread on reads and writes. Large and structured data (an offline cache, drafts with attachments) goes to IndexedDB, usually through a wrapper such as `idb`. The `storage` event tells other tabs of the same origin about `localStorage` changes.

## Where to keep a token

- **An `HttpOnly` cookie** with `Secure` and `SameSite=Lax` or `Strict`: scripts cannot read the token even with XSS; `SameSite` and a CSRF token protect against CSRF. This is the default for web apps.
- **`localStorage`**: convenient for an API on another domain, but any injected script can read the token. If you go this way, keep the token short-lived and guard strictly against XSS.
- **JavaScript memory** (a variable): gone on reload, usually paired with an `HttpOnly` cookie for refreshing.

XSS and CSRF are covered in detail in the ["Security"](/track/security) track.

## Key points

- `HttpOnly` hides a cookie from JS, `Secure` requires HTTPS, `SameSite` decides whether the cookie goes with cross-site requests.
- `Lax` blocks most CSRF; `None` requires `Secure`; third-party embedding uses `Partitioned`.
- `localStorage` is synchronous and stores only strings; large data goes to IndexedDB.
- Keep the session in an `HttpOnly` cookie; `localStorage` is readable by any script on the page.
