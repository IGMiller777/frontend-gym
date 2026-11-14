# Аудит заметок: frontend system design

Источники в Notion: страница «System Design» (прочитана целиком: таблица RADIO, разделы R, A, D, I, O на примере Wise, «Технологический стек», «Шпаргалка», формат «UI State & Schema Design» на 60 минут, «Optimizations Topics» (сеть, ресурсы, данные, бандл, работа, память, отрисовка, UX), «Accessibility» (навигация, семантика, зрение, медиа), примеры Netflix и AutoComplete (только картинки), «План интервью», корзины состояния, тренировочные задачи «Todo»), раздел «Architecture» и «Monorepo vs polyrepo» (разобраны в `tooling.md`), страница «MicroFrontends» (там же).

Второй опорный источник по просьбе пользователя: [Front End System Design Playbook](https://www.greatfrontend.com/front-end-system-design-playbook) от GreatFrontEnd. Прочитаны все шесть статей (введение, виды задач, RADIO, критерии оценки, частые ошибки, шпаргалка) и два открытых разбора (News Feed, Autocomplete). Это статьи, а не официальная документация: в уроках они идут источником вида `article`, а технические утверждения из них сверены с ARIA APG, WCAG 2.2, MDN, web.dev и документацией библиотек. Текст плейбука пересказан своими словами, таблицы составлены заново. Сайт закрыт проверкой Vercel от ботов, поэтому `check:links` помечает его ссылки как проверяемые вручную.

Примеры выполняются в CI в Node.js: нормализация ленты, пагинация по смещению и по курсору, контроллер автодополнения с гонкой ответов и LRU-кэшем, раскладка masonry, очередь действий без сети с ключами идемпотентности.

## Найденные ошибки

Ошибки страницы System Design, уже записанные в других аудитах: FID вместо INP и Differential Serving (`performance.md`), ISR «по таймеру» и «CSR плохой SEO» (`rendering.md`), Recoil и значения `staleTime` и `gcTime` (`state.md`), кэш GraphQL (`api.md`), react-window (`react.md`).

| Где | В заметках | На самом деле | Источник |
|---|---|---|---|
| R, Optimizations | «WCAG 2.1 AA» как стандарт доступности | Текущая рекомендация W3C это WCAG 2.2 (октябрь 2023). Для соответствия закону в ЕС 2.1 остаётся актуальной: директива о доступности сайтов и European Accessibility Act опираются на стандарт EN 301 549, который включает WCAG 2.1 AA | [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [W3C WAI: EU policies](https://www.w3.org/WAI/policies/european-union/) |
| Wireframe critique | «Touch targets ≥ 44×44px» как требование | В WCAG 2.2 уровень AA требует цель не меньше 24×24 CSS-пикселя или достаточный отступ (2.5.8); 44×44 это уровень AAA (2.5.5) и рекомендации платформ | [Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) |
| UI State & Schema Design | «Правило 3-х кликов» для навигации | Исследования правило не подтверждают: пользователи не бросают задачу после третьего клика, если путь понятен | [NN/g: The 3-Click Rule for Navigation Is False](https://www.nngroup.com/articles/3-click-rule/) |
| Accessibility, Text Resizing | «Используем `rem` вместо `px`», чтобы интерфейс не ломался при зуме 200 % | Масштаб страницы в браузере увеличивает и пиксели. `rem` нужен, чтобы учитывать размер шрифта, заданный в настройках браузера; критерий 1.4.4 требует увеличения текста до 200 % без потери содержимого | [Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html) |
| Accessibility, Focus Management | Решение: самописная ловушка фокуса в модальном окне | `<dialog>` с `showModal()` сам делает остальную страницу недоступной (inert); самописная ловушка нужна только для нестандартных окон | [ARIA APG: Dialog (Modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), [MDN: dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog) |
| Optimizations, Protocols | HTTP/3 поверх UDP «критичен для видео: нет блокировки при потере пакетов» | QUIC убирает блокировку между потоками одного соединения: потеря пакета одного потока не задерживает другие. Внутри одного потока потерянные данные всё равно ждут повторной отправки | [RFC 9000](https://www.rfc-editor.org/rfc/rfc9000.html) |
| Optimizations, Memoization | `useMemo`, `useCallback`, `React.memo` как основной инструмент против лишних рендеров | С React Compiler 1.0 (октябрь 2025) мемоизацию расставляет компилятор; вручную мемоизируют по результатам профилирования | [React Compiler v1.0](https://react.dev/blog/2025/10/07/react-compiler-1) |

## Покрытие заметок Notion

| Тема в заметках | Где разобрано |
|---|---|
| RADIO: таблица и разделы R, A, D, I, O | `sd-radio`; R, D и I подробно в `sd-data-model`, `sd-news-feed`, `sd-autocomplete` |
| Требования: устройства, объём данных, авторизация, i18n, производительность | `sd-radio#R: требования`, `sd-interview#Уточнение` |
| Архитектура: CSR, SSR, SSG, ISR; микрофронтенды; монорепозиторий; дизайн-система | `sd-radio#A: архитектура`, `sd-news-feed#A: архитектура`; подробно в треках `rendering` и `tooling` |
| Data model: server, client UI, URL state, нормализация `byId` и `allIds` | `sd-data-model` |
| Interface: REST, GraphQL, tRPC, пропсы и compound components, WebSocket и SSE | `sd-radio#I: интерфейсы`; подробно в треке `api` |
| Optimizations: code splitting, виртуализация, Web Workers, три уровня кэша, доступность, состояния ошибок | `sd-optimizations` |
| Технологический стек и как обосновывать выбор | `sd-intro#Частые ошибки` (когда фреймворк уместен), `sd-radio#O` |
| UI State & Schema Design на 60 минут, три линзы разбора макета | `sd-interview` |
| Optimizations Topics: сеть, ресурсы, данные, бандл, работа, память, отрисовка, UX | `sd-optimizations` |
| Accessibility: навигация, семантика, зрение, медиа | `sd-optimizations#Доступность` |
| Пример Netflix: ряды, ТВ, производительность | `sd-app-cases#Видео`, `sd-interview#Тренировочные задачи` |
| Пример AutoComplete | `sd-autocomplete`; API и сервер в `api-design` |
| План интервью, корзины состояния (server, UI, derived, ephemeral) | `sd-interview`, `sd-data-model` |
| Todo: карточка фильма, «Мой список», фильтры, профили, карусель | `sd-interview#Тренировочные задачи из заметок` |

Написано по плейбуку GreatFrontEnd и сверено с первоисточниками: отличие от backend-раунда, два вида задач и главные темы продуктов, шесть осей оценки, частые ошибки, доли времени RADIO, разборы ленты и автодополнения, чат, магазин, фото, видео, совместный и графический редакторы.
