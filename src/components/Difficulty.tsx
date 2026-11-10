import clsx from 'clsx'
import type { Difficulty } from '../content/coding'
import { useT } from '../i18n'

const styles: Record<Difficulty, string> = {
  easy: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300',
  medium: 'bg-amber-500/15 text-amber-800 dark:text-amber-300',
  hard: 'bg-rose-500/15 text-rose-800 dark:text-rose-300',
}

export function DifficultyBadge({ level, className }: { level: Difficulty; className?: string }) {
  const t = useT()
  return <span className={clsx('rounded-full px-2.5 py-0.5 text-xs font-bold', styles[level], className)}>{t.practice.difficulty[level]}</span>
}
