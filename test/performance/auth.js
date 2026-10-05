import exec from "k6/execution";
import { AuthHelper } from "../helper/auth.js";

/** @type {import('k6/options').Options} */
export const options = {
  vus: 10,
  duration: "10s",
};

export function setup() {
  const body = {
    username: `user_${Date.now()}`,
    password: "password",
    name: "Rate Limit Tester",
  };
  const registerRes = AuthHelper.register(body);
  return {
    token: registerRes.json("access_token"),
    refresh_token: registerRes.cookies["refresh_token"][0].value,
  };
}

export default function (data) {
  AuthHelper.current(data.token);

  // AuthHelper.refreshToken(data.refresh_token);
}
