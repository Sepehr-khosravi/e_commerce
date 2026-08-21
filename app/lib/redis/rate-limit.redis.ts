import {
  getRedisTTL,
  incrementRedisValue,
} from "./redis.service";

import { redisKeys } from "./redis.keys";

export interface RateLimitResult {
  allowed: boolean;
  count: number;
  remaining: number;
  retryAfterSeconds: number;
}

async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const count =
    await incrementRedisValue(
      key,
      windowSeconds
    );

  const ttl =
    await getRedisTTL(key);

  const allowed =
    count <= limit;

  return {
    allowed,

    count,

    remaining: Math.max(
      limit - count,
      0
    ),

    retryAfterSeconds:
      Math.max(ttl, 0),
  };
}

export async function checkRegisterRateLimit(
  ip: string
) {
  return checkRateLimit(
    redisKeys.rateLimit.register(ip),
    5,
    15 * 60
  );
}

export async function checkLoginRateLimit(
  ip: string
) {
  return checkRateLimit(
    redisKeys.rateLimit.login(ip),
    5,
    15 * 60
  );
}

export async function checkVerifyRateLimit(
  ip: string
) {
  return checkRateLimit(
    redisKeys.rateLimit.verify(ip),
    5,
    10 * 60
  );
}

export async function checkOtpResendRateLimit(
  phone: string
) {
  return checkRateLimit(
    redisKeys.rateLimit.resendOtp(phone),
    1,
    60
  );
}