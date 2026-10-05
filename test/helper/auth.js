import { check, fail } from "k6";
import http from "k6/http";

export class AuthHelper {
  /**
   * @param {{ username: string, password: string, name?: string }} body
   * @returns {import('k6/http').RefinedResponse<'text'>}
   */

  static register(body) {
    const registerResponse = http.post(
      "http://localhost:3000/api/users",
      JSON.stringify(body),
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    );

    const checkRegisterResponse = check(registerResponse, {
      "Register response must 201": (res) => res.status === 201,
      "Register request must not null": (res) => res.json("data") !== null,
    });

    if (!checkRegisterResponse) {
      fail("Failed to register user");
    }

    return registerResponse;
  }

  static current(token) {
    const currentResponse = http.get(
      "http://localhost:3000/api/users/current",
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const checkCurrentResponse = check(currentResponse, {
      "Current response must be 200": (res) => res.status === 200,
    });

    if (!checkCurrentResponse) {
      fail("Failed to get current account");
    }

    return currentResponse;
  }

  static refreshToken(refreshToken) {
    const refreshTokenResponse = http.get(
      "http://localhost:3000/api/users/current/token",
      {
        headers: {
          Accept: "application/json",
        },
        cookies: {
          refresh_token: refreshToken,
        },
      },
    );

    const checkRefreshTokenResponse = check(refreshTokenResponse, {
      "Refresh token response must be 200": (res) => res.status === 200,
      "has access token": (r) => r.json("access_token") !== undefined,
    });

    if (!checkRefreshTokenResponse) {
      fail("Failed to get current account");
    }

    return refreshTokenResponse;
  }
}
