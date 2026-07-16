import * as Haptics from 'expo-haptics';
import * as Device from 'expo-device';

import { useWellness } from '@/store/wellness';

type HapticAction = () => Promise<void>;

// Haptics are an enhancement, never a requirement. This keeps an older
// development client usable until it is rebuilt with the native module.
function safely(action: HapticAction) {
  if (!useWellness.getState().hapticsEnabled) return;
  if (!Device.isDevice) return;
  try {
    void action().catch(() => undefined);
  } catch {
    // The native module is unavailable in this build.
  }
}

export const feedback = {
  select: () => safely(() => Haptics.selectionAsync()),
  soft: () => safely(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)),
  medium: () => safely(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  success: () => safely(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
};
