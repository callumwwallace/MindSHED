import assert from 'node:assert/strict';
import test from 'node:test';

import { coalescePilotEvents, isPermanentPilotError, relativePilotDay } from './pilot-policy';

test('uses UTC calendar days across daylight-saving boundaries', () => {
  assert.equal(relativePilotDay('2026-03-28T23:30:00.000Z', new Date('2026-03-29T00:30:00.000Z')), 1);
  assert.equal(relativePilotDay('2026-10-24T23:30:00.000Z', new Date('2026-10-25T00:30:00.000Z')), 1);
});

test('clamps relative study days to the approved schema range', () => {
  assert.equal(relativePilotDay('2027-01-02T00:00:00.000Z', new Date('2027-01-01T00:00:00.000Z')), 0);
  assert.equal(relativePilotDay('2025-01-01T00:00:00.000Z', new Date('2027-01-01T00:00:00.000Z')), 366);
});

test('separates permanent consent and credential failures from network retries', () => {
  assert.equal(isPermanentPilotError({ data: { code: 'FORBIDDEN' } }), true);
  assert.equal(isPermanentPilotError({ data: { code: 'UNAUTHORIZED' } }), true);
  assert.equal(isPermanentPilotError({ data: { code: 'TIMEOUT' } }), false);
  assert.equal(isPermanentPilotError(new Error('offline')), false);
});

test('keeps only the latest queued event of each kind for a relative day', () => {
  const first = {
    eventId: '46cc4d1f-1689-4566-811c-5118d40f3277',
    schemaVersion: 1 as const,
    relativeDay: 4,
    kind: 'checkin' as const,
    payload: { mood: 2, energy: 4, stress: 7, needs: ['rest' as const] },
  };
  const edited = {
    ...first,
    eventId: 'c4bf585f-9fe6-4780-acd1-5d3c23d17606',
    payload: { ...first.payload, mood: 3 },
  };
  assert.deepEqual(coalescePilotEvents([first], edited), [edited]);
  assert.deepEqual(coalescePilotEvents([first], first), [first]);
});
