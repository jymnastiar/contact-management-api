import type { NextFunction, Response } from "express";
import type { UserRequest } from "../types/users.type";
import type {
  AddressResponse,
  AddressApiResponse,
  CreateAddressRequest,
  UpdateAddressRequest,
  GetAddressRequest,
} from "../types/address.type";
import { AddressService } from "../services/address.service";

export class AddressController {
  static async create(
    req: UserRequest,
    res: Response<AddressApiResponse<AddressResponse>>,
    next: NextFunction,
  ) {
    try {
      const request: CreateAddressRequest = {
        ...req.body,
        contact_id: Number(req.params.contactId),
      };

      const response = await AddressService.create(
        request,
        req.user?.username!,
      );
      res.status(200).json({
        data: response,
        message: "Success to create address",
      });
    } catch (error) {
      next(error);
    }
  }

  static async get(
    req: UserRequest,
    res: Response<AddressApiResponse<AddressResponse>>,
    next: NextFunction,
  ) {
    try {
      const request: GetAddressRequest = {
        id: Number(req.params.addressId),
        contact_id: Number(req.params.contactId),
      };
      const response = await AddressService.get(request, req.user?.username!);
      res.status(200).json({
        data: response,
        message: "Success get address",
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(
    req: UserRequest,
    res: Response<AddressApiResponse<AddressResponse>>,
    next: NextFunction,
  ) {
    try {
      const request: UpdateAddressRequest = {
        ...req.body,
        contact_id: Number(req.params.contactId),
        id: Number(req.params.addressId),
      };

      const response = await AddressService.update(
        request,
        req.user?.username!,
      );
      res.status(200).json({
        data: response,
        message: "Success update address",
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(
    req: UserRequest,
    res: Response<AddressApiResponse<string>>,
    next: NextFunction,
  ) {
    try {
      const request: GetAddressRequest = {
        id: Number(req.params.addressId),
        contact_id: Number(req.params.contactId),
      };

      await AddressService.delete(request, req.user?.username!);
      res.status(200).json({
        data: "OK",
        message: "Success delete address",
      });
    } catch (error) {
      next(error);
    }
  }

  static async list(
    req: UserRequest,
    res: Response<AddressApiResponse<AddressResponse[]>>,
    next: NextFunction,
  ) {
    try {
      const response = await AddressService.list(
        Number(req.params.contactId),
        req.user?.username!,
      );
      res.status(200).json({
        data: response,
        message: "Success get addresses",
      });
    } catch (error) {
      next(error);
    }
  }
}
