import { prisma } from "../lib/prisma";
import {
  toUserResponse,
  type AuthResponse,
  type RegisterUserRequest,
  type LoginUserRequest,
  type TokenUserRequest,
  type UserResponse,
  type UpdateUserRequest,
} from "../types/users.type";
import { UserValidation } from "../validations/user.validation";
import { Validation } from "../validations/validation";
import { ResponseError } from "../error/response.error";
import { GenerateToken } from "../lib/generateToken";
import { verify, type JwtPayload } from "jsonwebtoken";
import { redisClient } from "../lib/redis";

export class UserService {
  static async register(request: RegisterUserRequest): Promise<AuthResponse> {
    const registerRequest = Validation.validate(
      UserValidation.REGISTER,
      request,
    );

    //? check if user already exists
    const totalUserWithSameUsername = await prisma.user.count({
      where: {
        username: registerRequest.username,
      },
    });
    if (totalUserWithSameUsername === 1) {
      throw new ResponseError(400, "Username already exists");
    }

    const refreshTokenPayload = GenerateToken.generateRefreshToken(
      registerRequest.username,
    );

    //? hashed data
    const hashedPassword = await Bun.password.hash(registerRequest.password, {
      algorithm: "bcrypt",
      cost: 10,
    });

    const user = await prisma.user.create({
      data: {
        username: registerRequest.username,
        name: registerRequest.name,
        password: hashedPassword,
      },
    });

    //? token store on redis
    await redisClient.setex(
      `refresh_token:${refreshTokenPayload.tokenId}`,
      60 * 60 * 24, //same as refresh_token_exp
      refreshTokenPayload.refreshToken,
    );

    return {
      data: toUserResponse(user),
      refresh_token: refreshTokenPayload.refreshToken,
    };
  }

  static async login(request: LoginUserRequest): Promise<AuthResponse> {
    const loginRequest = Validation.validate(UserValidation.LOGIN, request);

    const user = await prisma.user.findUnique({
      where: {
        username: loginRequest.username,
      },
    });

    if (!user) {
      throw new ResponseError(400, "Username not register yet");
    }

    const isPasswordValid = await Bun.password.verify(
      loginRequest.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new ResponseError(400, "Username and password not match");
    }

    //? generate refresh_token
    const refreshTokenPayload = GenerateToken.generateRefreshToken(
      user.username,
    );

    await redisClient.setex(
      `refresh_token:${refreshTokenPayload.tokenId}`,
      60 * 60 * 24,
      refreshTokenPayload.refreshToken,
    );

    return {
      data: toUserResponse(user),
      refresh_token: refreshTokenPayload.refreshToken!,
    };
  }

  static async logout(request: TokenUserRequest): Promise<void> {
    //? hapus token db, cookie
    const { refresh_token } = Validation.validate(
      UserValidation.VERIFY,
      request,
    );

    const secretKey = process.env.REFRESH_TOKEN_SECRET;
    if (!secretKey) {
      throw new Error("REFRESH_TOKEN_SECRET is not configured in .env");
    }

    const payload = verify(refresh_token, secretKey) as JwtPayload & {
      username: string;
      tokenId: string;
    };

    const result = await redisClient.del(`refresh_token:${payload.tokenId}`);

    if (result === 0) {
      throw new ResponseError(401, "User not found for already logged out");
    }
  }

  static async get(username: string): Promise<UserResponse> {
    const user = await prisma.user.findUnique({
      where: { username },
    });
    if (!user) {
      throw new ResponseError(404, "User not found");
    }

    return toUserResponse(user);
  }

  static async update(
    username: string,
    newData: UpdateUserRequest,
  ): Promise<UserResponse> {
    const updateRequest = Validation.validate(UserValidation.UPDATE, newData);

    try {
      //? make logic trycatch karena barangkali username tokennya valid tapi gada di db atau usernamenya udah ada di db
      const updatedUser = await prisma.user.update({
        where: { username },
        data: {
          ...(updateRequest.name && { name: updateRequest.name }),
          ...(updateRequest.password && {
            password: await Bun.password.hash(updateRequest.password, {
              algorithm: "bcrypt",
              cost: 10,
            }),
          }),
        },
      });

      return toUserResponse(updatedUser);
    } catch (error: any) {
      if (error.code === "P2025") {
        throw new ResponseError(404, "User not found");
      }
      if (error.code === "P2002") {
        throw new ResponseError(400, "Username already use");
      }
      throw error;
    }
  }

  static async refreshToken(request: TokenUserRequest): Promise<string> {
    //? verify refresh token
    const validateRefreshToken = Validation.validate(
      UserValidation.VERIFY,
      request,
    );

    const refreshToken = validateRefreshToken.refresh_token;

    const secretKey = process.env.REFRESH_TOKEN_SECRET;
    if (!secretKey) {
      throw new Error("REFRESH_TOKEN_SECRET is not configured in .env");
    }
    const payload = verify(refreshToken, secretKey) as JwtPayload & {
      username: string;
      tokenId: string;
    };

    const storedToken = await redisClient.get(
      `refresh_token:${payload.tokenId}`,
    );

    if (!storedToken) {
      throw new ResponseError(
        401,
        "Unauthorized: Session expired or logged out",
      );
    }

    if (storedToken !== refreshToken) {
      throw new ResponseError(401, "Unauthorized: Token mismatch");
    }
    const accessToken = GenerateToken.generateAccessToken(payload.username);

    return accessToken;
  }
}
