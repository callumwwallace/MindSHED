import { db, closeDb } from "../db";
import { pilotStudyCodes } from "../db/schema";
import { hashAccessCode } from "../security/secrets";
import { GetSecretValueCommand, SecretsManagerClient } from "@aws-sdk/client-secrets-manager";

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

async function pilotAccessCode(): Promise<string> {
  const direct = process.env.PILOT_ACCESS_CODE?.trim();
  if (direct) return direct;

  const secretId = process.env.PILOT_ACCESS_CODE_SECRET_ARN?.trim();
  if (!secretId) throw new Error("PILOT_ACCESS_CODE or PILOT_ACCESS_CODE_SECRET_ARN is required");
  const response = await new SecretsManagerClient({}).send(new GetSecretValueCommand({ SecretId: secretId }));
  const value = response.SecretString?.trim();
  if (!value) throw new Error("The temporary pilot access-code secret is empty");
  return value;
}

export async function seedPilotCodeFromEnvironment(): Promise<void> {
  const accessCode = await pilotAccessCode();
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
}
