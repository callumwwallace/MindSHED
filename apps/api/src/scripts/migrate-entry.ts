import { migrateDatabaseAndClose } from "./migrate-database";

void migrateDatabaseAndClose().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : "Database migration failed"}\n`);
  process.exitCode = 1;
});
