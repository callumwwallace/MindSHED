import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export function hashSecret(secret: string): string {
  return createHash("sha256").update(secret, "utf8").digest("hex");
}

export function hashAccessCode(accessCode: string, key: string): string {
  return createHmac("sha256", key).update(accessCode, "utf8").digest("hex");
}

export function secretsMatch(left: string, right: string): boolean {
  const leftHash = createHash("sha256").update(left, "utf8").digest();
  const rightHash = createHash("sha256").update(right, "utf8").digest();
  return timingSafeEqual(leftHash, rightHash);
}

export function opaqueSecret(): string {
  return randomBytes(32).toString("base64url");
}
