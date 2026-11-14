import type { Locale } from '../i18n/types'
import { useProgress } from '../store'

/** Russian plural forms. */
function plural(n: number, one: string, few: string, many: string): string {
  const rule = new Intl.PluralRules('ru').select(n)
  return rule === 'one' ? one : rule === 'few' ? few : many
}

/** Profile page strings; loaded with the page, not in the main dictionaries. `en` repeats the shape of `ru`. */
const ru = {
  title: 'Профиль',
  rank: 'Звание',
  xp: (n: number) => `${n} XP`,
  toNext: (n: number, name: string) => `ещё ${n} XP до звания ${name}`,
  maxRank: 'Высшее звание',
  rankProgress: (pct: number) => `Прогресс до следующего звания: ${pct}%`,
  streak: (n: number) => `${n} ${plural(n, 'день', 'дня', 'дней')} подряд`,
  noStreak: 'Серия ещё не началась',
  stats: 'Статистика',
  statLabels: {
    lessons: 'Уроки',
    exams: 'Экзамены модулей',
    coding: 'Кодинг-задачи',
    predict: '«Что выведет код?»',
    incidents: 'Инциденты',
    interviews: 'Интервью на 70+',
  },
  of: (a: number, b: number) => `${a} из ${b}`,
  quests: 'Квесты дня',
  questsHint: 'Три задания на сегодня; завтра будут новые.',
  questProgress: (a: number, b: number) => `${a} из ${b}`,
  questDone: 'выполнено',
  go: 'Перейти',
  achievements: 'Достижения',
  achievementsCount: (a: number, b: number) => `открыто ${a} из ${b}`,
  locked: 'закрыто',
  unlocked: 'открыто',
  secret: 'Секретное достижение',
  secretText: 'Откроется, когда вы его найдёте',
  ranks: 'Звания',
  ranksHint: 'XP дают пройденные уроки, экзамены, задачи, инциденты и интервью.',
}

const en: typeof ru = {
  title: 'Profile',
  rank: 'Rank',
  xp: (n: number) => `${n} XP`,
  toNext: (n: number, name: string) => `${n} XP more to ${name}`,
  maxRank: 'The highest rank',
  rankProgress: (pct: number) => `Progress to the next rank: ${pct}%`,
  streak: (n: number) => `${n} ${n === 1 ? 'day' : 'days'} in a row`,
  noStreak: 'No streak yet',
  stats: 'Stats',
  statLabels: {
    lessons: 'Lessons',
    exams: 'Module exams',
    coding: 'Coding tasks',
    predict: '"What does it print?"',
    incidents: 'Incidents',
    interviews: 'Interviews at 70+',
  },
  of: (a: number, b: number) => `${a} of ${b}`,
  quests: 'Daily quests',
  questsHint: 'Three tasks for today; new ones tomorrow.',
  questProgress: (a: number, b: number) => `${a} of ${b}`,
  questDone: 'done',
  go: 'Go',
  achievements: 'Achievements',
  achievementsCount: (a: number, b: number) => `${a} of ${b} unlocked`,
  locked: 'locked',
  unlocked: 'unlocked',
  secret: 'Secret achievement',
  secretText: 'Unlocks when you find it',
  ranks: 'Ranks',
  ranksHint: 'XP comes from passed lessons, exams, tasks, incidents and interviews.',
}

export const gameStrings: Record<Locale, typeof ru> = { ru, en }

export function useGameT() {
  return gameStrings[useProgress((s) => s.locale)]
}
