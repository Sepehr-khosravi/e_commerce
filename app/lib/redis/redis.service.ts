import { getRedis } from "./redis";

export async function setRedisValue(
  key: string,
  value: string,
  ttlSeconds?: number
) {
  const client = await getRedis();

  if (ttlSeconds !== undefined) {
    await client.set(key, value, {
      EX: ttlSeconds,
    });

    return;
  }

  await client.set(key, value);
}

export async function getRedisValue(
  key: string
) {
  const client = await getRedis();

  return client.get(key);
}

export async function deleteRedisValue(
  key: string
) {
  const client = await getRedis();

  return client.del(key);
}

export async function incrementRedisValue(
  key: string,
  ttlSeconds?: number
) {
  const client = await getRedis();

  const value = await client.incr(key);

  if (
    value === 1 &&
    ttlSeconds !== undefined
  ) {
    await client.expire(
      key,
      ttlSeconds
    );
  }

  return value;
}

export async function getRedisTTL(
  key: string
) {
  const client = await getRedis();

  return client.ttl(key);
}