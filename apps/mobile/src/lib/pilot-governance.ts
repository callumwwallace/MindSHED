import {
  PILOT_CONSENT_VERSION,
  PRIVACY_NOTICE_VERSION,
} from '@mindshed/shared';

import { clearDailyNudge } from './daily-nudge';
import { actionReachedTerminalState, type PendingPilotAction } from './pilot-governance-policy';
import {
  clearPendingPilotAction,
  getPendingPilotAction,
  savePendingPilotAction,
} from './pilot-governance-storage';
import { clearPilotIdentity, type PilotIdentity } from './pilot-identity';
import { apiClient } from './trpc';
import { clearPilotQueueDurably } from '@/store/pilot-queue';
import { clearWellnessDataDurably, flushWellnessPersistence, useWellness } from '@/store/wellness';

export type PilotGovernanceResult = {
  status: 'confirmed' | 'pending' | 'none';
  receipt?: string;
  recordAlreadyAbsent?: boolean;
};

async function stopResearchLocally(marketingConsent = false): Promise<void> {
  useWellness.getState().recordConsent({
    researchConsent: false,
    healthDataConsent: false,
    marketingConsent,
  });
  await clearPilotQueueDurably();
  await flushWellnessPersistence();
}

export async function endPilotIdentityLocally(): Promise<void> {
  await stopResearchLocally(false);
  await clearPilotIdentity();
}

export async function synchronizePendingPilotAction(): Promise<PilotGovernanceResult> {
  const action = await getPendingPilotAction();
  if (!action) return { status: 'none' };

  try {
    let receipt: string | undefined;
    if (action.kind === 'consent') {
      await apiClient.pilot.recordConsent.mutate({
        participantId: action.participantId,
        participantToken: action.participantToken,
        privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
        consentDocumentVersion: PILOT_CONSENT_VERSION,
        termsAccepted: true,
        researchConsent: false,
        healthDataConsent: false,
        marketingConsent: action.marketingConsent,
      });
    } else if (action.kind === 'withdrawal') {
      await apiClient.pilot.withdrawResearch.mutate({
        participantId: action.participantId,
        deletionSecret: action.deletionSecret,
      });
    } else {
      const result = await apiClient.pilot.deleteData.mutate({
        participantId: action.participantId,
        deletionSecret: action.deletionSecret,
      });
      receipt = result.receipt;
    }
    await clearPendingPilotAction();
    return { status: 'confirmed', ...(receipt ? { receipt } : {}) };
  } catch (error) {
    if (!actionReachedTerminalState(action, error)) return { status: 'pending' };

    // Retention may remove a pseudonymous server record before this device next
    // connects. The participant's stop/delete outcome is already satisfied, so
    // discard credentials instead of trapping the app in a false offline state.
    await clearPendingPilotAction();
    await clearPilotIdentity();
    return { status: 'confirmed', recordAlreadyAbsent: true };
  }
}

export async function requestResearchOptOut(
  identity: PilotIdentity,
  marketingConsent = false,
): Promise<PilotGovernanceResult> {
  const action: PendingPilotAction = {
    kind: 'consent',
    requestedAt: new Date().toISOString(),
    participantId: identity.participantId,
    participantToken: identity.participantToken,
    researchConsent: false,
    healthDataConsent: false,
    marketingConsent,
  };
  await savePendingPilotAction(action);
  await stopResearchLocally(marketingConsent);
  return synchronizePendingPilotAction();
}

export async function requestResearchWithdrawal(
  identity: PilotIdentity,
): Promise<PilotGovernanceResult> {
  const action: PendingPilotAction = {
    kind: 'withdrawal',
    requestedAt: new Date().toISOString(),
    participantId: identity.participantId,
    deletionSecret: identity.deletionSecret,
  };
  await savePendingPilotAction(action);
  await stopResearchLocally(false);
  return synchronizePendingPilotAction();
}

export async function requestLocalAndPilotDeletion(
  identity: PilotIdentity | null,
): Promise<PilotGovernanceResult> {
  if (identity) {
    await savePendingPilotAction({
      kind: 'deletion',
      requestedAt: new Date().toISOString(),
      participantId: identity.participantId,
      deletionSecret: identity.deletionSecret,
    });
  }

  await clearPilotQueueDurably();
  await clearWellnessDataDurably();
  await clearDailyNudge().catch(() => undefined);
  await clearPilotIdentity();

  return identity ? synchronizePendingPilotAction() : { status: 'confirmed' };
}
