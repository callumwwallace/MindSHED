import type { HealthAccessResult } from './health-context';
import type { HealthDailySummary } from '@/store/wellness';

export async function checkHealthAvailability(): Promise<HealthAccessResult> {
  return { available: false, source: 'none', reason: 'Phone health connections are available in the iOS and Android apps.' };
}

export async function requestHealthAccess() {
  return false;
}

export async function readHealthDailySummaries(): Promise<HealthDailySummary[]> {
  return [];
}

export async function openHealthSettings() {}

