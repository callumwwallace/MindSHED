import { NativeModules } from 'react-native';

import { calendarDays, type HealthAccessResult } from './health-context';
import { healthPermissionUnavailableError } from './health-service-errors';
import type { HealthDailySummary } from '@/store/wellness';

async function healthConnect() {
  if (!NativeModules.HealthConnect) {
    throw new Error('Health Connect native support is not present in this build.');
  }
  return import('react-native-health-connect');
}

export async function checkHealthAvailability(): Promise<HealthAccessResult> {
  try {
    if (!NativeModules.HealthConnect) {
      return { available: false, source: 'health-connect', reason: 'This build needs to be refreshed before Health Connect can connect.' };
    }
    const { getSdkStatus, SdkAvailabilityStatus } = await healthConnect();
    const status = await getSdkStatus();
    if (status === SdkAvailabilityStatus.SDK_AVAILABLE) return { available: true, source: 'health-connect' };
    return {
      available: false,
      source: 'health-connect',
      reason: status === SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED
        ? 'Health Connect needs to be installed or updated.'
        : 'Health Connect is not available on this device.',
    };
  } catch {
    return { available: false, source: 'health-connect', reason: 'This build needs to be refreshed before Health Connect can connect.' };
  }
}

export async function requestHealthAccess(): Promise<boolean> {
  const { initialize, requestPermission } = await healthConnect();
  if (!(await initialize())) return false;
  const granted = await requestPermission([
    { accessType: 'read', recordType: 'Steps' },
    { accessType: 'read', recordType: 'SleepSession' },
  ]);
  return granted.some((permission) => 'recordType' in permission && permission.recordType === 'Steps')
    || granted.some((permission) => 'recordType' in permission && permission.recordType === 'SleepSession');
}

export async function readHealthDailySummaries(dayCount = 21): Promise<HealthDailySummary[]> {
  const { aggregateGroupByPeriod, getGrantedPermissions, initialize } = await healthConnect();
  if (!(await initialize())) return [];
  const permissions = await getGrantedPermissions();
  const canReadSteps = permissions.some((permission) => 'accessType' in permission && permission.accessType === 'read' && 'recordType' in permission && permission.recordType === 'Steps');
  const canReadSleep = permissions.some((permission) => 'accessType' in permission && permission.accessType === 'read' && 'recordType' in permission && permission.recordType === 'SleepSession');
  if (!canReadSteps && !canReadSleep) throw healthPermissionUnavailableError();
  const days = calendarDays(dayCount);
  const start = new Date(days[0].date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(days[days.length - 1].date);
  end.setHours(23, 59, 59, 999);
  const request = {
    timeRangeFilter: { operator: 'between' as const, startTime: start.toISOString(), endTime: end.toISOString() },
    timeRangeSlicer: { period: 'DAYS' as const, length: 1 },
  };
  const [stepsResult, sleepResult] = await Promise.allSettled([
    canReadSteps ? aggregateGroupByPeriod({ recordType: 'Steps', ...request }) : Promise.resolve([]),
    canReadSleep ? aggregateGroupByPeriod({ recordType: 'SleepSession', ...request }) : Promise.resolve([]),
  ]);
  const steps = stepsResult.status === 'fulfilled' ? stepsResult.value : [];
  const sleep = sleepResult.status === 'fulfilled' ? sleepResult.value : [];
  if (stepsResult.status === 'rejected' && sleepResult.status === 'rejected') throw stepsResult.reason;
  const stepsByDate = new Map(steps.map((bucket) => [calendarDays(1, new Date(bucket.startTime))[0].key, Math.max(0, Math.round(bucket.result.COUNT_TOTAL ?? 0))]));
  const sleepByDate = new Map(sleep.map((bucket) => [calendarDays(1, new Date(bucket.startTime))[0].key, Math.max(0, Math.round((bucket.result.SLEEP_DURATION_TOTAL ?? 0) / 60))]));
  const updatedAt = new Date().toISOString();
  return days
    .filter((day) => stepsByDate.has(day.key) || sleepByDate.has(day.key))
    .map((day) => ({
      date: day.key,
      source: 'health-connect' as const,
      steps: stepsByDate.get(day.key),
      sleepMinutes: sleepByDate.get(day.key),
      updatedAt,
    }));
}

export async function openHealthSettings() {
  const { openHealthConnectSettings } = await healthConnect();
  openHealthConnectSettings();
}
