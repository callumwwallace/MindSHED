import { z } from "zod";

// Shared validation schemas — used by the API for input validation and by
// the mobile app for form validation, so the two can never drift apart.

export const journalEntryInput = z.object({
  content: z.string().min(1).max(20_000),
});
export type JournalEntryInput = z.infer<typeof journalEntryInput>;
