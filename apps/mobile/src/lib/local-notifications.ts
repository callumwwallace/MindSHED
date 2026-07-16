import type { Checkin } from '@/store/wellness';

export interface LocalGardenNotification {
  id: string;
  icon: string;
  title: string;
  detail: string;
  time: string;
}

export function buildLocalNotifications(
  gardenGrowth: number,
  checkins: Checkin[],
): LocalGardenNotification[] {
  const latestCheckin = [...checkins].sort((a, b) => b.date.localeCompare(a.date))[0];

  return [
    ...(gardenGrowth
      ? [{
          id: `garden-${gardenGrowth}`,
          icon: 'sun',
          title: 'Something changed outside',
          detail: `Your garden now carries ${gardenGrowth} ${gardenGrowth === 1 ? 'moment' : 'moments'} of care.`,
          time: 'Today',
        }]
      : []),
    ...(latestCheckin
      ? [{
          id: `checkin-${latestCheckin.date}`,
          icon: 'book-open',
          title: 'A note from Bramble',
          detail: 'Your latest check-in is now part of this week’s local pattern.',
          time: 'Today',
        }]
      : []),
  ];
}

