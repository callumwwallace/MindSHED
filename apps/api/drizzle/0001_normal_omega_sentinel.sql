CREATE UNIQUE INDEX "pilot_consents_one_active_idx" ON "pilot_consents" USING btree ("participant_id") WHERE "pilot_consents"."superseded_at" is null;--> statement-breakpoint
ALTER TABLE "pilot_events" ADD CONSTRAINT "pilot_events_schema_version_check" CHECK ("pilot_events"."schema_version" = 1);--> statement-breakpoint
ALTER TABLE "pilot_events" ADD CONSTRAINT "pilot_events_relative_day_check" CHECK ("pilot_events"."relative_day" between 0 and 366);--> statement-breakpoint
ALTER TABLE "pilot_events" ADD CONSTRAINT "pilot_events_kind_check" CHECK ("pilot_events"."kind" in ('checkin', 'pulse', 'engagement'));--> statement-breakpoint
ALTER TABLE "pilot_events" ADD CONSTRAINT "pilot_events_payload_object_check" CHECK (jsonb_typeof("pilot_events"."payload") = 'object');--> statement-breakpoint
ALTER TABLE "pilot_participants" ADD CONSTRAINT "pilot_participants_schema_version_check" CHECK ("pilot_participants"."schema_version" = 1);