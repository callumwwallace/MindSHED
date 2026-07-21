import assert from 'node:assert/strict';
import test from 'node:test';

import {
  actionReachedTerminalState,
  selectPendingPilotAction,
  type PendingPilotAction,
} from './pilot-governance-policy';

const consent: PendingPilotAction = {
  kind: 'consent',
  requestedAt: '2026-07-21T09:00:00.000Z',
  participantId: 'participant',
  participantToken: 'token',
  researchConsent: false,
  healthDataConsent: false,
  marketingConsent: false,
};
const withdrawal: PendingPilotAction = {
  kind: 'withdrawal',
  requestedAt: '2026-07-21T09:01:00.000Z',
  participantId: 'participant',
  deletionSecret: 'secret',
};
const deletion: PendingPilotAction = {
  kind: 'deletion',
  requestedAt: '2026-07-21T09:02:00.000Z',
  participantId: 'participant',
  deletionSecret: 'secret',
};

test('governance actions always take priority over ordinary consent changes', () => {
  assert.equal(selectPendingPilotAction(consent, withdrawal), withdrawal);
  assert.equal(selectPendingPilotAction(withdrawal, consent), withdrawal);
  assert.equal(selectPendingPilotAction(withdrawal, deletion), deletion);
  assert.equal(selectPendingPilotAction(deletion, withdrawal), deletion);
});

test('missing retained-away records complete stop and deletion requests', () => {
  assert.equal(actionReachedTerminalState(deletion, { data: { code: 'UNAUTHORIZED' } }), true);
  assert.equal(actionReachedTerminalState(withdrawal, { data: { code: 'NOT_FOUND' } }), true);
  assert.equal(actionReachedTerminalState(withdrawal, new Error('offline')), false);
});

test('server rejection of consent restoration completes a local opt-out', () => {
  assert.equal(actionReachedTerminalState(consent, { data: { code: 'PRECONDITION_FAILED' } }), true);
});
