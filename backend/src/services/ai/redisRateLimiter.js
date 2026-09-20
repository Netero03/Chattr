import { createClient } from "redis";

export const createRedisRateLimitStore = (url) => {
  const client = createClient({ url });
  let connection;

  const connect = async () => {
    if (!connection) {
      client.on("error", (error) => console.error("AI Redis rate limiter error.", error));
      connection = client.connect().catch((error) => {
        connection = undefined;
        throw error;
      });
    }
    await connection;
  };

  return {
    async increment(key, windowMs) {
      await connect();
      const redisKey = `chattr:ai:rate:${key}`;
      const count = await client.incr(redisKey);
      if (count === 1) await client.pExpire(redisKey, windowMs);
      return count;
    },
    async delete(key) {
      await connect();
      await client.del(`chattr:ai:rate:${key}`);
    },
  };
};