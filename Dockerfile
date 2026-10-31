# syntax=docker/dockerfile:1

# ─── deps ─────────────────────────────────────────────────────────────────────
# Full install, devDependencies included: `next build` needs TypeScript, Tailwind
# and Biome's generated-types check.
FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# ─── builder ──────────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* values are INLINED INTO THE CLIENT BUNDLE AT BUILD TIME. Setting
# them in the platform's runtime environment has no effect whatsoever — the
# browser gets whatever was baked in here. They must be build args, and the
# image must be rebuilt to change one.
#
# EVERY NEXT_PUBLIC_* the code reads needs a line below, or it is frozen at its
# in-code default with no way to configure it. To check nothing has drifted:
#   grep -rho 'NEXT_PUBLIC_[A-Z_]*' src/ | sort -u
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Must match SESSION_COOKIE_NAME in ecolife-server. Read by src/middleware.ts,
# which is compiled for the edge runtime — so it is baked in like any other
# NEXT_PUBLIC_*, not read from the environment at runtime. Left unset it falls
# back to `ecolife_refresh`, which is also the server's default.
ARG NEXT_PUBLIC_SESSION_COOKIE_NAME
ENV NEXT_PUBLIC_SESSION_COOKIE_NAME=$NEXT_PUBLIC_SESSION_COOKIE_NAME

ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm build

# ─── runner ───────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001 -G nodejs

# `output: 'standalone'` in next.config.ts emits a self-contained server.js plus
# only the node_modules it actually traced, so this stage carries no pnpm store
# and no devDependencies.

# `public/` must stay TRACKED IN GIT, which is what `public/.gitkeep` is for.
# Git cannot store an empty directory, so while `public/` held no assets it
# existed on developer machines but not in a fresh clone — this COPY then failed
# with `"/app/public": not found`, but only on the build host, never locally.
# Delete .gitkeep once there are real assets beside it; not while it is alone.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Probed with node rather than wget, for the same reason as the server image.
HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]

CMD ["node", "server.js"]
