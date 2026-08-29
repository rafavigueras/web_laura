import Stripe from 'stripe';
import nodemailer from 'nodemailer';
import { buildAccessEmail } from '../lib/email-content.js';

export const config = { api: { bodyParser: false } };

const CONTENT_PAGE_PATH = '/taller-productividad-7f2a9c4e1b8d.html';

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

async function alreadyProcessed(sessionId) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn('Redis (Upstash/Vercel) no configurado: sin deduplicación de emails.');
    return false;
  }
  const { Redis } = await import('@upstash/redis');
  const redis = Redis.fromEnv();
  const key = `stripe-session-emailed:${sessionId}`;
  const seen = await redis.get(key);
  if (seen) return true;
  await redis.set(key, true, { ex: 60 * 60 * 24 * 30 }); // 30 días
  return false;
}

async function sendAccessEmail({ to, pageUrl }) {
  const transport = nodemailer.createTransport({
    host: process.env.IONOS_SMTP_HOST,
    port: Number(process.env.IONOS_SMTP_PORT),
    secure: Number(process.env.IONOS_SMTP_PORT) === 465,
    auth: {
      user: process.env.IONOS_SMTP_USER,
      pass: process.env.IONOS_SMTP_PASS,
    },
  });

  const email = buildAccessEmail({ pageUrl, password: process.env.ACCESS_PASSWORD });

  await transport.sendMail({
    from: process.env.IONOS_SMTP_USER,
    to,
    subject: email.subject,
    text: email.text,
    html: email.html,
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end();
    return;
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const rawBody = await readRawBody(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Firma de webhook inválida:', err.message);
    res.statusCode = 400;
    res.end();
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const buyerEmail = session.customer_details?.email;

    if (buyerEmail && !(await alreadyProcessed(session.id))) {
      const pageUrl = `https://${req.headers.host}${CONTENT_PAGE_PATH}`;
      await sendAccessEmail({ to: buyerEmail, pageUrl });
    }
  }

  res.statusCode = 200;
  res.end(JSON.stringify({ received: true }));
}
