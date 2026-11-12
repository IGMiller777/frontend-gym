import type { Source } from '../sources'
import type { Lesson, Module } from './types'

const src = (title: string, url: string): Source => ({ title, url, kind: 'official' })
const spec = (title: string, url: string): Source => ({ title, url, kind: 'spec' })
const mdn = (title: string, path: string) => src(`MDN: ${title}`, `https://developer.mozilla.org/en-US/docs/${path}`)
const webdev = (title: string, path: string) => src(`web.dev: ${title}`, `https://web.dev/articles/${path}`)
const owasp = (title: string, page: string) => src(`OWASP: ${title}`, `https://cheatsheetseries.owasp.org/cheatsheets/${page}.html`)
const rfc = (n: number, title: string) => spec(`RFC ${n}: ${title}`, `https://www.rfc-editor.org/rfc/rfc${n}.html`)
const verified = { date: '2026-11', version: 'OWASP Top 10:2025, RFC 10017, React 19.3, Trusted Types in all browsers, DOMPurify 3.4, pnpm 11' }

export const securityLessons: Lesson[] = [
  {
    id: 'sec-model',
    track: 'security',
    emoji: '🗺️',
    minutes: 12,
    title: { ru: 'Модель угроз фронтенда', en: 'The frontend threat model' },
    summary: {
      ru: 'От кого и что защищаем, origin и site, почему секреты в бандле публичны и проверки на клиенте не защищают, OWASP Top 10:2025 для фронтенда, HTTPS, HSTS и базовые заголовки.',
      en: 'Who we defend against and what, origin and site, why secrets in the bundle are public and client-side checks do not protect, the OWASP Top 10:2025 for the frontend, HTTPS, HSTS and baseline headers.',
    },
    quiz: {
      ru: [
        { q: 'Что входит в origin?', options: ['Только домен', 'Схема, хост и порт', 'Домен и путь', 'Схема и путь'], correct: 1, why: 'Origin это схема, хост и порт; путь не учитывается.' },
        { q: '`app.example.com` и `api.example.com` это...', options: ['Один origin и один сайт', 'Разные origin и разные сайты', 'Разные origin, один сайт', 'Один origin, разные сайты'], correct: 2, why: 'Хосты разные, а регистрируемый домен `example.com` общий.' },
        { q: 'Где можно хранить ключ платёжного API с правом списания?', options: ['Только на сервере', 'В переменной `VITE_`', 'В `localStorage`', 'В обфусцированном бандле'], correct: 0, why: 'Всё, что попало в бандл или браузер, читает любой пользователь.' },
        { q: 'Что делать с заголовком `X-XSS-Protection`?', options: ['Ставить `1; mode=block`', 'Заменить им CSP', 'Включать только для IE', 'Ставить `0` или не задавать'], correct: 3, why: 'Встроенный XSS-фильтр удалён из браузеров и сам создавал уязвимости.' },
      ],
      en: [
        { q: 'What makes up an origin?', options: ['Only the domain', 'Scheme, host and port', 'Domain and path', 'Scheme and path'], correct: 1, why: 'An origin is scheme, host and port; the path does not count.' },
        { q: '`app.example.com` and `api.example.com` are...', options: ['One origin and one site', 'Different origins and sites', 'Different origins, one site', 'One origin, different sites'], correct: 2, why: 'The hosts differ, but the registrable domain `example.com` is shared.' },
        { q: 'Where can a payment API key with charge rights live?', options: ['Only on the server', 'In a `VITE_` variable', 'In `localStorage`', 'In an obfuscated bundle'], correct: 0, why: 'Anything in the bundle or the browser can be read by any user.' },
        { q: 'What do you do with `X-XSS-Protection`?', options: ['Set `1; mode=block`', 'Use it instead of CSP', 'Enable it only for IE', 'Set `0` or leave it out'], correct: 3, why: 'The built-in XSS filter was removed from browsers and itself created vulnerabilities.' },
      ],
    },
    sources: [
      mdn('Same-origin policy', 'Web/Security/Defenses/Same-origin_policy'),
      webdev('"Same-site" and "same-origin"', 'same-site-same-origin'),
      src('OWASP Top 10:2025', 'https://top10.owasp.org/2025/'),
      mdn('Strict-Transport-Security', 'Web/HTTP/Reference/Headers/Strict-Transport-Security'),
      src('Vite: Env Variables and Modes', 'https://vite.dev/guide/env-and-mode'),
    ],
    verified,
  },
  {
    id: 'sec-xss',
    track: 'security',
    emoji: '💉',
    minutes: 15,
    title: { ru: 'XSS и санитизация', en: 'XSS and sanitizing' },
    summary: {
      ru: 'Хранимый, отражённый и DOM-based XSS, источники и приёмники, экранирование по контексту, что делают React, Vue и Angular и где их лазейки, DOMPurify и встроенный setHTML.',
      en: 'Stored, reflected and DOM-based XSS, sources and sinks, context-aware escaping, what React, Vue and Angular do and where their loopholes are, DOMPurify and the built-in setHTML.',
    },
    quiz: {
      ru: [
        { q: 'Какой вид XSS сервер может вообще не увидеть?', options: ['Хранимый', 'Отражённый', 'Через SQL', 'DOM-based'], correct: 3, why: 'Данные из `location.hash` или `postMessage` обрабатывает только клиентский скрипт.' },
        { q: 'Что выполнится после вставки через `innerHTML`?', options: ['`<script>`', '`<img onerror>`', 'Ничего', 'Только `<svg>`'], correct: 1, why: '`<script>` из `innerHTML` не запускается, а обработчики событий срабатывают.' },
        { q: 'Что React 19 делает со ссылкой `javascript:`?', options: ['Блокирует её', 'Выполняет по клику', 'Удаляет атрибут', 'Пишет предупреждение'], correct: 0, why: 'React подменяет URL кодом, который бросает ошибку.' },
        { q: 'Чем очищать HTML от пользователей?', options: ['Регулярным выражением', 'Функцией `encodeURI`', 'Санитайзером', 'Через `JSON.stringify`'], correct: 2, why: 'DOMPurify или `setHTML` разбирают HTML как браузер; регулярки обходятся.' },
      ],
      en: [
        { q: 'Which kind of XSS may the server never see?', options: ['Stored', 'Reflected', 'Through SQL', 'DOM-based'], correct: 3, why: 'Data from `location.hash` or `postMessage` is handled only by a client script.' },
        { q: 'What runs after inserting through `innerHTML`?', options: ['`<script>`', '`<img onerror>`', 'Nothing', 'Only `<svg>`'], correct: 1, why: 'A `<script>` from `innerHTML` does not run, but event handlers fire.' },
        { q: 'What does React 19 do with a `javascript:` link?', options: ['Blocks it', 'Runs it on click', 'Drops the attribute', 'Logs a warning'], correct: 0, why: 'React replaces the URL with code that throws.' },
        { q: 'What do you clean user HTML with?', options: ['A regular expression', 'The `encodeURI` function', 'A sanitizer', 'With `JSON.stringify`'], correct: 2, why: 'DOMPurify or `setHTML` parse HTML like the browser; regexes are bypassed.' },
      ],
    },
    sources: [
      owasp('Cross Site Scripting Prevention', 'Cross_Site_Scripting_Prevention_Cheat_Sheet'),
      owasp('DOM based XSS Prevention', 'DOM_based_XSS_Prevention_Cheat_Sheet'),
      mdn('Element.setHTML()', 'Web/API/Element/setHTML'),
      mdn('HTML Sanitizer API', 'Web/API/HTML_Sanitizer_API'),
      src('react.dev: Common components, dangerouslySetInnerHTML', 'https://react.dev/reference/react-dom/components/common'),
      src('vuejs.org: Security', 'https://vuejs.org/guide/best-practices/security.html'),
    ],
    verified,
  },
  {
    id: 'sec-csp',
    track: 'security',
    emoji: '🧱',
    minutes: 15,
    title: { ru: 'CSP и Trusted Types', en: 'CSP and Trusted Types' },
    summary: {
      ru: 'Почему списки доменов обходят, строгая CSP на nonce и хэшах, strict-dynamic, object-src и base-uri, внедрение через Report-Only, nonce в Next.js, Angular и Vite, Trusted Types во всех браузерах.',
      en: 'Why domain lists get bypassed, a strict nonce- and hash-based CSP, strict-dynamic, object-src and base-uri, rollout through Report-Only, nonces in Next.js, Angular and Vite, Trusted Types in all browsers.',
    },
    quiz: {
      ru: [
        { q: 'Как часто должен меняться nonce?', options: ['Раз в сутки', 'С каждым релизом', 'В каждом ответе', 'Никогда'], correct: 2, why: 'Одинаковый nonce знает и атакующий: он виден в любой отданной странице.' },
        { q: 'Что даёт `strict-dynamic`?', options: ['Доверие скриптам от доверенных', 'Разрешение на `eval` и `new Function`', 'Список разрешённых CDN-доменов', 'Запрет любых внешних скриптов'], correct: 0, why: 'Скрипт с nonce может грузить чанки и теги; списки доменов игнорируются.' },
        { q: 'Что не поддерживает CSP в `<meta>`?', options: ['`script-src`', '`frame-ancestors`', '`object-src`', '`base-uri`'], correct: 1, why: '`frame-ancestors`, `sandbox` и отчёты работают только в заголовке.' },
        { q: 'Что принимает `innerHTML` при Trusted Types?', options: ['Любую строку как раньше', 'Строку без тега `<script>`', 'Только значение `textContent`', 'Только объект `TrustedHTML`'], correct: 3, why: 'Обычная строка вызывает ошибку; `TrustedHTML` создают политики.' },
      ],
      en: [
        { q: 'How often must the nonce change?', options: ['Once a day', 'With each release', 'In every response', 'Never'], correct: 2, why: 'A constant nonce is known to the attacker too: it is visible in any served page.' },
        { q: 'What does `strict-dynamic` give?', options: ['Trust for scripts loaded by trusted ones', 'Permission for `eval` and `new Function`', 'A list of allowed CDN domains', 'A ban on all external scripts'], correct: 0, why: 'A script with a nonce can load chunks and tags; domain lists are ignored.' },
        { q: 'What does a CSP in `<meta>` not support?', options: ['`script-src`', '`frame-ancestors`', '`object-src`', '`base-uri`'], correct: 1, why: '`frame-ancestors`, `sandbox` and reports work only in the header.' },
        { q: 'What does `innerHTML` accept with Trusted Types?', options: ['Any string', 'A string without `<script>`', 'Only `textContent`', 'Only a `TrustedHTML`'], correct: 3, why: 'A plain string throws; policies create `TrustedHTML`.' },
      ],
    },
    sources: [
      webdev('Mitigate XSS with a strict Content Security Policy', 'strict-csp'),
      mdn('Content Security Policy', 'Web/HTTP/Guides/CSP'),
      mdn('Trusted Types API', 'Web/API/Trusted_Types_API'),
      webdev('Prevent DOM-based XSS with Trusted Types', 'trusted-types'),
      src('nextjs.org: Content Security Policy', 'https://nextjs.org/docs/app/guides/content-security-policy'),
      src('angular.dev: Security', 'https://angular.dev/best-practices/security'),
    ],
    verified,
  },
  {
    id: 'sec-csrf',
    track: 'security',
    emoji: '🎭',
    minutes: 13,
    title: { ru: 'CSRF', en: 'CSRF' },
    summary: {
      ru: 'Как чужая страница отправляет запрос с cookie пользователя, почему CORS не спасает, пределы SameSite, Fetch Metadata и Origin, подписанный double-submit токен, Angular и Next.js.',
      en: "How another page sends a request with the user's cookies, why CORS does not help, the limits of SameSite, Fetch Metadata and Origin, the signed double-submit token, Angular and Next.js.",
    },
    quiz: {
      ru: [
        { q: 'Почему CORS не защищает от CSRF?', options: ['CORS не применяется к формам вообще', 'Мешает читать, а не отправлять', 'CORS проверяет только GET-запросы', 'CORS смотрит только на cookie'], correct: 1, why: 'Атакующему нужен выполненный запрос, а не ответ.' },
        { q: 'Какой API не подвержен CSRF?', options: ['С токеном в `Authorization`', 'С сессией в cookie браузера', 'С входом через HTTP Basic', 'С классической формой входа'], correct: 0, why: 'Чужая страница не знает токен и не может заставить браузер его добавить.' },
        { q: 'Где `SameSite=Lax` включён по умолчанию?', options: ['Во всех браузерах', 'Только в Safari', 'Ни в одном браузере', 'Только в Chromium'], correct: 3, why: 'В Firefox за флагом, в Safari нет: атрибут задают явно.' },
        { q: 'Что OWASP рекомендует как основной сигнал?', options: ['Заголовок `Referer`', 'Заголовок `User-Agent`', 'Заголовок `Sec-Fetch-Site`', 'Число запросов'], correct: 2, why: 'Fetch Metadata есть во всех браузерах; `Origin` как запасной вариант.' },
      ],
      en: [
        { q: 'Why does CORS not protect against CSRF?', options: ['CORS does not apply to forms at all', 'It blocks reading, not sending', 'CORS checks only GET requests', 'CORS looks only at the cookies'], correct: 1, why: 'The attacker needs the request carried out, not the response.' },
        { q: 'Which API is not exposed to CSRF?', options: ['A token in `Authorization`', 'A cookie-based session', 'HTTP Basic authentication', 'A classic login form'], correct: 0, why: 'Another page does not know the token and cannot make the browser add it.' },
        { q: 'Where is `SameSite=Lax` the default?', options: ['In every browser', 'Only in Safari', 'In no browser', 'Only in Chromium'], correct: 3, why: 'In Firefox it is behind a flag, in Safari it is absent: set the attribute explicitly.' },
        { q: 'What does OWASP recommend as the main signal?', options: ['The `Referer` header', 'The `User-Agent` header', 'The `Sec-Fetch-Site` header', 'The request rate'], correct: 2, why: 'Fetch Metadata is in all browsers; `Origin` as a fallback.' },
      ],
    },
    sources: [
      owasp('Cross-Site Request Forgery Prevention', 'Cross-Site_Request_Forgery_Prevention_Cheat_Sheet'),
      webdev('Protect your resources with Fetch Metadata', 'fetch-metadata'),
      mdn('Sec-Fetch-Site', 'Web/HTTP/Reference/Headers/Sec-Fetch-Site'),
      src('angular.dev: Security, HttpClient XSRF', 'https://angular.dev/best-practices/security'),
      src('nextjs.org: Data Security', 'https://nextjs.org/docs/app/guides/data-security'),
    ],
    verified,
  },
  {
    id: 'sec-auth',
    track: 'security',
    emoji: '🔑',
    minutes: 16,
    title: { ru: 'Аутентификация и токены', en: 'Authentication and tokens' },
    summary: {
      ru: 'Сессия или токены, где хранить токен и что это меняет при XSS, OAuth и OpenID Connect с PKCE, BFF по RFC 10017, запрет implicit flow, JWT и его ошибки, ротация refresh-токенов, passkeys.',
      en: 'A session or tokens, where to store a token and what it changes under XSS, OAuth and OpenID Connect with PKCE, the BFF from RFC 10017, the end of the implicit flow, JWTs and their mistakes, refresh token rotation, passkeys.',
    },
    quiz: {
      ru: [
        { q: 'Что PKCE защищает в OAuth?', options: ['Пароль пользователя', 'Код авторизации', 'Refresh-токен в памяти', 'Cookie сессии'], correct: 1, why: 'Перехваченный код бесполезен без verifier, который не покидал приложение.' },
        { q: 'Какую архитектуру рекомендует RFC 10017?', options: ['Implicit flow', 'Токены в `localStorage`', 'BFF на сервере', 'Пароль через OAuth'], correct: 2, why: 'Токены только на сервере BFF, в браузере `HttpOnly`-cookie сессии.' },
        { q: 'Чем JWT защищён от чтения?', options: ['Ничем, он только подписан', 'Шифрованием payload', 'Кодировкой base64url', 'Атрибутом `HttpOnly`'], correct: 0, why: 'Любой декодирует содержимое; подпись защищает только от изменения.' },
        { q: 'Старый refresh-токен пришёл повторно. Что делает сервер?', options: ['Выдаёт новый токен', 'Игнорирует запрос', 'Продлевает старый', 'Отзывает всю цепочку'], correct: 3, why: 'Повтор значит кражу: ротация с отзывом цепочки.' },
      ],
      en: [
        { q: 'What does PKCE protect in OAuth?', options: ["The user's password", 'The authorization code', 'A refresh token in memory', 'The session cookie'], correct: 1, why: 'An intercepted code is useless without the verifier that never left the app.' },
        { q: 'Which architecture does RFC 10017 recommend?', options: ['The implicit flow', 'Tokens in `localStorage`', 'A BFF on the server', 'Passwords via OAuth'], correct: 2, why: 'Tokens only on the BFF server, an `HttpOnly` session cookie in the browser.' },
        { q: 'What protects a JWT from being read?', options: ['Nothing, it is only signed', 'Payload encryption', 'base64url encoding', 'The `HttpOnly` attribute'], correct: 0, why: 'Anyone can decode the contents; the signature only prevents changes.' },
        { q: 'An old refresh token arrives again. What does the server do?', options: ['Issues a new token', 'Ignores the request', 'Extends the old one', 'Revokes the whole chain'], correct: 3, why: 'A replay means theft: rotation with chain revocation.' },
      ],
    },
    sources: [
      rfc(10017, 'OAuth 2.0 for Browser-Based Applications'),
      rfc(9700, 'Best Current Practice for OAuth 2.0 Security'),
      rfc(7636, 'Proof Key for Code Exchange (PKCE)'),
      rfc(8725, 'JSON Web Token Best Current Practices'),
      src('Google for Developers: Passkeys', 'https://developers.google.com/identity/passkeys'),
      webdev('Sign in with a passkey through form autofill', 'passkey-form-autofill'),
    ],
    verified,
  },
  {
    id: 'sec-isolation',
    track: 'security',
    emoji: '🪟',
    minutes: 15,
    title: { ru: 'Изоляция окон и источников', en: 'Isolating windows and origins' },
    summary: {
      ru: 'Кликджекинг и frame-ancestors, opener и COOP, проверка postMessage, чужой код в iframe с sandbox, COEP и cross-origin isolation, ошибки настройки CORS, открытые редиректы.',
      en: 'Clickjacking and frame-ancestors, opener and COOP, postMessage checks, foreign code in an iframe with sandbox, COEP and cross-origin isolation, CORS misconfigurations, open redirects.',
    },
    quiz: {
      ru: [
        { q: 'Чем закрыть кликджекинг?', options: ['CSRF-токеном', 'Скриптом frame busting', '`frame-ancestors` в CSP', 'Атрибутом `SameSite=None`'], correct: 2, why: 'Директива решает, кто может встроить страницу; JS-защиту обходит `sandbox`.' },
        { q: 'Какая проверка `event.origin` верна?', options: ['Точное совпадение со списком', '`origin.includes(домен)`', '`origin.endsWith(домен)`', 'Проверка не нужна'], correct: 0, why: 'Подстроки пропускают `pay.example.evil.net` и `notpay.example`.' },
        { q: 'Что нужно для `SharedArrayBuffer`?', options: ['Только HTTPS', 'COOP и COEP', 'Строгая CSP', 'Атрибут `sandbox`'], correct: 1, why: 'Нужна cross-origin isolation: `crossOriginIsolated === true`.' },
        { q: 'Какой `next` пропустит проверка `startsWith("/")`?', options: ['`/orders`', '`https://evil.example`', '`javascript:alert(1)`', '`//evil.example`'], correct: 3, why: 'Адрес без схемы ведёт на другой хост; сравнивают origin после `new URL`.' },
      ],
      en: [
        { q: 'What closes clickjacking?', options: ['A CSRF token', 'A frame busting script', '`frame-ancestors` in CSP', 'The `SameSite=None` attribute'], correct: 2, why: 'The directive decides who may embed the page; `sandbox` defeats JS defenses.' },
        { q: 'Which `event.origin` check is right?', options: ['An exact match against a list', '`origin.includes(domain)`', '`origin.endsWith(domain)`', 'No check is needed'], correct: 0, why: 'Substrings let `pay.example.evil.net` and `notpay.example` through.' },
        { q: 'What does `SharedArrayBuffer` require?', options: ['Only HTTPS', 'COOP and COEP', 'A strict CSP', 'The `sandbox` attribute'], correct: 1, why: 'Cross-origin isolation is needed: `crossOriginIsolated === true`.' },
        { q: 'Which `next` passes a `startsWith("/")` check?', options: ['`/orders`', '`https://evil.example`', '`javascript:alert(1)`', '`//evil.example`'], correct: 3, why: 'An address without a scheme leads to another host; compare origins after `new URL`.' },
      ],
    },
    sources: [
      mdn('CSP: frame-ancestors', 'Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors'),
      mdn('Cross-Origin-Opener-Policy', 'Web/HTTP/Reference/Headers/Cross-Origin-Opener-Policy'),
      mdn('Window.postMessage()', 'Web/API/Window/postMessage'),
      mdn('<iframe>: sandbox', 'Web/HTML/Reference/Elements/iframe'),
      webdev('Making your website cross-origin isolated', 'coop-coep'),
      owasp('Unvalidated Redirects and Forwards', 'Unvalidated_Redirects_and_Forwards_Cheat_Sheet'),
    ],
    verified,
  },
  {
    id: 'sec-supply-chain',
    track: 'security',
    emoji: '📦',
    minutes: 14,
    title: { ru: 'Зависимости и сторонний код', en: 'Dependencies and third-party code' },
    summary: {
      ru: 'Атаки на npm в 2025 году (chalk, debug, Shai-Hulud), trusted publishing, lock-файл, скрипты установки и задержка версий в pnpm 11, Subresource Integrity, сторонние теги, prototype pollution.',
      en: 'The 2025 npm attacks (chalk, debug, Shai-Hulud), trusted publishing, the lock file, install scripts and release delays in pnpm 11, Subresource Integrity, third-party tags, prototype pollution.',
    },
    quiz: {
      ru: [
        { q: 'Как распространялся червь Shai-Hulud?', options: ['Через XSS на популярных сайтах', 'Через уязвимость в самом Node.js', 'Токенами из скриптов установки', 'Через взломанный CDN'], correct: 2, why: 'Скрипт установки находил токены и публиковал заражённые версии пакетов владельца.' },
        { q: 'Что делает `minimumReleaseAge` в pnpm 11?', options: ['Не ставит слишком новые версии', 'Удаляет старые версии пакетов', 'Обновляет пакеты раз в день', 'Проверяет подписи пакетов'], correct: 0, why: 'По умолчанию 1 день: вредоносные версии обычно находят за часы.' },
        { q: 'Зачем `crossorigin` у скрипта с SRI?', options: ['Для HTTP-кэша', 'Для работы HTTP/2', 'Чтобы отправить cookie', 'Чтобы проверить ответ'], correct: 3, why: 'Без CORS ответ с другого источника непрозрачен и хэш не проверить.' },
        { q: 'Какой ключ из JSON меняет `Object.prototype` при слиянии?', options: ['`toString`', '`__proto__`', '`valueOf`', '`length`'], correct: 1, why: 'Присваивание `target["__proto__"]` меняет прототип всех объектов.' },
      ],
      en: [
        { q: 'How did the Shai-Hulud worm spread?', options: ['Through XSS on popular sites', 'Through a flaw in Node.js itself', 'Tokens stolen by install scripts', 'Through a hacked CDN'], correct: 2, why: "The install script found tokens and published infected versions of the owner's packages." },
        { q: 'What does `minimumReleaseAge` in pnpm 11 do?', options: ['Skips too-new versions', 'Removes old versions', 'Updates once a day', 'Checks signatures'], correct: 0, why: 'One day by default: malicious versions are usually found within hours.' },
        { q: 'Why does an SRI script need `crossorigin`?', options: ['For the HTTP cache', 'For HTTP/2 to work', 'To send the cookies', 'To check the response'], correct: 3, why: 'Without CORS a response from another origin is opaque and the hash cannot be checked.' },
        { q: 'Which JSON key changes `Object.prototype` on merge?', options: ['`toString`', '`__proto__`', '`valueOf`', '`length`'], correct: 1, why: 'Assigning `target["__proto__"]` changes the prototype of every object.' },
      ],
    },
    sources: [
      src('OWASP Top 10:2025, A03 Software Supply Chain Failures', 'https://top10.owasp.org/2025/A03_2025-Software_Supply_Chain_Failures/'),
      src('GitHub Blog: Our plan for a more secure npm supply chain', 'https://github.blog/security/supply-chain-security/our-plan-for-a-more-secure-npm-supply-chain/'),
      src('npm Docs: Trusted publishing', 'https://docs.npmjs.com/trusted-publishers/'),
      src('pnpm: Mitigating supply chain attacks', 'https://pnpm.io/supply-chain-security'),
      mdn('Subresource Integrity', 'Web/Security/Defenses/Subresource_Integrity'),
      owasp('Prototype Pollution Prevention', 'Prototype_Pollution_Prevention_Cheat_Sheet'),
    ],
    verified,
  },
  {
    id: 'sec-checklist',
    track: 'security',
    emoji: '✅',
    minutes: 12,
    title: { ru: 'Чек-лист и ответ на собеседовании', en: 'Checklist and the interview answer' },
    summary: {
      ru: 'Проверка перед релизом, автоматическая проверка заголовков в CI, встроенная защита и лазейки React, Vue, Angular и Next.js, утечки через карты исходников, ошибки и URL, ответ по слоям.',
      en: 'The pre-release check, an automatic header check in CI, built-in protection and loopholes of React, Vue, Angular and Next.js, leaks through source maps, errors and URLs, the answer by layers.',
    },
    quiz: {
      ru: [
        { q: 'Почему заголовки проверяют после каждого деплоя?', options: ['Браузеры их забывают', 'Их ломает инфраструктура', 'Так требует HSTS', 'Они истекают со временем'], correct: 1, why: 'Новый прокси, CDN или хостинг тихо убирают защиту.' },
        { q: 'Что делать с картами исходников в продакшене?', options: ['Раздавать всем с сайта', 'Встраивать в сам бандл', 'В мониторинг, не публично', 'Отключить вывод ошибок'], correct: 2, why: 'Публичные карты раскрывают исходный код, комментарии и иногда ключи.' },
        { q: 'Зачем CSP, если React экранирует вывод?', options: ['Ловит ошибки кода и библиотек', 'Ускоряет загрузку страницы', 'Заменяет проверку прав', 'Нужна только для SSR'], correct: 0, why: 'Экранирование покрывает только вывод через React.' },
        { q: 'С чего начинать ответ «как защитить приложение»?', options: ['Со списка заголовков', 'С выбора фреймворка', 'С настроек CORS', 'С модели угроз'], correct: 3, why: 'Сначала ценные данные, пользователи и границы доверия, затем слои защиты.' },
      ],
      en: [
        { q: 'Why check headers after every deploy?', options: ['Browsers forget them', 'Infrastructure breaks them', 'HSTS requires it', 'They expire over time'], correct: 1, why: 'A new proxy, CDN or host quietly removes protection.' },
        { q: 'What do you do with source maps in production?', options: ['Serve them to everyone', 'Inline them in the bundle', 'To monitoring, not public', 'Turn off error output'], correct: 2, why: 'Public maps expose the source code, comments and sometimes keys.' },
        { q: 'Why a CSP if React escapes output?', options: ['Covers bugs in code and libraries', 'It speeds up page loading', 'It replaces permission checks', 'It is only needed for SSR'], correct: 0, why: 'Escaping covers only output through React.' },
        { q: 'Where does "how would you secure this app" start?', options: ['A list of headers', 'Choosing a framework', 'CORS settings', 'The threat model'], correct: 3, why: 'First the valuable data, the users and the trust boundaries, then the layers.' },
      ],
    },
    sources: [
      owasp('HTTP Headers', 'HTTP_Headers_Cheat_Sheet'),
      webdev('Security headers quick reference', 'security-headers'),
      mdn('Web security', 'Web/Security'),
      src('react.dev: Critical security vulnerability in React Server Components', 'https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components'),
      src('nextjs.org: Data Security', 'https://nextjs.org/docs/app/guides/data-security'),
    ],
    verified,
  },
]

export const securityModule: Module = {
  track: 'security',
  lessons: securityLessons.map((l) => l.id),
  exam: {
    pass: 0.75,
    questions: {
      ru: [
        { q: 'Что из этого один сайт, но разные origin?', options: ['`a.com` и `b.com`', '`app.x.com` и `api.x.com`', '`http://x.com` и `https://x.com`', '`a.github.io` и `b.github.io`'], correct: 1, why: 'Общий регистрируемый домен `x.com`; `github.io` это публичный суффикс.' },
        { q: 'Где окажется значение `VITE_API_SECRET`?', options: ['Только на сервере', 'В `.env` на сервере', 'В бандле открытым текстом', 'В зашифрованном виде'], correct: 2, why: 'Переменные `VITE_` подставляются в код при сборке.' },
        { q: 'Какой приёмник безопасен для пользовательской строки?', options: ['`textContent`', '`innerHTML`', '`insertAdjacentHTML`', '`document.write`'], correct: 0, why: '`textContent` вставляет текст без разбора HTML.' },
        { q: 'Что Vue делает со значением `:href="javascript:..."`?', options: ['Блокирует ссылку', 'Добавляет `unsafe:`', 'Удаляет атрибут', 'Ничего: ссылка сработает'], correct: 3, why: 'Vue не проверяет URL; схему проверяют сами.' },
        { q: 'Что DOMPurify оставил по умолчанию в примере?', options: ['`<script>`', '`<form>` с полем', '`onerror`', '`javascript:`'], correct: 1, why: 'Форма не выполняет код, но годится для фишинга; задают свой список тегов.' },
        { q: 'Какая политика строгая?', options: ["`script-src 'self' https://cdn.example`", "`script-src 'unsafe-inline'`", "`script-src 'nonce-…' 'strict-dynamic'`", "`default-src * 'unsafe-eval'`"], correct: 2, why: 'Nonce в каждом ответе и доверие по цепочке, без списков доменов.' },
        { q: 'Как внедрять CSP на работающем сайте?', options: ['Сначала Report-Only', 'Сразу блокировать', 'Только через `<meta>`', 'Только на staging'], correct: 0, why: 'Отчёты показывают, что сломается, до включения блокировки.' },
        { q: 'Что из этого защищает от CSRF?', options: ['Настройка CORS на сервере', 'Переход на HTTPS', 'Строгая политика CSP', 'Проверка `Sec-Fetch-Site`'], correct: 3, why: 'Сервер отклоняет изменяющие запросы с `cross-site`.' },
        { q: 'Почему наивный double-submit уязвим?', options: ['Cookie видна всем сайтам', 'Поддомен запишет свою cookie', 'Токен слишком длинный', 'Он не работает в Safari'], correct: 1, why: 'Поэтому токен подписывают и привязывают к сессии.' },
        { q: 'Какой поток OAuth использовать в браузере?', options: ['Implicit flow', 'Password grant', 'Code flow с PKCE', 'Client credentials'], correct: 2, why: 'Implicit и пароль запрещены RFC 9700; client credentials для серверов.' },
        { q: 'Что при XSS не спасает токен в памяти?', options: ['Получение новых токенов', 'Кражу из `localStorage`', 'Чтение cookie', 'Перехват HTTPS'], correct: 0, why: 'Скрипт атакующего может сам запустить вход в скрытом iframe.' },
        { q: 'Что сделать с `window.open(url)` на чужой сайт?', options: ['Ничего не делать', 'Добавить `target`', 'Включить строгую CSP', "Передать `'noopener'`"], correct: 3, why: '`target="_blank"` подразумевает noopener, а `window.open` нет.' },
        { q: 'Какой CORS опасен?', options: ['Точный список источников', 'Отражение `Origin` с credentials', 'Заголовок `Vary: Origin`', 'Ответ без `Allow-Credentials`'], correct: 1, why: 'Любой сайт читает ответы с cookie пользователя.' },
        { q: 'Как защититься от prototype pollution при слиянии?', options: ['Через `JSON.parse`', 'Через `Object.assign`', 'Пропускать `__proto__`', 'Через `eval`'], correct: 2, why: 'Опасные ключи пропускают, данные держат в `Map` или проверяют схемой.' },
      ],
      en: [
        { q: 'Which is one site but different origins?', options: ['`a.com` and `b.com`', '`app.x.com` and `api.x.com`', '`http://x.com` and `https://x.com`', '`a.github.io` and `b.github.io`'], correct: 1, why: 'The registrable domain `x.com` is shared; `github.io` is a public suffix.' },
        { q: 'Where does the value of `VITE_API_SECRET` end up?', options: ['Only on the server', 'In `.env` on the server', 'In the bundle as plain text', 'In encrypted form'], correct: 2, why: '`VITE_` variables are substituted into the code at build time.' },
        { q: 'Which sink is safe for a user string?', options: ['`textContent`', '`innerHTML`', '`insertAdjacentHTML`', '`document.write`'], correct: 0, why: '`textContent` inserts text without parsing HTML.' },
        { q: 'What does Vue do with `:href="javascript:..."`?', options: ['Blocks it', 'Adds `unsafe:`', 'Drops the attribute', 'Nothing, the link runs'], correct: 3, why: 'Vue does not check URLs; you check the scheme yourself.' },
        { q: 'What did DOMPurify keep by default in the example?', options: ['`<script>` tags', 'A `<form>` with a field', '`onerror` handlers', '`javascript:` links'], correct: 1, why: 'A form runs no code but suits phishing; set your own tag list.' },
        { q: 'Which policy is strict?', options: ["`script-src 'self' https://cdn.example`", "`script-src 'unsafe-inline'`", "`script-src 'nonce-…' 'strict-dynamic'`", "`default-src * 'unsafe-eval'`"], correct: 2, why: 'A nonce in every response and trust by chain, no domain lists.' },
        { q: 'How do you roll out a CSP on a live site?', options: ['Report-Only first', 'Enforce right away', 'Only through `<meta>`', 'Only on staging'], correct: 0, why: 'Reports show what will break before enforcement is on.' },
        { q: 'Which of these protects against CSRF?', options: ['A CORS setup on the server', 'Moving to HTTPS', 'A strict CSP policy', 'Checking `Sec-Fetch-Site`'], correct: 3, why: 'The server rejects state-changing requests with `cross-site`.' },
        { q: 'Why is the naive double-submit vulnerable?', options: ['The cookie is public to all', 'A subdomain can set its cookie', 'The token is far too long', 'It does not work in Safari'], correct: 1, why: 'That is why the token is signed and bound to the session.' },
        { q: 'Which OAuth flow do you use in the browser?', options: ['Implicit flow', 'Password grant', 'Code flow with PKCE', 'Client credentials'], correct: 2, why: 'Implicit and password are forbidden by RFC 9700; client credentials are for servers.' },
        { q: 'What does an in-memory token not prevent under XSS?', options: ['Getting new tokens', 'Theft from `localStorage`', 'Reading cookies', 'Breaking HTTPS'], correct: 0, why: "The attacker's script can start a login itself in a hidden iframe." },
        { q: 'What do you do with `window.open(url)` to another site?', options: ['Nothing', 'Add `target`', 'Turn on CSP', "Pass `'noopener'`"], correct: 3, why: '`target="_blank"` implies noopener, `window.open` does not.' },
        { q: 'Which CORS setup is dangerous?', options: ['An exact list of origins', 'Echoing `Origin` with credentials', 'The `Vary: Origin` header', 'No `Allow-Credentials` header'], correct: 1, why: "Any site reads responses made with the user's cookies." },
        { q: 'How do you prevent prototype pollution on merge?', options: ['With `JSON.parse`', 'With `Object.assign`', 'Skip `__proto__` keys', 'With `eval`'], correct: 2, why: 'Skip dangerous keys, keep data in a `Map` or validate with a schema.' },
      ],
    },
  },
}
