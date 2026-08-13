interface LocalPilotCodeAvailability {
  isDevelopment: boolean;
  isPhysicalDevice: boolean;
  platform: string;
  code?: string;
}

export function canUseLocalPilotCode({
  isDevelopment,
  isPhysicalDevice,
  platform,
  code,
}: LocalPilotCodeAvailability): boolean {
  return isDevelopment
    && !isPhysicalDevice
    && (platform === 'ios' || platform === 'android')
    && Boolean(code?.trim());
}
