import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { PilotIdentity } from './pilot-identity';

const KEY = 'mindshed.pilot-identity.v1';
const LEGACY_KEY = 'mindshed-pilot-identity.v1';

export async function getPilotIdentity(): Promise<PilotIdentity | null> {
  const value = await SecureStore.getItemAsync(KEY);
  if (value) return JSON.parse(value) as PilotIdentity;

  const legacyValue = await AsyncStorage.getItem(LEGACY_KEY);
  if (!legacyValue) return null;
  const identity = JSON.parse(legacyValue) as PilotIdentity;
  await setPilotIdentity(identity);
  await AsyncStorage.removeItem(LEGACY_KEY);
  return identity;
}

export async function setPilotIdentity(identity: PilotIdentity): Promise<void> {
  await SecureStore.setItemAsync(KEY, JSON.stringify(identity), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function clearPilotIdentity(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY);
}
