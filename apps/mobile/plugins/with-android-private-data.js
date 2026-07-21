const { AndroidConfig, withAndroidManifest } = require('expo/config-plugins');

module.exports = function withAndroidPrivateData(config) {
  return withAndroidManifest(config, (next) => {
    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(next.modResults);
    application.$['android:allowBackup'] = 'false';
    application.$['android:fullBackupContent'] = 'false';
    return next;
  });
};
