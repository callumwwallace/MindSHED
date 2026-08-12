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
  const { databaseSslMode } = pilotRuntimeConfig();
  const sharedOptions = {
    connect_timeout: 10,
    idle_timeout: 20,
    max: 10,
    ssl: databaseSslMode === "disable" ? false : databaseSslMode,
  } as const;
  const url = process.env.DATABASE_URL?.trim();
  if (url) {
    _client = postgres(url, sharedOptions);
  } else {
    const host = process.env.DATABASE_HOST?.trim();
    const database = process.env.DATABASE_NAME?.trim();
    const username = process.env.DATABASE_USERNAME?.trim();
    const password = process.env.DATABASE_PASSWORD;
    const port = Number(process.env.DATABASE_PORT);
    if (!host || !database || !username || !password || !Number.isInteger(port)) {
      throw new Error("Set DATABASE_URL or every managed database connection variable");
    }
    _client = postgres({
      ...sharedOptions,
      host,
      port,
      database,
      username,
      password,
    });
  }
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
