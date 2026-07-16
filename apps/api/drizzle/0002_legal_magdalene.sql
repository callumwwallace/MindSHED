DROP INDEX "pilot_events_participant_idx";--> statement-breakpoint
ALTER TABLE "pilot_participants" ALTER COLUMN "created_at" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "pilot_participants" ALTER COLUMN "created_at" SET DEFAULT current_date;--> statement-breakpoint
ALTER TABLE "pilot_participants" ALTER COLUMN "last_seen_at" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "pilot_participants" ALTER COLUMN "last_seen_at" SET DEFAULT current_date;--> statement-breakpoint
ALTER TABLE "pilot_participants" ALTER COLUMN "research_withdrawn_at" SET DATA TYPE date;--> statement-breakpoint
CREATE INDEX "pilot_events_participant_idx" ON "pilot_events" USING btree ("participant_id","relative_day");--> statement-breakpoint
ALTER TABLE "pilot_events" DROP COLUMN "received_at";