import z from "zod";
import type { ContactValidation } from "../validations/contact.validation";
import type { Contact } from "../generated/prisma/client";

export type ContactApiResponse<T> = {
  data: T | string;
  message: string;
};

export type ContactResponse = {
  id: number;
  first_name: string;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
};

export type CreateContactRequest = z.infer<typeof ContactValidation.CREATE>;
export type UpdateContactRequest = z.infer<typeof ContactValidation.UPDATE>;
export type SearchContactRequest = z.infer<typeof ContactValidation.SEARCH>;

//? filtering data yang berlebihan dari query prisma
export function toContactResponse(contact: Contact): ContactResponse {
  return {
    id: contact.id,
    first_name: contact.first_name,
    last_name: contact.last_name,
    email: contact.email,
    phone: contact.phone,
  };
}
