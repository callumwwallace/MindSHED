import { migrate } from "drizzle-orm/postgres-js/migrator";
import { closeDb, db } from "../db";

export async function migrateDatabase(): Promise<void> {
  await migrate(db(), {
    migrationsFolder: process.env.DRIZZLE_MIGRATIONS_PATH ?? "apps/api/drizzle",
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
