## О чём урок

Где хранить сессию, настройки и черновики: в cookies, `localStorage`, `sessionStorage` или IndexedDB? Ответ зависит от того, кто должен читать данные (сервер или только клиент), сколько их и насколько они чувствительны. Здесь атрибуты cookies, `SameSite` и сторонние cookies, сравнение хранилищ и где держать токены. Примеры выполняются в jsdom на странице `https://app.example.com/`.

## Cookies: что отправляется на сервер

Cookie ставит сервер заголовком `Set-Cookie` (или скрипт через `document.cookie`), а браузер прикладывает её к каждому подходящему запросу в заголовке `Cookie`. Поведение задают атрибуты:

| Атрибут | Что делает |
|---|---|
| `Max-Age`, `Expires` | срок жизни; без них cookie живёт до закрытия браузера (сессионная); `Max-Age=0` удаляет |
| `Domain` | для каких хостов: без него только текущий хост, с ним ещё и поддомены |
| `Path` | для каких путей |
| `Secure` | только по HTTPS |
| `HttpOnly` | недоступна из JavaScript (`document.cookie`), только для сервера |
| `SameSite` | отправлять ли cookie с запросами, начатыми с других сайтов |
| `Partitioned` | отдельная копия для каждого сайта верхнего уровня (CHIPS), для встраиваемых виджетов |

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

Скрипт не может поставить `HttpOnly`-cookie и cookie для чужого домена, а `Max-Age=0` её удаляет. Именно поэтому сессию сервер выдаёт в `HttpOnly`: даже при XSS скрипт злоумышленника не прочитает её через `document.cookie`.

Префикс имени `__Host-` заставляет браузер требовать `Secure`, `Path=/` и отсутствие `Domain`: такую cookie не перезапишет поддомен.

## SameSite

«Сайт» это регистрируемый домен со схемой: `app.example.com` и `api.example.com` один сайт, `example.com` и `example.org` разные.

| Значение | Когда cookie уходит с межсайтовым запросом |
|---|---|
| `Strict` | никогда: даже переход по ссылке с другого сайта придёт без неё |
| `Lax` | только при переходе верхнего уровня методом `GET` (клик по ссылке); не уходит с `fetch`, картинками и `POST`-формами с чужих сайтов |
| `None` | всегда; требует `Secure` |

`SameSite=Lax` закрывает большинство CSRF-атак: форма на чужом сайте отправит `POST` без cookie сессии. Chrome считает cookie без атрибута `SameSite` как `Lax`, но Firefox и Safari так не делают, поэтому значение указывают явно.

**Сторонние cookies** (третьих сторон, от доменов, отличных от сайта в адресной строке) Safari блокирует, а Firefox изолирует по сайту верхнего уровня. Для чата или платёжного виджета на чужих страницах используют `SameSite=None; Secure; Partitioned`.

## Хранилища браузера

| | Cookies | `localStorage` | `sessionStorage` | IndexedDB |
|---|---|---|---|---|
| Объём | около 4 КБ на cookie | около 5 МБ на источник | около 5 МБ | сотни МБ и больше, по квоте браузера |
| Живёт | до срока или закрытия браузера | пока не удалят | пока открыта вкладка | пока не удалят |
| Видно | сервер и (без `HttpOnly`) JS | JS своего источника | JS этой вкладки | JS своего источника, воркеры |
| API | строка `document.cookie` | синхронный, только строки | синхронный, только строки | асинхронный, объекты, индексы, транзакции |

`localStorage` хранит только строки: объект превратится в `"[object Object]"`, число вернётся строкой. Сохраняют через `JSON.stringify`, читают через `JSON.parse` в `try`: в приватном режиме или при заполненной квоте запись бросает исключение.

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

`localStorage` синхронный: большой объём блокирует главный поток при чтении и записи. Для больших и структурированных данных (офлайн-кэш, черновики с вложениями) используют IndexedDB, обычно через обёртку вроде `idb`. Событие `storage` сообщает другим вкладкам того же источника об изменениях `localStorage`.

## Где хранить токен

- **`HttpOnly`-cookie** с `Secure` и `SameSite=Lax` или `Strict`: скрипт не прочитает токен даже при XSS; от CSRF защищает `SameSite` и CSRF-токен. Это вариант по умолчанию для веб-приложений.
- **`localStorage`**: удобно для API на другом домене, но любой внедрённый скрипт прочитает токен. Если выбирают этот путь, делают токен короткоживущим и строго следят за XSS.
- **Память JavaScript** (переменная): исчезает при перезагрузке, обычно в паре с `HttpOnly`-cookie для обновления.

Подробно об XSS и CSRF в треке [«Безопасность»](/track/security).

## Главное

- `HttpOnly` скрывает cookie от JS, `Secure` требует HTTPS, `SameSite` решает, уходит ли cookie с межсайтовыми запросами.
- `Lax` закрывает большинство CSRF; `None` требует `Secure`; стороннее встраивание через `Partitioned`.
- `localStorage` синхронный и хранит только строки; большие данные в IndexedDB.
- Сессию держат в `HttpOnly`-cookie; `localStorage` доступен любому скрипту на странице.
