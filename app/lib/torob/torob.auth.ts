import { importSPKI, jwtVerify } from "jose";

const TOROB_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
${!!process.env.TOROB_PUBLIC_KEY || "MCowBQYDK2VwAyEAt6Mu4T0pBORY11W+QeM35UsmLO3vsf+6yKpFDEImFk0="}
-----END PUBLIC KEY-----`;

const TOKEN_VERSION = "1";

export async function verifyTorobRequest(request: Request): Promise<void> {
  const token = request.headers.get("X-Torob-Token");
  const tokenVersion = request.headers.get("X-Torob-Token-Version");

  if (!token) {
    throw new TorobAuthError("Missing X-Torob-Token");
  }

  if (tokenVersion !== TOKEN_VERSION) {
    throw new TorobAuthError("Invalid Torob token version");
  }

  const host = request.headers.get("host");

  if (!host) {
    throw new TorobAuthError("Missing host header");
  }

  try {
    const publicKey = await importSPKI(TOROB_PUBLIC_KEY, "EdDSA");

    await jwtVerify(token, publicKey, {
      algorithms: ["EdDSA"],
      audience: host,
    });
  } catch {
    throw new TorobAuthError("Invalid Torob token");
  }
}

export class TorobAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TorobAuthError";
  }
}