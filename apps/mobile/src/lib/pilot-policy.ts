import type { PilotEvent } from '@mindshed/shared';

export function relativePilotDay(enrolledAt: string, now = new Date()): number {
  const start = new Date(enrolledAt);
  const startDay = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
  const currentDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.max(0, Math.min(366, Math.floor((currentDay - startDay) / 86_400_000)));
}

export function isPermanentPilotError(error: unknown): boolean {
  const code = (error as { data?: { code?: string } })?.data?.code;
  return ['BAD_REQUEST', 'UNAUTHORIZED', 'FORBIDDEN', 'CONFLICT', 'PRECONDITION_FAILED'].includes(code ?? '');
}

export function coalescePilotEvents(events: readonly PilotEvent[], requested: PilotEvent): PilotEvent[] {
  if (events.some((event) => event.eventId === requested.eventId)) return [...events];
  return [
    ...events.filter(
      (event) => event.relativeDay !== requested.relativeDay || event.kind !== requested.kind,
    ),
    requested,
  ];
}
