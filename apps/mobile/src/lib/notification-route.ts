export const NOTIFICATION_ROUTES = ['/', '/check-in'] as const;

export type NotificationRoute = (typeof NOTIFICATION_ROUTES)[number];

export function parseNudgeTime(time: string): { hour: number; minute: number } | null {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59 ? { hour, minute } : null;
}

export function notificationRouteFromData(data: unknown): NotificationRoute | null {
  if (!data || typeof data !== 'object') return null;
  const route = (data as { route?: unknown }).route;
  return typeof route === 'string' && NOTIFICATION_ROUTES.includes(route as NotificationRoute)
    ? route as NotificationRoute
    : null;
}
