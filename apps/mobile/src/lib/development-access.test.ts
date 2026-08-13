import assert from 'node:assert/strict';
import test from 'node:test';

import { canUseLocalPilotCode } from './development-access';

test('allows the local pilot shortcut only on development simulators and emulators', () => {
  const simulator = {
    isDevelopment: true,
    isPhysicalDevice: false,
    platform: 'ios',
    code: 'TEST-CODE',
  };

  assert.equal(canUseLocalPilotCode(simulator), true);
  assert.equal(canUseLocalPilotCode({ ...simulator, platform: 'android' }), true);
  assert.equal(canUseLocalPilotCode({ ...simulator, isPhysicalDevice: true }), false);
  assert.equal(canUseLocalPilotCode({ ...simulator, isDevelopment: false }), false);
  assert.equal(canUseLocalPilotCode({ ...simulator, platform: 'web' }), false);
  assert.equal(canUseLocalPilotCode({ ...simulator, code: '  ' }), false);
});
