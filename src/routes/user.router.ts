import { Router } from "express";
import { UserController } from "../controller/user.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const userRouter = Router();

userRouter.post("/", UserController.register);
userRouter.post("/login", UserController.login);
userRouter.delete("/current", UserController.logout);
userRouter.get("/current/token", UserController.refreshToken);

userRouter.get("/current", authMiddleware, UserController.get);
userRouter.patch("/current", authMiddleware, UserController.update);

export default userRouter;
