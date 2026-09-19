import { z, type ZodType } from "zod";

export class UserValidation {
  static readonly REGISTER = z
    .object({
      username: z
        .string({ error: "Username is required" })
        .min(4, { message: "Username must be at least 4 characters" })
        .max(100, { message: "Username cannot exceed 100 characters" })
        .regex(/^[a-z0-9_]+$/, {
          message:
            "Username can only contain lowercase letters, numbers, and underscores",
        })
        .trim(),

      password: z
        .string({ error: "Password is required" })
        .min(6, { message: "Password must be at least 6 characters" })
        .max(100, { message: "Password cannot exceed 100 characters" }),

      name: z
        .string({ error: "Name is required" })
        .min(4, { message: "Name must be at least 4 characters" })
        .max(100, { message: "Name cannot exceed 100 characters" })
        .trim(),
    })
    .strict();
  static readonly LOGIN = z
    .object({
      username: z
        .string({ error: "Username is required" })
        .min(4, { message: "Username must be at least 4 characters" })
        .max(100, { message: "Username cannot exceed 100 characters" })
        .regex(/^[a-z0-9_]+$/, {
          message:
            "Username can only contain lowercase letters, numbers, and underscores",
        })
        .trim(),

      password: z
        .string({ error: "Password is required" })
        .min(6, { message: "Password must be at least 6 characters" })
        .max(100, { message: "Password cannot exceed 100 characters" }),
    })
    .strict();

  static readonly VERIFY = z
    .object({
      refresh_token: z
        .string({ error: "Refresh token is required" })
        .min(1, { message: "Refresh token cannot be empty" }),
    })
    .strict();

  static readonly UPDATE = z
    .object({
      name: z
        .string({ error: "Name is required" })
        .min(4, { message: "Name must be at least 4 characters" })
        .max(100, { message: "Name cannot exceed 100 characters" })
        .trim()
        .optional(),

      password: z
        .string({ error: "Password is required" })
        .min(6, { message: "Password must be at least 6 characters" })
        .max(100, { message: "Password cannot exceed 100 characters" })
        .optional(),
    })
    .strict();
}
