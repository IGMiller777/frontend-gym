import type { Source } from '../sources'
import type { Lesson, Module } from './types'

const mdn = (title: string, path: string): Source => ({ title: `MDN: ${title}`, url: `https://developer.mozilla.org/en-US/docs/${path}`, kind: 'official' })
const webdev = (title: string, path: string): Source => ({ title: `web.dev: ${title}`, url: `https://web.dev/articles/${path}`, kind: 'official' })
const verified = { date: '2026-11', version: 'HTML and DOM Living Standards' }

export const browserLessons: Lesson[] = [
  {
    id: 'browser-rendering',
    track: 'browser',
    emoji: '🖼️',
    minutes: 12,
    title: { ru: 'От HTML до пикселей', en: 'From HTML to pixels' },
    summary: {
      ru: 'Критический путь рендеринга, что блокирует отрисовку, defer и async, preload scanner, актуальные метрики.',
      en: 'The critical rendering path, what blocks rendering, defer and async, the preload scanner, current metrics.',
    },
    quiz: {
      ru: [
        { q: 'Что делает стиль из `<link rel="stylesheet">` в `<head>`?', options: ['Останавливает разбор HTML, пока стиль не загрузится', 'Блокирует отрисовку и выполнение следующих скриптов', 'Ничего не блокирует: стили грузятся в фоне', 'Блокирует только загрузку картинок и шрифтов'], correct: 1, why: 'Браузер не рисует без стилей, а скрипт после стиля ждёт его, потому что может спросить вычисленные стили. Разбор HTML при этом продолжается.' },
        { q: 'Чем `defer` отличается от `async`?', options: ['`defer` выполняет по порядку после разбора HTML', '`async` выполняет по порядку после разбора HTML', 'Оба блокируют парсер, пока скрипт грузится', 'Разницы нет, это синонимы для браузера'], correct: 0, why: '`defer` выполняется после разбора в порядке подключения, `async` сразу по загрузке и без гарантии порядка.' },
        { q: 'Почему картинка, которой путь задали из JavaScript, грузится позже такой же картинки в HTML?', options: ['JavaScript понижает приоритет загрузки картинки', 'Preload scanner не видит ресурсы, созданные скриптом', 'Браузер не кэширует картинки, созданные кодом', 'Картинки из скрипта всегда грузятся лениво'], correct: 1, why: 'Сканер предзагрузки читает разметку вперёд и заранее запрашивает ресурсы. Ресурс из скрипта появится, только когда скрипт выполнится.' },
        { q: 'Какие метрики загрузки считаются актуальными?', options: ['FMP и TTI', 'LCP, CLS и INP', 'DOMContentLoaded и load', 'FID и First Paint'], correct: 1, why: 'FMP и TTI убраны из Lighthouse, FID заменён на INP. Core Web Vitals сейчас это LCP, CLS и INP.' },
      ],
      en: [
        { q: 'What does a stylesheet from `<link rel="stylesheet">` in `<head>` do?', options: ['Stops HTML parsing until it loads', 'Blocks rendering and the scripts that follow', 'Blocks nothing, it loads in the background', 'Blocks only image downloads'], correct: 1, why: 'The browser does not paint without styles, and a script after a stylesheet waits for it because it may read computed styles. HTML parsing continues.' },
        { q: 'How does `defer` differ from `async`?', options: ['`defer` runs in order after HTML is parsed', '`async` runs in order after HTML is parsed', 'Both block the parser while downloading', 'No difference, the browser treats them alike'], correct: 0, why: '`defer` runs after parsing in the order of inclusion, `async` as soon as it loads, with no order guarantee.' },
        { q: 'Why does an image whose URL is set from JavaScript load later than the same image in HTML?', options: ['JavaScript lowers the image loading priority', 'The preload scanner cannot see script-created resources', 'The browser does not cache images created by code', 'Images set from a script are always lazy-loaded'], correct: 1, why: 'The preload scanner reads ahead through the markup and requests resources early. A resource from a script appears only once the script runs.' },
        { q: 'Which loading metrics are current?', options: ['FMP and TTI', 'LCP, CLS and INP', 'DOMContentLoaded and load', 'FID and First Paint'], correct: 1, why: 'FMP and TTI were dropped from Lighthouse and FID was replaced by INP. Core Web Vitals today are LCP, CLS and INP.' },
      ],
    },
    sources: [
      webdev('Understand the critical path', 'critical-rendering-path'),
      webdev("Don't fight the browser preload scanner", 'preload-scanner'),
      mdn('<script>: async and defer', 'Web/HTML/Reference/Elements/script'),
      { title: 'web.dev: Web Vitals', url: 'https://web.dev/articles/vitals', kind: 'official' },
      { title: 'Chrome for Developers: Removing HTTP/2 Server Push', url: 'https://developer.chrome.com/blog/removing-push', kind: 'official' },
    ],
    verified,
  },
  {
    id: 'browser-dom',
    track: 'browser',
    emoji: '🌳',
    minutes: 12,
    title: { ru: 'DOM', en: 'The DOM' },
    summary: {
      ru: 'Узлы и элементы, живые и статические коллекции, фрагменты и template, innerHTML и XSS, атрибуты против свойств, размеры.',
      en: 'Nodes and elements, live and static collections, fragments and templates, innerHTML and XSS, attributes versus properties, sizes.',
    },
    quiz: {
      ru: [
        { q: 'Почему `ul.childNodes.length` больше, чем число `<li>`?', options: ['`childNodes` считает и вложенные элементы', '`childNodes` включает текстовые узлы с переносами', '`childNodes` считает атрибуты элементов', 'Это ошибка браузера, так быть не должно'], correct: 1, why: 'Переносы строк и пробелы между тегами становятся текстовыми узлами. `children` возвращает только элементы.' },
        { q: 'Какая коллекция обновится сама после удаления класса у элемента?', options: ['`document.querySelectorAll(".x")`', '`document.getElementsByClassName("x")`', '`Array.from(document.querySelectorAll(".x"))`', 'Никакая, коллекции всегда статичны'], correct: 1, why: '`getElementsByClassName` возвращает живую `HTMLCollection`. `querySelectorAll` даёт снимок на момент вызова.' },
        { q: 'Как безопасно вывести комментарий пользователя на страницу?', options: ['`el.innerHTML = comment`', '`el.textContent = comment`', '`el.outerHTML = comment`', '`el.insertAdjacentHTML("beforeend", comment)`'], correct: 1, why: '`textContent` вставляет текст, теги не разбираются. Остальные варианты разбирают строку как HTML, это XSS.' },
        { q: 'Пользователь ввёл текст в `<input value="a">`. Что вернёт `input.getAttribute("value")`?', options: ['Введённый текст: атрибут следит за полем', '`"a"`: атрибут хранит начальное значение', '`null`: после ввода атрибут удаляется', 'Пустую строку, пока форма не отправлена'], correct: 1, why: 'Атрибут `value` задаёт начальное значение, текущее хранится в свойстве `input.value`.' },
      ],
      en: [
        { q: 'Why is `ul.childNodes.length` larger than the number of `<li>`?', options: ['`childNodes` also counts nested elements', '`childNodes` includes text nodes with line breaks', '`childNodes` counts element attributes', 'It is a browser bug and should not happen'], correct: 1, why: 'Line breaks and spaces between tags become text nodes. `children` returns elements only.' },
        { q: 'Which collection updates by itself after a class is removed from an element?', options: ['`document.querySelectorAll(".x")`', '`document.getElementsByClassName("x")`', '`Array.from(document.querySelectorAll(".x"))`', 'None, collections are always static'], correct: 1, why: '`getElementsByClassName` returns a live `HTMLCollection`. `querySelectorAll` gives a snapshot taken at call time.' },
        { q: "How do you safely put a user's comment on the page?", options: ['`el.innerHTML = comment`', '`el.textContent = comment`', '`el.outerHTML = comment`', '`el.insertAdjacentHTML("beforeend", comment)`'], correct: 1, why: '`textContent` inserts text and tags are not parsed. The other options parse the string as HTML, which is XSS.' },
        { q: 'The user typed into `<input value="a">`. What does `input.getAttribute("value")` return?', options: ['The typed text: the attribute tracks the field', '`"a"`: the attribute keeps the initial value', '`null`: typing removes the attribute', 'An empty string until the form is submitted'], correct: 1, why: 'The `value` attribute sets the initial value; the current one lives in the `input.value` property.' },
      ],
    },
    sources: [
      mdn('Introduction to the DOM', 'Web/API/Document_Object_Model/Introduction'),
      mdn('NodeList: live vs static', 'Web/API/NodeList'),
      mdn('DocumentFragment', 'Web/API/DocumentFragment'),
      mdn('Element.innerHTML: security considerations', 'Web/API/Element/innerHTML'),
      mdn('Determining the dimensions of elements', 'Web/API/CSS_Object_Model/Determining_the_dimensions_of_elements'),
    ],
    verified,
  },
  {
    id: 'browser-events',
    track: 'browser',
    emoji: '🖱️',
    minutes: 14,
    title: { ru: 'События', en: 'Events' },
    summary: {
      ru: 'Погружение и всплытие, делегирование, preventDefault и stopPropagation, return false, passive, CustomEvent, Pointer Events.',
      en: 'Capture and bubbling, delegation, preventDefault and stopPropagation, return false, passive, CustomEvent, Pointer Events.',
    },
    quiz: {
      ru: [
        { q: 'В каком порядке сработают обработчики клика: на родителе с `capture: true`, на кнопке и на родителе без опций?', options: ['Кнопка, родитель capture, родитель', 'Родитель capture, кнопка, родитель', 'Родитель, кнопка, родитель capture', 'Родитель capture, родитель, кнопка'], correct: 1, why: 'Сначала погружение сверху вниз, затем цель, затем всплытие снизу вверх.' },
        { q: 'Что делает `stopImmediatePropagation()`, чего не делает `stopPropagation()`?', options: ['Отменяет действие браузера по умолчанию', 'Пропускает следующие обработчики на этом элементе', 'Снимает обработчик сразу после первого вызова', 'Останавливает только фазу погружения события'], correct: 1, why: 'Оба останавливают путь по дереву, но только `stopImmediatePropagation` пропускает оставшиеся обработчики на текущем элементе.' },
        { q: 'Что делает `return false` в обработчике `el.onclick`?', options: ['`preventDefault` и `stopPropagation` вместе', 'Только отменяет действие по умолчанию', 'Только останавливает всплытие события', 'Ничего, значение игнорируется браузером'], correct: 1, why: 'Для обработчиков-свойств `false` отменяет действие по умолчанию, всплытие продолжается. Оба действия сразу делает только jQuery.' },
        { q: 'Своё событие `new CustomEvent("save")` отправили на кнопке. Почему его не поймал обработчик на родителе?', options: ['Свои события нельзя ловить на родителе', 'По умолчанию свои события не всплывают', 'Нужно сначала вызвать `preventDefault`', 'Обработчик нужно вешать с `passive: true`'], correct: 1, why: 'У `CustomEvent` по умолчанию `bubbles: false`. Для всплытия нужен `bubbles: true`, для выхода из Shadow DOM ещё `composed: true`.' },
      ],
      en: [
        { q: 'In what order do click handlers run: on the parent with `capture: true`, on the button, and on the parent without options?', options: ['Button, parent capture, parent', 'Parent capture, button, parent', 'Parent, button, parent capture', 'Parent capture, parent, button'], correct: 1, why: 'First capture top-down, then the target, then bubbling bottom-up.' },
        { q: 'What does `stopImmediatePropagation()` do that `stopPropagation()` does not?', options: ['Cancels the browser default action', 'Skips the remaining handlers on this element', 'Removes the handler after the first call', 'Stops only the capture phase of the event'], correct: 1, why: 'Both stop the path through the tree, but only `stopImmediatePropagation` skips the remaining handlers on the current element.' },
        { q: 'What does `return false` do in an `el.onclick` handler?', options: ['`preventDefault` and `stopPropagation` together', 'Only cancels the default action', 'Only stops the event from bubbling', 'Nothing, the browser ignores the value'], correct: 1, why: 'For property handlers `false` cancels the default action, and bubbling continues. Only jQuery does both at once.' },
        { q: 'A custom `new CustomEvent("save")` was dispatched on a button. Why did the parent handler miss it?', options: ['Custom events cannot be caught on a parent', 'Custom events do not bubble by default', '`preventDefault` must be called first', 'The handler needs `passive: true`'], correct: 1, why: '`CustomEvent` has `bubbles: false` by default. Bubbling needs `bubbles: true`, leaving a Shadow DOM also needs `composed: true`.' },
      ],
    },
    sources: [
      mdn('Event bubbling', 'Learn_web_development/Core/Scripting/Event_bubbling'),
      mdn('EventTarget.addEventListener()', 'Web/API/EventTarget/addEventListener'),
      mdn('Event.stopImmediatePropagation()', 'Web/API/Event/stopImmediatePropagation'),
      mdn('Creating and dispatching events', 'Web/Events/Creating_and_triggering_events'),
      mdn('Pointer events', 'Web/API/Pointer_events'),
      { title: 'HTML Standard: Event handlers', url: 'https://html.spec.whatwg.org/multipage/webappapis.html#event-handler-attributes', kind: 'spec' },
    ],
    verified,
  },
  {
    id: 'browser-layout-paint',
    track: 'browser',
    emoji: '🎨',
    minutes: 10,
    title: { ru: 'Layout, paint и плавность', en: 'Layout, paint and smoothness' },
    summary: {
      ru: 'Что запускает layout и paint, принудительный layout и layout thrashing, анимации на transform, contain и content-visibility, сдвиги вёрстки.',
      en: 'What triggers layout and paint, forced layout and layout thrashing, animating transform, contain and content-visibility, layout shifts.',
    },
    quiz: {
      ru: [
        { q: 'Какое свойство лучше анимировать для движения элемента?', options: ['`left`', '`transform`', '`margin-left`', '`width`'], correct: 1, why: '`transform` не меняет геометрию соседей и может обойтись композицией без layout и paint.' },
        { q: 'Что делает код дорогим: `el.style.width = "100px"; console.log(el.offsetWidth)` в цикле?', options: ['Каждая запись стиля сразу пересчитывает layout', 'Чтение после записи заставляет считать layout синхронно', '`console.log` блокирует отрисовку каждого кадра', 'Ничего: браузер кэширует значения размеров'], correct: 1, why: 'Запись помечает layout устаревшим, а чтение геометрии требует пересчитать его немедленно. В цикле это layout thrashing.' },
        { q: 'Зачем ставят `width` и `height` у картинок?', options: ['Чтобы картинка загрузилась быстрее с сервера', 'Чтобы браузер зарезервировал место и не было сдвига', 'Чтобы картинка стала адаптивной на телефонах', 'Это нужно только для SEO и доступности'], correct: 1, why: 'Без размеров место появляется после загрузки, и контент под картинкой прыгает: это ухудшает CLS.' },
        { q: 'Что делает `content-visibility: auto`?', options: ['Скрывает элемент от скринридеров', 'Пропускает layout и paint блоков вне экрана', 'Включает ленивую загрузку картинок', 'Делает элемент прозрачным до прокрутки'], correct: 1, why: 'Браузер не рендерит содержимое, пока блок вне экрана. Размер-заглушку задают через `contain-intrinsic-size`.' },
      ],
      en: [
        { q: 'Which property is best to animate for moving an element?', options: ['`left`', '`transform`', '`margin-left`', '`width`'], correct: 1, why: '`transform` does not change neighbours\' geometry and may need only compositing, with no layout or paint.' },
        { q: 'What makes `el.style.width = "100px"; console.log(el.offsetWidth)` in a loop expensive?', options: ['Writing the style itself recomputes layout', 'Reading after writing forces a synchronous layout', '`console.log` blocks painting the frame', 'Nothing, the browser caches the values'], correct: 1, why: 'The write marks layout as stale, and reading geometry requires recomputing it right away. In a loop that is layout thrashing.' },
        { q: 'Why set `width` and `height` on images?', options: ['So the image downloads faster from the server', 'So the browser reserves space and nothing shifts', 'So the image becomes responsive on phones', 'It is needed only for SEO and accessibility'], correct: 1, why: 'Without dimensions the space appears only after loading, and the content below jumps: that hurts CLS.' },
        { q: 'What does `content-visibility: auto` do?', options: ['Hides the element from screen readers', 'Skips layout and paint of off-screen blocks', 'Turns on lazy loading for images', 'Keeps the element transparent until scrolled'], correct: 1, why: 'The browser does not render the content while the block is off screen. A placeholder size is set with `contain-intrinsic-size`.' },
      ],
    },
    sources: [
      webdev('Avoid large, complex layouts and layout thrashing', 'avoid-large-complex-layouts-and-layout-thrashing'),
      webdev('Stick to compositor-only properties', 'stick-to-compositor-only-properties-and-manage-layer-count'),
      webdev('content-visibility', 'content-visibility'),
      webdev('Optimize Cumulative Layout Shift', 'optimize-cls'),
      mdn('will-change', 'Web/CSS/Reference/Properties/will-change'),
    ],
    verified,
  },
  {
    id: 'browser-observers',
    track: 'browser',
    emoji: '🔭',
    minutes: 10,
    title: { ru: 'Observer API', en: 'Observer APIs' },
    summary: {
      ru: 'MutationObserver, IntersectionObserver, ResizeObserver и PerformanceObserver: когда какой, правильные опции и типичные ошибки.',
      en: 'MutationObserver, IntersectionObserver, ResizeObserver and PerformanceObserver: which one when, the right options and common mistakes.',
    },
    quiz: {
      ru: [
        { q: 'Когда вызывается колбэк `MutationObserver` после трёх изменений DOM подряд?', options: ['Синхронно, сразу после каждого изменения', 'Один раз, микрозадачей после синхронного кода', 'В следующем кадре перед отрисовкой страницы', 'Через `setTimeout` с нулевой задержкой'], correct: 1, why: 'Записи копятся, и колбэк вызывается одной микрозадачей, когда текущий синхронный код закончился.' },
        { q: 'Где указывают, какой бокс измеряет `ResizeObserver`?', options: ['В конструкторе `new ResizeObserver(cb, { box })`', 'Во втором аргументе `observe(el, { box })`', 'В CSS через свойство `box-sizing`', 'Нигде, всегда измеряется `border-box`'], correct: 1, why: 'Опция `box` относится к конкретному элементу и передаётся в `observe`.' },
        { q: 'Почему `observe({ entryTypes: ["largest-contentful-paint"], buffered: true })` не отдаёт ранние записи?', options: ['LCP нельзя наблюдать', '`buffered` работает только с опцией `type`', '`buffered` нужно передать в конструктор', 'Ранние записи хранит только `performance.now()`'], correct: 1, why: 'С `entryTypes` флаг `buffered` игнорируется. Нужно `observe({ type: "largest-contentful-paint", buffered: true })`.' },
        { q: 'Что выбрать для ленивой загрузки картинок ниже первого экрана?', options: ['`IntersectionObserver` с подменой `src`', 'Атрибут `loading="lazy"`', '`ResizeObserver` на контейнере', 'Обработчик `scroll` с `throttle`'], correct: 1, why: 'Браузер умеет это сам, без JavaScript. `IntersectionObserver` нужен для своих сценариев: ленты, аналитики, анимаций.' },
      ],
      en: [
        { q: 'When does a `MutationObserver` callback run after three DOM changes in a row?', options: ['Synchronously, right after each change', 'Once, as a microtask after the sync code', 'In the next frame before painting', 'Via a zero-delay `setTimeout` call'], correct: 1, why: 'Records accumulate, and the callback runs as one microtask once the current synchronous code is done.' },
        { q: 'Where do you specify which box `ResizeObserver` measures?', options: ['In the constructor `new ResizeObserver(cb, { box })`', 'In the second argument `observe(el, { box })`', 'In CSS through the `box-sizing` property', 'Nowhere, it always measures `border-box`'], correct: 1, why: 'The `box` option belongs to a specific element and is passed to `observe`.' },
        { q: 'Why does `observe({ entryTypes: ["largest-contentful-paint"], buffered: true })` miss early entries?', options: ['LCP cannot be observed', '`buffered` only works with the `type` option', '`buffered` must go to the constructor', 'Only `performance.now()` keeps early entries'], correct: 1, why: 'With `entryTypes` the `buffered` flag is ignored. Use `observe({ type: "largest-contentful-paint", buffered: true })`.' },
        { q: 'What should you use to lazy-load images below the first screen?', options: ['`IntersectionObserver` that swaps `src`', 'The `loading="lazy"` attribute', 'A `ResizeObserver` on the container', 'A throttled `scroll` handler'], correct: 1, why: 'The browser does it by itself, without JavaScript. `IntersectionObserver` is for your own cases: feeds, analytics, animations.' },
      ],
    },
    sources: [
      mdn('MutationObserver', 'Web/API/MutationObserver'),
      mdn('Intersection Observer API', 'Web/API/Intersection_Observer_API'),
      mdn('ResizeObserver.observe()', 'Web/API/ResizeObserver/observe'),
      mdn('PerformanceObserver.observe()', 'Web/API/PerformanceObserver/observe'),
      webdev('Browser-level image lazy loading', 'browser-level-image-lazy-loading'),
    ],
    verified,
  },
  {
    id: 'browser-components',
    track: 'browser',
    emoji: '🧩',
    minutes: 12,
    title: { ru: 'Web Components и Shadow DOM', en: 'Web Components and Shadow DOM' },
    summary: {
      ru: 'Custom Elements, теневое дерево и слоты, open и closed, стили и события через границу, Declarative Shadow DOM.',
      en: 'Custom Elements, the shadow tree and slots, open and closed, styles and events across the boundary, Declarative Shadow DOM.',
    },
    quiz: {
      ru: [
        { q: 'Что вернёт `el.shadowRoot` для корня с `mode: "closed"`?', options: ['Сам теневой корень, как и в режиме `open`', '`null`; автор хранит ссылку из `attachShadow`', 'Ошибку доступа `SecurityError` при чтении', 'Пустой `DocumentFragment` вместо корня'], correct: 1, why: 'Закрытый корень не виден через `shadowRoot`, но `attachShadow` его возвращает, и автор сохраняет ссылку.' },
        { q: 'Какие стили страницы попадают внутрь теневого дерева?', options: ['Никакие: граница изолирует всё', 'Наследуемые свойства и CSS-переменные', 'Все стили, заданные через классы', 'Только стили с пометкой `!important`'], correct: 1, why: 'Селекторы страницы внутрь не проходят, но наследование от хоста и custom properties работают.' },
        { q: 'Клик по кнопке внутри Shadow DOM поймали на `document`. Чему равен `event.target`?', options: ['Кнопке внутри теневого дерева', 'Хост-элементу компонента', 'Самому объекту `document`', '`null`, цель скрыта полностью'], correct: 1, why: 'При выходе из теневого дерева событие перенацеливается на хост, внутренности не раскрываются.' },
        { q: 'Как отдать теневое дерево с сервера без JavaScript?', options: ['Через `<slot>` внутри элемента', 'Через `<template shadowrootmode="open">`', 'Через атрибут `shadow="open"` у хоста', 'Никак, нужен вызов `attachShadow`'], correct: 1, why: 'Declarative Shadow DOM превращает такой `template` в теневой корень при разборе HTML.' },
      ],
      en: [
        { q: 'What does `el.shadowRoot` return for a root with `mode: "closed"`?', options: ['The shadow root itself, same as in `open` mode', '`null`; the author keeps the `attachShadow` result', 'A `SecurityError` thrown on access', 'An empty `DocumentFragment` instead of the root'], correct: 1, why: 'A closed root is not exposed through `shadowRoot`, but `attachShadow` returns it and the author keeps the reference.' },
        { q: 'Which page styles reach inside a shadow tree?', options: ['None: the boundary isolates everything', 'Inherited properties and CSS variables', 'All styles set through classes', 'Only styles marked `!important`'], correct: 1, why: 'Page selectors do not reach inside, but inheritance from the host and custom properties work.' },
        { q: 'A click on a button inside a Shadow DOM is caught on `document`. What is `event.target`?', options: ['The button inside the shadow tree', "The component's host element", 'The `document` object itself', '`null`, the target is fully hidden'], correct: 1, why: 'When it leaves the shadow tree, the event is retargeted to the host and the internals stay hidden.' },
        { q: 'How do you send a shadow tree from the server without JavaScript?', options: ['With a `<slot>` inside the element', 'With `<template shadowrootmode="open">`', 'With a `shadow="open"` attribute', 'You cannot, `attachShadow` is required'], correct: 1, why: 'Declarative Shadow DOM turns such a `template` into a shadow root while HTML is parsed.' },
      ],
    },
    sources: [
      mdn('Using custom elements', 'Web/API/Web_components/Using_custom_elements'),
      mdn('Using shadow DOM', 'Web/API/Web_components/Using_shadow_DOM'),
      mdn('Element.attachShadow()', 'Web/API/Element/attachShadow'),
      mdn('Event.composed', 'Web/API/Event/composed'),
      { title: 'web.dev: Declarative Shadow DOM', url: 'https://web.dev/articles/declarative-shadow-dom', kind: 'official' },
    ],
    verified,
  },
]

export const browserModule: Module = {
  track: 'browser',
  lessons: browserLessons.map((l) => l.id),
  exam: {
    pass: 0.75,
    questions: {
      ru: [
        { q: 'Что попадает в render tree?', options: ['Элементы с `display: none`', 'Элементы с `visibility: hidden`', 'Содержимое тега `<head>`', 'Комментарии из разметки'], correct: 1, why: 'Невидимый через `visibility` элемент занимает место и остаётся в дереве, `display: none` и `<head>` туда не попадают.' },
        { q: 'Какой скрипт выполнится сразу по загрузке, прервав разбор HTML?', options: ['`<script defer>`', '`<script async>`', '`<script type="module">`', '`<script type="importmap">`'], correct: 1, why: '`async` выполняется, как только загрузился, без гарантии порядка. `defer` и модули ждут конца разбора.' },
        { q: 'Обработчик на `<ul>` ловит клики по любой кнопке внутри. Как это называется?', options: ['Погружение', 'Делегирование событий', 'Перенацеливание', 'Пассивный обработчик'], correct: 1, why: 'Один обработчик на контейнере и проверка `event.target.closest(...)`: это делегирование.' },
        { q: 'Чем опасна запись пользовательской строки в `innerHTML`?', options: ['Запись работает медленнее `textContent`', 'Строка разберётся как HTML и сможет выполнить код', 'Запись удалит все атрибуты контейнера', 'Запись отключит прокрутку всей страницы'], correct: 1, why: 'Разметка вроде `<img onerror="…">` выполнит код: это XSS.' },
        { q: 'Что делает `passive: true` у обработчика `touchmove`?', options: ['Обработчик вызовется только один раз и снимется', 'Прокрутка идёт сразу, `preventDefault` игнорируется', 'Событие перестаёт всплывать выше элемента', 'Обработчик выполняется в отдельном воркере'], correct: 1, why: 'Браузер не ждёт обработчик, чтобы узнать, отменят ли прокрутку.' },
        { q: 'Что из этого может анимироваться без layout и paint?', options: ['`width`', '`opacity`', '`margin`', '`font-size`'], correct: 1, why: '`opacity` и `transform` элемента на своём слое требуют только композиции.' },
        { q: 'Какой наблюдатель подходит для бесконечной ленты?', options: ['`MutationObserver` на контейнере ленты', '`IntersectionObserver` на маяке в конце списка', '`ResizeObserver` на самом списке', '`PerformanceObserver` с типом `resource`'], correct: 1, why: 'Когда маяк попадает в область видимости, загружается следующая порция.' },
        { q: 'Своё событие изнутри Shadow DOM должно дойти до `document`. Что нужно?', options: ['Только `bubbles: true`', '`bubbles: true` и `composed: true`', 'Только `cancelable: true`', 'Поле `detail` с флагом `global`'], correct: 1, why: '`bubbles` даёт всплытие, `composed` выход за пределы теневого дерева.' },
      ],
      en: [
        { q: 'What goes into the render tree?', options: ['Elements with `display: none`', 'Elements with `visibility: hidden`', 'The contents of the `<head>`', 'Comments from the markup'], correct: 1, why: 'An element hidden with `visibility` takes space and stays in the tree; `display: none` and `<head>` do not.' },
        { q: 'Which script runs as soon as it loads, interrupting HTML parsing?', options: ['`<script defer>`', '`<script async>`', '`<script type="module">`', '`<script type="importmap">`'], correct: 1, why: '`async` runs as soon as it is loaded, with no order guarantee. `defer` and modules wait for parsing to finish.' },
        { q: 'A handler on `<ul>` catches clicks on any button inside. What is this called?', options: ['Capturing', 'Event delegation', 'Retargeting', 'A passive listener'], correct: 1, why: 'One handler on a container plus an `event.target.closest(...)` check: that is delegation.' },
        { q: 'Why is writing a user string into `innerHTML` dangerous?', options: ['It is much slower than `textContent`', 'The string is parsed as HTML and can run code', 'It removes all of the container\'s attributes', 'It disables scrolling for the whole page'], correct: 1, why: 'Markup such as `<img onerror="…">` runs code: that is XSS.' },
        { q: 'What does `passive: true` do for a `touchmove` handler?', options: ['The handler runs only once and is then removed', 'Scrolling starts at once; `preventDefault` is ignored', 'The event stops bubbling past the element', 'The handler runs in a separate worker thread'], correct: 1, why: 'The browser does not wait for the handler to learn whether scrolling will be cancelled.' },
        { q: 'Which of these can animate without layout or paint?', options: ['`width`', '`opacity`', '`margin`', '`font-size`'], correct: 1, why: '`opacity` and `transform` on an element with its own layer need only compositing.' },
        { q: 'Which observer fits an infinite feed?', options: ['`MutationObserver` on the feed container', '`IntersectionObserver` on a sentinel at the end', '`ResizeObserver` on the list itself', '`PerformanceObserver` with type `resource`'], correct: 1, why: 'When the sentinel becomes visible, the next page is loaded.' },
        { q: 'A custom event from inside a Shadow DOM must reach `document`. What is needed?', options: ['Only `bubbles: true` on the event', '`bubbles: true` and `composed: true`', 'Only `cancelable: true`', 'A `detail` field with a `global` flag'], correct: 1, why: '`bubbles` makes it bubble, `composed` lets it leave the shadow tree.' },
      ],
    },
  },
}
