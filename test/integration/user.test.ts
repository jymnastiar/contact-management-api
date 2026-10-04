import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "bun:test";
import supertest from "supertest";
import { app } from "../../src/app";
import { logger } from "../../src/lib/logger";
import { UserTest } from "./test.util";
import type {
  UserResponse,
  UsersApiResponse,
} from "../../src/types/users.type";
import { GenerateToken } from "../../src/lib/generateToken";
import jwt from "jsonwebtoken";

describe("POST /api/users/", () => {
  //? kelar setiap testing dipanggil fungsi ini
  afterEach(async () => {
    await UserTest.delete();
    console.log("\n");
  });
  beforeEach(() => {
    console.log("\n" + "=".repeat(60) + "\n");
  });

  it("Should reject register new user if request is invalid", async () => {
    const response = await supertest(app)
      .post("/api/users/")
      .send({ username: "", password: "", name: "", invalidField: "" });

    logger.debug(response.body);
    expect(response.status).toBe(400);
    expect(response.body).toBeDefined();
  });

  it("Should register new user", async () => {
    const response = await supertest(app).post("/api/users/").send({
      username: "tester",
      password: "tester",
      name: "tester",
    });

    logger.debug(response.body);
    expect(response.status).toBe(201);
    expect(response.body.data.username).toBe("tester");
    expect(response.body.data.name).toBe("tester");
    expect(response.body.access_token).toBeDefined();

    //? Verifikasi refresh_token pada cookie
    const cookies = response.headers["set-cookie"] as unknown as
      | string[]
      | undefined;
    expect(cookies).toBeDefined();
    expect(
      cookies?.some((cookie: string) => cookie.includes("refresh_token=")),
    ).toBe(true);
    expect(cookies?.some((cookie: string) => cookie.includes("HttpOnly"))).toBe(
      true,
    );
  });
});

describe("POST /api/users/login", () => {
  beforeAll(async () => {
    await UserTest.create();
  });
  beforeEach(() => {
    console.log("\n" + "=".repeat(60) + "\n");
  });
  afterEach(() => {
    console.log("\n");
  });
  afterAll(async () => {
    await UserTest.delete();
  });

  it("Should reject login if request is invalid", async () => {
    const response = await supertest(app)
      .post("/api/users/login")
      .send({ username: "", password: "", invalidField: "" });

    logger.debug(response.body);
    expect(response.status).toBe(400);
    expect(response.body).toBeDefined();
  });

  it("Should reject login if username and password not match", async () => {
    const response = await supertest(app)
      .post("/api/users/login")
      .send({ username: "tester", password: "different_password" });

    logger.debug(response.body);
    expect(response.status).toBe(400);
    expect(response.body).toBeDefined();
  });

  it("Should login user", async () => {
    const response = await supertest(app).post("/api/users/login").send({
      username: "tester",
      password: "tester",
    });

    const body = response.body as UsersApiResponse<UserResponse>;

    logger.debug(body);
    expect(response.status).toBe(200);
    expect(body.data?.username).toBe("tester");
    expect(body.data?.name).toBe("tester");
    expect(body.access_token).toBeDefined();

    //? Verifikasi refresh_token pada cookie
    const cookies = response.headers["set-cookie"] as string[] | undefined;
    expect(cookies).toBeDefined();
    expect(
      cookies?.some((cookie: string) => cookie.includes("refresh_token=")),
    ).toBe(true);
    expect(cookies?.some((cookie: string) => cookie.includes("HttpOnly"))).toBe(
      true,
    );
  });
});

describe("DELETE /api/users/current", () => {
  beforeEach(async () => {
    console.log("\n" + "=".repeat(60) + "\n");
    await UserTest.create();
  });
  afterEach(async () => {
    await UserTest.delete();
    console.log("\n");
  });

  it("Should reject logout if cookie is empty", async () => {
    const response = await supertest(app).delete("/api/users/current");

    logger.debug(response.body);
    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });

  it("Should reject logout if refresh token is invalid", async () => {
    const response = await supertest(app)
      .delete("/api/users/current")
      .set("Cookie", ["refresh_token=invalid_refresh_token"]);

    logger.debug(response.body);
    expect(response.status).toBe(401);
    expect(response.body.errors).toBe("Invalid or expired token");
  });

  it("Should reject logout if user not found or already logged out", async () => {
    const token = GenerateToken.generateRefreshToken("nonexistent_user");

    const response = await supertest(app)
      .delete("/api/users/current")
      .set("Cookie", [`refresh_token=${token}`]);

    logger.debug(response.body);
    expect(response.status).toBe(401);
    expect(response.body.errors).toBe("User not found for already logged out");
  });

  it("Should logout user successfully and clear cookie and refresh_token in database", async () => {
    //? Login terlebih dahulu untuk mendapatkan cookie refresh_token yang valid
    const loginResponse = await supertest(app).post("/api/users/login").send({
      username: "tester",
      password: "tester",
    });
    const cookies = loginResponse.headers["set-cookie"] as unknown as string[];

    const response = await supertest(app)
      .delete("/api/users/current")
      .set("Cookie", cookies);

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(response.body.message).toBeDefined();

    //? Verifikasi cookie refresh_token dihapus / dibersihkan
    const responseCookies = response.headers["set-cookie"] as
      | string[]
      | undefined;
    expect(responseCookies).toBeDefined();
    expect(
      responseCookies?.some((cookie: string) =>
        cookie.includes("refresh_token=;"),
      ),
    ).toBe(true);

    //? Verifikasi refresh_token di database telah di-set null
    const user = await UserTest.find();
    expect(user?.refresh_token).toBeNull();
  });
});

describe("GET /api/users/current/token", () => {
  beforeEach(async () => {
    console.log("\n" + "=".repeat(60) + "\n");
    await UserTest.create();
  });
  afterEach(async () => {
    await UserTest.delete();
    console.log("\n");
  });

  it("Should reject get new token if cookie is empty", async () => {
    const response = await supertest(app).get("/api/users/current/token");

    logger.debug(response.body);
    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });

  it("Should reject get new token if refresh token is invalid", async () => {
    const response = await supertest(app)
      .get("/api/users/current/token")
      .set("Cookie", ["refresh_token=invalid_refresh_token"]);

    logger.debug(response.body);
    expect(response.status).toBe(401);
    expect(response.body.errors).toBe("Invalid or expired token");
  });

  it("Should reject get new token if user not found in database", async () => {
    const token = GenerateToken.generateRefreshToken("nonexistent_user");

    const response = await supertest(app)
      .get("/api/users/current/token")
      .set("Cookie", [`refresh_token=${token}`]);

    logger.debug(response.body);
    expect(response.status).toBe(401);
    expect(response.body.errors).toBe("Unauthorized");
  });

  it("Should reject get new token if user has logged out (refresh_token is null in database)", async () => {
    //? User dibuat lewat UserTest.create() memiliki refresh_token = null
    const token = GenerateToken.generateRefreshToken("tester");

    const response = await supertest(app)
      .get("/api/users/current/token")
      .set("Cookie", [`refresh_token=${token}`]);

    logger.debug(response.body);
    expect(response.status).toBe(401);
    expect(response.body.errors).toBe("Unauthorized");
  });

  it("Should reject get new token if token does not match hash stored in database", async () => {
    //? Login untuk set token hash di DB
    await supertest(app).post("/api/users/login").send({
      username: "tester",
      password: "tester",
    });

    //? Buat token JWT valid untuk tester tetapi berbeda string tokennya (misal sesi lama / payload beda)
    const secretKey = process.env.REFRESH_TOKEN_SECRET!;
    const differentToken = jwt.sign(
      { username: "tester", sessionId: "old-session" },
      secretKey,
      { expiresIn: "1d" },
    );

    const response = await supertest(app)
      .get("/api/users/current/token")
      .set("Cookie", [`refresh_token=${differentToken}`]);

    logger.debug(response.body);
    expect(response.status).toBe(401);
    expect(response.body.errors).toBe("Unauthorized");
  });

  it("Should refresh access token successfully", async () => {
    //? Login untuk mendapatkan refresh_token valid yang terdaftar di database
    const loginResponse = await supertest(app).post("/api/users/login").send({
      username: "tester",
      password: "tester",
    });
    const cookies = loginResponse.headers["set-cookie"] as unknown as string[];

    const response = await supertest(app)
      .get("/api/users/current/token")
      .set("Cookie", cookies);

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(response.body.access_token).toBeDefined();
    expect(typeof response.body.access_token).toBe("string");
    expect(response.body.message).toBe("New access token");
  });
});
