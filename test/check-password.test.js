import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isPasswordCorrect } from '../lib/check-password.js';

test('accepts the exact matching password', () => {
  assert.equal(isPasswordCorrect('TallerProductividad2025', 'TallerProductividad2025'), true);
});

test('rejects a wrong password', () => {
  assert.equal(isPasswordCorrect('wrong', 'TallerProductividad2025'), false);
});

test('rejects an empty submitted password', () => {
  assert.equal(isPasswordCorrect('', 'TallerProductividad2025'), false);
});

test('rejects when submitted password has different length than the correct one', () => {
  assert.equal(isPasswordCorrect('TallerProductividad2025extra', 'TallerProductividad2025'), false);
});

test('rejects non-string input without throwing', () => {
  assert.equal(isPasswordCorrect(undefined, 'TallerProductividad2025'), false);
  assert.equal(isPasswordCorrect(null, 'TallerProductividad2025'), false);
  assert.equal(isPasswordCorrect(123, 'TallerProductividad2025'), false);
});
