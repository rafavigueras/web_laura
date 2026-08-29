import { createHmac, timingSafeEqual } from 'node:crypto';

function sign(expiresAtMs, secret) {
  return createHmac('sha256', secret).update(String(expiresAtMs)).digest('hex');
}

export function createToken(secret, { nowMs = Date.now(), ttlMs } = {}) {
  const expiresAtMs = nowMs + ttlMs;
  return `${expiresAtMs}.${sign(expiresAtMs, secret)}`;
}

export function verifyToken(token, secret, { nowMs = Date.now() } = {}) {
  if (typeof token !== 'string' || !token.includes('.')) return false;

  const [expiresAtStr, signature] = token.split('.');
  if (!/^\d+$/.test(expiresAtStr) || !signature) return false;

  const expiresAtMs = Number(expiresAtStr);
  const expected = sign(expiresAtMs, secret);

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  return nowMs <= expiresAtMs;
}
