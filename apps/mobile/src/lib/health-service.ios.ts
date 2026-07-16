import { Linking, NativeModules } from 'react-native';

import { calendarDays, mergeIntervalsByDay, type HealthAccessResult } from './health-context';
import type { HealthDailySummary } from '@/store/wellness';

const STEP_TYPE = 'HKQuantityTypeIdentifierStepCount' as const;
const SLEEP_TYPE = 'HKCategoryTypeIdentifierSleepAnalysis' as const;

async function healthKit() {
  if (!NativeModules.NitroModules) {
    throw new Error('Apple Health native support is not present in this build.');
  }
  return import('@kingstinct/react-native-healthkit');
}

export async function checkHealthAvailability(): Promise<HealthAccessResult> {
  try {
    if (!NativeModules.NitroModules) {
      return { available: false, source: 'apple-health', reason: 'This build needs to be refreshed before Apple Health can connect.' };
    }
    const kit = await healthKit();
    return kit.isHealthDataAvailable()
      ? { available: true, source: 'apple-health' }
      : { available: false, source: 'apple-health', reason: 'Apple Health is not available on this device.' };
  } catch {
    return { available: false, source: 'apple-health', reason: 'This build needs to be refreshed before Apple Health can connect.' };
  }
}

export async function requestHealthAccess(): Promise<boolean> {
  const kit = await healthKit();
  return kit.requestAuthorization({ toRead: [STEP_TYPE, SLEEP_TYPE] });
}

export async function readHealthDailySummaries(dayCount = 21): Promise<HealthDailySummary[]> {
  const kit = await healthKit();
  const days = calendarDays(dayCount);
  const rangeStart = new Date(days[0].date);
  rangeStart.setHours(0, 0, 0, 0);
  const rangeEnd = new Date(days[days.length - 1].date);
  rangeEnd.setHours(23, 59, 59, 999);
  const [stepBuckets, sleepSamples] = await Promise.all([
    kit.queryStatisticsCollectionForQuantity(
      STEP_TYPE,
      ['cumulativeSum'],
      rangeStart,
      { day: 1 },
      { filter: { date: { startDate: rangeStart, endDate: rangeEnd, strictStartDate: true, strictEndDate: true } }, unit: 'count' },
    ),
    kit.queryCategorySamples(SLEEP_TYPE, {
      limit: -1,
      ascending: true,
      filter: { date: { startDate: rangeStart, endDate: rangeEnd } },
    }),
  ]);
  const stepsByDate = new Map<string, number>();
  for (const bucket of stepBuckets) {
    if (bucket.startDate && bucket.sumQuantity) {
      const day = calendarDays(1, bucket.startDate)[0].key;
      stepsByDate.set(day, Math.max(0, Math.round(bucket.sumQuantity.quantity)));
    }
  }
  const sleepByDate = mergeIntervalsByDay(
    sleepSamples
      .filter((sample) => [1, 3, 4, 5].includes(Number(sample.value)))
      .map((sample) => ({ start: sample.startDate, end: sample.endDate })),
    days,
  );
  const updatedAt = new Date().toISOString();
  return days
    .filter((day) => stepsByDate.has(day.key) || sleepByDate.has(day.key))
    .map((day) => ({
      date: day.key,
      source: 'apple-health' as const,
      steps: stepsByDate.get(day.key),
      sleepMinutes: sleepByDate.get(day.key),
      updatedAt,
    }));
}

export async function openHealthSettings() {
  await Linking.openSettings();
}
