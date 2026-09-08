FROM node:22-alpine AS base

WORKDIR /app

# =========================
# Dependencies
# =========================

FROM base AS deps

COPY package.json package-lock.json ./

RUN npm ci


# =========================
# Builder
# =========================

FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules

COPY . .

# Prisma Client
RUN npx prisma generate

# Production build
RUN npm run build


# =========================
# Runner
# =========================

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# We keep node_modules here because Prisma CLI
# is needed for migrations.
COPY --from=deps /app/node_modules ./node_modules

# Next standalone output
COPY --from=builder /app/.next/standalone ./

COPY --from=builder /app/.next/static ./.next/static

COPY --from=builder /app/public ./public

# Prisma schema + migrations + config
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Startup script
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3000

CMD ["./docker-entrypoint.sh"]