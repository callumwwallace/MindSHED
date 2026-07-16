import * as SecureStore from 'expo-secure-store';

import type { PilotIdentity } from './pilot-identity';

const KEY = 'mindshed.pilot-identity.v1';

export async function getPilotIdentity(): Promise<PilotIdentity | null> {
  const value = await SecureStore.getItemAsync(KEY);
  return value ? JSON.parse(value) as PilotIdentity : null;
}

export async function setPilotIdentity(identity: PilotIdentity): Promise<void> {
  await SecureStore.setItemAsync(KEY, JSON.stringify(identity), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function clearPilotIdentity(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY);
}
