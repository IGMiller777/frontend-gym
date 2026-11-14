import type { Source } from '../sources'
import type { Lesson, Module } from './types'

const src = (title: string, url: string): Source => ({ title, url, kind: 'official' })
const spec = (title: string, url: string): Source => ({ title, url, kind: 'spec' })
const gfe = (title: string, path: string): Source => ({ title: `GreatFrontEnd: ${title}`, url: `https://www.greatfrontend.com/${path}`, kind: 'article' })
const apg = (title: string, path: string) => spec(`ARIA APG: ${title}`, `https://www.w3.org/WAI/ARIA/apg/patterns/${path}/`)
const mdn = (title: string, path: string) => src(`MDN: ${title}`, `https://developer.mozilla.org/en-US/docs/${path}`)
const playbook = (title: string, slug: string) => gfe(title, `front-end-system-design-playbook/${slug}`)
const verified = { date: '2026-11', version: 'GreatFrontEnd Front End System Design Playbook, WCAG 2.2, ARIA APG' }

export const systemDesignLessons: Lesson[] = [
  {
    id: 'sd-intro',
    track: 'system-design',
    emoji: '🧭',
    minutes: 10,
    title: { ru: 'Что такое frontend system design', en: 'What front end system design is' },
    summary: {
      ru: 'Чем frontend-раунд отличается от backend, задачи на приложение и на компонент, главные темы разных продуктов, шесть осей оценки и частые ошибки.',
      en: 'How the front end round differs from the back end one, application and component tasks, key topics of different products, six evaluation axes and common mistakes.',
    },
    quiz: {
      ru: [
        { q: 'Что на frontend system design считают чёрным ящиком?', options: ['Сервер', 'Стор клиента', 'Представление', 'Слой данных'], correct: 0, why: 'Фокус на клиенте и API между клиентом и сервером.' },
        { q: 'Какая тема главная для чата?', options: ['SEO и метатеги', 'Реальное время', 'Раскладка masonry', 'Статическая генерация'], correct: 1, why: 'Чат не индексируют, а доставка сообщений его суть.' },
        { q: 'Вы обдумали компромисс, но не сказали о нём. Что увидит интервьюер?', options: ['Глубину мысли', 'Скорость решения', 'Ничего', 'Хорошую структуру'], correct: 2, why: 'Оценивают только сказанное и нарисованное.' },
        { q: 'Когда уместно говорить о выборе фреймворка?', options: ['Всегда, в самом начале', 'Никогда на этом раунде', 'Если осталось время', 'Когда он следует из задачи'], correct: 3, why: 'Например, SSR для SEO; иначе архитектуру это не меняет.' },
      ],
      en: [
        { q: 'What is a black box in front end system design?', options: ['The server', 'The client store', 'The view', 'The data layer'], correct: 0, why: 'The focus is the client and the API between client and server.' },
        { q: 'What is the key topic for a chat?', options: ['SEO and meta tags', 'Real time', 'Masonry layout', 'Static generation'], correct: 1, why: 'A chat is not indexed, and message delivery is its essence.' },
        { q: 'You weighed a tradeoff but did not say it. What does the interviewer see?', options: ['Depth of thought', 'Solving speed', 'Nothing', 'Good structure'], correct: 2, why: 'Only what is said and drawn is evaluated.' },
        { q: 'When is it fine to talk about the framework choice?', options: ['Always, at the very start', 'Never in this round', 'If time is left over', 'When the task implies it'], correct: 3, why: 'For example, SSR for SEO; otherwise it does not change the architecture.' },
      ],
    },
    sources: [
      playbook('Front End System Design: An Introduction', 'introduction'),
      playbook('Types of Front End System Design Questions', 'types-of-questions'),
      playbook('Evaluation Criteria', 'evaluation-axes'),
      playbook('Common Mistakes to Avoid', 'common-mistakes'),
      src('web.dev: Rendering on the Web', 'https://web.dev/articles/rendering-on-the-web'),
    ],
    verified,
  },
  {
    id: 'sd-radio',
    track: 'system-design',
    emoji: '📻',
    minutes: 13,
    title: { ru: 'Метод RADIO', en: 'The RADIO method' },
    summary: {
      ru: 'Требования, архитектура, данные, интерфейсы и оптимизации: время на каждый шаг, вопросы в начале, слои клиента, API с сервером и внутри клиента, выбор тем.',
      en: 'Requirements, architecture, data, interfaces and optimizations: time per step, opening questions, client layers, the API with the server and inside the client, choosing topics.',
    },
    quiz: {
      ru: [
        { q: 'На какой шаг RADIO обычно уходит больше всего времени?', options: ['Требования', 'Архитектура', 'Модель данных', 'Оптимизации'], correct: 3, why: 'Около 40 %: там глубина и основные очки.' },
        { q: 'Что делать, если новое требование ломает модель данных?', options: ['Вернуться и поправить её', 'Не менять, порядок важен', 'Отложить до конца', 'Начать всё заново'], correct: 0, why: 'RADIO это чек-лист, а не строгая последовательность.' },
        { q: 'За что отвечает слой доступа к данным?', options: ['За разметку страниц', 'За запросы, кэш, повторы', 'За стили и темы', 'За маршруты и ссылки'], correct: 1, why: 'Если появится офлайн, изменится только он.' },
        { q: 'Что не стоит обсуждать в оптимизациях?', options: ['Виртуализацию списка', 'SSR для SEO', 'Выбор линтера', 'Пагинацию'], correct: 2, why: 'Инструменты не меняют архитектуру продукта.' },
      ],
      en: [
        { q: 'Which RADIO step usually takes the most time?', options: ['Requirements', 'Architecture', 'Data model', 'Optimizations'], correct: 3, why: 'About 40%: the depth and most points are there.' },
        { q: 'What if a new requirement breaks the data model?', options: ['Go back and fix it', 'Keep it, order matters', 'Leave it to the end', 'Start over entirely'], correct: 0, why: 'RADIO is a checklist, not a strict sequence.' },
        { q: 'What is the data access layer responsible for?', options: ['The page markup', 'Requests, cache, retries', 'Styles and themes', 'Routes and links'], correct: 1, why: 'If offline support appears, only this layer changes.' },
        { q: 'What is not worth discussing under optimizations?', options: ['List virtualization', 'SSR for SEO', 'The linter choice', 'Pagination'], correct: 2, why: 'Tools do not change the product architecture.' },
      ],
    },
    sources: [
      playbook('The RADIO Framework', 'framework'),
      playbook('Cheatsheet', 'cheatsheet'),
      src('web.dev: Rendering on the Web', 'https://web.dev/articles/rendering-on-the-web'),
      mdn('Server-sent events', 'Web/API/Server-sent_events'),
      mdn('WebSocket API', 'Web/API/WebSockets_API'),
    ],
    verified,
  },
  {
    id: 'sd-data-model',
    track: 'system-design',
    emoji: '🗃️',
    minutes: 11,
    title: { ru: 'Модель данных и состояние', en: 'Data model and state' },
    summary: {
      ru: 'Откуда данные, четыре корзины состояния, описание сущностей, нормализованный стор, лента как список идентификаторов, состояние в URL, где что хранить.',
      en: 'Where data comes from, the four state buckets, describing entities, a normalized store, a feed as a list of ids, state in the URL, where to keep what.',
    },
    quiz: {
      ru: [
        { q: 'К какой корзине относится отфильтрованный список?', options: ['Серверное', 'Интерфейса', 'Производное', 'Мгновенное'], correct: 2, why: 'Его вычисляют из данных, а не хранят.' },
        { q: 'Зачем нормализовать стор?', options: ['Одна запись на сущность', 'Меньше запросов к API', 'Быстрее рендер', 'Так требует React'], correct: 0, why: 'Обновление одной записи видно во всех местах.' },
        { q: 'Где держать фильтры, которыми хочется делиться?', options: ['В `localStorage`', 'В глобальном сторе', 'В cookie', 'В URL'], correct: 3, why: 'Ссылка, «назад» и закладки работают бесплатно.' },
        { q: 'Где лучше хранить данные с сервера?', options: ['В копии в Redux', 'В кэше запросов', 'В `sessionStorage`', 'В компоненте'], correct: 1, why: 'Кэш знает об устаревании, повторах и общих запросах.' },
      ],
      en: [
        { q: 'Which bucket does a filtered list belong to?', options: ['Server', 'UI', 'Derived', 'Ephemeral'], correct: 2, why: 'It is computed from data, not stored.' },
        { q: 'Why normalize the store?', options: ['One record per entity', 'Fewer API requests', 'Faster rendering', 'React requires it'], correct: 0, why: 'Updating one record is visible everywhere.' },
        { q: 'Where to keep filters people want to share?', options: ['In `localStorage`', 'In the global store', 'In a cookie', 'In the URL'], correct: 3, why: 'Links, back and bookmarks work for free.' },
        { q: 'Where is server data best kept?', options: ['A copy in Redux', 'In a query cache', 'In `sessionStorage`', 'In a component'], correct: 1, why: 'The cache knows about staleness, retries and shared requests.' },
      ],
    },
    sources: [
      playbook('The RADIO Framework: Data model', 'framework'),
      src('Redux: Normalizing State Shape', 'https://redux.js.org/usage/structuring-reducers/normalizing-state-shape'),
      src('TanStack Query: Overview', 'https://tanstack.com/query/latest/docs/framework/react/overview'),
    ],
    verified,
  },
  {
    id: 'sd-news-feed',
    track: 'system-design',
    emoji: '📰',
    minutes: 15,
    title: { ru: 'Разбор: лента новостей', en: 'Walkthrough: a news feed' },
    summary: {
      ru: 'Лента по RADIO: CSR и SPA, нормализованные сущности, API с курсором и загрузкой медиа, идемпотентность, виртуализация, бесконечная прокрутка, оптимистичные реакции, паттерн feed.',
      en: 'A feed through RADIO: CSR and SPA, normalized entities, a cursor API and media upload, idempotency, virtualization, infinite scrolling, optimistic reactions, the feed pattern.',
    },
    quiz: {
      ru: [
        { q: 'Почему для ленты курсор, а не смещение?', options: ['Курсор проще в коде', 'Нет дублей с новыми', 'Смещение медленнее', 'Так требует REST'], correct: 1, why: 'Вставки сверху сдвигают смещение, а курсор нет.' },
        { q: 'Откуда сервер узнаёт, чью ленту отдать?', options: ['Из сессии', 'Из параметра `userId`', 'Из заголовка `Referer`', 'Из `localStorage`'], correct: 0, why: 'Параметр позволил бы запросить чужую ленту.' },
        { q: 'Когда создают ключ идемпотентности поста?', options: ['На сервере', 'При первом запросе', 'При каждом повторе', 'При нажатии кнопки'], correct: 3, why: 'Тогда все повторы несут один и тот же ключ.' },
        { q: 'Зачем `width` и `height` у изображений поста?', options: ['Для поисковиков', 'Для выбора `srcset`', 'Чтобы не было сдвигов', 'Для лучшего сжатия'], correct: 2, why: 'Место резервируется до загрузки: нет сдвигов (CLS).' },
      ],
      en: [
        { q: 'Why a cursor rather than an offset for a feed?', options: ['A cursor is simpler', 'New posts cause no dupes', 'Offsets are slower', 'REST requires it'], correct: 1, why: 'Inserts at the top shift an offset, but not a cursor.' },
        { q: 'How does the server know whose feed to return?', options: ['From the session', 'From a `userId` param', 'From the `Referer` header', 'From `localStorage`'], correct: 0, why: 'A parameter would let anyone request someone else\'s feed.' },
        { q: 'When is a post\'s idempotency key created?', options: ['On the server', 'On the first request', 'On each retry', 'On the button press'], correct: 3, why: 'Then every retry carries the same key.' },
        { q: 'Why `width` and `height` on post images?', options: ['For search engines', 'For picking `srcset`', 'To avoid layout shifts', 'For better compression'], correct: 2, why: 'Space is reserved before loading: no shifts (CLS).' },
      ],
    },
    sources: [
      gfe('News Feed (e.g. Facebook)', 'questions/system-design/news-feed-facebook'),
      apg('Feed Pattern', 'feed'),
      mdn('Intersection Observer API', 'Web/API/Intersection_Observer_API'),
      src('web.dev: Optimize Cumulative Layout Shift', 'https://web.dev/articles/optimize-cls'),
      mdn('Intl.RelativeTimeFormat', 'Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat'),
    ],
    verified,
  },
  {
    id: 'sd-autocomplete',
    track: 'system-design',
    emoji: '🔎',
    minutes: 14,
    title: { ru: 'Разбор: автодополнение', en: 'Walkthrough: autocomplete' },
    summary: {
      ru: 'Задача на компонент: части и контроллер, API с источником данных и функцией отрисовки, гонки ответов, кэш с TTL и LRU, состояния, клавиатура, IME и ARIA combobox.',
      en: 'A component task: parts and the controller, an API with a data source and a render function, response races, a cache with TTL and LRU, states, keyboard, IME and ARIA combobox.',
    },
    quiz: {
      ru: [
        { q: 'Ответ на «l» пришёл после ответа на «li». Что показать?', options: ['Ответ для текущего ввода', 'Последний пришедший', 'Оба списка вместе', 'Ничего не показывать'], correct: 0, why: 'Порядок ответов не равен порядку запросов.' },
        { q: 'Что даёт `AbortController` в автодополнении?', options: ['Защиту от гонок', 'Кэширование', 'Экономию сети', 'Подсветку'], correct: 2, why: 'Отмена может опоздать, корректность обеспечивает ключ запроса.' },
        { q: 'Где фокус, пока пользователь ходит стрелками по списку?', options: ['На активном пункте', 'На самом списке', 'На кнопке поиска', 'В поле ввода'], correct: 3, why: 'Активный пункт указывает `aria-activedescendant`.' },
        { q: 'Как долго кэшировать подсказки с ценами акций?', options: ['Целые сутки', 'Лучше не кэшировать', 'До перезагрузки', 'Всегда, навсегда'], correct: 1, why: 'Цены меняются каждую минуту.' },
      ],
      en: [
        { q: 'The answer for "l" came after the one for "li". What to show?', options: ['The current input\'s result', 'The last one to arrive', 'Both lists together', 'Show nothing at all'], correct: 0, why: 'Response order is not request order.' },
        { q: 'What does `AbortController` give an autocomplete?', options: ['Race protection', 'Caching', 'Network savings', 'Highlighting'], correct: 2, why: 'Cancellation can be late; the query key ensures correctness.' },
        { q: 'Where is focus while the user arrows through the list?', options: ['On the active item', 'On the list itself', 'On the search button', 'In the input field'], correct: 3, why: 'The active item is pointed to by `aria-activedescendant`.' },
        { q: 'How long to cache suggestions showing stock prices?', options: ['A whole day', 'Better not at all', 'Until a reload', 'Forever, always'], correct: 1, why: 'Prices change every minute.' },
      ],
    },
    sources: [
      gfe('Autocomplete', 'questions/system-design/autocomplete'),
      apg('Combobox Pattern', 'combobox'),
      mdn('AbortController', 'Web/API/AbortController'),
      mdn('compositionend event', 'Web/API/Element/compositionend_event'),
    ],
    verified,
  },
  {
    id: 'sd-app-cases',
    track: 'system-design',
    emoji: '🗺️',
    minutes: 14,
    title: { ru: 'Типовые приложения', en: 'Typical applications' },
    summary: {
      ru: 'Чат, магазин, фото и Pinterest, видео и ТВ, совместный редактор, графический редактор: что уточнить, сущности и API, главная тема каждого.',
      en: 'Chat, a shop, photos and Pinterest, video and TV, a collaborative editor, a drawing tool: what to clarify, entities and API, the key topic of each.',
    },
    quiz: {
      ru: [
        { q: 'По чему сортировать сообщения в чате?', options: ['По часам устройства', 'По времени получения', 'По серверному `seq`', 'По `clientId`'], correct: 2, why: 'Часы устройств расходятся, а сервер даёт единый порядок.' },
        { q: 'Как рендерить каталог магазина?', options: ['SSR или статически', 'Только CSR', 'Только в iframe', 'Через WebSocket'], correct: 0, why: 'Каталог индексируют, и он должен быстро открываться из поиска.' },
        { q: 'Зачем API фото отдаёт ширину и высоту?', options: ['Для поисковиков', 'Для сжатия файла', 'Для подписи к фото', 'Раскладка до загрузки'], correct: 3, why: 'Колонки не прыгают, пока грузятся картинки.' },
        { q: 'Чем CRDT отличается от OT?', options: ['Работает только онлайн', 'Копии сходятся без сервера', 'Нужен один сервер', 'Только для текста'], correct: 1, why: 'Поэтому CRDT подходят для офлайна.' },
      ],
      en: [
        { q: 'What do you sort chat messages by?', options: ['The device clock', 'Receive time', 'The server `seq`', 'The `clientId`'], correct: 2, why: 'Device clocks drift, and the server gives a single order.' },
        { q: 'How do you render a shop catalog?', options: ['SSR or statically', 'CSR only', 'Only in an iframe', 'Through a WebSocket'], correct: 0, why: 'The catalog is indexed and must open fast from search.' },
        { q: 'Why does a photo API return width and height?', options: ['For search engines', 'For compression', 'For the caption', 'Layout before loading'], correct: 3, why: 'Columns do not jump while images load.' },
        { q: 'How do CRDTs differ from OT?', options: ['They work online only', 'Copies merge with no server', 'They need one server', 'They handle text only'], correct: 1, why: 'That is why CRDTs suit offline work.' },
      ],
    },
    sources: [
      playbook('Types of Front End System Design Questions', 'types-of-questions'),
      src('Google Search Central: Product structured data', 'https://developers.google.com/search/docs/appearance/structured-data/product'),
      mdn('Media Source API', 'Web/API/Media_Source_Extensions_API'),
      mdn('WebVTT', 'Web/API/WebVTT_API'),
      mdn('Canvas API', 'Web/API/Canvas_API'),
      mdn('WebSocket API', 'Web/API/WebSockets_API'),
    ],
    verified,
  },
  {
    id: 'sd-optimizations',
    track: 'system-design',
    emoji: '🚀',
    minutes: 13,
    title: { ru: 'Глубокий разбор: что обсуждать', en: 'Deep dive: what to discuss' },
    summary: {
      ru: 'Как выбрать темы по продукту; сеть, ресурсы, работа и отрисовка, воспринимаемая скорость, сбои и офлайн с outbox, доступность по WCAG 2.2, языки и безопасность.',
      en: 'How to pick topics by product; network, resources, runtime and rendering, perceived speed, failures and offline with an outbox, accessibility by WCAG 2.2, languages and security.',
    },
    quiz: {
      ru: [
        { q: 'Ответ на создание поста потерялся, клиент повторил. Что спасёт от дубля?', options: ['Ключ идемпотентности', 'Повтор через минуту', 'Отмена запроса', 'Метод PUT'], correct: 0, why: 'Сервер узнаёт повтор по ключу и возвращает прежний результат.' },
        { q: 'Зачем случайный разброс (jitter) в повторах?', options: ['Чтобы шифровать данные', 'Чтобы повторить быстрее', 'Чтобы реже писать в лог', 'Чтобы клиенты не били разом'], correct: 3, why: 'Иначе тысячи клиентов повторят в одну и ту же секунду.' },
        { q: 'Какой размер цели касания требует WCAG 2.2 на уровне AA?', options: ['44×44', '48×48', '24×24', '16×16'], correct: 2, why: '44×44 это уровень AAA.' },
        { q: 'Зачем `rem` для шрифтов?', options: ['Иначе не работает зум', 'Учесть шрифт из настроек', 'Для тёмной темы сайта', 'Для языков справа налево'], correct: 1, why: 'Масштаб страницы увеличивает и пиксели.' },
      ],
      en: [
        { q: 'A post-creation response was lost and the client retried. What prevents a duplicate?', options: ['An idempotency key', 'Retrying a minute later', 'Cancelling the request', 'The PUT method'], correct: 0, why: 'The server recognizes the retry by the key and returns the earlier result.' },
        { q: 'Why random spread (jitter) in retries?', options: ['To encrypt the data', 'To retry sooner', 'To log less often', 'So clients spread out'], correct: 3, why: 'Otherwise thousands of clients retry in the same second.' },
        { q: 'Which touch target size does WCAG 2.2 require at level AA?', options: ['44×44', '48×48', '24×24', '16×16'], correct: 2, why: '44×44 is level AAA.' },
        { q: 'Why `rem` for font sizes?', options: ['Zoom fails otherwise', 'Respect the user\'s font size', 'For a dark site theme', 'For right-to-left text'], correct: 1, why: 'Page zoom enlarges pixels too.' },
      ],
    },
    sources: [
      playbook('The RADIO Framework: Optimizations', 'framework'),
      spec('WCAG 2.2: Target Size (Minimum)', 'https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html'),
      spec('WCAG 2.2: Resize Text', 'https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html'),
      spec('WCAG 2.2: Contrast (Minimum)', 'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html'),
      src('IETF draft: The Idempotency-Key HTTP Header Field', 'https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/'),
      src('web.dev: Learn Performance', 'https://web.dev/learn/performance'),
    ],
    verified,
  },
  {
    id: 'sd-interview',
    track: 'system-design',
    emoji: '🎤',
    minutes: 12,
    title: { ru: 'Раунд на 60 минут', en: 'The 60-minute round' },
    summary: {
      ru: 'План часа по заметкам, 8–12 уточняющих вопросов, разбор макета тремя линзами, граничные случаи, как держаться, шпаргалка оценки и пять тренировочных задач.',
      en: 'An hour plan from the notes, 8–12 clarifying questions, a mockup review through three lenses, edge cases, how to carry yourself, an evaluation cheatsheet and five practice tasks.',
    },
    quiz: {
      ru: [
        { q: 'С чего начинают раунд?', options: ['С рисования архитектуры', 'С выбора стора', 'С уточняющих вопросов', 'С написания кода'], correct: 2, why: 'Задача нарочно размыта; ответы записывают на доску.' },
        { q: 'Какая линза разбора макета ищет длинные названия и пустые данные?', options: ['Пользователь', 'Инженер', 'Платформа', 'Бизнес'], correct: 1, why: 'Она проверяет, что сломается на реальных данных.' },
        { q: 'Верно ли «правило трёх кликов»?', options: ['Да, это стандарт', 'Да, для мобильных', 'Только для ТВ', 'Нет, важна ясность пути'], correct: 3, why: 'Исследования его не подтверждают.' },
        { q: 'Что сказать в конце раунда?', options: ['Итог и компромиссы', 'Ничего', 'Список технологий', 'Извиниться за время'], correct: 0, why: 'Решение, главные компромиссы и следующие шаги.' },
      ],
      en: [
        { q: 'How does the round start?', options: ['With the architecture', 'With picking a store', 'With clarifying questions', 'With writing code'], correct: 2, why: 'The task is vague on purpose; answers go on the board.' },
        { q: 'Which mockup lens looks for long titles and missing data?', options: ['User', 'Engineer', 'Platform', 'Business'], correct: 1, why: 'It checks what breaks with real data.' },
        { q: 'Is the "three-click rule" true?', options: ['Yes, it is a standard', 'Yes, for mobile apps', 'Only for TV interfaces', 'No, path clarity matters'], correct: 3, why: 'Research does not support it.' },
        { q: 'What to say at the end of the round?', options: ['A summary and tradeoffs', 'Nothing', 'A list of technologies', 'Apologize for time'], correct: 0, why: 'The solution, the main tradeoffs and next steps.' },
      ],
    },
    sources: [
      playbook('Evaluation Criteria', 'evaluation-axes'),
      playbook('Cheatsheet', 'cheatsheet'),
      { title: 'NN/g: The 3-Click Rule for Navigation Is False', url: 'https://www.nngroup.com/articles/3-click-rule/', kind: 'article' },
      apg('Dialog (Modal) Pattern', 'dialog-modal'),
      src('web.dev: Rendering on the Web', 'https://web.dev/articles/rendering-on-the-web'),
    ],
    verified,
  },
]

export const systemDesignModule: Module = {
  track: 'system-design',
  lessons: systemDesignLessons.map((l) => l.id),
  exam: {
    pass: 0.75,
    questions: {
      ru: [
        { q: 'Чем frontend system design отличается от backend?', options: ['Нужна оценка нагрузки', 'Фокус на клиенте и API', 'Нужна схема базы данных', 'Нужно шардирование'], correct: 1, why: 'Сервер это чёрный ящик, главное клиент и контракт с ним.' },
        { q: 'Вам дали «спроектируйте Facebook». Первый шаг?', options: ['Уточнить сценарии', 'Нарисовать сервисы', 'Выбрать фреймворк', 'Описать базу'], correct: 0, why: 'Сначала сузить задачу: лента, подгрузка, создание поста.' },
        { q: 'Сколько времени примерно дают оптимизациям в RADIO?', options: ['10 %', '20 %', '30 %', '40 %'], correct: 3, why: 'Это самая глубокая и самая оцениваемая часть.' },
        { q: 'Что хранит стор, а что компонент?', options: ['Всё хранит стор', 'Всё хранит компонент', 'Общее в сторе, своё внизу', 'Всё хранится в URL'], correct: 2, why: 'Состояние держат как можно ниже в дереве.' },
        { q: 'Лента во вложенной форме, автор сменил имя. Что не так?', options: ['Обновится одна копия', 'Сломается курсор', 'Удвоятся посты', 'Всё в порядке'], correct: 0, why: 'Автор повторяется в каждом посте; нормализация решает это.' },
        { q: 'Почему для ленты вошедшего пользователя CSR по умолчанию?', options: ['Это лучше для SEO', 'Персонально, долгая сессия', 'Быстрее первый показ', 'Так требует React'], correct: 1, why: 'SEO не нужно, состояние живёт в браузере; SSR для публичных страниц.' },
        { q: 'Когда пагинация по смещению уместна?', options: ['Лента новостей', 'Сообщения в чате', 'Живые комментарии', 'Поиск со страницами'], correct: 3, why: 'Статичный список с номерами страниц.' },
        { q: 'Чем подгружать ленту при прокрутке?', options: ['`setInterval`', '`IntersectionObserver`', 'Обработчик `resize`', '`requestIdleCallback`'], correct: 1, why: 'Браузер сам отслеживает пересечение, без опроса раскладки.' },
        { q: 'Какая роль у контейнера ленты по ARIA APG?', options: ['`list`', '`grid`', '`feed`', '`log`'], correct: 2, why: 'Посты внутри это `article` с `aria-posinset`.' },
        { q: 'Как настраивать отрисовку результатов в общем компоненте?', options: ['Только через CSS', 'Тема, классы, функция', 'Сделать форк компонента', 'Никак нельзя'], correct: 1, why: 'От простого к гибкому; функция для особых случаев.' },
        { q: 'Что объявляет «Ничего не найдено» в автодополнении?', options: ['Отдельный `role="status"`', 'Сам элемент `listbox`', 'Вызов `alert()`', 'Заголовок страницы'], correct: 0, why: 'Список не делают живым регионом.' },
        { q: 'Как чат догружает пропущенное после переподключения?', options: ['Перезагрузкой страницы', 'По `clientId`', 'По времени устройства', 'По последнему `seq`'], correct: 3, why: 'Сервер отдаёт всё после последнего полученного номера.' },
        { q: 'Что обязательно у каждого компонента с данными?', options: ['Плавная анимация', 'Загрузка, ошибка, пусто', 'Тёмная тема сайта', 'Вкладки и меню'], correct: 1, why: 'Три обязательных состояния плюс успех.' },
        { q: 'Что засчитывает интервьюер?', options: ['Только написанный код', 'Количество технологий', 'Сказанное и нарисованное', 'Скорость ответов'], correct: 2, why: 'Молчаливые рассуждения не оцениваются.' },
      ],
      en: [
        { q: 'How does front end system design differ from back end?', options: ['Capacity estimation', 'Focus on client and API', 'A database schema', 'Sharding the data'], correct: 1, why: 'The server is a black box; the client and its contract matter.' },
        { q: 'You are asked to "design Facebook". The first step?', options: ['Clarify use cases', 'Draw services', 'Pick a framework', 'Describe the database'], correct: 0, why: 'Narrow the task first: the feed, loading more, creating a post.' },
        { q: 'Roughly how much time goes to optimizations in RADIO?', options: ['10%', '20%', '30%', '40%'], correct: 3, why: 'It is the deepest and most evaluated part.' },
        { q: 'What does the store keep, and what a component?', options: ['The store keeps everything', 'Components keep everything', 'Shared in store, local below', 'Everything in the URL'], correct: 2, why: 'State is kept as low in the tree as possible.' },
        { q: 'A nested feed, and an author renamed. What goes wrong?', options: ['One copy gets updated', 'The cursor breaks', 'Posts get doubled', 'Nothing at all'], correct: 0, why: 'The author repeats in every post; normalization solves it.' },
        { q: 'Why CSR by default for a signed-in feed?', options: ['Better for SEO', 'Personal, long session', 'Faster first render', 'React requires it'], correct: 1, why: 'No SEO is needed and state lives in the browser; SSR for public pages.' },
        { q: 'When is offset pagination appropriate?', options: ['A news feed', 'Chat messages', 'Live comments', 'Paged search results'], correct: 3, why: 'A static list with page numbers.' },
        { q: 'What loads more feed items on scroll?', options: ['`setInterval`', '`IntersectionObserver`', 'A `resize` handler', '`requestIdleCallback`'], correct: 1, why: 'The browser tracks intersection itself, without polling layout.' },
        { q: 'Which role does the feed container get in ARIA APG?', options: ['`list`', '`grid`', '`feed`', '`log`'], correct: 2, why: 'Posts inside are `article` elements with `aria-posinset`.' },
        { q: 'How to customize result rendering in a shared component?', options: ['Only through CSS', 'Theme, classes, function', 'Fork the component', 'It is not possible'], correct: 1, why: 'From simple to flexible; the function for special cases.' },
        { q: 'What announces "Nothing found" in an autocomplete?', options: ['A `role="status"` element', 'The `listbox` itself', 'A call to `alert()`', 'The document title'], correct: 0, why: 'The list is not made a live region.' },
        { q: 'How does a chat catch up after reconnecting?', options: ['By reloading the page', 'By `clientId`', 'By device time', 'By the last `seq`'], correct: 3, why: 'The server returns everything after the last received number.' },
        { q: 'What must every data component have?', options: ['A smooth animation', 'Loading, error, empty', 'A dark theme', 'Tabs and menus'], correct: 1, why: 'Three mandatory states plus success.' },
        { q: 'What does the interviewer count?', options: ['Only code', 'Number of technologies', 'What is said and drawn', 'Answer speed'], correct: 2, why: 'Silent reasoning is not evaluated.' },
      ],
    },
  },
}
