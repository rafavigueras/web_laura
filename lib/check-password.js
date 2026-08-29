import { timingSafeEqual } from 'node:crypto';

export function isPasswordCorrect(submitted, correct) {
  if (typeof submitted !== 'string' || submitted.length !== correct.length) return false;

  const a = Buffer.from(submitted);
  const b = Buffer.from(correct);
  return timingSafeEqual(a, b);
}
