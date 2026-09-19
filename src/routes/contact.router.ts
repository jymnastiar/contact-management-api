import { Router } from "express";
import { ContactController } from "../controller/contact.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const contactRouter = Router();

contactRouter.post("/", authMiddleware, ContactController.create);
contactRouter.get("/:contactId", authMiddleware, ContactController.get);
contactRouter.patch("/:contactId", authMiddleware, ContactController.update);
contactRouter.delete("/:contactId", authMiddleware, ContactController.remove);
contactRouter.get("/", authMiddleware, ContactController.search);

export default contactRouter;
