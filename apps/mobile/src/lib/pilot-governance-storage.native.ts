import * as SecureStore from 'expo-secure-store';

import { selectPendingPilotAction, type PendingPilotAction } from './pilot-governance-policy';

const KEY = 'mindshed.pending-pilot-action.v1';

export async function getPendingPilotAction(): Promise<PendingPilotAction | null> {
  const value = await SecureStore.getItemAsync(KEY);
  return value ? JSON.parse(value) as PendingPilotAction : null;
}

export async function savePendingPilotAction(action: PendingPilotAction): Promise<PendingPilotAction> {
  const selected = selectPendingPilotAction(await getPendingPilotAction(), action);
  await SecureStore.setItemAsync(KEY, JSON.stringify(selected), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  return selected;
}

export async function clearPendingPilotAction(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY);
}
