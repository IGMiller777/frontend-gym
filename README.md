# Frontend Gym

**Онлайн-версия / Live:** https://igmiller777.github.io/frontend-gym/ (без ИИ-функций / without AI features)

**RU.** Тренажёр для подготовки к frontend-собеседованию. Уроки объясняют тему прямо на странице, со схемами и примерами кода, которые проверяются запуском; ссылки на официальную документацию в конце. Кроме уроков: задачи с проверкой кода в браузере, «Что выведет код?» с пошаговым event loop, симулятор инцидентов производительности и mock-интервью с ИИ. Интерфейс и весь контент на русском и английском.

**EN.** A trainer for frontend interview prep. Lessons explain each topic right on the page, with diagrams and code examples that are verified by running them; links to official docs come at the end. Besides lessons: coding tasks tested in the browser, "What does it print?" with a step-by-step event loop, a performance incident simulator and AI mock interviews. The interface and all content are in Russian and English.

План / Roadmap: [docs/PLAN.md](docs/PLAN.md). Состояние и карта кода / Status and code map: [docs/PROJECT.md](docs/PROJECT.md).

## Что внутри / What is inside

| Режим / Mode | Маршрут / Route | Объём / Size |
|---|---|---|
| Уроки с квизами и экзамены модулей / Lessons with quizzes and module exams | `/track/:id`, `/learn/:id`, `/track/:id/exam` | 18 треков, 163 урока / 18 tracks, 163 lessons |
| Кодинг-задачи / Coding tasks | `/practice/coding`, `/code/:id` | 32 задачи: логика, DOM, компоненты React / 32 tasks: logic, DOM, React components |
| «Что выведет код?» / "What does it print?" | `/practice/predict`, `/predict/:id` | 13 задач, event loop по шагам / 13 tasks, event loop step by step |
| Симулятор инцидентов / Incident simulator | `/practice/incidents`, `/incident/:id` | 8 сценариев по Core Web Vitals / 8 Core Web Vitals scenarios |
| Mock-интервью с ИИ / AI mock interview | `/interview` | теория по 18 трекам, live-coding, 10 задач system design / theory on 18 tracks, live coding, 10 system design tasks |
| Профиль: звания, достижения, квесты дня / Profile: ranks, achievements, daily quests | `/profile` | 5 званий, 23 достижения, 3 квеста в день / 5 ranks, 23 achievements, 3 quests a day |

Треки / Tracks: JavaScript (основа и асинхронность / core and async), TypeScript, браузер / browser, сеть / network, HTML и доступность / HTML and accessibility, CSS, React, Angular, Vue, состояние / state, API и realtime / API and realtime, архитектуры рендеринга / rendering, производительность / performance, безопасность / security, тестирование / testing, инструменты и сборка / tooling, frontend system design.

## Запуск / Run

```bash
pnpm install
pnpm dev          # web http://localhost:5900, api :5901
```

На macOS можно дважды кликнуть `scripts/dev.command`: он найдёт свободную пару портов 5900–5909 и откроет браузер.
On macOS you can double-click `scripts/dev.command`: it picks a free port pair in 5900–5909 and opens the browser.

ИИ-функции (mock-интервью, ревью кода, наставник) работают через локальный Claude Code CLI (`claude -p`), без API-ключа. Модель: `GRADER_MODEL=opus pnpm dev` (по умолчанию `sonnet`). Прогресс хранится в `data/frontend-gym.json` (в `.gitignore`) с ежедневными бэкапами в `data/backups/`.
AI features (mock interview, code review, mentor) use the local Claude Code CLI (`claude -p`), no API key. Model: `GRADER_MODEL=opus pnpm dev` (default `sonnet`). Progress lives in `data/frontend-gym.json` (gitignored) with daily backups in `data/backups/`.

## Онлайн-версия / The online version

GitHub Pages собирается из `main` workflow `.github/workflows/pages.yml` с `VITE_AI=off`: ИИ-функции скрыты, интервью показывает, как запустить проект локально, прогресс хранится только в браузере (localStorage). Всё остальное работает так же, включая запуск тестов кодинг-задач.
GitHub Pages is built from `main` by `.github/workflows/pages.yml` with `VITE_AI=off`: AI features are hidden, the interview page explains how to run the project locally, and progress is kept only in the browser (localStorage). Everything else works the same, including running coding task tests.

Проверить такую сборку локально / Check such a build locally:

```bash
BASE_PATH=/frontend-gym/ VITE_AI=off pnpm build && pnpm exec vite preview --base /frontend-gym/
```

## Проверки / Checks

```bash
pnpm test            # vitest: content, runner, engine, scenarios, game, server prompts
pnpm typecheck       # tsc -b (app + server)
pnpm lint            # oxlint
pnpm build
pnpm check:content   # RU/EN parity, sources, quizzes, diagrams, runs every lesson example
pnpm check:links     # every source link answers (needs network)
```

Как проверяется контент / How content is checked:

- Пример кода в уроке с блоком ` ```output ` выполняется в тестах (Node, jsdom, React, Angular в JIT, Vue), и вывод сверяется с текстом урока; TypeScript-примеры проходят `tsc --strict`.
  A lesson example followed by an ` ```output ` block is executed in tests (Node, jsdom, React, Angular in JIT, Vue) and must print the text of the lesson; TypeScript examples pass `tsc --strict`.
- Эталонное решение каждой кодинг-задачи проходит все её тесты, заготовка проваливает хотя бы один.
  Every reference solution passes all its tests, and every starter fails at least one.
- Код каждой задачи «что выведет» запускается, вывод сверяется с ответом; трасса event loop проверяется по правилам.
  Every "what does it print" snippet runs and must print the stored answer; event-loop traces are checked against the rules.
- Каждый сценарий инцидента проигрывается без действий и выигрывается эталонным планом, а ловушки не помогают.
  Every incident scenario is lost when idle and won by its reference plan, and traps do not help.
- Схемы Mermaid разбираются настоящим парсером; квизы проверяются на «правильный ответ выдаёт длина».
  Mermaid diagrams are parsed by the real parser; quizzes are checked so that length does not give away the answer.

## Структура / Layout

| Путь / Path | Что / What |
|---|---|
| `content/lessons/<track>/<id>.{ru,en}.md` | Тексты уроков / lesson texts |
| `src/content/` | Треки, метаданные уроков, квизы, экзамены, задачи, источники / tracks, lesson metadata, quizzes, exams, tasks, sources |
| `src/runner/` | Раннер тестов: worker, песочница-iframe, `expect`, фейковые таймеры / test runner: worker, sandboxed iframe, `expect`, fake timers |
| `src/perf/` | Модель загрузки страницы и симулятор инцидентов / page load model and incident simulator |
| `src/interview/` | Mock-интервью: задачи, фазы, доска, голос / mock interview: problems, phases, board, voice |
| `src/game/` | Звания, достижения, квесты, уведомления / ranks, achievements, quests, notifications |
| `src/i18n/` | Словари RU/EN / RU/EN dictionaries |
| `src/store.ts` | Прогресс: файл через API и localStorage / progress: a file via the API and localStorage |
| `server/` | Hono API: прогресс, наставник, ревью кода, интервьюер / progress, mentor, code review, interviewer |
| `docs/content-audit/` | Сверка исходных заметок с документацией / notes checked against the docs |

## Правила контента / Content rules

1. Объяснение на странице, ссылки только в конце в блоке «Читать подробнее». / Explain on the page; links only at the end under "Read more".
2. Каждый материал ссылается на официальный источник из списка в `src/content/sources.ts`. / Every item cites an official source from `src/content/sources.ts`.
3. Каждый текст есть на обоих языках с одинаковой структурой и одинаковым кодом, это проверяют тесты. / Every text exists in both languages with the same structure and the same code, enforced by tests.
4. Утверждения сверяются с документацией и запуском, расхождения с исходными заметками записаны в `docs/content-audit/`. / Claims are checked against the docs and by running code; differences from the source notes are recorded in `docs/content-audit/`.
