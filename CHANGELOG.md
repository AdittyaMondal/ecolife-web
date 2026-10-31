# Changelog

All notable changes to `ecolife-web`. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
this project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added — Sprint 0 scaffold

- Next.js 16.4.3 App Router on React 19.3.1, TypeScript 5.9.3, pnpm.
- Tailwind 4.3.3 CSS-first config. The `eco` palette and the semantic light/dark token set live
  in `src/app/globals.css` and are documented in `DESIGN.md`, the contract `ecolife-mobile`
  mirrors. Dark mode is a `.dark` class driven by `next-themes`.
- API client in `src/lib/`: `response-envelope.ts` (envelope parsing plus HTTP-status fallbacks
  for non-envelope responses), `fetcher.ts` (`ApiError`, browser client), `api.ts`
  (`backendFetch`, server-side, forwards cookies and `x-forwarded-for`), `query-keys.ts`.
- Providers: TanStack Query (`staleTime` 60s, `gcTime` 24h, `retry` 2, refetch on focus) and
  `next-themes` with no flash.
- `pnpm gen:api` generates `src/types/generated/api.d.ts` from
  `../ecolife-server/openapi.json`, and exits 0 with a skip message when that file is absent.
  `src/types/api.ts` holds a hand-written `Liveness` so the build never waits on generation.
- Route stubs for every group in PRD-v2 §9.1, plus one working screen at `/` that reads the
  backend health endpoint through the full client stack.
- Biome 2.6.4 as the only linter and formatter. No ESLint, no Prettier.

### Notes

- **`(marketing)` has no root page.** PRD-v2 §9.1 puts both the marketing landing page and the
  authenticated home at `/`, which Next cannot resolve — two pages on one path is a build
  error. `(app)/page.tsx` owns `/` because it is HOME; the marketing group ships `/about` and
  `/methodology`. Deciding where the public landing lives (a `/` gate that branches on session,
  or moving HOME to `/home`) is a product call for the navigation sprint.
- Route groups cannot host a page at `/` either, so `(auth)` and `(onboarding)` stubs sit on
  their PRD-named leaf paths rather than on the group root.
