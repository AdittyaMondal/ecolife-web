# ecolife-web

The EcoLife web app — Next.js 16 (App Router), Tailwind 4, TanStack Query.
One of three repos; see `../PRD-v2.md` §9 for the spec and §2.3 for the API contract.

**Sprint 0 is scaffolding only.** Every route is a stub. The single working screen is the home
route, which fetches the backend health endpoint to prove the client → envelope → query → token
pipeline end to end.

## Setup

```bash
pnpm install
cp .env.example .env.local        # then fill in the two URLs
pnpm gen:api                      # types from ../ecolife-server/openapi.json (skips if absent)
pnpm dev                          # http://localhost:3000
```

Against the Prism mock, set `NEXT_PUBLIC_API_URL=http://localhost:4010/api/v1` in `.env.local`
and run the mock from the server repo (`pnpm mock`). Leaving `NEXT_PUBLIC_API_URL` empty sends
the browser to this app's own `/api/*` route handlers, which need `API_URL_INTERNAL` set.

## Scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` | Dev server |
| `pnpm build` / `pnpm start` | Production build / serve |
| `pnpm lint` | Biome check — the only linter and formatter here (no ESLint, no Prettier) |
| `pnpm format` | Biome check with `--write` |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm gen:api` | Regenerate `src/types/generated/api.d.ts` from the server's OpenAPI document |

## Layout

```
src/
├─ app/
│  ├─ (marketing)/   about · methodology              public
│  ├─ (auth)/        login · register · verify-email · forgot · reset
│  ├─ (onboarding)/  step/[n]
│  ├─ (app)/         layout · page (HOME) · track · marketplace · events ·
│  │                 leaderboard · profile
│  ├─ admin/         web-only admin surface
│  ├─ api/           route handlers bridging to ecolife-server
│  └─ globals.css    design tokens — see DESIGN.md
├─ components/{ui,blocks,sections}/
├─ hooks/            one module per resource (use-*.ts)
├─ lib/              api client, envelope, query keys
├─ providers/        query + theme
└─ types/            api.ts (hand-written) · generated/ (from OpenAPI)
```

`(app)/page.tsx` owns `/`. The marketing group has no root page — see CHANGELOG.

## The API contract

`openapi.json` lives in `ecolife-server` and is committed there; this repo never needs the
server running to typecheck. Every response is an envelope:

```ts
{ status: true,  data: T,    error: null }
{ status: false, data: null, error: { code, message, details } }
```

**Branch on `error.code`, never on `error.message`.** Codes are the contract; messages are copy.
`src/lib/response-envelope.ts` also handles everything that is *not* an envelope — an empty 405,
an HTML proxy page, a 504 — by mapping the HTTP status to a plain-language sentence. A raw
response body is never shown to a user.

## Conventions

- Query keys live only in `src/lib/query-keys.ts`, so invalidation is a lookup, not a guess.
- Query defaults: `staleTime` 60s, `gcTime` 24h, `retry` 2, refetch on window focus.
- Design tokens live only in `src/app/globals.css` and are documented in `DESIGN.md`, which
  `ecolife-mobile` mirrors. Change both repos together.
- Mobile-first: designed at 360px, no horizontal scroll at 320px. WCAG 2.2 AA.
- Recharts is bundled. Never a CDN script tag.

## Docker / Dokploy

Verified by building and running the image locally (31/10/2026): all routes
answer 200, the landing page renders, it runs as non-root `nextjs` (uid 1001),
and it is 294 MB. Requires `output: 'standalone'` in `next.config.ts`.

```bash
docker build -t ecolife-web --build-arg NEXT_PUBLIC_API_URL=https://api.example.com/api/v1 .
docker run -p 3000:3000 ecolife-web
```

### The one that will definitely catch you

**`NEXT_PUBLIC_*` is baked into the client bundle at BUILD time.** Setting
`NEXT_PUBLIC_API_URL` as a *runtime* environment variable in Dokploy has no
effect at all — the browser gets whatever was compiled in. It must be passed as
a **build argument**, and changing it requires a rebuild, not a restart.

In Dokploy: put it under **Build Args**, not Environment. If the deployed app
tries to call `localhost:4010`, this is why.

`API_URL_INTERNAL` is different — it is read server-side at runtime by
`src/lib/api.ts`, so that one does belong in Environment.
