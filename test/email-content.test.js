import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildAccessEmail } from '../lib/email-content.js';

const params = {
  pageUrl: 'https://laurawebsite.example/curso-contenido-abc123',
  password: 'TallerProductividad2025',
};

test('subject mentions the course', () => {
  const email = buildAccessEmail(params);
  assert.match(email.subject, /Taller de Productividad/i);
});

test('plain text body includes the page URL and password', () => {
  const email = buildAccessEmail(params);
  assert.match(email.text, new RegExp(params.pageUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(email.text, new RegExp(params.password));
});

test('html body includes the page URL and password', () => {
  const email = buildAccessEmail(params);
  assert.match(email.html, new RegExp(params.pageUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(email.html, new RegExp(params.password));
});
