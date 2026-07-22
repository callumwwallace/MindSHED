import assert from 'node:assert/strict';
import test from 'node:test';

import { habitReturnsInLastDays, recentHabitDays, type Habit } from './habits';

const habit: Habit = {
  id: 'habit-1',
  title: 'Step outside',
  tinyVersion: 'Open a window',
  rhythm: 'daily',
  createdAt: '2026-07-01T10:00:00.000Z',
  completions: ['2026-07-14', '2026-07-16', '2026-07-16', '2026-07-20'],
  paused: false,
};

test('habit return counts are bounded, unique and never treat future days as complete', () => {
  assert.equal(habitReturnsInLastDays(habit, '2026-07-20'), 3);
  assert.equal(habitReturnsInLastDays(habit, '2026-07-16'), 2);
  assert.equal(habitReturnsInLastDays(habit, 'invalid'), 0);
});

test('recent habit days preserve visible gaps without streak logic', () => {
  const days = recentHabitDays(habit, '2026-07-20');
  assert.equal(days.length, 7);
  assert.equal(days[0]?.key, '2026-07-14');
  assert.equal(days.at(-1)?.key, '2026-07-20');
  assert.deepEqual(days.filter((day) => day.completed).map((day) => day.key), ['2026-07-14', '2026-07-16', '2026-07-20']);
});
