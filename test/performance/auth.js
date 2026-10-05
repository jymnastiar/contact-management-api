import exec from "k6/execution";
import { AuthHelper } from "../helper/auth.js";

/** @type {import('k6/options').Options} */
export const options = {
  vus: 10,
  duration: "10s",
};

export default function () {
  const body = {
    username: `user_${exec.scenario.iterationInTest}_${Date.now()}`,
    password: "password",
    name: `Virtual User`,
  };

  const registerResponse = AuthHelper.register(body);

  AuthHelper.refreshToken(registerResponse.cookies["refresh_token"][0].value);
}
