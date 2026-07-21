import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { parseNudgeTime } from './notification-route';

const NUDGE_KIND = 'mindshed-daily-nudge';
const CHANNEL_ID = 'gentle-reminders';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export type NudgeResult = 'scheduled' | 'disabled' | 'denied' | 'unavailable';

async function cancelExistingNudges(): Promise<void> {
  if (Platform.OS === 'web') return;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((request) => request.content.data?.kind === NUDGE_KIND)
      .map((request) => Notifications.cancelScheduledNotificationAsync(request.identifier)),
  );
}

function notificationsAllowed(settings: Notifications.NotificationPermissionsStatus): boolean {
  return settings.granted
    || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

export async function configureDailyNudge(enabled: boolean, time: string): Promise<NudgeResult> {
  if (Platform.OS === 'web') return 'unavailable';
  await cancelExistingNudges();
  if (!enabled) return 'disabled';

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Gentle reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 120],
      sound: null,
    });
  }

  let permissions = await Notifications.getPermissionsAsync();
  if (!notificationsAllowed(permissions)) {
    permissions = await Notifications.requestPermissionsAsync();
  }
  if (!notificationsAllowed(permissions)) return 'denied';

  const parsedTime = parseNudgeTime(time);
  if (!parsedTime) return 'unavailable';

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'A quiet note from Bramble',
      body: 'I’m pottering in the garden if a small check-in would help.',
      sound: false,
      data: { kind: NUDGE_KIND, route: '/check-in' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: parsedTime.hour,
      minute: parsedTime.minute,
      channelId: Platform.OS === 'android' ? CHANNEL_ID : undefined,
    },
  });
  return 'scheduled';
}

export async function clearDailyNudge(): Promise<void> {
  await cancelExistingNudges();
}
