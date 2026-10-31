/**
 * The one check behind response-envelope.ts: the non-envelope paths are the
 * ones that bite in production, so they are the ones pinned here.
 *
 *   pnpm test
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  CLIENT_ERROR_CODES,
  httpStatusMessage,
  isEnvelope,
  readEnvelope,
} from './response-envelope.ts';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

test('reads a success envelope', async () => {
  const res = await readEnvelope<{ status: string }>(
    json({ status: true, data: { status: 'up' }, error: null }),
  );
  assert.deepEqual(res, { ok: true, data: { status: 'up' } });
});

test('passes a failure envelope through by code, not status', async () => {
  const res = await readEnvelope(
    json(
      {
        status: false,
        data: null,
        error: { code: 'AUTH_001', message: 'Bad login.', details: {} },
      },
      401,
    ),
  );
  assert.equal(res.ok, false);
  assert.equal(res.ok === false && res.error.code, 'AUTH_001');
  assert.equal(res.ok === false && res.error.message, 'Bad login.');
});

test('405 with an empty body never surfaces the body', async () => {
  const res = await readEnvelope(new Response(null, { status: 405 }));
  assert.equal(res.ok, false);
  assert.equal(res.ok === false && res.error.code, 'HTTP_405');
  assert.equal(res.ok === false && res.error.message, httpStatusMessage(405));
});

test('an HTML proxy page becomes a status message, not markup', async () => {
  const html = '<html><body>502 Bad Gateway — nginx</body></html>';
  const res = await readEnvelope(
    new Response(html, { status: 502, headers: { 'content-type': 'text/html' } }),
  );
  assert.equal(res.ok, false);
  assert.equal(res.ok === false && res.error.code, 'HTTP_502');
  assert.ok(res.ok === false && !res.error.message.includes('nginx'));
});

test('a 504 with no body is a timeout message', async () => {
  const res = await readEnvelope(new Response(null, { status: 504 }));
  assert.equal(res.ok === false && res.error.message, httpStatusMessage(504));
});

test('a 200 that is not an envelope is malformed, not success', async () => {
  const res = await readEnvelope(json({ service: 'ecolife-server', status: 'up' }));
  assert.equal(res.ok, false);
  assert.equal(res.ok === false && res.error.code, CLIENT_ERROR_CODES.malformed);
});

test('a success envelope on a failing status trusts the status', async () => {
  const res = await readEnvelope(json({ status: true, data: { a: 1 }, error: null }, 503));
  assert.equal(res.ok, false);
  assert.equal(res.ok === false && res.error.code, 'HTTP_503');
});

test('isEnvelope rejects near-misses', () => {
  assert.equal(isEnvelope(null), false);
  assert.equal(isEnvelope({ status: true, data: 1 }), false);
  assert.equal(isEnvelope({ status: true, data: 1, error: { code: 'X' } }), false);
  assert.equal(isEnvelope({ status: false, data: null, error: { message: 'no code' } }), false);
  assert.equal(isEnvelope({ status: 'true', data: 1, error: null }), false);
});
