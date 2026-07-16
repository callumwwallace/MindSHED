import type { HealthAccessResult } from './health-context';
import type { HealthDailySummary } from '@/store/wellness';

export function checkHealthAvailability(): Promise<HealthAccessResult>;
export function requestHealthAccess(): Promise<boolean>;
export function readHealthDailySummaries(days?: number): Promise<HealthDailySummary[]>;
export function openHealthSettings(): Promise<void>;

