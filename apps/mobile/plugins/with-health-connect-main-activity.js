const { withMainActivity } = require('expo/config-plugins');

module.exports = function withHealthConnectMainActivity(config) {
  return withMainActivity(config, (next) => {
    if (next.modResults.language !== 'kt') return next;
    let contents = next.modResults.contents;
    const importLine = 'import dev.matinzd.healthconnect.permissions.HealthConnectPermissionDelegate';
    if (!contents.includes(importLine)) {
      const packageLine = contents.match(/^package .*$/m)?.[0];
      if (packageLine) contents = contents.replace(packageLine, `${packageLine}\n\n${importLine}`);
    }
    const delegateLine = 'HealthConnectPermissionDelegate.setPermissionDelegate(this)';
    if (!contents.includes(delegateLine)) {
      contents = contents.replace(/(super\.onCreate\((?:null|savedInstanceState)\)\s*)/, `$1\n    ${delegateLine}\n`);
    }
    next.modResults.contents = contents;
    return next;
  });
};

