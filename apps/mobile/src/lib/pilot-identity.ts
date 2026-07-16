import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PilotIdentity {
  participantId: string;
  participantToken: string;
  deletionSecret: string;
  enrolledAt: string;
}

const KEY = 'mindshed-pilot-identity.v1';

export async function getPilotIdentity(): Promise<PilotIdentity | null> {
  const value = await AsyncStorage.getItem(KEY);
  return value ? JSON.parse(value) as PilotIdentity : null;
}

export async function setPilotIdentity(identity: PilotIdentity): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(identity));
}

export async function clearPilotIdentity(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
