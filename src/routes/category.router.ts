import { Router } from "express";
import { CategoryController } from "../controller/category.controller";

const CategoryRouter = Router();
CategoryRouter.get("/", CategoryController.list);

export default CategoryRouter;
