CREATE TABLE "pilot_consents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"participant_id" uuid NOT NULL,
	"privacy_notice_version" text NOT NULL,
	"consent_document_version" text NOT NULL,
	"terms_accepted" boolean NOT NULL,
	"research_consent" boolean NOT NULL,
	"health_data_consent" boolean NOT NULL,
	"marketing_consent" boolean NOT NULL,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"superseded_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "pilot_events" (
	"event_id" uuid PRIMARY KEY NOT NULL,
	"participant_id" uuid NOT NULL,
	"schema_version" integer NOT NULL,
	"relative_day" integer NOT NULL,
	"kind" text NOT NULL,
	"payload" jsonb NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pilot_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"study_code" text NOT NULL,
	"participant_token_hash" text NOT NULL,
	"deletion_secret_hash" text NOT NULL,
	"schema_version" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"research_withdrawn_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "pilot_consents" ADD CONSTRAINT "pilot_consents_participant_id_pilot_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."pilot_participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pilot_events" ADD CONSTRAINT "pilot_events_participant_id_pilot_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."pilot_participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "pilot_consents_participant_idx" ON "pilot_consents" USING btree ("participant_id","recorded_at");--> statement-breakpoint
CREATE INDEX "pilot_events_participant_idx" ON "pilot_events" USING btree ("participant_id","received_at");--> statement-breakpoint
CREATE UNIQUE INDEX "pilot_participant_token_hash_idx" ON "pilot_participants" USING btree ("participant_token_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "pilot_deletion_secret_hash_idx" ON "pilot_participants" USING btree ("deletion_secret_hash");