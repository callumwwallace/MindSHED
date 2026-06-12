import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Local-first mock data layer for the UI shell. Screens only ever talk to
// this store; when the API lands, sync happens here and screens don't change.

export interface Checkin {
  date: string; // YYYY-MM-DD
  mood: number; // 1–5
  energy: number; // 0–10
  stress: number; // 0–10
  note?: string;
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

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function defaultTasks(): Task[] {
  return [
    { id: 't1', title: '2-minute breathing', icon: 'wind', color: '#B6FFB1', done: false },
    { id: 't2', title: 'Step outside between lectures', icon: 'sun', color: '#FFDC75', done: false },
    { id: 't3', title: 'One-line reflection', icon: 'edit-3', color: '#FFB173', done: false },
  ];
}

interface WellnessState {
  checkins: Checkin[];
  tasks: Task[];
  tasksDate: string;
  journal: JournalEntry[];
  flowers: number;
  bloomPending: boolean;
  ensureToday: () => void;
  submitCheckin: (c: Omit<Checkin, 'date'>) => void;
  toggleTask: (id: string) => void;
  addTask: (title: string, icon: string, color: string) => void;
  addJournalEntry: (text: string) => void;
  clearBloom: () => void;
}

export const useWellness = create<WellnessState>()(
  persist(
    (set, get) => ({
      checkins: [],
      tasks: defaultTasks(),
      tasksDate: todayKey(),
      journal: [],
      flowers: 0,
      bloomPending: false,

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
          flowers: isFirstToday ? get().flowers + 1 : get().flowers,
          bloomPending: isFirstToday,
        });
      },

      toggleTask: (id) =>
        set({
          tasks: get().tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
        }),

      addTask: (title, icon, color) =>
        set({
          tasks: [
            ...get().tasks,
            { id: `t${Date.now()}`, title, icon, color, done: false },
          ],
        }),

      addJournalEntry: (text) =>
        set({
          journal: [
            { id: `j${Date.now()}`, date: new Date().toISOString(), text },
            ...get().journal,
          ],
        }),

      clearBloom: () => set({ bloomPending: false }),
    }),
    {
      name: 'mindshed-wellness',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export function useTodayCheckin(): Checkin | undefined {
  return useWellness((s) => s.checkins.find((c) => c.date === todayKey()));
}
