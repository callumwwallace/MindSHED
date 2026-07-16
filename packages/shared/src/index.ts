import { z } from "zod";

// Pilot data is intentionally defined as an allowlist. Do not add journal text,
// names, contact details, device identifiers, IP addresses, or precise timestamps.
export const PILOT_SCHEMA_VERSION = 1 as const;
export const PRIVACY_NOTICE_VERSION = "privacy-2026-06-26-v2" as const;
export const PILOT_CONSENT_VERSION = "pilot-consent-2026-07-01-v1" as const;
export const SWEMWBS_INSTRUMENT = "SWEMWBS" as const;
export const SWEMWBS_INSTRUMENT_VERSION = "swemwbs-7-en-gb-v1" as const;

// Official SWEMWBS raw-score to metric-score conversion. The transformation
// is valid only for complete seven-item responses scored from 1 to 5.
export const SWEMWBS_METRIC_SCORES = {
  7: 7.0,
  8: 9.51,
  9: 11.25,
  10: 12.4,
  11: 13.33,
  12: 14.08,
  13: 14.75,
  14: 15.32,
  15: 15.84,
  16: 16.36,
  17: 16.88,
  18: 17.43,
  19: 17.98,
  20: 18.59,
  21: 19.25,
  22: 19.98,
  23: 20.73,
  24: 21.54,
  25: 22.35,
  26: 23.21,
  27: 24.11,
  28: 25.03,
  29: 26.02,
  30: 27.03,
  31: 28.13,
  32: 29.31,
  33: 30.7,
  34: 32.55,
  35: 35.0,
} as const;

export type SwemwbsRawScore = keyof typeof SWEMWBS_METRIC_SCORES;

export function scoreSwemwbs(responses: readonly number[]) {
  if (responses.length !== 7 || responses.some((response) => !Number.isInteger(response) || response < 1 || response > 5)) {
    throw new Error("SWEMWBS requires seven complete responses scored from 1 to 5");
  }
  const rawScore = responses.reduce((total, response) => total + response, 0) as SwemwbsRawScore;
  return { rawScore, metricScore: SWEMWBS_METRIC_SCORES[rawScore] };
}

export const pilotParticipantId = z.string().uuid();
export const pilotSecret = z.string().min(32).max(128);

export const pilotEnrolInput = z
  .object({
    accessCode: z.string().trim().min(12).max(128),
    schemaVersion: z.literal(PILOT_SCHEMA_VERSION),
  })
  .strict();

export const pilotCredentialsInput = z
  .object({
    participantId: pilotParticipantId,
    participantToken: pilotSecret,
  })
  .strict();

export const pilotDeletionCredentialsInput = z
  .object({
    participantId: pilotParticipantId,
    deletionSecret: pilotSecret,
  })
  .strict();

export const pilotConsentInput = pilotCredentialsInput
  .extend({
    privacyNoticeVersion: z.literal(PRIVACY_NOTICE_VERSION),
    consentDocumentVersion: z.literal(PILOT_CONSENT_VERSION),
    termsAccepted: z.literal(true),
    researchConsent: z.boolean(),
    healthDataConsent: z.boolean(),
    marketingConsent: z.boolean(),
  })
  .strict();

const relativeDay = z.number().int().min(0).max(366);
const eventId = z.string().uuid();

const checkinEvent = z
  .object({
    eventId,
    schemaVersion: z.literal(PILOT_SCHEMA_VERSION),
    relativeDay,
    kind: z.literal("checkin"),
    payload: z
      .object({
        mood: z.number().int().min(1).max(5),
        energy: z.number().int().min(0).max(10),
        stress: z.number().int().min(0).max(10),
        needs: z
          .array(
            z.enum([
              "calm",
              "grounding",
              "focus",
              "rest",
              "connection",
            ]),
          )
          .max(3),
      })
      .strict(),
  })
  .strict();

const pulseEvent = z
  .object({
    eventId,
    schemaVersion: z.literal(PILOT_SCHEMA_VERSION),
    relativeDay,
    kind: z.literal("pulse"),
    payload: z
      .object({
        instrument: z.literal(SWEMWBS_INSTRUMENT),
        instrumentVersion: z.literal(SWEMWBS_INSTRUMENT_VERSION),
        responses: z.array(z.number().int().min(1).max(5)).length(7),
        rawScore: z.number().int().min(7).max(35),
        metricScore: z.number().min(7).max(35),
      })
      .strict()
      .superRefine((payload, context) => {
        const score = scoreSwemwbs(payload.responses);
        if (payload.rawScore !== score.rawScore) {
          context.addIssue({ code: z.ZodIssueCode.custom, path: ["rawScore"], message: "Raw score does not match responses" });
        }
        if (Math.abs(payload.metricScore - score.metricScore) > 0.001) {
          context.addIssue({ code: z.ZodIssueCode.custom, path: ["metricScore"], message: "Metric score does not match the approved transformation" });
        }
      }),
  })
  .strict();

const engagementEvent = z
  .object({
    eventId,
    schemaVersion: z.literal(PILOT_SCHEMA_VERSION),
    relativeDay,
    kind: z.literal("engagement"),
    payload: z
      .object({
        activity: z.enum([
          "checkin_completed",
          "pulse_completed",
          "breathing_completed",
          "grounding_completed",
          "activity_completed",
        ]),
        count: z.literal(1),
      })
      .strict(),
  })
  .strict();

export const pilotEvent = z.discriminatedUnion("kind", [
  checkinEvent,
  pulseEvent,
  engagementEvent,
]);

export const pilotIngestInput = pilotCredentialsInput
  .extend({
    events: z.array(pilotEvent).min(1).max(50),
  })
  .strict();

export type PilotEnrolInput = z.infer<typeof pilotEnrolInput>;
export type PilotCredentialsInput = z.infer<typeof pilotCredentialsInput>;
export type PilotDeletionCredentialsInput = z.infer<typeof pilotDeletionCredentialsInput>;
export type PilotConsentInput = z.infer<typeof pilotConsentInput>;
export type PilotEvent = z.infer<typeof pilotEvent>;
export type PilotIngestInput = z.infer<typeof pilotIngestInput>;
