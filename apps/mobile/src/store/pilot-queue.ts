import {
  PILOT_SCHEMA_VERSION,
  SWEMWBS_INSTRUMENT,
  SWEMWBS_INSTRUMENT_VERSION,
  type PilotEvent,
} from '@mindshed/shared';
import * as Crypto from 'expo-crypto';
import Constants from 'expo-constants';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { localPrivateStorage } from '@/lib/local-private-storage';
import { getPilotIdentity } from '@/lib/pilot-identity';
import { apiClient } from '@/lib/trpc';
import { compareVersions } from '@/lib/app-version';
import { isPermanentPilotError, relativePilotDay } from '@/lib/pilot-policy';
import { useWellness, type Checkin, type WellbeingPulse } from '@/store/wellness';

interface PilotQueueState {
  events: PilotEvent[];
  failureCount: number;
  nextAttemptAt: number;
  blockedReason?: string;
  droppedEvents: number;
  enqueue: (event: PilotEvent) => void;
  acknowledge: (eventIds: string[]) => void;
  setRetry: (failureCount: number, nextAttemptAt: number) => void;
  setBlocked: (blockedReason?: string) => void;
  clear: () => void;
}

export const usePilotQueue = create<PilotQueueState>()(
  persist(
    (set, get) => ({
      events: [],
      failureCount: 0,
      nextAttemptAt: 0,
      blockedReason: undefined,
      droppedEvents: 0,
      enqueue: (event) => {
        if (get().events.some((queued) => queued.eventId === event.eventId)) return;
        const next = [...get().events, event];
        const overflow = Math.max(0, next.length - 500);
        set({
          events: next.slice(-500),
          droppedEvents: get().droppedEvents + overflow,
        });
      },
      acknowledge: (eventIds) => {
        const acknowledged = new Set(eventIds);
        set({
          events: get().events.filter((event) => !acknowledged.has(event.eventId)),
          failureCount: 0,
          nextAttemptAt: 0,
        });
      },
      setRetry: (failureCount, nextAttemptAt) => set({ failureCount, nextAttemptAt }),
      setBlocked: (blockedReason) => set({ blockedReason, nextAttemptAt: 0 }),
      clear: () => set({ events: [], failureCount: 0, nextAttemptAt: 0, blockedReason: undefined, droppedEvents: 0 }),
    }),
    {
      name: 'mindshed-pilot-event-queue',
      storage: createJSONStorage(() => localPrivateStorage),
      version: 2,
      migrate: (persisted) => ({
        ...(persisted as PilotQueueState),
        blockedReason: (persisted as Partial<PilotQueueState>).blockedReason,
        droppedEvents: (persisted as Partial<PilotQueueState>).droppedEvents ?? 0,
      }),
    },
  ),
);

const needMap: Record<string, 'calm' | 'grounding' | 'focus' | 'rest' | 'connection' | undefined> = {
  Calm: 'calm',
  Grounding: 'grounding',
  Rest: 'rest',
  Connection: 'connection',
  Focus: 'focus',
};

export async function queuePilotCheckin(checkin: Omit<Checkin, 'date'>): Promise<void> {
  const consent = useWellness.getState();
  if (!consent.researchConsent || !consent.healthDataConsent) return;
  const identity = await getPilotIdentity();
  if (!identity) return;

  const needs = Array.from(
    new Set((checkin.needs ?? []).map((need) => needMap[need]).filter((need) => need !== undefined)),
  ).slice(0, 3);
  usePilotQueue.getState().enqueue({
    eventId: Crypto.randomUUID(),
    schemaVersion: PILOT_SCHEMA_VERSION,
    relativeDay: relativePilotDay(identity.enrolledAt),
    kind: 'checkin',
    payload: {
      mood: checkin.mood,
      energy: checkin.energy,
      stress: checkin.stress,
      needs,
    },
  });
  schedulePilotFlush();
}

export async function queuePilotWellbeingPulse(pulse: WellbeingPulse): Promise<void> {
  if (process.env.EXPO_PUBLIC_ENABLE_SWEMWBS_UPLOADS !== 'true') return;
  const consent = useWellness.getState();
  if (!consent.researchConsent || !consent.healthDataConsent) return;
  const identity = await getPilotIdentity();
  if (!identity) return;

  usePilotQueue.getState().enqueue({
    eventId: Crypto.randomUUID(),
    schemaVersion: PILOT_SCHEMA_VERSION,
    relativeDay: relativePilotDay(identity.enrolledAt),
    kind: 'pulse',
    payload: {
      instrument: SWEMWBS_INSTRUMENT,
      instrumentVersion: SWEMWBS_INSTRUMENT_VERSION,
      responses: pulse.responses,
      rawScore: pulse.rawScore,
      metricScore: pulse.metricScore,
    },
  });
  schedulePilotFlush();
}

let flushPromise: Promise<void> | undefined;
let flushTimer: ReturnType<typeof setTimeout> | undefined;

export function schedulePilotFlush(delay = 5_000 + Math.floor(Math.random() * 25_000)): void {
  if (usePilotQueue.getState().blockedReason) return;
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = undefined;
    void flushPilotEvents().catch(() => {
      // Retry state is persisted and another jittered attempt is scheduled below.
    });
  }, delay);
}

export async function retryPilotEventsNow(): Promise<void> {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = undefined;
  }
  usePilotQueue.getState().setRetry(0, 0);
  usePilotQueue.getState().setBlocked(undefined);
  await flushPilotEvents();
}

export async function flushPilotEvents(): Promise<void> {
  if (flushPromise) return flushPromise;
  flushPromise = (async () => {
    const identity = await getPilotIdentity();
    const consent = useWellness.getState();
    if (!identity || !consent.researchConsent || !consent.healthDataConsent) return;

    const queue = usePilotQueue.getState();
    if (queue.blockedReason) return;
    if (queue.nextAttemptAt > Date.now()) {
      schedulePilotFlush(queue.nextAttemptAt - Date.now());
      return;
    }
    const events = queue.events.slice(0, 50);
    if (!events.length) return;
    try {
      const config = await apiClient.pilot.config.query();
      const appVersion = Constants.expoConfig?.version ?? '0.0.0';
      if (compareVersions(appVersion, config.minimumAppVersion) < 0) {
        usePilotQueue.getState().setBlocked(`MindSHED ${config.minimumAppVersion} or newer is required before pilot uploads can continue.`);
        return;
      }
      await apiClient.pilot.ingest.mutate({
        participantId: identity.participantId,
        participantToken: identity.participantToken,
        events,
      });
      usePilotQueue.getState().acknowledge(events.map((event) => event.eventId));
      if (usePilotQueue.getState().events.length) schedulePilotFlush();
    } catch (error) {
      if (isPermanentPilotError(error)) {
        usePilotQueue.getState().setBlocked('Pilot uploads need attention. Review consent and service status before trying again.');
        throw error;
      }
      const failureCount = Math.min(queue.failureCount + 1, 8);
      const baseDelay = Math.min(5 * 60_000, 5_000 * 2 ** (failureCount - 1));
      const retryDelay = baseDelay + Math.floor(Math.random() * Math.max(1_000, baseDelay / 2));
      usePilotQueue.getState().setRetry(failureCount, Date.now() + retryDelay);
      schedulePilotFlush(retryDelay);
      throw error;
    }
  })().finally(() => {
    flushPromise = undefined;
  });
  return flushPromise;
}
