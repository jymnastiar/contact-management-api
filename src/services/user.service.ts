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

    const rawRefreshToken = GenerateToken.generateRefreshToken(
      registerRequest.username,
    );

    //? hashed data
    const hashedRefreshToken = await Bun.password.hash(rawRefreshToken, {
      algorithm: "bcrypt",
      cost: 10,
    });
    const hashedPassword = await Bun.password.hash(registerRequest.password, {
      algorithm: "bcrypt",
      cost: 10,
    });

    const user = await prisma.user.create({
      data: {
        username: registerRequest.username,
        name: registerRequest.name,
        password: hashedPassword,
        refresh_token: hashedRefreshToken,
      },
    });

    return {
      data: toUserResponse(user),
      refresh_token: rawRefreshToken,
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
    const rawRefreshToken = GenerateToken.generateRefreshToken(user.username);
    const hashedRefreshToken = await Bun.password.hash(rawRefreshToken, {
      algorithm: "bcrypt",
      cost: 10,
    });

    const updatedUser = await prisma.user.update({
      where: {
        username: user.username,
      },
      data: {
        refresh_token: hashedRefreshToken,
      },
    });

    return {
      data: toUserResponse(updatedUser),
      refresh_token: rawRefreshToken!,
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
    };

    const result = await prisma.user.updateMany({
      where: {
        username: payload.username,
      },
      data: {
        refresh_token: null,
      },
    });

    if (result.count === 0) {
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
    };

    //? Cari user di database berdasarkan payload username dari token
    const user = await prisma.user.findUnique({
      where: { username: payload.username },
    });

    //? Pastikan user masih ada di DB dan belum pernah logout (refresh_token tidak null)
    if (!user || !user.refresh_token) {
      throw new ResponseError(401, "Unauthorized");
    }

    //? Cocokkan refresh token yang dikirim dengan hash token yang tersimpan di DB
    const validUser = await Bun.password.verify(
      refreshToken,
      user.refresh_token!,
    );

    //? Jika token tidak cocok (misal sudah diganti karena login ulang di tempat lain)
    if (!validUser) {
      throw new ResponseError(401, "Unauthorized");
    }

    const accessToken = GenerateToken.generateAccessToken(payload.username);

    return accessToken;
  }
}
