import { pickPaymentLink } from '../lib/promo.js';

const PROMO_CONFIG = {
  normalUrl: 'https://buy.stripe.com/7sY00ld9n9Alegi0lw0oM01',
  promoUrl: 'https://buy.stripe.com/00wfZj1qF13P8VYecm0oM00',
  promoStartUtc: '2026-09-01T05:30:00Z',
  promoEndUtc: '2026-09-02T21:59:00Z',
};

export default function handler(req, res) {
  const destination = pickPaymentLink(new Date(), PROMO_CONFIG);
  res.writeHead(302, { Location: destination });
  res.end();
}
