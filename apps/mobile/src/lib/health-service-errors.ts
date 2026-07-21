const PERMISSION_UNAVAILABLE = 'health-permission-unavailable';

export function healthPermissionUnavailableError(): Error {
  return new Error(PERMISSION_UNAVAILABLE);
}

export function isHealthPermissionUnavailable(error: unknown): boolean {
  return error instanceof Error && error.message === PERMISSION_UNAVAILABLE;
}
