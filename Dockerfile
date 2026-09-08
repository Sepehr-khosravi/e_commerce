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

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
RUN npm run build


# =========================
# Production
# =========================

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Next.js standalone output
COPY --from=builder /app/public ./public

COPY --from=builder /app/.next/standalone ./

COPY --from=builder /app/.next/static ./.next/static

# Prisma files
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["node", "server.js"]