import { sign, type SignOptions } from "jsonwebtoken";

export class GenerateToken {
  static generateAccessToken(username: string): string {
    const payload = { username };
    const secretKey = process.env.ACCESS_TOKEN_SECRET;
    if (!secretKey) {
      throw new Error("ACCESS_TOKEN_SECRET is not configured in .env");
    }
    const options: SignOptions = {
      expiresIn: (process.env.ACCESS_EXPIRES_IN ||
        "15m") as SignOptions["expiresIn"],
    };
    return sign(payload, secretKey, options);
  }

  static generateRefreshToken(username: string): string {
    const payload = { username };
    const secretKey = process.env.REFRESH_TOKEN_SECRET;
    if (!secretKey) {
      throw new Error("REFRESH_TOKEN_SECRET is not configured in .env");
    }
    const options: SignOptions = {
      expiresIn: (process.env.REFRESH_EXPIRES_IN ||
        "1d") as SignOptions["expiresIn"],
    };
    return sign(payload, secretKey, options);
  }
}
