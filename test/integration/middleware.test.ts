import { describe, expect, it, mock } from "bun:test";
import { authMiddleware } from "../../src/middleware/auth.middleware";
import { errorMiddleware } from "../../src/middleware/error.middleware";
import { ResponseError } from "../../src/error/response.error";
import { GenerateToken } from "../../src/lib/generateToken";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { z } from "zod";
import type { Response, NextFunction } from "express";
import type { UserRequest } from "../../src/types/users.type";

describe("authMiddleware", () => {
  it("Should call next with Error when Authorization header is missing", async () => {
    const req = {
      headers: {},
    } as unknown as UserRequest;
    const res = {} as Response;
    const next = mock((_err?: unknown) => {}) as unknown as NextFunction;

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    const calledError = (next as any).mock.calls[0][0] as Error;
    expect(calledError.message).toBe("Access token needed");
  });

  it("Should call next with Error when Authorization header does not start with Bearer", async () => {
    const req = {
      headers: {
        authorization: "Basic 12345",
      },
    } as unknown as UserRequest;
    const res = {} as Response;
    const next = mock((_err?: unknown) => {}) as unknown as NextFunction;

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    const calledError = (next as any).mock.calls[0][0] as Error;
    expect(calledError.message).toBe("Access token needed");
  });

  it("Should call next with JsonWebTokenError when token is invalid", async () => {
    const req = {
      headers: {
        authorization: "Bearer invalid_jwt_token",
      },
    } as unknown as UserRequest;
    const res = {} as Response;
    const next = mock((_err?: unknown) => {}) as unknown as NextFunction;

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(expect.any(JsonWebTokenError));
  });

  it("Should call next with Error when ACCESS_TOKEN_SECRET is missing", async () => {
    const originalSecret = process.env.ACCESS_TOKEN_SECRET;
    delete process.env.ACCESS_TOKEN_SECRET;

    const req = {
      headers: {
        authorization: "Bearer some_token",
      },
    } as unknown as UserRequest;
    const res = {} as Response;
    const next = mock((_err?: unknown) => {}) as unknown as NextFunction;

    try {
      await authMiddleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      const calledError = (next as any).mock.calls[0][0] as Error;
      expect(calledError.message).toBe(
        "ACCESS_TOKEN_SECRET is not configured in .env",
      );
    } finally {
      process.env.ACCESS_TOKEN_SECRET = originalSecret;
    }
  });

  it("Should attach user payload to req and call next without error when token is valid", async () => {
    const token = GenerateToken.generateAccessToken("tester");
    const req = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    } as unknown as UserRequest;
    const res = {} as Response;
    const next = mock((_err?: unknown) => {}) as unknown as NextFunction;

    await authMiddleware(req, res, next);

    expect(req.user).toEqual({ username: "tester" });
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });
});

describe("errorMiddleware", () => {
  const createMockRes = () => {
    const res: any = {};
    res.status = mock((code: number) => {
      res.statusCode = code;
      return res;
    });
    res.json = mock((body: any) => {
      res.body = body;
      return res;
    });
    return res;
  };

  const req = {} as any;
  const next = mock(() => {}) as unknown as NextFunction;

  it("Should handle ZodError with status 400 and validation message", async () => {
    const schema = z.object({ username: z.string().min(4) });
    let zodError: any;
    try {
      schema.parse({ username: "abc" });
    } catch (err) {
      zodError = err;
    }

    const res = createMockRes();
    await errorMiddleware(zodError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.body.errors).toContain("Validation error:");
  });

  it("Should handle JsonWebTokenError with status 401", async () => {
    const jwtError = new JsonWebTokenError("invalid token");
    const res = createMockRes();

    await errorMiddleware(jwtError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      errors: "Invalid or expired token",
    });
  });

  it("Should handle TokenExpiredError with status 401", async () => {
    const expiredError = new TokenExpiredError("jwt expired", new Date());
    const res = createMockRes();

    await errorMiddleware(expiredError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      errors: "Invalid or expired token",
    });
  });

  it("Should handle ResponseError with its custom status and message", async () => {
    const customError = new ResponseError(404, "Data not found");
    const res = createMockRes();

    await errorMiddleware(customError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      errors: "Data not found",
    });
  });

  it("Should handle generic Error with status 500", async () => {
    const genericError = new Error("Internal database failure");
    const res = createMockRes();

    await errorMiddleware(genericError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      errors: "Internal database failure",
    });
  });
});
