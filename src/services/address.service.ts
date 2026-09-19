import { ResponseError } from "../error/response.error";
import type { Address } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import {
  toAddressResponse,
  type AddressResponse,
  type CreateAddressRequest,
  type GetAddressRequest,
  type UpdateAddressRequest,
} from "../types/address.type";
import { AddressValidation } from "../validations/address.validation";
import { Validation } from "../validations/validation";
import { ContactService } from "./contact.service";

export class AddressService {
  static async create(
    request: CreateAddressRequest,
    username: string,
  ): Promise<AddressResponse> {
    const createRequest = Validation.validate(
      AddressValidation.CREATE,
      request,
    );

    const existContact = await ContactService.contactMustExist(
      username,
      createRequest.contact_id,
    );

    const create = await prisma.address.create({
      data: {
        street: createRequest.street,
        city: createRequest.city,
        province: createRequest.province,
        country: createRequest.country,
        postal_code: createRequest.postal_code,
        contact_id: existContact.id,
      },
    });

    return toAddressResponse(create);
  }

  static async addressMustExist(
    request: GetAddressRequest,
    username: string,
  ): Promise<Address> {
    const address = await prisma.address.findFirst({
      where: {
        id: request.id,
        contact_id: request.contact_id,
        contact: { username }, //? relation 1 tingkat ke shcema Contact
      },
    });
    if (!address) {
      throw new ResponseError(404, "Address not found");
    }
    return address;
  }

  static async get(request: GetAddressRequest, username: string) {
    const getRequest: GetAddressRequest = Validation.validate(
      AddressValidation.GET,
      request,
    );

    const existAddress = await this.addressMustExist(getRequest, username);

    return toAddressResponse(existAddress);
  }

  static async update(
    request: UpdateAddressRequest,
    username: string,
  ): Promise<AddressResponse> {
    const updateRequest: UpdateAddressRequest = Validation.validate(
      AddressValidation.UPDATE,
      request,
    );
    const existAddress = await this.addressMustExist(updateRequest, username);

    const newAddress = await prisma.address.update({
      where: { id: existAddress.id },
      data: {
        //? biar id sama contact_id gak ngikut
        street: updateRequest.street,
        city: updateRequest.city,
        province: updateRequest.province,
        country: updateRequest.country,
        postal_code: updateRequest.postal_code,
      },
    });

    return toAddressResponse(newAddress);
  }

  static async delete(
    request: GetAddressRequest,
    username: string,
  ): Promise<void> {
    const validRequest = Validation.validate(AddressValidation.GET, request);
    const existAddress = await this.addressMustExist(validRequest, username);

    await prisma.address.delete({
      where: { id: existAddress.id },
    });
  }

  static async list(
    contact_id: number,
    username: string,
  ): Promise<AddressResponse[]> {
    const validateRequest = Validation.validate(AddressValidation.LIST, {
      contact_id,
    });
    const existContact = await ContactService.contactMustExist(
      username,
      validateRequest.contact_id,
    );

    const listAddress = await prisma.address.findMany({
      where: { contact_id: existContact.id },
    });

    return listAddress.map((address) => toAddressResponse(address));
  }
}
