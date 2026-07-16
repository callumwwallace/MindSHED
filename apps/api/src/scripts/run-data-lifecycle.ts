import { and, count, eq, exists, isNotNull, isNull, lt, notExists, sql } from "drizzle-orm";
import { closeDb, db } from "../db";
import {
  pilotConsents,
  pilotParticipants,
  pilotStudyCodes,
} from "../db/schema";

export type DataLifecycleOptions = {
  execute: boolean;
  today?: string;
  studyCode?: string;
  abandonedEnrolmentDays?: number;
  withdrawnDataDays?: number;
  participantRetentionDays?: number;
};

export type DataLifecycleResult = {
  mode: "dry-run" | "execute";
  studyScope: string;
  today: string;
  configuredDays: {
    abandonedEnrolment: number | null;
    withdrawnData: number | null;
    participantRetention: number | null;
  };
  affected: {
    expiredCodes: number;
    abandonedEnrolments: number;
    withdrawnParticipants: number;
    retainedParticipants: number;
  };
};

function isoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function validateDate(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00Z`))) {
    throw new Error("today must be a valid YYYY-MM-DD date");
  }
  return value;
}

function cutoff(today: string, days: number | undefined): string | undefined {
  if (days === undefined) return undefined;
  if (!Number.isInteger(days) || days < 1) {
    throw new Error("retention periods must be positive whole-day values");
  }
  const value = new Date(`${today}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() - days);
  return isoDate(value);
}

function parseOptionalDays(name: string): number | undefined {
  const raw = process.env[name];
  if (!raw) return undefined;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${name} must be a positive whole number`);
  }
  return value;
}

export async function runDataLifecycle(options: DataLifecycleOptions): Promise<DataLifecycleResult> {
  const today = validateDate(options.today ?? isoDate(new Date()));
  const abandonedCutoff = cutoff(today, options.abandonedEnrolmentDays);
  const withdrawnCutoff = cutoff(today, options.withdrawnDataDays);
  const participantCutoff = cutoff(today, options.participantRetentionDays);
  const studyCode = options.studyCode?.trim() || undefined;
  const studyCodeCondition = studyCode ? eq(pilotParticipants.studyCode, studyCode) : undefined;
  const codeStudyCondition = studyCode ? eq(pilotStudyCodes.studyCode, studyCode) : undefined;

  return db().transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(718204915)`);

    const expiredCondition = and(
      eq(pilotStudyCodes.active, true),
      lt(pilotStudyCodes.expiresOn, today),
      codeStudyCondition,
    );
    const noConsent = notExists(
      tx
        .select({ id: pilotConsents.id })
        .from(pilotConsents)
        .where(eq(pilotConsents.participantId, pilotParticipants.id)),
    );
    const hasConsent = exists(
      tx
        .select({ id: pilotConsents.id })
        .from(pilotConsents)
        .where(eq(pilotConsents.participantId, pilotParticipants.id)),
    );
    const abandonedCondition = abandonedCutoff
      ? and(lt(pilotParticipants.createdOn, abandonedCutoff), noConsent, studyCodeCondition)
      : undefined;
    const withdrawnCondition = withdrawnCutoff
      ? and(
          isNotNull(pilotParticipants.researchWithdrawnOn),
          lt(pilotParticipants.researchWithdrawnOn, withdrawnCutoff),
          studyCodeCondition,
        )
      : undefined;
    const participantRetentionCondition = participantCutoff
      ? and(
          lt(pilotParticipants.lastSeenOn, participantCutoff),
          isNull(pilotParticipants.researchWithdrawnOn),
          hasConsent,
          studyCodeCondition,
        )
      : undefined;

    const countRows = async (table: typeof pilotStudyCodes | typeof pilotParticipants, condition: ReturnType<typeof and>) => {
      const [row] = await tx.select({ value: count() }).from(table).where(condition);
      return Number(row?.value ?? 0);
    };

    let expiredCodes = await countRows(pilotStudyCodes, expiredCondition);
    let abandonedEnrolments = abandonedCondition
      ? await countRows(pilotParticipants, abandonedCondition)
      : 0;
    let withdrawnParticipants = withdrawnCondition
      ? await countRows(pilotParticipants, withdrawnCondition)
      : 0;
    let retainedParticipants = participantRetentionCondition
      ? await countRows(pilotParticipants, participantRetentionCondition)
      : 0;

    if (options.execute) {
      expiredCodes = (await tx
        .update(pilotStudyCodes)
        .set({ active: false })
        .where(expiredCondition)
        .returning({ id: pilotStudyCodes.id })).length;

      if (abandonedCondition) {
        abandonedEnrolments = (await tx
          .delete(pilotParticipants)
          .where(abandonedCondition)
          .returning({ id: pilotParticipants.id })).length;
      }
      if (withdrawnCondition) {
        withdrawnParticipants = (await tx
          .delete(pilotParticipants)
          .where(withdrawnCondition)
          .returning({ id: pilotParticipants.id })).length;
      }
      if (participantRetentionCondition) {
        retainedParticipants = (await tx
          .delete(pilotParticipants)
          .where(participantRetentionCondition)
          .returning({ id: pilotParticipants.id })).length;
      }
    }

    return {
      mode: options.execute ? "execute" : "dry-run",
      studyScope: studyCode ?? "all-studies",
      today,
      configuredDays: {
        abandonedEnrolment: options.abandonedEnrolmentDays ?? null,
        withdrawnData: options.withdrawnDataDays ?? null,
        participantRetention: options.participantRetentionDays ?? null,
      },
      affected: {
        expiredCodes,
        abandonedEnrolments,
        withdrawnParticipants,
        retainedParticipants,
      },
    };
  });
}

async function main() {
  const result = await runDataLifecycle({
    execute: process.env.PILOT_LIFECYCLE_EXECUTE === "true",
    studyCode: process.env.PILOT_LIFECYCLE_STUDY_CODE,
    abandonedEnrolmentDays: parseOptionalDays("PILOT_ABANDONED_ENROLMENT_DAYS"),
    withdrawnDataDays: parseOptionalDays("PILOT_WITHDRAWN_DATA_DAYS"),
    participantRetentionDays: parseOptionalDays("PILOT_PARTICIPANT_RETENTION_DAYS"),
  });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .catch((error) => {
      process.stderr.write(`${error instanceof Error ? error.message : "Data lifecycle failed"}\n`);
      process.exitCode = 1;
    })
    .finally(closeDb);
}
