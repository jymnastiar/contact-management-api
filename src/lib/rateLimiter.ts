import { redisClient } from "./redis";

export class RateLimiter {
  static async check(
    key: string,
    EXPIRE_TIME: number = 60,
    MAX_REQUEST: number = 10,
  ) {
    const maxRequest = await redisClient.incr(key);
    if (maxRequest === 1) {
      await redisClient.expire(key, EXPIRE_TIME);
    }
    return maxRequest <= MAX_REQUEST;
  }
}
