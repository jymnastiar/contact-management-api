import type { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";
import {
  type LoginUserRequest,
  type RegisterUserRequest,
  type TokenUserRequest,
  type UpdateUserRequest,
  type UserRequest,
  type UserResponse,
  type UsersApiResponse,
} from "../types/users.type";
import { GenerateToken } from "../lib/generateToken";
import { ResponseError } from "../error/response.error";

export class UserController {
  static async register(
    req: Request,
    res: Response<UsersApiResponse<UserResponse>>,
    next: NextFunction,
  ): Promise<void> {
    try {
      const request: RegisterUserRequest = req.body as RegisterUserRequest;
      const { data, refresh_token } = await UserService.register(request);

      res.cookie("refresh_token", refresh_token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24,
      });

      const access_token = GenerateToken.generateAccessToken(data.username);

      res.status(201).json({
        message: " register new account",
        data,
        access_token,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(
    req: Request,
    res: Response<UsersApiResponse<UserResponse>>,
    next: NextFunction,
  ): Promise<void> {
    try {
      const request: LoginUserRequest = req.body;

      const { data, refresh_token } = await UserService.login(request);

      res.cookie("refresh_token", refresh_token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60,
      });

      const access_token = GenerateToken.generateAccessToken(data.username);

      res
        .status(200)
        .json({ message: "Success login to account", data, access_token });
    } catch (error) {
      next(error);
    }
  }

  static async logout(
    req: Request,
    res: Response<UsersApiResponse<undefined>>,
    next: NextFunction,
  ) {
    try {
      const request: TokenUserRequest = {
        refresh_token: req.cookies.refresh_token,
      };

      await UserService.logout(request);

      res.clearCookie("refresh_token", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      res.status(200).json({ message: "OK" });
    } catch (error) {
      next(error);
    }
  }

  static async get(
    req: UserRequest,
    res: Response<UsersApiResponse<UserResponse>>,
    next: NextFunction,
  ) {
    try {
      const username = req.user?.username;
      if (!username) {
        throw new ResponseError(401, "Unauthorized");
      }
      const userResponse = await UserService.get(username);

      res.status(200).json({
        message: "Success get current user profile",
        data: userResponse,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(
    req: UserRequest,
    res: Response<UsersApiResponse<UserResponse>>,
    next: NextFunction,
  ) {
    try {
      const newData: UpdateUserRequest = req.body;

      //? nangkep dari auth middleware
      const username = req.user?.username;
      if (!username) {
        throw new ResponseError(401, "Unauthorized");
      }

      const userResponse = await UserService.update(username, newData);

      res
        .status(200)
        .json({ data: userResponse, message: "Successfully update user data" });
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(
    req: Request,
    res: Response<UsersApiResponse<undefined>>,
    next: NextFunction,
  ) {
    try {
      const request: TokenUserRequest = {
        refresh_token: req.cookies.refresh_token,
      };
      const accessToken = await UserService.refreshToken(request);

      return res.status(200).json({
        access_token: accessToken,
        message: "New access token",
      });
    } catch (error) {
      next(error);
    }
  }
}
