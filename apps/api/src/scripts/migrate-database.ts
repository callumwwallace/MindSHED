import { migrate } from "drizzle-orm/postgres-js/migrator";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { closeDb, db } from "../db";

export function migrationsFolder(): string {
  const configured = process.env.DRIZZLE_MIGRATIONS_PATH?.trim();
  if (configured) return configured;

  const repositoryPath = resolve(process.cwd(), "apps/api/drizzle");
  if (existsSync(repositoryPath)) return repositoryPath;

  return resolve(process.cwd(), "drizzle");
}

export async function migrateDatabase(): Promise<void> {
  await migrate(db(), {
    migrationsFolder: migrationsFolder(),
  });
}

export async function migrateDatabaseAndClose(): Promise<void> {
  try {
    await migrateDatabase();
    process.stdout.write("Database migrations completed\n");
  } finally {
    await closeDb();
  }
}
