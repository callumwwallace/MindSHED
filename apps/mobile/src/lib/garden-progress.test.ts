import assert from 'node:assert/strict';
import test from 'node:test';

import { GARDEN_MILESTONES, gardenGrowthSummary, getGardenProgress, getGardenRestState } from './garden-progress';

test('every garden level has the correct unlocked, current and next chapter', () => {
  for (let level = 0; level <= 24; level += 1) {
    const progress = getGardenProgress(level);
    const expected = GARDEN_MILESTONES.filter((milestone) => milestone.at <= level);
    assert.deepEqual(progress.unlocked.map((item) => item.id), expected.map((item) => item.id));
    assert.equal(progress.current?.id, expected.at(-1)?.id);
    assert.equal(progress.next?.id, GARDEN_MILESTONES.find((item) => item.at > level)?.id);
    assert.ok(progress.progressToNext >= 0 && progress.progressToNext <= 1);
  }
});

test('every threshold produces a named unlock state', () => {
  for (const milestone of GARDEN_MILESTONES) {
    const progress = getGardenProgress(milestone.at);
    assert.equal(progress.justUnlocked?.id, milestone.id);
    const update = gardenGrowthSummary(milestone.at);
    assert.equal(update.eyebrow, 'A NEW GARDEN CHAPTER');
    assert.equal(update.title, milestone.title);
  }
});

test('garden ambience rests over time without removing earned progress', () => {
  assert.equal(getGardenRestState([], '2026-07-16').id, 'waiting');
  assert.equal(getGardenRestState(['2026-07-16'], '2026-07-16').id, 'bright');
  assert.equal(getGardenRestState(['2026-07-14'], '2026-07-16').id, 'bright');
  assert.equal(getGardenRestState(['2026-07-13'], '2026-07-16').id, 'quiet');
  assert.equal(getGardenRestState(['2026-07-10'], '2026-07-16').id, 'quiet');
  assert.equal(getGardenRestState(['2026-07-09'], '2026-07-16').id, 'resting');
  assert.equal(getGardenRestState(['2026-07-16'], '2026-07-20').daysSinceLastCheckin, 4);

  const before = getGardenProgress(10).unlocked.map((item) => item.id);
  getGardenRestState(['2026-06-01'], '2026-07-16');
  assert.deepEqual(getGardenProgress(10).unlocked.map((item) => item.id), before);
});
