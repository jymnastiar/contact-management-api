import z from "zod";

//? karena request address itu perlu contact_id dan karena semua type diatur di zod, jadi mau gak mau model validasi di zod harus ada contact_id
//? kalau mau diakalin buat 2 model, di zod dan di type itu sendiri yang mana type ditambahin contact_id
export class AddressValidation {
  static readonly CREATE = z
    .object({
      contact_id: z
        .number({ error: "Contact ID is required" })
        .int({ message: "Contact ID must be an integer" })
        .positive({ message: "Contact ID must be a positive number" }),
      street: z
        .string()
        .trim()
        .min(1, { message: "Street cannot be empty" })
        .max(255, { message: "Street cannot exceed 255 characters" })
        .optional(),
      city: z
        .string()
        .trim()
        .min(1, { message: "City cannot be empty" })
        .max(100, { message: "City cannot exceed 100 characters" })
        .optional(),
      province: z
        .string()
        .trim()
        .min(1, { message: "Province cannot be empty" })
        .max(100, { message: "Province cannot exceed 100 characters" })
        .optional(),
      country: z
        .string({ error: "Country is required" })
        .trim()
        .min(1, { message: "Country cannot be empty" })
        .max(100, { message: "Country cannot exceed 100 characters" }),
      postal_code: z
        .string({ error: "Postal code is required" })
        .trim()
        .min(1, { message: "Postal code cannot be empty" })
        .max(10, { message: "Postal code cannot exceed 10 characters" }),
    })
    .strict();

  static readonly GET = z
    .object({
      id: z
        .number({ error: "ID is required" })
        .int({ message: "ID must be an integer" })
        .positive({ message: "ID must be a positive number" }),
      contact_id: z
        .number({ error: "Contact ID is required" })
        .int({ message: "Contact ID must be an integer" })
        .positive({ message: "Contact ID must be a positive number" }),
    })
    .strict();

  static readonly LIST = z
    .object({
      contact_id: z
        .number({ error: "Contact ID is required" })
        .int({ message: "Contact ID must be an integer" })
        .positive({ message: "Contact ID must be a positive number" }),
    })
    .strict();

  static readonly UPDATE = z
    .object({
      id: z
        .number({ error: "ID is required" })
        .int({ message: "ID must be an integer" })
        .positive({ message: "ID must be a positive number" }),
      contact_id: z
        .number({ error: "Contact ID is required" })
        .int({ message: "Contact ID must be an integer" })
        .positive({ message: "Contact ID must be a positive number" }),
      street: z
        .string()
        .min(1, { message: "Street cannot be empty" })
        .max(255, { message: "Street cannot exceed 255 characters" })
        .optional(),
      city: z
        .string()
        .min(1, { message: "City cannot be empty" })
        .max(100, { message: "City cannot exceed 100 characters" })
        .optional(),
      province: z
        .string()
        .min(1, { message: "Province cannot be empty" })
        .max(100, { message: "Province cannot exceed 100 characters" })
        .optional(),
      country: z
        .string({ error: "Country is required" })
        .min(1, { message: "Country cannot be empty" })
        .max(100, { message: "Country cannot exceed 100 characters" }),
      postal_code: z
        .string({ error: "Postal code is required" })
        .min(1, { message: "Postal code cannot be empty" })
        .max(10, { message: "Postal code cannot exceed 10 characters" }),
    })
    .strict();
}
