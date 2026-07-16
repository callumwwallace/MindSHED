import assert from 'node:assert/strict';
import test from 'node:test';

import { addCalendarDays, scoreSwemwbs, swemwbsSchedule } from './swemwbs';

test('scores complete SWEMWBS responses with the approved metric conversion', () => {
  assert.deepEqual(scoreSwemwbs([1, 1, 1, 1, 1, 1, 1]), { rawScore: 7, metricScore: 7 });
  assert.deepEqual(scoreSwemwbs([3, 3, 3, 3, 3, 3, 3]), { rawScore: 21, metricScore: 19.25 });
  assert.deepEqual(scoreSwemwbs([5, 5, 5, 5, 5, 5, 5]), { rawScore: 35, metricScore: 35 });
});

test('rejects incomplete or out-of-range SWEMWBS responses', () => {
  assert.throws(() => scoreSwemwbs([1, 2, 3]));
  assert.throws(() => scoreSwemwbs([0, 1, 1, 1, 1, 1, 1]));
});

test('uses calendar days for the fortnightly schedule across DST', () => {
  assert.equal(addCalendarDays('2026-03-22', 14), '2026-04-05');
  assert.deepEqual(swemwbsSchedule([], '2026-07-16'), { due: true, daysUntilDue: 0, nextDueDate: '2026-07-16' });
  assert.deepEqual(swemwbsSchedule(['2026-07-03'], '2026-07-16'), { due: false, daysUntilDue: 1, nextDueDate: '2026-07-17' });
  assert.deepEqual(swemwbsSchedule(['2026-07-03'], '2026-07-17'), { due: true, daysUntilDue: 0, nextDueDate: '2026-07-17' });
});
