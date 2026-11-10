# Аудит заметок: HTML и доступность

Источник: страница Notion «HTML», прочитана целиком: Semantic HTML, Form Validation, Form Submission, Data attributes, ARIA roles, states & properties. Ещё три раздела страницы пустые. Ошибки о фокусе, landmark-ролях, `aria-hidden` и скринридерах со страницы «Browser» записаны в `browser.md` с пометкой `html` и исправлены в уроках этого трека.

Утверждения уроков сверены с HTML Living Standard, WCAG 2.2, WAI-ARIA 1.2, ARIA in HTML, ARIA Authoring Practices Guide и MDN. Примеры выполняются в jsdom. Роли и доступные имена считает библиотека `dom-accessibility-api` (на ней работает `getByRole` в Testing Library). Где она расходится с браузерами, пример убран, а в тексте есть пометка: она не знает `<search>`, считает `<header>` внутри `<article>` областью `banner` и не берёт `placeholder` запасным именем. Поведение `tabIndex` у `<a>` без `href` проверено в Chrome.

## Найденные ошибки

| Раздел | В заметках | На самом деле | Источник |
|---|---|---|---|
| Form Validation | У `type="tel"` есть «встроенная валидация по типу» | `tel` меняет только клавиатуру; формат не проверяется без `pattern` | [MDN: input type=tel](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/tel), проверено в jsdom |
| Form Submission | У `GET` «лимит ~2000 символов» | Это ограничение старого Internet Explorer; современные браузеры принимают намного более длинные адреса, ограничивают обычно серверы и прокси | [RFC 9110, 4.1](https://www.rfc-editor.org/rfc/rfc9110#section-4.1) |
| Form Submission | `POST` «без лимита» | Размер тела ограничивает сервер (и CDN); браузер лимита не задаёт | там же |
| Form Validation | Сообщение `required`: «Please fill out this field» | Текст и вид сообщений зависят от браузера и языка; для своих сообщений `setCustomValidity` или `novalidate` и свой вывод | [MDN: Client-side form validation](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation) |
| Data attributes | Для больших данных «лучше localStorage» | `dataset` хранит строки для DOM-логики; данные приложения держат в состоянии JS, а не в атрибутах или `localStorage` | [MDN: Using data attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/How_to/Use_data_attributes) |
| ARIA | Ссылки на WAI-ARIA 1.0 | Актуальна WAI-ARIA 1.2 (1.3 в работе) | [W3C: WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria-1.2/) |
| ARIA | `<form role="search">` как способ разметить поиск | Есть элемент `<search>` с ролью `search`, поддерживается всеми браузерами с 2023 года | [MDN: search](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/search) |
| ARIA | `aria-busy` в группе виджет-атрибутов | Это глобальный атрибут, чаще всего для живых областей и загружающихся блоков | [W3C: aria-busy](https://www.w3.org/TR/wai-aria-1.2/#aria-busy) |
| ARIA | Панель аккордеона `role="region"` без оговорок | `region` нужно доступное имя (`aria-labelledby` на заголовок), и при множестве панелей его часто опускают, чтобы не засорять список областей | [W3C APG: Accordion](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/) |
| Semantic HTML | «Семантика не влияет на рендеринг, только на интерпретацию» | У части элементов есть стили по умолчанию и поведение: `<button>` фокусируется и отправляет форму, `<details>` раскрывается, `<dialog>` открывается в верхнем слое | [HTML: The button element](https://html.spec.whatwg.org/multipage/form-elements.html#the-button-element) |

## Пробелы, закрытые в уроках

- Три пустых раздела страницы и отсутствующие темы: доступное имя, `alt`, клавиатура и фокус, `:focus-visible`, skip link, контраст и размер целей, `prefers-reduced-motion`, `lang`, WCAG 2.2 и European Accessibility Act.
- Кнопка против ссылки, `<button>` в форме по умолчанию `submit`, ссылка без `href`.
- Заголовки и отсутствие алгоритма outline (удалён из стандарта в 2022).
- `<label>`, `fieldset`, `autocomplete`, `inputmode`, `:user-invalid`, поля без `name` и `disabled` в `FormData`, перехват `submit`.
- Первое правило ARIA, паттерны APG и roving tabindex, живые области, `aria-hidden` против `inert`.
- `<dialog>` и `showModal`, `method="dialog"`, Popover API, `<details name>`, что нужно своему модальному окну.
- Адаптивные изображения, AVIF и WebP, атрибуты загрузки, обязательный `<head>`, Open Graph, техническое SEO.
