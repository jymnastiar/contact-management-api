import type { Request } from "express";
import type { User } from "../generated/prisma/client";
import z from "zod";
import type { UserValidation } from "../validations/user.validation";

//? all users response type
export type UsersApiResponse<T> = {
  message: string;
  data?: T | undefined;
  access_token?: string;
};

//? register and login response type
export type AuthResponse = {
  data: UserResponse;
  refresh_token: string;
};

//? validate type
export type RegisterUserRequest = z.infer<typeof UserValidation.REGISTER>;
export type LoginUserRequest = z.infer<typeof UserValidation.LOGIN>;
export type TokenUserRequest = z.infer<typeof UserValidation.VERIFY>;
export type UpdateUserRequest = z.infer<typeof UserValidation.UPDATE>;

export interface UserRequest extends Request {
  user?: {
    username: string;
  };
}

//? exclude sensitive data, just return username and name without password, token, etc.
export type UserResponse = {
  username: string;
  name: string;
};
export function toUserResponse(user: User): UserResponse {
  return {
    username: user.username,
    name: user.name,
  };
}
