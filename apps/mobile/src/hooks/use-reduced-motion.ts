import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

import { useWellness } from '@/store/wellness';

export function useReducedMotion(): boolean {
  const preference = useWellness((state) => state.reduceMotion);
  const [systemPreference, setSystemPreference] = useState(false);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setSystemPreference);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setSystemPreference);
    return () => subscription.remove();
  }, []);

  return preference || systemPreference;
}
