import type { NextFunction, Request, Response } from "express";
import type {
  ContactApiResponse,
  ContactResponse,
  CreateContactRequest,
  SearchContactRequest,
  UpdateContactRequest,
} from "../types/contact.type";
import { ContactService } from "../services/contact.service";
import type { UserRequest } from "../types/users.type";

export class ContactController {
  static async create(
    req: UserRequest,
    res: Response<ContactApiResponse<ContactResponse>>,
    next: NextFunction,
  ) {
    try {
      const request: CreateContactRequest = req.body as CreateContactRequest;
      const data = await ContactService.create(req.user?.username!, request);

      res.status(200).json({
        data,
        message: "Success to create new contact",
      });
    } catch (error) {
      next(error);
    }
  }

  static async get(
    req: UserRequest,
    res: Response<ContactApiResponse<ContactResponse>>,
    next: NextFunction,
  ) {
    try {
      const contactId = Number(req.params.contactId);
      const data = await ContactService.get(req.user?.username!, contactId);

      res.status(200).json({
        data,
        message: "Successful get data",
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(
    req: UserRequest,
    res: Response<ContactApiResponse<ContactResponse>>,
    next: NextFunction,
  ) {
    try {
      const request: UpdateContactRequest = req.body as UpdateContactRequest;
      const contactId = Number(req.params.contactId);
      request.id = contactId;
      const data = await ContactService.update(
        request,
        req.user?.username!,
        contactId,
      );

      res.status(200).json({
        data,
        message: "Successful get contact",
      });
    } catch (error) {
      next(error);
    }
  }

  static async remove(
    req: UserRequest,
    res: Response<ContactApiResponse<ContactResponse>>,
    next: NextFunction,
  ) {
    try {
      const contactId = Number(req.params.contactId);
      await ContactService.remove(req.user?.username!, contactId);

      res.status(200).json({
        data: "OK",
        message: "Successful remove contact",
      });
    } catch (error) {
      next(error);
    }
  }

  static async search(req: UserRequest, res: Response, next: NextFunction) {
    try {
      const request: SearchContactRequest = {
        name: req.query.name as string,
        phone: req.query.phone as string,
        email: req.query.email as string,
        page: req.query.page ? Number(req.query.page) : 1,
        size: req.query.size ? Number(req.query.size) : 10,
      };
      const searchContact = await ContactService.search(
        req.user?.username!,
        request,
      );

      res.status(200).json(searchContact);
    } catch (error) {
      next(error);
    }
  }
}
