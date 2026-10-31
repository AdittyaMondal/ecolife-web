/**
 * Hand-written API types.
 *
 * The real types are generated from ../ecolife-server/openapi.json by
 * `pnpm gen:api` into ./generated/api.d.ts. This file holds the handful the
 * build must not wait on, so a fresh clone typechecks before generation runs.
 * Once a type exists in the generated file, delete it from here.
 */

/** GET /health — the liveness probe. */
export type Liveness = {
  service: string;
  status: 'up';
};
