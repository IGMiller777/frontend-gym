/** Interface strings. `en.ts` must have exactly the same shape (checked by the type and by a test). */
export const ru = {
  app: {
    name: 'Frontend Gym',
    tagline: 'Тренажёр для подготовки к frontend-собеседованию',
  },
  nav: {
    home: 'Треки',
    skip: 'Перейти к содержимому',
    language: 'Язык',
    theme: 'Тема',
    themes: { system: 'Как в системе', light: 'Светлая', dark: 'Тёмная' },
  },
  home: {
    heroTitle: 'Качаем фронтенд к собеседованию',
    heroText:
      'Уроки по официальной документации, задачи с проверкой кода прямо в браузере, «что выведет код», разбор инцидентов производительности и mock-интервью с ИИ. На русском и английском.',
    start: 'Выбрать трек',
    modesTitle: 'Режимы тренировки',
    tracksTitle: 'Треки',
    soon: 'скоро',
    modes: {
      coding: { title: 'Кодинг-задачи', text: 'Реализуй debounce, Promise.all или компонент. Тесты запускаются прямо в браузере.' },
      predict: { title: 'Что выведет код?', text: 'Event loop, замыкания, this, порядок эффектов. С пошаговой визуализацией.' },
      incidents: { title: 'Инциденты', text: 'Упали Core Web Vitals, течёт память, раздуло бандл. Найди причину и почини.' },
      interview: { title: 'Mock-интервью', text: 'Теория, live-coding и system design по RADIO с ИИ-интервьюером.' },
    },
  },
  track: {
    back: 'Все треки',
    keyIdeas: 'Главное по теме',
    readMore: 'Читать подробнее',
    comingTitle: 'Дальше в треке',
    comingText: 'Подробные уроки, задачи с проверкой кода и квизы по каждой из этих тем появятся на следующих этапах.',
    notFound: 'Трек не найден.',
    lessons: 'Уроки',
    progress: (done: number, total: number) => `пройдено ${done} из ${total}`,
    done: 'пройдено',
    todo: 'не пройдено',
    lessonsCount: (n: number) => `${n} ${plural(n, 'урок', 'урока', 'уроков')}`,
  },
  lesson: {
    label: (n: number, total: number) => `Урок ${n} из ${total}`,
    minutes: (n: number) => `${n} мин`,
    output: 'Вывод',
    prev: 'Предыдущий урок',
    next: 'Следующий урок',
    nav: 'Навигация по урокам',
    notFound: 'Урок не найден.',
    verified: (date: string, version?: string) => `Сверено с документацией: ${date}${version ? `, ${version}` : ''}.`,
  },
  quiz: {
    title: 'Проверь себя',
    hint: (pct: number) => `Урок засчитывается от ${pct}% правильных ответов.`,
    question: (n: number, total: number) => `Вопрос ${n} из ${total}`,
    right: 'Верно.',
    wrong: 'Не совсем.',
    score: (right: number, total: number) => `${right} из ${total} правильно.`,
    passed: 'Засчитано!',
    failed: (pct: number) => `Нужно ${pct}%, попробуйте ещё раз.`,
    retry: 'Ещё раз',
  },
  exam: {
    title: 'Экзамен модуля',
    boss: 'Босс модуля',
    cta: 'Финальный экзамен',
    intro: (n: number, pct: number) => `${n} вопросов по всем урокам модуля. Для победы нужно ${pct}% правильных ответов.`,
    best: (pct: number) => `Лучший результат: ${pct}%`,
  },
  groups: {
    platform: 'Платформа',
    language: 'Язык',
    frameworks: 'Фреймворки',
    app: 'Приложение',
    quality: 'Качество',
    scale: 'Масштаб',
  },
  stats: {
    xp: 'XP',
    streak: (n: number) => `${n} ${plural(n, 'день', 'дня', 'дней')} подряд`,
  },
  errors: {
    apiDown: (status: number) => `ИИ-сервер не отвечает (HTTP ${status}). Запущен ли pnpm dev:api?`,
    aiDisabled: 'ИИ-функции отключены в этой сборке.',
    generation: 'Ошибка генерации',
  },
  notFound: { title: 'Страница не найдена', back: 'На главную' },
}

/** Russian plural forms: 1 день, 2 дня, 5 дней. */
function plural(n: number, one: string, few: string, many: string): string {
  const rule = new Intl.PluralRules('ru').select(n)
  return rule === 'one' ? one : rule === 'few' ? few : many
}
