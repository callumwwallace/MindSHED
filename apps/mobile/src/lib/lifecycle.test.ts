import assert from 'node:assert/strict';
import test from 'node:test';

import { needsOnboarding } from './lifecycle';

test('privacy, legal and support remain readable before consent', () => {
  assert.equal(needsOnboarding(false, 'privacy'), false);
  assert.equal(needsOnboarding(false, 'legal'), false);
  assert.equal(needsOnboarding(false, 'support'), false);
});

test('ordinary product routes remain gated until onboarding completes', () => {
  assert.equal(needsOnboarding(false, '(tabs)'), true);
  assert.equal(needsOnboarding(true, '(tabs)'), false);
});
