import { z } from "zod";

const positiveInteger = (fallback: number) => {
  const raw = z.coerce.number().int().positive().safeParse;
  return (value: string | undefined) => {
    if (value === undefined || value === "") return fallback;
    const parsed = raw(value);
    if (!parsed.success) throw new Error(`Expected a positive whole number, received ${value}`);
    return parsed.data;
  };
};

export function pilotRuntimeConfig() {
  const databaseSslMode = z.enum(["disable", "require", "verify-full"])
    .parse(process.env.DATABASE_SSL_MODE ?? "disable");
  return {
    databaseSslMode,
    legalDocumentsApproved: process.env.PILOT_LEGAL_DOCUMENTS_APPROVED === "true",
    enrolmentEnabled: process.env.PILOT_ENROLMENT_ENABLED === "true",
    uploadsEnabled: process.env.PILOT_UPLOADS_ENABLED === "true",
    swemwbsUploadsEnabled: process.env.PILOT_SWEMWBS_UPLOADS_ENABLED === "true",
    marketingConsentEnabled: process.env.PILOT_MARKETING_CONSENT_ENABLED === "true",
    minimumAppVersion: process.env.PILOT_MINIMUM_APP_VERSION ?? "1.0.0",
    maxEventsPerParticipant: positiveInteger(500)(process.env.PILOT_MAX_EVENTS_PER_PARTICIPANT),
    maxConsentsPerParticipant: positiveInteger(50)(process.env.PILOT_MAX_CONSENTS_PER_PARTICIPANT),
    rateLimitMax: positiveInteger(120)(process.env.RATE_LIMIT_MAX),
    trustProxy: process.env.TRUST_PROXY === "true",
  };
}

export function assertProductionConfiguration(): void {
  if (process.env.NODE_ENV !== "production") return;

  const config = pilotRuntimeConfig();
  const problems: string[] = [];
  try {
    const databaseUrl = new URL(process.env.DATABASE_URL ?? "");
    if (!["postgres:", "postgresql:"].includes(databaseUrl.protocol)) throw new Error();
  } catch {
    problems.push("DATABASE_URL must be a valid PostgreSQL URL");
  }
  if (config.databaseSslMode === "disable") problems.push("DATABASE_SSL_MODE must be require or verify-full");
  const hashKey = process.env.PILOT_CODE_HASH_KEY ?? "";
  if (
    hashKey.length < 43
    || new Set(hashKey).size < 8
    || /replace|example|change.?me/i.test(hashKey)
  ) {
    problems.push("PILOT_CODE_HASH_KEY must be a non-placeholder secret encoding at least 32 random bytes");
  }
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(config.minimumAppVersion)) problems.push("PILOT_MINIMUM_APP_VERSION must use semantic versioning");
  if ((config.enrolmentEnabled || config.uploadsEnabled) && !config.legalDocumentsApproved) {
    problems.push("PILOT_LEGAL_DOCUMENTS_APPROVED must be true before enrolment or uploads are enabled");
  }
  const origins = process.env.CORS_ORIGIN?.split(",").map((origin) => origin.trim()).filter(Boolean) ?? [];
  if (origins.some((origin) => {
    try {
      const parsed = new URL(origin);
      return parsed.protocol !== "https:" || Boolean(parsed.username || parsed.password);
    } catch {
      return true;
    }
  })) problems.push("Every production CORS_ORIGIN must be a valid credential-free HTTPS origin");
  if (problems.length) throw new Error(`Invalid production configuration:\n- ${problems.join("\n- ")}`);
}
