import type { Request, Response, NextFunction } from "express";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { ResponseError } from "../error/response.error";
import { ZodError } from "zod";
import { logger } from "../lib/logger";

export async function errorMiddleware(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> {
  if (error instanceof ZodError) {
    res
      .status(400)
      .json({ errors: `Validation error: ${JSON.stringify(error)}` });
  } else if (
    error instanceof JsonWebTokenError ||
    error instanceof TokenExpiredError
  ) {
    res.status(401).json({ errors: "Invalid or expired token" });
  } else if (error instanceof ResponseError) {
    res.status(error.status).json({ errors: error.message });
  } else {
    logger.error(error);
    const message =
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : error.message;
    res.status(500).json({ errors: message });
  }
}
