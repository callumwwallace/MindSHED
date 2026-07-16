import { useEffect } from 'react';
import { AppState } from 'react-native';

import { schedulePilotFlush } from '@/store/pilot-queue';

export function PilotSyncAgent() {
  useEffect(() => {
    const sync = () => {
      schedulePilotFlush();
    };
    sync();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') sync();
    });
    return () => subscription.remove();
  }, []);
  return null;
}
