import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const pilotParticipants = pgTable(
  "pilot_participants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    studyCode: text("study_code").notNull(),
    participantTokenHash: text("participant_token_hash").notNull(),
    deletionSecretHash: text("deletion_secret_hash").notNull(),
    schemaVersion: integer("schema_version").notNull(),
    createdOn: date("created_at").notNull().default(sql`current_date`),
    lastSeenOn: date("last_seen_at").notNull().default(sql`current_date`),
    researchWithdrawnOn: date("research_withdrawn_at"),
  },
  (table) => [
    uniqueIndex("pilot_participant_token_hash_idx").on(table.participantTokenHash),
    uniqueIndex("pilot_deletion_secret_hash_idx").on(table.deletionSecretHash),
    check("pilot_participants_schema_version_check", sql`${table.schemaVersion} = 1`),
  ],
);

export const pilotStudyCodes = pgTable(
  "pilot_study_codes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    codeHash: text("code_hash").notNull(),
    studyCode: text("study_code").notNull(),
    active: boolean("active").notNull().default(true),
    validFrom: date("valid_from").notNull(),
    expiresOn: date("expires_on").notNull(),
    maxRedemptions: integer("max_redemptions").notNull(),
    redemptions: integer("redemptions").notNull().default(0),
    createdOn: date("created_on").notNull().default(sql`current_date`),
  },
  (table) => [
    uniqueIndex("pilot_study_codes_hash_idx").on(table.codeHash),
    index("pilot_study_codes_study_idx").on(table.studyCode),
    check("pilot_study_codes_capacity_check", sql`${table.maxRedemptions} > 0`),
    check(
      "pilot_study_codes_redemptions_check",
      sql`${table.redemptions} >= 0 and ${table.redemptions} <= ${table.maxRedemptions}`,
    ),
    check("pilot_study_codes_dates_check", sql`${table.validFrom} <= ${table.expiresOn}`),
  ],
);

export const pilotConsents = pgTable(
  "pilot_consents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    participantId: uuid("participant_id")
      .notNull()
      .references(() => pilotParticipants.id, { onDelete: "cascade" }),
    privacyNoticeVersion: text("privacy_notice_version").notNull(),
    consentDocumentVersion: text("consent_document_version").notNull(),
    termsAccepted: boolean("terms_accepted").notNull(),
    researchConsent: boolean("research_consent").notNull(),
    healthDataConsent: boolean("health_data_consent").notNull(),
    marketingConsent: boolean("marketing_consent").notNull(),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull().defaultNow(),
    supersededAt: timestamp("superseded_at", { withTimezone: true }),
  },
  (table) => [
    index("pilot_consents_participant_idx").on(table.participantId, table.recordedAt),
    uniqueIndex("pilot_consents_one_active_idx")
      .on(table.participantId)
      .where(sql`${table.supersededAt} is null`),
  ],
);

export const pilotEvents = pgTable(
  "pilot_events",
  {
    eventId: uuid("event_id").primaryKey(),
    participantId: uuid("participant_id")
      .notNull()
      .references(() => pilotParticipants.id, { onDelete: "cascade" }),
    schemaVersion: integer("schema_version").notNull(),
    relativeDay: integer("relative_day").notNull(),
    kind: text("kind").notNull(),
    payload: jsonb("payload").notNull(),
  },
  (table) => [
    index("pilot_events_participant_idx").on(table.participantId, table.relativeDay),
    check("pilot_events_schema_version_check", sql`${table.schemaVersion} = 1`),
    check("pilot_events_relative_day_check", sql`${table.relativeDay} between 0 and 366`),
    check(
      "pilot_events_kind_check",
      sql`${table.kind} in ('checkin', 'pulse', 'engagement')`,
    ),
    check("pilot_events_payload_object_check", sql`jsonb_typeof(${table.payload}) = 'object'`),
  ],
);
