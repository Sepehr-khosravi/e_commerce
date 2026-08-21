import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error(
    "REDIS_URL is not defined"
  );
}

const globalForRedis = globalThis as unknown as {
  redis: ReturnType<typeof createClient> | undefined;
};

export const redis =
  globalForRedis.redis ??
  createClient({
    url: redisUrl,
  });

redis.on("error", (error) => {
  console.error(
    "[Redis] Client error:",
    error
  );
});

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

let connectionPromise:
  | Promise<ReturnType<typeof createClient>>
  | undefined;

export async function getRedis() {
  if (redis.isOpen) {
    return redis;
  }

  if (!connectionPromise) {
    connectionPromise = redis
      .connect()
      .then(() => redis)
      .catch((error) => {
        connectionPromise = undefined;
        throw error;
      });
  }

  return connectionPromise;
}