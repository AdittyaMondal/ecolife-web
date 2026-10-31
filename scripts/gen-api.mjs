#!/usr/bin/env node
/**
 * Generate src/types/generated/api.d.ts from the server's committed OpenAPI
 * document (PRD-v2 §2.3).
 *
 * The server repo is written in parallel, so a missing openapi.json is a
 * normal state, not a failure: this exits 0 with a skip message so CI and a
 * fresh clone both stay green.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { delimiter, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const schema = resolve(repoRoot, '../ecolife-server/openapi.json');
const out = resolve(repoRoot, 'src/types/generated/api.d.ts');

if (!existsSync(schema)) {
  console.log(`gen:api — skipped: no OpenAPI document at ${schema}`);
  console.log('gen:api — the server repo has not published one yet. Hand-written');
  console.log('gen:api — types in src/types/api.ts keep the build green until it does.');
  process.exit(0);
}

mkdirSync(dirname(out), { recursive: true });

// Works whether invoked via `pnpm gen:api` or plain `node scripts/gen-api.mjs`.
const binDir = resolve(repoRoot, 'node_modules/.bin');
const result = spawnSync('openapi-typescript', [schema, '-o', out], {
  stdio: 'inherit',
  cwd: repoRoot,
  env: { ...process.env, PATH: `${binDir}${delimiter}${process.env.PATH ?? ''}` },
  shell: process.platform === 'win32',
});

if (result.error) {
  console.error('gen:api — failed to run openapi-typescript:', result.error.message);
  process.exit(1);
}

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log(`gen:api — wrote ${out}`);
