import assert from 'node:assert/strict';
import test from 'node:test';

import { notificationRouteFromData, parseNudgeTime } from './notification-route';

test('accepts only routes intentionally exposed to local notifications', () => {
  assert.equal(notificationRouteFromData({ route: '/check-in' }), '/check-in');
  assert.equal(notificationRouteFromData({ route: '/' }), '/');
  assert.equal(notificationRouteFromData({ route: '/privacy' }), null);
  assert.equal(notificationRouteFromData({ route: 'https://example.com' }), null);
  assert.equal(notificationRouteFromData(null), null);
});

test('accepts only complete 24-hour reminder times', () => {
  assert.deepEqual(parseNudgeTime('18:30'), { hour: 18, minute: 30 });
  assert.deepEqual(parseNudgeTime('00:00'), { hour: 0, minute: 0 });
  assert.equal(parseNudgeTime('24:00'), null);
  assert.equal(parseNudgeTime('09:60'), null);
  assert.equal(parseNudgeTime('9:30'), null);
  assert.equal(parseNudgeTime('18:30:00'), null);
});
