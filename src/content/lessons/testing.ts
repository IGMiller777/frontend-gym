import type { Source } from '../sources'
import type { Lesson, Module } from './types'

const src = (title: string, url: string): Source => ({ title, url, kind: 'official' })
const vitest = (title: string, path: string) => src(`Vitest: ${title}`, `https://vitest.dev/${path}`)
const pw = (title: string, path: string) => src(`Playwright: ${title}`, `https://playwright.dev/docs/${path}`)
const tl = (title: string, path: string) => src(`Testing Library: ${title}`, `https://testing-library.com/docs/${path}`)
const verified = { date: '2026-11', version: 'Vitest 5.1, Playwright 1.65, Testing Library 10, Angular 22, axe-core 4.14' }

export const testingLessons: Lesson[] = [
  {
    id: 'test-strategy',
    track: 'testing',
    emoji: '🏆',
    minutes: 11,
    title: { ru: 'Стратегия тестирования', en: 'Testing strategy' },
    summary: {
      ru: 'Зачем тесты, виды от статического анализа до end-to-end, пирамида и кубок, что проверять и чего не проверять, покрытие и мутационное тестирование.',
      en: 'Why tests, kinds from static analysis to end-to-end, the pyramid and the trophy, what to check and what not to, coverage and mutation testing.',
    },
    quiz: {
      ru: [
        { q: 'Где основная масса тестов в «кубке»?', options: ['Unit-тесты отдельных функций', 'Интеграционные и компонентные', 'End-to-end в настоящем браузере', 'Ручные проверки отделом QA'], correct: 1, why: 'Они ближе к работе пользователя и дешевле end-to-end.' },
        { q: 'Что показывает 100 % покрытия строк?', options: ['Что все строки выполнились', 'Что ошибок нет', 'Что все ветви проверены', 'Что тесты быстрые'], correct: 0, why: 'Покрытие показывает выполнение, а не проверку результата.' },
        { q: 'Что не стоит проверять в тесте компонента?', options: ['Текст ошибки на экране', 'Вызов API с данными', 'Внутреннее состояние', 'Пустой список товаров'], correct: 2, why: 'Это деталь реализации: тест сломается при рефакторинге.' },
        { q: 'Что делает мутационное тестирование?', options: ['Ускоряет прогон всех тестов', 'Генерирует новые тесты по коду', 'Ищет самые медленные тесты', 'Вносит баги, ждёт падения тестов'], correct: 3, why: 'Доля пойманных «мутантов» честнее процента покрытия.' },
      ],
      en: [
        { q: 'Where is the bulk of tests in the "trophy"?', options: ['Unit tests of functions', 'Integration and component', 'End-to-end in a browser', 'Manual QA checks'], correct: 1, why: 'They are closer to how users work and cheaper than end-to-end.' },
        { q: 'What does 100% line coverage show?', options: ['That every line ran', 'That there are no bugs', 'That all branches are checked', 'That the tests are fast'], correct: 0, why: 'Coverage shows execution, not that the result was checked.' },
        { q: 'What should a component test not check?', options: ['The error text', 'The API call', 'The internal state', 'An empty list'], correct: 2, why: 'It is an implementation detail: the test breaks on refactoring.' },
        { q: 'What does mutation testing do?', options: ['Speeds up the whole test run', 'Generates new tests from code', 'Finds the slowest tests', 'Injects bugs, expects failures'], correct: 3, why: 'The share of caught "mutants" is more honest than coverage.' },
      ],
    },
    sources: [
      src('web.dev: Pyramid or crab? Find a testing strategy that fits', 'https://web.dev/articles/ta-strategies'),
      src('web.dev: Three common types of test automation', 'https://web.dev/articles/ta-types'),
      tl('Guiding Principles', 'guiding-principles'),
      vitest('Coverage', 'guide/coverage'),
    ],
    verified,
  },
  {
    id: 'test-vitest',
    track: 'testing',
    emoji: '⚡',
    minutes: 14,
    title: { ru: 'Unit-тесты на Vitest', en: 'Unit tests with Vitest' },
    summary: {
      ru: 'Vitest и Jest, структура теста, матчеры toBe, toEqual и toStrictEqual, асинхронные проверки без await, снапшоты, окружения jsdom и браузерный режим, что нового в Vitest 5.',
      en: 'Vitest and Jest, test structure, the toBe, toEqual and toStrictEqual matchers, asynchronous assertions without await, snapshots, jsdom and browser mode environments, what is new in Vitest 5.',
    },
    quiz: {
      ru: [
        { q: 'Чем `toStrictEqual` строже `toEqual`?', options: ['Сравнивает ссылки', 'Учитывает `undefined` и класс', 'Проверяет порядок ключей', 'Сравнивает только числа'], correct: 1, why: '`toEqual` игнорирует `undefined`-свойства и класс объекта.' },
        { q: 'Тест проверяет результат в `.then()` без `await`. Что будет?', options: ['Тест упадёт', 'Vitest дождётся проверки', 'Тест пройдёт, не проверив', 'Ошибка компиляции'], correct: 2, why: 'Тест заканчивается раньше, чем выполняется колбэк.' },
        { q: 'Что изменилось в Vitest 5 для `resolves` без `await`?', options: ['Тест теперь падает', 'Выводится предупреждение', 'Проверка игнорируется', 'Ничего не изменилось'], correct: 0, why: 'Раньше было только предупреждение, теперь тест падает.' },
        { q: 'Где тестировать код, зависящий от вёрстки?', options: ['В окружении node', 'В окружении jsdom', 'В окружении happy-dom', 'В браузерном режиме'], correct: 3, why: 'jsdom и happy-dom не считают раскладку.' },
      ],
      en: [
        { q: 'How is `toStrictEqual` stricter than `toEqual`?', options: ['It compares the references', 'It checks `undefined` and class', 'It checks the key order', 'It compares only numbers'], correct: 1, why: '`toEqual` ignores `undefined` properties and the object class.' },
        { q: 'A test checks a result in `.then()` without `await`. What happens?', options: ['The test fails', 'Vitest waits for the check', 'It passes without checking', 'A compile error'], correct: 2, why: 'The test ends before the callback runs.' },
        { q: 'What changed in Vitest 5 for `resolves` without `await`?', options: ['The test now fails', 'A warning is printed', 'The check is ignored', 'Nothing changed'], correct: 0, why: 'It used to be only a warning; now the test fails.' },
        { q: 'Where do you test code that depends on layout?', options: ['In the node environment', 'In jsdom', 'In happy-dom', 'In Vitest browser mode'], correct: 3, why: 'jsdom and happy-dom do not compute layout.' },
      ],
    },
    sources: [
      vitest('Getting Started', 'guide/'),
      vitest('Vitest 5 is out', 'blog/vitest-5'),
      vitest('Snapshot', 'guide/snapshot'),
      vitest('Test Environment', 'guide/environment'),
      src('angular.dev: Testing', 'https://angular.dev/guide/testing'),
    ],
    verified,
  },
  {
    id: 'test-doubles',
    track: 'testing',
    emoji: '🎭',
    minutes: 13,
    title: { ru: 'Моки, шпионы и таймеры', en: 'Mocks, spies and timers' },
    summary: {
      ru: 'Виды тестовых двойников, vi.fn, vi.spyOn и vi.when, подмена модулей через vi.mock, что подменять и что нет, поддельные таймеры, MSW в тестах, очистка моков.',
      en: 'Kinds of test doubles, vi.fn, vi.spyOn and vi.when, replacing modules with vi.mock, what to replace and what not, fake timers, MSW in tests, clearing mocks.',
    },
    quiz: {
      ru: [
        { q: 'Что лучше всего подменять в тесте?', options: ['Свои хуки и утилиты', 'Свой стор приложения', 'Границы: сеть и время', 'Дочерние компоненты'], correct: 2, why: 'Медленные и нестабильные зависимости; свой код тестируют вместе.' },
        { q: 'Как проверить debounce на 300 мс быстро?', options: ['Поддельные таймеры', 'Ждать 300 мс', 'Увеличить таймаут', 'Замокать `setTimeout` руками'], correct: 0, why: '`vi.advanceTimersByTimeAsync` двигает время по команде.' },
        { q: 'Почему `vi.mock` не видит переменные теста?', options: ['Это баг Vitest', 'Он поднимается над импортами', 'Он работает в другом процессе', 'Переменные очищаются'], correct: 1, why: 'Фабрика выполняется до кода теста; для переменных `vi.hoisted`.' },
        { q: 'Что включено по умолчанию в Vitest 5?', options: ['`restoreMocks`', '`resetMocks`', 'Поддельные таймеры', '`clearMocks`'], correct: 3, why: 'История вызовов очищается перед каждым тестом.' },
      ],
      en: [
        { q: 'What is best replaced in a test?', options: ['Your own hooks', 'Your app store', 'Network and time', 'Child components'], correct: 2, why: 'Slow and unstable dependencies; your own code is tested together.' },
        { q: 'How do you test a 300 ms debounce quickly?', options: ['Fake timers', 'Wait 300 ms', 'Raise the timeout', 'Mock `setTimeout` by hand'], correct: 0, why: '`vi.advanceTimersByTimeAsync` moves time on command.' },
        { q: 'Why does `vi.mock` not see test variables?', options: ['It is a Vitest bug', 'It is hoisted above imports', 'It runs in another process', 'Variables are cleared'], correct: 1, why: 'The factory runs before the test code; use `vi.hoisted` for variables.' },
        { q: 'What is on by default in Vitest 5?', options: ['`restoreMocks`', '`resetMocks`', 'Fake timers', '`clearMocks`'], correct: 3, why: 'The call history is cleared before each test.' },
      ],
    },
    sources: [
      vitest('Mocking', 'guide/mocking'),
      vitest('Vi API', 'api/vi'),
      src('MSW: Node.js integration', 'https://mswjs.io/docs/integrations/node'),
      vitest('Vitest 5 is out', 'blog/vitest-5'),
    ],
    verified,
  },
  {
    id: 'test-components',
    track: 'testing',
    emoji: '🧩',
    minutes: 13,
    title: { ru: 'Тесты компонентов', en: 'Component tests' },
    summary: {
      ru: 'Принцип Testing Library, приоритет запросов, user-event против fireEvent, ожидание асинхронного результата, устойчивость к рефакторингу, обёртки и родные инструменты React, Vue и Angular.',
      en: 'The Testing Library principle, query priority, user-event versus fireEvent, waiting for asynchronous results, resilience to refactoring, wrappers and native tools of React, Vue and Angular.',
    },
    quiz: {
      ru: [
        { q: 'Какой запрос Testing Library первый по приоритету?', options: ['`getByTestId`', '`getByText`', '`getByRole`', '`querySelector`'], correct: 2, why: 'Роль и имя находят элемент как пользователь и проверяют доступность.' },
        { q: 'Что вызывает `fireEvent.change`?', options: ['Одно событие `change`', 'Фокус и нажатия клавиш', 'Полный ввод текста', 'Ничего в jsdom'], correct: 0, why: '`user-event` воспроизводит всю цепочку событий.' },
        { q: 'Чем проверить, что элемента нет?', options: ['`getBy`', '`queryBy`', '`findBy`', '`getAllBy`'], correct: 1, why: '`queryBy` возвращает `null`, а `getBy` бросает ошибку.' },
        { q: 'Что значит предупреждение «not wrapped in act»?', options: ['Ошибка в React', 'Нужен другой раннер', 'Компонент медленный', 'Результат не дождались'], correct: 3, why: 'Состояние обновилось, когда тест не ждал; помогает `findBy`.' },
      ],
      en: [
        { q: 'Which Testing Library query comes first?', options: ['`getByTestId`', '`getByText`', '`getByRole`', '`querySelector`'], correct: 2, why: 'Role and name find the element like a user and check accessibility.' },
        { q: 'What does `fireEvent.change` fire?', options: ['One `change` event', 'Focus and key presses', 'Full text input', 'Nothing in jsdom'], correct: 0, why: '`user-event` reproduces the whole chain of events.' },
        { q: 'What do you use to check that an element is absent?', options: ['`getBy`', '`queryBy`', '`findBy`', '`getAllBy`'], correct: 1, why: '`queryBy` returns `null`, while `getBy` throws.' },
        { q: 'What does the "not wrapped in act" warning mean?', options: ['A bug in React', 'Another runner is needed', 'The component is slow', 'The result was not awaited'], correct: 3, why: 'The state updated when the test was not waiting; `findBy` helps.' },
      ],
    },
    sources: [
      tl('About Queries', 'queries/about'),
      tl('user-event', 'user-event/intro'),
      vitest('Browser Mode', 'guide/browser/'),
      src('vuejs.org: Testing', 'https://vuejs.org/guide/scaling-up/testing.html'),
      src('angular.dev: Using component harnesses', 'https://angular.dev/guide/testing/using-component-harnesses'),
    ],
    verified,
  },
  {
    id: 'test-e2e',
    track: 'testing',
    emoji: '🎬',
    minutes: 14,
    title: { ru: 'End-to-end на Playwright', en: 'End-to-end with Playwright' },
    summary: {
      ru: 'Что проверяет end-to-end, контексты и параллельность Playwright, локаторы и автоматическое ожидание, проверка с повтором против паузы, page.route, вход через storageState, трассировка, CI и Cypress.',
      en: 'What end-to-end checks, Playwright contexts and parallelism, locators and auto-waiting, a retrying check versus a pause, page.route, login through storageState, tracing, CI and Cypress.',
    },
    quiz: {
      ru: [
        { q: 'Что получает каждый тест Playwright?', options: ['Общий браузер с куками', 'Новый контекст браузера', 'Отдельную машину', 'Чистую базу данных'], correct: 1, why: 'Контекст как чистый профиль: свои cookie и хранилища.' },
        { q: 'Почему пауза в e2e-тесте плоха?', options: ['Её запрещает Playwright', 'Она ломает трассировку', 'Тест становится нестабильным', 'Она не работает в WebKit'], correct: 2, why: 'Успеет ли сервер, зависит от машины; проверка с повтором ждёт сколько нужно.' },
        { q: 'Что делает локатор при двух совпадениях?', options: ['Падает с ошибкой', 'Кликает по первому', 'Кликает по обоим', 'Ждёт, пока останется один'], correct: 0, why: 'Локаторы строгие; уточняют цепочкой или `filter`.' },
        { q: 'Как не входить в каждом тесте заново?', options: ['Отключить вход', 'Один общий контекст', 'Хранить пароль в коде', 'Сохранить `storageState`'], correct: 3, why: 'Проект setup входит один раз, остальные стартуют залогиненными.' },
      ],
      en: [
        { q: 'What does each Playwright test get?', options: ['A shared browser with cookies', 'A new browser context', 'A separate machine', 'A clean database'], correct: 1, why: 'A context is like a clean profile: its own cookies and storage.' },
        { q: 'Why is a pause in an e2e test bad?', options: ['Playwright forbids it', 'It breaks tracing', 'The test becomes unstable', 'It fails in WebKit'], correct: 2, why: 'Whether the server makes it depends on the machine; a retrying check waits as needed.' },
        { q: 'What does a locator do with two matches?', options: ['Fails with an error', 'Clicks the first one', 'Clicks both of them', 'Waits until one is left'], correct: 0, why: 'Locators are strict; narrow them with a chain or `filter`.' },
        { q: 'How do you avoid logging in in every test?', options: ['Turn login off', 'Share one context', 'Keep the password in code', 'Save the `storageState`'], correct: 3, why: 'A setup project logs in once, the others start logged in.' },
      ],
    },
    sources: [
      pw('Best Practices', 'best-practices'),
      pw('Locators', 'locators'),
      pw('Auto-waiting', 'actionability'),
      pw('Authentication', 'auth'),
      pw('Mock APIs', 'mock'),
      pw('Trace viewer', 'trace-viewer'),
    ],
    verified,
  },
  {
    id: 'test-a11y-visual',
    track: 'testing',
    emoji: '👁️',
    minutes: 12,
    title: { ru: 'Доступность и визуальные тесты', en: 'Accessibility and visual tests' },
    summary: {
      ru: 'Что находит axe-core и что пропускает, где его запускать, ARIA-снимки и проверки с клавиатуры, визуальная регрессия в Playwright и Vitest и причины нестабильных скриншотов.',
      en: 'What axe-core finds and what it misses, where to run it, ARIA snapshots and keyboard checks, visual regression in Playwright and Vitest and the causes of unstable screenshots.',
    },
    quiz: {
      ru: [
        { q: 'Что axe-core не нашёл в примере?', options: ['Картинку без `alt`', 'Кнопку без имени', 'Пустую ссылку', '`div` вместо кнопки'], correct: 3, why: 'Недоступность с клавиатуры не видна из правил DOM.' },
        { q: 'Почему контраст не проверить в jsdom?', options: ['Нет вычисленных стилей', 'axe его не умеет', 'Нужен скринридер', 'Это ручная проверка'], correct: 0, why: 'jsdom не считает вёрстку и стили; контраст проверяют в браузере.' },
        { q: 'Что сравнивает ARIA-снимок?', options: ['HTML страницы', 'Роли и имена', 'Пиксели', 'Классы CSS'], correct: 1, why: 'Дерево доступности переживает смену разметки, но не потерю имени.' },
        { q: 'Как сделать скриншот-тесты стабильнее?', options: ['Снимать всю страницу', 'Сравнивать без порога', 'Одно окружение и маски', 'Обновлять эталоны всегда'], correct: 2, why: 'Шрифты, анимации и динамика различаются между машинами.' },
      ],
      en: [
        { q: 'What did axe-core miss in the example?', options: ['An image without `alt`', 'A button without a name', 'An empty link', 'A `div` posing as a button'], correct: 3, why: 'Keyboard inaccessibility is not visible to DOM rules.' },
        { q: 'Why can contrast not be checked in jsdom?', options: ['No computed styles', 'axe cannot do it', 'It needs a screen reader', 'It is a manual check'], correct: 0, why: 'jsdom computes neither layout nor styles; contrast is checked in a browser.' },
        { q: 'What does an ARIA snapshot compare?', options: ['The page HTML', 'Roles and names', 'Pixels', 'CSS classes'], correct: 1, why: 'The accessibility tree survives markup changes but not a lost name.' },
        { q: 'How do you make screenshot tests more stable?', options: ['Shoot the whole page', 'Compare without a threshold', 'One environment and masks', 'Always update baselines'], correct: 2, why: 'Fonts, animations and dynamic content differ between machines.' },
      ],
    },
    sources: [
      pw('Accessibility testing', 'accessibility-testing'),
      pw('Visual comparisons', 'test-snapshots'),
      pw('Snapshot testing (ARIA)', 'aria-snapshots'),
      vitest('Visual Regression Testing', 'guide/browser/visual-regression-testing'),
    ],
    verified,
  },
  {
    id: 'test-practice',
    track: 'testing',
    emoji: '🔁',
    minutes: 12,
    title: { ru: 'Нестабильные тесты, CI и собеседование', en: 'Flaky tests, CI and the interview' },
    summary: {
      ru: 'Причины нестабильных тестов, перемешивание порядка, карантин, этапы CI, тесты только затронутого и шардирование, пороги покрытия, TDD, ответ на «как вы протестируете эту фичу».',
      en: 'Causes of flaky tests, shuffling the order, quarantine, CI stages, testing only what is affected and sharding, coverage thresholds, TDD, answering "how would you test this feature".',
    },
    quiz: {
      ru: [
        { q: 'Что находит `sequence.shuffle`?', options: ['Медленные тесты', 'Тесты без проверок', 'Зависимости от порядка', 'Утечки памяти'], correct: 2, why: 'Тест, который проходит только после другого, падает при другом порядке.' },
        { q: 'Что делать с нестабильным тестом?', options: ['Чинить причину, пока в карантин', 'Добавить ещё несколько повторов', 'Удалить этот тест совсем', 'Увеличить таймаут этого теста'], correct: 0, why: 'Повторы прячут проблему; причину чинят.' },
        { q: 'Что запускать первым в CI?', options: ['End-to-end', 'Типы и линтер', 'Визуальные тесты', 'Production-сборку'], correct: 1, why: 'Быстрые проверки отсекают ошибки за секунды.' },
        { q: 'Для чего TDD подходит лучше всего?', options: ['Для вёрстки страниц', 'Для анимаций', 'Для быстрых прототипов', 'Для логики и багфиксов'], correct: 3, why: 'Понятные входы и выходы; тест сначала воспроизводит баг.' },
      ],
      en: [
        { q: 'What does `sequence.shuffle` find?', options: ['Slow tests', 'Tests with no checks', 'Order dependencies', 'Memory leaks'], correct: 2, why: 'A test that passes only after another fails in a different order.' },
        { q: 'What do you do with a flaky test?', options: ['Fix the cause, quarantine it', 'Add more retries to it', 'Delete the test entirely', 'Raise the test timeout'], correct: 0, why: 'Retries hide the problem; fix the cause.' },
        { q: 'What runs first in CI?', options: ['End-to-end', 'Types and linter', 'Visual tests', 'The production build'], correct: 1, why: 'Fast checks catch errors in seconds.' },
        { q: 'What does TDD suit best?', options: ['Page layout', 'Animations', 'Quick prototypes', 'Logic and bug fixes'], correct: 3, why: 'Clear inputs and outputs; the test first reproduces the bug.' },
      ],
    },
    sources: [
      vitest('Config: sequence', 'config/sequence'),
      vitest('Improving Performance', 'guide/improving-performance'),
      pw('Sharding', 'test-sharding'),
      vitest('Coverage', 'guide/coverage'),
      vitest('Announcing Vitest 5.1', 'blog/vitest-5-1'),
    ],
    verified,
  },
]

export const testingModule: Module = {
  track: 'testing',
  lessons: testingLessons.map((l) => l.id),
  exam: {
    pass: 0.75,
    questions: {
      ru: [
        { q: 'Какой тест даёт больше уверенности?', options: ['Мокает все модули сразу', 'Близок к работе пользователя', 'Проверяет внутреннее состояние', 'Делает большой снапшот'], correct: 1, why: 'Чем ближе тест к использованию, тем больше он доказывает.' },
        { q: 'Слабый набор даёт 100 % покрытия. Что это значит?', options: ['Ошибок в этом коде точно нет', 'Тесты написаны очень хорошо', 'Код выполнился, но не проверен', 'Можно удалить все e2e-тесты'], correct: 2, why: 'В примере такой набор пропустил все три ошибки.' },
        { q: 'Чем сравнить два объекта по структуре?', options: ['`toEqual`', '`toBe`', '`toBeCloseTo`', '`toThrow`'], correct: 0, why: '`toBe` сравнивает ссылки через `Object.is`.' },
        { q: 'Быстрый промис в `.then()` без `await` упал. Где видна ошибка?', options: ['В этом самом тесте', 'Нигде, она теряется', 'В следующем по порядку', 'Вне тестов, необработанная'], correct: 3, why: 'Тест уже прошёл; ошибка всплыла в прогоне без привязки к тесту.' },
        { q: 'Какой снапшот уместен?', options: ['Дерево всей страницы', 'Небольшое стабильное значение', 'Всё состояние стора приложения', 'Ответ API на 500 строк'], correct: 1, why: 'Большие снапшоты обновляют не глядя.' },
        { q: 'Что подменять для запросов к API?', options: ['Модуль `fetch` через `vi.mock`', 'Свой хук загрузки', 'Ответы через MSW', 'Ничего не подменять'], correct: 2, why: 'Код тестируется со своим `fetch`, заголовками и разбором.' },
        { q: 'Как зафиксировать «сегодня» в тесте?', options: ['`vi.setSystemTime`', 'Ждать полуночи', 'Поменять `TZ` системы', 'Мокать `Date` руками'], correct: 0, why: 'Подменяет время для `Date` и Temporal.' },
        { q: 'Какой запрос делает тест устойчивым к рефакторингу?', options: ['По классу CSS', 'По `data-testid`', 'По XPath', 'По роли и имени'], correct: 3, why: 'Он меняется только вместе с тем, что видит пользователь.' },
        { q: 'Чем `user-event` лучше `fireEvent`?', options: ['Работает без DOM вообще', 'Вызывает всю цепочку событий', 'Работает синхронно', 'Не требует писать `await`'], correct: 1, why: 'Фокус, клавиши, `input`, как у пользователя.' },
        { q: 'Зачем Playwright новый контекст на каждый тест?', options: ['Чтобы ускорить работу сети', 'Чтобы записать видео теста', 'Изолировать cookie и хранилища', 'Чтобы запустить движок WebKit'], correct: 2, why: 'Тесты не влияют друг на друга.' },
        { q: 'Сколько ждёт `expect(locator)` по умолчанию?', options: ['5 секунд, повторяя', 'Нисколько', '30 секунд один раз', 'Бесконечно'], correct: 0, why: 'Web-first assertions повторяют проверку до таймаута.' },
        { q: 'Что axe-core делает плохо?', options: ['Находит картинки без `alt`', 'Находит кнопки без имени', 'Проверяет атрибуты ARIA', 'Видит логику клавиатуры'], correct: 3, why: 'Правила по DOM не видят, что `div` недоступен с клавиатуры.' },
        { q: 'Тест падает только в общем прогоне. Что искать?', options: ['Баг в самом Vitest', 'Общее состояние или мок', 'Медленный диск машины', 'Ошибку в линтере'], correct: 1, why: 'Тест зависит от того, что оставил другой тест.' },
        { q: 'С чего начать ответ «как протестировать фичу»?', options: ['С выбора раннера', 'С процента покрытия', 'С рисков и требований', 'С e2e на всё'], correct: 2, why: 'Сначала что важно пользователю, потом уровни тестов.' },
      ],
      en: [
        { q: 'Which test gives more confidence?', options: ['One mocking every module', 'One close to how users work', 'One checking state', 'One with a large snapshot'], correct: 1, why: 'The closer a test is to real use, the more it proves.' },
        { q: 'A weak suite gives 100% coverage. What does it mean?', options: ['There are surely no bugs', 'The tests are written well', 'Code ran but was not checked', 'All e2e tests can be removed'], correct: 2, why: 'In the example such a suite missed all three bugs.' },
        { q: 'What compares two objects by structure?', options: ['`toEqual`', '`toBe`', '`toBeCloseTo`', '`toThrow`'], correct: 0, why: '`toBe` compares references with `Object.is`.' },
        { q: 'A fast promise in `.then()` without `await` failed. Where is the error?', options: ['In that very same test', 'Nowhere, it is lost', 'In the next test in order', 'Outside tests, unhandled'], correct: 3, why: 'The test already passed; the error surfaced in the run, unattached to a test.' },
        { q: 'Which snapshot is appropriate?', options: ['A page tree', 'A small stable value', 'The whole store', 'A 500-line API response'], correct: 1, why: 'Large snapshots get updated without looking.' },
        { q: 'What do you replace for API requests?', options: ['The `fetch` module via `vi.mock`', 'Your loading hook', 'Responses through MSW', 'Replace nothing at all'], correct: 2, why: 'The code is tested with its own `fetch`, headers and parsing.' },
        { q: 'How do you fix "today" in a test?', options: ['`vi.setSystemTime`', 'Wait for midnight', 'Change the system `TZ`', 'Mock `Date` by hand'], correct: 0, why: 'It sets the time for `Date` and Temporal.' },
        { q: 'Which query makes a test resilient to refactoring?', options: ['By CSS class', 'By `data-testid`', 'By XPath', 'By role and name'], correct: 3, why: 'It changes only together with what the user sees.' },
        { q: 'How is `user-event` better than `fireEvent`?', options: ['It works without a DOM', 'It fires the full event chain', 'It runs synchronously', 'It needs no `await` at all'], correct: 1, why: 'Focus, keys, `input`, as for a user.' },
        { q: 'Why does Playwright give each test a new context?', options: ['To speed up the network', 'To record a test video', 'Isolated cookies and storage', 'To run the WebKit engine'], correct: 2, why: 'Tests do not affect each other.' },
        { q: 'How long does `expect(locator)` wait by default?', options: ['5 seconds, retrying', 'Not at all', '30 seconds once', 'Until the page closes'], correct: 0, why: 'Web-first assertions retry the check until the timeout.' },
        { q: 'What does axe-core do poorly?', options: ['Finds images without `alt`', 'Finds buttons without a name', 'Checks ARIA attributes', 'Sees keyboard logic'], correct: 3, why: 'DOM rules do not see that a `div` is keyboard-inaccessible.' },
        { q: 'A test fails only in the full run. What do you look for?', options: ['A bug in Vitest itself', 'Shared state or a mock', 'A slow disk on the machine', 'A linter error'], correct: 1, why: 'The test depends on what another test left behind.' },
        { q: 'Where does "how would you test this feature" start?', options: ['Choosing a runner', 'The coverage number', 'Risks and requirements', 'e2e for everything'], correct: 2, why: 'First what matters to the user, then the test levels.' },
      ],
    },
  },
}
