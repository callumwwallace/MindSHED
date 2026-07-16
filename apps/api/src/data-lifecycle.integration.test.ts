import {
  PILOT_CONSENT_VERSION,
  PILOT_SCHEMA_VERSION,
  PRIVACY_NOTICE_VERSION,
} from "@mindshed/shared";
import { and, eq } from "drizzle-orm";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test, { after } from "node:test";
import { closeDb, db } from "./db";
import { pilotConsents, pilotParticipants, pilotStudyCodes } from "./db/schema";
import { runDataLifecycle } from "./scripts/run-data-lifecycle";

after(closeDb);

test("lifecycle is dry-run by default and executes only configured scoped rules", async () => {
  assert.ok(process.env.DATABASE_URL, "DATABASE_URL is required for this integration test");
  const studyCode = `lifecycle-${randomUUID()}`;
  const anotherStudy = `untouched-${randomUUID()}`;

  await db().insert(pilotStudyCodes).values([
    {
      codeHash: randomUUID(),
      studyCode,
      validFrom: "2020-01-01",
      expiresOn: "2021-01-01",
      maxRedemptions: 1,
    },
    {
      codeHash: randomUUID(),
      studyCode: anotherStudy,
      validFrom: "2020-01-01",
      expiresOn: "2021-01-01",
      maxRedemptions: 1,
    },
  ]);

  const [abandoned, withdrawn, retained, recent] = await db()
    .insert(pilotParticipants)
    .values([
      {
        studyCode,
        participantTokenHash: randomUUID(),
        deletionSecretHash: randomUUID(),
        schemaVersion: PILOT_SCHEMA_VERSION,
        createdOn: "2025-01-01",
        lastSeenOn: "2025-01-01",
      },
      {
        studyCode,
        participantTokenHash: randomUUID(),
        deletionSecretHash: randomUUID(),
        schemaVersion: PILOT_SCHEMA_VERSION,
        createdOn: "2025-01-01",
        lastSeenOn: "2025-01-01",
        researchWithdrawnOn: "2025-02-01",
      },
      {
        studyCode,
        participantTokenHash: randomUUID(),
        deletionSecretHash: randomUUID(),
        schemaVersion: PILOT_SCHEMA_VERSION,
        createdOn: "2025-01-01",
        lastSeenOn: "2025-02-01",
      },
      {
        studyCode,
        participantTokenHash: randomUUID(),
        deletionSecretHash: randomUUID(),
        schemaVersion: PILOT_SCHEMA_VERSION,
        createdOn: "2026-06-01",
        lastSeenOn: "2026-06-01",
      },
    ])
    .returning({ id: pilotParticipants.id });

  assert.ok(abandoned && withdrawn && retained && recent);
  await db().insert(pilotConsents).values([
    withdrawn,
    retained,
    recent,
  ].map(({ id }) => ({
    participantId: id,
    privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
    consentDocumentVersion: PILOT_CONSENT_VERSION,
    termsAccepted: true,
    researchConsent: true,
    healthDataConsent: true,
    marketingConsent: false,
  })));

  const options = {
    studyCode,
    today: "2026-07-15",
    abandonedEnrolmentDays: 30,
    withdrawnDataDays: 30,
    participantRetentionDays: 365,
  } as const;
  const preview = await runDataLifecycle({ ...options, execute: false });
  assert.deepEqual(preview.affected, {
    expiredCodes: 1,
    abandonedEnrolments: 1,
    withdrawnParticipants: 1,
    retainedParticipants: 1,
  });

  const beforeExecute = await db().select().from(pilotParticipants).where(eq(pilotParticipants.studyCode, studyCode));
  assert.equal(beforeExecute.length, 4);

  const executed = await runDataLifecycle({ ...options, execute: true });
  assert.deepEqual(executed.affected, {
    expiredCodes: 1,
    abandonedEnrolments: 1,
    withdrawnParticipants: 1,
    retainedParticipants: 1,
  });

  const remaining = await db().select().from(pilotParticipants).where(eq(pilotParticipants.studyCode, studyCode));
  assert.deepEqual(remaining.map((row) => row.id), [recent.id]);

  const [scopedCode] = await db().select().from(pilotStudyCodes).where(and(
    eq(pilotStudyCodes.studyCode, anotherStudy),
    eq(pilotStudyCodes.active, true),
  ));
  assert.ok(scopedCode, "a different study must remain untouched");
});
