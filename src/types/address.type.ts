import type z from "zod";
import type { AddressValidation } from "../validations/address.validation";
import type { Address } from "../generated/prisma/client";

export type AddressApiResponse<T> = {
  data: T | string;
  message: string;
};

export type AddressResponse = {
  id: number;
  street?: string | null;
  city?: string | null;
  province?: string | null;
  country: string;
  postal_code: string;
};

export type GetAddressRequest = z.infer<typeof AddressValidation.GET>;
export type CreateAddressRequest = z.infer<typeof AddressValidation.CREATE>;
export type UpdateAddressRequest = z.infer<typeof AddressValidation.UPDATE>;
export type ListAddressRequest = z.infer<typeof AddressValidation.LIST>;

export function toAddressResponse(address: Address): AddressResponse {
  return {
    id: address.id,
    street: address.street,
    city: address.city,
    province: address.province,
    country: address.country,
    postal_code: address.postal_code,
  };
}
