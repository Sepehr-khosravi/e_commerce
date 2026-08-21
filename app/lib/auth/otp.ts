import crypto from "crypto";

import {
  deleteOtp,
  getOtp,
  recordOtpAttempt,
  saveOtp,
  hasExceededOtpAttempts,
} from "../redis/otp.redis";

import {
  checkOtpResendRateLimit,
} from "../redis/rate-limit.redis";

const OTP_LENGTH = 6;

function generateOtp(): string {
  const min = 10 ** (OTP_LENGTH - 1);
  const max = 10 ** OTP_LENGTH;

  return crypto
    .randomInt(min, max)
    .toString();
}

function hashOtp(
  phoneNumber: string,
  code: string
): string {
  const secret = process.env.OTP_SECRET;

  if (!secret) {
    throw new Error(
      "OTP_SECRET is not configured"
    );
  }

  return crypto
    .createHmac("sha256", secret)
    .update(`${phoneNumber}:${code}`)
    .digest("hex");
}

function normalizePhone(
  phoneNumber: string
) {
  return phoneNumber.trim();
}

export async function createOtp(
  phoneNumber: string,
  purpose: "register" | "login"
) {
  phoneNumber = normalizePhone(phoneNumber);

  if (!phoneNumber) {
    throw new Error(
      "Phone number is required"
    );
  }

  /*
   * Prevent users from requesting a new OTP
   * repeatedly.
   */
  const rateLimit =
    await checkOtpResendRateLimit(
      phoneNumber
    );

  if (!rateLimit.allowed) {
    return {
      success: false,
      reason: "OTP_RATE_LIMITED",
      retryAfterSeconds:
        rateLimit.retryAfterSeconds,
    };
  }

  const code = generateOtp();

  const codeHash = hashOtp(
    phoneNumber,
    code
  );

  /*
   * Redis automatically replaces the previous
   * OTP for this phone/purpose.
   */
  await saveOtp(
    purpose,
    phoneNumber,
    codeHash
  );

  /*
   * Development-only SMS replacement.
   *
   * Later this section will call your SMS provider.
   */
  console.log(
    "================================="
  );

  console.log(
    `OTP for ${phoneNumber}: ${code}`
  );

  console.log(
    "================================="
  );

  return {
    success: true,
    expiresIn: 5 * 60,
  };
}

export async function verifyOtp(
  phoneNumber: string,
  code: string,
  purpose: "register" | "login"
) {
  phoneNumber = normalizePhone(phoneNumber);

  code = code.trim();

  if (!phoneNumber || !code) {
    return {
      success: false,
      reason: "INVALID_REQUEST",
    };
  }

  const attempts =
    await recordOtpAttempt(
      purpose,
      phoneNumber
    );

  if (
    hasExceededOtpAttempts(attempts)
  ) {
    return {
      success: false,
      reason: "TOO_MANY_ATTEMPTS",
    };
  }

  const storedHash =
    await getOtp(
      purpose,
      phoneNumber
    );

  if (!storedHash) {
    return {
      success: false,
      reason: "OTP_NOT_FOUND",
    };
  }

  const codeHash = hashOtp(
    phoneNumber,
    code
  );

  /*
   * Use timingSafeEqual rather than directly
   * comparing hashes.
   */
  const storedBuffer =
    Buffer.from(storedHash, "hex");

  const providedBuffer =
    Buffer.from(codeHash, "hex");

  const isValid =
    storedBuffer.length ===
      providedBuffer.length &&
    crypto.timingSafeEqual(
      storedBuffer,
      providedBuffer
    );

  if (!isValid) {
    return {
      success: false,
      reason: "INVALID_OTP",
    };
  }

  /*
   * OTP is one-time use.
   */
  await deleteOtp(
    purpose,
    phoneNumber
  );

  return {
    success: true,
  };
}