## О чём урок

Ошибка «blocked by CORS policy» встречается каждому фронтендеру, а вопрос «как работает CORS» почти каждому кандидату. Здесь разберём политику одного источника, которую CORS ослабляет, простые и предварительные запросы, работу с cookies и то, что CORS защищает, а что нет.

## Политика одного источника

Браузер разделяет страницы по **источнику** (origin): схема, хост и порт. Скрипт может отправить запрос куда угодно, но **прочитать ответ** с другого источника ему по умолчанию нельзя. Иначе любой сайт мог бы читать вашу почту, открытую в соседней вкладке, с вашими cookies.

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

Поддомен это уже другой источник. Не путайте с «сайтом» (site): `app.example.com` и `api.example.com` разные источники, но один сайт, и это важно для [SameSite у cookies](/learn/net-cookies-storage).

## CORS: сервер разрешает чтение

CORS (Cross-Origin Resource Sharing) это способ, которым **сервер** говорит браузеру, каким чужим источникам можно читать его ответы. Браузер отправляет заголовок `Origin`, сервер отвечает `Access-Control-Allow-Origin`. Если источник не разрешён, запрос всё равно дошёл до сервера и выполнился, но браузер не отдаст ответ скрипту.

```http
GET /me HTTP/1.1
Host: api.example.com
Origin: https://app.example.com

HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://app.example.com
Vary: Origin
```

`Vary: Origin` нужен, когда сервер подставляет разные источники в ответ: иначе CDN может закэшировать ответ для одного источника и отдать другому.

## Простые и предварительные запросы

Запрос считается **простым**, если метод `GET`, `HEAD` или `POST`, заголовки только из короткого безопасного списка, а `Content-Type` один из `text/plain`, `multipart/form-data`, `application/x-www-form-urlencoded`. Такой запрос мог отправить и обычная HTML-форма, поэтому браузер шлёт его сразу.

Любой другой запрос (метод `PUT` или `DELETE`, `Content-Type: application/json`, заголовок `Authorization`) сначала проходит **предварительную проверку** (preflight): браузер отправляет `OPTIONS` и спрашивает разрешения.

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

Только после успешного ответа на `OPTIONS` уходит настоящий `PUT`. `Access-Control-Max-Age` позволяет браузеру запомнить разрешение и не повторять предзапрос каждый раз. Частая причина «CORS-ошибки» на самом деле в том, что сервер отвечает на `OPTIONS` ошибкой `401` или `404`, потому что требует авторизацию и для предзапроса.

## Cookies и учётные данные

По умолчанию `fetch` на чужой источник **не отправляет** cookies. Чтобы отправить, нужен `credentials: "include"`, а сервер должен ответить `Access-Control-Allow-Credentials: true` и **конкретным** источником в `Access-Control-Allow-Origin`: с учётными данными звёздочка `*` запрещена.

```js
await fetch("https://api.example.com/me", { credentials: "include" })
```

## Что CORS не делает

- CORS **не защищает сервер**. `curl`, Postman и другой сервер отправят запрос без всяких ограничений. Это защита пользователя в браузере от чужих сайтов.
- CORS не мешает **отправить** простой запрос: форма с чужого сайта может отправить `POST` с cookies пользователя. От этого защищает CSRF-токен или `SameSite` у cookie (см. трек [«Безопасность»](/track/security)).
- `mode: "no-cors"` не «отключает CORS»: запрос уйдёт, но ответ будет непрозрачным (opaque), скрипт не прочитает ни статус, ни тело.

В разработке CORS обычно обходят прокси dev-сервера: Vite перенаправляет `/api` на бэкенд, и для браузера запрос остаётся на своём источнике. В продакшене фронтенд и API часто размещают на одном источнике по той же причине.

## Главное

- Источник это схема, хост и порт; поддомен уже другой источник.
- Браузер отправляет чужие запросы, но читать ответ разрешает, только если сервер вернул `Access-Control-Allow-Origin`.
- Непростые запросы (JSON, `PUT`, `Authorization`) идут после предзапроса `OPTIONS`.
- С `credentials: "include"` нужен конкретный источник и `Allow-Credentials: true`, звёздочка запрещена.
- CORS защищает пользователя, а не сервер; от подделки запросов защищают CSRF-токены и `SameSite`.
