import type { Source } from '../sources'
import type { Lesson, Module } from './types'

const src = (title: string, url: string): Source => ({ title, url, kind: 'official' })
const webdev = (title: string, path: string) => src(`web.dev: ${title}`, `https://web.dev/articles/${path}`)
const chrome = (title: string, path: string) => src(`developer.chrome.com: ${title}`, `https://developer.chrome.com/docs/${path}`)
const mdn = (title: string, path: string) => src(`MDN: ${title}`, `https://developer.mozilla.org/en-US/docs/${path}`)
const verified = { date: '2026-11', version: 'Core Web Vitals 2026, web-vitals 6, Lighthouse 13, Chrome 151, rolldown 1.2' }

export const performanceLessons: Lesson[] = [
  {
    id: 'perf-metrics',
    track: 'performance',
    emoji: '📏',
    minutes: 12,
    title: { ru: 'Core Web Vitals и другие метрики', en: 'Core Web Vitals and other metrics' },
    summary: {
      ru: 'LCP, INP, CLS и их пороги, TTFB, FCP и TBT, 75-й перцентиль вместо среднего, поле и лаборатория, что стало с FMP, TTI и FID, soft navigations в SPA.',
      en: 'LCP, INP, CLS and their thresholds, TTFB, FCP and TBT, the 75th percentile instead of the average, field and lab, what happened to FMP, TTI and FID, soft navigations in SPAs.',
    },
    quiz: {
      ru: [
        { q: 'Какой INP считается хорошим?', options: ['До 100 мс', 'До 200 мс', 'До 500 мс', 'До 1 с'], correct: 1, why: 'Хорошо до 200 мс, нужно улучшить до 500 мс, хуже уже плохо.' },
        { q: 'По какому значению оценивают метрику страницы?', options: ['По среднему', 'По медиане', 'По 75-му перцентилю', 'По худшему визиту'], correct: 2, why: 'p75 отражает большинство визитов и не зависит от единичных выбросов.' },
        { q: 'Почему в Lighthouse нет INP?', options: ['В прогоне никто не кликает', 'INP считается только в Safari', 'INP устарел', 'Lighthouse не измеряет JS'], correct: 0, why: 'Лабораторный прогон без пользователя; его замена TBT.' },
        { q: 'Что заменило FID в марте 2024?', options: ['TBT', 'TTI', 'FCP', 'INP'], correct: 3, why: 'INP учитывает всю обработку любого взаимодействия, а не только задержку первого ввода.' },
      ],
      en: [
        { q: 'What INP is considered good?', options: ['Up to 100 ms', 'Up to 200 ms', 'Up to 500 ms', 'Up to 1 s'], correct: 1, why: 'Good up to 200 ms, needs improvement up to 500 ms, poor beyond that.' },
        { q: "Which value is a page's metric rated by?", options: ['The average', 'The median', 'The 75th percentile', 'The worst visit'], correct: 2, why: 'p75 reflects most visits and does not depend on single outliers.' },
        { q: 'Why is there no INP in Lighthouse?', options: ['Nobody clicks in the run', 'INP is measured only in Safari', 'INP is deprecated', 'Lighthouse does not measure JS'], correct: 0, why: 'A lab run has no user; TBT stands in for it.' },
        { q: 'What replaced FID in March 2024?', options: ['TBT', 'TTI', 'FCP', 'INP'], correct: 3, why: 'INP covers the whole handling of any interaction, not just the delay of the first input.' },
      ],
    },
    sources: [
      webdev('Web Vitals', 'vitals'),
      webdev('Interaction to Next Paint (INP)', 'inp'),
      webdev('Total Blocking Time', 'tbt'),
      chrome('Chrome UX Report', 'crux'),
      chrome('Measuring soft navigations', 'web-platform/soft-navigations'),
    ],
    verified,
  },
  {
    id: 'perf-measure',
    track: 'performance',
    emoji: '🔬',
    minutes: 12,
    title: { ru: 'Как измерять', en: 'How to measure' },
    summary: {
      ru: 'Порядок работы от поля к лаборатории, панель Performance, Lighthouse и вес метрик в оценке, PageSpeed Insights, RUM на web-vitals с атрибуцией, User Timing, Long Animation Frames.',
      en: 'The workflow from field to lab, the Performance panel, Lighthouse and metric weights in its score, PageSpeed Insights, RUM with web-vitals and attribution, User Timing, Long Animation Frames.',
    },
    quiz: {
      ru: [
        { q: 'С чего начинать поиск проблемы?', options: ['С оценки Lighthouse', 'С полевых данных', 'С вкладки Coverage', 'С переписывания кода'], correct: 1, why: 'Сначала понять, есть ли проблема и у кого, затем искать причину в лаборатории.' },
        { q: 'Какая метрика весит больше всех в оценке Lighthouse?', options: ['LCP', 'CLS', 'FCP', 'TBT'], correct: 3, why: 'TBT 30 %, LCP и CLS по 25 %, FCP и Speed Index по 10 %.' },
        { q: 'Что добавляет сборка `web-vitals/attribution`?', options: ['Причину: элемент и фазы', 'Отправку на сервер', 'Поддержку Safari', 'Оценку Lighthouse'], correct: 0, why: 'Элемент LCP с разбивкой, элемент и фазы медленного взаимодействия, сдвинувшийся элемент.' },
        { q: 'Когда отправлять полевые метрики?', options: ['Сразу при загрузке', 'Раз в минуту по таймеру', 'Когда страница скрывается', 'Только при ошибке'], correct: 2, why: 'INP и CLS копятся весь визит; библиотека вызывает колбэк при `visibilitychange`.' },
      ],
      en: [
        { q: 'Where do you start looking for a problem?', options: ['The Lighthouse score', 'Field data', 'The Coverage tab', 'Rewriting the code'], correct: 1, why: 'First learn whether there is a problem and for whom, then look for the cause in the lab.' },
        { q: 'Which metric weighs most in the Lighthouse score?', options: ['LCP', 'CLS', 'FCP', 'TBT'], correct: 3, why: 'TBT 30%, LCP and CLS 25% each, FCP and Speed Index 10% each.' },
        { q: 'What does the `web-vitals/attribution` build add?', options: ['The cause: element, phases', 'Sending to a server', 'Support for Safari', 'A Lighthouse score'], correct: 0, why: 'The LCP element with its breakdown, the slow interaction\'s element and phases, the shifted element.' },
        { q: 'When should field metrics be sent?', options: ['Right on load', 'Once a minute, by timer', 'When the page is hidden', 'Only on errors'], correct: 2, why: 'INP and CLS accumulate over the whole visit; the library calls back on `visibilitychange`.' },
      ],
    },
    sources: [
      chrome('Performance panel', 'devtools/performance/overview'),
      chrome('Lighthouse performance scoring', 'lighthouse/performance/performance-scoring'),
      webdev('Best practices for measuring Web Vitals in the field', 'vitals-field-measurement-best-practices'),
      mdn('User Timing', 'Web/API/Performance_API/User_timing'),
      mdn('Long animation frame timing', 'Web/API/Performance_API/Long_animation_frame_timing'),
    ],
    verified,
  },
  {
    id: 'perf-lcp',
    track: 'performance',
    emoji: '🖼️',
    minutes: 12,
    title: { ru: 'LCP: главный контент быстрее', en: 'LCP: the main content sooner' },
    summary: {
      ru: 'Элемент LCP, четыре части метрики и как найти самую большую, приёмы для TTFB, обнаружения, загрузки и отрисовки, ошибки с lazy, фоном в CSS и клиентским рендером.',
      en: 'The LCP element, the four parts of the metric and how to find the biggest, techniques for TTFB, discovery, download and rendering, the mistakes with lazy, a CSS background and client rendering.',
    },
    quiz: {
      ru: [
        { q: 'Что сделать с картинкой первого экрана?', options: ['Добавить `loading="lazy"`', 'Добавить `fetchpriority="high"`', 'Перенести её в фон CSS', 'Вставить её через JavaScript'], correct: 1, why: 'Ленивая загрузка и фон в CSS задерживают обнаружение; высокий приоритет ускоряет.' },
        { q: 'TTFB 300 мс, картинка начала грузиться на 1900-й мс. Какая часть LCP велика?', options: ['Задержка загрузки ресурса', 'TTFB, ожидание HTML', 'Загрузка ресурса', 'Задержка отрисовки'], correct: 0, why: 'Браузер поздно узнал о картинке: её нет в исходном HTML или она ленивая.' },
        { q: 'Что ускоряет загрузку самой картинки?', options: ['Атрибут `alt`', 'Атрибут `decoding`', 'AVIF и `srcset`', 'Атрибут `title`'], correct: 2, why: 'Меньший формат и размер под экран уменьшают вес.' },
        { q: 'Что делает LCP почти нулевым при переходе «Назад»?', options: ['Service Worker', 'HTTP/2', 'Сжатие Brotli', 'bfcache'], correct: 3, why: 'Страница восстанавливается из памяти целиком, без загрузки и рендера.' },
      ],
      en: [
        { q: 'What should you do with a first-screen image?', options: ['Add `loading="lazy"`', 'Add `fetchpriority="high"`', 'Move it to a CSS background', 'Insert it with JS'], correct: 1, why: 'Lazy loading and a CSS background delay discovery; high priority speeds it up.' },
        { q: 'TTFB is 300 ms, the image started loading at 1900 ms. Which LCP part is large?', options: ['Resource load delay', 'TTFB', 'Resource load duration', 'Element render delay'], correct: 0, why: 'The browser learned about the image late: it is not in the original HTML, or it is lazy.' },
        { q: 'What speeds up downloading the image itself?', options: ['The `alt` attribute', 'The `decoding` attribute', 'AVIF and `srcset`', 'The `title` attribute'], correct: 2, why: 'A smaller format and a screen-sized image reduce the weight.' },
        { q: 'What makes LCP nearly zero on a "Back" navigation?', options: ['A Service Worker', 'HTTP/2', 'Brotli compression', 'The bfcache'], correct: 3, why: 'The page is restored from memory whole, without loading or rendering.' },
      ],
    },
    sources: [
      webdev('Largest Contentful Paint (LCP)', 'lcp'),
      webdev('Optimize LCP', 'optimize-lcp'),
      webdev('Fetch Priority', 'fetch-priority'),
      webdev('Back/forward cache', 'bfcache'),
    ],
    verified,
  },
  {
    id: 'perf-inp',
    track: 'performance',
    emoji: '👆',
    minutes: 12,
    title: { ru: 'INP: быстрый отклик', en: 'INP: a fast response' },
    summary: {
      ru: 'Три фазы взаимодействия, долгие задачи, разбиение работы и scheduler.yield с запасным вариантом, отрисовка до второстепенной работы, Web Worker, что дают фреймворки.',
      en: 'The three phases of an interaction, long tasks, splitting work and scheduler.yield with a fallback, painting before secondary work, Web Workers, what frameworks offer.',
    },
    quiz: {
      ru: [
        { q: 'Какую задачу называют долгой?', options: ['Дольше 16 мс', 'Дольше 100 мс', 'Дольше 50 мс', 'Дольше 1 с'], correct: 2, why: 'Всё, что занимает главный поток дольше 50 мс, блокирует ввод и отрисовку.' },
        { q: 'Из каких фаз складывается INP?', options: ['Задержка, обработка, отображение', 'DNS, TCP и рукопожатие TLS', 'Загрузка, разбор, выполнение', 'Стили, layout, композиция'], correct: 0, why: 'Задержка ввода, обработка событий и задержка отображения до следующего кадра.' },
        { q: 'Где нет `scheduler.yield()`?', options: ['В Chrome', 'В Edge', 'В Firefox', 'В Safari'], correct: 3, why: 'Chrome и Edge с 129, Firefox с 142; для Safari нужен запасной `setTimeout`.' },
        { q: 'Разобьёт ли `startTransition` тяжёлый цикл в `onClick`?', options: ['Да, в любом случае', 'Нет, это синхронная работа', 'Только в режиме StrictMode', 'Только вместе с Suspense'], correct: 1, why: 'Он делает прерываемым ре-рендер, а синхронный цикл остаётся долгой задачей.' },
      ],
      en: [
        { q: 'What is called a long task?', options: ['Over 16 ms', 'Over 100 ms', 'Over 50 ms', 'Over 1 s'], correct: 2, why: 'Anything holding the main thread longer than 50 ms blocks input and painting.' },
        { q: 'What phases make up INP?', options: ['Delay, processing, presentation', 'DNS, TCP and the TLS handshake', 'Download, parse, execute', 'Styles, layout, composite'], correct: 0, why: 'Input delay, event processing and presentation delay up to the next frame.' },
        { q: 'Where is `scheduler.yield()` missing?', options: ['In Chrome', 'In Edge', 'In Firefox', 'In Safari'], correct: 3, why: 'Chrome and Edge since 129, Firefox since 142; Safari needs the `setTimeout` fallback.' },
        { q: 'Will `startTransition` split a heavy loop in `onClick`?', options: ['Yes, always', 'No, that is sync work', 'Only in StrictMode', 'Only with Suspense'], correct: 1, why: 'It makes a re-render interruptible, while a synchronous loop stays a long task.' },
      ],
    },
    sources: [
      webdev('Optimize INP', 'optimize-inp'),
      webdev('Optimize long tasks', 'optimize-long-tasks'),
      mdn('Scheduler.yield()', 'Web/API/Scheduler/yield'),
      mdn('Web Workers API', 'Web/API/Web_Workers_API'),
    ],
    verified,
  },
  {
    id: 'perf-cls',
    track: 'performance',
    emoji: '📐',
    minutes: 10,
    title: { ru: 'CLS: без прыжков', en: 'CLS: no jumping' },
    summary: {
      ru: 'Оценка сдвига, ожидаемые сдвиги после ввода, окна сессий, причины и исправления: медиа без размеров, реклама, догружаемый контент, шрифты, анимации; поиск причины.',
      en: 'The shift score, expected shifts after input, session windows, causes and fixes: media without dimensions, ads, late content, fonts, animations; finding the cause.',
    },
    quiz: {
      ru: [
        { q: 'Что такое CLS страницы?', options: ['Сумма всех сдвигов', 'Наибольшее окно сдвигов', 'Средний сдвиг за визит', 'Первый сдвиг на странице'], correct: 1, why: 'Сдвиги с промежутком меньше 1 с в окне не длиннее 5 с; берётся наибольшее окно.' },
        { q: 'Какой сдвиг не входит в CLS?', options: ['Через 500 мс после клика', 'От загрузки шрифта', 'От рекламы', 'От картинки без размеров'], correct: 0, why: 'Сдвиги в течение 500 мс после ввода пользователя считаются ожидаемыми.' },
        { q: 'Как анимировать без сдвигов вёрстки?', options: ['Через `top`', 'Через `margin`', 'Через `height`', 'Через `transform`'], correct: 3, why: '`transform` не меняет положение элемента в вёрстке.' },
        { q: 'Как убрать прыжок при замене шрифта?', options: ['`font-display: block`', 'Убрать предзагрузку шрифта', 'Запасной шрифт с `size-adjust`', 'Встроить шрифт в base64'], correct: 2, why: 'Подогнанные метрики запасного шрифта почти не сдвигают текст при замене.' },
      ],
      en: [
        { q: "What is a page's CLS?", options: ['The sum of all shifts', 'The largest shift window', 'The average shift', 'The first shift'], correct: 1, why: 'Shifts less than 1 s apart in a window of at most 5 s; the largest window is taken.' },
        { q: 'Which shift does not count toward CLS?', options: ['Within 500 ms of a click', 'From a font loading', 'From an ad', 'From an unsized image'], correct: 0, why: 'Shifts within 500 ms after user input are considered expected.' },
        { q: 'How do you animate without layout shifts?', options: ['With `top`', 'With `margin`', 'With `height`', 'With `transform`'], correct: 3, why: '`transform` does not change the element\'s layout position.' },
        { q: 'How do you remove the jump on a font swap?', options: ['`font-display: block`', 'Remove the font preload', 'A fallback with `size-adjust`', 'Inline the font in base64'], correct: 2, why: "Adjusted fallback metrics barely move the text on swap." },
      ],
    },
    sources: [
      webdev('Cumulative Layout Shift (CLS)', 'cls'),
      webdev('Optimize CLS', 'optimize-cls'),
      mdn('size-adjust', 'Web/CSS/Reference/At-rules/@font-face/size-adjust'),
      mdn('aspect-ratio', 'Web/CSS/Reference/Properties/aspect-ratio'),
    ],
    verified,
  },
  {
    id: 'perf-javascript',
    track: 'performance',
    emoji: '📦',
    minutes: 13,
    title: { ru: 'JavaScript и бандл', en: 'JavaScript and the bundle' },
    summary: {
      ru: 'Цена JavaScript, анализ бандла и Coverage, разбиение кода на настоящем сборщике, tree shaking и CommonJS, lodash и замены библиотек, цель сборки Baseline, кэш файлов с хэшем и Brotli.',
      en: 'The cost of JavaScript, bundle analysis and Coverage, code splitting on a real bundler, tree shaking and CommonJS, lodash and library replacements, a Baseline build target, caching hashed files and Brotli.',
    },
    quiz: {
      ru: [
        { q: 'Почему 200 КБ JavaScript дороже 200 КБ картинки?', options: ['Его хуже сжимают', 'Его не кэшируют', 'Его разбирают и выполняют', 'Он грузится последним'], correct: 2, why: 'JS разбирается, компилируется и выполняется в главном потоке, а картинка только декодируется.' },
        { q: 'Почему `module.exports = {...}` мешает tree shaking?', options: ['Объект собран при выполнении', 'CommonJS работает медленнее', 'Нет поддержки в Vite', 'Он без экспортов'], correct: 0, why: 'Сборщик не знает, какие свойства понадобятся, и оставляет всё.' },
        { q: 'Что из этого нельзя делать ленивым?', options: ['Админку', 'Редактор', 'Модальное окно', 'Первый экран'], correct: 3, why: 'Ленивый первый экран добавляет запрос перед показом контента.' },
        { q: 'Какой `Cache-Control` нужен файлу `main-3f9a1c2b.js`?', options: ['`no-store, must-revalidate`', '`max-age=31536000, immutable`', '`no-cache, max-age=0`', '`private, max-age=600`'], correct: 1, why: 'Имя меняется вместе с содержимым, поэтому файл можно кэшировать на год без проверки.' },
      ],
      en: [
        { q: 'Why is 200 KB of JavaScript costlier than a 200 KB image?', options: ['It compresses worse', 'It is never cached', 'It is parsed and executed', 'It always loads last'], correct: 2, why: 'JS is parsed, compiled and executed on the main thread, while an image is only decoded.' },
        { q: 'Why does `module.exports = {...}` hinder tree shaking?', options: ['The object is built at runtime', 'CommonJS runs more slowly', 'Vite does not support it', 'It has no exports at all'], correct: 0, why: 'The bundler cannot know which properties will be needed and keeps them all.' },
        { q: 'Which of these must not be lazy?', options: ['The admin area', 'The editor', 'A modal', 'The first screen'], correct: 3, why: 'A lazy first screen adds a request before the content shows.' },
        { q: 'Which `Cache-Control` suits `main-3f9a1c2b.js`?', options: ['`no-store, must-revalidate`', '`max-age=31536000, immutable`', '`no-cache, max-age=0`', '`private, max-age=600`'], correct: 1, why: 'The name changes with the content, so the file can be cached for a year without revalidation.' },
      ],
    },
    sources: [
      webdev('Reduce JavaScript payloads with code splitting', 'reduce-javascript-payloads-with-code-splitting'),
      src('vite.dev: Building for production', 'https://vite.dev/guide/build'),
      src('rolldown.rs: Automatic code splitting', 'https://rolldown.rs/in-depth/code-splitting'),
      webdev('HTTP cache', 'http-cache'),
      chrome('Coverage', 'devtools/coverage'),
    ],
    verified,
  },
  {
    id: 'perf-resources',
    track: 'performance',
    emoji: '🔤',
    minutes: 11,
    title: { ru: 'Шрифты, картинки и сторонний код', en: 'Fonts, images and third-party code' },
    summary: {
      ru: 'Как грузятся шрифты, font-display, WOFF2, подмножества, предзагрузка, свой хостинг; сводка по картинкам; сторонние скрипты, фасады и загрузка по намерению.',
      en: 'How fonts load, font-display, WOFF2, subsets, preloading, self-hosting; a summary on images; third-party scripts, facades and loading on intent.',
    },
    quiz: {
      ru: [
        { q: 'Какой `font-display` оставит запасной шрифт на медленной сети?', options: ['`block`', '`swap`', '`auto`', '`optional`'], correct: 3, why: '`optional` использует веб-шрифт, только если он пришёл почти сразу.' },
        { q: 'Зачем `crossorigin` у предзагрузки своего шрифта?', options: ['Шрифты грузятся в режиме CORS', 'Для сжатия файла шрифта', 'Для кэша на стороне CDN', 'Иначе не будет WOFF2'], correct: 0, why: 'Без него предзагрузка не совпадёт с настоящим запросом и файл загрузится дважды.' },
        { q: 'Что такое фасад стороннего виджета?', options: ['Прокси для его API', 'Лёгкий заполнитель до клика', 'Свой хостинг скрипта', 'Скрипт в Web Worker'], correct: 1, why: 'Тяжёлый плеер, чат или карта загружаются только при намерении пользователя.' },
        { q: 'Почему клиентский A/B-тест вредит LCP?', options: ['Он кэширует страницу', 'Он сжимает картинки', 'Прячет страницу до загрузки', 'Он требует протокол HTTP/3'], correct: 2, why: '«Анти-мерцание» скрывает контент, пока скрипт эксперимента не выполнится.' },
      ],
      en: [
        { q: 'Which `font-display` keeps the fallback on a slow network?', options: ['`block`', '`swap`', '`auto`', '`optional`'], correct: 3, why: '`optional` uses the web font only if it arrived almost at once.' },
        { q: 'Why does preloading your own font need `crossorigin`?', options: ['Fonts load in CORS mode', 'For compression', 'For the CDN cache', 'Otherwise no WOFF2'], correct: 0, why: 'Without it the preload does not match the real request, and the file downloads twice.' },
        { q: 'What is a facade for a third-party widget?', options: ['A proxy in front of its API', 'A light placeholder until click', 'Self-hosting its script', 'Its script in a Web Worker'], correct: 1, why: 'A heavy player, chat or map loads only on the user\'s intent.' },
        { q: 'Why does a client-side A/B test hurt LCP?', options: ['It caches the whole page', 'It compresses all images', 'It hides the page until loaded', 'It needs HTTP/3 to work'], correct: 2, why: '"Anti-flicker" hides the content until the experiment script runs.' },
      ],
    },
    sources: [
      webdev('Best practices for fonts', 'font-best-practices'),
      mdn('font-display', 'Web/CSS/Reference/At-rules/@font-face/font-display'),
      chrome('Lazy load third-party resources with facades', 'lighthouse/performance/third-party-facades'),
      webdev('Optimize LCP', 'optimize-lcp'),
    ],
    verified,
  },
  {
    id: 'perf-runtime',
    track: 'performance',
    emoji: '⚙️',
    minutes: 12,
    title: { ru: 'После загрузки: списки, память, bfcache', en: 'After load: lists, memory, bfcache' },
    summary: {
      ru: 'Виртуализация длинных списков, размер DOM и content-visibility, утечки памяти и снимки кучи, делегирование событий, back/forward cache и pagehide вместо unload.',
      en: 'Virtualizing long lists, DOM size and content-visibility, memory leaks and heap snapshots, event delegation, the back/forward cache and pagehide instead of unload.',
    },
    quiz: {
      ru: [
        { q: 'Что держит в DOM виртуализированный список?', options: ['Видимые строки и запас', 'Все строки', 'Только первую страницу', 'Только выбранные строки'], correct: 0, why: 'Строки вне области видимости не создаются; распорка сохраняет полосу прокрутки.' },
        { q: 'Чем `content-visibility: auto` отличается от виртуализации?', options: ['Удаляет узлы из DOM', 'Работает только в React', 'Узлы остаются в DOM', 'Требует Web Worker'], correct: 2, why: 'Браузер пропускает отрисовку невидимых блоков, но поиск и якоря работают.' },
        { q: 'Что показывает фильтр «Detached» в снимке кучи?', options: ['Удалённые CSS-правила', 'Закрытые соединения', 'Отключённые расширения', 'Узлы вне страницы в памяти'], correct: 3, why: 'DOM-узлы, удалённые со страницы, но удерживаемые ссылками.' },
        { q: 'Что мешает странице попасть в bfcache?', options: ['Обработчик `pagehide`', 'Обработчик `unload`', 'Атрибут `defer`', 'Файл manifest'], correct: 1, why: 'Вместо `unload` используют `pagehide` или `visibilitychange`.' },
      ],
      en: [
        { q: 'What does a virtualized list keep in the DOM?', options: ['Visible rows and a margin', 'All the rows of the list', 'Only the first page', 'Only selected rows'], correct: 0, why: 'Rows outside the viewport are not created; a spacer keeps the scrollbar right.' },
        { q: 'How does `content-visibility: auto` differ from virtualization?', options: ['It removes nodes from the DOM', 'It works only in React', 'Nodes stay in the DOM', 'It needs a Web Worker'], correct: 2, why: 'The browser skips rendering off-screen blocks, but find-in-page and anchors work.' },
        { q: 'What does the "Detached" filter in a heap snapshot show?', options: ['Removed CSS rules', 'Closed connections', 'Disabled extensions', 'Off-page nodes in memory'], correct: 3, why: 'DOM nodes removed from the page but still held by references.' },
        { q: 'What keeps a page out of the bfcache?', options: ['A `pagehide` handler', 'An `unload` handler', 'The `defer` attribute', 'A manifest file'], correct: 1, why: 'Use `pagehide` or `visibilitychange` instead of `unload`.' },
      ],
    },
    sources: [
      mdn('content-visibility', 'Web/CSS/Reference/Properties/content-visibility'),
      chrome('Optimize DOM size', 'performance/insights/dom-size'),
      webdev('Back/forward cache', 'bfcache'),
      chrome('Fix memory problems', 'devtools/memory-problems'),
      src('tanstack.com: Virtual', 'https://tanstack.com/virtual/latest'),
    ],
    verified,
  },
  {
    id: 'perf-budgets',
    track: 'performance',
    emoji: '🎯',
    minutes: 10,
    title: { ru: 'Бюджеты и ответ на собеседовании', en: 'Budgets and the interview answer' },
    summary: {
      ru: 'Почему скорость деградирует, виды бюджетов, проверка размера бандла и Lighthouse CI в пулл-реквестах, мониторинг поля по выпускам, порядок ответа «страница медленная».',
      en: 'Why speed degrades, kinds of budgets, bundle size checks and Lighthouse CI in pull requests, field monitoring by release, the order of the "the page is slow" answer.',
    },
    quiz: {
      ru: [
        { q: 'Какой бюджет надёжнее всего ловит постепенный рост?', options: ['Размер бандла в CI', 'Оценка Lighthouse раз в месяц', 'Ручная проверка', 'Отзывы пользователей'], correct: 0, why: 'Размер проверяется быстро и стабильно на каждом пулл-реквесте.' },
        { q: 'Почему Lighthouse CI гоняют несколько раз?', options: ['Так требует лицензия', 'Чтобы прогреть кэш', 'Результаты шумят', 'Чтобы получить INP'], correct: 2, why: 'Сравнивают медиану нескольких прогонов с порогами с запасом.' },
        { q: 'Что CI не поймает без полевых данных?', options: ['Рост бандла', 'CLS при загрузке', 'Тяжёлую картинку', 'INP реальных устройств'], correct: 3, why: 'В лаборатории никто не кликает и нет разнообразия устройств.' },
        { q: 'Первый шаг в ответе «страница медленная»?', options: ['Добавить `React.memo`', 'Уточнить и посмотреть поле', 'Включить сжатие Brotli', 'Переписать всё на SSR'], correct: 1, why: 'Сначала понять, какая метрика, где и у кого плохая.' },
      ],
      en: [
        { q: 'Which budget catches gradual growth most reliably?', options: ['Bundle size in CI', 'A monthly Lighthouse score', 'A manual check', 'User feedback'], correct: 0, why: 'Size is checked quickly and reliably on every pull request.' },
        { q: 'Why is Lighthouse CI run several times?', options: ['The license requires it', 'To warm the cache', 'The results are noisy', 'To get INP'], correct: 2, why: 'The median of several runs is compared against thresholds with a margin.' },
        { q: 'What will CI miss without field data?', options: ['Bundle growth', 'CLS during load', 'A heavy image', 'INP on real devices'], correct: 3, why: 'Nobody clicks in the lab, and there is no device variety.' },
        { q: 'The first step in the "the page is slow" answer?', options: ['Add `React.memo` everywhere', 'Clarify and look at the field', 'Turn on Brotli compression', 'Rewrite it all with SSR'], correct: 1, why: 'First learn which metric is bad, where and for whom.' },
      ],
    },
    sources: [
      webdev('Performance budgets 101', 'performance-budgets-101'),
      chrome('Lighthouse overview', 'lighthouse/overview'),
      webdev('Incorporate performance budgets into your build process', 'incorporate-performance-budgets-into-your-build-tools'),
      webdev('Web Vitals', 'vitals'),
    ],
    verified,
  },
]

export const performanceModule: Module = {
  track: 'performance',
  lessons: performanceLessons.map((l) => l.id),
  exam: {
    pass: 0.75,
    questions: {
      ru: [
        { q: 'Какой LCP считается хорошим?', options: ['До 1 с', 'До 2,5 с', 'До 4 с', 'До 5 с'], correct: 1, why: 'Хорошо до 2,5 с, нужно улучшить до 4 с.' },
        { q: 'Что такое TBT?', options: ['Лабораторная замена INP', 'Время до первого байта', 'Сдвиги вёрстки', 'Размер бандла'], correct: 0, why: 'Сумма времени долгих задач сверх 50 мс после FCP.' },
        { q: 'Lighthouse даёт 95, а в CrUX LCP плохой. Чему верить?', options: ['Lighthouse', 'Обоим одинаково', 'Полевым данным CrUX', 'Ни одному'], correct: 2, why: 'Поле отражает реальные устройства и сети; лабораторию используют для поиска причины.' },
        { q: 'Какая часть LCP велика, если картинка вставлена через JS?', options: ['TTFB, ожидание HTML', 'Загрузка ресурса', 'Задержка отрисовки', 'Задержка загрузки ресурса'], correct: 3, why: 'Браузер узнаёт о картинке только после загрузки и выполнения скрипта.' },
        { q: 'Что вредно для картинки LCP?', options: ['`fetchpriority="high"`', '`loading="lazy"`', '`srcset`', 'Формат AVIF'], correct: 1, why: 'Ленивая картинка ждёт вёрстки и начинает грузиться поздно.' },
        { q: 'Зачем возвращать управление браузеру в длинном цикле?', options: ['Обработать ввод и кадр', 'Освободить память', 'Уменьшить бандл', 'Ускорить сеть'], correct: 0, why: 'Между кусками работы браузер обрабатывает клики и рисует.' },
        { q: 'Что делать в обработчике клика первым?', options: ['Отправить аналитику', 'Сохранить в storage', 'Показать видимый отклик', 'Пересчитать рекомендации'], correct: 2, why: 'INP измеряет время до следующего кадра; остальное после `yield`.' },
        { q: 'Какой сдвиг по 0,75 площади и 0,25 расстояния?', options: ['0,1', '1', '0,5', 'Около 0,19'], correct: 3, why: 'Оценка равна произведению доли площади на долю расстояния.' },
        { q: 'Какие картинки нужны с `width` и `height`?', options: ['Все с изменяемым размером', 'Только мелкие иконки', 'Только картинки SVG', 'Только фоновые картинки'], correct: 0, why: 'Без размеров браузер не резервирует место, и контент прыгает.' },
        { q: 'Почему CommonJS-библиотека попадает в бандл целиком?', options: ['Она написана слишком давно', 'Экспорты появляются при запуске', 'Она поставляется без минификации', 'Её код нельзя сжать gzip'], correct: 1, why: 'Tree shaking видит только статические `import` и `export` ES-модулей.' },
        { q: 'Сколько весит весь lodash после gzip?', options: ['Около 70 КБ', 'Около 7 КБ', 'Около 26 КБ', 'Около 200 КБ'], correct: 2, why: '73 КБ минифицированный, около 26 КБ после gzip.' },
        { q: 'Что делает фасад для видеоплеера?', options: ['Ускоряет видео', 'Сжимает поток', 'Кэширует плеер', 'Грузит плеер по клику'], correct: 3, why: 'До клика только картинка и кнопка, плеер и его скрипты не загружаются.' },
        { q: 'Как обновить данные после восстановления из bfcache?', options: ['`pageshow` с `persisted`', 'В обработчике `unload`', 'В `DOMContentLoaded`', 'Через Service Worker'], correct: 0, why: '`event.persisted === true` означает восстановление из bfcache.' },
        { q: 'Первый шаг в ответе «страница медленная»?', options: ['Включить сжатие', 'Уточнить метрику и поле', 'Переписать на SSR', 'Обновить фреймворк'], correct: 1, why: 'Сначала какая метрика, где и у кого, по полевым данным.' },
      ],
      en: [
        { q: 'What LCP is considered good?', options: ['Up to 1 s', 'Up to 2.5 s', 'Up to 4 s', 'Up to 5 s'], correct: 1, why: 'Good up to 2.5 s, needs improvement up to 4 s.' },
        { q: 'What is TBT?', options: ['The lab stand-in for INP', 'Time to first byte', 'The sum of layout shifts', 'The total bundle size'], correct: 0, why: 'The sum of long-task time beyond 50 ms after FCP.' },
        { q: 'Lighthouse gives 95, but CrUX shows poor LCP. What do you trust?', options: ['Lighthouse', 'Both of them equally', 'The CrUX field data', 'Neither of them'], correct: 2, why: 'The field reflects real devices and networks; the lab is for finding the cause.' },
        { q: 'Which LCP part is large if JS inserts the image?', options: ['TTFB', 'Resource load duration', 'Element render delay', 'Resource load delay'], correct: 3, why: 'The browser learns about the image only after the script loads and runs.' },
        { q: 'What is harmful for the LCP image?', options: ['`fetchpriority="high"`', '`loading="lazy"`', '`srcset`', 'The AVIF format'], correct: 1, why: 'A lazy image waits for layout and starts loading late.' },
        { q: 'Why yield to the browser in a long loop?', options: ['To handle input and paint', 'To free memory', 'To shrink the bundle', 'To speed up the network'], correct: 0, why: 'Between chunks of work the browser handles clicks and paints.' },
        { q: 'What comes first in a click handler?', options: ['Sending analytics', 'Saving to storage', 'A visible response', 'Recomputing suggestions'], correct: 2, why: 'INP measures the time to the next frame; the rest goes after `yield`.' },
        { q: 'What is a shift with 0.75 area and 0.25 distance?', options: ['0.1', '1', '0.5', 'About 0.19'], correct: 3, why: 'The score is the area fraction times the distance fraction.' },
        { q: 'Which images need `width` and `height`?', options: ['All resizable ones', 'Only icons', 'Only SVG', 'Only backgrounds'], correct: 0, why: 'Without dimensions the browser reserves no space, and content jumps.' },
        { q: 'Why does a CommonJS library land in the bundle whole?', options: ['It is too old to shake', 'Exports are built at runtime', 'It is not minified', 'It cannot be compressed'], correct: 1, why: 'Tree shaking sees only the static `import` and `export` of ES modules.' },
        { q: 'How much does all of lodash weigh after gzip?', options: ['About 70 KB', 'About 7 KB', 'About 26 KB', 'About 200 KB'], correct: 2, why: '73 KB minified, about 26 KB after gzip.' },
        { q: 'What does a facade for a video player do?', options: ['Speeds up video', 'Compresses the stream', 'Caches the player', 'Loads the player on click'], correct: 3, why: 'Before the click there is only an image and a button; the player and its scripts do not load.' },
        { q: 'How do you refresh data after a bfcache restore?', options: ['`pageshow` with `persisted`', 'In an `unload` handler', 'In `DOMContentLoaded`', 'Through a Service Worker'], correct: 0, why: '`event.persisted === true` means a restore from the bfcache.' },
        { q: 'The first step in the "page is slow" answer?', options: ['Turn on compression', 'Clarify the metric and field', 'Rewrite it all with SSR', 'Upgrade the framework'], correct: 1, why: 'First which metric, where and for whom, from field data.' },
      ],
    },
  },
}
