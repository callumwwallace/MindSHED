import assert from 'node:assert/strict';
import test from 'node:test';

import { toggleNeedSelection } from './checkin-policy';

test('check-in needs match the maximum accepted by the research schema', () => {
  assert.deepEqual(toggleNeedSelection(['Calm', 'Rest', 'Focus'], 'Connection'), ['Calm', 'Rest', 'Focus']);
  assert.deepEqual(toggleNeedSelection(['Calm', 'Rest'], 'Connection'), ['Calm', 'Rest', 'Connection']);
});

test('nothing yet remains an exclusive local choice', () => {
  assert.deepEqual(toggleNeedSelection(['Calm', 'Rest'], 'Nothing yet'), ['Nothing yet']);
  assert.deepEqual(toggleNeedSelection(['Nothing yet'], 'Focus'), ['Focus']);
});
