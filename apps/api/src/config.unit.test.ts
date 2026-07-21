import assert from "node:assert/strict";
import test from "node:test";

import { assertProductionConfiguration, pilotRuntimeConfig } from "./config";

const managedVariables = [
  "NODE_ENV",
  "DATABASE_URL",
  "DATABASE_SSL_MODE",
  "PILOT_CODE_HASH_KEY",
  "PILOT_LEGAL_DOCUMENTS_APPROVED",
  "PILOT_ENROLMENT_ENABLED",
  "PILOT_UPLOADS_ENABLED",
  "PILOT_MINIMUM_APP_VERSION",
  "PILOT_MAX_EVENTS_PER_PARTICIPANT",
  "CORS_ORIGIN",
] as const;

function withEnvironment(values: Partial<Record<(typeof managedVariables)[number], string>>, run: () => void) {
  const previous = Object.fromEntries(managedVariables.map((name) => [name, process.env[name]]));
  try {
    for (const name of managedVariables) delete process.env[name];
    Object.assign(process.env, values);
    run();
  } finally {
    for (const name of managedVariables) {
      const value = previous[name];
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
}

test("production configuration fails closed without database and secret settings", () => {
  withEnvironment({ NODE_ENV: "production" }, () => {
    assert.throws(assertProductionConfiguration, /DATABASE_URL/);
  });
});

test("production enrolment cannot open before legal approval", () => {
  withEnvironment({
    NODE_ENV: "production",
    DATABASE_URL: "postgres://db.example/mindshed",
    DATABASE_SSL_MODE: "require",
    PILOT_CODE_HASH_KEY: "0123456789abcdef".repeat(4),
    PILOT_ENROLMENT_ENABLED: "true",
    PILOT_LEGAL_DOCUMENTS_APPROVED: "false",
  }, () => {
    assert.throws(assertProductionConfiguration, /PILOT_LEGAL_DOCUMENTS_APPROVED/);
  });
});

test("runtime quotas reject invalid values", () => {
  withEnvironment({ PILOT_MAX_EVENTS_PER_PARTICIPANT: "0" }, () => {
    assert.throws(pilotRuntimeConfig, /positive whole number/);
  });
});

test("a complete fail-closed production configuration is accepted", () => {
  withEnvironment({
    NODE_ENV: "production",
    DATABASE_URL: "postgres://db.example/mindshed",
    DATABASE_SSL_MODE: "verify-full",
    PILOT_CODE_HASH_KEY: "0123456789abcdef".repeat(4),
    PILOT_MINIMUM_APP_VERSION: "1.0.0",
    CORS_ORIGIN: "https://pilot.example",
  }, () => {
    assert.doesNotThrow(assertProductionConfiguration);
  });
});

test("production database transport cannot silently use plaintext", () => {
  withEnvironment({
    NODE_ENV: "production",
    DATABASE_URL: "postgres://db.example/mindshed",
    DATABASE_SSL_MODE: "disable",
    PILOT_CODE_HASH_KEY: "0123456789abcdef".repeat(4),
  }, () => {
    assert.throws(assertProductionConfiguration, /DATABASE_SSL_MODE/);
  });
});

test("production browser origins cannot silently use plaintext", () => {
  withEnvironment({
    NODE_ENV: "production",
    DATABASE_URL: "postgres://db.example/mindshed",
    DATABASE_SSL_MODE: "require",
    PILOT_CODE_HASH_KEY: "0123456789abcdef".repeat(4),
    CORS_ORIGIN: "http://pilot.example",
  }, () => {
    assert.throws(assertProductionConfiguration, /CORS_ORIGIN/);
  });
});
