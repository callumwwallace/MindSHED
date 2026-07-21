import type { StateStorage } from 'zustand/middleware';

// Web remains the secondary browser target. Native builds replace this module
// with the SQLCipher-backed .native implementation.
const serverMemory = new Map<string, string>();

export const localPrivateStorage: StateStorage = {
  async getItem(name) {
    if (typeof window === 'undefined') return serverMemory.get(name) ?? null;
    return window.localStorage.getItem(name);
  },
  async setItem(name, value) {
    if (typeof window === 'undefined') serverMemory.set(name, value);
    else window.localStorage.setItem(name, value);
  },
  async removeItem(name) {
    if (typeof window === 'undefined') serverMemory.delete(name);
    else window.localStorage.removeItem(name);
  },
};

export async function flushLocalPrivateStorageWrites(): Promise<void> {
  // Browser localStorage writes are synchronous.
}
