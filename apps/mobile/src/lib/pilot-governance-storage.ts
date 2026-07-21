import AsyncStorage from '@react-native-async-storage/async-storage';

import { selectPendingPilotAction, type PendingPilotAction } from './pilot-governance-policy';

const KEY = 'mindshed-pending-pilot-action.v1';

export async function getPendingPilotAction(): Promise<PendingPilotAction | null> {
  const value = await AsyncStorage.getItem(KEY);
  return value ? JSON.parse(value) as PendingPilotAction : null;
}

export async function savePendingPilotAction(action: PendingPilotAction): Promise<PendingPilotAction> {
  const selected = selectPendingPilotAction(await getPendingPilotAction(), action);
  await AsyncStorage.setItem(KEY, JSON.stringify(selected));
  return selected;
}

export async function clearPendingPilotAction(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
