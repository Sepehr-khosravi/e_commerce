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

ARG REDIS_URL
ARG DATABASE_URL
ARG NEXT_PUBLIC_APP_URL

ENV REDIS_URL=$REDIS_URL
ENV DATABASE_URL=$DATABASE_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

COPY --from=deps /app/node_modules ./node_modules

COPY . .

RUN npx prisma generate

RUN npm run build


# =========================
# Production
# =========================

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["node", "server.js"]