import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickPaymentLink } from '../lib/promo.js';

const config = {
  normalUrl: 'https://buy.stripe.com/normal',
  promoUrl: 'https://buy.stripe.com/promo',
  promoStartUtc: '2026-09-01T05:30:00Z',
  promoEndUtc: '2026-09-02T21:59:00Z',
};

test('returns normal link before the promo window starts', () => {
  const now = new Date('2026-09-01T05:29:59Z');
  assert.equal(pickPaymentLink(now, config), config.normalUrl);
});

test('returns promo link at the exact start instant', () => {
  const now = new Date('2026-09-01T05:30:00Z');
  assert.equal(pickPaymentLink(now, config), config.promoUrl);
});

test('returns promo link in the middle of the window', () => {
  const now = new Date('2026-09-02T12:00:00Z');
  assert.equal(pickPaymentLink(now, config), config.promoUrl);
});

test('returns promo link at the exact end instant', () => {
  const now = new Date('2026-09-02T21:59:00Z');
  assert.equal(pickPaymentLink(now, config), config.promoUrl);
});

test('returns normal link right after the promo window ends', () => {
  const now = new Date('2026-09-02T21:59:01Z');
  assert.equal(pickPaymentLink(now, config), config.normalUrl);
});
