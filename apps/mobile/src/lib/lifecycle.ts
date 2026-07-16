export const ENTRY_ROUTES = new Set(['onboarding', 'pilot-consent', 'privacy', 'legal', 'support', 'delete-data']);

export function needsOnboarding(onboardingComplete: boolean, firstSegment?: string): boolean {
  return !onboardingComplete && !(firstSegment && ENTRY_ROUTES.has(firstSegment));
}
