import type { Localized } from '../i18n/types'

/**
 * Front end system design problems for the mock interview. The prompt is deliberately vague; the
 * interviewer reveals `facts` only when asked and steers the deep dive to `focus`, which the
 * committee also checks. Built on the system design track (`content/lessons/system-design`).
 */
export interface DesignProblem {
  id: string
  kind: 'app' | 'component'
  emoji: string
  title: Localized
  prompt: Localized
  facts: Localized<string[]>
  focus: Localized<string[]>
  /** Related lesson for preparation. */
  lesson: string
}

export const designProblems: DesignProblem[] = [
  {
    id: 'news-feed',
    kind: 'app',
    emoji: '📰',
    title: { ru: 'Лента новостей', en: 'News feed' },
    prompt: { ru: 'Спроектируйте ленту новостей социальной сети, как в Facebook или X.', en: 'Design the news feed of a social network, like Facebook or X.' },
    facts: {
      ru: [
        'Посты из текста и изображений; видео и опросы не в первой версии',
        'Нужно: смотреть ленту, ставить реакции, создавать пост; комментарии потом',
        'Бесконечная прокрутка, пользователь сидит в ленте по 30–40 минут',
        'В основном мобильные браузеры, часть пользователей на медленной сети',
        'Пользователь вошёл в аккаунт; SEO для ленты не нужно, публичные страницы постов индексируются',
      ],
      en: [
        'Posts are text and images; video and polls are not in the first version',
        'Needed: browse the feed, react, create a post; comments later',
        'Infinite scrolling, users stay in the feed for 30–40 minutes',
        'Mostly mobile browsers, some users on a slow network',
        'The user is signed in; the feed needs no SEO, public post pages are indexed',
      ],
    },
    focus: {
      ru: [
        'CSR и SPA для ленты, SSR для публичных страниц постов',
        'нормализованный стор: лента как список id, посты и авторы в словарях',
        'пагинация курсором, а не смещением; новые посты кнопкой',
        'виртуализация длинного списка, IntersectionObserver для подгрузки',
        'оптимистичные реакции с откатом, ключ идемпотентности при создании поста',
        'размеры изображений против CLS, ленивая загрузка, доступность (role="feed")',
      ],
      en: [
        'CSR and SPA for the feed, SSR for public post pages',
        'a normalized store: the feed as a list of ids, posts and authors in dictionaries',
        'cursor pagination, not offsets; new posts behind a button',
        'virtualizing the long list, IntersectionObserver for loading more',
        'optimistic reactions with rollback, an idempotency key on post creation',
        'image sizes against CLS, lazy loading, accessibility (role="feed")',
      ],
    },
    lesson: 'sd-news-feed',
  },
  {
    id: 'autocomplete',
    kind: 'component',
    emoji: '🔎',
    title: { ru: 'Автодополнение', en: 'Autocomplete' },
    prompt: { ru: 'Спроектируйте компонент автодополнения для поиска, которым смогут пользоваться разные продукты компании.', en: "Design an autocomplete component for search that different products of the company can use." },
    facts: {
      ru: [
        'Результаты бывают текстом, карточкой с картинкой, группами (люди, страницы)',
        'Сервер уже есть: GET /search?q=…&limit=…',
        'Нужны все устройства, включая телефоны',
        'Нечёткий поиск не нужен в первой версии',
        'Пользователи печатают быстро, сеть бывает медленной',
      ],
      en: [
        'Results can be text, a card with an image, groups (people, pages)',
        'A server already exists: GET /search?q=…&limit=…',
        'All devices are needed, phones included',
        'Fuzzy search is not needed in the first version',
        'Users type fast, the network can be slow',
      ],
    },
    focus: {
      ru: [
        'части: поле, список, контроллер, кэш',
        'API компонента: источник данных функцией с AbortSignal, debounce, minQueryLength, renderItem',
        'гонка ответов: хранить по ключу запроса, отмена как экономия',
        'кэш по нормализованному запросу, TTL под продукт, ограничение размера (LRU)',
        'combobox по ARIA APG: listbox, option, aria-activedescendant, role="status"',
        'клавиатура, IME, состояния загрузки, пусто и ошибки',
      ],
      en: [
        'parts: the field, the list, the controller, the cache',
        'component API: a data source function with an AbortSignal, debounce, minQueryLength, renderItem',
        'response races: store by query key, cancellation as a saving',
        'a cache by normalized query, a TTL per product, a size limit (LRU)',
        'a combobox by ARIA APG: listbox, option, aria-activedescendant, role="status"',
        'keyboard, IME, loading, empty and error states',
      ],
    },
    lesson: 'sd-autocomplete',
  },
  {
    id: 'chat',
    kind: 'app',
    emoji: '💬',
    title: { ru: 'Мессенджер', en: 'Chat app' },
    prompt: { ru: 'Спроектируйте веб-клиент мессенджера, как Messenger или Slack.', en: 'Design a web client for a messenger, like Messenger or Slack.' },
    facts: {
      ru: [
        'Личные и групповые чаты до 100 участников',
        'Текст и изображения; статусы «отправлено», «доставлено», «прочитано»',
        'Пользователь открывает несколько вкладок; связь иногда пропадает',
        'История за годы, прокрутка вверх подгружает старое',
        'Индикатор «печатает…» и онлайн-статус',
      ],
      en: [
        'One-to-one and group chats of up to 100 participants',
        'Text and images; "sent", "delivered", "read" statuses',
        'Users open several tabs; the connection sometimes drops',
        'Years of history, scrolling up loads older messages',
        'A "typing…" indicator and online status',
      ],
    },
    focus: {
      ru: [
        'WebSocket для новых сообщений, HTTP с курсором для истории',
        'clientId для оптимистичной отправки, серверный seq для порядка',
        'догрузка пропущенного после переподключения по последнему seq',
        'статусы сообщения и повтор отправки без дублей',
        'список, прокрученный к низу, сохранение позиции при подгрузке сверху',
        'синхронизация вкладок, aria-live для новых сообщений, офлайн-очередь',
      ],
      en: [
        'WebSocket for new messages, HTTP with a cursor for history',
        'a clientId for optimistic sending, a server seq for order',
        'catching up after a reconnect by the last seq',
        'message statuses and resending without duplicates',
        'a bottom-anchored list that keeps its position when older messages load',
        'tab sync, aria-live for new messages, an offline queue',
      ],
    },
    lesson: 'sd-app-cases',
  },
  {
    id: 'e-commerce',
    kind: 'app',
    emoji: '🛒',
    title: { ru: 'Интернет-магазин', en: 'Online shop' },
    prompt: { ru: 'Спроектируйте фронтенд интернет-магазина: каталог, карточка товара, корзина.', en: 'Design the front end of an online shop: catalog, product page, cart.' },
    facts: {
      ru: [
        'Миллион товаров, большая часть трафика приходит из поиска Google',
        'Магазин работает в 10 странах с разными валютами и языками',
        'Гости могут собирать корзину до входа',
        'Скорость страницы товара напрямую влияет на конверсию',
        'Оплата картой через внешнего платёжного провайдера',
      ],
      en: [
        'A million products, most traffic comes from Google search',
        'The shop operates in 10 countries with different currencies and languages',
        'Guests can fill a cart before signing in',
        'Product page speed directly affects conversion',
        'Card payment through an external payment provider',
      ],
    },
    focus: {
      ru: [
        'SSR или статическая генерация с обновлением для каталога и карточек',
        'SEO: канонические URL, структурированные данные Product, карта сайта',
        'Core Web Vitals: LCP-картинка с fetchpriority, размеры, лёгкий JS',
        'фильтры и пагинация в URL',
        'корзина на сервере, гостевая корзина и слияние после входа',
        'Intl для валют, языки, оплата во фрейме провайдера',
      ],
      en: [
        'SSR or static generation with revalidation for the catalog and product pages',
        'SEO: canonical URLs, Product structured data, a sitemap',
        'Core Web Vitals: the LCP image with fetchpriority, sizes, light JS',
        'filters and pagination in the URL',
        'a server cart, a guest cart and merging after sign-in',
        'Intl for currencies, languages, payment in the provider frame',
      ],
    },
    lesson: 'sd-app-cases',
  },
  {
    id: 'photo-feed',
    kind: 'app',
    emoji: '📌',
    title: { ru: 'Лента фотографий', en: 'Photo feed' },
    prompt: { ru: 'Спроектируйте ленту фотографий в духе Pinterest: сетка карточек и загрузка своих фото.', en: 'Design a Pinterest-like photo feed: a grid of cards and uploading your own photos.' },
    facts: {
      ru: [
        'Карточки разной высоты, сетка в несколько колонок',
        'Пользователи загружают фото с телефона, до 20 МБ',
        'Бесконечная прокрутка, тысячи карточек за сессию',
        'Сервер умеет отдавать изображения в нескольких размерах и форматах',
      ],
      en: [
        'Cards of different heights, a multi-column grid',
        'Users upload photos from phones, up to 20 MB',
        'Infinite scrolling, thousands of cards per session',
        'The server can serve images in several sizes and formats',
      ],
    },
    focus: {
      ru: [
        'ширина и высота из API, раскладка masonry до загрузки картинок',
        'srcset и sizes, AVIF или WebP, ленивая загрузка, заглушки',
        'виртуализация длинной сетки',
        'загрузка: сжатие на клиенте, прогресс, загрузка частями, подписанный URL',
        'пагинация курсором, доступные альтернативные тексты',
      ],
      en: [
        'width and height from the API, masonry layout before images load',
        'srcset and sizes, AVIF or WebP, lazy loading, placeholders',
        'virtualizing the long grid',
        'upload: client-side compression, progress, chunked upload, a signed URL',
        'cursor pagination, accessible alt texts',
      ],
    },
    lesson: 'sd-app-cases',
  },
  {
    id: 'video-tv',
    kind: 'app',
    emoji: '🎬',
    title: { ru: 'Видеосервис на ТВ', en: 'Video service on TV' },
    prompt: { ru: 'Спроектируйте главный экран видеосервиса вроде Netflix: ряды фильмов и плеер, в том числе для телевизора.', en: 'Design the home screen of a Netflix-like video service: rows of titles and a player, including for TV.' },
    facts: {
      ru: [
        'Управление на ТВ только пультом: стрелки, OK, «назад»',
        'Слабое железо телевизоров, мало памяти',
        'На главной 20–40 рядов по 50 карточек',
        'Несколько профилей на аккаунт, включая детский',
        'Субтитры и аудиодорожки на нескольких языках',
      ],
      en: [
        'TV control is by remote only: arrows, OK, back',
        'Weak TV hardware, little memory',
        'The home screen has 20–40 rows of 50 cards',
        'Several profiles per account, including a kids profile',
        'Subtitles and audio tracks in several languages',
      ],
    },
    focus: {
      ru: [
        'пространственная навигация стрелками и заметный фокус',
        'ряды как отдельные запросы с курсором, предзагрузка соседних',
        'виртуализация по двум осям, ограничение памяти',
        'адаптивный стриминг HLS или DASH через MSE',
        'субтитры WebVTT, аудиодескрипция, крупный текст',
        'профили: сброс кэша при смене, ограничения детского профиля',
      ],
      en: [
        'spatial arrow navigation and a visible focus',
        'rows as separate requests with a cursor, prefetching neighbors',
        'virtualization along two axes, a memory limit',
        'adaptive streaming with HLS or DASH through MSE',
        'WebVTT subtitles, audio description, large text',
        'profiles: clearing the cache on switch, kids profile restrictions',
      ],
    },
    lesson: 'sd-app-cases',
  },
  {
    id: 'collab-editor',
    kind: 'app',
    emoji: '📝',
    title: { ru: 'Совместный редактор', en: 'Collaborative editor' },
    prompt: { ru: 'Спроектируйте клиент совместного текстового редактора, как Google Docs.', en: 'Design the client of a collaborative text editor, like Google Docs.' },
    facts: {
      ru: [
        'До 20 человек правят документ одновременно',
        'Видны курсоры и выделения других участников',
        'Правки без сети должны сохраниться и слиться позже',
        'Форматирование: заголовки, списки, ссылки, изображения',
      ],
      en: [
        'Up to 20 people edit a document at the same time',
        "Other participants' cursors and selections are visible",
        'Offline edits must be kept and merged later',
        'Formatting: headings, lists, links, images',
      ],
    },
    focus: {
      ru: [
        'модель документа: дерево блоков или последовательность с атрибутами',
        'OT через сервер против CRDT (Yjs, Automerge), выбор под офлайн',
        'присутствие отдельным лёгким каналом',
        'WebSocket, очередь правок без сети, история версий',
        'undo только своих действий, безопасная вставка HTML',
      ],
      en: [
        'the document model: a tree of blocks or a sequence with attributes',
        'OT through a server versus CRDTs (Yjs, Automerge), the choice for offline',
        'presence over a separate lightweight channel',
        'WebSocket, an offline edit queue, version history',
        'undo of your own actions only, safe HTML paste',
      ],
    },
    lesson: 'sd-app-cases',
  },
  {
    id: 'data-table',
    kind: 'component',
    emoji: '📊',
    title: { ru: 'Таблица данных', en: 'Data table' },
    prompt: { ru: 'Спроектируйте компонент таблицы данных с сортировкой, фильтрами и пагинацией для дизайн-системы.', en: 'Design a data table component with sorting, filters and pagination for a design system.' },
    facts: {
      ru: [
        'Данные бывают локальными (до 1000 строк) и серверными (миллионы строк)',
        'Нужно выделение строк, закрепление колонок, изменение ширины',
        'Таблицу используют разные продукты с разным оформлением',
        'Требования к доступности WCAG 2.2 AA',
      ],
      en: [
        'Data can be local (up to 1,000 rows) or server-side (millions of rows)',
        'Row selection, pinned columns and resizing are needed',
        'Different products use the table with different styling',
        'WCAG 2.2 AA accessibility requirements',
      ],
    },
    focus: {
      ru: [
        'API: колонки как конфигурация, управляемое и неуправляемое состояние, renderCell',
        'режим клиентской и серверной сортировки и пагинации',
        'виртуализация строк для больших данных',
        'семантика таблицы, aria-sort, клавиатура, объявление изменений',
        'состояние в URL, состояния загрузки, пусто и ошибки',
      ],
      en: [
        'API: columns as config, controlled and uncontrolled state, renderCell',
        'client-side and server-side sorting and pagination modes',
        'row virtualization for large data',
        'table semantics, aria-sort, keyboard, announcing changes',
        'state in the URL, loading, empty and error states',
      ],
    },
    lesson: 'sd-radio',
  },
  {
    id: 'image-carousel',
    kind: 'component',
    emoji: '🎠',
    title: { ru: 'Карусель изображений', en: 'Image carousel' },
    prompt: { ru: 'Спроектируйте компонент карусели изображений для витрины.', en: 'Design an image carousel component for a storefront.' },
    facts: {
      ru: [
        'От 3 до 50 слайдов, изображения большие',
        'Нужны стрелки, точки, свайп и автопрокрутка',
        'Используется на главной, часто это первый экран',
      ],
      en: [
        'From 3 to 50 slides, large images',
        'Arrows, dots, swipe and autoplay are needed',
        'It is used on the home page, often above the fold',
      ],
    },
    focus: {
      ru: [
        'API: слайды, renderSlide, управляемый индекс, onChange',
        'LCP: первый слайд с высоким приоритетом, остальные лениво',
        'размеры и aspect-ratio против CLS, transform для анимации',
        'доступность: паттерн carousel из APG, пауза автопрокрутки, prefers-reduced-motion',
        'клавиатура и свайп, бесконечная прокрутка или упор в край',
      ],
      en: [
        'API: slides, renderSlide, a controlled index, onChange',
        'LCP: the first slide with high priority, the rest lazy',
        'sizes and aspect-ratio against CLS, transform for animation',
        'accessibility: the APG carousel pattern, pausing autoplay, prefers-reduced-motion',
        'keyboard and swipe, looping or stopping at the edge',
      ],
    },
    lesson: 'sd-interview',
  },
  {
    id: 'poll-widget',
    kind: 'component',
    emoji: '🗳️',
    title: { ru: 'Встраиваемый опрос', en: 'Embeddable poll' },
    prompt: { ru: 'Спроектируйте виджет опроса, который чужие сайты встраивают к себе на страницу.', en: 'Design a poll widget that third-party sites embed into their pages.' },
    facts: {
      ru: [
        'Встраивают тысячи сайтов с разными стилями и фреймворками',
        'Голос можно отдать один раз; результаты обновляются почти в реальном времени',
        'Сайт-хозяин не должен тормозить из-за виджета',
      ],
      en: [
        'Thousands of sites with different styles and frameworks embed it',
        'One vote per person; results update in near real time',
        'The host site must not slow down because of the widget',
      ],
    },
    focus: {
      ru: [
        'способ встраивания: iframe против скрипта с Web Component и Shadow DOM',
        'изоляция стилей и безопасность (CSP, postMessage с проверкой origin)',
        'маленький асинхронный скрипт, без влияния на LCP и INP хозяина',
        'защита от повторного голоса, оптимистичный результат',
        'обновления через SSE или опрос, доступность формы',
      ],
      en: [
        'the embedding method: an iframe versus a script with a Web Component and Shadow DOM',
        'style isolation and security (CSP, postMessage with an origin check)',
        "a small async script with no impact on the host's LCP and INP",
        'protection against double voting, an optimistic result',
        'updates through SSE or polling, form accessibility',
      ],
    },
    lesson: 'sd-optimizations',
  },
]

export const getDesignProblem = (id: string) => designProblems.find((p) => p.id === id)
