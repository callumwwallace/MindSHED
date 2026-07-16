import assert from 'node:assert/strict';
import test from 'node:test';

import { compareVersions } from './app-version';

test('compares app versions without lexical ordering mistakes', () => {
  assert.equal(compareVersions('1.10.0', '1.9.9'), 1);
  assert.equal(compareVersions('1.0', '1.0.0'), 0);
  assert.equal(compareVersions('1.0.0', '1.0.1'), -1);
});
