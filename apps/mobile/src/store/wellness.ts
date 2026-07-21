import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { flushLocalPrivateStorageWrites, localPrivateStorage } from '@/lib/local-private-storage';
import { scoreSwemwbs } from '@/lib/swemwbs';

// Local-first private state. Research-eligible structured events are copied to
// the separate encrypted pilot queue; free text never leaves this store.

export interface Checkin {
  date: string; // YYYY-MM-DD
  mood: number; // 1–5
  energy: number; // 0–10
  stress: number; // 0–10
  note?: string;
  needs?: string[];
}

export interface Task {
  id: string;
  title: string;
  icon: string; // Feather icon name
  color: string;
  done: boolean;
}

export interface JournalEntry {
  id: string;
  date: string; // ISO
  text: string;
}

export interface WellbeingPulse {
  id: string;
  completedAt: string;
  completedDate: string;
  instrument: 'SWEMWBS';
  instrumentVersion: 'swemwbs-7-en-gb-v1';
  responses: number[];
  rawScore: number;
  metricScore: number;
}

export interface PulseDraft {
  responses: (number | null)[];
  updatedAt: string;
}

export interface HealthDailySummary {
  date: string;
  source: 'apple-health' | 'health-connect';
  steps?: number;
  sleepMinutes?: number;
  updatedAt: string;
}

export function todayKey(): string {
  // Use the user's local calendar day. ISO timestamps are UTC and made the
  // daily plan roll over an hour late during British Summer Time.
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function defaultTasks(): Task[] {
  return [
    { id: 't1', title: '2-minute breathing', icon: 'wind', color: '#B6FFB1', done: false },
    { id: 't2', title: 'Step outside between lectures', icon: 'sun', color: '#FFDC75', done: false },
    { id: 't3', title: 'One-line reflection', icon: 'edit-3', color: '#FFB173', done: false },
  ];
}

interface WellnessState {
  hasHydrated: boolean;
  onboardingComplete: boolean;
  appConsentAcceptedAt?: string;
  researchConsent: boolean;
  healthDataConsent: boolean;
  marketingConsent: boolean;
  researchConsentUpdatedAt?: string;
  seenNotificationIds: string[];
  checkins: Checkin[];
  tasks: Task[];
  tasksDate: string;
  journal: JournalEntry[];
  wellbeingPulses: WellbeingPulse[];
  pulseDraft?: PulseDraft;
  gardenGrowth: number;
  growthPending: boolean;
  profileName: string;
  nudgeEnabled: boolean;
  nudgeTime: string;
  healthConnected: boolean;
  healthDailySummaries: HealthDailySummary[];
  healthLastSyncedAt?: string;
  reduceMotion: boolean;
  ambientSound: boolean;
  hapticsEnabled: boolean;
  carePlan: {
    warningSigns: string;
    helps: string;
    supportName: string;
    supportContact: string;
  };
  ensureToday: () => void;
  submitCheckin: (c: Omit<Checkin, 'date'>) => void;
  toggleTask: (id: string) => void;
  addTask: (title: string, icon: string, color: string) => void;
  removeTask: (id: string) => void;
  addJournalEntry: (text: string) => void;
  updateJournalEntry: (id: string, text: string) => void;
  deleteJournalEntry: (id: string) => void;
  savePulseDraft: (responses: (number | null)[]) => void;
  completeWellbeingPulse: (responses: number[]) => WellbeingPulse;
  clearGrowth: () => void;
  setProfileName: (name: string) => void;
  setNudge: (enabled: boolean, time?: string) => void;
  setHealthConnected: (connected: boolean) => void;
  saveHealthDailySummaries: (summaries: HealthDailySummary[]) => void;
  disconnectHealth: () => void;
  setReduceMotion: (enabled: boolean) => void;
  setAmbientSound: (enabled: boolean) => void;
  setHapticsEnabled: (enabled: boolean) => void;
  setCarePlan: (carePlan: WellnessState['carePlan']) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  recordConsent: (choices: {
    researchConsent: boolean;
    healthDataConsent: boolean;
    marketingConsent: boolean;
  }) => void;
  completeOnboarding: () => void;
  markNotificationsSeen: (ids: string[]) => void;
  clearLocalWellnessData: () => void;
}

export const useWellness = create<WellnessState>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      onboardingComplete: false,
      appConsentAcceptedAt: undefined,
      researchConsent: false,
      healthDataConsent: false,
      marketingConsent: false,
      researchConsentUpdatedAt: undefined,
      seenNotificationIds: [],
      checkins: [],
      tasks: defaultTasks(),
      tasksDate: todayKey(),
      journal: [],
      wellbeingPulses: [],
      pulseDraft: undefined,
      gardenGrowth: 0,
      growthPending: false,
      profileName: '',
      nudgeEnabled: false,
      nudgeTime: '18:30',
      healthConnected: false,
      healthDailySummaries: [],
      healthLastSyncedAt: undefined,
      reduceMotion: false,
      ambientSound: false,
      hapticsEnabled: true,
      carePlan: {
        warningSigns: '',
        helps: '',
        supportName: '',
        supportContact: '',
      },

      ensureToday: () => {
        if (get().tasksDate !== todayKey()) {
          set({ tasks: defaultTasks(), tasksDate: todayKey() });
        }
      },

      submitCheckin: (c) => {
        const date = todayKey();
        const others = get().checkins.filter((x) => x.date !== date);
        const isFirstToday = others.length === get().checkins.length;
        set({
          checkins: [...others, { ...c, date }],
          gardenGrowth: isFirstToday ? get().gardenGrowth + 1 : get().gardenGrowth,
          growthPending: isFirstToday,
        });
      },

      toggleTask: (id) =>
        set({
          tasks: get().tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
        }),

      addTask: (title, icon, color) =>
        set({
          tasks: get().tasks.some((task) => task.title === title)
            ? get().tasks
            : [...get().tasks, { id: `t${Date.now()}`, title, icon, color, done: false }],
        }),

      removeTask: (id) => set({ tasks: get().tasks.filter((task) => task.id !== id) }),

      addJournalEntry: (text) =>
        set({
          journal: [
            { id: `j${Date.now()}`, date: new Date().toISOString(), text },
            ...get().journal,
          ],
        }),

      updateJournalEntry: (id, text) =>
        set({
          journal: get().journal.map((entry) => entry.id === id ? { ...entry, text } : entry),
        }),

      deleteJournalEntry: (id) =>
        set({ journal: get().journal.filter((entry) => entry.id !== id) }),

      savePulseDraft: (responses) => set({
        pulseDraft: { responses, updatedAt: new Date().toISOString() },
      }),

      completeWellbeingPulse: (responses) => {
        const score = scoreSwemwbs(responses);
        const pulse: WellbeingPulse = {
          id: `pulse-${Date.now()}`,
          completedAt: new Date().toISOString(),
          completedDate: todayKey(),
          instrument: 'SWEMWBS',
          instrumentVersion: 'swemwbs-7-en-gb-v1',
          responses: [...responses],
          rawScore: score.rawScore,
          metricScore: score.metricScore,
        };
        set({ wellbeingPulses: [...get().wellbeingPulses, pulse], pulseDraft: undefined });
        return pulse;
      },

      clearGrowth: () => set({ growthPending: false }),
      setProfileName: (profileName) => set({ profileName }),
      setNudge: (nudgeEnabled, nudgeTime) => set({
        nudgeEnabled,
        ...(nudgeTime ? { nudgeTime } : {}),
      }),
      setHealthConnected: (healthConnected) => set({ healthConnected }),
      saveHealthDailySummaries: (healthDailySummaries) => set({
        healthDailySummaries,
        healthLastSyncedAt: new Date().toISOString(),
      }),
      disconnectHealth: () => set({
        healthConnected: false,
        healthDailySummaries: [],
        healthLastSyncedAt: undefined,
      }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      setAmbientSound: (ambientSound) => set({ ambientSound }),
      setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
      setCarePlan: (carePlan) => set({ carePlan }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      recordConsent: ({ researchConsent, healthDataConsent, marketingConsent }) => {
        const now = new Date().toISOString();
        set({
          appConsentAcceptedAt: get().appConsentAcceptedAt ?? now,
          researchConsent,
          healthDataConsent,
          marketingConsent,
          researchConsentUpdatedAt: now,
        });
      },
      completeOnboarding: () => set({ onboardingComplete: true }),
      markNotificationsSeen: (ids) => set({
        seenNotificationIds: Array.from(new Set([...get().seenNotificationIds, ...ids])).slice(-40),
      }),
      clearLocalWellnessData: () => set({
        onboardingComplete: false,
        appConsentAcceptedAt: undefined,
        researchConsent: false,
        healthDataConsent: false,
        marketingConsent: false,
        researchConsentUpdatedAt: undefined,
        seenNotificationIds: [],
        checkins: [],
        tasks: [],
        tasksDate: todayKey(),
        journal: [],
        wellbeingPulses: [],
        pulseDraft: undefined,
        gardenGrowth: 0,
        growthPending: false,
        profileName: '',
        nudgeEnabled: false,
        nudgeTime: '18:30',
        healthConnected: false,
        healthDailySummaries: [],
        healthLastSyncedAt: undefined,
        reduceMotion: false,
        ambientSound: false,
        hapticsEnabled: true,
        carePlan: { warningSigns: '', helps: '', supportName: '', supportContact: '' },
      }),
    }),
    {
      name: 'mindshed-wellness',
      storage: createJSONStorage(() => localPrivateStorage),
      version: 6,
      partialize: ({ hasHydrated: _hasHydrated, ...state }) => state,
      onRehydrateStorage: () => (state) => {
        if (state) state.setHasHydrated(true);
        else useWellness.setState({ hasHydrated: true });
      },
      migrate: (persistedState, version) => {
        const previous = persistedState as Partial<WellnessState> & { flowers?: number; bloomPending?: boolean };
        const hasExistingUse = Boolean(
          previous.profileName?.trim()
          || previous.checkins?.length
          || previous.journal?.length
          || previous.gardenGrowth
          || previous.flowers,
        );
        return {
          ...previous,
          gardenGrowth: previous.gardenGrowth ?? previous.flowers ?? 0,
          growthPending: previous.growthPending ?? previous.bloomPending ?? false,
          onboardingComplete: previous.onboardingComplete ?? (version < 3 && hasExistingUse),
          healthDataConsent: previous.healthDataConsent ?? false,
          marketingConsent: previous.marketingConsent ?? false,
          wellbeingPulses: previous.wellbeingPulses ?? [],
          pulseDraft: previous.pulseDraft,
          healthConnected: previous.healthConnected ?? false,
          healthDailySummaries: previous.healthDailySummaries ?? [],
          healthLastSyncedAt: previous.healthLastSyncedAt,
        } as WellnessState;
      },
    },
  ),
);

export function useTodayCheckin(): Checkin | undefined {
  return useWellness((s) => s.checkins.find((c) => c.date === todayKey()));
}

export async function flushWellnessPersistence(): Promise<void> {
  await flushLocalPrivateStorageWrites();
}

export async function clearWellnessDataDurably(): Promise<void> {
  useWellness.getState().clearLocalWellnessData();
  await flushLocalPrivateStorageWrites();
  await useWellness.persist.clearStorage();
  await flushLocalPrivateStorageWrites();
}
