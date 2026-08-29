import { isPasswordCorrect } from '../lib/check-password.js';
import { createToken, verifyToken } from '../lib/access-token.js';

const COOKIE_NAME = 'curso_acceso';
const TTL_MS = 24 * 60 * 60 * 1000; // 24h

function readCookie(req, name) {
  const header = req.headers.cookie || '';
  const match = header.split(';').map((c) => c.trim()).find((c) => c.startsWith(`${name}=`));
  return match ? match.slice(name.length + 1) : null;
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
  } catch {
    return {};
  }
}

export default async function handler(req, res) {
  const secret = process.env.SESSION_SECRET;
  const correctPassword = process.env.ACCESS_PASSWORD;

  if (req.method === 'GET') {
    const token = readCookie(req, COOKIE_NAME);
    const valid = verifyToken(token, secret);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ valid }));
    return;
  }

  if (req.method === 'POST') {
    const { password } = await readJsonBody(req);

    if (!isPasswordCorrect(password, correctPassword)) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ ok: false }));
      return;
    }

    const token = createToken(secret, { ttlMs: TTL_MS });
    res.setHeader(
      'Set-Cookie',
      `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${Math.floor(TTL_MS / 1000)}`
    );
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  res.statusCode = 405;
  res.end();
}
