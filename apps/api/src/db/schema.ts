import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// Starter table — extend/replace as features land. Better Auth will generate
// its own user/session tables when auth is wired in.
export const journalEntries = pgTable("journal_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
