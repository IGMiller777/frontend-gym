# Frontend Gym

**RU.** Тренажёр для подготовки к frontend-собеседованию: уроки с объяснением прямо на странице и ссылками на официальную документацию, задачи с проверкой кода в браузере, «что выведет код», разбор инцидентов производительности и mock-интервью с ИИ. Интерфейс и контент на русском и английском.

**EN.** A trainer for frontend interview prep: lessons that explain topics right on the page with links to official docs, coding tasks tested in the browser, "what does this code print", performance incident drills and AI mock interviews. UI and content in Russian and English.

План разработки / Roadmap: [docs/PLAN.md](docs/PLAN.md).

## Запуск / Run

```bash
pnpm install
pnpm dev          # web http://localhost:5900, api :5901
```

На macOS можно дважды кликнуть `scripts/dev.command`: он найдёт свободную пару портов 5900–5909 и откроет браузер.
On macOS you can double-click `scripts/dev.command`: it picks a free port pair in 5900–5909 and opens the browser.

ИИ-функции работают через локальный Claude Code CLI (`claude -p`), без API-ключа. Модель: `GRADER_MODEL=opus pnpm dev` (по умолчанию `sonnet`).
AI features use the local Claude Code CLI (`claude -p`), no API key. Model: `GRADER_MODEL=opus pnpm dev` (default `sonnet`).

## Проверки / Checks

```bash
pnpm test        # vitest
pnpm typecheck   # tsc -b (app + server)
pnpm lint        # oxlint
pnpm build
pnpm check:content   # RU/EN parity, sources, links, quizzes, runs every ```js run example
pnpm check:links     # every official source link answers (needs network)
```

Уроки лежат в `content/lessons/<track>/<id>.{ru,en}.md`, метаданные и квизы в `src/content/lessons/`. Пример кода с блоком ` ```output ` сразу после ` ```js run ` выполняется в тестах как ES-модуль, и его вывод сверяется с текстом урока.
Lessons live in `content/lessons/<track>/<id>.{ru,en}.md`, metadata and quizzes in `src/content/lessons/`. A ` ```js run ` example followed by an ` ```output ` block is executed in tests as an ES module and its output is compared with the lesson text.

## Режимы / Modes

- **Кодинг-задачи** (`/practice/coding`). Редактор CodeMirror, TypeScript через sucrase, тесты в Web Worker с лимитом 6 с, мини-`expect` и поддельные таймеры (`src/runner/`). Часть тестов скрыта. Разбор открывается после решения, ИИ-ревью кода через `/api/review/stream`.
  **Coding tasks.** CodeMirror editor, TypeScript via sucrase, tests in a Web Worker with a 6 s limit, a small `expect` and fake timers (`src/runner/`). Some tests are hidden. The walkthrough opens once solved; AI code review via `/api/review/stream`.
- **Что выведет код?** (`/practice/predict`). Ответ собирается из строк; задачи на event loop проходятся по шагам в визуализаторе (стек, микрозадачи, задачи, таймеры).
  **What does it print?** The answer is built from lines; event-loop tasks can be stepped through in the visualizer (stack, microtasks, tasks, timers).

## Как проверяется контент задач / How task content is checked

- Эталонное решение каждой кодинг-задачи проходит все её тесты, заготовка проваливает хотя бы один, обе проходят `tsc --strict` (`src/content/coding/coding.test.ts`).
  Every reference solution passes all its tests, every starter fails at least one, both pass `tsc --strict`.
- Код каждой задачи «что выведет» запускается в Node, вывод сверяется с ответом. Трасса event loop проверяется по правилам: микрозадачи только при пустом стеке, задача только после всех микрозадач, таймеры истекают по времени, логи трассы равны выводу (`scripts/content-checks.ts`).
  Every "what does it print" snippet runs in Node and must print the stored answer. Event-loop traces are checked against the rules: microtasks only on an empty stack, a task only after all microtasks, timers expire in time order, and the trace logs equal the output.

## Структура / Layout

| Путь / Path | Что / What |
|---|---|
| `src/i18n/` | Словари RU/EN, `useT()`, `Localized<T>` / RU/EN dictionaries |
| `src/content/` | Треки, обзоры, источники / tracks, overviews, sources |
| `src/design/`, `src/index.css` | Токены, светлая и тёмная темы / tokens, light and dark themes |
| `src/runner/` | Раннер тестов: worker, `expect`, фейковые таймеры / test runner: worker, `expect`, fake timers |
| `src/content/coding/`, `content/tasks/` | Кодинг-задачи: тесты, решения, условия и разборы / coding tasks |
| `src/content/predict/` | «Что выведет код?» и модель трассы event loop / predict-output tasks and the trace model |
| `src/store.ts` | Прогресс (файл через API + localStorage) / progress (file via API + localStorage) |
| `server/` | Hono API: прогресс, наставник, ревью кода / progress, mentor, code review |

Прогресс хранится в `data/frontend-gym.json` (в `.gitignore`) с ежедневными бэкапами в `data/backups/`.
Progress lives in `data/frontend-gym.json` (gitignored) with daily backups in `data/backups/`.

## Правила контента / Content rules

1. Объяснение на странице, ссылки только в конце в блоке «Читать подробнее». / Explain on the page; links only at the end under "Read more".
2. Каждый материал ссылается на официальный источник из списка в `src/content/sources.ts`. / Every item cites an official source from `src/content/sources.ts`.
3. Каждый текст есть на обоих языках, это проверяют тесты. / Every text exists in both languages, enforced by tests.
