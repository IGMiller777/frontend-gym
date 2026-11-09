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
