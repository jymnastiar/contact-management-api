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
import { app } from "../src/app";
import { logger } from "../src/config/logger";
import { ContactTest, UserTest } from "./test.util";
import { GenerateToken } from "../src/lib/generateToken";
import { prisma } from "../src/lib/prisma";

describe("Contact Controller", () => {
  let token: string;

  beforeAll(async () => {
    await UserTest.create();
    token = GenerateToken.generateAccessToken("tester");
  });

  beforeEach(() => {
    console.log("\n" + "=".repeat(60) + "\n");
  });

  afterEach(async () => {
    await ContactTest.deleteAll();
    console.log("\n");
  });

  afterAll(async () => {
    await ContactTest.deleteAll();
    await UserTest.delete();
  });

  describe("POST /api/contacts", () => {
    it("Should reject create contact if token is missing", async () => {
      const response = await supertest(app).post("/api/contacts").send({
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
        phone: "0812345678",
      });

      logger.debug(response.body);
      expect(response.status).toBe(401);
      expect(response.body.errors).toBe("Access token needed");
    });

    it("Should reject create contact if token is invalid", async () => {
      const response = await supertest(app)
        .post("/api/contacts")
        .set("Authorization", "Bearer invalid_token")
        .send({
          first_name: "John",
          last_name: "Doe",
          email: "john@example.com",
          phone: "0812345678",
        });

      logger.debug(response.body);
      expect(response.status).toBe(401);
      expect(response.body.errors).toBe("Invalid or expired token");
    });

    it("Should reject create contact if request is invalid (first_name empty)", async () => {
      const response = await supertest(app)
        .post("/api/contacts")
        .set("Authorization", `Bearer ${token}`)
        .send({
          first_name: "",
          last_name: "Doe",
          email: "john@example.com",
          phone: "0812345678",
        });

      logger.debug(response.body);
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it("Should reject create contact if email format is invalid", async () => {
      const response = await supertest(app)
        .post("/api/contacts")
        .set("Authorization", `Bearer ${token}`)
        .send({
          first_name: "John",
          email: "invalid-email-format",
        });

      logger.debug(response.body);
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it("Should create contact successfully with all fields", async () => {
      const response = await supertest(app)
        .post("/api/contacts")
        .set("Authorization", `Bearer ${token}`)
        .send({
          first_name: "Eko",
          last_name: "Khannedy",
          email: "eko@example.com",
          phone: "0812345678",
        });

      logger.debug(response.body);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Success to create new contact");
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.first_name).toBe("Eko");
      expect(response.body.data.last_name).toBe("Khannedy");
      expect(response.body.data.email).toBe("eko@example.com");
      expect(response.body.data.phone).toBe("0812345678");

      // Verifikasi tersimpan di database
      const savedContact = await ContactTest.findById(response.body.data.id);
      expect(savedContact).toBeDefined();
      expect(savedContact?.username).toBe("tester");
    });

    it("Should create contact successfully with only required fields (first_name)", async () => {
      const response = await supertest(app)
        .post("/api/contacts")
        .set("Authorization", `Bearer ${token}`)
        .send({
          first_name: "Budi",
        });

      logger.debug(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.first_name).toBe("Budi");
      expect(response.body.data.last_name).toBeNull();
      expect(response.body.data.email).toBeNull();
      expect(response.body.data.phone).toBeNull();
    });
  });

  describe("GET /api/contacts/:contactId", () => {
    it("Should reject get contact if token is missing", async () => {
      const contact = await ContactTest.create();

      const response = await supertest(app).get(`/api/contacts/${contact.id}`);

      logger.debug(response.body);
      expect(response.status).toBe(401);
      expect(response.body.errors).toBe("Access token needed");
    });

    it("Should reject get contact if contact does not exist", async () => {
      const response = await supertest(app)
        .get("/api/contacts/999999")
        .set("Authorization", `Bearer ${token}`);

      logger.debug(response.body);
      expect(response.status).toBe(404);
      expect(response.body.errors).toBe("Contact not found");
    });

    it("Should reject get contact if contact belongs to other user", async () => {
      // Buat user lain & contact milik user lain
      const otherUser = await prisma.user.create({
        data: {
          username: "otheruser",
          password: "password123",
          name: "Other User",
        },
      });
      const otherContact = await prisma.contact.create({
        data: {
          first_name: "Other",
          username: otherUser.username,
        },
      });

      try {
        const response = await supertest(app)
          .get(`/api/contacts/${otherContact.id}`)
          .set("Authorization", `Bearer ${token}`); // Login sebagai 'tester'

        logger.debug(response.body);
        expect(response.status).toBe(404);
        expect(response.body.errors).toBe("Contact not found");
      } finally {
        await prisma.contact.deleteMany({
          where: { username: otherUser.username },
        });
        await prisma.user.deleteMany({
          where: { username: otherUser.username },
        });
      }
    });

    it("Should get contact successfully", async () => {
      const contact = await ContactTest.create();

      const response = await supertest(app)
        .get(`/api/contacts/${contact.id}`)
        .set("Authorization", `Bearer ${token}`);

      logger.debug(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(contact.id);
      expect(response.body.data.first_name).toBe(contact.first_name);
      expect(response.body.data.last_name).toBe(contact.last_name);
      expect(response.body.data.email).toBe(contact.email);
      expect(response.body.data.phone).toBe(contact.phone);
    });
  });

  describe("PATCH /api/contacts/:contactId", () => {
    it("Should reject update contact if token is missing", async () => {
      const contact = await ContactTest.create();

      const response = await supertest(app)
        .patch(`/api/contacts/${contact.id}`)
        .send({
          first_name: "Updated Name",
        });

      logger.debug(response.body);
      expect(response.status).toBe(401);
      expect(response.body.errors).toBe("Access token needed");
    });

    it("Should reject update contact if contact does not exist", async () => {
      const response = await supertest(app)
        .patch("/api/contacts/999999")
        .set("Authorization", `Bearer ${token}`)
        .send({
          first_name: "Updated Name",
        });

      logger.debug(response.body);
      expect(response.status).toBe(404);
      expect(response.body.errors).toBe("Contact not found");
    });

    it("Should reject update contact if email format is invalid", async () => {
      const contact = await ContactTest.create();

      const response = await supertest(app)
        .patch(`/api/contacts/${contact.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          email: "invalid-email-address",
        });

      logger.debug(response.body);
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it("Should update contact successfully with partial fields", async () => {
      const contact = await ContactTest.create();

      const response = await supertest(app)
        .patch(`/api/contacts/${contact.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          first_name: "Eko Updated",
          email: "ekoupdated@example.com",
        });

      logger.debug(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(contact.id);
      expect(response.body.data.first_name).toBe("Eko Updated");
      expect(response.body.data.email).toBe("ekoupdated@example.com");
      expect(response.body.data.last_name).toBe(contact.last_name); // tidak berubah
      expect(response.body.data.phone).toBe(contact.phone); // tidak berubah
    });
  });

  describe("DELETE /api/contacts/:contactId", () => {
    it("Should reject remove contact if token is missing", async () => {
      const contact = await ContactTest.create();

      const response = await supertest(app).delete(
        `/api/contacts/${contact.id}`,
      );

      logger.debug(response.body);
      expect(response.status).toBe(401);
      expect(response.body.errors).toBe("Access token needed");
    });

    it("Should reject remove contact if contact does not exist", async () => {
      const response = await supertest(app)
        .delete("/api/contacts/999999")
        .set("Authorization", `Bearer ${token}`);

      logger.debug(response.body);
      expect(response.status).toBe(404);
      expect(response.body.errors).toBe("Contact not found");
    });

    it("Should remove contact successfully and delete from database", async () => {
      const contact = await ContactTest.create();

      const response = await supertest(app)
        .delete(`/api/contacts/${contact.id}`)
        .set("Authorization", `Bearer ${token}`);

      logger.debug(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data).toBe("OK");

      // Verifikasi data sudah terhapus di database
      const deletedContact = await ContactTest.findById(contact.id);
      expect(deletedContact).toBeNull();
    });
  });

  describe("GET /api/contacts", () => {
    beforeEach(async () => {
      await prisma.contact.createMany({
        data: [
          {
            first_name: "Eko",
            last_name: "Khannedy",
            email: "eko@example.com",
            phone: "0811111111",
            username: "tester",
          },
          {
            first_name: "Budi",
            last_name: "Nugraha",
            email: "budi@example.com",
            phone: "0822222222",
            username: "tester",
          },
          {
            first_name: "Joko",
            last_name: "Eko",
            email: "joko@example.com",
            phone: "0833333333",
            username: "tester",
          },
        ],
      });
    });

    it("Should reject search contacts if token is missing", async () => {
      const response = await supertest(app).get("/api/contacts");

      logger.debug(response.body);
      expect(response.status).toBe(401);
      expect(response.body.errors).toBe("Access token needed");
    });

    it("Should search contacts without query parameter (return all contacts)", async () => {
      const response = await supertest(app)
        .get("/api/contacts")
        .set("Authorization", `Bearer ${token}`);

      logger.debug(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(3);
      expect(response.body.paging.current_page).toBe(1);
      expect(response.body.paging.total_item).toBe(3);
      expect(response.body.paging.total_page).toBe(1);
    });

    it("Should search contacts by name (matching first_name or last_name)", async () => {
      const response = await supertest(app)
        .get("/api/contacts?name=Eko")
        .set("Authorization", `Bearer ${token}`);

      logger.debug(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(2);
      expect(response.body.paging.total_item).toBe(2);
    });

    it("Should search contacts by email", async () => {
      const response = await supertest(app)
        .get("/api/contacts?email=budi@example.com")
        .set("Authorization", `Bearer ${token}`);

      logger.debug(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].first_name).toBe("Budi");
    });

    it("Should search contacts by phone", async () => {
      const response = await supertest(app)
        .get("/api/contacts?phone=0833333333")
        .set("Authorization", `Bearer ${token}`);

      logger.debug(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].first_name).toBe("Joko");
    });

    it("Should search contacts with pagination", async () => {
      const response = await supertest(app)
        .get("/api/contacts?page=1&size=2")
        .set("Authorization", `Bearer ${token}`);

      logger.debug(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(2);
      expect(response.body.paging.current_page).toBe(1);
      expect(response.body.paging.size).toBe(2);
      expect(response.body.paging.total_page).toBe(2);
      expect(response.body.paging.total_item).toBe(3);
    });

    it("Should return empty data if no contacts match", async () => {
      const response = await supertest(app)
        .get("/api/contacts?name=NonExistentName")
        .set("Authorization", `Bearer ${token}`);

      logger.debug(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(0);
      expect(response.body.paging.total_item).toBe(0);
    });
  });
});
