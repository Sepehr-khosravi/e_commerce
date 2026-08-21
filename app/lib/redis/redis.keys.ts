export const redisKeys = {
  otp: {
    register: (phone: string) =>
      `otp:register:${phone}`,

    login: (phone: string) =>
      `otp:login:${phone}`,

    verifyAttempts: (
      purpose: "register" | "login",
      phone: string
    ) =>
      `otp:verify-attempts:${purpose}:${phone}`,
  },

  rateLimit: {
    register: (ip: string) =>
      `rate-limit:register:${ip}`,

    login: (ip: string) =>
      `rate-limit:login:${ip}`,

    verify: (ip: string) =>
      `rate-limit:verify:${ip}`,

    resendOtp: (phone: string) =>
      `rate-limit:otp-resend:${phone}`,
  },
};