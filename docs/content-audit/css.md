# Аудит заметок: CSS

Источники: страница Notion «Styles» (около 34 тысяч знаков без картинок и списков ссылок) и её подстраница «TailwindCSS», обе прочитаны целиком. Разделы Styles: центрирование, блочная модель, `em` и `rem`, каскад и специфичность, позиционирование, псевдоклассы, единицы, `z-index` и контексты наложения, анимации, `will-change`, Flex и Grid, оптимизация, CSS-переменные, container queries, media queries, `prefers-reduced-motion` и `color-scheme`, data-атрибуты для стилей, `aspect-ratio`, `object-fit`, профилирование CSS. Разделы «Tokens» и ещё три раздела подстраницы Tailwind пустые.

Утверждения сверены с MDN, спецификациями CSS (Cascade 5, Selectors 4) и документацией Tailwind CSS v4.3. Поддержка браузерами взята из MDN Browser Compat Data. Специфичность в примерах считает `@bramus/specificity` (реализует алгоритм Selectors 4); пример выполняется в CI.

## Найденные ошибки

| Раздел | В заметках | На самом деле | Источник |
|---|---|---|---|
| Специфичность | «inline (1000) > ID (100) > класс (10) > тег (1)» как сумма | Специфичность это тройка (A, B, C), её сравнивают по разрядам: 11 классов проигрывают одному `id`; `style` вообще отдельный шаг каскада | [MDN: Specificity](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascade/Specificity), проверено калькулятором |
| Специфичность | `!important` «перебивает всё, кроме большей специфичности» | `!important` побеждает любые обычные объявления независимо от специфичности; специфичность решает только между двумя важными; у важных порядок слоёв обратный | [MDN: Cascade, !important](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascade/Introduction) |
| Каскад | Нет каскадных слоёв и `@scope` | `@layer` (во всех браузерах с 2022) сравнивается раньше специфичности; `@scope` есть во всех основных браузерах | [MDN: @layer](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@layer) |
| Позиционирование | `absolute` относительно ближайшего позиционированного предка «или `body`» | Если такого предка нет, от начального содержащего блока размером с окно; содержащим блоком становится и предок с `transform`, `filter`, `contain: paint` | [MDN: Containing block](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Display/Containing_block) |
| Позиционирование | `sticky` «затем как `fixed`» | Прилипает только в пределах родителя и относительно ближайшего прокручиваемого предка | [MDN: position](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/position) |
| Единицы | `em` «относительно размера шрифта родителя» | Для `font-size` от родителя, для остальных свойств от `font-size` самого элемента | [MDN: CSS values and units](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Values_and_units) |
| Единицы | `%` «процент от родительского свойства» | Зависит от свойства: `padding` и `margin`, даже вертикальные, считаются от ширины контейнера | там же |
| Единицы | Только `vh` для высоты окна | На мобильных `100vh` уходит под панель браузера; есть `svh`, `lvh`, `dvh` (во всех браузерах с 2022–2023) | [web.dev: Viewport units](https://web.dev/blog/viewport-units) |
| z-index | `z-index` работает «только на элементах с position» | Работает и у flex- и grid-элементов без `position` | [MDN: z-index](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/z-index) |
| z-index | Контекст наложения создаёт `contain: size` | Создают `contain: layout` и `paint` (и включающие их `strict`, `content`); `size` нет | [MDN: Stacking context](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Positioned_layout/Stacking_context) |
| z-index | `overflow: hidden` + `transform` «создаёт stacking context, и дети не выходят по z-оси» | Обрезку даёт `overflow`, а не контекст наложения; это разные механизмы | там же |
| z-index | `fixed` внутри `transform` становится «относительно ближайшего stacking context предка» | Относительно предка с `transform`, `filter` или `perspective` (содержащего блока); `opacity` создаёт контекст, но не содержащий блок | [MDN: Containing block](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Display/Containing_block) |
| z-index | `iframe`, `video`, `canvas` «часто создают отдельный stacking context» | По умолчанию не создают; это обычные заменяемые элементы | [MDN: Stacking context](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Positioned_layout/Stacking_context) |
| Grid | `grid-column: 1 / 3` «занимает столбцы от 1 до 3 включительно» | Значения это линии: элемент занимает две колонки | [MDN: Grid lines](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Line-based_placement) |
| Переменные | Антипаттерн «`--color-primary` вместо `--primary-color`, стандарт kebab-case» | Оба имени в kebab-case, стандарта на порядок слов нет | [MDN: Custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties) |
| Переменные | `@property` «всё ещё ограниченно» | Во всех основных браузерах (Firefox с 128, 2024) | [MDN: @property](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@property) |
| Container queries | `container-type: inline-size` «по умолчанию» | По умолчанию `normal`; контейнером элемент становится только явно | [MDN: container-type](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/container-type) |
| Media queries | Без viewport meta «мобильные игнорируют media queries» | Не игнорируют: запросы считаются от ширины виртуального окна около 980px | [MDN: Viewport meta](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Viewport_meta_element) |
| Media queries | Примеры `@media (max-width: 1024px) { width: 90%; }` | Объявления без селектора внутри `@media` недействительны (кроме вложенности внутри правила) | разбор кода |
| color-scheme | `color-scheme` назван медиа-функцией | Это CSS-свойство (и `<meta name="color-scheme">`); медиа-функция называется `prefers-color-scheme`. Есть ещё `light-dark()` | [MDN: color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/color-scheme) |
| Профилирование | «CSS занимает до 80% времени CRP», «`*` 120ms → 1ms», «box-shadow → drop-shadow 5s → 120ms», «утечка CSSOM 2GB» | Цифры без источника; `drop-shadow` тоже требует перерисовки | — |
| Профилирование | Selector Stats через Settings → Experiments; Layers через «Rendering → LayerViewer»; «Lighthouse CSS score» | Флажок «Enable CSS selector stats» в настройках панели Performance; панель Layers в More tools; отдельного CSS-балла в Lighthouse нет | [Chrome: Selector stats](https://developer.chrome.com/docs/devtools/performance/selector-stats) |
| Tailwind | `@tailwind base; @tailwind components; @tailwind utilities;` | В v4 `@import "tailwindcss";` | [Tailwind: Upgrade guide](https://tailwindcss.com/docs/upgrade-guide) |
| Tailwind | Настройка в `tailwind.config.js`, список `content` | В v4 токены в `@theme`, исходники находятся автоматически (`@source` для дополнительных путей); JS-конфиг только через `@config` | там же |
| Tailwind | «PurgeCSS удаляет неиспользованные классы в production» | Tailwind генерирует только использованные классы с v3 (JIT); PurgeCSS не нужен | [Tailwind: Detecting classes](https://tailwindcss.com/docs/detecting-classes-in-source-files) |
| Tailwind | В итоговом CSS остаётся `.btn { @apply … }` | `@apply` раскрывается в объявления при сборке | там же |
| Tailwind | `!` в начале класса (`.!bg-red-500`) | В v4 модификатор пишут в конце (`bg-red-500!`), старый вариант устарел | [Tailwind: Upgrade guide](https://tailwindcss.com/docs/upgrade-guide) |
| Tailwind | Таблица размеров CSS (10KB, 150KB, 500KB) и «много мелких селекторов замедляют Recalculate Styles» | Цифры без источника; селекторы утилит простые одноклассовые, их сопоставление дешёвое | — |

## Пробелы, закрытые в уроках

- Полный порядок каскада, `:where`, `:is`, `:not`, `:has` и их специфичность, `revert` и `revert-layer`.
- Схлопывание отступов, логические свойства, `ch`, `lh`, `cqi`, мобильные `svh` и `dvh`, `clamp` с `rem`.
- `flex` и его сокращения, `min-width: 0`, `auto-fit` против `auto-fill`, subgrid, ловушки `sticky`.
- Список создателей контекста наложения, порядок отрисовки, `isolation: isolate`, верхний слой вместо гонки `z-index`.
- `@property` с анимацией, `color-mix()`, `oklch()`, `light-dark()`, вложенность и её отличие от Sass, `:has()`, style queries, синтаксис диапазонов, `hover` и `pointer`.
- Сравнение подходов к стилям с их ценой, Tailwind v4 целиком, двухуровневые дизайн-токены, что на самом деле влияет на производительность CSS.
