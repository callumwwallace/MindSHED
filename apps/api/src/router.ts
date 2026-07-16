import {
  PILOT_CONSENT_VERSION,
  PILOT_SCHEMA_VERSION,
  PRIVACY_NOTICE_VERSION,
  pilotConsentInput,
  pilotCredentialsInput,
  pilotDeletionCredentialsInput,
  pilotEnrolInput,
  pilotIngestInput,
} from "@mindshed/shared";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, gte, isNull, lt, lte, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { db } from "./db";
import { pilotConsents, pilotEvents, pilotParticipants, pilotStudyCodes } from "./db/schema";
import { hashAccessCode, hashSecret, opaqueSecret } from "./security/secrets";
import { publicProcedure, router } from "./trpc";

function utcDate(): string {
  return new Date().toISOString().slice(0, 10);
}

async function authenticateParticipant(participantId: string, participantToken: string) {
  const [participant] = await db()
    .select()
    .from(pilotParticipants)
    .where(
      and(
        eq(pilotParticipants.id, participantId),
        eq(pilotParticipants.participantTokenHash, hashSecret(participantToken)),
      ),
    )
    .limit(1);
  if (!participant) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid pilot credentials" });
  }
  return participant;
}

async function authenticateDeletion(participantId: string, deletionSecret: string) {
  const [participant] = await db()
    .select()
    .from(pilotParticipants)
    .where(
      and(
        eq(pilotParticipants.id, participantId),
        eq(pilotParticipants.deletionSecretHash, hashSecret(deletionSecret)),
      ),
    )
    .limit(1);
  if (!participant) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid deletion credentials" });
  }
  return participant;
}

async function latestConsent(participantId: string) {
  const [consent] = await db()
    .select()
    .from(pilotConsents)
    .where(
      and(
        eq(pilotConsents.participantId, participantId),
        isNull(pilotConsents.supersededAt),
      ),
    )
    .orderBy(desc(pilotConsents.recordedAt))
    .limit(1);
  return consent;
}

export const appRouter = router({
  health: router({
    ping: publicProcedure.query(() => ({ ok: true, service: "mindshed-api" })),
  }),
  pilot: router({
    config: publicProcedure.query(() => ({
      schemaVersion: PILOT_SCHEMA_VERSION,
      privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
      consentDocumentVersion: PILOT_CONSENT_VERSION,
      enrolmentOpen: process.env.PILOT_ENROLMENT_ENABLED === "true",
      researchUploadsEnabled: process.env.PILOT_UPLOADS_ENABLED === "true",
      swemwbsUploadsEnabled: process.env.PILOT_SWEMWBS_UPLOADS_ENABLED === "true",
      minimumAppVersion: process.env.PILOT_MINIMUM_APP_VERSION ?? "1.0.0",
    })),

    enrol: publicProcedure.input(pilotEnrolInput).mutation(async ({ input }) => {
      if (process.env.PILOT_ENROLMENT_ENABLED !== "true") {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Pilot enrolment is unavailable" });
      }
      const codeHashKey = process.env.PILOT_CODE_HASH_KEY;
      if (!codeHashKey) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Pilot enrolment is unavailable" });
      }
      const [studyCode] = await db()
        .select()
        .from(pilotStudyCodes)
        .where(eq(pilotStudyCodes.codeHash, hashAccessCode(input.accessCode, codeHashKey)))
        .limit(1);
      if (!studyCode) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid pilot access code" });
      }
      const today = utcDate();
      if (!studyCode.active || studyCode.validFrom > today || studyCode.expiresOn < today) {
        throw new TRPCError({ code: "FORBIDDEN", message: "This pilot access code is not active" });
      }

      const participantToken = opaqueSecret();
      const deletionSecret = opaqueSecret();
      const participant = await db().transaction(async (transaction) => {
        const [redeemed] = await transaction
          .update(pilotStudyCodes)
          .set({ redemptions: sql`${pilotStudyCodes.redemptions} + 1` })
          .where(
            and(
              eq(pilotStudyCodes.id, studyCode.id),
              eq(pilotStudyCodes.active, true),
              lte(pilotStudyCodes.validFrom, today),
              gte(pilotStudyCodes.expiresOn, today),
              lt(pilotStudyCodes.redemptions, pilotStudyCodes.maxRedemptions),
            ),
          )
          .returning({ studyCode: pilotStudyCodes.studyCode });
        if (!redeemed) {
          throw new TRPCError({ code: "CONFLICT", message: "This pilot cohort is full" });
        }
        const [created] = await transaction
          .insert(pilotParticipants)
          .values({
            studyCode: redeemed.studyCode,
            participantTokenHash: hashSecret(participantToken),
            deletionSecretHash: hashSecret(deletionSecret),
            schemaVersion: input.schemaVersion,
          })
          .returning({ id: pilotParticipants.id });
        return created;
      });
      if (!participant) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Pilot enrolment failed" });
      }
      return {
        participantId: participant.id,
        participantToken,
        deletionSecret,
        privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
        consentDocumentVersion: PILOT_CONSENT_VERSION,
      };
    }),

    // Credential-bearing reads use POST mutations so secrets never appear in
    // query strings retained by gateways, proxies, or browser history.
    status: publicProcedure.input(pilotCredentialsInput).mutation(async ({ input }) => {
      const participant = await authenticateParticipant(input.participantId, input.participantToken);
      const consent = await latestConsent(participant.id);
      return {
        enrolled: true,
        researchWithdrawn: participant.researchWithdrawnOn !== null,
        consent: consent
          ? {
              privacyNoticeVersion: consent.privacyNoticeVersion,
              consentDocumentVersion: consent.consentDocumentVersion,
              termsAccepted: consent.termsAccepted,
              researchConsent: consent.researchConsent,
              healthDataConsent: consent.healthDataConsent,
              marketingConsent: consent.marketingConsent,
              recordedAt: consent.recordedAt,
            }
          : null,
      };
    }),

    recordConsent: publicProcedure.input(pilotConsentInput).mutation(async ({ input }) => {
      const participant = await authenticateParticipant(input.participantId, input.participantToken);
      if (participant.researchWithdrawnOn && input.researchConsent) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Research consent cannot be restored after withdrawal",
        });
      }
      const now = new Date();
      await db().transaction(async (transaction) => {
        await transaction
          .update(pilotConsents)
          .set({ supersededAt: now })
          .where(
            and(
              eq(pilotConsents.participantId, participant.id),
              isNull(pilotConsents.supersededAt),
            ),
          );
        await transaction.insert(pilotConsents).values({
          participantId: participant.id,
          privacyNoticeVersion: input.privacyNoticeVersion,
          consentDocumentVersion: input.consentDocumentVersion,
          termsAccepted: input.termsAccepted,
          researchConsent: input.researchConsent,
          healthDataConsent: input.healthDataConsent,
          marketingConsent: input.marketingConsent,
        });
      });
      return { recorded: true };
    }),

    ingest: publicProcedure.input(pilotIngestInput).mutation(async ({ input }) => {
      if (process.env.PILOT_UPLOADS_ENABLED !== "true") {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Pilot uploads are paused" });
      }
      const participant = await authenticateParticipant(input.participantId, input.participantToken);
      const consent = await latestConsent(participant.id);
      if (participant.researchWithdrawnOn || !consent?.researchConsent || !consent.healthDataConsent) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Active research and health-data consent is required",
        });
      }
      if (
        input.events.some((event) => event.kind === "pulse")
        && process.env.PILOT_SWEMWBS_UPLOADS_ENABLED !== "true"
      ) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "SWEMWBS research uploads are not approved",
        });
      }
      const inserted = await db()
        .insert(pilotEvents)
        .values(
          input.events.map((event) => ({
            eventId: event.eventId,
            participantId: participant.id,
            schemaVersion: event.schemaVersion,
            relativeDay: event.relativeDay,
            kind: event.kind,
            payload: event.payload,
          })),
        )
        .onConflictDoNothing({ target: pilotEvents.eventId })
        .returning({ eventId: pilotEvents.eventId });
      await db()
        .update(pilotParticipants)
        .set({ lastSeenOn: utcDate() })
        .where(eq(pilotParticipants.id, participant.id));
      return { accepted: inserted.length, duplicates: input.events.length - inserted.length };
    }),

    exportData: publicProcedure.input(pilotCredentialsInput).mutation(async ({ input }) => {
      const participant = await authenticateParticipant(input.participantId, input.participantToken);
      const [consents, events] = await Promise.all([
        db()
          .select({
            privacyNoticeVersion: pilotConsents.privacyNoticeVersion,
            consentDocumentVersion: pilotConsents.consentDocumentVersion,
            termsAccepted: pilotConsents.termsAccepted,
            researchConsent: pilotConsents.researchConsent,
            healthDataConsent: pilotConsents.healthDataConsent,
            marketingConsent: pilotConsents.marketingConsent,
            recordedAt: pilotConsents.recordedAt,
          })
          .from(pilotConsents)
          .where(eq(pilotConsents.participantId, participant.id))
          .orderBy(pilotConsents.recordedAt),
        db()
          .select({
            eventId: pilotEvents.eventId,
            schemaVersion: pilotEvents.schemaVersion,
            relativeDay: pilotEvents.relativeDay,
            kind: pilotEvents.kind,
            payload: pilotEvents.payload,
          })
          .from(pilotEvents)
          .where(eq(pilotEvents.participantId, participant.id))
          .orderBy(pilotEvents.relativeDay, pilotEvents.eventId),
      ]);
      return {
        participantId: participant.id,
        researchWithdrawn: participant.researchWithdrawnOn !== null,
        consents,
        events,
      };
    }),

    withdrawResearch: publicProcedure
      .input(pilotDeletionCredentialsInput)
      .mutation(async ({ input }) => {
        const participant = await authenticateDeletion(input.participantId, input.deletionSecret);
        const now = new Date();
        await db().transaction(async (transaction) => {
          await transaction
            .update(pilotParticipants)
            .set({ researchWithdrawnOn: utcDate(), lastSeenOn: utcDate() })
            .where(eq(pilotParticipants.id, participant.id));
          await transaction
            .update(pilotConsents)
            .set({ supersededAt: now })
            .where(
              and(
                eq(pilotConsents.participantId, participant.id),
                isNull(pilotConsents.supersededAt),
              ),
            );
          await transaction.insert(pilotConsents).values({
            participantId: participant.id,
            privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
            consentDocumentVersion: PILOT_CONSENT_VERSION,
            termsAccepted: true,
            researchConsent: false,
            healthDataConsent: false,
            marketingConsent: false,
          });
        });
        return { withdrawn: true };
      }),

    deleteData: publicProcedure
      .input(pilotDeletionCredentialsInput)
      .mutation(async ({ input }) => {
        const participant = await authenticateDeletion(input.participantId, input.deletionSecret);
        await db().delete(pilotParticipants).where(eq(pilotParticipants.id, participant.id));
        return { deleted: true, receipt: randomUUID() };
      }),
  }),
});

export type AppRouter = typeof appRouter;
