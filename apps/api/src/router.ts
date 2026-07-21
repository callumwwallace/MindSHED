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
import { and, count, desc, eq, gte, inArray, isNull, lt, lte, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { db } from "./db";
import { pilotRuntimeConfig } from "./config";
import { pilotConsents, pilotEvents, pilotParticipants, pilotStudyCodes } from "./db/schema";
import { hashAccessCode, hashSecret, opaqueSecret } from "./security/secrets";
import { publicProcedure, router } from "./trpc";

function utcDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function compareVersions(left: string, right: string): number {
  const numbers = (value: string) => value.split("-")[0]?.split(".").map((part) => Number(part)) ?? [];
  const leftParts = numbers(left);
  const rightParts = numbers(right);
  for (let index = 0; index < Math.max(leftParts.length, rightParts.length); index += 1) {
    const difference = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);
    if (difference !== 0) return difference;
  }
  return 0;
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
    config: publicProcedure.query(() => {
      const runtime = pilotRuntimeConfig();
      return {
        schemaVersion: PILOT_SCHEMA_VERSION,
        privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
        consentDocumentVersion: PILOT_CONSENT_VERSION,
        legalDocumentsApproved: runtime.legalDocumentsApproved,
        enrolmentOpen: runtime.enrolmentEnabled && runtime.legalDocumentsApproved,
        researchUploadsEnabled: runtime.uploadsEnabled && runtime.legalDocumentsApproved,
        swemwbsUploadsEnabled: runtime.swemwbsUploadsEnabled && runtime.legalDocumentsApproved,
        minimumAppVersion: runtime.minimumAppVersion,
      };
    }),

    enrol: publicProcedure.input(pilotEnrolInput).mutation(async ({ input }) => {
      const runtime = pilotRuntimeConfig();
      if (!runtime.enrolmentEnabled || !runtime.legalDocumentsApproved) {
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
        throw new TRPCError({ code: "FORBIDDEN", message: "Pilot enrolment could not be completed" });
      }
      const today = utcDate();
      if (!studyCode.active || studyCode.validFrom > today || studyCode.expiresOn < today) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Pilot enrolment could not be completed" });
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
          throw new TRPCError({ code: "FORBIDDEN", message: "Pilot enrolment could not be completed" });
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
      const runtime = pilotRuntimeConfig();
      if (input.researchConsent && !runtime.legalDocumentsApproved) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Research consent is not open" });
      }
      if (input.marketingConsent && !runtime.marketingConsentEnabled) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Marketing consent is not enabled" });
      }
      const participant = await authenticateParticipant(input.participantId, input.participantToken);
      if (participant.researchWithdrawnOn && input.researchConsent) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Research consent cannot be restored after withdrawal",
        });
      }
      const now = new Date();
      await db().transaction(async (transaction) => {
        await transaction.execute(sql`
          select 1 from pilot_participants where id = ${participant.id} for update
        `);
        const [currentParticipant] = await transaction
          .select({ researchWithdrawnOn: pilotParticipants.researchWithdrawnOn })
          .from(pilotParticipants)
          .where(eq(pilotParticipants.id, participant.id))
          .limit(1);
        if (!currentParticipant) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid pilot credentials" });
        }
        if (currentParticipant.researchWithdrawnOn && input.researchConsent) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "Research consent cannot be restored after withdrawal",
          });
        }
        const [history] = await transaction
          .select({ value: count() })
          .from(pilotConsents)
          .where(eq(pilotConsents.participantId, participant.id));
        if (Number(history?.value ?? 0) >= runtime.maxConsentsPerParticipant) {
          throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Consent history limit reached" });
        }
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
      const runtime = pilotRuntimeConfig();
      if (!runtime.uploadsEnabled || !runtime.legalDocumentsApproved) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Pilot uploads are paused" });
      }
      if (compareVersions(input.appVersion, runtime.minimumAppVersion) < 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: `MindSHED ${runtime.minimumAppVersion} or newer is required`,
        });
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
        && !runtime.swemwbsUploadsEnabled
      ) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "SWEMWBS research uploads are not approved",
        });
      }
      return db().transaction(async (transaction) => {
        await transaction.execute(sql`
          select 1 from pilot_participants where id = ${participant.id} for update
        `);
        const [[currentParticipant], [currentConsent]] = await Promise.all([
          transaction
            .select({ researchWithdrawnOn: pilotParticipants.researchWithdrawnOn })
            .from(pilotParticipants)
            .where(eq(pilotParticipants.id, participant.id))
            .limit(1),
          transaction
            .select({
              researchConsent: pilotConsents.researchConsent,
              healthDataConsent: pilotConsents.healthDataConsent,
            })
            .from(pilotConsents)
            .where(
              and(
                eq(pilotConsents.participantId, participant.id),
                isNull(pilotConsents.supersededAt),
              ),
            )
            .orderBy(desc(pilotConsents.recordedAt))
            .limit(1),
        ]);
        if (!currentParticipant) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid pilot credentials" });
        }
        if (
          currentParticipant.researchWithdrawnOn
          || !currentConsent?.researchConsent
          || !currentConsent.healthDataConsent
        ) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Active research and health-data consent is required",
          });
        }
        const existingIds = await transaction
          .select({ eventId: pilotEvents.eventId })
          .from(pilotEvents)
          .where(
            and(
              eq(pilotEvents.participantId, participant.id),
              inArray(pilotEvents.eventId, input.events.map((event) => event.eventId)),
            ),
          );
        const duplicateIds = new Set(existingIds.map((event) => event.eventId));
        const newEvents = input.events.filter((event) => !duplicateIds.has(event.eventId));

        const existingLogicalEvents = await transaction
          .select({ relativeDay: pilotEvents.relativeDay, kind: pilotEvents.kind })
          .from(pilotEvents)
          .where(eq(pilotEvents.participantId, participant.id));
        const logicalKeys = new Set(
          existingLogicalEvents.map((event) => `${event.relativeDay}:${event.kind}`),
        );
        const additionalEvents = newEvents.filter(
          (event) => !logicalKeys.has(`${event.relativeDay}:${event.kind}`),
        ).length;
        if (existingLogicalEvents.length + additionalEvents > runtime.maxEventsPerParticipant) {
          throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "Participant event limit reached" });
        }

        if (newEvents.length) {
          await transaction
            .insert(pilotEvents)
            .values(
              newEvents.map((event) => ({
                eventId: event.eventId,
                participantId: participant.id,
                schemaVersion: event.schemaVersion,
                relativeDay: event.relativeDay,
                kind: event.kind,
                payload: event.payload,
              })),
            )
            .onConflictDoUpdate({
              target: [pilotEvents.participantId, pilotEvents.relativeDay, pilotEvents.kind],
              set: {
                eventId: sql`excluded.event_id`,
                schemaVersion: sql`excluded.schema_version`,
                payload: sql`excluded.payload`,
              },
            });
        }
        await transaction
          .update(pilotParticipants)
          .set({ lastSeenOn: utcDate() })
          .where(eq(pilotParticipants.id, participant.id));
        return { accepted: newEvents.length, duplicates: duplicateIds.size };
      });
    }),

    exportData: publicProcedure.input(pilotCredentialsInput).mutation(async ({ input }) => {
      const runtime = pilotRuntimeConfig();
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
          .orderBy(pilotConsents.recordedAt)
          .limit(runtime.maxConsentsPerParticipant + 1),
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
          .orderBy(pilotEvents.relativeDay, pilotEvents.eventId)
          .limit(runtime.maxEventsPerParticipant + 1),
      ]);
      if (consents.length > runtime.maxConsentsPerParticipant || events.length > runtime.maxEventsPerParticipant) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Participant export exceeds its governed limit" });
      }
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
        const consent = await latestConsent(participant.id);
        const now = new Date();
        await db().transaction(async (transaction) => {
          await transaction.execute(sql`
            select 1 from pilot_participants where id = ${participant.id} for update
          `);
          const [current] = await transaction
            .select({ researchWithdrawnOn: pilotParticipants.researchWithdrawnOn })
            .from(pilotParticipants)
            .where(eq(pilotParticipants.id, participant.id))
            .limit(1);
          if (current?.researchWithdrawnOn) return;
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
            termsAccepted: consent?.termsAccepted ?? false,
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
