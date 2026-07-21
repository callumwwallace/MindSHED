export type PendingPilotAction =
  | {
      kind: 'consent';
      requestedAt: string;
      participantId: string;
      participantToken: string;
      researchConsent: false;
      healthDataConsent: false;
      marketingConsent: boolean;
    }
  | {
      kind: 'withdrawal';
      requestedAt: string;
      participantId: string;
      deletionSecret: string;
    }
  | {
      kind: 'deletion';
      requestedAt: string;
      participantId: string;
      deletionSecret: string;
    };

const priority: Record<PendingPilotAction['kind'], number> = {
  consent: 1,
  withdrawal: 2,
  deletion: 3,
};

export function selectPendingPilotAction(
  current: PendingPilotAction | null,
  requested: PendingPilotAction,
): PendingPilotAction {
  if (!current) return requested;
  return priority[requested.kind] >= priority[current.kind] ? requested : current;
}

export function pilotErrorCode(error: unknown): string | undefined {
  return (error as { data?: { code?: string } })?.data?.code;
}

export function actionReachedTerminalState(action: PendingPilotAction, error: unknown): boolean {
  const code = pilotErrorCode(error);
  if (code === 'UNAUTHORIZED' || code === 'NOT_FOUND') return true;
  return action.kind === 'consent' && code === 'PRECONDITION_FAILED';
}
