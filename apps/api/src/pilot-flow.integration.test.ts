import {
  PILOT_CONSENT_VERSION,
  PILOT_SCHEMA_VERSION,
  PRIVACY_NOTICE_VERSION,
  SWEMWBS_INSTRUMENT,
  SWEMWBS_INSTRUMENT_VERSION,
} from "@mindshed/shared";
import { eq } from "drizzle-orm";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test, { after } from "node:test";
import { closeDb, db } from "./db";
import { pilotConsents, pilotStudyCodes } from "./db/schema";
import { appRouter } from "./router";
import { hashAccessCode } from "./security/secrets";

after(closeDb);

test("anonymous pilot lifecycle enrols, gates, retries, exports, withdraws and deletes", async () => {
  assert.ok(process.env.DATABASE_URL, "DATABASE_URL is required for this integration test");
  process.env.PILOT_ENROLMENT_ENABLED = "true";
  process.env.PILOT_UPLOADS_ENABLED = "true";
  process.env.PILOT_LEGAL_DOCUMENTS_APPROVED = "true";
  delete process.env.PILOT_SWEMWBS_UPLOADS_ENABLED;
  process.env.PILOT_CODE_HASH_KEY = "integration-test-only-hmac-key";
  const accessCode = `integration-${randomUUID()}`;
  const expiredAccessCode = `expired-${randomUUID()}`;
  await db().insert(pilotStudyCodes).values({
    codeHash: hashAccessCode(expiredAccessCode, process.env.PILOT_CODE_HASH_KEY),
    studyCode: "expired-integration-test",
    validFrom: "2020-01-01",
    expiresOn: "2021-12-31",
    maxRedemptions: 1,
  });
  await db().insert(pilotStudyCodes).values({
    codeHash: hashAccessCode(accessCode, process.env.PILOT_CODE_HASH_KEY),
    studyCode: "integration-test",
    validFrom: "2020-01-01",
    expiresOn: "2099-12-31",
    maxRedemptions: 1,
  });
  const caller = appRouter.createCaller({});

  await assert.rejects(
    caller.pilot.enrol({ accessCode: expiredAccessCode, schemaVersion: PILOT_SCHEMA_VERSION }),
    /could not be completed/i,
  );
  process.env.PILOT_ENROLMENT_ENABLED = "false";
  await assert.rejects(
    caller.pilot.enrol({ accessCode, schemaVersion: PILOT_SCHEMA_VERSION }),
    /enrolment is unavailable/i,
  );
  process.env.PILOT_ENROLMENT_ENABLED = "true";

  const identity = await caller.pilot.enrol({
    accessCode,
    schemaVersion: PILOT_SCHEMA_VERSION,
  });
  const credentials = {
    participantId: identity.participantId,
    participantToken: identity.participantToken,
  };
  const ingestCredentials = { ...credentials, appVersion: "1.0.0" };
  const deletionCredentials = {
    participantId: identity.participantId,
    deletionSecret: identity.deletionSecret,
  };
  const otherAccessCode = `other-${randomUUID()}`;
  await db().insert(pilotStudyCodes).values({
    codeHash: hashAccessCode(otherAccessCode, process.env.PILOT_CODE_HASH_KEY),
    studyCode: "other-integration-test",
    validFrom: "2020-01-01",
    expiresOn: "2099-12-31",
    maxRedemptions: 1,
  });
  const otherIdentity = await caller.pilot.enrol({
    accessCode: otherAccessCode,
    schemaVersion: PILOT_SCHEMA_VERSION,
  });
  await assert.rejects(
    caller.pilot.status({
      participantId: identity.participantId,
      participantToken: otherIdentity.participantToken,
    }),
    /invalid pilot credentials/i,
  );

  await assert.rejects(
    caller.pilot.enrol({ accessCode, schemaVersion: PILOT_SCHEMA_VERSION }),
    /could not be completed/i,
  );

  await assert.rejects(
    caller.pilot.ingest({
      ...ingestCredentials,
      events: [{
        eventId: "d950c3ba-f701-473b-8790-de7f22f888ba",
        schemaVersion: PILOT_SCHEMA_VERSION,
        relativeDay: 0,
        kind: "checkin",
        payload: { mood: 3, energy: 6, stress: 5, needs: ["calm"] },
      }],
    }),
    /consent is required/i,
  );

  await caller.pilot.recordConsent({
    ...credentials,
    privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
    consentDocumentVersion: PILOT_CONSENT_VERSION,
    termsAccepted: true,
    researchConsent: true,
    healthDataConsent: true,
    marketingConsent: false,
  });

  const event = {
    eventId: "d950c3ba-f701-473b-8790-de7f22f888ba",
    schemaVersion: PILOT_SCHEMA_VERSION,
    relativeDay: 0,
    kind: "checkin" as const,
    payload: { mood: 3, energy: 6, stress: 5, needs: ["calm" as const] },
  };
  await assert.rejects(
    caller.pilot.ingest({
      ...ingestCredentials,
      events: [{
        eventId: "84940335-dfbb-4d57-9964-2cf2e20679fb",
        schemaVersion: PILOT_SCHEMA_VERSION,
        relativeDay: 14,
        kind: "pulse",
        payload: {
          instrument: SWEMWBS_INSTRUMENT,
          instrumentVersion: SWEMWBS_INSTRUMENT_VERSION,
          responses: [3, 3, 3, 3, 3, 3, 3],
          rawScore: 21,
          metricScore: 19.25,
        },
      }],
    }),
    /not approved/i,
  );
  process.env.PILOT_UPLOADS_ENABLED = "false";
  await assert.rejects(
    caller.pilot.ingest({ ...ingestCredentials, events: [event] }),
    /uploads are paused/i,
  );
  process.env.PILOT_UPLOADS_ENABLED = "true";
  assert.deepEqual(await caller.pilot.ingest({ ...ingestCredentials, events: [event] }), {
    accepted: 1,
    duplicates: 0,
  });
  assert.deepEqual(await caller.pilot.ingest({ ...ingestCredentials, events: [event] }), {
    accepted: 0,
    duplicates: 1,
  });
  process.env.PILOT_MINIMUM_APP_VERSION = "1.1.0";
  await assert.rejects(
    caller.pilot.ingest({ ...ingestCredentials, events: [{ ...event, eventId: randomUUID() }] }),
    /1\.1\.0 or newer/i,
  );
  process.env.PILOT_MINIMUM_APP_VERSION = "1.0.0";
  const editedEvent = {
    ...event,
    eventId: randomUUID(),
    payload: { ...event.payload, mood: 4 },
  };
  assert.deepEqual(await caller.pilot.ingest({ ...ingestCredentials, events: [editedEvent] }), {
    accepted: 1,
    duplicates: 0,
  });

  process.env.PILOT_MAX_EVENTS_PER_PARTICIPANT = "1";
  await assert.rejects(
    caller.pilot.ingest({
      ...ingestCredentials,
      events: [{ ...event, eventId: randomUUID(), relativeDay: 1 }],
    }),
    /event limit/i,
  );
  delete process.env.PILOT_MAX_EVENTS_PER_PARTICIPANT;

  process.env.PILOT_MAX_CONSENTS_PER_PARTICIPANT = "1";
  await assert.rejects(
    caller.pilot.recordConsent({
      ...credentials,
      privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
      consentDocumentVersion: PILOT_CONSENT_VERSION,
      termsAccepted: true,
      researchConsent: false,
      healthDataConsent: false,
      marketingConsent: false,
    }),
    /consent history limit/i,
  );
  delete process.env.PILOT_MAX_CONSENTS_PER_PARTICIPANT;

  const exported = await caller.pilot.exportData(credentials);
  assert.equal(exported.events.length, 1);
  assert.equal(exported.events[0]?.relativeDay, 0);
  assert.equal((exported.events[0]?.payload as { mood?: number }).mood, 4);
  assert.equal("receivedAt" in (exported.events[0] ?? {}), false);
  assert.equal(JSON.stringify(exported).includes("participant@example.com"), false);

  await caller.pilot.withdrawResearch(deletionCredentials);
  const consentHistoryAfterWithdrawal = await db()
    .select()
    .from(pilotConsents)
    .where(eq(pilotConsents.participantId, identity.participantId));
  await caller.pilot.withdrawResearch(deletionCredentials);
  const consentHistoryAfterRetry = await db()
    .select()
    .from(pilotConsents)
    .where(eq(pilotConsents.participantId, identity.participantId));
  assert.equal(consentHistoryAfterRetry.length, consentHistoryAfterWithdrawal.length);
  await assert.rejects(
    caller.pilot.deleteData({
      participantId: identity.participantId,
      deletionSecret: identity.participantToken,
    }),
    /invalid deletion credentials/i,
  );
  await assert.rejects(
    caller.pilot.ingest({ ...ingestCredentials, events: [{ ...event, eventId: "038070da-4d4d-49e7-ae2b-f9a1878a504c" }] }),
    /consent is required/i,
  );
  await caller.pilot.deleteData({
    participantId: otherIdentity.participantId,
    deletionSecret: otherIdentity.deletionSecret,
  });

  const deletion = await caller.pilot.deleteData(deletionCredentials);
  assert.equal(deletion.deleted, true);
  assert.match(deletion.receipt, /^[0-9a-f-]{36}$/);
  await assert.rejects(caller.pilot.status(credentials), /invalid pilot credentials/i);
});
