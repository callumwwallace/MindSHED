import assert from 'node:assert/strict';
import test from 'node:test';

import { findHealthContextDifferences, mergeIntervalsByDay } from './health-context';
import type { Checkin, HealthDailySummary } from '@/store/wellness';

test('merges overlapping sleep stages instead of double-counting them', () => {
  const day = new Date(2026, 6, 15, 12);
  const totals = mergeIntervalsByDay([
    { start: new Date(2026, 6, 15, 0), end: new Date(2026, 6, 15, 4) },
    { start: new Date(2026, 6, 15, 3), end: new Date(2026, 6, 15, 7) },
  ], [{ date: day, key: '2026-07-15' }]);
  assert.equal(totals.get('2026-07-15'), 420);
});

test('requires at least three days in both comparison groups', () => {
  const checkins: Checkin[] = Array.from({ length: 5 }, (_, index) => ({
    date: `2026-07-${String(index + 1).padStart(2, '0')}`,
    mood: index < 2 ? 2 : 4,
    energy: index < 2 ? 2 : 8,
    stress: 5,
  }));
  const health: HealthDailySummary[] = checkins.map((checkin, index) => ({
    date: checkin.date,
    source: 'apple-health',
    sleepMinutes: index < 2 ? 360 : 480,
    updatedAt: '2026-07-16T12:00:00.000Z',
  }));
  assert.deepEqual(findHealthContextDifferences(checkins, health), []);
});

test('describes a sufficiently repeated difference without claiming causation', () => {
  const checkins: Checkin[] = Array.from({ length: 6 }, (_, index) => ({
    date: `2026-07-${String(index + 1).padStart(2, '0')}`,
    mood: 3,
    energy: index < 3 ? 3 : 8,
    stress: 5,
  }));
  const health: HealthDailySummary[] = checkins.map((checkin, index) => ({
    date: checkin.date,
    source: 'health-connect',
    sleepMinutes: index < 3 ? 360 : 480,
    updatedAt: '2026-07-16T12:00:00.000Z',
  }));
  const [difference] = findHealthContextDifferences(checkins, health);
  assert.equal(difference.kind, 'sleep');
  assert.match(difference.detail, /not a cause/);
});

