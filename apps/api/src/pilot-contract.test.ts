import {
  PILOT_CONSENT_VERSION,
  PILOT_SCHEMA_VERSION,
  PRIVACY_NOTICE_VERSION,
  SWEMWBS_INSTRUMENT,
  SWEMWBS_INSTRUMENT_VERSION,
  pilotConsentInput,
  pilotIngestInput,
} from "@mindshed/shared";
import assert from "node:assert/strict";
import test from "node:test";

const credentials = {
  participantId: "ad9bb0b6-9082-4fb1-af86-96f7060f3754",
  participantToken: "A".repeat(32),
};

const checkin = {
  eventId: "e9299704-c329-47f8-acc8-a5ceaad9f205",
  schemaVersion: PILOT_SCHEMA_VERSION,
  relativeDay: 4,
  kind: "checkin" as const,
  payload: { mood: 3, energy: 5, stress: 7, needs: ["rest" as const] },
};

const pulse = {
  eventId: "082aa89b-df92-40ba-a064-3f5ec3593bf8",
  schemaVersion: PILOT_SCHEMA_VERSION,
  relativeDay: 14,
  kind: "pulse" as const,
  payload: {
    instrument: SWEMWBS_INSTRUMENT,
    instrumentVersion: SWEMWBS_INSTRUMENT_VERSION,
    responses: [3, 3, 3, 3, 3, 3, 3],
    rawScore: 21,
    metricScore: 19.25,
  },
};

test("accepts only the versioned structured pilot check-in", () => {
  assert.equal(pilotIngestInput.safeParse({ ...credentials, events: [checkin] }).success, true);
});

test("accepts only a complete correctly scored SWEMWBS pulse", () => {
  assert.equal(pilotIngestInput.safeParse({ ...credentials, events: [pulse] }).success, true);
  assert.equal(pilotIngestInput.safeParse({
    ...credentials,
    events: [{ ...pulse, payload: { ...pulse.payload, rawScore: 22 } }],
  }).success, false);
  assert.equal(pilotIngestInput.safeParse({
    ...credentials,
    events: [{ ...pulse, payload: { ...pulse.payload, metricScore: 20 } }],
  }).success, false);
});

test("rejects free text inside an otherwise valid check-in", () => {
  const withNote = {
    ...checkin,
    payload: { ...checkin.payload, note: "private journal-like text" },
  };
  assert.equal(pilotIngestInput.safeParse({ ...credentials, events: [withNote] }).success, false);
});

test("rejects identifiers and precise timestamps at the batch boundary", () => {
  const unsafe = {
    ...credentials,
    email: "participant@example.com",
    capturedAt: new Date().toISOString(),
    events: [checkin],
  };
  assert.equal(pilotIngestInput.safeParse(unsafe).success, false);
});

test("rejects journal fields and unrecognised event properties", () => {
  const unsafeEvent = { ...checkin, journalText: "must stay local" };
  assert.equal(pilotIngestInput.safeParse({ ...credentials, events: [unsafeEvent] }).success, false);
});

test("limits each upload batch to fifty events", () => {
  assert.equal(
    pilotIngestInput.safeParse({ ...credentials, events: Array.from({ length: 51 }, () => checkin) }).success,
    false,
  );
});

test("requires exact legal-document versions and affirmative app terms", () => {
  const consent = {
    ...credentials,
    privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
    consentDocumentVersion: PILOT_CONSENT_VERSION,
    termsAccepted: true,
    researchConsent: true,
    healthDataConsent: true,
    marketingConsent: false,
  };
  assert.equal(pilotConsentInput.safeParse(consent).success, true);
  assert.equal(pilotConsentInput.safeParse({ ...consent, termsAccepted: false }).success, false);
  assert.equal(pilotConsentInput.safeParse({ ...consent, privacyNoticeVersion: "latest" }).success, false);
});
