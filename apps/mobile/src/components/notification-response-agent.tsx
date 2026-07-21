import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { notificationRouteFromData } from '@/lib/notification-route';

export function NotificationResponseAgent() {
  const router = useRouter();

  useEffect(() => {
    const openResponse = (response: Notifications.NotificationResponse | null) => {
      if (!response || response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;
      const route = notificationRouteFromData(response.notification.request.content.data);
      if (route) router.push(route);
    };

    const initialResponse = Notifications.getLastNotificationResponse();
    openResponse(initialResponse);
    if (initialResponse) Notifications.clearLastNotificationResponse();

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      openResponse(response);
      Notifications.clearLastNotificationResponse();
    });
    return () => subscription.remove();
  }, [router]);

  return null;
}
