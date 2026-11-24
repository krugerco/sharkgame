import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeName, validateSubmission } from '../src/validate.js';

test('sanitizeName strips markup and trims', () => {
  assert.equal(sanitizeName('  <b>Finn</b>  '), 'bFinnb');
  assert.equal(sanitizeName('A'.repeat(40)).length, 16);
  assert.equal(sanitizeName('   '), null);
  assert.equal(sanitizeName(42), null);
});

test('valid submission passes', () => {
  const r = validateSubmission({ name: 'Bruce', score: 1200, level: 3, duration: 60, clientId: 'abcd1234-ef' });
  assert.ok(r.ok);
  assert.equal(r.value.clientId, 'abcd1234-ef');
});

test('rejects bad numbers and implausible scores', () => {
  assert.equal(validateSubmission({ name: 'x', score: -1 }).ok, false);
  assert.equal(validateSubmission({ name: 'x', score: 1.5 }).ok, false);
  assert.equal(validateSubmission({ name: 'x', score: 10, level: 0 }).ok, false);
  assert.equal(validateSubmission({ name: 'x', score: 999999, duration: 10 }).ok, false);
  assert.equal(validateSubmission({ score: 10 }).ok, false);
});
