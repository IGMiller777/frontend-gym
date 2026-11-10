import type { Localized } from '../i18n/types'

/**
 * Track overview shown on the track page: the explanation itself, not a list of links.
 * Text is plain with `inline code` in backticks. Official links go last, under "Read more".
 */
export interface Overview {
  intro: string
  topics: { title: string; text: string }[]
}

export const overviews: Record<string, Localized<Overview>> = {
  browser: {
    ru: {
      intro:
        'Браузер превращает HTML, CSS и JS в пиксели по конвейеру рендеринга. На собеседовании проверяют, понимаете ли вы, какие изменения в коде заставляют браузер заново считать раскладку страницы, а какие обходятся дёшево.',
      topics: [
        {
          title: 'Критический путь рендеринга',
          text: 'Браузер строит DOM из HTML и CSSOM из CSS, объединяет их в дерево рендеринга, считает геометрию (layout), рисует (paint) и собирает слои (composite). CSS блокирует отрисовку, а обычный `<script>` без `defer` или `async` останавливает разбор HTML, пока не загрузится и не выполнится.',
        },
        {
          title: 'Reflow и repaint',
          text: 'Изменение размеров или положения элемента запускает layout заново, изменение цвета требует только перерисовки. `transform` и `opacity` браузер может анимировать на этапе композиции, не трогая layout. Чтение `offsetWidth` сразу после записи стилей заставляет посчитать layout синхронно: это называют layout thrashing.',
        },
        {
          title: 'События',
          text: 'Событие сначала погружается от `window` к целевому элементу, затем всплывает обратно. Делегирование вешает один обработчик на предка вместо сотни на детей. Опция `{ passive: true }` обещает, что `preventDefault()` не будет вызван, и браузер прокручивает страницу, не дожидаясь JS.',
        },
        {
          title: 'Observer API',
          text: '`IntersectionObserver` сообщает, что элемент вошёл в область видимости (ленивые картинки, бесконечная лента), `ResizeObserver` сообщает об изменении размеров элемента, `MutationObserver` об изменениях DOM. Они работают асинхронно и дешевле, чем проверки в обработчике `scroll` или по таймеру.',
        },
        {
          title: 'Воркеры',
          text: 'Web Worker выполняет JS в отдельном потоке без доступа к DOM и общается со страницей через `postMessage`. Service Worker стоит между страницей и сетью: перехватывает запросы, отдаёт ответы из кэша, даёт офлайн-режим и push-уведомления.',
        },
      ],
    },
    en: {
      intro:
        'The browser turns HTML, CSS and JS into pixels through the rendering pipeline. Interviews check whether you know which code changes force the browser to recompute page layout and which ones are cheap.',
      topics: [
        {
          title: 'Critical rendering path',
          text: 'The browser builds the DOM from HTML and the CSSOM from CSS, combines them into the render tree, computes geometry (layout), paints and composites layers. CSS blocks rendering, and a plain `<script>` without `defer` or `async` stops HTML parsing until it is downloaded and executed.',
        },
        {
          title: 'Reflow and repaint',
          text: 'Changing an element’s size or position reruns layout, while changing its color only needs a repaint. The browser can animate `transform` and `opacity` at the compositing stage without touching layout. Reading `offsetWidth` right after writing styles forces a synchronous layout: this is called layout thrashing.',
        },
        {
          title: 'Events',
          text: 'An event first travels down from `window` to the target (capturing), then bubbles back up. Delegation attaches one handler to an ancestor instead of a hundred to the children. `{ passive: true }` promises that `preventDefault()` will not be called, so the browser scrolls without waiting for JS.',
        },
        {
          title: 'Observer APIs',
          text: '`IntersectionObserver` reports when an element enters the viewport (lazy images, infinite feeds), `ResizeObserver` reports element size changes, `MutationObserver` reports DOM changes. They run asynchronously and cost less than checks in a `scroll` handler or on a timer.',
        },
        {
          title: 'Workers',
          text: 'A Web Worker runs JS on a separate thread without DOM access and talks to the page via `postMessage`. A Service Worker sits between the page and the network: it intercepts requests, serves cached responses, and enables offline mode and push notifications.',
        },
      ],
    },
  },

  network: {
    ru: {
      intro:
        'Скорость загрузки зависит не только от размера файлов, но и от числа обходов по сети и от того, что браузер может взять из кэша. Эти вопросы задают и на собеседованиях по оптимизации, и на system design.',
      topics: [
        {
          title: 'HTTP/2 и HTTP/3',
          text: 'HTTP/2 передаёт много запросов параллельно в одном TCP-соединении и сжимает заголовки. HTTP/3 работает поверх QUIC (UDP): потеря пакета не тормозит остальные потоки, а соединение устанавливается быстрее. HTTP/2 Server Push браузеры убрали; вместо него используют `103 Early Hints` и `preload`.',
        },
        {
          title: 'Кэширование',
          text: '`Cache-Control` задаёт, кто и сколько хранит ответ: `max-age` (срок свежести), `no-cache` (хранить, но перепроверять), `no-store` (не хранить). Перепроверка идёт по `ETag` или `Last-Modified`, и сервер отвечает `304 Not Modified` без тела. Файлы с хэшем в имени отдают с `max-age=31536000, immutable`.',
        },
        {
          title: 'CORS',
          text: 'Браузер не даёт скрипту прочитать ответ с другого origin, если сервер не разрешил это заголовком `Access-Control-Allow-Origin`. Непростые запросы (например, с `Content-Type: application/json`) сначала отправляют предварительный `OPTIONS`. CORS защищает пользователя браузера, а не сервер: curl его не соблюдает.',
        },
        {
          title: 'Cookies',
          text: '`HttpOnly` скрывает cookie от JS, `Secure` разрешает её только по HTTPS, `SameSite` решает, уйдёт ли она с запросом с другого сайта. Chrome по умолчанию считает cookie без атрибута `SameSite=Lax`.',
        },
        {
          title: 'Приоритеты загрузки',
          text: '`<link rel="preload">` загружает критичный ресурс заранее, `preconnect` заранее открывает соединение с другим доменом, `fetchpriority="high"` поднимает приоритет главной картинки, `loading="lazy"` откладывает картинки ниже экрана.',
        },
      ],
    },
    en: {
      intro:
        'Load speed depends not only on file sizes but on how many network round trips are needed and what the browser can take from cache. These questions come up in both optimization and system design interviews.',
      topics: [
        {
          title: 'HTTP/2 and HTTP/3',
          text: 'HTTP/2 multiplexes many requests over one TCP connection and compresses headers. HTTP/3 runs on QUIC (UDP): a lost packet does not stall other streams, and connections are set up faster. Browsers removed HTTP/2 Server Push; `103 Early Hints` and `preload` replace it.',
        },
        {
          title: 'Caching',
          text: '`Cache-Control` says who may store a response and for how long: `max-age` (freshness lifetime), `no-cache` (store but revalidate), `no-store` (do not store). Revalidation uses `ETag` or `Last-Modified`, and the server answers `304 Not Modified` without a body. Files with a hash in the name are served with `max-age=31536000, immutable`.',
        },
        {
          title: 'CORS',
          text: 'The browser blocks a script from reading a cross-origin response unless the server allows it with `Access-Control-Allow-Origin`. Non-simple requests (for example with `Content-Type: application/json`) first send an `OPTIONS` preflight. CORS protects the browser user, not the server: curl ignores it.',
        },
        {
          title: 'Cookies',
          text: '`HttpOnly` hides a cookie from JS, `Secure` sends it only over HTTPS, `SameSite` decides whether it goes along with requests from other sites. Chrome treats cookies without the attribute as `SameSite=Lax`.',
        },
        {
          title: 'Loading priorities',
          text: '`<link rel="preload">` fetches a critical resource early, `preconnect` opens a connection to another domain ahead of time, `fetchpriority="high"` boosts the main image, and `loading="lazy"` defers images below the fold.',
        },
      ],
    },
  },

  html: {
    ru: {
      intro:
        'Правильная разметка бесплатно даёт доступность, SEO и работу с клавиатуры. Важно понимать, когда хватает нативного элемента, а когда без ARIA не обойтись.',
      topics: [
        {
          title: 'Семантика',
          text: 'Теги `header`, `nav`, `main`, `article`, `aside`, `footer` создают ориентиры, по которым скринридер перемещается по странице. Заголовки `h1`–`h6` образуют оглавление, поэтому уровни не перепрыгивают ради размера шрифта.',
        },
        {
          title: 'Нативный элемент или ARIA',
          text: '`<button>` уже получает фокус, нажимается клавишами Enter и Space и объявляется как кнопка. `<div onclick>` ничего из этого не умеет. Первое правило ARIA: если есть нативный элемент с нужным поведением, используйте его, а ARIA добавляйте только там, где нативного аналога нет.',
        },
        {
          title: 'Формы',
          text: '`<label for>` связывает подпись с полем. Атрибуты `required`, `type="email"`, `pattern` и `minlength` включают встроенную проверку, а Constraint Validation API (`checkValidity()`, `setCustomValidity()`) управляет ею из JS. Проверка в браузере не заменяет проверку на сервере.',
        },
        {
          title: 'Фокус',
          text: 'Видимый фокус обязателен: `outline: none` без замены нарушает WCAG. В модальном окне фокус удерживают внутри и после закрытия возвращают на кнопку, которая окно открыла. Нативный `<dialog>` с `showModal()` делает фон недоступным и берёт эту работу на себя.',
        },
        {
          title: 'Живые области',
          text: 'Когда контент меняется без перезагрузки (тост, ошибка формы), `role="status"` или `aria-live="polite"` просит скринридер зачитать изменение после текущей фразы, а `role="alert"` зачитывает его сразу.',
        },
      ],
    },
    en: {
      intro:
        'Correct markup gives you accessibility, SEO and keyboard support for free. The key skill is knowing when a native element is enough and when you really need ARIA.',
      topics: [
        {
          title: 'Semantics',
          text: '`header`, `nav`, `main`, `article`, `aside` and `footer` create landmarks that screen reader users jump between. Headings `h1`–`h6` form the page outline, so do not skip levels just to get a smaller font.',
        },
        {
          title: 'Native element or ARIA',
          text: 'A `<button>` is focusable, activates with Enter and Space and is announced as a button. A `<div onclick>` does none of that. The first rule of ARIA: if a native element has the behavior you need, use it; add ARIA only where no native equivalent exists.',
        },
        {
          title: 'Forms',
          text: '`<label for>` ties a caption to its field. `required`, `type="email"`, `pattern` and `minlength` turn on built-in validation, and the Constraint Validation API (`checkValidity()`, `setCustomValidity()`) controls it from JS. Browser validation never replaces server validation.',
        },
        {
          title: 'Focus',
          text: 'Visible focus is required: `outline: none` without a replacement fails WCAG. In a modal, focus stays inside and returns to the opening button when it closes. A native `<dialog>` opened with `showModal()` makes the background inert and handles this for you.',
        },
        {
          title: 'Live regions',
          text: 'When content changes without a reload (a toast, a form error), `role="status"` or `aria-live="polite"` asks the screen reader to announce it after the current phrase, while `role="alert"` announces it immediately.',
        },
      ],
    },
  },

  css: {
    ru: {
      intro:
        'По CSS проверяют понимание каскада и раскладки, а также знание возможностей последних лет, которые заменили многие решения на JS.',
      topics: [
        {
          title: 'Каскад и специфичность',
          text: 'Конфликт правил решается по порядку: происхождение стиля и `!important`, каскадные слои `@layer`, специфичность (id сильнее класса, атрибута и псевдокласса, а они сильнее тега), и наконец порядок в коде. Обычные стили вне слоёв побеждают стили внутри слоёв, поэтому сброс и библиотеки удобно класть в слои.',
        },
        {
          title: 'Flexbox и Grid',
          text: 'Flexbox раскладывает элементы вдоль одной оси и распределяет между ними свободное место. Grid раскладывает по строкам и столбцам сразу. `subgrid` позволяет вложенной сетке выровняться по линиям родительской.',
        },
        {
          title: 'Container queries',
          text: '`@container` меняет стили компонента в зависимости от размера его контейнера, а не окна, поэтому одна и та же карточка корректно выглядит и в узкой колонке, и в широкой. Контейнер объявляют свойством `container-type: inline-size`.',
        },
        {
          title: ':has() и вложенность',
          text: '`:has()` выбирает элемент по его потомкам или соседям: например, `form:has(:invalid)` подсвечивает форму с ошибкой без JS. Нативная вложенность правил через `&` работает во всех современных браузерах без препроцессора.',
        },
        {
          title: 'Анимации и производительность',
          text: 'Анимируйте `transform` и `opacity`: браузер пересчитывает их на этапе композиции, не трогая layout. `will-change` заранее выносит элемент в отдельный слой, но злоупотребление им тратит память. Уважайте настройку `prefers-reduced-motion`.',
        },
      ],
    },
    en: {
      intro: 'CSS interviews test your grasp of the cascade and layout, plus the features of recent years that replaced many JS solutions.',
      topics: [
        {
          title: 'Cascade and specificity',
          text: 'Conflicts are resolved in order: origin and `!important`, cascade layers `@layer`, specificity (an id beats a class, attribute or pseudo-class, which beat a type selector), and finally source order. Unlayered styles beat layered ones, which makes layers a good home for resets and libraries.',
        },
        {
          title: 'Flexbox and Grid',
          text: 'Flexbox lays items out along one axis and distributes free space between them. Grid lays them out in rows and columns at once. `subgrid` lets a nested grid align to its parent’s lines.',
        },
        {
          title: 'Container queries',
          text: '`@container` styles a component based on the size of its container rather than the viewport, so the same card works in a narrow sidebar and a wide column. Declare a container with `container-type: inline-size`.',
        },
        {
          title: ':has() and nesting',
          text: '`:has()` selects an element by its descendants or siblings: `form:has(:invalid)` highlights a form with an error, no JS needed. Native nesting with `&` works in all modern browsers without a preprocessor.',
        },
        {
          title: 'Animation and performance',
          text: 'Animate `transform` and `opacity`: the browser updates them at the compositing stage without touching layout. `will-change` promotes an element to its own layer ahead of time, but overusing it wastes memory. Respect `prefers-reduced-motion`.',
        },
      ],
    },
  },

  'js-core': {
    ru: {
      intro: 'Вопросы по основам JS почти всегда сводятся к трём вещам: где живут переменные, на что указывает `this` и как объект находит свои методы.',
      topics: [
        {
          title: 'Типы и сравнение',
          text: 'В JS семь примитивов (`string`, `number`, `bigint`, `boolean`, `undefined`, `symbol`, `null`) и объекты. `===` сравнивает без приведения типов, `==` приводит их по запутанным правилам. `typeof null` возвращает `"object"`: это историческая ошибка языка, которую не исправляют ради совместимости.',
        },
        {
          title: 'Области видимости и замыкания',
          text: '`let` и `const` видны внутри блока, а до строки объявления находятся во временной мёртвой зоне. `var` видна во всей функции. Замыкание это функция вместе с окружением, в котором она создана: она продолжает видеть переменные этого окружения и после выхода из него.',
        },
        {
          title: 'this',
          text: '`this` зависит от способа вызова: при вызове метода это объект слева от точки, при обычном вызове в строгом режиме `undefined`, при `new` новый объект. У стрелочных функций своего `this` нет, они берут его из внешней области. `call`, `apply` и `bind` задают `this` явно.',
        },
        {
          title: 'Прототипы',
          text: 'Если у объекта нет свойства, поиск продолжается по цепочке `[[Prototype]]` до `null`. Синтаксис `class` строит ту же прототипную цепочку: это удобная запись, а не отдельная модель наследования.',
        },
        {
          title: 'Модули и память',
          text: 'ES-модули (`import` и `export`) статичны, поэтому сборщик может удалить неиспользуемый код (tree-shaking). Сборщик мусора удаляет объекты, до которых нельзя дотянуться по ссылкам, а `WeakMap` позволяет привязать данные к объекту, не мешая его удалению.',
        },
      ],
    },
    en: {
      intro: 'JS fundamentals questions almost always come down to three things: where variables live, what `this` points to, and how an object finds its methods.',
      topics: [
        {
          title: 'Types and equality',
          text: 'JS has seven primitives (`string`, `number`, `bigint`, `boolean`, `undefined`, `symbol`, `null`) plus objects. `===` compares without type coercion, `==` coerces by tangled rules. `typeof null` returns `"object"`: a historical bug kept for compatibility.',
        },
        {
          title: 'Scope and closures',
          text: '`let` and `const` are block-scoped and sit in the temporal dead zone before their declaration line. `var` is function-scoped. A closure is a function together with the environment it was created in: it keeps seeing that environment’s variables after the outer code has finished.',
        },
        {
          title: 'this',
          text: '`this` depends on how a function is called: for a method call it is the object left of the dot, for a plain call in strict mode it is `undefined`, with `new` it is the new object. Arrow functions have no own `this` and take it from the enclosing scope. `call`, `apply` and `bind` set `this` explicitly.',
        },
        {
          title: 'Prototypes',
          text: 'If an object lacks a property, lookup continues along the `[[Prototype]]` chain until `null`. The `class` syntax builds the same prototype chain: it is a convenient notation, not a separate inheritance model.',
        },
        {
          title: 'Modules and memory',
          text: 'ES modules (`import` and `export`) are static, so bundlers can drop unused code (tree-shaking). The garbage collector removes objects that are no longer reachable, and a `WeakMap` attaches data to an object without keeping it alive.',
        },
      ],
    },
  },

  'js-async': {
    ru: {
      intro: 'Асинхронность это самая частая тема задач «что выведет код». Нужно точно знать, в каком порядке выполняются синхронный код, микрозадачи и задачи.',
      topics: [
        {
          title: 'Event loop',
          text: 'Движок выполняет текущую задачу до конца, затем опустошает очередь микрозадач (`Promise.then`, `queueMicrotask`, колбэки `MutationObserver`), и только потом браузер может отрисовать кадр и взять следующую задачу (`setTimeout`, события, сообщения). Поэтому бесконечная цепочка микрозадач блокирует отрисовку.',
        },
        {
          title: 'Промисы',
          text: 'Промис находится в состоянии `pending`, `fulfilled` или `rejected` и меняет его ровно один раз. `Promise.all` отклоняется на первой ошибке, `allSettled` ждёт все промисы, `race` берёт первый завершившийся, `any` первый успешный.',
        },
        {
          title: 'async и await',
          text: '`async`-функция всегда возвращает промис, а код после `await` продолжается как микрозадача. Независимые запросы запускают параллельно через `Promise.all`, а не последовательными `await` в цикле.',
        },
        {
          title: 'Отмена',
          text: '`AbortController` отменяет `fetch` и снимает обработчики событий (`addEventListener(type, fn, { signal })`). Так решают гонки: при новом поисковом запросе отменяют предыдущий, чтобы его поздний ответ не перезаписал свежий.',
        },
        {
          title: 'Таймеры и кадры',
          text: '`setTimeout(fn, 0)` выполнит колбэк не раньше следующей задачи, а при глубокой вложенности таймеров браузер поднимает минимальную задержку до 4 мс. Для анимаций используют `requestAnimationFrame`: колбэк вызывается прямо перед следующей отрисовкой.',
        },
      ],
    },
    en: {
      intro: 'Async is the most common topic of "what does this code print" tasks. You need to know exactly in which order synchronous code, microtasks and tasks run.',
      topics: [
        {
          title: 'Event loop',
          text: 'The engine runs the current task to completion, then drains the microtask queue (`Promise.then`, `queueMicrotask`, `MutationObserver` callbacks), and only then can the browser render a frame and pick the next task (`setTimeout`, events, messages). An endless chain of microtasks therefore blocks rendering.',
        },
        {
          title: 'Promises',
          text: 'A promise is `pending`, `fulfilled` or `rejected` and settles exactly once. `Promise.all` rejects on the first error, `allSettled` waits for all of them, `race` takes the first to settle, `any` takes the first to fulfill.',
        },
        {
          title: 'async and await',
          text: 'An `async` function always returns a promise, and code after `await` resumes as a microtask. Run independent requests in parallel with `Promise.all`, not with sequential `await`s in a loop.',
        },
        {
          title: 'Cancellation',
          text: '`AbortController` cancels `fetch` and removes event listeners (`addEventListener(type, fn, { signal })`). It solves races: when a new search starts, abort the previous one so its late response cannot overwrite the fresh one.',
        },
        {
          title: 'Timers and frames',
          text: '`setTimeout(fn, 0)` runs no earlier than the next task, and with deeply nested timers browsers raise the minimum delay to 4 ms. For animation use `requestAnimationFrame`: its callback runs right before the next paint.',
        },
      ],
    },
  },

  typescript: {
    ru: {
      intro: 'TypeScript проверяет типы только при компиляции и не существует во время выполнения. На собеседовании смотрят, умеете ли вы точно описать данные и заставить компилятор ловить ошибки за вас.',
      topics: [
        {
          title: 'type и interface',
          text: 'Оба описывают форму объекта. `interface` можно объявить повторно, и объявления сольются (declaration merging), а повторный `type` с тем же именем вызовет ошибку. Объединения (`A | B`), условные и mapped-типы записывают только через `type`.',
        },
        {
          title: 'Сужение типов',
          text: 'Внутри проверок `typeof`, `instanceof`, `in` и сравнения поля-дискриминанта (`action.status === "success"`) компилятор знает более точный тип. Свои проверки пишут функцией с предикатом `value is T`; начиная с TS 5.5 компилятор сам выводит такие предикаты для простых функций.',
        },
        {
          title: 'Generics',
          text: 'Обобщённый тип это параметр, который подставляется при использовании: `function first<T>(xs: T[]): T | undefined`. Ограничение `T extends { id: string }` требует, чтобы у типа было нужное поле.',
        },
        {
          title: 'Utility-типы',
          text: '`Partial`, `Required`, `Readonly`, `Pick`, `Omit`, `Record`, `ReturnType`, `Parameters` и `Awaited` построены из mapped- и conditional-типов, и их стоит уметь написать самому. Ключевое слово `infer` достаёт тип из другого типа внутри условного.',
        },
        {
          title: 'unknown, never и satisfies',
          text: 'Значение типа `unknown` нельзя использовать, пока его не сузили, поэтому это безопасная замена `any`. `never` означает невозможное значение и помогает проверить, что `switch` разобрал все варианты. `satisfies` (с TS 4.9) проверяет значение по типу, сохраняя его точный выведенный тип.',
        },
      ],
    },
    en: {
      intro: 'TypeScript checks types only at compile time and does not exist at runtime. Interviews check whether you can describe data precisely and make the compiler catch mistakes for you.',
      topics: [
        {
          title: 'type vs interface',
          text: 'Both describe an object’s shape. An `interface` can be declared again and the declarations merge (declaration merging), while redeclaring a `type` with the same name is an error. Unions (`A | B`), conditional and mapped types can only be written with `type`.',
        },
        {
          title: 'Narrowing',
          text: 'Inside `typeof`, `instanceof`, `in` checks and discriminant comparisons (`action.status === "success"`) the compiler knows a more precise type. Custom checks are functions returning a `value is T` predicate; since TS 5.5 the compiler infers such predicates for simple functions.',
        },
        {
          title: 'Generics',
          text: 'A generic is a type parameter filled in at use site: `function first<T>(xs: T[]): T | undefined`. A constraint like `T extends { id: string }` requires the type to have that field.',
        },
        {
          title: 'Utility types',
          text: '`Partial`, `Required`, `Readonly`, `Pick`, `Omit`, `Record`, `ReturnType`, `Parameters` and `Awaited` are built from mapped and conditional types, and you should be able to write them yourself. The `infer` keyword extracts a type from another type inside a conditional.',
        },
        {
          title: 'unknown, never and satisfies',
          text: 'A value of type `unknown` cannot be used until it is narrowed, which makes it the safe alternative to `any`. `never` is the impossible value and lets you check that a `switch` handled every case. `satisfies` (since TS 4.9) checks a value against a type while keeping its precise inferred type.',
        },
      ],
    },
  },

  react: {
    ru: {
      intro: 'React описывает интерфейс как функцию от состояния. Главное, что проверяют на собеседовании: когда и почему компонент перерисовывается и как правильно работать с эффектами.',
      topics: [
        {
          title: 'Рендер и коммит',
          text: 'Изменение состояния ставит рендер в очередь. React вызывает компоненты, сравнивает новое дерево с предыдущим (reconciliation) и в фазе коммита применяет к DOM только разницу. Элементы списка сопоставляются по `key`, поэтому индекс в роли ключа ломает состояние при перестановке элементов.',
        },
        {
          title: 'Хуки',
          text: 'Хуки вызывают на верхнем уровне компонента и всегда в одном порядке: React хранит их состояние по порядку вызова. `useState` хранит значение, `useRef` хранит изменяемое значение без перерисовки, `useMemo` и `useCallback` кэшируют результат вычисления и функцию.',
        },
        {
          title: 'Эффекты',
          text: '`useEffect` синхронизирует компонент с внешней системой после отрисовки и возвращает функцию очистки. Если значение можно вычислить из пропсов и состояния во время рендера, эффект не нужен. В `StrictMode` при разработке React запускает эффект, очищает и запускает снова, чтобы выявить забытую очистку.',
        },
        {
          title: 'Конкурентный рендеринг',
          text: '`useTransition` помечает обновление как несрочное, и ввод остаётся отзывчивым. `useDeferredValue` откладывает тяжёлую часть интерфейса. `Suspense` показывает запасной интерфейс, пока загружаются данные или код.',
        },
        {
          title: 'Новое в React 19',
          text: 'Actions (`useActionState`, `useOptimistic`, `<form action>`) упрощают отправку форм и оптимистичные обновления, а `use` читает промис или контекст. React Compiler при сборке сам расставляет мемоизацию, поэтому ручные `useMemo` и `useCallback` нужны реже.',
        },
      ],
    },
    en: {
      intro: 'React describes UI as a function of state. The core interview topics: when and why a component re-renders, and how to use effects correctly.',
      topics: [
        {
          title: 'Render and commit',
          text: 'A state change queues a render. React calls your components, compares the new tree with the previous one (reconciliation) and in the commit phase applies only the difference to the DOM. List items are matched by `key`, so using the index as a key breaks state when items are reordered.',
        },
        {
          title: 'Hooks',
          text: 'Hooks are called at the top level of a component, always in the same order: React stores their state by call order. `useState` keeps a value, `useRef` keeps a mutable value without re-rendering, `useMemo` and `useCallback` cache a computed value and a function.',
        },
        {
          title: 'Effects',
          text: '`useEffect` synchronizes a component with an external system after paint and returns a cleanup function. If a value can be computed from props and state during render, you do not need an effect. In `StrictMode` during development React runs, cleans up and reruns effects to expose missing cleanup.',
        },
        {
          title: 'Concurrent rendering',
          text: '`useTransition` marks an update as non-urgent so input stays responsive. `useDeferredValue` defers a heavy part of the UI. `Suspense` shows a fallback while data or code is loading.',
        },
        {
          title: 'New in React 19',
          text: 'Actions (`useActionState`, `useOptimistic`, `<form action>`) simplify form submission and optimistic updates, and `use` reads a promise or context. React Compiler adds memoization at build time, so manual `useMemo` and `useCallback` are needed less often.',
        },
      ],
    },
  },

  angular: {
    ru: {
      intro: 'Современный Angular сильно отличается от версий конца 2010-х: standalone-компоненты вместо NgModule, сигналы вместо магии Zone.js, новый синтаксис шаблонов. Собеседования всё чаще проверяют именно новый подход.',
      topics: [
        {
          title: 'Standalone-компоненты',
          text: 'Компонент сам перечисляет свои зависимости в `imports`, и NgModule больше не обязателен. Начиная с Angular 19 компоненты, директивы и пайпы standalone по умолчанию.',
        },
        {
          title: 'Сигналы',
          text: '`signal()` хранит значение, `computed()` вычисляет производное и кэширует его, `effect()` выполняет побочное действие при изменении. Angular знает, какие шаблоны читают сигнал, и обновляет только их.',
        },
        {
          title: 'Обнаружение изменений',
          text: 'Раньше Zone.js перехватывал асинхронные API и запускал проверку всего дерева компонентов. С Angular 21 приложения zoneless по умолчанию: проверку планируют сигналы в шаблоне, события шаблона и `markForCheck`. С Angular 22 компоненты по умолчанию `OnPush`: проверяются, когда изменились входы, случились их события или обновились прочитанные сигналы; прежний режим называется `Eager`.',
        },
        {
          title: 'Внедрение зависимостей',
          text: 'Зависимость получают через `inject()` или параметр конструктора. Место провайдера определяет время жизни экземпляра: `@Service()` (Angular 22) или `providedIn: "root"` дают один экземпляр на приложение, провайдер в компоненте создаёт отдельный экземпляр для каждого компонента.',
        },
        {
          title: 'RxJS и шаблоны',
          text: '`switchMap` отменяет предыдущий внутренний поток (поиск), `concatMap` выполняет запросы по очереди, `exhaustMap` игнорирует новые, пока идёт текущий (защита от двойной отправки формы). В шаблонах блоки `@if`, `@for` с обязательным `track` и `@defer` заменили структурные директивы и дают ленивую загрузку частей страницы.',
        },
      ],
    },
    en: {
      intro: 'Modern Angular is very different from the late-2010s versions: standalone components instead of NgModules, signals instead of Zone.js magic, a new template syntax. Interviews increasingly test the new approach.',
      topics: [
        {
          title: 'Standalone components',
          text: 'A component lists its own dependencies in `imports`, so NgModules are no longer required. Since Angular 19, components, directives and pipes are standalone by default.',
        },
        {
          title: 'Signals',
          text: '`signal()` holds a value, `computed()` derives a cached value, `effect()` runs a side effect on change. Angular knows which templates read a signal and updates only those.',
        },
        {
          title: 'Change detection',
          text: 'Zone.js used to patch async APIs and trigger a check of the whole component tree. Since Angular 21 apps are zoneless by default: checks are scheduled by signals in templates, template events and `markForCheck`. Since Angular 22 components are `OnPush` by default: they are checked when inputs change, their events fire or the signals they read update; the old mode is called `Eager`.',
        },
        {
          title: 'Dependency injection',
          text: 'Dependencies come from `inject()` or a constructor parameter. Where the provider lives sets the instance lifetime: `@Service()` (Angular 22) or `providedIn: "root"` give one instance per app, a component-level provider creates a separate instance per component.',
        },
        {
          title: 'RxJS and templates',
          text: '`switchMap` cancels the previous inner stream (search), `concatMap` runs requests one by one, `exhaustMap` ignores new ones while one is in flight (double-submit protection). In templates, `@if`, `@for` with a required `track`, and `@defer` replaced structural directives and add lazy loading of page parts.',
        },
      ],
    },
  },

  vue: {
    ru: {
      intro: 'Vue строит интерфейс на реактивности: фреймворк сам отслеживает, какие данные читает шаблон, и обновляет только зависимые части.',
      topics: [
        {
          title: 'ref и reactive',
          text: '`ref()` оборачивает любое значение, доступ к нему идёт через `.value` (в шаблоне без него). `reactive()` делает объект глубоко реактивным через Proxy, но теряет реактивность при деструктуризации и не работает с примитивами. Официальная документация рекомендует `ref` как основной API.',
        },
        {
          title: 'computed и watch',
          text: '`computed` даёт кэшируемое производное значение без побочных эффектов. `watch` явно следит за источником и передаёт старое и новое значение, `watchEffect` сам собирает зависимости и запускается сразу.',
        },
        {
          title: 'Composition API и composables',
          text: '`<script setup>` и Composition API группируют код по смыслу, а не по опциям `data`, `methods`, `computed`. Composable это функция `useX()`, которая инкапсулирует состояние и логику для повторного использования; по роли она похожа на пользовательский хук React.',
        },
        {
          title: 'Обновление DOM',
          text: 'Vue собирает изменения и применяет их к DOM асинхронно, одним проходом. Чтобы прочитать уже обновлённый DOM, ждут `await nextTick()`.',
        },
        {
          title: 'Экосистема',
          text: 'Vue Router отвечает за маршрутизацию, Pinia за глобальное состояние (официальная замена Vuex), Nuxt за SSR и генерацию статики.',
        },
      ],
    },
    en: {
      intro: 'Vue builds UI on reactivity: the framework tracks which data a template reads and updates only the dependent parts.',
      topics: [
        {
          title: 'ref and reactive',
          text: '`ref()` wraps any value, accessed via `.value` (unwrapped in templates). `reactive()` makes an object deeply reactive via Proxy, but loses reactivity when destructured and does not work with primitives. The official docs recommend `ref` as the primary API.',
        },
        {
          title: 'computed and watch',
          text: '`computed` is a cached derived value with no side effects. `watch` explicitly observes a source and passes the old and new value, `watchEffect` collects dependencies automatically and runs immediately.',
        },
        {
          title: 'Composition API and composables',
          text: '`<script setup>` and the Composition API group code by concern instead of by `data`, `methods`, `computed` options. A composable is a `useX()` function that encapsulates state and logic for reuse, similar in role to a React custom hook.',
        },
        {
          title: 'DOM updates',
          text: 'Vue batches changes and applies them to the DOM asynchronously in one pass. To read the updated DOM, `await nextTick()`.',
        },
        {
          title: 'Ecosystem',
          text: 'Vue Router handles routing, Pinia handles global state (the official successor to Vuex), and Nuxt handles SSR and static generation.',
        },
      ],
    },
  },

  state: {
    ru: {
      intro: 'Большая часть состояния в приложении это копия данных с сервера. Если отделить серверное состояние от клиентского, архитектура упрощается сильнее, чем от выбора любой библиотеки.',
      topics: [
        {
          title: 'Виды состояния',
          text: 'Серверное (данные API, источник истины на сервере), UI-состояние (открыта ли модалка, активная вкладка), состояние в URL (фильтры, номер страницы), производное (вычисляется из других, а не хранится) и состояние формы. Для каждого вида свой лучший инструмент.',
        },
        {
          title: 'Серверное состояние',
          text: 'TanStack Query, SWR и RTK Query кэшируют ответы, объединяют одинаковые запросы, обновляют данные в фоне (stale-while-revalidate) и поддерживают оптимистичные обновления. Повторять это вручную на `useEffect` долго и ненадёжно.',
        },
        {
          title: 'Глобальное UI-состояние',
          text: 'Redux Toolkit даёт предсказуемый однонаправленный поток данных и инструменты отладки, Zustand даёт минимальный стор на хуках, MobX строится на наблюдаемых объектах. NgRx в Angular и Pinia во Vue решают ту же задачу. Глобально стоит хранить только то, что действительно нужно многим частям приложения.',
        },
        {
          title: 'Нормализация',
          text: 'Если одна сущность показывается в нескольких местах, её хранят один раз (`byId` плюс список id), и одно обновление меняет все представления. Производные списки вычисляют селекторами, а не копируют.',
        },
      ],
    },
    en: {
      intro: 'Most state in an app is a copy of server data. Separating server state from client state simplifies the architecture more than any library choice.',
      topics: [
        {
          title: 'Kinds of state',
          text: 'Server state (API data, source of truth on the server), UI state (is a modal open, the active tab), URL state (filters, page number), derived state (computed, not stored) and form state. Each kind has its best tool.',
        },
        {
          title: 'Server state',
          text: 'TanStack Query, SWR and RTK Query cache responses, deduplicate identical requests, refresh data in the background (stale-while-revalidate) and support optimistic updates. Rebuilding this by hand with `useEffect` is slow and fragile.',
        },
        {
          title: 'Global UI state',
          text: 'Redux Toolkit gives a predictable one-way data flow and devtools, Zustand a minimal hook-based store, MobX observable objects. NgRx in Angular and Pinia in Vue solve the same problem. Keep global only what many parts of the app truly need.',
        },
        {
          title: 'Normalization',
          text: 'If one entity appears in several places, store it once (`byId` plus a list of ids) so a single update changes every view. Compute derived lists with selectors instead of copying them.',
        },
      ],
    },
  },

  api: {
    ru: {
      intro: 'Способ общения с сервером выбирают по трём вопросам: кто начинает обмен, как часто приходят данные и нужен ли обратный канал.',
      topics: [
        {
          title: 'REST',
          text: 'Ресурсы и HTTP-методы; ответы на GET хорошо кэшируются браузером и CDN. Минус: один экран часто требует нескольких запросов или получает лишние поля.',
        },
        {
          title: 'GraphQL',
          text: 'Клиент сам описывает нужные поля и получает их одним запросом. Цена: кэшировать сложнее (обычно один POST-эндпоинт), а на сервере приходится следить за проблемой N+1 запросов к базе.',
        },
        {
          title: 'WebSocket и SSE',
          text: 'WebSocket даёт постоянный двунаправленный канал (чат, совместное редактирование). Server-Sent Events это односторонний поток от сервера поверх обычного HTTP с автоматическим переподключением (уведомления, статусы, стриминг ответа ИИ). Для редких обновлений хватает периодического опроса.',
        },
        {
          title: 'WebRTC',
          text: 'Прямое соединение между браузерами для аудио, видео и данных. Сервер нужен, чтобы участники нашли друг друга (сигналинг), и для ретрансляции трафика через TURN, если прямое соединение установить нельзя.',
        },
        {
          title: 'Надёжность',
          text: 'Таймауты, повторы с экспоненциальной задержкой, отмена устаревших запросов, идемпотентность повторяемых изменений и переподключение со случайной задержкой (jitter), чтобы тысячи клиентов не пришли на сервер в одну секунду.',
        },
      ],
    },
    en: {
      intro: 'Choose how to talk to the server by three questions: who starts the exchange, how often data arrives, and whether you need a channel back.',
      topics: [
        {
          title: 'REST',
          text: 'Resources and HTTP methods; GET responses cache well in the browser and on CDNs. Downside: one screen often needs several requests or receives extra fields.',
        },
        {
          title: 'GraphQL',
          text: 'The client describes exactly which fields it needs and gets them in one request. The cost: caching is harder (usually a single POST endpoint), and the server has to watch for N+1 database queries.',
        },
        {
          title: 'WebSocket and SSE',
          text: 'WebSocket is a persistent two-way channel (chat, collaborative editing). Server-Sent Events are a one-way stream from the server over plain HTTP with automatic reconnection (notifications, statuses, streaming AI answers). For rare updates, periodic polling is enough.',
        },
        {
          title: 'WebRTC',
          text: 'A direct browser-to-browser connection for audio, video and data. A server is needed for peers to find each other (signaling) and to relay traffic via TURN when a direct connection is impossible.',
        },
        {
          title: 'Reliability',
          text: 'Timeouts, retries with exponential backoff, cancelling stale requests, idempotent retried mutations, and reconnecting with random jitter so thousands of clients do not hit the server in the same second.',
        },
      ],
    },
  },

  rendering: {
    ru: {
      intro: 'Где и когда превращать данные в HTML, главный архитектурный выбор фронтенда. От него зависят скорость первой отрисовки, SEO, нагрузка на сервер и время до интерактивности.',
      topics: [
        {
          title: 'CSR',
          text: 'Сервер отдаёт почти пустой HTML и JS, страница строится в браузере. Это просто и дёшево для сервера, но первый показ ждёт загрузки и выполнения JS, а поисковикам сложнее.',
        },
        {
          title: 'SSR и гидратация',
          text: 'Сервер рендерит HTML на каждый запрос, браузер сразу его показывает, а затем гидратация подключает обработчики и делает страницу интерактивной. Если HTML на клиенте получился другим (например, из-за `Date.now()` в рендере), React сообщит об ошибке гидратации.',
        },
        {
          title: 'SSG и ISR',
          text: 'Страницы генерируются при сборке и раздаются с CDN. ISR перегенерирует страницу в фоне через заданное время или по событию, совмещая скорость статики со свежестью данных.',
        },
        {
          title: 'Стриминг',
          text: 'Сервер отправляет HTML частями: оболочку сразу, медленные блоки по мере готовности (в React их оборачивают в `Suspense`). Пользователь видит контент раньше, чем готова вся страница.',
        },
        {
          title: 'Server Components',
          text: 'React Server Components выполняются только на сервере, могут обращаться к данным напрямую и не добавляют свой код в клиентский бандл. Интерактивные компоненты помечают директивой `"use client"`.',
        },
      ],
    },
    en: {
      intro: 'Where and when to turn data into HTML is frontend’s central architecture choice. It drives first paint, SEO, server load and time to interactivity.',
      topics: [
        {
          title: 'CSR',
          text: 'The server sends an almost empty HTML plus JS, and the page is built in the browser. Simple and cheap for the server, but first paint waits for JS to download and run, and crawlers have a harder time.',
        },
        {
          title: 'SSR and hydration',
          text: 'The server renders HTML per request, the browser shows it immediately, then hydration attaches handlers and makes the page interactive. If the client renders different HTML (for example from `Date.now()` in render), React reports a hydration error.',
        },
        {
          title: 'SSG and ISR',
          text: 'Pages are generated at build time and served from a CDN. ISR regenerates a page in the background after a set time or on an event, combining static speed with fresh data.',
        },
        {
          title: 'Streaming',
          text: 'The server sends HTML in chunks: the shell right away, slow blocks as they become ready (in React they are wrapped in `Suspense`). Users see content before the whole page is done.',
        },
        {
          title: 'Server Components',
          text: 'React Server Components run only on the server, can read data directly and add none of their code to the client bundle. Interactive components are marked with the `"use client"` directive.',
        },
      ],
    },
  },

  performance: {
    ru: {
      intro: 'Производительность измеряют метриками, которые отражают опыт пользователя. Главные из них Google объединил в Core Web Vitals; оценку ставят по 75-му перцентилю реальных посещений.',
      topics: [
        {
          title: 'LCP',
          text: 'Largest Contentful Paint: время отрисовки самого большого элемента в видимой области. Хорошо, если не больше 2,5 с. Улучшают быстрым ответом сервера, предзагрузкой главной картинки с `fetchpriority="high"` и устранением блокирующих ресурсов.',
        },
        {
          title: 'INP',
          text: 'Interaction to Next Paint: задержка от действия пользователя до следующей отрисовки, взятая по худшим взаимодействиям за визит. Хорошо, если не больше 200 мс. В марте 2024 года INP заменил FID. Улучшают, разбивая длинные задачи и перенося работу с главного потока.',
        },
        {
          title: 'CLS',
          text: 'Cumulative Layout Shift: насколько контент неожиданно сдвигается. Хорошо, если не больше 0,1. Резервируйте место под картинки и рекламу (`width`, `height`, `aspect-ratio`) и не вставляйте контент над уже показанным.',
        },
        {
          title: 'Бандл и ресурсы',
          text: 'Разделение кода по маршрутам через `import()`, tree-shaking, отказ от тяжёлых зависимостей, современные форматы изображений (AVIF, WebP) с `srcset` и сжатие Brotli.',
        },
        {
          title: 'Измерение',
          text: 'Лабораторные данные (Lighthouse, вкладка Performance в DevTools) помогают найти причину проблемы, полевые (отчёт CrUX, библиотека `web-vitals`) показывают, что видят реальные пользователи. Оптимизацию начинают с полевых данных.',
        },
      ],
    },
    en: {
      intro: 'Performance is measured with metrics that reflect user experience. Google groups the main ones as Core Web Vitals, assessed at the 75th percentile of real visits.',
      topics: [
        {
          title: 'LCP',
          text: 'Largest Contentful Paint: when the largest element in the viewport is rendered. Good is 2.5 s or less. Improve it with a fast server response, preloading the hero image with `fetchpriority="high"` and removing render-blocking resources.',
        },
        {
          title: 'INP',
          text: 'Interaction to Next Paint: the delay from a user action to the next paint, taken over the worst interactions of a visit. Good is 200 ms or less. INP replaced FID in March 2024. Improve it by breaking up long tasks and moving work off the main thread.',
        },
        {
          title: 'CLS',
          text: 'Cumulative Layout Shift: how much content shifts unexpectedly. Good is 0.1 or less. Reserve space for images and ads (`width`, `height`, `aspect-ratio`) and do not insert content above what is already shown.',
        },
        {
          title: 'Bundles and assets',
          text: 'Route-based code splitting with `import()`, tree-shaking, dropping heavy dependencies, modern image formats (AVIF, WebP) with `srcset`, and Brotli compression.',
        },
        {
          title: 'Measuring',
          text: 'Lab data (Lighthouse, the DevTools Performance panel) helps find the cause, field data (the CrUX report, the `web-vitals` library) shows what real users experience. Start optimizing from field data.',
        },
      ],
    },
  },

  security: {
    ru: {
      intro: 'Фронтенд-разработчик отвечает за две вещи: чтобы чужой код не выполнился на странице и чтобы браузер не отправил запрос от имени пользователя без его ведома.',
      topics: [
        {
          title: 'XSS',
          text: 'Внедрение скрипта через данные пользователя. Фреймворки экранируют текст по умолчанию; опасны `innerHTML`, `dangerouslySetInnerHTML`, `v-html` и методы `bypassSecurityTrust*` в Angular. HTML от пользователя пропускают через санитайзер, например DOMPurify.',
        },
        {
          title: 'CSP',
          text: 'Content Security Policy в заголовке ответа ограничивает, откуда можно загружать и выполнять скрипты. Строгая CSP на основе nonce или хэшей блокирует большинство XSS, даже если в коде есть ошибка.',
        },
        {
          title: 'CSRF',
          text: 'Чужой сайт заставляет браузер отправить запрос с cookie пользователя. Защищаются атрибутом `SameSite` у cookie, CSRF-токенами и проверкой заголовка `Origin` на сервере.',
        },
        {
          title: 'Хранение токенов',
          text: 'Токен в `localStorage` прочитает любой внедрённый скрипт. Сессию надёжнее держать в cookie с `HttpOnly`, `Secure` и `SameSite`, а короткоживущий access-токен хранить в памяти страницы.',
        },
        {
          title: 'Зависимости',
          text: 'Пакеты из npm выполняются с правами вашего кода. Фиксируйте версии lock-файлом, проверяйте уязвимости (`npm audit`) и подключайте скрипты со сторонних CDN с атрибутом `integrity` (Subresource Integrity).',
        },
      ],
    },
    en: {
      intro: 'A frontend developer is responsible for two things: foreign code must not run on the page, and the browser must not send requests on the user’s behalf without their knowledge.',
      topics: [
        {
          title: 'XSS',
          text: 'Script injection through user data. Frameworks escape text by default; the danger is `innerHTML`, `dangerouslySetInnerHTML`, `v-html` and Angular’s `bypassSecurityTrust*` methods. Run user-provided HTML through a sanitizer such as DOMPurify.',
        },
        {
          title: 'CSP',
          text: 'A Content Security Policy response header restricts where scripts may be loaded and executed from. A strict nonce- or hash-based CSP blocks most XSS even when the code has a bug.',
        },
        {
          title: 'CSRF',
          text: 'Another site makes the browser send a request with the user’s cookies. Defend with the cookie `SameSite` attribute, CSRF tokens and server-side `Origin` header checks.',
        },
        {
          title: 'Token storage',
          text: 'A token in `localStorage` can be read by any injected script. Keep the session in a cookie with `HttpOnly`, `Secure` and `SameSite`, and hold a short-lived access token in page memory.',
        },
        {
          title: 'Dependencies',
          text: 'npm packages run with your code’s privileges. Pin versions with a lock file, check for vulnerabilities (`npm audit`) and load third-party CDN scripts with an `integrity` attribute (Subresource Integrity).',
        },
      ],
    },
  },

  testing: {
    ru: {
      intro: 'Хорошие тесты проверяют поведение, которое видит пользователь, а не детали реализации, поэтому переживают рефакторинг.',
      topics: [
        {
          title: 'Уровни тестов',
          text: 'Быстрые unit-тесты на логику, компонентные и интеграционные тесты на связку частей и немного end-to-end на ключевые сценарии. Чем выше уровень, тем медленнее и дороже тест, но тем больше уверенности он даёт.',
        },
        {
          title: 'Unit-тесты',
          text: 'Vitest использует конфигурацию Vite и совместим с API Jest: `describe`, `it`, `expect`, моки через `vi.fn()` и управляемое время через `vi.useFakeTimers()`.',
        },
        {
          title: 'Компоненты',
          text: 'Testing Library ищет элементы так, как их находит пользователь: по роли и доступному имени (`getByRole("button", { name: "Сохранить" })`), а не по классам. Библиотека `user-event` воспроизводит реальные действия: клики, ввод, Tab.',
        },
        {
          title: 'End-to-end',
          text: 'Playwright запускает настоящие браузеры (Chromium, Firefox, WebKit), сам дожидается появления элементов и умеет перехватывать сетевые запросы.',
        },
        {
          title: 'Моки сети',
          text: 'MSW (Mock Service Worker) перехватывает запросы на сетевом уровне, поэтому одни и те же моки работают в тестах, в Storybook и при разработке.',
        },
      ],
    },
    en: {
      intro: 'Good tests check behavior the user can see rather than implementation details, so they survive refactoring.',
      topics: [
        {
          title: 'Test levels',
          text: 'Fast unit tests for logic, component and integration tests for how parts fit together, and a few end-to-end tests for key flows. The higher the level, the slower and costlier the test, but the more confidence it gives.',
        },
        {
          title: 'Unit tests',
          text: 'Vitest reuses your Vite config and is compatible with the Jest API: `describe`, `it`, `expect`, mocks via `vi.fn()` and controlled time via `vi.useFakeTimers()`.',
        },
        {
          title: 'Components',
          text: 'Testing Library finds elements the way users do: by role and accessible name (`getByRole("button", { name: "Save" })`), not by class names. `user-event` reproduces real actions: clicks, typing, Tab.',
        },
        {
          title: 'End-to-end',
          text: 'Playwright drives real browsers (Chromium, Firefox, WebKit), waits for elements automatically and can intercept network requests.',
        },
        {
          title: 'Network mocks',
          text: 'MSW (Mock Service Worker) intercepts requests at the network level, so the same mocks work in tests, in Storybook and during development.',
        },
      ],
    },
  },

  tooling: {
    ru: {
      intro: 'Инструменты сборки определяют, как быстро вы разрабатываете и сколько кода получает пользователь.',
      topics: [
        {
          title: 'Vite',
          text: 'В режиме разработки Vite отдаёт исходники браузеру как нативные ES-модули и не собирает бандл, поэтому сервер стартует мгновенно. Для продакшена код собирает бандлер (Rollup, в новых версиях Rolldown).',
        },
        {
          title: 'Бандлинг и tree-shaking',
          text: 'Бандлер объединяет модули в чанки, удаляет неиспользуемые экспорты и выносит в отдельные файлы код, загружаемый через динамический `import()`. Поле `sideEffects` в `package.json` сообщает, какие файлы можно выбрасывать целиком.',
        },
        {
          title: 'Монорепозитории',
          text: 'Nx и Turborepo строят граф зависимостей между пакетами, кэшируют результаты задач и запускают только то, что затронуто изменением (`nx affected`). Общий UI-кит и типы живут рядом с приложениями и меняются в одном коммите.',
        },
        {
          title: 'Микрофронтенды',
          text: 'Приложение делят на части, которые разные команды собирают и выкатывают независимо (Module Federation, single-spa). Цена: сложная интеграция, риск загрузить одну библиотеку несколько раз и разнородный интерфейс. Подход оправдан, когда над одним продуктом работают несколько команд.',
        },
        {
          title: 'Качество кода',
          text: 'TypeScript, линтер (ESLint, oxlint, Biome), автоформатирование и проверки в CI на каждый pull request ловят ошибки до ревью.',
        },
      ],
    },
    en: {
      intro: 'Build tools decide how fast you develop and how much code users download.',
      topics: [
        {
          title: 'Vite',
          text: 'In development Vite serves sources to the browser as native ES modules without bundling, so the server starts instantly. For production a bundler builds the code (Rollup, Rolldown in newer versions).',
        },
        {
          title: 'Bundling and tree-shaking',
          text: 'A bundler combines modules into chunks, drops unused exports and splits code loaded via dynamic `import()` into separate files. The `sideEffects` field in `package.json` tells it which files can be dropped entirely.',
        },
        {
          title: 'Monorepos',
          text: 'Nx and Turborepo build a dependency graph between packages, cache task results and run only what a change affects (`nx affected`). A shared UI kit and types live next to the apps and change in one commit.',
        },
        {
          title: 'Micro-frontends',
          text: 'The app is split into parts that different teams build and ship independently (Module Federation, single-spa). The cost: complex integration, the risk of loading one library several times, and inconsistent UI. Worth it when several teams work on one product.',
        },
        {
          title: 'Code quality',
          text: 'TypeScript, a linter (ESLint, oxlint, Biome), auto-formatting and CI checks on every pull request catch mistakes before review.',
        },
      ],
    },
  },

  'system-design': {
    ru: {
      intro: 'На frontend system design просят спроектировать интерфейс вроде ленты новостей, автодополнения или чата. Удобная структура ответа называется RADIO, по первым буквам этапов.',
      topics: [
        {
          title: 'Requirements: требования',
          text: 'Уточните функции, объём данных, устройства, офлайн-режим, доступность, языки и важные метрики. Ответы меняют архитектуру: список на 100 и на 100 000 строк требует разных решений.',
        },
        {
          title: 'Architecture: архитектура',
          text: 'Нарисуйте компоненты интерфейса, слой данных и сервер. Объясните, где рендерится страница и как данные идут от API до экрана и обратно при действиях пользователя.',
        },
        {
          title: 'Data model: модель данных',
          text: 'Разделите серверное, клиентское, URL- и производное состояние. Решите, что нормализовать, что кэшировать и где это хранить.',
        },
        {
          title: 'Interface: API',
          text: 'Опишите эндпоинты и формат ответов, пагинацию (курсорную или по смещению), способ получать обновления (опрос, SSE, WebSocket) и публичный API компонентов.',
        },
        {
          title: 'Optimizations: оптимизации',
          text: 'Производительность (виртуализация длинных списков, разделение кода, кэш), сеть (debounce, отмена устаревших запросов, предзагрузка), доступность, состояния загрузки, ошибки и пустого экрана, безопасность.',
        },
      ],
    },
    en: {
      intro: 'In frontend system design you are asked to design a UI such as a news feed, autocomplete or chat. A handy answer structure is RADIO, named after the first letters of its steps.',
      topics: [
        {
          title: 'Requirements',
          text: 'Clarify features, data volume, devices, offline support, accessibility, languages and key metrics. The answers change the architecture: a list of 100 rows and one of 100,000 need different solutions.',
        },
        {
          title: 'Architecture',
          text: 'Draw the UI components, the data layer and the server. Explain where the page is rendered and how data flows from the API to the screen and back on user actions.',
        },
        {
          title: 'Data model',
          text: 'Separate server, client, URL and derived state. Decide what to normalize, what to cache and where it lives.',
        },
        {
          title: 'Interface (API)',
          text: 'Describe endpoints and response shapes, pagination (cursor or offset), how updates arrive (polling, SSE, WebSocket), and the public API of your components.',
        },
        {
          title: 'Optimizations',
          text: 'Performance (virtualizing long lists, code splitting, caching), network (debounce, cancelling stale requests, prefetching), accessibility, loading, error and empty states, security.',
        },
      ],
    },
  },
}
