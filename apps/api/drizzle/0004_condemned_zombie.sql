ALTER TABLE "pilot_events" DROP CONSTRAINT "pilot_events_kind_check";--> statement-breakpoint
CREATE UNIQUE INDEX "pilot_events_one_kind_per_day_idx" ON "pilot_events" USING btree ("participant_id","relative_day","kind");--> statement-breakpoint
ALTER TABLE "pilot_consents" ADD CONSTRAINT "pilot_consents_health_requires_research_check" CHECK (not "pilot_consents"."health_data_consent" or "pilot_consents"."research_consent");--> statement-breakpoint
ALTER TABLE "pilot_events" ADD CONSTRAINT "pilot_events_kind_check" CHECK ("pilot_events"."kind" in ('checkin', 'pulse'));