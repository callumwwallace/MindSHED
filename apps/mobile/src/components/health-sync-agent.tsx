import { useEffect } from 'react';

import { readHealthDailySummaries } from '@/lib/health-service';
import { isHealthPermissionUnavailable } from '@/lib/health-service-errors';
import { useWellness } from '@/store/wellness';

export function HealthSyncAgent() {
  const connected = useWellness((state) => state.healthConnected);
  const save = useWellness((state) => state.saveHealthDailySummaries);
  const disconnect = useWellness((state) => state.disconnectHealth);

  useEffect(() => {
    if (!connected) return;
    let cancelled = false;
    void readHealthDailySummaries(21)
      .then((summaries) => {
        if (!cancelled) save(summaries);
      })
      .catch((error) => {
        if (!cancelled && isHealthPermissionUnavailable(error)) disconnect();
        // The dedicated Phone health screen explains permission or platform
        // errors. Background refresh stays quiet and never alters consent.
      });
    return () => { cancelled = true; };
  }, [connected, disconnect, save]);

  return null;
}
