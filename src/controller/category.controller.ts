import type { NextFunction, Request, Response } from "express";
import type {
  CategoryApiResponse,
  CategoryResponse,
} from "../types/category.type";
import { CategoryService } from "../services/category.service";

export class CategoryController {
  static async list(
    _req: Request,
    res: Response<CategoryApiResponse<CategoryResponse[]>>,
    next: NextFunction,
  ) {
    try {
      const response = await CategoryService.list();
      res.status(200).json({
        data: response,
        message: `Success get category`,
      });
    } catch (error) {
      next(error);
    }
  }
}
