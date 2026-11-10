import type { Source } from '../sources'
import type { Lesson, Module } from './types'

const mdn = (title: string, path: string): Source => ({ title: `MDN: ${title}`, url: `https://developer.mozilla.org/en-US/docs/${path}`, kind: 'official' })
const spec = (title: string, url: string): Source => ({ title, url, kind: 'spec' })
const verified = { date: '2026-11', version: 'CSS Snapshot 2025, Tailwind CSS 4.3' }

export const cssLessons: Lesson[] = [
  {
    id: 'css-cascade',
    track: 'css',
    emoji: '🌊',
    minutes: 12,
    title: { ru: 'Каскад и специфичность', en: 'The cascade and specificity' },
    summary: {
      ru: 'Порядок каскада, специфичность как тройка чисел, :where и :is, !important, @layer, @scope, наследование.',
      en: 'The cascade order, specificity as a triple, :where and :is, !important, @layer, @scope, inheritance.',
    },
    quiz: {
      ru: [
        { q: 'Что сильнее: селектор из 11 классов или один `#id`?', options: ['11 классов: в сумме 110 больше, чем 100', 'Один `#id`: тройки сравнивают слева', 'Они равны, и решает порядок в файле', 'Зависит от количества тегов в селекторе'], correct: 1, why: 'Специфичность (A, B, C) не складывают: (1,0,0) больше (0,11,0).' },
        { q: 'Какая специфичность у `:where(#app .card) p`?', options: ['(1,1,1)', '(0,0,1)', '(1,0,1)', '(0,1,1)'], correct: 1, why: '`:where()` всегда даёт ноль, остаётся только тег `p`.' },
        { q: 'Правило `.btn` в позднем слое и `#app .btn` в раннем. Кто победит?', options: ['`#app .btn`, у него больше специфичность', '`.btn` из позднего слоя: слои важнее', 'То правило, что подключено последним файлом', 'Победит правило без пометки `!important`'], correct: 1, why: 'Каскадные слои сравниваются раньше специфичности.' },
        { q: 'Какое значение `display: initial`?', options: ['`block`', '`inline`', '`none`', 'Значение родителя'], correct: 1, why: '`initial` это начальное значение из спецификации, для `display` это `inline`, а не стиль браузера для тега.' },
      ],
      en: [
        { q: 'Which is stronger: a selector of 11 classes or one `#id`?', options: ['11 classes: their sum of 110 beats 100', 'One `#id`: triples compare left to right', 'They are equal, so source order decides', 'It depends on the number of tags used'], correct: 1, why: 'Specificity (A, B, C) is not added up: (1,0,0) beats (0,11,0).' },
        { q: 'What is the specificity of `:where(#app .card) p`?', options: ['(1,1,1)', '(0,0,1)', '(1,0,1)', '(0,1,1)'], correct: 1, why: '`:where()` always gives zero, leaving only the `p` tag.' },
        { q: 'A `.btn` rule in a later layer and `#app .btn` in an earlier one. Which wins?', options: ['`#app .btn`, its specificity is higher', '`.btn` from the later layer: layers come first', 'Whichever rule is in the file loaded last', 'The rule that has no `!important` flag'], correct: 1, why: 'Cascade layers are compared before specificity.' },
        { q: 'What is `display: initial`?', options: ['`block`', '`inline`', '`none`', "The parent's value"], correct: 1, why: '`initial` is the initial value from the spec, which for `display` is `inline`, not the browser style for the tag.' },
      ],
    },
    sources: [
      mdn('Introduction to the CSS cascade', 'Web/CSS/Guides/Cascade/Introduction'),
      mdn('Specificity', 'Web/CSS/Guides/Cascade/Specificity'),
      mdn('@layer', 'Web/CSS/Reference/At-rules/@layer'),
      mdn('@scope', 'Web/CSS/Reference/At-rules/@scope'),
      spec('W3C: CSS Cascading and Inheritance Level 5', 'https://www.w3.org/TR/css-cascade-5/'),
    ],
    verified,
  },
  {
    id: 'css-box-units',
    track: 'css',
    emoji: '📦',
    minutes: 10,
    title: { ru: 'Блочная модель и единицы', en: 'The box model and units' },
    summary: {
      ru: 'box-sizing, схлопывание отступов, логические свойства, rem и em, проценты, dvh и svh, cqi, clamp.',
      en: 'box-sizing, margin collapsing, logical properties, rem and em, percentages, dvh and svh, cqi, clamp.',
    },
    quiz: {
      ru: [
        { q: 'Какой ширины будет блок `width: 200px; padding: 20px; border: 2px` с `box-sizing: content-box`?', options: ['200px', '244px', '240px', '204px'], correct: 1, why: 'В `content-box` к ширине добавляются отступы и рамки с обеих сторон: 200 + 40 + 4.' },
        { q: 'От чего считается `padding-top: 10%`?', options: ['От высоты родителя', 'От ширины контейнера', 'От размера шрифта', 'От высоты окна'], correct: 1, why: 'Проценты у `padding` и `margin` считаются от ширины контейнера, даже вертикальные.' },
        { q: 'Почему на телефоне `height: 100vh` уходит под панель браузера?', options: ['`vh` не поддерживается мобильными браузерами', '`100vh` это высота окна без панели браузера', 'Мешает глобальный `box-sizing: border-box`', 'Нужен `overflow: hidden` на элементе `body`'], correct: 1, why: '`vh` берёт большое окно; видимую высоту дают `svh` или `dvh`.' },
        { q: 'Почему размеры шрифта лучше задавать в `rem`, а не `em`?', options: ['`rem` отрисовывается браузером быстрее', 'Вложенные `em` перемножаются, `rem` от корня', '`em` не уважает настройки шрифта браузера', '`rem` работает в медиазапросах, а `em` нет'], correct: 1, why: '`em` для `font-size` считается от родителя, и вложенность увеличивает шрифт; `rem` всегда от `<html>`.' },
      ],
      en: [
        { q: 'How wide is a block with `width: 200px; padding: 20px; border: 2px` and `box-sizing: content-box`?', options: ['200px', '244px', '240px', '204px'], correct: 1, why: 'In `content-box` padding and borders on both sides are added to the width: 200 + 40 + 4.' },
        { q: 'What is `padding-top: 10%` relative to?', options: ["The parent's height", "The container's width", "The element's font size", "The viewport's height"], correct: 1, why: 'Percentages for `padding` and `margin` are relative to the container width, even vertical ones.' },
        { q: 'Why does `height: 100vh` go under the browser toolbar on a phone?', options: ['`vh` is not supported by mobile browsers', '`100vh` is the height without the toolbar', 'A global `box-sizing: border-box` interferes', 'The `body` element needs `overflow: hidden`'], correct: 1, why: '`vh` uses the large viewport; `svh` or `dvh` give the visible height.' },
        { q: 'Why set font sizes in `rem` rather than `em`?', options: ['`rem` is rendered faster by the browser', 'Nested `em` values multiply; `rem` uses the root', '`em` ignores the browser font size setting', '`rem` works in media queries, `em` does not'], correct: 1, why: '`em` for `font-size` is relative to the parent, so nesting grows the text; `rem` is always relative to `<html>`.' },
      ],
    },
    sources: [
      mdn('The box model', 'Learn_web_development/Core/Styling_basics/Box_model'),
      mdn('Mastering margin collapsing', 'Web/CSS/Guides/Box_model/Margin_collapsing'),
      mdn('CSS values and units', 'Learn_web_development/Core/Styling_basics/Values_and_units'),
      mdn('CSS logical properties and values', 'Web/CSS/Guides/Logical_properties_and_values'),
      { title: 'web.dev: The large, small, and dynamic viewport units', url: 'https://web.dev/blog/viewport-units', kind: 'official' },
    ],
    verified,
  },
  {
    id: 'css-layout',
    track: 'css',
    emoji: '📐',
    minutes: 14,
    title: { ru: 'Flexbox, Grid и позиционирование', en: 'Flexbox, Grid and positioning' },
    summary: {
      ru: 'flex и его сокращения, min-width: 0, auto-fit и auto-fill, линии grid, subgrid, центрирование, absolute и sticky.',
      en: 'flex and its shorthands, min-width: 0, auto-fit and auto-fill, grid lines, subgrid, centering, absolute and sticky.',
    },
    quiz: {
      ru: [
        { q: 'Сколько колонок займёт элемент с `grid-column: 1 / 3`?', options: ['Три: с первой по третью', 'Две: это номера линий', 'Одну: только третью', 'Все колонки строки'], correct: 1, why: 'Элемент тянется от линии 1 до линии 3, то есть через две колонки.' },
        { q: 'Длинный текст во flex-элементе ломает строку и не сжимается. Что поможет?', options: ['`flex: none` на элементе', '`min-width: 0` на элементе', '`flex-wrap: nowrap` на контейнере', '`overflow: visible` на контейнере'], correct: 1, why: 'У flex-элемента `min-width: auto`, и он не сжимается меньше содержимого.' },
        { q: 'Чем `auto-fit` отличается от `auto-fill` при малом числе элементов?', options: ['Ничем, это два названия одного и того же', '`auto-fit` схлопывает пустые колонки', '`auto-fill` работает только с единицами `fr`', '`auto-fit` не поддерживает функцию `minmax`'], correct: 1, why: '`auto-fill` оставляет пустые дорожки, `auto-fit` их сворачивает.' },
        { q: 'Почему `position: fixed` модалка привязалась не к окну, а к блоку?', options: ['У блока есть `position: relative`', 'У предка есть `transform` или `filter`', 'У самой модалки не задан `z-index`', 'У элемента `body` есть `margin`'], correct: 1, why: 'Предок с `transform`, `filter` или `perspective` становится содержащим блоком и для `fixed`.' },
      ],
      en: [
        { q: 'How many columns does an item with `grid-column: 1 / 3` span?', options: ['Three: columns one to three', 'Two: these are line numbers', 'One: only the third column', 'Every column in the row'], correct: 1, why: 'The item spans from line 1 to line 3, that is, across two columns.' },
        { q: 'Long text in a flex item breaks the row and does not shrink. What helps?', options: ['`flex: none` on the item', '`min-width: 0` on the item', '`flex-wrap: nowrap` on the container', '`overflow: visible` on the container'], correct: 1, why: 'A flex item has `min-width: auto` and does not shrink below its content.' },
        { q: 'How does `auto-fit` differ from `auto-fill` with few items?', options: ['No difference, they are synonyms', '`auto-fit` collapses empty columns', '`auto-fill` only works with `fr` units', '`auto-fit` does not support `minmax`'], correct: 1, why: '`auto-fill` keeps empty tracks, `auto-fit` collapses them.' },
        { q: 'Why did a `position: fixed` modal attach to a block instead of the viewport?', options: ['The block has `position: relative`', 'An ancestor has a `transform` or `filter`', 'The modal itself has no `z-index` set', 'The `body` element has a `margin`'], correct: 1, why: 'An ancestor with `transform`, `filter` or `perspective` becomes the containing block even for `fixed`.' },
      ],
    },
    sources: [
      mdn('Basic concepts of flexbox', 'Web/CSS/Guides/Flexible_box_layout/Basic_concepts'),
      mdn('Basic concepts of grid layout', 'Web/CSS/Guides/Grid_layout/Basic_concepts'),
      mdn('Subgrid', 'Web/CSS/Guides/Grid_layout/Subgrid'),
      mdn('Layout and the containing block', 'Web/CSS/Guides/Display/Containing_block'),
      mdn('position', 'Web/CSS/Reference/Properties/position'),
    ],
    verified,
  },
  {
    id: 'css-stacking',
    track: 'css',
    emoji: '🗂️',
    minutes: 10,
    title: { ru: 'z-index и контексты наложения', en: 'z-index and stacking contexts' },
    summary: {
      ru: 'Почему z-index: 9999 не помогает, что создаёт контекст наложения, порядок слоёв, isolation и верхний слой.',
      en: 'Why z-index: 9999 does not help, what creates a stacking context, painting order, isolation and the top layer.',
    },
    quiz: {
      ru: [
        { q: 'Модалка с `z-index: 9999` внутри блока с `position: relative; z-index: 1` оказалась под шапкой с `z-index: 10`. Почему?', options: ['Слишком маленький `z-index` у модалки', 'Модалка сравнивается внутри контекста блока', 'Шапка всегда рисуется поверх содержимого', 'У модалки нет `position: absolute`'], correct: 1, why: 'Блок создаёт контекст наложения; всё внутри него находится на уровне 1, ниже шапки.' },
        { q: 'Работает ли `z-index` у flex-элемента без `position`?', options: ['Нет, нужен `position: relative`', 'Да, у flex- и grid-элементов работает', 'Только при `display: inline-flex`', 'Только если у элемента задан `order`'], correct: 1, why: 'Для flex- и grid-элементов `z-index` действует и при `position: static`.' },
        { q: 'Что из этого создаёт контекст наложения?', options: ['`display: block`', '`opacity: 0.99`', '`margin: auto`', '`color: red`'], correct: 1, why: '`opacity` меньше 1 создаёт контекст, как и `transform`, `filter`, `isolation: isolate`.' },
        { q: 'Как вывести модальное окно поверх всего, не подбирая `z-index`?', options: ['Поставить окну `z-index: 2147483647`', 'Открыть `<dialog>` через `showModal()`', 'Перенести все стили окна в `!important`', 'Добавить окну `position: sticky`'], correct: 1, why: 'Верхний слой рисуется поверх документа независимо от контекстов наложения.' },
      ],
      en: [
        { q: 'A modal with `z-index: 9999` inside a block with `position: relative; z-index: 1` ends up under a header with `z-index: 10`. Why?', options: ["The modal's `z-index` is too small", "It is compared inside the block's context", 'The header is always painted on top', 'The modal lacks `position: absolute`'], correct: 1, why: 'The block creates a stacking context; everything inside it sits at level 1, below the header.' },
        { q: 'Does `z-index` work on a flex item without `position`?', options: ['No, it needs `position: relative`', 'Yes, it works on flex and grid items', 'Only with `display: inline-flex`', 'Only if `order` is set'], correct: 1, why: 'For flex and grid items `z-index` applies even with `position: static`.' },
        { q: 'Which of these creates a stacking context?', options: ['`display: block`', '`opacity: 0.99`', '`margin: auto`', '`color: red`'], correct: 1, why: '`opacity` below 1 creates a context, as do `transform`, `filter` and `isolation: isolate`.' },
        { q: 'How do you show a modal above everything without picking a `z-index`?', options: ['Give it `z-index: 2147483647`', 'Open a `<dialog>` with `showModal()`', 'Move all its styles to `!important`', 'Give the window `position: sticky`'], correct: 1, why: 'The top layer is painted above the document regardless of stacking contexts.' },
      ],
    },
    sources: [
      mdn('Stacking context', 'Web/CSS/Guides/Positioned_layout/Stacking_context'),
      mdn('z-index', 'Web/CSS/Reference/Properties/z-index'),
      mdn('isolation', 'Web/CSS/Reference/Properties/isolation'),
      mdn('Top layer', 'Glossary/Top_layer'),
    ],
    verified,
  },
  {
    id: 'css-modern',
    track: 'css',
    emoji: '✨',
    minutes: 12,
    title: { ru: 'Современный CSS', en: 'Modern CSS' },
    summary: {
      ru: 'Переменные и @property, color-mix и oklch, color-scheme и light-dark, вложенность, :has(), container queries, медиазапросы.',
      en: 'Variables and @property, color-mix and oklch, color-scheme and light-dark, nesting, :has(), container queries, media queries.',
    },
    quiz: {
      ru: [
        { q: 'Что даёт регистрация переменной через `@property`?', options: ['Глобальную видимость переменной везде', 'Тип, начальное значение и анимацию', 'Доступ к переменной из JavaScript', 'Совместимость со старыми браузерами'], correct: 1, why: 'Типизированную переменную браузер интерполирует в анимации и отбрасывает неверные значения.' },
        { q: '`color-scheme` это что?', options: ['Медиа-функция вроде `prefers-color-scheme`', 'CSS-свойство о поддерживаемых схемах', 'Функция для смешивания двух цветов', 'Атрибут HTML для переключения тем'], correct: 1, why: 'Свойство сообщает браузеру поддерживаемые схемы; медиа-функция `prefers-color-scheme` сообщает настройку системы.' },
        { q: 'Что выберет `.card:has(> img)`?', options: ['Все картинки внутри карточек', 'Карточки с прямым ребёнком `img`', 'Карточки сразу после картинки', 'Все карточки и все картинки'], correct: 1, why: '`:has()` выбирает элемент по содержимому: это селектор родителя.' },
        { q: 'Какое значение `container-type` у элемента по умолчанию?', options: ['`inline-size`', '`normal`', '`size`', '`auto`'], correct: 1, why: 'Контейнером для запросов по размеру элемент становится только с `inline-size` или `size`.' },
      ],
      en: [
        { q: 'What does registering a variable with `@property` give?', options: ['Global visibility of the variable', 'A type, an initial value and animation', 'Access to the variable from JavaScript', 'Compatibility with old browsers'], correct: 1, why: 'The browser interpolates a typed variable in animations and discards invalid values.' },
        { q: 'What is `color-scheme`?', options: ['A media feature like `prefers-color-scheme`', 'A CSS property listing supported schemes', 'A function that mixes two colors', 'An HTML attribute for switching themes'], correct: 1, why: 'The property tells the browser the supported schemes; the `prefers-color-scheme` media feature reports the system setting.' },
        { q: 'What does `.card:has(> img)` select?', options: ['All images inside cards', 'Cards with a direct `img` child', 'Cards right after an image', 'All cards and all images'], correct: 1, why: '`:has()` selects an element by its content: it is the parent selector.' },
        { q: 'What is the default `container-type` of an element?', options: ['`inline-size`', '`normal`', '`size`', '`auto`'], correct: 1, why: 'An element becomes a size query container only with `inline-size` or `size`.' },
      ],
    },
    sources: [
      mdn('Using CSS custom properties', 'Web/CSS/Guides/Cascading_variables/Using_custom_properties'),
      mdn('@property', 'Web/CSS/Reference/At-rules/@property'),
      mdn('color-scheme', 'Web/CSS/Reference/Properties/color-scheme'),
      mdn('light-dark()', 'Web/CSS/Reference/Values/color_value/light-dark'),
      mdn(':has()', 'Web/CSS/Reference/Selectors/:has'),
      mdn('CSS container queries', 'Web/CSS/Guides/Containment/Container_queries'),
      mdn('Using CSS nesting', 'Web/CSS/Guides/Nesting/Using'),
    ],
    verified,
  },
  {
    id: 'css-architecture',
    track: 'css',
    emoji: '🏛️',
    minutes: 10,
    title: { ru: 'Архитектура стилей и Tailwind v4', en: 'Styling architecture and Tailwind v4' },
    summary: {
      ru: 'BEM, CSS Modules, CSS-in-JS и utility-first, Tailwind v4 против v3, дизайн-токены, что влияет на производительность CSS.',
      en: 'BEM, CSS Modules, CSS-in-JS and utility-first, Tailwind v4 versus v3, design tokens, what affects CSS performance.',
    },
    quiz: {
      ru: [
        { q: 'Как подключается Tailwind CSS v4?', options: ['Директивами `@tailwind base; @tailwind utilities;`', 'Одной строкой `@import "tailwindcss";`', 'Только через `tailwind.config.js`', 'Скриптом в `<head>` страницы'], correct: 1, why: 'Директивы `@tailwind` из v3 убраны; настройка делается в CSS через `@theme`.' },
        { q: 'Нужен ли PurgeCSS с Tailwind v4?', options: ['Да, иначе файл стилей будет огромным', 'Нет: генерируются только нужные классы', 'Только в продакшен-сборке проекта', 'Только для проектов на React'], correct: 1, why: 'Tailwind генерирует утилиты по найденным в исходниках классам, лишних в CSS нет.' },
        { q: 'Чем платят за CSS-in-JS в рантайме?', options: ['Ничем: стили и так нужно где-то писать', 'Работой в рантайме и проблемами с RSC', 'Потерей всех CSS-переменных проекта', 'Невозможностью использовать медиазапросы'], correct: 1, why: 'Стили генерируются во время работы; с React Server Components такие библиотеки работают плохо.' },
        { q: 'Что чаще всего ускоряет первую отрисовку со стороны CSS?', options: ['Замена глубоких селекторов на классы', 'Меньше CSS до первого экрана', 'Перевод всех размеров в пиксели `px`', 'Отказ от CSS-переменных в проекте'], correct: 1, why: 'CSS блокирует отрисовку; селекторы редко бывают узким местом.' },
      ],
      en: [
        { q: 'How is Tailwind CSS v4 set up?', options: ['With `@tailwind base; @tailwind utilities;`', 'With one line: `@import "tailwindcss";`', 'Only through `tailwind.config.js`', 'With a script in the page `<head>`'], correct: 1, why: 'The v3 `@tailwind` directives are gone; configuration happens in CSS via `@theme`.' },
        { q: 'Is PurgeCSS needed with Tailwind v4?', options: ['Yes, or the stylesheet gets huge', 'No: only used classes are generated', 'Only in production builds', 'Only in projects built with React'], correct: 1, why: 'Tailwind generates utilities from the classes it finds in sources; nothing unused ends up in the CSS.' },
        { q: 'What do you pay for runtime CSS-in-JS?', options: ['Nothing: styles have to live somewhere', 'Runtime work and trouble with RSC', 'Losing all CSS variables in the project', 'Being unable to use media queries'], correct: 1, why: 'Styles are generated at runtime; such libraries work poorly with React Server Components.' },
        { q: 'What most often speeds up the first paint on the CSS side?', options: ['Replacing deep selectors with classes', 'Less CSS needed for the first screen', 'Converting every size to `px` pixels', 'Dropping CSS variables everywhere'], correct: 1, why: 'CSS blocks rendering; selectors are rarely the bottleneck.' },
      ],
    },
    sources: [
      { title: 'Tailwind CSS: Upgrade guide (v3 → v4)', url: 'https://tailwindcss.com/docs/upgrade-guide', kind: 'official' },
      { title: 'Tailwind CSS: Theme variables', url: 'https://tailwindcss.com/docs/theme', kind: 'official' },
      { title: 'Tailwind CSS: Detecting classes in source files', url: 'https://tailwindcss.com/docs/detecting-classes-in-source-files', kind: 'official' },
      { title: 'React: useInsertionEffect (CSS-in-JS)', url: 'https://react.dev/reference/react/useInsertionEffect', kind: 'official' },
      { title: 'Chrome for Developers: Analyze CSS selector performance', url: 'https://developer.chrome.com/docs/devtools/performance/selector-stats', kind: 'official' },
    ],
    verified,
  },
]

export const cssModule: Module = {
  track: 'css',
  lessons: cssLessons.map((l) => l.id),
  exam: {
    pass: 0.75,
    questions: {
      ru: [
        { q: 'Какая специфичность у `#nav a:hover`?', options: ['(1,1,1)', '(1,0,2)', '(0,1,2)', '(1,1,0)'], correct: 0, why: 'Один id, один псевдокласс, один тег.' },
        { q: 'Что побеждает обычное объявление с селектором `#app #main .x`?', options: ['Ничто, у него максимальная специфичность', 'Объявление с `!important` даже на селекторе `p`', 'Любое правило из файла, подключённого позже', 'Правило из более раннего слоя'], correct: 1, why: '`!important` побеждает любые обычные объявления независимо от специфичности.' },
        { q: 'Вертикальные отступы 24px и 16px двух соседних абзацев. Какой промежуток?', options: ['40px', '24px', '16px', '20px'], correct: 1, why: 'Вертикальные `margin` в потоке схлопываются до большего.' },
        { q: 'Что значит `flex: 1`?', options: ['`0 0 auto`', '`1 1 0%`', '`1 0 auto`', '`0 1 auto`'], correct: 1, why: 'Растёт, сжимается и начинает с нулевой базы: равные доли.' },
        { q: '`position: sticky` не прилипает. Какая причина вероятнее всего?', options: ['Не задан `z-index`', 'У предка `overflow: hidden`', 'Элемент внутри flex-контейнера', 'У элемента есть `margin`'], correct: 1, why: 'Прилипание идёт относительно ближайшего прокручиваемого предка, и `overflow` у предка его меняет.' },
        { q: 'Что из этого не создаёт контекст наложения?', options: ['`transform: translateX(0)`', '`position: relative` без `z-index`', '`isolation: isolate` на блоке', '`will-change: opacity` на блоке'], correct: 1, why: '`relative` создаёт контекст только вместе с `z-index`, отличным от `auto`.' },
        { q: 'Как сделать карточку, которая меняет раскладку по ширине своего места, а не окна?', options: ['Медиазапрос `min-width` по окну', 'Container query на родителе-контейнере', 'Селектор `:has()` на карточке', 'Grid с `auto-fit` и `minmax`'], correct: 1, why: 'Контейнерный запрос спрашивает размер ближайшего контейнера.' },
        { q: 'Как в Tailwind v4 сделать утилиту важной?', options: ['`!bg-red-500` с `!` в начале', '`bg-red-500!` с `!` в конце', '`important:bg-red-500`', 'Только через `@apply`'], correct: 1, why: 'В v4 модификатор пишут в конце; старый вариант поддерживается, но устарел.' },
      ],
      en: [
        { q: 'What is the specificity of `#nav a:hover`?', options: ['(1,1,1)', '(1,0,2)', '(0,1,2)', '(1,1,0)'], correct: 0, why: 'One id, one pseudo-class, one tag.' },
        { q: 'What beats a normal declaration with the selector `#app #main .x`?', options: ['Nothing, its specificity is the highest', 'An `!important` declaration, even on `p`', 'Any rule from a file loaded later', 'A rule from an earlier layer'], correct: 1, why: '`!important` beats any normal declaration regardless of specificity.' },
        { q: 'Two adjacent paragraphs have vertical margins of 24px and 16px. What is the gap?', options: ['40px', '24px', '16px', '20px'], correct: 1, why: 'Vertical margins in flow collapse to the larger one.' },
        { q: 'What does `flex: 1` mean?', options: ['`0 0 auto`', '`1 1 0%`', '`1 0 auto`', '`0 1 auto`'], correct: 1, why: 'It grows, shrinks and starts from a zero basis: equal shares.' },
        { q: '`position: sticky` does not stick. What is the most likely cause?', options: ['No `z-index` is set', 'An ancestor has `overflow: hidden`', 'The element is inside a flex container', 'The element has a `margin`'], correct: 1, why: 'Sticking is relative to the nearest scrolling ancestor, and `overflow` on an ancestor changes it.' },
        { q: 'Which of these does not create a stacking context?', options: ['`transform: translateX(0)`', '`position: relative` without `z-index`', '`isolation: isolate` on a block', '`will-change: opacity` on a block'], correct: 1, why: '`relative` creates a context only together with a `z-index` other than `auto`.' },
        { q: 'How do you make a card change layout by the width of its place rather than the window?', options: ['A `min-width` media query on the window', 'A container query on the parent container', 'A `:has()` selector on the card', 'A grid with `auto-fit` and `minmax`'], correct: 1, why: 'A container query asks about the size of the nearest container.' },
        { q: 'How do you make a utility important in Tailwind v4?', options: ['`!bg-red-500`, with `!` at the start', '`bg-red-500!`, with `!` at the end', '`important:bg-red-500`', 'Only through `@apply`'], correct: 1, why: 'In v4 the modifier goes at the end; the old form still works but is deprecated.' },
      ],
    },
  },
}
