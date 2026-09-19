import { ResponseError } from "../error/response.error";
import { prisma } from "../lib/prisma";
import {
  toContactResponse,
  type ContactResponse,
  type CreateContactRequest,
  type SearchContactRequest,
  type UpdateContactRequest,
} from "../types/contact.type";
import { ContactValidation } from "../validations/contact.validation";
import { Validation } from "../validations/validation";
import type { Contact, Prisma } from "../generated/prisma/client";
import type { Pageable, Paging } from "../types/page.type";

export class ContactService {
  static async create(
    username: string,
    request: CreateContactRequest,
  ): Promise<ContactResponse> {
    const createRequest = Validation.validate(
      ContactValidation.CREATE,
      request,
    );

    const create = await prisma.contact.create({
      data: {
        ...createRequest,
        username,
      },
    });

    return toContactResponse(create);
  }

  static async contactMustExist(
    username: string,
    contactId: number,
  ): Promise<Contact> {
    const contact = await prisma.contact.findFirst({
      where: { id: contactId, username },
    });
    if (!contact) {
      throw new ResponseError(404, "Contact not found");
    }
    return contact;
  }

  static async get(
    username: string,
    contactId: number,
  ): Promise<ContactResponse> {
    const existContact = await this.contactMustExist(username, contactId);

    return toContactResponse(existContact);
  }

  static async update(
    request: UpdateContactRequest,
    username: string,
    contactId: number,
  ): Promise<ContactResponse> {
    const contactRequest = Validation.validate(
      ContactValidation.UPDATE,
      request,
    );
    await this.contactMustExist(username, contactId);

    const contact = await prisma.contact.update({
      where: { id: contactRequest.id },
      data: {
        //? biar id gak masuk
        ...(contactRequest.first_name && {
          first_name: contactRequest.first_name,
        }),
        ...(contactRequest.last_name !== undefined && {
          last_name: contactRequest.last_name,
        }),
        ...(contactRequest.email !== undefined && {
          email: contactRequest.email,
        }),
        ...(contactRequest.phone !== undefined && {
          phone: contactRequest.phone,
        }),
      },
    });

    return toContactResponse(contact);
  }

  static async remove(username: string, contactId: number): Promise<void> {
    const existContact = await this.contactMustExist(username, contactId);

    await prisma.contact.delete({
      where: { id: existContact.id },
    });
  }

  static async search(
    username: string,
    request: SearchContactRequest,
  ): Promise<Pageable<ContactResponse>> {
    const searchContent = Validation.validate(
      ContactValidation.SEARCH,
      request,
    );

    const skip = (searchContent.page - 1) * searchContent.size;

    const filters: Prisma.ContactWhereInput[] = [];
    //? check if name exist
    if (searchContent.name) {
      filters.push({
        OR: [
          {
            first_name: { contains: searchContent.name, mode: "insensitive" },
          },
          {
            last_name: { contains: searchContent.name, mode: "insensitive" },
          },
        ],
      });
    }

    //? check if email exist
    if (searchContent.email) {
      filters.push({
        email: {
          contains: searchContent.email,
        },
      });
    }

    //? check if phone exist
    if (searchContent.phone) {
      filters.push({
        phone: {
          contains: searchContent.phone,
        },
      });
    }

    const contacts = await prisma.contact.findMany({
      where: {
        username,
        AND: filters,
      },
      take: searchContent.size,
      skip: skip,
    });

    const totalContact = await prisma.contact.count({
      where: {
        username,
        AND: filters,
      },
    });

    return {
      data: contacts.map((contact) => toContactResponse(contact)),
      paging: {
        current_page: searchContent.page,
        total_page: Math.ceil(totalContact / searchContent.size),
        size: searchContent.size,
        total_item: totalContact,
      },
    };
  }
}
