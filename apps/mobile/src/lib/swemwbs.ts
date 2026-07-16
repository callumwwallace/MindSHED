import { scoreSwemwbs } from '@mindshed/shared';

export const SWEMWBS_CADENCE_DAYS = 14;

// Licensed English SWEMWBS presentation. Do not edit the introduction,
// statements, order, response labels or scoring without Warwick approval.
export const SWEMWBS_INTRODUCTION =
  'Below are some statements about feelings and thoughts. Please tick the box that best describes your experience of each over the last 2 weeks.';

export const SWEMWBS_ITEMS = [
  "I've been feeling optimistic about the future",
  "I've been feeling useful",
  "I've been feeling relaxed",
  "I've been dealing with problems well",
  "I've been thinking clearly",
  "I've been feeling close to other people",
  "I've been able to make up my own mind about things",
] as const;

export const SWEMWBS_RESPONSES = [
  'None of the time',
  'Rarely',
  'Some of the time',
  'Often',
  'All of the time',
] as const;

export const SWEMWBS_COPYRIGHT =
  '© University of Warwick 2006. All rights reserved.';

export { scoreSwemwbs };

function utcDay(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

export function addCalendarDays(dateKey: string, days: number) {
  const date = new Date(utcDay(dateKey));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function calendarDaysBetween(fromDateKey: string, toDateKey: string) {
  return Math.floor((utcDay(toDateKey) - utcDay(fromDateKey)) / 86_400_000);
}

export function swemwbsSchedule(completedDates: readonly string[], todayDateKey: string) {
  const latest = [...completedDates].sort((a, b) => b.localeCompare(a))[0];
  if (!latest) return { due: true, daysUntilDue: 0, nextDueDate: todayDateKey };
  const nextDueDate = addCalendarDays(latest, SWEMWBS_CADENCE_DAYS);
  const daysUntilDue = Math.max(0, calendarDaysBetween(todayDateKey, nextDueDate));
  return { due: todayDateKey >= nextDueDate, daysUntilDue, nextDueDate };
}
