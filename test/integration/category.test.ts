import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
} from "bun:test";
import supertest from "supertest";
import { app } from "../../src/app";
import { logger } from "../../src/config/logger";
import { CategoryTest } from "./test.util";

describe("Category Controller (GET /api/categories)", () => {
  beforeEach(() => {
    console.log("\n" + "=".repeat(60) + "\n");
  });

  afterEach(async () => {
    await CategoryTest.deleteAll();
    console.log("\n");
  });

  afterAll(async () => {
    await CategoryTest.deleteAll();
  });

  it("Should return empty array when there are no categories in database", async () => {
    await CategoryTest.deleteAll();

    const response = await supertest(app).get("/api/categories");

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Success get category");
    expect(response.body.data).toBeDefined();
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBe(0);
  });

  it("Should return all parent categories with their nested children successfully", async () => {
    await CategoryTest.createParentsAndChildren();

    const response = await supertest(app).get("/api/categories");

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Success get category");
    expect(response.body.data).toBeDefined();
    expect(response.body.data.length).toBe(2);

    // Verifikasi Parent 1 (Elektronik)
    const elektronik = response.body.data.find(
      (cat: { id: string }) => cat.id === "test-elektronik",
    );
    expect(elektronik).toBeDefined();
    expect(elektronik.name).toBe("Elektronik & Gadget");
    expect(elektronik.parent_id).toBeNull();
    expect(elektronik.children).toBeDefined();
    expect(elektronik.children.length).toBe(2);

    // Verifikasi Children dari Elektronik
    const smartphone = elektronik.children.find(
      (child: { id: string }) => child.id === "test-smartphone",
    );
    expect(smartphone).toBeDefined();
    expect(smartphone.name).toBe("Smartphone & HP");
    expect(smartphone.parent_id).toBe("test-elektronik");

    const laptop = elektronik.children.find(
      (child: { id: string }) => child.id === "test-laptop",
    );
    expect(laptop).toBeDefined();
    expect(laptop.name).toBe("Laptop & Ultrabook");
    expect(laptop.parent_id).toBe("test-elektronik");

    // Verifikasi Parent 2 (Makanan)
    const makanan = response.body.data.find(
      (cat: { id: string }) => cat.id === "test-makanan",
    );
    expect(makanan).toBeDefined();
    expect(makanan.name).toBe("Makanan & Camilan");
    expect(makanan.parent_id).toBeNull();
    expect(makanan.children).toBeDefined();
    expect(makanan.children.length).toBe(1);

    const snack = makanan.children.find(
      (child: { id: string }) => child.id === "test-snack",
    );
    expect(snack).toBeDefined();
    expect(snack.name).toBe("Makanan Ringan & Snack Keripik");
    expect(snack.parent_id).toBe("test-makanan");
  });
});
