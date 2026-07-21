const PRODUCTION_PROFILE = process.env.EAS_BUILD_PROFILE === 'production'
  || process.env.MINDSHED_VALIDATE_PRODUCTION === 'true';

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Production mobile configuration requires ${name}.`);
  return value;
}

function requiredHttpsUrl(name) {
  const value = required(name);
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid HTTPS URL.`);
  }
  if (
    parsed.protocol !== 'https:'
    || parsed.username
    || parsed.password
    || ['localhost', '127.0.0.1'].includes(parsed.hostname)
  ) {
    throw new Error(`${name} must use a non-local HTTPS URL.`);
  }
  return parsed.toString().replace(/\/$/, '');
}

function requiredEmail(name) {
  const value = required(name);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    throw new Error(`${name} must be a valid public contact email address.`);
  }
  return value;
}

function validateProduction() {
  const apiUrl = requiredHttpsUrl('EXPO_PUBLIC_API_URL');
  const privacyPolicyUrl = requiredHttpsUrl('EXPO_PUBLIC_PRIVACY_POLICY_URL');
  const supportUrl = requiredHttpsUrl('EXPO_PUBLIC_SUPPORT_URL');
  const projectId = required('EAS_PROJECT_ID');
  const owner = required('EAS_OWNER');
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(projectId)) {
    throw new Error('EAS_PROJECT_ID must be a UUID.');
  }

  if (process.env.EXPO_PUBLIC_LEGAL_DOCUMENTS_APPROVED !== 'true') {
    throw new Error('Production mobile configuration requires EXPO_PUBLIC_LEGAL_DOCUMENTS_APPROVED=true.');
  }

  for (const name of [
    'EXPO_PUBLIC_SUPPORT_EMAIL',
    'EXPO_PUBLIC_PRIVACY_EMAIL',
    'EXPO_PUBLIC_RESEARCH_EMAIL',
  ]) requiredEmail(name);

  for (const name of [
    'EXPO_PUBLIC_DATA_CONTROLLER_NAME',
    'EXPO_PUBLIC_DATA_CONTROLLER_ADDRESS',
    'EXPO_PUBLIC_ICO_REGISTRATION',
  ]) required(name);

  return { apiUrl, owner, privacyPolicyUrl, projectId, supportUrl };
}

module.exports = ({ config }) => {
  const production = PRODUCTION_PROFILE ? validateProduction() : null;
  const projectId = production?.projectId ?? process.env.EAS_PROJECT_ID;
  const owner = production?.owner ?? process.env.EAS_OWNER;
  const plugins = (config.plugins ?? []).map((plugin) => {
    if (!production || !Array.isArray(plugin) || plugin[0] !== 'expo-build-properties') return plugin;
    const options = plugin[1] ?? {};
    return [plugin[0], {
      ...options,
      android: { ...options.android, usesCleartextTraffic: false },
    }];
  });

  return {
    ...config,
    owner,
    ios: {
      ...config.ios,
      buildNumber: config.ios?.buildNumber ?? '1',
      icon: './assets/images/icon.png',
      infoPlist: {
        ...config.ios?.infoPlist,
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      ...config.android,
      blockedPermissions: production
        ? [
            ...(config.android?.blockedPermissions ?? []),
            'android.permission.READ_EXTERNAL_STORAGE',
            'android.permission.WRITE_EXTERNAL_STORAGE',
            'android.permission.SYSTEM_ALERT_WINDOW',
          ]
        : config.android?.blockedPermissions,
      versionCode: config.android?.versionCode ?? 1,
    },
    extra: {
      ...config.extra,
      eas: projectId ? { projectId } : undefined,
      privacyPolicyUrl: production?.privacyPolicyUrl ?? process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL,
      supportUrl: production?.supportUrl ?? process.env.EXPO_PUBLIC_SUPPORT_URL,
    },
    plugins,
  };
};
