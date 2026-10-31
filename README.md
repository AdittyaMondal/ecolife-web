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

Multi-stage build on `node:22-alpine`, 297 MB, runs as non-root `nextjs` (uid 1001).
Requires `output: 'standalone'` in `next.config.ts` — without it there is no `server.js`
for the runner stage to copy and the image will not start.

```bash
docker build -t ecolife-web \
  --build-arg NEXT_PUBLIC_API_URL=https://api.example.com/api/v1 .
docker run -p 3000:3000 -e API_URL_INTERNAL=http://ecolife-server:4000/api/v1 ecolife-web
```

### The one that will definitely catch you

**`NEXT_PUBLIC_*` is baked into the client bundle at BUILD time.** Setting
`NEXT_PUBLIC_API_URL` as a *runtime* environment variable has no effect at all — the browser
gets whatever was compiled in. It must be passed as a **build argument**, and changing it
takes a rebuild, not a restart. If the deployed app calls `localhost:4010`, this is why.

Each one needs its own `ARG`/`ENV` pair in the Dockerfile's builder stage or it is stuck at
the in-code default. After adding a `NEXT_PUBLIC_*` anywhere in `src/`, check:

```bash
grep -rho 'NEXT_PUBLIC_[A-Z_]*' src/ | sort -u    # every name here needs a Dockerfile ARG
```

`API_URL_INTERNAL`, `INTERNAL_PROXY_TOKEN` and `TRUSTED_PROXY_HOPS` are the opposite —
read server-side at runtime by `src/lib/api.ts`, so they belong in Environment and a
restart picks them up.

### Builds locally, fails on the build host

`public/` must stay tracked in git — that is all `public/.gitkeep` is for. Git cannot store
an empty directory, so while `public/` held no assets it existed on every developer's disk
but not in a fresh clone, and `COPY --from=builder /app/public ./public` failed with
`"/app/public": not found` on Dokploy while building fine locally. Any local build is a
weak test of the Dockerfile for exactly this reason; `git clone` to a temp directory and
build *that* if a COPY is in question.

### Dokploy settings

Create an **Application** (not a Compose service) and set Build Type to **Dockerfile**:

| Field | Value |
| --- | --- |
| Dockerfile Path | `Dockerfile` |
| Docker Context Path | `.` |
| Docker Build Stage | **leave empty** |

**Leaving Build Stage empty is not optional.** Filling in `builder` stops the build at the
stage that only holds `next build` output — no `server.js`, no entrypoint, and the container
exits immediately.

Then, on the **Environment** tab, which holds two separate fields:

*Build Time Arguments* — baked in, rebuild to change:

```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
NEXT_PUBLIC_SESSION_COOKIE_NAME=ecolife_refresh
```

*Environment* — read at runtime, restart to change:

```
API_URL_INTERNAL=http://ecolife-server:4000/api/v1
INTERNAL_PROXY_TOKEN=<must equal INTERNAL_PROXY_TOKEN in ecolife-server>
TRUSTED_PROXY_HOPS=1
```

`TRUSTED_PROXY_HOPS=1` because Traefik is the one proxy Dokploy puts in front of this
container. Turning on Cloudflare proxying adds a hop before Traefik and makes it `2`.
Getting it wrong is not a crash: too low and the backend records a proxy's address as the
user's, too high and it silently records nothing. See `.env.example`.

`PORT` and `HOSTNAME` are already set in the image (`3000`, `0.0.0.0`). Do not override
`HOSTNAME` — binding to `localhost` makes the container unreachable from Traefik while
still looking healthy from inside.

**Domain:** set Container Port to `3000`. Leave *Advanced → Ports* alone; a host port
mapping there fights the domain routing and is only for direct `IP:port` access.

`INTERNAL_PROXY_TOKEN` is a shared secret, so prefer Dokploy's **Build-time Secrets** /
environment over Build Args — build args persist in the image and its history.

### Health check

`HEALTHCHECK` probes `/` with `node -e`, in **exec form**. Two deliberate choices:

- **Not `/api/health`.** That route proxies to ecolife-server, so a backend outage would
  mark this container unhealthy and get it restarted into an outage it cannot fix. `/` is
  liveness: it answers from this process alone.
- **Exec form, no shell.** The shell form runs through `sh -c`, which reads backticks as
  command substitution and rejects `??` as a bad substitution — the probe then fails every
  run, the task never goes healthy, and the orchestrator reschedules it forever while
  Traefik reports 502. Same bug, same fix, as `ecolife-server` (commit `bc4a7e6`).

### Verified 31/10/2026

Built and run locally against this commit, on Docker 29.5.2:

- Image builds clean from a cold cache; corepack fetches the pinned pnpm 12.5.1.
- Healthy in ~7s (`start-period` is 25s, so there is room).
- `/`, `/about`, `/methodology`, `/login`, `/register`, `/home`, `/track`, `/marketplace`,
  `/events`, `/leaderboard`, `/profile`, `/step/1` all answer 200.
- `/api/health` answers **502** with a well-formed `UPSTREAM_UNREACHABLE` envelope when the
  backend is unreachable — correct behaviour, and the reason it is not the health probe.
- `id` inside the container is `uid=1001(nextjs) gid=1001(nodejs)`.
- `NEXT_PUBLIC_API_URL` confirmed present in `.next/static/chunks/` after the build, which
  is what "baked in" means in practice.

Not verified here: an actual Dokploy deployment. The settings above come from Dokploy's
Build Type docs, not from a deploy on this project.
