import { useEffect, useState } from 'react';
import { AppState, type AppStateStatus, View } from 'react-native';

import { MS } from '@/constants/mindshed';

export function PrivacyShield() {
  const [state, setState] = useState<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', setState);
    return () => subscription.remove();
  }, []);

  if (state === 'active') return null;
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={{ position: 'absolute', inset: 0, zIndex: 1000, backgroundColor: MS.color.cream }}
    />
  );
}
