# Аудит заметок: тестирование

Источники в Notion: раздел «Testing» страницы «Angular» (Unit, Integration и E2E Testing с примерами на Jasmine, Karma, TestBed и Protractor; прочитан целиком), раздел «Mock servers» страницы «React» (MSW, json-server, Mockoon, WireMock; ошибки MSW записаны в `api.md`), раздел «Accessibility testing tooling» страницы «Browser» (axe-core, Lighthouse, скринридеры), упоминания Testing Library и `MemoryRouter` в «React», Jest и CommonJS в «JS», раздел «Технологический стек» страницы «System Design» (Vitest, React Testing Library, Playwright). Отдельной страницы про тестирование нет; стратегия, тестовые двойники, нестабильные тесты, визуальные тесты, CI и покрытие написаны с нуля.

Утверждения сверены с vitest.dev (Vitest 4 и 5, браузерный режим, моки, таймеры), playwright.dev (локаторы, web-first assertions, изоляция, трассировка, моки сети, авторизация, скриншоты, доступность), testing-library.com (приоритет запросов, `user-event`), angular.dev (Vitest по умолчанию, харнессы), vuejs.org (тестирование) и react.dev. Примеры выполняются в CI: настоящий Vitest 5 запускается из примера через `startVitest` на временных файлах, Testing Library и `axe-core` в jsdom.

## Актуальные версии и состояние (ноябрь 2026)

| Что | Версия | Что важно |
|---|---|---|
| Vitest | 5.1 (5.0 от сентября 2026) | Неожиданные `resolves` и `rejects` без `await` роняют тест; `clearMocks` включён по умолчанию; `vi.when`; моки таймеров подменяют и Temporal; Node.js 22.12+ |
| Vitest 4 | октябрь 2025 | Браузерный режим стабилен, визуальная регрессия (`toMatchScreenshot`), трассировка Playwright |
| Playwright | 1.65 | Web-first assertions с повтором (5 с по умолчанию), изолированные повторы (1.62), passkeys WebAuthn (1.61), ARIA-снимки |
| Jest | 30.5 | Поддерживается; ESM по-прежнему за флагом Node |
| Testing Library | DOM 10.4, React 16.3, `user-event` 14.6 | Приоритет запросов: роль, подпись, текст; `getByTestId` последним |
| Angular | 22 | Новые проекты на Vitest с v21; Karma поддерживается, но не по умолчанию; Protractor закрыт в 2023 |
| Cypress | 16.3 | Альтернатива Playwright, работает внутри браузера |
| axe-core | 4.14 | Находит только часть проблем доступности; проверено запуском |

## Найденные ошибки

| Где | В заметках | На самом деле | Источник |
|---|---|---|---|
| Angular, Unit Testing | Jasmine, Karma и TestBed как стандартный набор, `ng generate` создаёт тесты под Karma | С Angular 21 новые проекты создаются с Vitest, Karma остался как поддерживаемый вариант для старых проектов (записано и в `angular.md`) | [angular.dev: Testing](https://angular.dev/guide/testing) |
| Angular, E2E Testing | Protractor «рекомендуемый инструмент», `ng e2e` «использует Protractor по умолчанию» | Protractor закрыт (end of life в 2023). С Angular 12 у `ng e2e` нет инструмента по умолчанию: подключают Playwright, Cypress или WebdriverIO | [angular.dev: Testing](https://angular.dev/guide/testing) |
| Angular, Unit Testing | Проверки внутри `.then()` без `return` и `await` | Тест заканчивается раньше проверки и **проходит**. Проверено на Vitest 5: если промис успел завершиться до конца прогона, ошибка всплывает как необработанная вне теста; если нет, теряется молча. Это уточняет запись в `angular.md` | [vitest.dev: Vitest 5](https://vitest.dev/blog/vitest-5) |
| Angular, Unit Testing | «Пример использует `fakeAsync` или `async`» | В коде примера нет ни того, ни другого: асинхронность не дожидается | разбор кода |
| Angular, Integration Testing | `TestBed.configureTestingModule({ declarations: [MyComponent] })` | С Angular 19 компоненты standalone по умолчанию, их передают в `imports`; `declarations` только для старых NgModule-компонентов | [angular.dev: Component testing basics](https://angular.dev/guide/testing/components-basics) |
| Angular, Unit Testing | `HttpClientTestingModule` для моков HTTP | Модули заменены функциями: `provideHttpClient()` и `provideHttpClientTesting()`, проверка запросов через `HttpTestingController` | [angular.dev: Testing HTTP](https://angular.dev/guide/http/testing) |
| Angular, Integration Testing | `component.ngOnInit()` вручную, затем `fixture.detectChanges()` и сразу `expect` после промиса | Первый `detectChanges()` сам вызывает `ngOnInit`, и он выполнится дважды. Результат промиса ещё не пришёл: нужно `await fixture.whenStable()`, а проверять лучше DOM, а не поле компонента | [angular.dev: Component testing basics](https://angular.dev/guide/testing/components-basics) |

## Покрытие заметок Notion

| Тема в заметках | Где разобрано |
|---|---|
| Unit, integration, e2e: что и когда | `test-strategy` |
| Jasmine, Karma, Jest и Vitest | `test-vitest#Раннер` |
| Асинхронные тесты | `test-vitest#Асинхронные проверки` |
| `spyOn`, моки сервисов, моки HTTP | `test-doubles`; Angular в `ng-testing` |
| `fakeAsync`, `tick` | `test-doubles#Время`; Angular в `ng-testing` |
| TestBed, `ComponentFixture` | `ng-testing` |
| Protractor, Cypress, page objects | `test-e2e` |
| Тесты в разных браузерах | `test-e2e#Браузеры и CI` |
| MSW, json-server, Mockoon, WireMock | `api-mocking`; MSW в тестах в `test-doubles#Сеть` |
| axe-core, Lighthouse, скринридеры | `test-a11y-visual`; `html-a11y#Как проверять` |
| Testing Library, `MemoryRouter` | `test-components`; React в `react-a11y-testing` |

Добавлено сверх заметок, потому что об этом спрашивают: пирамида и «кубок» тестов, что проверять и что нет, покрытие и его пределы (мутационное тестирование на примере), матчеры и `toEqual` против `toBe`, снапшоты, виды тестовых двойников, `vi.mock` и что мокать, Testing Library без фреймворка и события `user-event`, окружения jsdom, happy-dom и браузерный режим Vitest, Playwright (локаторы, повторы проверок, изоляция контекстов, `page.route`, сохранение входа, трассировка), визуальная регрессия, Storybook как тесты, нестабильные тесты и перемешивание порядка, CI (шардирование, тесты только изменённого), TDD и ответ на собеседовании.
