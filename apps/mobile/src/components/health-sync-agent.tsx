import { useEffect } from 'react';

import { readHealthDailySummaries } from '@/lib/health-service';
import { useWellness } from '@/store/wellness';

export function HealthSyncAgent() {
  const connected = useWellness((state) => state.healthConnected);
  const save = useWellness((state) => state.saveHealthDailySummaries);

  useEffect(() => {
    if (!connected) return;
    let cancelled = false;
    void readHealthDailySummaries(21)
      .then((summaries) => {
        if (!cancelled) save(summaries);
      })
      .catch(() => {
        // The dedicated Phone health screen explains permission or platform
        // errors. Background refresh stays quiet and never alters consent.
      });
    return () => { cancelled = true; };
  }, [connected, save]);

  return null;
}

