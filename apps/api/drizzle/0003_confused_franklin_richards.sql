CREATE TABLE "pilot_study_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code_hash" text NOT NULL,
	"study_code" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"valid_from" date NOT NULL,
	"expires_on" date NOT NULL,
	"max_redemptions" integer NOT NULL,
	"redemptions" integer DEFAULT 0 NOT NULL,
	"created_on" date DEFAULT current_date NOT NULL,
	CONSTRAINT "pilot_study_codes_capacity_check" CHECK ("pilot_study_codes"."max_redemptions" > 0),
	CONSTRAINT "pilot_study_codes_redemptions_check" CHECK ("pilot_study_codes"."redemptions" >= 0 and "pilot_study_codes"."redemptions" <= "pilot_study_codes"."max_redemptions"),
	CONSTRAINT "pilot_study_codes_dates_check" CHECK ("pilot_study_codes"."valid_from" <= "pilot_study_codes"."expires_on")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "pilot_study_codes_hash_idx" ON "pilot_study_codes" USING btree ("code_hash");--> statement-breakpoint
CREATE INDEX "pilot_study_codes_study_idx" ON "pilot_study_codes" USING btree ("study_code");