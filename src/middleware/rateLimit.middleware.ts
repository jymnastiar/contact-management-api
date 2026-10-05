import type { NextFunction, Request, Response } from "express";
import { RateLimiter } from "../lib/rateLimiter";
import { ResponseError } from "../error/response.error";

export function rateLimiter() {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const ip =
        (req.headers["x-forwarded-for"] as string) ||
        req.socket.remoteAddress ||
        "unknown_ip";

      const key = `rate_limit:ip:${ip.split(",")[0]?.trim()}`;
      const isAllowed = await RateLimiter.check(key!);
      if (!isAllowed) {
        throw new ResponseError(429, "To many request");
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
