import type { Response, NextFunction, Request } from "express";
import type { UserRequest } from "../types/users.type";
import { verify, type JwtPayload } from "jsonwebtoken";
import { ResponseError } from "../error/response.error";
import { UserService } from "../services/user.service";
import { RateLimiter } from "../lib/rateLimiter";

export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : undefined;

    if (!accessToken) {
      throw new ResponseError(401, "Access token needed");
    } //? setelah ini panggil end point refresh token

    const secretKey = process.env.ACCESS_TOKEN_SECRET;
    if (!secretKey) {
      throw new Error("ACCESS_TOKEN_SECRET is not configured in .env");
    }

    const payload = verify(accessToken, secretKey) as JwtPayload & {
      username: string;
      tokenId: string;
    };
    if (!payload.username || typeof payload.username !== "string") {
      throw new ResponseError(401, "Invalid token payload");
    }

    const userKey = `rate_limit:user:${payload.username}`;
    const isAllowed = await RateLimiter.check(userKey);
    if (!isAllowed) {
      throw new ResponseError(429, "Too Many Requests, please slow down.");
    }

    (req as UserRequest).user = {
      username: payload.username,
      tokenId: payload.tokenId,
    };
    next();
  } catch (error) {
    next(error);
  }
}
