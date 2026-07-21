import { useEffect } from 'react';
import { AppState } from 'react-native';

import { schedulePilotFlush } from '@/store/pilot-queue';
import { synchronizePendingPilotAction } from '@/lib/pilot-governance';

export function PilotSyncAgent() {
  useEffect(() => {
    const sync = async () => {
      const governance = await synchronizePendingPilotAction();
      if (governance.status !== 'pending') schedulePilotFlush();
    };
    void sync();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void sync();
    });
    return () => subscription.remove();
  }, []);
  return null;
}
