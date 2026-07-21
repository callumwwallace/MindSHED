import {
  PILOT_CONSENT_VERSION,
  PILOT_SCHEMA_VERSION,
  PRIVACY_NOTICE_VERSION,
} from "@mindshed/shared";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test, { after } from "node:test";
import superjson from "superjson";
import { closeDb, db } from "./db";
import { pilotStudyCodes } from "./db/schema";
import type { AppRouter } from "./router";
import { hashAccessCode } from "./security/secrets";
import { buildServer } from "./server";

const server = await buildServer({ logger: false });

after(async () => {
  await server.close();
  await closeDb();
});

test("HTTP boundary keeps credentials out of URLs and enforces lifecycle controls", async () => {
  assert.ok(process.env.DATABASE_URL, "DATABASE_URL is required for this integration test");
  process.env.PILOT_ENROLMENT_ENABLED = "true";
  process.env.PILOT_UPLOADS_ENABLED = "true";
  process.env.PILOT_LEGAL_DOCUMENTS_APPROVED = "true";
  process.env.PILOT_CODE_HASH_KEY = "http-test-only-hmac-key";
  delete process.env.CORS_ORIGIN;

  const accessCode = `http-${randomUUID()}`;
  await db().insert(pilotStudyCodes).values({
    codeHash: hashAccessCode(accessCode, process.env.PILOT_CODE_HASH_KEY),
    studyCode: "http-test",
    validFrom: "2020-01-01",
    expiresOn: "2099-12-31",
    maxRedemptions: 2,
  });

  await server.listen({ host: "127.0.0.1", port: 0 });
  const address = server.server.address();
  assert.ok(address && typeof address !== "string");
  const baseUrl = `http://127.0.0.1:${address.port}`;
  const health = await globalThis.fetch(`${baseUrl}/health`);
  const readiness = await globalThis.fetch(`${baseUrl}/ready`);
  assert.equal(health.status, 200);
  assert.equal(readiness.status, 200);
  assert.equal(health.headers.get("x-content-type-options"), "nosniff");
  assert.equal(health.headers.get("x-frame-options"), "SAMEORIGIN");
  const requestedUrls: string[] = [];
  const trackedFetch: typeof fetch = async (input, init) => {
    requestedUrls.push(
      typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url,
    );
    return globalThis.fetch(input, init);
  };
  const client = createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${baseUrl}/trpc`,
        transformer: superjson,
        fetch: trackedFetch,
      }),
    ],
  });

  const config = await client.pilot.config.query();
  assert.equal(config.enrolmentOpen, true);
  assert.equal(config.researchUploadsEnabled, true);
  assert.equal(config.swemwbsUploadsEnabled, false);

  const identity = await client.pilot.enrol.mutate({
    accessCode,
    schemaVersion: PILOT_SCHEMA_VERSION,
  });
  const credentials = {
    participantId: identity.participantId,
    participantToken: identity.participantToken,
  };
  const deletionCredentials = {
    participantId: identity.participantId,
    deletionSecret: identity.deletionSecret,
  };

  await client.pilot.recordConsent.mutate({
    ...credentials,
    privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
    consentDocumentVersion: PILOT_CONSENT_VERSION,
    termsAccepted: true,
    researchConsent: true,
    healthDataConsent: true,
    marketingConsent: false,
  });
  await client.pilot.status.mutate(credentials);
  await client.pilot.exportData.mutate(credentials);

  for (const secret of [accessCode, identity.participantToken, identity.deletionSecret]) {
    assert.equal(requestedUrls.some((url) => url.includes(secret)), false);
  }
  assert.equal(server.initialConfig.disableRequestLogging, true);

  const crossOrigin = await server.inject({
    method: "OPTIONS",
    url: "/health",
    headers: {
      origin: "https://unapproved.example",
      "access-control-request-method": "GET",
    },
  });
  assert.equal(crossOrigin.headers["access-control-allow-origin"], undefined);

  const oversized = await globalThis.fetch(`${baseUrl}/trpc/pilot.enrol`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "x".repeat(129 * 1024),
  });
  assert.equal(oversized.status, 413);

  await client.pilot.deleteData.mutate(deletionCredentials);
  await assert.rejects(client.pilot.status.mutate(credentials), /invalid pilot credentials/i);
});
