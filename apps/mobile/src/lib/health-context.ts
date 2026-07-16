import type { Checkin, HealthDailySummary } from '@/store/wellness';

export type HealthSource = 'apple-health' | 'health-connect';

export interface HealthAccessResult {
  available: boolean;
  source: HealthSource | 'none';
  reason?: string;
}

export interface HealthContextDifference {
  kind: 'sleep' | 'steps';
  title: string;
  detail: string;
  pairedDays: number;
}

export function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function calendarDays(count: number, end = new Date()): { date: Date; key: string }[] {
  const noon = new Date(end);
  noon.setHours(12, 0, 0, 0);
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(noon);
    date.setDate(noon.getDate() - count + 1 + index);
    return { date, key: localDateKey(date) };
  });
}

export function mergeIntervalsByDay(
  intervals: { start: Date; end: Date }[],
  days: { date: Date; key: string }[],
): Map<string, number> {
  const result = new Map<string, number>();
  for (const day of days) {
    const start = new Date(day.date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    const clipped = intervals
      .map((interval) => ({
        start: Math.max(start.getTime(), interval.start.getTime()),
        end: Math.min(end.getTime(), interval.end.getTime()),
      }))
      .filter((interval) => interval.end > interval.start)
      .sort((a, b) => a.start - b.start);
    const merged: { start: number; end: number }[] = [];
    for (const interval of clipped) {
      const previous = merged[merged.length - 1];
      if (previous && interval.start <= previous.end) previous.end = Math.max(previous.end, interval.end);
      else merged.push({ ...interval });
    }
    if (merged.length) {
      result.set(day.key, Math.round(merged.reduce((total, interval) => total + interval.end - interval.start, 0) / 60000));
    }
  }
  return result;
}

function average(values: number[]) {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

export function findHealthContextDifferences(
  checkins: Checkin[],
  healthDays: HealthDailySummary[],
): HealthContextDifference[] {
  const healthByDate = new Map(healthDays.map((day) => [day.date, day]));
  const paired = checkins
    .map((checkin) => ({ checkin, health: healthByDate.get(checkin.date) }))
    .filter((item): item is { checkin: Checkin; health: HealthDailySummary } => Boolean(item.health));
  const differences: HealthContextDifference[] = [];

  const withSleep = paired.filter((item) => item.health.sleepMinutes !== undefined);
  const longerSleep = withSleep.filter((item) => (item.health.sleepMinutes ?? 0) >= 420);
  const shorterSleep = withSleep.filter((item) => (item.health.sleepMinutes ?? 0) < 420);
  if (longerSleep.length >= 3 && shorterSleep.length >= 3) {
    const energyDifference = average(longerSleep.map((item) => item.checkin.energy)) - average(shorterSleep.map((item) => item.checkin.energy));
    if (Math.abs(energyDifference) >= 0.75) {
      differences.push({
        kind: 'sleep',
        title: energyDifference > 0 ? 'Energy has been higher after longer sleep' : 'Energy has not tracked with longer sleep',
        detail: `Across ${withSleep.length} paired days, energy was ${Math.abs(energyDifference).toFixed(1)} points ${energyDifference > 0 ? 'higher' : 'lower'} after at least seven hours of recorded sleep. This is a description, not a cause.`,
        pairedDays: withSleep.length,
      });
    }
  }

  const withSteps = paired.filter((item) => item.health.steps !== undefined);
  if (withSteps.length >= 6) {
    const orderedSteps = withSteps.map((item) => item.health.steps ?? 0).sort((a, b) => a - b);
    const middle = orderedSteps[Math.floor(orderedSteps.length / 2)];
    const moreActive = withSteps.filter((item) => (item.health.steps ?? 0) >= middle);
    const lessActive = withSteps.filter((item) => (item.health.steps ?? 0) < middle);
    if (moreActive.length >= 3 && lessActive.length >= 3) {
      const moodDifference = average(moreActive.map((item) => item.checkin.mood)) - average(lessActive.map((item) => item.checkin.mood));
      if (Math.abs(moodDifference) >= 0.5) {
        differences.push({
          kind: 'steps',
          title: moodDifference > 0 ? 'Mood has been higher on more active days' : 'Mood has not tracked with more active days',
          detail: `Across ${withSteps.length} paired days, mood was ${Math.abs(moodDifference).toFixed(1)} points ${moodDifference > 0 ? 'higher' : 'lower'} on days above your recent movement midpoint. This is a description, not a cause.`,
          pairedDays: withSteps.length,
        });
      }
    }
  }

  return differences;
}

