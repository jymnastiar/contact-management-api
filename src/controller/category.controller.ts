import type { NextFunction, Request, Response } from "express";
import { CategoryService } from "../services/category.service";

export class CategoryController {
  static async list(_req: Request, res: Response<string>, next: NextFunction) {
    try {
      const response = await CategoryService.list();

      res.setHeader("Content-Type", "application/json");
      res.status(200).send(response);
    } catch (error) {
      next(error);
    }
  }
}
