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
ARG JWT_SECRET
ARG OTP_SECRET
ARG ZARINPAL_BASE_URL
ARG ZARINPAL_MERCHANT_ID
ARG ZARINPAL_AMOUNT_MULTIPLIER
ARG TOROB_TOKEN_VERSION
ARG TOROB_PUBLIC_KEY

ENV REDIS_URL=$REDIS_URL
ENV DATABASE_URL=$DATABASE_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV JWT_SECRET=$JWT_SECRET
ENV OTP_SECRET=$OTP_SECRET
ENV ZARINPAL_BASE_URL=$ZARINPAL_BASE_URL
ENV ZARINPAL_MERCHANT_ID=$ZARINPAL_MERCHANT_ID
ENV ZARINPAL_AMOUNT_MULTIPLIER=$ZARINPAL_AMOUNT_MULTIPLIER
ENV TOROB_TOKEN_VERSION=$TOROB_TOKEN_VERSION
ENV TOROB_PUBLIC_KEY=$TOROB_PUBLIC_KEY

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

# Next.js standalone output
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Prisma files
COPY --from=builder /app/prisma ./prisma

# Prisma Client (runtime)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Prisma CLI + dependencies (برای migrate deploy)
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/.bin ./node_modules/.bin

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]