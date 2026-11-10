import type { Source } from '../sources'
import type { Lesson, Module } from './types'

const mdn = (title: string, path: string): Source => ({ title: `MDN: ${title}`, url: `https://developer.mozilla.org/en-US/docs/${path}`, kind: 'official' })
const w3 = (title: string, url: string): Source => ({ title, url, kind: 'spec' })
const verified = { date: '2026-11', version: 'HTML Living Standard, WCAG 2.2, WAI-ARIA 1.2' }

export const htmlLessons: Lesson[] = [
  {
    id: 'html-semantics',
    track: 'html',
    emoji: '🏷️',
    minutes: 10,
    title: { ru: 'Семантическая разметка', en: 'Semantic markup' },
    summary: {
      ru: 'Неявные роли и области страницы, кнопка против ссылки, заголовки без алгоритма outline, полезные элементы.',
      en: 'Implicit roles and page regions, button versus link, headings without an outline algorithm, useful elements.',
    },
    quiz: {
      ru: [
        { q: 'Когда `<header>` становится областью `banner`?', options: ['Всегда, в каком бы месте страницы он ни стоял', 'Когда относится ко всей странице, а не к блоку', 'Только с явным атрибутом `role="banner"`', 'Только если внутри есть `<nav>` и логотип'], correct: 1, why: 'Внутри `article`, `section`, `aside` это шапка блока без роли области, и таких может быть много.' },
        { q: 'Что сломается, если сделать кнопку из `<div onclick>`?', options: ['Ничего, если задать элементу стили кнопки', 'Фокус с клавиатуры, Enter и пробел, роль кнопки', 'Только внешний вид при наведении курсора', 'Только отправка формы по клавише Enter'], correct: 1, why: 'Нативная кнопка фокусируется, нажимается с клавиатуры и озвучивается как кнопка. Для `div` всё это пришлось бы писать вручную.' },
        { q: 'Как браузер определяет уровень заголовка `<h1>` внутри вложенной `<section>`?', options: ['По глубине вложенности секций', 'Только по цифре в теге', 'По размеру шрифта в CSS', 'По атрибуту `aria-level` у секции'], correct: 1, why: 'Алгоритм outline не реализовал ни один браузер, и его убрали из стандарта: уровень задаёт только тег.' },
        { q: 'Что сделает кнопка «Отмена» без атрибута `type` внутри формы?', options: ['Ничего, тип по умолчанию `button`', 'Отправит форму: тип по умолчанию `submit`', 'Очистит поля: тип по умолчанию `reset`', 'Закроет вкладку браузера'], correct: 1, why: 'У `<button>` в форме тип по умолчанию `submit`. Для кнопок без отправки пишут `type="button"`.' },
      ],
      en: [
        { q: 'When does `<header>` become a `banner` region?', options: ['Always, wherever it appears on the page', 'When it belongs to the whole page, not a block', 'Only with an explicit `role="banner"`', 'Only if it contains a `<nav>` and a logo'], correct: 1, why: 'Inside `article`, `section` or `aside` it is a block header without a region role, and there can be many.' },
        { q: 'What breaks if a button is made from a `<div onclick>`?', options: ['Nothing, as long as it has button styles', 'Keyboard focus, Enter and Space, the button role', 'Only the appearance when the mouse hovers', 'Only submitting the form with Enter'], correct: 1, why: 'A native button is focusable, pressable from the keyboard and announced as a button. For a `div` all of that would be hand-written.' },
        { q: 'How does the browser determine the level of an `<h1>` inside a nested `<section>`?', options: ['By how deeply sections are nested', 'Only by the number in the tag', 'By the font size set in CSS', 'By an `aria-level` on the section'], correct: 1, why: 'No browser implemented the outline algorithm and it was removed from the standard: only the tag sets the level.' },
        { q: 'What does a "Cancel" button without a `type` attribute do inside a form?', options: ['Nothing, the default type is `button`', 'Submits the form: the default type is `submit`', 'Clears the fields: the default type is `reset`', 'Closes the current browser tab'], correct: 1, why: 'A `<button>` in a form defaults to `submit`. Buttons that must not submit use `type="button"`.' },
      ],
    },
    sources: [
      mdn('HTML elements reference', 'Web/HTML/Reference/Elements'),
      mdn('ARIA: landmark roles', 'Web/Accessibility/ARIA/Reference/Roles#3._landmark_roles'),
      mdn('<search>', 'Web/HTML/Reference/Elements/search'),
      mdn('Heading elements', 'Web/HTML/Reference/Elements/Heading_Elements'),
      w3('W3C: ARIA in HTML, implicit roles', 'https://www.w3.org/TR/html-aria/'),
    ],
    verified,
  },
  {
    id: 'html-forms',
    track: 'html',
    emoji: '📝',
    minutes: 12,
    title: { ru: 'Формы и валидация', en: 'Forms and validation' },
    summary: {
      ru: 'Подписи и autocomplete, типы полей, Constraint Validation API, setCustomValidity, отправка и FormData.',
      en: 'Labels and autocomplete, input types, the Constraint Validation API, setCustomValidity, submission and FormData.',
    },
    quiz: {
      ru: [
        { q: 'Что проверяет браузер у поля `type="tel"` без `pattern`?', options: ['Что введены только цифры и пробелы', 'Ничего: формат телефона не проверяется', 'Международный формат номера с плюсом', 'Длину номера от 10 до 15 символов'], correct: 1, why: '`tel` меняет только клавиатуру на телефоне. Формат проверяют через `pattern` или свой код.' },
        { q: 'Какие поля попадут в `new FormData(form)`?', options: ['Все поля формы, включая отключённые', 'Поля с `name`, не `disabled`, отмеченные чекбоксы', 'Только поля с атрибутом `required` в форме', 'Только поля, которые пользователь менял'], correct: 1, why: 'Поле без `name` и отключённое поле не отправляются, а неотмеченный чекбокс в данных отсутствует.' },
        { q: 'Как пометить поле неверным по своему правилу, например «логин занят»?', options: ['Добавить класс `invalid` на поле', '`input.setCustomValidity("Login is taken")`', 'Записать текст в `input.validationMessage`', 'Вызвать `input.validity.valid = false`'], correct: 1, why: 'Непустое сообщение делает поле неверным, пустая строка снимает ошибку. Свойства `validity` только для чтения.' },
        { q: 'Почему отправку перехватывают на событии `submit` формы, а не на клике кнопки?', options: ['Клик срабатывает слишком поздно', 'Enter в поле тоже отправляет форму, минуя клик', 'Событие `click` у кнопок отменить нельзя', 'Так браузер пропускает встроенную проверку'], correct: 1, why: 'Отправка Enter из текстового поля вызывает `submit`, и обработчик клика его пропустит.' },
      ],
      en: [
        { q: 'What does the browser check on a `type="tel"` field without `pattern`?', options: ['That only digits are entered', 'Nothing: the phone format is not checked', 'The international format with a plus', 'A length between 10 and 15 characters'], correct: 1, why: '`tel` only changes the phone keyboard. The format is checked with `pattern` or your own code.' },
        { q: 'Which fields end up in `new FormData(form)`?', options: ['Every field of the form, disabled ones included', 'Fields with a `name`, not `disabled`, checked checkboxes', 'Only fields with the `required` attribute', 'Only the fields the user has actually changed'], correct: 1, why: 'A field without a `name` and a disabled field are not sent, and an unchecked checkbox is absent from the data.' },
        { q: 'How do you mark a field invalid by your own rule, such as "login is taken"?', options: ['Add an `invalid` class to the field', '`input.setCustomValidity("Login is taken")`', 'Write the text into `input.validationMessage`', 'Set `input.validity.valid = false`'], correct: 1, why: 'A non-empty message makes the field invalid, an empty string clears the error. The `validity` properties are read-only.' },
        { q: "Why handle submission on the form's `submit` event rather than the button's click?", options: ['The click fires too late for `fetch` to start', 'Enter in a field submits the form without a click', 'Button `click` events cannot be cancelled', 'That way the browser skips its built-in checks'], correct: 1, why: 'Submitting with Enter from a text field fires `submit`, and a click handler would miss it.' },
      ],
    },
    sources: [
      mdn('Client-side form validation', 'Learn_web_development/Extensions/Forms/Form_validation'),
      mdn('Constraint validation', 'Web/HTML/Guides/Constraint_validation'),
      mdn('HTMLInputElement.setCustomValidity()', 'Web/API/HTMLInputElement/setCustomValidity'),
      mdn('HTML attribute: autocomplete', 'Web/HTML/Reference/Attributes/autocomplete'),
      mdn('FormData', 'Web/API/FormData'),
      mdn(':user-invalid', 'Web/CSS/Reference/Selectors/:user-invalid'),
    ],
    verified,
  },
  {
    id: 'html-a11y',
    track: 'html',
    emoji: '♿',
    minutes: 12,
    title: { ru: 'Основы доступности', en: 'Accessibility basics' },
    summary: {
      ru: 'WCAG 2.2, доступное имя, alt, клавиатура и видимый фокус, контраст, движение, язык страницы, как проверять.',
      en: 'WCAG 2.2, accessible names, alt text, keyboard and visible focus, contrast, motion, page language, how to test.',
    },
    quiz: {
      ru: [
        { q: 'Какое доступное имя у `<button><svg aria-hidden="true">…</svg></button>`?', options: ['Имя файла иконки из атрибута `src`', 'Пустое: скринридер скажет просто «кнопка»', 'Текст `button` из названия тега', 'Содержимое атрибута `class` кнопки'], correct: 1, why: 'Иконка скрыта, текста нет. Нужен `aria-label` или визуально скрытый текст.' },
        { q: 'Какой `alt` у декоративной картинки?', options: ['Атрибут не нужен совсем', '`alt=""`: пустой, но присутствующий', '`alt="decoration"` для ясности', '`alt` с именем файла картинки'], correct: 1, why: 'Пустой `alt` говорит скринридеру пропустить картинку. Без атрибута он может прочитать имя файла.' },
        { q: 'Что делает `tabindex="0"`?', options: ['Ставит элемент первым в порядке Tab', 'Добавляет элемент в порядок Tab по месту в DOM', 'Убирает элемент из порядка обхода Tab', 'Делает элемент недоступным для клика'], correct: 1, why: '`0` включает элемент в общий порядок по DOM, `-1` разрешает только программный фокус, положительные значения не используют.' },
        { q: 'Какой минимальный контраст обычного текста по WCAG AA?', options: ['3:1', '4,5:1', '7:1', '2:1'], correct: 1, why: '4,5:1 для обычного текста, 3:1 для крупного текста и элементов управления; 7:1 это уровень AAA.' },
      ],
      en: [
        { q: 'What is the accessible name of `<button><svg aria-hidden="true">…</svg></button>`?', options: ["The icon's file name from `src`", 'Empty: the screen reader just says "button"', 'The word `button` from the tag name', 'The contents of the `class` attribute'], correct: 1, why: 'The icon is hidden and there is no text. An `aria-label` or visually hidden text is needed.' },
        { q: 'What `alt` does a decorative image get?', options: ['No attribute at all', '`alt=""`: empty but present', '`alt="decoration"` for clarity', 'An `alt` with the image file name'], correct: 1, why: 'An empty `alt` tells the screen reader to skip the image. Without the attribute it may read the file name.' },
        { q: 'What does `tabindex="0"` do?', options: ['Puts the element first in the Tab order', 'Adds it to the Tab order at its DOM position', 'Removes the element from the Tab order', 'Makes the element impossible to click'], correct: 1, why: '`0` includes the element in the common DOM order, `-1` allows only focusing from code, positive values are not used.' },
        { q: 'What is the minimum contrast for normal text under WCAG AA?', options: ['3:1', '4.5:1', '7:1', '2:1'], correct: 1, why: '4.5:1 for normal text, 3:1 for large text and controls; 7:1 is level AAA.' },
      ],
    },
    sources: [
      w3('W3C: WCAG 2.2', 'https://www.w3.org/TR/WCAG22/'),
      w3("W3C WAI: What's new in WCAG 2.2", 'https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/'),
      mdn('Accessible name', 'Glossary/Accessible_name'),
      mdn('Understanding WCAG: color contrast', 'Web/Accessibility/Guides/Understanding_WCAG/Perceivable/Color_contrast'),
      mdn(':focus-visible', 'Web/CSS/Reference/Selectors/:focus-visible'),
      { title: 'Testing Library: ByRole', url: 'https://testing-library.com/docs/queries/byrole/', kind: 'official' },
    ],
    verified,
  },
  {
    id: 'html-aria',
    track: 'html',
    emoji: '🗣️',
    minutes: 12,
    title: { ru: 'ARIA', en: 'ARIA' },
    summary: {
      ru: 'Первое правило ARIA, роли, состояния и свойства, паттерны APG, живые области, ловушки aria-hidden и inert.',
      en: 'The first rule of ARIA, roles, states and properties, APG patterns, live regions, aria-hidden traps and inert.',
    },
    quiz: {
      ru: [
        { q: 'Что добавляет `role="button"` элементу `<div>`?', options: ['Фокус с клавиатуры и нажатие Enter', 'Только сообщение скринридеру, что это кнопка', 'Стили кнопки браузера по умолчанию', 'Отправку формы по клику на элемент'], correct: 1, why: 'ARIA не меняет поведение: фокус и обработку клавиш придётся писать самому. Проще взять `<button>`.' },
        { q: 'Кнопка открыла меню. Что нужно обновить?', options: ['`aria-label` кнопки на «Закрыть»', '`aria-expanded="true"` на кнопке', '`role="menu"` на самой кнопке', 'Ничего, скринридер поймёт сам'], correct: 1, why: 'Состояние должно совпадать с реальностью; синхронизирует его ваш код.' },
        { q: 'Почему сообщение в живой области иногда не озвучивается?', options: ['Живые области работают только в Chrome', 'Контейнер добавили в DOM вместе с текстом', 'Текст сообщения длиннее 100 символов', 'У живой области не задан `tabindex`'], correct: 1, why: 'Контейнер с `role="status"` должен существовать заранее: скринридер следит за изменениями уже известной области.' },
        { q: 'Чем `inert` отличается от `aria-hidden="true"`?', options: ['Ничем, это два синонима одного', '`inert` убирает и из фокуса, и из кликов', '`inert` скрывает элемент визуально', '`aria-hidden` блокирует клавиатуру'], correct: 1, why: '`aria-hidden` прячет только от дерева доступности, Tab по-прежнему попадёт внутрь. `inert` отключает блок целиком.' },
      ],
      en: [
        { q: 'What does `role="button"` add to a `<div>`?', options: ['Keyboard focus and pressing with Enter', 'Only telling the screen reader it is a button', "The browser's default button styles", 'Submitting the form when it is clicked'], correct: 1, why: 'ARIA does not change behaviour: focus and key handling must be written by hand. A `<button>` is simpler.' },
        { q: 'A button opened a menu. What must be updated?', options: ["The button's `aria-label`", '`aria-expanded="true"` on the button', '`role="menu"` on the button', 'Nothing, the screen reader figures it out'], correct: 1, why: 'The state must match reality; your code keeps it in sync.' },
        { q: 'Why is a live region message sometimes not announced?', options: ['Live regions work only in Chrome', 'The container was added together with the text', 'The text is longer than 100 characters', 'The live region has no `tabindex` set'], correct: 1, why: 'A `role="status"` container must exist in advance: the screen reader watches changes in a region it already knows.' },
        { q: 'How does `inert` differ from `aria-hidden="true"`?', options: ['No difference, they are synonyms', '`inert` also removes it from focus and clicks', '`inert` hides the element visually too', '`aria-hidden` blocks the keyboard as well'], correct: 1, why: '`aria-hidden` hides only from the accessibility tree; Tab still gets inside. `inert` disables the whole block.' },
      ],
    },
    sources: [
      w3('W3C: WAI-ARIA 1.2', 'https://www.w3.org/TR/wai-aria-1.2/'),
      w3('W3C WAI: ARIA Authoring Practices Guide', 'https://www.w3.org/WAI/ARIA/apg/'),
      mdn('ARIA live regions', 'Web/Accessibility/ARIA/Guides/Live_regions'),
      mdn('aria-hidden', 'Web/Accessibility/ARIA/Reference/Attributes/aria-hidden'),
      mdn('HTML attribute: inert', 'Web/HTML/Reference/Global_attributes/inert'),
    ],
    verified,
  },
  {
    id: 'html-dialogs',
    track: 'html',
    emoji: '🪟',
    minutes: 10,
    title: { ru: 'Диалоги, поповеры и фокус', en: 'Dialogs, popovers and focus' },
    summary: {
      ru: 'dialog и showModal, Popover API, inert, details с name, что нужно своему модальному окну.',
      en: 'dialog and showModal, the Popover API, inert, details with name, what a custom modal needs.',
    },
    quiz: {
      ru: [
        { q: 'Что даёт `dialog.showModal()` без дополнительного кода?', options: ['Закрытие окна по клику на затемнённый фон', 'Инертный фон, Esc и возврат фокуса', 'Блокировку прокрутки страницы под окном', 'Плавную анимацию появления окна'], correct: 1, why: 'Клик по фону и блокировку прокрутки добавляют сами; верхний слой, инертность, Esc и возврат фокуса браузер даёт.' },
        { q: 'Чем `popover` отличается от модального `<dialog>`?', options: ['`popover` нельзя закрыть по Esc', 'Страница за `popover` остаётся доступной', '`popover` не попадает в верхний слой', '`popover` требует JavaScript для открытия'], correct: 1, why: 'Поповер не делает фон инертным: это меню или подсказка, а не модальное окно.' },
        { q: 'Что делает форма с `method="dialog"` внутри `<dialog>`?', options: ['Отправляет данные на сервер методом POST', 'Закрывает окно, значение кнопки в `returnValue`', 'Перезагружает страницу с параметрами формы', 'Открывает второй диалог поверх первого'], correct: 1, why: 'Такая форма не отправляется по сети, она закрывает диалог, а `value` нажатой кнопки доступно в `dialog.returnValue`.' },
        { q: 'Какой шаг чаще всего забывают в своём модальном окне?', options: ['Задать окну цвет фона и тень', 'Вернуть фокус на кнопку, открывшую окно', 'Добавить окну заголовок `<h2>`', 'Поставить окну большой `z-index`'], correct: 1, why: 'Без возврата фокус оказывается в начале страницы, и пользователь клавиатуры теряет место.' },
      ],
      en: [
        { q: 'What does `dialog.showModal()` give without extra code?', options: ['Closing when the dimmed backdrop is clicked', 'An inert background, Esc and focus return', 'Blocking the page from scrolling behind it', 'A smooth opening animation for the window'], correct: 1, why: 'Backdrop clicks and scroll locking are added by hand; the top layer, inertness, Esc and focus return come from the browser.' },
        { q: 'How does `popover` differ from a modal `<dialog>`?', options: ['A `popover` cannot be closed with Esc', 'The page behind a `popover` stays usable', 'A `popover` does not enter the top layer', 'A `popover` needs JavaScript to open'], correct: 1, why: 'A popover does not make the background inert: it is a menu or tooltip, not a modal.' },
        { q: 'What does a form with `method="dialog"` inside a `<dialog>` do?', options: ['Posts the form data to the server via POST', "Closes it; the button's value goes to `returnValue`", 'Reloads the page with the form parameters', 'Opens a second dialog on top of the first'], correct: 1, why: 'Such a form is not sent over the network; it closes the dialog, and the pressed button\'s `value` is in `dialog.returnValue`.' },
        { q: 'Which step is most often forgotten in a custom modal?', options: ['Giving the window a background and shadow', 'Returning focus to the button that opened it', 'Adding an `<h2>` heading to the window', 'Setting a large `z-index` on the window'], correct: 1, why: 'Without it focus lands at the top of the page, and keyboard users lose their place.' },
      ],
    },
    sources: [
      mdn('<dialog>', 'Web/HTML/Reference/Elements/dialog'),
      mdn('Popover API', 'Web/API/Popover_API'),
      mdn('HTML attribute: inert', 'Web/HTML/Reference/Global_attributes/inert'),
      mdn('<details>', 'Web/HTML/Reference/Elements/details'),
      w3('W3C WAI: Dialog (Modal) pattern', 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/'),
    ],
    verified,
  },
  {
    id: 'html-media-seo',
    track: 'html',
    emoji: '🖼️',
    minutes: 10,
    title: { ru: 'Изображения, head и SEO', en: 'Images, the head and SEO' },
    summary: {
      ru: 'srcset и sizes, picture и AVIF, атрибуты загрузки, обязательные мета-теги, Open Graph, техническое SEO.',
      en: 'srcset and sizes, picture and AVIF, loading attributes, essential meta tags, Open Graph, technical SEO.',
    },
    quiz: {
      ru: [
        { q: 'Зачем у картинки атрибуты `width` и `height`, если размер задан в CSS?', options: ['Без них картинка не загрузится в браузере', 'Браузер заранее резервирует место без сдвига', 'Они нужны только для старых браузеров', 'Они ускоряют декодирование картинки'], correct: 1, why: 'По атрибутам браузер знает пропорции до загрузки и не сдвигает контент, когда картинка придёт.' },
        { q: 'Для чего нужен `<picture>` с несколькими `<source>`?', options: ['Чтобы загрузить все варианты сразу', 'Чтобы отдать другой формат или кадрирование', 'Чтобы включить ленивую загрузку', 'Чтобы скрыть картинку от поисковиков'], correct: 1, why: 'Браузер возьмёт первый подходящий `source`: AVIF или WebP там, где они поддерживаются, или другое кадрирование для узкого экрана.' },
        { q: 'Что не так с `<meta name="viewport" content="width=device-width, user-scalable=no">`?', options: ['Не хватает атрибута `charset` в теге', 'Запрет масштабирования ломает доступность', 'Нужно писать `width=100%` вместо этого', 'Ничего, это рекомендуемый вариант'], correct: 1, why: 'Пользователи с плохим зрением увеличивают страницу; запрещать это нельзя.' },
        { q: 'Зачем `<link rel="canonical">`?', options: ['Подключить основные стили страницы', 'Указать основной адрес у страницы с копиями', 'Запретить индексацию копий страницы', 'Включить предзагрузку следующей страницы'], correct: 1, why: 'Поисковик объединит варианты с параметрами и разным написанием и будет показывать основной адрес.' },
      ],
      en: [
        { q: 'Why give an image `width` and `height` attributes if CSS sets its size?', options: ['Without them the image will not load at all', 'The browser reserves space and nothing shifts', 'They are needed only for old browsers', 'They speed up decoding of the image'], correct: 1, why: 'From the attributes the browser knows the proportions before loading and does not shift content when the image arrives.' },
        { q: 'What is `<picture>` with several `<source>` elements for?', options: ['To download every variant at once', 'To serve another format or crop', 'To turn on lazy loading', 'To hide the image from search engines'], correct: 1, why: 'The browser takes the first matching `source`: AVIF or WebP where supported, or another crop for narrow screens.' },
        { q: 'What is wrong with `<meta name="viewport" content="width=device-width, user-scalable=no">`?', options: ['It lacks a `charset` attribute', 'Disabling zoom breaks accessibility', 'It should use `width=100%` instead', 'Nothing, it is the recommended form'], correct: 1, why: 'Users with low vision zoom the page; forbidding that is not allowed.' },
        { q: 'What is `<link rel="canonical">` for?', options: ["To load the page's main stylesheet", 'To name the main URL of a page with copies', 'To forbid indexing the page copies', 'To enable prefetching the next page'], correct: 1, why: 'The search engine merges the variants with parameters and different spellings and shows the main address.' },
      ],
    },
    sources: [
      mdn('Responsive images', 'Web/HTML/Guides/Responsive_images'),
      mdn('<picture>', 'Web/HTML/Reference/Elements/picture'),
      mdn('Viewport meta tag', 'Web/HTML/Guides/Viewport_meta_element'),
      webdevArticle('Image performance', 'image-performance'),
      { title: 'Google Search Central: JavaScript SEO basics', url: 'https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics', kind: 'official' },
    ],
    verified,
  },
]

function webdevArticle(title: string, path: string): Source {
  return { title: `web.dev: ${title}`, url: `https://web.dev/learn/performance/${path}`, kind: 'official' }
}

export const htmlModule: Module = {
  track: 'html',
  lessons: htmlLessons.map((l) => l.id),
  exam: {
    pass: 0.75,
    questions: {
      ru: [
        { q: 'Какой элемент выбрать для действия «Удалить» на странице?', options: ['`<a href="#">`', '`<button type="button">`', '`<div onclick>`', '`<span role="link">`'], correct: 1, why: 'Действие на странице это кнопка; ссылка ведёт по адресу.' },
        { q: 'Что из этого не даёт полю доступное имя надёжно?', options: ['`<label for="id">`', 'Только `placeholder`', '`aria-labelledby` на текст', '`aria-label`'], correct: 1, why: '`placeholder` может стать запасным именем, но исчезает при вводе и озвучивается не всегда.' },
        { q: 'Поле `<input minlength="3" value="ab">` из разметки. Что вернёт `validity.tooShort` до правки пользователем?', options: ['`true`', '`false`', '`undefined`', 'Бросит ошибку'], correct: 1, why: '`minlength` проверяется только для значения, изменённого пользователем; значение из разметки не считается ошибкой.' },
        { q: 'Какая версия WCAG актуальна?', options: ['WCAG 2.0', 'WCAG 2.2', 'WCAG 1.0', 'WCAG 2.1 без изменений'], correct: 1, why: 'WCAG 2.2 вышла в 2023 году и добавила критерии о фокусе, размере целей и входе.' },
        { q: 'Где правильно применять `aria-hidden="true"`?', options: ['На кнопке, которую нужно временно отключить', 'На декоративной иконке внутри кнопки с текстом', 'На фоне под модальным окном с кнопками', 'На поле ввода с ошибкой валидации'], correct: 1, why: 'Скрывать можно только нефокусируемое; фон модалки отключают через `inert`.' },
        { q: 'Что сделает `role="tab"` без вашего кода?', options: ['Переключение вкладок стрелками', 'Сообщит скринридеру, что это вкладка', 'Связь с панелью через `aria-controls`', 'Фокус только на активной вкладке'], correct: 1, why: 'Роль только описывает элемент; клавиатуру и состояния по паттерну APG реализует код.' },
        { q: 'Как сделать аккордеон, где открыт только один пункт, без JavaScript?', options: ['Несколько `<details>` с одинаковым `name`', '`<dialog>` внутри каждого пункта', '`popover="manual"` на каждом пункте', 'Это невозможно сделать без JavaScript'], correct: 0, why: 'Атрибут `name` объединяет `<details>` в группу, где открытие одного закрывает остальные.' },
        { q: 'Что ухудшит LCP?', options: ['`fetchpriority="high"` у главной картинки', '`loading="lazy"` у главной картинки экрана', 'Атрибуты `width` и `height` у картинок', 'Формат AVIF вместо JPEG для фото'], correct: 1, why: 'Ленивая загрузка откладывает картинку первого экрана до раскладки.' },
      ],
      en: [
        { q: 'Which element fits a "Delete" action on the page?', options: ['`<a href="#">`', '`<button type="button">`', '`<div onclick>`', '`<span role="link">`'], correct: 1, why: 'An action on the page is a button; a link goes to an address.' },
        { q: 'Which of these does not reliably give a field an accessible name?', options: ['`<label for="id">`', 'Only a `placeholder`', '`aria-labelledby` pointing at text', '`aria-label`'], correct: 1, why: 'A `placeholder` may serve as a fallback name, but it disappears while typing and is not always announced.' },
        { q: 'A field `<input minlength="3" value="ab">` comes from markup. What is `validity.tooShort` before the user edits it?', options: ['`true`', '`false`', '`undefined`', 'It throws'], correct: 1, why: '`minlength` applies only to a value changed by the user; a value from the markup is not an error.' },
        { q: 'Which WCAG version is current?', options: ['WCAG 2.0', 'WCAG 2.2', 'WCAG 1.0', 'WCAG 2.1 unchanged'], correct: 1, why: 'WCAG 2.2 came out in 2023 and added criteria on focus, target size and authentication.' },
        { q: 'Where is `aria-hidden="true"` used correctly?', options: ['On a button that must be disabled for now', 'On a decorative icon inside a button with text', 'On the background behind a modal with buttons', 'On an input field with an error'], correct: 1, why: 'Only non-focusable things may be hidden; the background behind a modal is disabled with `inert`.' },
        { q: 'What does `role="tab"` do without your code?', options: ['Switching tabs with the arrow keys', 'Tells the screen reader it is a tab', 'Links to the panel via `aria-controls`', 'Focus only on the active tab'], correct: 1, why: 'A role only describes the element; keyboard support and states per the APG pattern are implemented in code.' },
        { q: 'How do you build an accordion with only one open item without JavaScript?', options: ['Several `<details>` with the same `name`', 'A `<dialog>` in every item', '`popover="manual"` on every item', 'It is impossible without JavaScript'], correct: 0, why: 'The `name` attribute groups `<details>` so that opening one closes the others.' },
        { q: 'What will hurt LCP?', options: ['`fetchpriority="high"` on the main image', '`loading="lazy"` on the main first-screen image', 'The `width` and `height` attributes on images', 'AVIF instead of JPEG for the hero photo'], correct: 1, why: 'Lazy loading postpones the first-screen image until layout.' },
      ],
    },
  },
}
