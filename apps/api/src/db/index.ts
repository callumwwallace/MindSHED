import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";
import { pilotRuntimeConfig } from "../config";
import * as schema from "./schema";

// Lazy so the API can boot without a database (first run, CI).
let _db: ReturnType<typeof create> | null = null;
let _client: ReturnType<typeof postgres> | null = null;
const REQUIRED_MIGRATION_CREATED_AT = 1784659225433;

function create() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const { databaseSslMode } = pilotRuntimeConfig();
  _client = postgres(url, {
    connect_timeout: 10,
    idle_timeout: 20,
    max: 10,
    ssl: databaseSslMode === "disable" ? false : databaseSslMode,
  });
  return drizzle(_client, { schema });
}

export function db() {
  _db ??= create();
  return _db;
}

export async function assertDatabaseReady(): Promise<void> {
  const rows = await db().execute<{ migrationsTable: string | null }>(sql`
    select to_regclass('drizzle.__drizzle_migrations')::text as "migrationsTable"
  `);
  if (!rows[0]?.migrationsTable) throw new Error("Database migrations have not been applied");
  const migrations = await db().execute<{ createdAt: string }>(sql`
    select created_at::text as "createdAt"
    from drizzle.__drizzle_migrations
    order by created_at desc
    limit 1
  `);
  if (Number(migrations[0]?.createdAt ?? 0) < REQUIRED_MIGRATION_CREATED_AT) {
    throw new Error("Database migrations are out of date");
  }
}

export async function closeDb(): Promise<void> {
  const client = _client;
  _db = null;
  _client = null;
  await client?.end({ timeout: 5 });
}
