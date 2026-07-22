export type HabitRhythm = 'daily' | 'weekdays' | 'three-week' | 'flexible';

export interface Habit {
  id: string;
  title: string;
  tinyVersion: string;
  rhythm: HabitRhythm;
  createdAt: string;
  completions: string[];
  paused: boolean;
}

export const HABIT_RHYTHMS: Record<HabitRhythm, { label: string; detail: string }> = {
  daily: { label: 'Most days', detail: 'An invitation each day, never a requirement.' },
  weekdays: { label: 'Weekdays', detail: 'A gentle rhythm for study or work days.' },
  'three-week': { label: 'Three times a week', detail: 'Any three days that suit the week.' },
  flexible: { label: 'Whenever it helps', detail: 'No schedule—return when it feels useful.' },
};

function ordinal(dateKey: string): number | undefined {
  const [year, month, day] = dateKey.split('-').map(Number);
  if (!year || !month || !day) return undefined;
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

export function habitReturnsInLastDays(habit: Habit, today: string, days = 7): number {
  const todayOrdinal = ordinal(today);
  if (todayOrdinal === undefined) return 0;
  return new Set(habit.completions).size
    ? [...new Set(habit.completions)].filter((date) => {
        const dateOrdinal = ordinal(date);
        return dateOrdinal !== undefined && dateOrdinal <= todayOrdinal && dateOrdinal > todayOrdinal - days;
      }).length
    : 0;
}

export function recentHabitDays(habit: Habit, today: string, days = 7) {
  const todayOrdinal = ordinal(today);
  if (todayOrdinal === undefined) return [];
  const completed = new Set(habit.completions);
  return Array.from({ length: days }, (_, index) => {
    const date = new Date((todayOrdinal - (days - 1 - index)) * 86_400_000);
    const key = date.toISOString().slice(0, 10);
    return { key, completed: completed.has(key), label: date.toLocaleDateString('en-GB', { weekday: 'narrow', timeZone: 'UTC' }) };
  });
}
