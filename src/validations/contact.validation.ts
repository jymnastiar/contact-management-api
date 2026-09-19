import z from "zod";

export class ContactValidation {
  static readonly CREATE = z
    .object({
      first_name: z
        .string({ error: "First name is required" })
        .min(1, { message: "First name cannot be empty" })
        .max(100, { message: "First name cannot exceed 100 characters" }),
      last_name: z
        .string()
        .min(1, { message: "Last name cannot be empty" })
        .max(100, { message: "Last name cannot exceed 100 characters" })
        .optional(),
      email: z
        .string()
        .email({ message: "Invalid email format" })
        .max(100, { message: "Email cannot exceed 100 characters" })
        .optional(),
      phone: z
        .string()
        .min(1, { message: "Phone cannot be empty" })
        .max(20, { message: "Phone cannot exceed 20 characters" })
        .optional(),
    })
    .strict();

  static readonly UPDATE = z
    .object({
      id: z
        .number({ error: "Contact ID is required" })
        .positive({ message: "Contact ID must be a positive number" }),
      first_name: z
        .string()
        .min(1, { message: "First name cannot be empty" })
        .max(100, { message: "First name cannot exceed 100 characters" })
        .optional(),
      last_name: z
        .string()
        .min(1, { message: "Last name cannot be empty" })
        .max(100, { message: "Last name cannot exceed 100 characters" })
        .optional(),
      email: z
        .string()
        .email({ message: "Invalid email format" })
        .max(100, { message: "Email cannot exceed 100 characters" })
        .optional(),
      phone: z
        .string()
        .min(1, { message: "Phone cannot be empty" })
        .max(20, { message: "Phone cannot exceed 20 characters" })
        .optional(),
    })
    .strict();

  static readonly SEARCH = z
    .object({
      name: z
        .string()
        .min(1, { message: "Name cannot be empty" })
        .optional(),
      phone: z
        .string()
        .min(1, { message: "Phone cannot be empty" })
        .optional(),
      email: z
        .string()
        .min(1, { message: "Email cannot be empty" })
        .optional(),
      page: z
        .number({ error: "Page is required" })
        .min(1, { message: "Page must be at least 1" })
        .positive({ message: "Page must be a positive number" }),
      size: z
        .number({ error: "Size is required" })
        .min(1, { message: "Size must be at least 1" })
        .max(100, { message: "Size cannot exceed 100" })
        .positive({ message: "Size must be a positive number" }),
    })
    .strict();
}
