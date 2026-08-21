import {
  deleteRedisValue,
  getRedisValue,
  incrementRedisValue,
  setRedisValue,
} from "./redis.service";

import { redisKeys } from "./redis.keys";

const OTP_TTL_SECONDS = 5 * 60;

const OTP_MAX_ATTEMPTS = 5;

const OTP_ATTEMPT_TTL_SECONDS = 10 * 60;

export async function saveOtp(
  type: "register" | "login",
  phone: string,
  code: string
) {
  const key =
    type === "register"
      ? redisKeys.otp.register(phone)
      : redisKeys.otp.login(phone);

  await setRedisValue(
    key,
    code,
    OTP_TTL_SECONDS
  );
}

export async function getOtp(
  type: "register" | "login",
  phone: string
) {
  const key =
    type === "register"
      ? redisKeys.otp.register(phone)
      : redisKeys.otp.login(phone);

  return getRedisValue(key);
}

export async function deleteOtp(
  type: "register" | "login",
  phone: string
) {
  const key =
    type === "register"
      ? redisKeys.otp.register(phone)
      : redisKeys.otp.login(phone);

  await deleteRedisValue(key);
}

export async function recordOtpAttempt(
  purpose: "register" | "login",
  phone: string
) {
  const key =
    redisKeys.otp.verifyAttempts(
      purpose,
      phone
    );

  return incrementRedisValue(
    key,
    OTP_ATTEMPT_TTL_SECONDS
  );
}

export function hasExceededOtpAttempts(
  attempts: number
) {
  return attempts > OTP_MAX_ATTEMPTS;
}

export async function deleteOtpAttempts(
  purpose: "register" | "login",
  phone: string
) {
  const key =
    redisKeys.otp.verifyAttempts(
      purpose,
      phone
    );

  await deleteRedisValue(key);
}