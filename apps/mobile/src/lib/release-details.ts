export const RELEASE_DETAILS = {
  controllerAddress: process.env.EXPO_PUBLIC_DATA_CONTROLLER_ADDRESS?.trim() ?? '',
  controllerName: process.env.EXPO_PUBLIC_DATA_CONTROLLER_NAME?.trim() ?? '',
  icoRegistration: process.env.EXPO_PUBLIC_ICO_REGISTRATION?.trim() ?? '',
  privacyEmail: process.env.EXPO_PUBLIC_PRIVACY_EMAIL?.trim() ?? '',
  privacyPolicyUrl: process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL?.trim() ?? '',
  researchEmail: process.env.EXPO_PUBLIC_RESEARCH_EMAIL?.trim() ?? '',
  supportEmail: process.env.EXPO_PUBLIC_SUPPORT_EMAIL?.trim() ?? '',
  supportUrl: process.env.EXPO_PUBLIC_SUPPORT_URL?.trim() ?? '',
} as const;
