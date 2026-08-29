import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createToken, verifyToken } from '../lib/access-token.js';

const secret = 'test-secret';

test('a freshly created token verifies as valid', () => {
  const token = createToken(secret, { nowMs: 1000, ttlMs: 60_000 });
  assert.equal(verifyToken(token, secret, { nowMs: 1000 }), true);
});

test('a token verifies as valid right up to its expiry instant', () => {
  const token = createToken(secret, { nowMs: 1000, ttlMs: 60_000 });
  assert.equal(verifyToken(token, secret, { nowMs: 1000 + 60_000 }), true);
});

test('a token is rejected once past its expiry', () => {
  const token = createToken(secret, { nowMs: 1000, ttlMs: 60_000 });
  assert.equal(verifyToken(token, secret, { nowMs: 1000 + 60_001 }), false);
});

test('a token signed with a different secret is rejected', () => {
  const token = createToken(secret, { nowMs: 1000, ttlMs: 60_000 });
  assert.equal(verifyToken(token, 'other-secret', { nowMs: 1000 }), false);
});

test('a tampered token payload is rejected', () => {
  const token = createToken(secret, { nowMs: 1000, ttlMs: 60_000 });
  const [, signature] = token.split('.');
  const tampered = `9999999999999.${signature}`;
  assert.equal(verifyToken(tampered, secret, { nowMs: 1000 }), false);
});

test('garbage input is rejected without throwing', () => {
  assert.equal(verifyToken('not-a-token', secret, { nowMs: 1000 }), false);
  assert.equal(verifyToken('', secret, { nowMs: 1000 }), false);
  assert.equal(verifyToken(undefined, secret, { nowMs: 1000 }), false);
});
