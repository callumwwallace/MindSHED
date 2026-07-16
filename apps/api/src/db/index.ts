import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Lazy so the API can boot without a database (first run, CI).
let _db: ReturnType<typeof create> | null = null;
let _client: ReturnType<typeof postgres> | null = null;

function create() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  _client = postgres(url);
  return drizzle(_client, { schema });
}

export function db() {
  _db ??= create();
  return _db;
}

export async function closeDb(): Promise<void> {
  const client = _client;
  _db = null;
  _client = null;
  await client?.end({ timeout: 5 });
}
