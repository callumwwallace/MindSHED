import { db, closeDb } from "../db";
import { pilotStudyCodes } from "../db/schema";
import { hashAccessCode } from "../security/secrets";

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

const accessCode = required("PILOT_ACCESS_CODE");
const codeHashKey = required("PILOT_CODE_HASH_KEY");
const studyCode = required("PILOT_STUDY_CODE");
const validFrom = required("PILOT_CODE_VALID_FROM");
const expiresOn = required("PILOT_CODE_EXPIRES_ON");
const maxRedemptions = Number(required("PILOT_CODE_CAPACITY"));

if (!Number.isInteger(maxRedemptions) || maxRedemptions < 1) {
  throw new Error("PILOT_CODE_CAPACITY must be a positive integer");
}
if (!/^\d{4}-\d{2}-\d{2}$/.test(validFrom) || !/^\d{4}-\d{2}-\d{2}$/.test(expiresOn)) {
  throw new Error("Pilot code dates must use YYYY-MM-DD");
}

try {
  await db()
    .insert(pilotStudyCodes)
    .values({
      codeHash: hashAccessCode(accessCode, codeHashKey),
      studyCode,
      validFrom,
      expiresOn,
      maxRedemptions,
    })
    .onConflictDoUpdate({
      target: pilotStudyCodes.codeHash,
      set: { studyCode, active: true, validFrom, expiresOn, maxRedemptions },
    });
  process.stdout.write(`Seeded active batch code for ${studyCode}\n`);
} finally {
  await closeDb();
}
