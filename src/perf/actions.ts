import type { Action, Page, Resource } from './types'

const mapResources = (page: Page, f: (r: Resource) => Resource): Page => ({ ...page, resources: page.resources.map(f) })
const firstParty = (r: Resource) => r.kind !== 'third-party'
/** Makes the interactions that list this action as a fix cheaper. */
const speedUp = (page: Page, id: string): Page => ({
  ...page,
  interactions: page.interactions.map((i) => (i.fixes?.[id] ? { ...i, taskMs: Math.round(i.taskMs * i.fixes[id]!), fixes: { ...i.fixes, [id]: undefined } } : i)),
})
const helpsInteraction = (page: Page, id: string) => page.interactions.some((i) => i.fixes?.[id])
const removeShifts = (page: Page, id: string): Page => ({ ...page, shifts: page.shifts.filter((s) => s.fixedBy !== id) })
const hasShift = (page: Page, id: string) => page.shifts.some((s) => s.fixedBy === id)

const raw: Action[] = [
  {
    id: 'brotli',
    hours: 2,
    title: { ru: 'Включить сжатие Brotli', en: 'Turn on Brotli compression' },
    text: { ru: 'Сжимать HTML, CSS и JavaScript при сборке алгоритмом Brotli и отдавать с заголовком Content-Encoding.', en: 'Compress HTML, CSS and JavaScript with Brotli at build time and serve them with Content-Encoding.' },
    why: {
      ru: 'Текстовые файлы сжимаются в разы: по сети идёт около четверти исходного размера. Это ускоряет всё, что зависит от загрузки кода и стилей. На картинки и шрифты не влияет: они уже сжаты.',
      en: 'Text files shrink several times: about a quarter of the original size travels over the network. It speeds up everything that depends on loading code and styles. It does not affect images and fonts: they are already compressed.',
    },
    lesson: 'net-loading',
    available: (p) => p.compression !== 'brotli',
    apply: (p) => ({ ...p, compression: 'brotli' }),
  },
  {
    id: 'cdn',
    hours: 3,
    title: { ru: 'Раздавать статику через CDN', en: 'Serve static files from a CDN' },
    text: { ru: 'Отдавать файлы с ближайшего к пользователю узла сети доставки.', en: 'Serve files from the delivery network node closest to the user.' },
    why: {
      ru: 'Сокращает задержку каждого запроса: узел ближе, соединение быстрее. Помогает, когда запросов много или сеть у пользователей медленная; размер файлов не меняет.',
      en: 'It cuts the latency of every request: the node is closer and the connection is faster. It helps when there are many requests or users are on slow networks; it does not change file sizes.',
    },
    lesson: 'net-caching',
    available: (p) => !p.cdn,
    apply: (p) => ({ ...p, cdn: true }),
  },
  {
    id: 'long-cache',
    hours: 2,
    title: { ru: 'Кэшировать файлы с хэшем на год', en: 'Cache hashed files for a year' },
    text: { ru: 'Cache-Control: max-age=31536000, immutable для файлов с хэшем в имени; HTML с проверкой.', en: 'Cache-Control: max-age=31536000, immutable for files with a hash in the name; HTML with revalidation.' },
    why: {
      ru: 'Повторные посещения не скачивают стили, скрипты, картинки и шрифты заново. Первому посещению не помогает, поэтому эффект зависит от доли вернувшихся пользователей.',
      en: 'Repeat visits do not download styles, scripts, images and fonts again. It does not help the first visit, so the effect depends on the share of returning users.',
    },
    lesson: 'net-caching',
    available: (p) => !p.longCache,
    apply: (p) => ({ ...p, longCache: true }),
  },
  {
    id: 'code-split',
    hours: 8,
    title: { ru: 'Разбить бандл по маршрутам', en: 'Split the bundle by route' },
    text: { ru: 'Вынести страницы и тяжёлые компоненты, которых нет на первом экране, в чанки с динамическим import().', en: 'Move pages and heavy components that are not on the first screen into chunks loaded with dynamic import().' },
    why: {
      ru: 'В первую загрузку попадает только код текущего экрана: меньше скачивать и, главное, меньше выполнять в главном потоке. На слабых телефонах выполнение JavaScript часто дороже загрузки.',
      en: 'The first load gets only the code of the current screen: less to download and, more importantly, less to run on the main thread. On weak phones running JavaScript often costs more than downloading it.',
    },
    lesson: 'perf-javascript',
    available: (p) => p.resources.some((r) => r.split),
    apply: (p) => mapResources(p, (r) => (r.split ? { ...r, kb: Math.round(r.kb * r.split), cpuMs: r.cpuMs && Math.round(r.cpuMs * r.split), split: undefined } : r)),
  },
  {
    id: 'defer-js',
    hours: 1,
    title: { ru: 'Добавить defer скриптам в <head>', en: 'Add defer to scripts in <head>' },
    text: { ru: 'Синхронные скрипты перестают останавливать разбор HTML и первую отрисовку.', en: 'Synchronous scripts stop pausing HTML parsing and the first paint.' },
    why: {
      ru: 'Скрипт без defer блокирует отрисовку, пока не скачается и не выполнится. С defer страница рисуется раньше, а скрипт выполняется после разбора HTML. Если контент рисует сам скрипт (CSR), выигрыша нет.',
      en: 'A script without defer blocks rendering until it downloads and runs. With defer the page paints earlier and the script runs after the HTML is parsed. If the script itself renders the content (CSR), there is no gain.',
    },
    lesson: 'perf-resources',
    available: (p) => p.resources.some((r) => r.kind === 'js' && r.blocking),
    apply: (p) => mapResources(p, (r) => (r.kind === 'js' && r.blocking ? { ...r, blocking: false } : r)),
  },
  {
    id: 'critical-css',
    hours: 4,
    title: { ru: 'Встроить критический CSS', en: 'Inline critical CSS' },
    text: { ru: 'Стили первого экрана встроить в HTML, остальной CSS загружать без блокировки отрисовки.', en: 'Inline the styles of the first screen into the HTML and load the rest of the CSS without blocking rendering.' },
    why: {
      ru: 'CSS в <head> блокирует отрисовку целиком. Если стили первого экрана приходят вместе с HTML, первая отрисовка не ждёт большой файл стилей.',
      en: 'CSS in <head> blocks rendering entirely. If the styles of the first screen arrive with the HTML, the first paint does not wait for the large stylesheet.',
    },
    lesson: 'perf-resources',
    available: (p) => p.resources.some((r) => r.kind === 'css' && r.blocking),
    apply: (p) => mapResources(p, (r) => (r.kind === 'css' && r.blocking ? { ...r, blocking: false } : r.kind === 'html' ? { ...r, kb: r.kb + 14 } : r)),
  },
  {
    id: 'image-format',
    once: true,
    hours: 4,
    title: { ru: 'AVIF и размеры под экран', en: 'AVIF and screen-sized images' },
    text: { ru: 'Отдавать изображения в AVIF или WebP и нужного размера через srcset и sizes.', en: 'Serve images as AVIF or WebP at the needed size through srcset and sizes.' },
    why: {
      ru: 'Картинка в современном формате и под ширину экрана весит в несколько раз меньше исходного JPEG. Если LCP это изображение, это прямо сокращает LCP.',
      en: 'An image in a modern format sized for the screen weighs several times less than the original JPEG. If the LCP element is an image, this directly cuts LCP.',
    },
    lesson: 'perf-lcp',
    available: (p) => p.resources.some((r) => r.kind === 'image' && r.kb > 60),
    apply: (p) => mapResources(p, (r) => (r.kind === 'image' ? { ...r, kb: Math.round(r.kb * 0.35) } : r)),
  },
  {
    id: 'lazy-images',
    hours: 1,
    title: { ru: 'Ленивая загрузка картинок ниже экрана', en: 'Lazy-load images below the fold' },
    text: { ru: 'loading="lazy" для изображений, которых нет на первом экране.', en: 'loading="lazy" for images that are not on the first screen.' },
    why: {
      ru: 'Картинки ниже экрана перестают делить канал с главным изображением и стилями. Главную картинку ленивой делать нельзя.',
      en: 'Images below the fold stop sharing the connection with the main image and the styles. The main image must not be lazy.',
    },
    lesson: 'perf-lcp',
    available: (p) => p.resources.some((r) => r.kind === 'image' && !r.lcp && !r.lazy),
    apply: (p) => mapResources(p, (r) => (r.kind === 'image' && !r.lcp ? { ...r, lazy: true } : r)),
  },
  {
    id: 'lazy-all',
    hours: 1,
    trap: true,
    title: { ru: 'loading="lazy" всем изображениям', en: 'loading="lazy" on every image' },
    text: { ru: 'Проставить ленивую загрузку всем <img> одним правилом в шаблоне.', en: 'Set lazy loading on every <img> with one rule in the template.' },
    why: {
      ru: 'Ленивая главная картинка начинает загружаться только после первой отрисовки, когда браузер посчитал раскладку. LCP становится хуже. Ленивыми делают только изображения ниже первого экрана.',
      en: 'A lazy main image starts loading only after the first paint, once the browser has computed the layout. LCP gets worse. Only images below the first screen should be lazy.',
    },
    lesson: 'perf-lcp',
    available: (p) => p.resources.some((r) => r.kind === 'image' && r.lcp && !r.lazy),
    apply: (p) => mapResources(p, (r) => (r.kind === 'image' ? { ...r, lazy: true, high: false } : r)),
  },
  {
    id: 'preload-lcp',
    hours: 1,
    title: { ru: 'fetchpriority="high" главной картинке', en: 'fetchpriority="high" on the main image' },
    text: { ru: 'Главное изображение в <img> прямо в HTML с fetchpriority="high" (или preload, если оно задано в CSS).', en: 'The main image as an <img> right in the HTML with fetchpriority="high" (or a preload if it is set in CSS).' },
    why: {
      ru: 'Браузер узнаёт о главной картинке сразу из HTML и качает её с высоким приоритетом, а не после стилей или скриптов. Обычно это самое дешёвое улучшение LCP.',
      en: 'The browser learns about the main image right from the HTML and fetches it with high priority instead of after the styles or scripts. It is usually the cheapest LCP improvement.',
    },
    lesson: 'perf-lcp',
    available: (p) => p.render === 'ssr' && p.resources.some((r) => r.lcp && !r.lazy && (!r.high || (r.discovery ?? 'html') !== 'html')),
    apply: (p) => mapResources(p, (r) => (r.lcp ? { ...r, high: true, discovery: 'html' } : r)),
  },
  {
    id: 'preload-all',
    hours: 1,
    trap: true,
    title: { ru: 'Preload для всех ресурсов', en: 'Preload every resource' },
    text: { ru: 'Добавить <link rel="preload"> всем скриптам, картинкам и шрифтам, чтобы всё загрузилось раньше.', en: 'Add <link rel="preload"> for every script, image and font so everything loads earlier.' },
    why: {
      ru: 'Когда высокий приоритет у всего, его нет ни у чего: ресурсы делят канал с блокирующим CSS и главной картинкой и задерживают их. Preload оставляют одному-двум действительно критичным файлам.',
      en: 'When everything has high priority, nothing does: the resources share the connection with the blocking CSS and the main image and delay them. Preload is kept for one or two truly critical files.',
    },
    lesson: 'perf-resources',
    available: (p) => p.resources.some((r) => firstParty(r) && r.kind !== 'html' && !r.high && !r.lazy),
    apply: (p) => mapResources(p, (r) => (firstParty(r) && r.kind !== 'html' && !r.lazy ? { ...r, high: true } : r)),
  },
  {
    id: 'image-dimensions',
    hours: 2,
    title: { ru: 'Указать width и height картинкам', en: 'Set width and height on images' },
    text: { ru: 'Атрибуты width и height (или aspect-ratio) у всех изображений и встраиваемых блоков.', en: 'width and height attributes (or aspect-ratio) on all images and embeds.' },
    why: {
      ru: 'Браузер резервирует место до загрузки картинки, и текст под ней не прыгает. Это убирает самый частый источник CLS.',
      en: 'The browser reserves the space before the image loads, and the text below does not jump. It removes the most common source of CLS.',
    },
    lesson: 'perf-cls',
    available: (p) => hasShift(p, 'image-dimensions'),
    apply: (p) => removeShifts(p, 'image-dimensions'),
  },
  {
    id: 'font-fallback',
    hours: 2,
    title: { ru: 'font-display: swap и подобранный запасной шрифт', en: 'font-display: swap and a matched fallback font' },
    text: { ru: 'Показывать текст сразу запасным шрифтом, метрики которого подогнаны под веб-шрифт (size-adjust, ascent-override).', en: 'Show text right away in a fallback font whose metrics are matched to the web font (size-adjust, ascent-override).' },
    why: {
      ru: 'Текст больше не ждёт шрифт (невидимый текст задерживал первую отрисовку), а подогнанные метрики запасного шрифта убирают сдвиг при замене.',
      en: 'Text no longer waits for the font (invisible text delayed the first paint), and the matched fallback metrics remove the shift on swap.',
    },
    lesson: 'perf-cls',
    available: (p) => hasShift(p, 'font-fallback') || p.resources.some((r) => r.blocksText),
    apply: (p) => removeShifts(mapResources(p, (r) => (r.blocksText ? { ...r, blocksText: false } : r)), 'font-fallback'),
  },
  {
    id: 'reserve-space',
    hours: 2,
    title: { ru: 'Зарезервировать место под баннеры и поздний контент', en: 'Reserve space for banners and late content' },
    text: { ru: 'min-height для рекламных слотов и скелетоны фиксированной высоты для блоков, которые приходят после загрузки.', en: 'min-height for ad slots and fixed-height skeletons for blocks that arrive after load.' },
    why: {
      ru: 'Баннер или блок, вставленный над контентом после загрузки, сдвигает всё ниже. Заранее занятое место превращает сдвиг в простое появление.',
      en: 'A banner or a block inserted above the content after load pushes everything below it. Space taken in advance turns the shift into a plain appearance.',
    },
    lesson: 'perf-cls',
    available: (p) => hasShift(p, 'reserve-space'),
    apply: (p) => removeShifts(p, 'reserve-space'),
  },
  {
    id: 'virtualize',
    hours: 6,
    title: { ru: 'Виртуализировать длинный список', en: 'Virtualize the long list' },
    text: { ru: 'Держать в DOM только видимые строки и небольшой запас.', en: 'Keep only the visible rows and a small margin in the DOM.' },
    why: {
      ru: 'Обновление списка перестаёт зависеть от его длины: вместо тысяч строк пересчитываются десятки. Это сильно сокращает работу на каждое взаимодействие со списком.',
      en: 'Updating the list stops depending on its length: tens of rows are recomputed instead of thousands. It greatly cuts the work per interaction with the list.',
    },
    lesson: 'perf-runtime',
    available: (p) => helpsInteraction(p, 'virtualize'),
    apply: (p) => speedUp(p, 'virtualize'),
  },
  {
    id: 'debounce',
    hours: 2,
    title: { ru: 'Debounce для обработчика ввода', en: 'Debounce the input handler' },
    text: { ru: 'Запускать тяжёлую работу после паузы в наборе, а не на каждую клавишу.', en: 'Run the heavy work after a pause in typing, not on every key.' },
    why: {
      ru: 'Нажатие клавиши обновляет только поле, а фильтрация выполняется один раз после паузы. Сама тяжёлая работа никуда не девается, поэтому одного debounce для длинного списка мало.',
      en: 'A key press updates only the field, and filtering runs once after the pause. The heavy work itself does not go away, so debounce alone is not enough for a long list.',
    },
    lesson: 'perf-inp',
    available: (p) => helpsInteraction(p, 'debounce'),
    apply: (p) => speedUp(p, 'debounce'),
  },
  {
    id: 'memoize',
    hours: 3,
    title: { ru: 'Убрать лишние перерисовки', en: 'Remove needless re-renders' },
    text: { ru: 'Опустить состояние ближе к месту использования и мемоизировать тяжёлые поддеревья по результатам профилирования.', en: 'Move state closer to where it is used and memoize heavy subtrees based on profiling.' },
    why: {
      ru: 'Взаимодействие перестаёт перерисовывать то, что не изменилось. Помогает, когда профайлер показывает широкие перерисовки; длину списка это не лечит.',
      en: 'An interaction stops re-rendering what did not change. It helps when the profiler shows wide re-renders; it does not cure the length of a list.',
    },
    lesson: 'react-performance',
    available: (p) => helpsInteraction(p, 'memoize'),
    apply: (p) => speedUp(p, 'memoize'),
  },
  {
    id: 'web-worker',
    hours: 8,
    title: { ru: 'Вынести расчёты в Web Worker', en: 'Move computation to a Web Worker' },
    text: { ru: 'Тяжёлые вычисления (разбор, агрегация, поиск) выполнять в отдельном потоке.', en: 'Run heavy computation (parsing, aggregation, search) on a separate thread.' },
    why: {
      ru: 'Главный поток остаётся свободным для ввода и отрисовки, сколько бы ни длился расчёт. Дороже в реализации, зато убирает блокировку целиком.',
      en: 'The main thread stays free for input and rendering however long the computation takes. It costs more to build, but removes the blocking entirely.',
    },
    lesson: 'perf-inp',
    available: (p) => helpsInteraction(p, 'web-worker'),
    apply: (p) => speedUp(p, 'web-worker'),
  },
  {
    id: 'yield',
    hours: 4,
    title: { ru: 'Разбить длинные задачи', en: 'Break up long tasks' },
    text: { ru: 'Делить долгую работу на части и уступать главный поток между ними (scheduler.yield()).', en: 'Split long work into parts and yield the main thread between them (scheduler.yield()).' },
    why: {
      ru: 'Браузер успевает обработать ввод между частями: общая работа та же, но ни одна задача не держит поток дольше 50 мс. Падает TBT, а отклик на ввод во время работы становится быстрее.',
      en: 'The browser gets to handle input between the parts: the total work is the same, but no task holds the thread for more than 50 ms. TBT drops and input during the work gets a faster response.',
    },
    lesson: 'perf-inp',
    available: (p) => helpsInteraction(p, 'yield') || p.resources.some((r) => r.kind === 'js' && (r.cpuMs ?? 0) > 50 && !r.yields),
    apply: (p) => speedUp(mapResources(p, (r) => (r.kind === 'js' && r.cpuMs ? { ...r, yields: true } : r)), 'yield'),
  },
  {
    id: 'defer-tags',
    hours: 3,
    title: { ru: 'Грузить сторонние теги после страницы', en: 'Load third-party tags after the page' },
    text: { ru: 'Аналитику, пиксели и виджеты подключать после загрузки основного контента.', en: 'Attach analytics, pixels and widgets after the main content has loaded.' },
    why: {
      ru: 'Теги перестают блокировать отрисовку и делить канал с контентом. Их фоновая работа в главном потоке остаётся, поэтому на отклик это не влияет.',
      en: 'Tags stop blocking rendering and sharing the connection with content. Their background main-thread work remains, so responsiveness is not affected.',
    },
    lesson: 'perf-resources',
    available: (p) => p.resources.some((r) => r.kind === 'third-party' && !r.deferred),
    apply: (p) => mapResources(p, (r) => (r.kind === 'third-party' ? { ...r, deferred: true, blocking: false } : r)),
  },
  {
    id: 'facade',
    hours: 3,
    title: { ru: 'Заменить виджет фасадом', en: 'Replace the widget with a facade' },
    text: { ru: 'Показывать лёгкую кнопку-заглушку, а настоящий чат или плеер загружать по клику.', en: 'Show a light placeholder button and load the real chat or player on click.' },
    why: {
      ru: 'Тяжёлый виджет не скачивается и не работает в фоне, пока пользователь о нём не попросил. Большинству посетителей он не нужен вовсе.',
      en: 'The heavy widget is neither downloaded nor running in the background until the user asks for it. Most visitors never need it.',
    },
    lesson: 'perf-resources',
    available: (p) => p.resources.some((r) => r.facade && !(r.deferred && !r.backgroundMs)),
    apply: (p) => mapResources(p, (r) => (r.facade ? { ...r, deferred: true, blocking: false, backgroundMs: 0 } : r)),
  },
  {
    id: 'ssr',
    hours: 12,
    title: { ru: 'Серверный рендеринг со стримингом', en: 'Server rendering with streaming' },
    text: { ru: 'Отдавать с сервера готовый HTML с данными и гидрировать на клиенте.', en: 'Send ready HTML with data from the server and hydrate on the client.' },
    why: {
      ru: 'Контент виден до загрузки и выполнения JavaScript, а главную картинку браузер находит прямо в HTML. Сервер работает чуть дольше, и гидратация по-прежнему нагружает главный поток.',
      en: 'Content is visible before JavaScript downloads and runs, and the browser finds the main image right in the HTML. The server works a little longer, and hydration still loads the main thread.',
    },
    lesson: 'render-ssr',
    available: (p) => p.render === 'csr',
    apply: (p) => ({
      ...mapResources(p, (r) => (r.discovery === 'js' ? { ...r, discovery: 'html' } : r)),
      render: 'ssr',
      serverMs: p.serverMs + 120 + Math.round((p.apiMs ?? 0) * 0.5),
      apiMs: undefined,
    }),
  },
  {
    id: 'fix-leak',
    hours: 4,
    title: { ru: 'Устранить утечку памяти', en: 'Fix the memory leak' },
    text: { ru: 'Найти по снимкам кучи удерживаемые объекты: снять обработчики, остановить таймеры и подписки при размонтировании.', en: 'Find the retained objects with heap snapshots: remove listeners, stop timers and subscriptions on unmount.' },
    why: {
      ru: 'Память перестаёт расти за сессию, сборщик мусора не устраивает длинных пауз, и отклик не деградирует со временем.',
      en: 'Memory stops growing over the session, the garbage collector causes no long pauses, and responsiveness does not degrade over time.',
    },
    lesson: 'js-memory',
    available: (p) => p.leakMbPerMin > 0,
    apply: (p) => ({ ...p, leakMbPerMin: 0 }),
  },
  {
    id: 'spinner',
    once: true,
    hours: 1,
    trap: true,
    title: { ru: 'Показать спиннер на время загрузки', en: 'Show a spinner while loading' },
    text: { ru: 'Добавить индикатор загрузки поверх страницы, чтобы пользователь видел, что что-то происходит.', en: 'Add a loading indicator over the page so the user sees that something is happening.' },
    why: {
      ru: 'Спиннер не ускоряет ни загрузку, ни отклик: метрики остаются прежними. Причину медленной работы он не трогает.',
      en: 'A spinner speeds up neither loading nor responsiveness: the metrics stay the same. It does not touch the cause of the slowness.',
    },
    lesson: 'perf-metrics',
    available: () => true,
    apply: (p) => p,
  },
  {
    id: 'more-servers',
    once: true,
    hours: 6,
    title: { ru: 'Добавить серверов и кэш ответов', en: 'Add servers and a response cache' },
    text: { ru: 'Масштабировать бэкенд и кэшировать ответы, чтобы HTML отдавался быстрее.', en: 'Scale the backend and cache responses so the HTML is served faster.' },
    why: {
      ru: 'Сокращает время ответа сервера (TTFB). Помогает, только если именно сервер был узким местом; когда время уходит на загрузку и выполнение фронтенда, пользователь разницы почти не видит.',
      en: 'It cuts the server response time (TTFB). It helps only if the server was the bottleneck; when the time goes into loading and running the front end, the user hardly sees a difference.',
    },
    lesson: 'perf-measure',
    available: (p) => p.serverMs > 80,
    apply: (p) => ({ ...p, serverMs: Math.round(p.serverMs * 0.5) }),
  },
  {
    id: 'minify-html',
    once: true,
    hours: 2,
    trap: true,
    title: { ru: 'Минифицировать HTML', en: 'Minify the HTML' },
    text: { ru: 'Убрать пробелы и комментарии из HTML-документа.', en: 'Strip whitespace and comments from the HTML document.' },
    why: {
      ru: 'HTML уже маленький и хорошо сжимается: экономия в пару килобайт не меняет ни одну метрику. Время стоит тратить на самое тяжёлое.',
      en: 'The HTML is already small and compresses well: saving a couple of kilobytes changes no metric. Time is better spent on the heaviest things.',
    },
    lesson: 'perf-budgets',
    available: (p) => p.resources.some((r) => r.kind === 'html'),
    apply: (p) => mapResources(p, (r) => (r.kind === 'html' ? { ...r, kb: Math.round(r.kb * 0.92) } : r)),
  },
]

/** One-off actions disappear after they are taken, even if their condition still holds. */
const list: Action[] = raw.map((a) =>
  a.once ? { ...a, available: (p) => !p.done?.includes(a.id) && a.available(p), apply: (p) => ({ ...a.apply(p), done: [...(p.done ?? []), a.id] }) } : a,
)

const byId = new Map(list.map((a) => [a.id, a]))
export const actionIds = list.map((a) => a.id)

const REMOVE = 'remove:'

/** Removing one third-party tag: offered for every removable tag on the page. */
function removal(r: Resource): Action {
  return {
    id: `${REMOVE}${r.id}`,
    hours: 2,
    title: { ru: `Убрать тег «${r.label.ru}»`, en: `Remove the "${r.label.en}" tag` },
    text: { ru: 'Договориться с владельцем тега и удалить его со страницы.', en: 'Agree with the tag owner and remove it from the page.' },
    why: {
      ru: 'Сторонний скрипт больше не скачивается, не блокирует отрисовку и не занимает главный поток. Самый надёжный способ ускорить сторонний код это не загружать его.',
      en: 'The third-party script is no longer downloaded, does not block rendering and does not occupy the main thread. The most reliable way to speed up third-party code is not to load it.',
    },
    lesson: 'perf-resources',
    available: (p) => p.resources.some((x) => x.id === r.id),
    apply: (p) => ({ ...p, resources: p.resources.filter((x) => x.id !== r.id) }),
  }
}

/** Looks up an action by id; removal ids are resolved against the current page. */
export function getAction(id: string, page: Page): Action | undefined {
  if (id.startsWith(REMOVE)) {
    const r = page.resources.find((x) => x.id === id.slice(REMOVE.length) && x.removable)
    return r && removal(r)
  }
  return byId.get(id)
}

/** Actions the player can take now: the scenario's own list plus a removal for every removable tag. */
export function availableActions(page: Page, allowed: string[]): Action[] {
  const fixed = allowed.map((id) => byId.get(id)!).filter((a) => a.available(page))
  const removals = page.resources.filter((r) => r.kind === 'third-party' && r.removable).map(removal)
  return [...fixed, ...removals]
}
