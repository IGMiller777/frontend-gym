# Аудит заметок: производительность

Источники в Notion: раздел «Как улучшить метрики FMP и TTI» страницы «Browser» (прочитан целиком; ошибки про FMP, TTI и Server Push уже записаны в `browser.md` и `network.md`), раздел «Optimization» страницы «React» (Virtualization, Lazy imports, Concurrent Mode, Bundle optimization, DevTools, Service workers; прочитан целиком, часть ошибок записана в `react.md`), разделы «Optimizations Topics» и «O — Optimizations» страницы «System Design». Критический путь рендеринга, layout и paint, наблюдатели разобраны в треке `browser`, подсказки загрузки и сжатие в `network`, оптимизации React, Angular и Vue в их треках, адаптивные изображения в `html-media-seo`. Этот трек про метрики, измерение и приёмы, общие для всех стеков.

Утверждения сверены с web.dev (Web Vitals, LCP, INP, CLS, оптимизация LCP и INP), developer.chrome.com (DevTools Performance, Lighthouse 13, soft navigations, bfcache), MDN (Performance API, `scheduler.yield`, Long Animation Frames, `font-display`, `content-visibility`), vite.dev, react.dev. Примеры выполняются в CI в Node.js и jsdom; tree shaking и разбиение кода на настоящем сборщике `rolldown` (тот же, что внутри Vite 8).

## Актуальные версии и состояние (ноябрь 2026)

| Что | Версия или статус | Что важно |
|---|---|---|
| Core Web Vitals | LCP, INP, CLS | Хорошо при p75: LCP ≤ 2,5 с, INP ≤ 200 мс, CLS ≤ 0,1; INP заменил FID в марте 2024 |
| `web-vitals` | 6.2 (6.0 от июля 2026) | Поддержка soft navigations, сборка `attribution` с разбором причин |
| Soft navigations | Включены по умолчанию с Chrome 151 | Метрики для переходов в SPA; в CrUX экспериментально, стабильно с мая 2027 |
| Lighthouse | 13.6 (13.0 от октября 2025) | Аудиты заменены «insights», как в панели Performance; формула оценки не менялась |
| `scheduler.yield()` | Не Baseline | Есть в Chromium и Firefox; запасной вариант `setTimeout` |
| Long Animation Frames | Не Baseline, экспериментальный | Только Chromium; подробнее long tasks: показывает скрипты кадра |
| `rolldown` | 1.2 | Сборщик Vite 8 |

## Найденные ошибки

| Где | В заметках | На самом деле | Источник |
|---|---|---|---|
| System Design, Requirements | Метрики «LCP, FID/INP» | FID выведен из Core Web Vitals в марте 2024, его заменил INP | [web.dev: INP](https://web.dev/articles/inp) |
| System Design, Optimizations | Differential Serving: ES2020 для новых браузеров, ES5 и полифилы для старых через `<script type="module">` | Схема `module`/`nomodule` больше не нужна: все поддерживаемые браузеры выполняют ES-модули; цель сборки задают одной (`baseline-widely-available` в Vite по умолчанию) | [Vite: Browser compatibility](https://vite.dev/guide/build#browser-compatibility) |
| React, Virtualization | «10 000 `div` → 300–800 МБ памяти», «с виртуализацией 2–3 МБ, 60+ fps» | Цифры без источника и завышены; дорог не сам узел, а стиль, layout и рендер, пропорциональные числу узлов. Lighthouse отмечает большой DOM как проблему | [Chrome: Optimize DOM size](https://developer.chrome.com/docs/performance/insights/dom-size) |
| React, Virtualization | TanStack Virtual «пока молодой» | Версия 3 стабильна с 2023 года и поддерживает React, Vue, Angular, Solid, Svelte | [tanstack.com: Virtual](https://tanstack.com/virtual/latest) |
| React, Lazy | «Реальные цифры»: бандл 1,2–2,5 МБ → 80–150 КБ, TTI 6–12 с → 1,8–3 с на 3G | Цифры без источника; TTI удалён из Lighthouse 10 | [Lighthouse 10](https://developer.chrome.com/blog/lighthouse-10-0) |
| React, Bundle | «Абсолютно все роуты обязаны быть `React.lazy`» | Первый экран не делают ленивым: это лишний запрос перед контентом. Ленивыми делают маршруты и тяжёлые части, которых нет на первом экране; фреймворки делят код по маршрутам сами | [web.dev: Code splitting](https://web.dev/articles/reduce-javascript-payloads-with-code-splitting) |
| React, Bundle | `import _ from 'lodash'` добавит «≈70 kB gzip» | 70 КБ это минифицированный размер; сжатый gzip около 26 КБ (lodash 4.17.21: 73 015 байт min, 25 892 gzip); измерено | — |
| React, Bundle | Расширение Import Cost: «за месяц бандл падает на 200–500 kB» | Цифры без источника | — |
| React, Bundle | «Webpack мёртв», Vite, Turbopack, Rspack «в 10–50 раз быстрее» | Webpack 5 поддерживается и широко используется; скорость сборки не равна скорости сайта, размер бандла от сборщика зависит мало. Новые проекты действительно берут Vite, Turbopack (по умолчанию в Next.js 16) или esbuild (Angular) | [Vite: Why Vite](https://vite.dev/guide/why) |
| React, Bundle | HTTP-кэш чанков даёт «TTI < 800 мс даже на 3G» | Цифра без источника, TTI удалён; `Cache-Control: immutable` для файлов с хэшем действительно убирает повторные загрузки | [web.dev: HTTP cache](https://web.dev/articles/http-cache) |
| React, Concurrent | «На плохом железе» переходы делают интерфейс плавным без условий | `startTransition` откладывает рендер, но длинную синхронную работу внутри обработчика не разбивает; для INP нужен ещё возврат управления главному потоку | [web.dev: Optimize long tasks](https://web.dev/articles/optimize-long-tasks) |
| Browser, FMP и TTI | Разнести блокирующие ресурсы, ленивые картинки, Brotli как способы улучшить FMP и TTI | Приёмы верные, но цель другая: FMP и TTI не используются, приёмы улучшают LCP и INP; ленивая загрузка картинки первого экрана, наоборот, ухудшает LCP | [web.dev: Optimize LCP](https://web.dev/articles/optimize-lcp) |

## Покрытие заметок Notion

| Тема в заметках | Где разобрано |
|---|---|
| Метрики FMP, TTI и их замена | `perf-metrics` (история), `browser-rendering#Как это измеряют сейчас` |
| LCP, INP, CLS и пороги | `perf-metrics`, `perf-lcp`, `perf-inp`, `perf-cls` |
| Профилирование: DevTools, React Profiler, Lighthouse | `perf-measure`; React Profiler в `react-debugging` |
| Блокирующие ресурсы по страницам, разделение кода | `perf-javascript#Разбиение кода`, `perf-lcp` |
| Third-party скрипты | `perf-resources#Сторонние скрипты` |
| Ленивые картинки, форматы AVIF и WebP, `srcset` | `perf-lcp`, `perf-resources#Изображения`; подробно в `html-media-seo` |
| HTTP/2, HTTP/3, Brotli, CDN, кэш и ETag, Service Worker | `net-http`, `net-loading`, `net-caching`; кэш чанков в `perf-javascript#Кэш и сжатие` |
| Виртуализация списков | `perf-runtime#Длинные списки` |
| `React.lazy`, Suspense, предзагрузка маршрутов | `perf-javascript#Разбиение кода`; `react-performance` |
| Tree shaking, Import cost, замена тяжёлых библиотек | `perf-javascript#Tree shaking` |
| Сборщики: webpack, Vite, Turbopack, Rspack | `perf-javascript#Сборщик и цель сборки` |
| Web Workers, debounce и throttle | `perf-inp#Разбить или вынести работу`; реализация в `async-patterns` |
| Event delegation, WeakMap | `perf-runtime#Память`; `js-memory` |
| GPU-анимации, layout thrashing, `contain` | `browser-layout-paint`; `perf-runtime#DOM и отрисовка` |
| Skeleton, предотвращение CLS, `aspect-ratio` | `perf-cls` |
| Prefetch при наведении, stale-while-revalidate | `net-loading`, `state-server`, `perf-lcp` |

Добавлено сверх заметок, потому что об этом спрашивают: поле и лаборатория, p75 и CrUX, разбиение LCP на четыре части, три фазы INP, `scheduler.yield`, Long Animation Frames, окна сессий CLS, soft navigations в SPA, bfcache, `content-visibility`, загрузка шрифтов и `size-adjust`, фасады сторонних виджетов, бюджеты производительности и Lighthouse CI, порядок ответа «страница медленная, что будете делать».
