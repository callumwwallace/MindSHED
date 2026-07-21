import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import * as SQLite from 'expo-sqlite';
import type { StateStorage } from 'zustand/middleware';

const DATABASE_NAME = 'mindshed-private.db';
const DATABASE_KEY_NAME = 'mindshed.private-database-key.v1';

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function databaseKey(): Promise<{ key: string; created: boolean }> {
  const existing = await SecureStore.getItemAsync(DATABASE_KEY_NAME);
  if (existing) return { key: existing, created: false };

  const generated = toHex(await Crypto.getRandomBytesAsync(32));
  await SecureStore.setItemAsync(DATABASE_KEY_NAME, generated, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  return { key: generated, created: true };
}

let databasePromise: ReturnType<typeof openPrivateDatabase> | undefined;
const pendingWrites = new Set<Promise<void>>();

function trackWrite(write: Promise<void>): Promise<void> {
  pendingWrites.add(write);
  void write.then(
    () => pendingWrites.delete(write),
    () => pendingWrites.delete(write),
  );
  return write;
}

async function openPrivateDatabase() {
  const { key, created } = await databaseKey();
  // The SQLCipher key is device-bound and intentionally excluded from restore.
  // If an OS restore supplies only the encrypted file, it is unreadable by
  // design; reset that file so hydration cannot strand the app on a blank shell.
  if (created) await SQLite.deleteDatabaseAsync(DATABASE_NAME).catch(() => undefined);
  const database = await SQLite.openDatabaseAsync(DATABASE_NAME);

  // SQLCipher requires the key before any other operation on the database.
  // The key is random hexadecimal rather than user-controlled SQL text.
  await database.execAsync(`PRAGMA key = '${key}'`);
  await database.execAsync('PRAGMA cipher_memory_security = ON');
  await database.execAsync('PRAGMA secure_delete = ON');
  await database.execAsync('PRAGMA journal_mode = WAL');
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS private_key_value (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);
  return database;
}

async function privateDatabase() {
  databasePromise ??= openPrivateDatabase();
  return databasePromise;
}

export const localPrivateStorage: StateStorage<Promise<void>> = {
  async getItem(name) {
    const database = await privateDatabase();
    const row = await database.getFirstAsync<{ value: string }>(
      'SELECT value FROM private_key_value WHERE key = ?',
      name,
    );
    if (row?.value) return row.value;

    // One-time upgrade from the earlier unencrypted AsyncStorage build.
    const legacyValue = await AsyncStorage.getItem(name);
    if (legacyValue !== null) {
      await database.runAsync(
        'INSERT INTO private_key_value (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
        name,
        legacyValue,
      );
      await AsyncStorage.removeItem(name);
    }
    return legacyValue;
  },

  setItem(name, value) {
    return trackWrite((async () => {
      const database = await privateDatabase();
      await database.runAsync(
        'INSERT INTO private_key_value (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
        name,
        value,
      );
      await AsyncStorage.removeItem(name);
    })());
  },

  removeItem(name) {
    return trackWrite((async () => {
      const database = await privateDatabase();
      await database.runAsync('DELETE FROM private_key_value WHERE key = ?', name);
      await AsyncStorage.removeItem(name);
    })());
  },
};

export async function flushLocalPrivateStorageWrites(): Promise<void> {
  while (pendingWrites.size) await Promise.all([...pendingWrites]);
}
