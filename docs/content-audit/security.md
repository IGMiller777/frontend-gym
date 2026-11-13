# Аудит заметок: безопасность

Источники в Notion: раздел «Security issues» страницы «Angular» (XSS, санитизация, `bypassSecurityTrust*`, XSRF, XSSI; прочитан целиком), разделы «eval is evil» и «Mixins» страницы «JS», разделы «Server Actions» и «Service Worker» страницы «React», раздел «Requirements» (авторизация и хранение токена) страницы «System Design», раздел про `innerHTML` страницы «Browser». Отдельной страницы про безопасность в Notion нет; темы CSP, Trusted Types, CSRF целиком, OAuth в браузере, изоляция окон и цепочка поставок в заметках отсутствуют и написаны с нуля.

Утверждения сверены с OWASP Cheat Sheet Series (XSS, DOM XSS, CSRF, Prototype Pollution), OWASP Top 10:2025, MDN (CSP, Trusted Types, Sanitizer API, Fetch Metadata, `postMessage`, COOP и COEP, SRI), web.dev (Strict CSP, Trusted Types, Fetch Metadata), RFC 6749, 7636, 9700 и 10017, angular.dev, react.dev, vuejs.org, nextjs.org, docs.npmjs.com, pnpm.io. Поддержка браузерами взята из MDN Browser Compat Data 8.1.9 (12 ноября 2026). Примеры выполняются в CI: в Node.js (Hono, Web Crypto, `rolldown`, `react-dom/server`) и в jsdom (DOMPurify 3.4.17).

## Актуальные версии и состояние (ноябрь 2026)

| Что | Версия или статус | Что важно |
|---|---|---|
| OWASP Top 10 | 2025 | A01 Broken Access Control, A02 Security Misconfiguration, A03 Software Supply Chain Failures (новая категория), A05 Injection (включая XSS) |
| Trusted Types | Во всех браузерах: Chrome 83, Firefox 148, Safari 26 | Можно включать `require-trusted-types-for 'script'` без оговорок про Chromium |
| Sanitizer API, `Element.setHTML()` | Chrome 146, Firefox 148, нет в Safari | Пока нужен запасной вариант: DOMPurify |
| Fetch Metadata (`Sec-Fetch-Site`) | Все браузеры, Safari с 16.4 | OWASP рекомендует как основной сигнал против CSRF вместе с запасной проверкой `Origin` |
| `SameSite=Lax` по умолчанию | Только Chromium | В Firefox за флагом, в Safari нет; на умолчание полагаться нельзя |
| OAuth 2.0 для браузерных приложений | RFC 10017 (BCP 212, август 2026) | Рекомендует BFF; implicit flow запрещён, PKCE обязателен (RFC 9700, январь 2025) |
| OAuth 2.1 | Черновик `draft-ietf-oauth-v2-1-17` | Ещё не RFC |
| React | 19.3 | Блокирует `javascript:` в `href` и `src`; `dangerouslySetInnerHTML` не очищает; проверено запуском |
| npm | Trusted publishing, гранулярные токены до 7 дней | Ответ GitHub на червя Shai-Hulud (сентябрь 2025) |
| pnpm | 11 | Не запускает скрипты сборки зависимостей без `allowBuilds`, `minimumReleaseAge` 1 день по умолчанию, `blockExoticSubdeps` |
| DOMPurify | 3.4.17 | По умолчанию оставляет `<form>` и `<input>`: для комментариев нужен свой список разрешённых тегов; проверено запуском |

## Найденные ошибки

| Где | В заметках | На самом деле | Источник |
|---|---|---|---|
| Angular, Security issues | «Основные угрозы: XSS, CSRF, CORS проблемы» | CORS не угроза, а способ ослабить политику одного источника; опасна неверная настройка: отражение любого `Origin` вместе с `Access-Control-Allow-Credentials: true` | [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS), [OWASP: HTML5 Security, CORS](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html) |
| Angular, XSS | «Интерполяция очищена, но не `innerHTML`»: `[innerHTML]` «нет» | `[innerHTML]` проходит санитизацию: `<script>` и обработчики удаляются; опасны прямые `nativeElement.innerHTML` и `bypassSecurityTrust*` (записано и в `angular.md`, проверено запуском в `ng-architecture`) | [angular.dev: Security](https://angular.dev/best-practices/security) |
| Angular, `bypassSecurityTrust*` | Метод нужен, «чтобы доверять коду, устанавливаемому динамически»; пример с `javascript:alert("Hi")` подан как способ | Это отключение защиты: ссылка из примера выполнит код при клике. Документация показывает пример как опасный; доверять можно только значениям, которые вы создали или очистили сами | [angular.dev: Security](https://angular.dev/best-practices/security) |
| Angular, XSRF | Защита: «случайно сгенерированный токен аутентификации в cookie», клиент добавляет заголовок «во все последующие запросы» | Это CSRF-токен, а не токен аутентификации: cookie `XSRF-TOKEN` читается скриптом, а cookie сессии остаётся `HttpOnly`. Токен должен быть привязан к сессии. `HttpClient` добавляет `X-XSRF-TOKEN` только к изменяющим запросам на относительные и свои URL, не к `GET` и `HEAD` | [angular.dev: Security](https://angular.dev/best-practices/security), [OWASP: CSRF](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html) |
| JS, eval | «`eval` игнорирует CSP в большинстве случаев» | Наоборот: CSP без `'unsafe-eval'` блокирует `eval`, `new Function` и `setTimeout` со строкой (записано и в `js-core.md`) | [MDN: CSP script-src](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/script-src) |
| JS, eval | «`Function` только если нужен sandbox (лучше `vm`/`vm2` в Node)» | Ни `new Function`, ни `node:vm` не песочница: документация Node прямо говорит, что `vm` не механизм безопасности; библиотеки поверх него неоднократно обходили. Чужой код изолируют процессом, контейнером или iframe с `sandbox` на другом источнике | [Node.js: vm](https://nodejs.org/api/vm.html) |
| JS, Mixins | `lodash.merge` для «безопасного объединения» | Глубокое слияние недоверенных данных классический путь к prototype pollution: ключ `__proto__` из `JSON.parse` попадает в `Object.prototype`. В lodash до 4.17.11 уязвимы `merge`, `mergeWith`, `defaultsDeep` (CVE-2018-16487); свои утилиты слияния часто уязвимы до сих пор; проверено запуском | [OWASP: Prototype Pollution](https://cheatsheetseries.owasp.org/cheatsheets/Prototype_Pollution_Prevention_Cheat_Sheet.html) |
| React, Server Actions | «Безопасность: код выполняется на сервере» | Server Function это публичный HTTP-эндпоинт: аргументы, права и авторизацию проверяют внутри. Next.js сверяет `Origin` с `Host` и принимает только `POST`, но проверку прав за вас не делает (записано и в `react.md`) | [nextjs.org: Data Security](https://nextjs.org/docs/app/guides/data-security) |
| React, Service Worker | «CSP блокирует `script-src 'self'` без `serviceworker`» | Ключевого слова `serviceworker` в CSP нет. Скрипт Service Worker регулирует `worker-src`, при его отсутствии `child-src`, затем `script-src`, затем `default-src`; скрипт воркера всегда со своего источника, поэтому хватает `'self'` | [MDN: worker-src](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/worker-src) |
| Обзор трека (приложение) | «Короткоживущий access-токен хранить в памяти страницы» как решение | Память уменьшает риск, но при XSS скрипт атакующего действует от имени страницы: отправляет запросы и может получить новые токены через скрытый iframe. RFC 10017 рекомендует BFF: токены только на сервере, в браузере `HttpOnly`-cookie сессии. Обзор исправлен | [RFC 10017](https://www.rfc-editor.org/rfc/rfc10017.html) |

## Покрытие заметок Notion

| Тема в заметках | Где разобрано |
|---|---|
| XSS, `innerHTML`, интерполяция и санитизация | `sec-xss`; Angular в `ng-architecture#XSS и санитизация`, Vue в `vue-best-practices#Безопасность` |
| `bypassSecurityTrust*`, `DomSanitizer` | `sec-xss#Фреймворки и их лазейки`; подробно в `ng-architecture` |
| XSRF, токен в cookie и заголовке | `sec-csrf`; Angular в `ng-architecture#XSRF и XSSI` |
| XSSI | `ng-architecture#XSRF и XSSI` |
| CORS | `net-cors`; ошибки настройки в `sec-isolation#CORS: ошибки настройки` |
| `eval` и CSP | `sec-csp#Что ещё запрещает строгая политика` |
| Песочница для чужого кода | `sec-isolation#Чужой код в iframe` |
| Слияние объектов | `sec-supply-chain#Prototype pollution` |
| Server Actions | `sec-checklist#Фреймворки`; подробно в `react-server` |
| CSP и Service Worker | `sec-csp#Директивы` |
| Хранение токена, refresh-токены | `sec-auth`; атрибуты cookie в `net-cookies-storage` |

Добавлено сверх заметок, потому что об этом спрашивают: модель угроз и разница origin и site, секреты в бандле, DOM XSS (источники и приёмники), DOMPurify и Sanitizer API, строгая CSP на nonce, `strict-dynamic`, отчёты CSP, Trusted Types, Fetch Metadata и подписанный double-submit токен, OAuth с PKCE и BFF по RFC 10017, JWT и его ошибки, passkeys, кликджекинг и `frame-ancestors`, `postMessage`, `window.opener` и COOP, COEP и изоляция, открытые редиректы, цепочка поставок npm (Shai-Hulud, trusted publishing, настройки pnpm), SRI, prototype pollution, проверка заголовков в CI и порядок ответа на собеседовании.
