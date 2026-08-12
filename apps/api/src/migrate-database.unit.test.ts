import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import test from "node:test";
import { migrationsFolder } from "./scripts/migrate-database";

test("finds migrations when npm runs from the API workspace", () => {
  const previous = process.cwd();
  const configured = process.env.DRIZZLE_MIGRATIONS_PATH;
  const apiWorkspace = fileURLToPath(new URL("../", import.meta.url));
  try {
    delete process.env.DRIZZLE_MIGRATIONS_PATH;
    process.chdir(apiWorkspace);
    const folder = migrationsFolder();
    assert.equal(folder, resolve(apiWorkspace, "drizzle"));
    assert.equal(existsSync(resolve(folder, "meta/_journal.json")), true);
  } finally {
    process.chdir(previous);
    if (configured === undefined) delete process.env.DRIZZLE_MIGRATIONS_PATH;
    else process.env.DRIZZLE_MIGRATIONS_PATH = configured;
  }
});

test("honours an explicit migrations path", () => {
  const configured = process.env.DRIZZLE_MIGRATIONS_PATH;
  try {
    process.env.DRIZZLE_MIGRATIONS_PATH = "/approved/migrations";
    assert.equal(migrationsFolder(), "/approved/migrations");
  } finally {
    if (configured === undefined) delete process.env.DRIZZLE_MIGRATIONS_PATH;
    else process.env.DRIZZLE_MIGRATIONS_PATH = configured;
  }
});
