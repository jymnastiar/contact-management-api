import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { AddressController } from "../controller/address.controller";

const addressRouter = Router({ mergeParams: true });

addressRouter.post("/", authMiddleware, AddressController.create);
addressRouter.get("/", authMiddleware, AddressController.list);
addressRouter.get("/:addressId", authMiddleware, AddressController.get);
addressRouter.put("/:addressId", authMiddleware, AddressController.update);
addressRouter.delete("/:addressId", authMiddleware, AddressController.delete);

export default addressRouter;
