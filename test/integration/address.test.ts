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
import { logger } from "../../src/config/logger";
import { AddressTest, ContactTest, UserTest } from "./test.util";
import { GenerateToken } from "../../src/lib/generateToken";
import type { Contact } from "../../src/generated/prisma/client";

describe("Address Controller", () => {
  let token: string;
  let contact: Contact;

  beforeAll(async () => {
    await UserTest.create();
    token = GenerateToken.generateAccessToken("tester");
  });

  beforeEach(async () => {
    contact = await ContactTest.create();
    console.log("\n" + "=".repeat(60) + "\n");
  });

  afterEach(async () => {
    await AddressTest.deleteAll();
    await ContactTest.deleteAll();
    console.log("\n");
  });

  afterAll(async () => {
    await AddressTest.deleteAll();
    await ContactTest.deleteAll();
    await UserTest.delete();
  });

  describe("POST /api/contacts/:contactId/addresses", () => {
    it("Should reject create address if token is missing", async () => {
      const response = await supertest(app)
        .post(`/api/contacts/${contact.id}/addresses`)
        .send({
          street: "Jalan Melati",
          city: "Jakarta",
          province: "DKI Jakarta",
          country: "Indonesia",
          postal_code: "12345",
        });

      logger.debug(response.body);
      expect(response.status).toBe(401);
      expect(response.body.errors).toBe("Access token needed");
    });

    it("Should reject create address if token is invalid", async () => {
      const response = await supertest(app)
        .post(`/api/contacts/${contact.id}/addresses`)
        .set("Authorization", "Bearer invalid_token")
        .send({
          street: "Jalan Melati",
          city: "Jakarta",
          province: "DKI Jakarta",
          country: "Indonesia",
          postal_code: "12345",
        });

      logger.debug(response.body);
      expect(response.status).toBe(401);
      expect(response.body.errors).toBe("Invalid or expired token");
    });

    it("Should reject create address if contact does not exist", async () => {
      const response = await supertest(app)
        .post(`/api/contacts/${contact.id + 9999}/addresses`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          street: "Jalan Melati",
          city: "Jakarta",
          province: "DKI Jakarta",
          country: "Indonesia",
          postal_code: "12345",
        });

      logger.debug(response.body);
      expect(response.status).toBe(404);
      expect(response.body.errors).toBe("Contact not found");
    });

    it("Should reject create address if required fields are missing", async () => {
      const response = await supertest(app)
        .post(`/api/contacts/${contact.id}/addresses`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          street: "Jalan Melati",
          city: "Jakarta",
        });

      logger.debug(response.body);
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it("Should reject create address if contactId is not an integer", async () => {
      const response = await supertest(app)
        .post("/api/contacts/abc/addresses")
        .set("Authorization", `Bearer ${token}`)
        .send({
          country: "Indonesia",
          postal_code: "12345",
        });

      logger.debug(response.body);
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it("Should create address successfully with all fields", async () => {
      const response = await supertest(app)
        .post(`/api/contacts/${contact.id}/addresses`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          street: "Jalan Mawar",
          city: "Bandung",
          province: "Jawa Barat",
          country: "Indonesia",
          postal_code: "40115",
        });

      logger.debug(response.body);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Success to create address");
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.street).toBe("Jalan Mawar");
      expect(response.body.data.city).toBe("Bandung");
      expect(response.body.data.province).toBe("Jawa Barat");
      expect(response.body.data.country).toBe("Indonesia");
      expect(response.body.data.postal_code).toBe("40115");
    });

    it("Should create address successfully with only required fields", async () => {
      const response = await supertest(app)
        .post(`/api/contacts/${contact.id}/addresses`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          country: "Indonesia",
          postal_code: "40115",
        });

      logger.debug(response.body);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Success to create address");
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.country).toBe("Indonesia");
      expect(response.body.data.postal_code).toBe("40115");
      expect(response.body.data.street).toBeNull();
      expect(response.body.data.city).toBeNull();
      expect(response.body.data.province).toBeNull();
    });
  });

  describe("GET /api/contacts/:contactId/addresses/:addressId", () => {
    it("Should reject get address if token is missing", async () => {
      const address = await AddressTest.create(contact.id);
      const response = await supertest(app).get(
        `/api/contacts/${contact.id}/addresses/${address.id}`,
      );

      logger.debug(response.body);
      expect(response.status).toBe(401);
      expect(response.body.errors).toBe("Access token needed");
    });

    it("Should reject get address if address does not exist", async () => {
      const response = await supertest(app)
        .get(`/api/contacts/${contact.id}/addresses/9999`)
        .set("Authorization", `Bearer ${token}`);

      logger.debug(response.body);
      expect(response.status).toBe(404);
      expect(response.body.errors).toBe("Address not found");
    });

    it("Should reject get address if address belongs to another contact", async () => {
      const otherContact = await ContactTest.create();
      const address = await AddressTest.create(otherContact.id);

      const response = await supertest(app)
        .get(`/api/contacts/${contact.id}/addresses/${address.id}`)
        .set("Authorization", `Bearer ${token}`);

      logger.debug(response.body);
      expect(response.status).toBe(404);
      expect(response.body.errors).toBe("Address not found");
    });

    it("Should get address successfully", async () => {
      const address = await AddressTest.create(contact.id);

      const response = await supertest(app)
        .get(`/api/contacts/${contact.id}/addresses/${address.id}`)
        .set("Authorization", `Bearer ${token}`);

      logger.debug(response.body);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Success get address");
      expect(response.body.data.id).toBe(address.id);
      expect(response.body.data.street).toBe(address.street);
      expect(response.body.data.city).toBe(address.city);
      expect(response.body.data.province).toBe(address.province);
      expect(response.body.data.country).toBe(address.country);
      expect(response.body.data.postal_code).toBe(address.postal_code);
    });
  });

  describe("PUT /api/contacts/:contactId/addresses/:addressId", () => {
    it("Should reject update address if token is missing", async () => {
      const address = await AddressTest.create(contact.id);
      const response = await supertest(app)
        .put(`/api/contacts/${contact.id}/addresses/${address.id}`)
        .send({
          street: "Jalan Baru",
          city: "Jakarta Barat",
          province: "DKI Jakarta",
          country: "Indonesia",
          postal_code: "11480",
        });

      logger.debug(response.body);
      expect(response.status).toBe(401);
      expect(response.body.errors).toBe("Access token needed");
    });

    it("Should reject update address if required fields are missing", async () => {
      const address = await AddressTest.create(contact.id);
      const response = await supertest(app)
        .put(`/api/contacts/${contact.id}/addresses/${address.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          street: "Jalan Baru",
        });

      logger.debug(response.body);
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it("Should reject update address if address does not exist", async () => {
      const response = await supertest(app)
        .put(`/api/contacts/${contact.id}/addresses/9999`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          country: "Indonesia",
          postal_code: "11480",
        });

      logger.debug(response.body);
      expect(response.status).toBe(404);
      expect(response.body.errors).toBe("Address not found");
    });

    it("Should update address successfully", async () => {
      const address = await AddressTest.create(contact.id);

      const response = await supertest(app)
        .put(`/api/contacts/${contact.id}/addresses/${address.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          street: "Jalan Perubahan",
          city: "Surabaya",
          province: "Jawa Timur",
          country: "Indonesia",
          postal_code: "60111",
        });

      logger.debug(response.body);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Success update address");
      expect(response.body.data.id).toBe(address.id);
      expect(response.body.data.street).toBe("Jalan Perubahan");
      expect(response.body.data.city).toBe("Surabaya");
      expect(response.body.data.province).toBe("Jawa Timur");
      expect(response.body.data.country).toBe("Indonesia");
      expect(response.body.data.postal_code).toBe("60111");

      const updated = await AddressTest.findById(address.id);
      expect(updated?.street).toBe("Jalan Perubahan");
      expect(updated?.city).toBe("Surabaya");
    });
  });

  describe("DELETE /api/contacts/:contactId/addresses/:addressId", () => {
    it("Should reject delete address if token is missing", async () => {
      const address = await AddressTest.create(contact.id);
      const response = await supertest(app).delete(
        `/api/contacts/${contact.id}/addresses/${address.id}`,
      );

      logger.debug(response.body);
      expect(response.status).toBe(401);
      expect(response.body.errors).toBe("Access token needed");
    });

    it("Should reject delete address if address does not exist", async () => {
      const response = await supertest(app)
        .delete(`/api/contacts/${contact.id}/addresses/9999`)
        .set("Authorization", `Bearer ${token}`);

      logger.debug(response.body);
      expect(response.status).toBe(404);
      expect(response.body.errors).toBe("Address not found");
    });

    it("Should delete address successfully", async () => {
      const address = await AddressTest.create(contact.id);

      const response = await supertest(app)
        .delete(`/api/contacts/${contact.id}/addresses/${address.id}`)
        .set("Authorization", `Bearer ${token}`);

      logger.debug(response.body);
      expect(response.status).toBe(200);
      expect(response.body.data).toBe("OK");
      expect(response.body.message).toBe("Success delete address");

      const deleted = await AddressTest.findById(address.id);
      expect(deleted).toBeNull();
    });
  });

  describe("GET /api/contacts/:contactId/addresses", () => {
    it("Should reject list addresses if token is missing", async () => {
      const response = await supertest(app).get(
        `/api/contacts/${contact.id}/addresses`,
      );

      logger.debug(response.body);
      expect(response.status).toBe(401);
      expect(response.body.errors).toBe("Access token needed");
    });

    it("Should reject list addresses if contact does not exist", async () => {
      const response = await supertest(app)
        .get(`/api/contacts/${contact.id + 9999}/addresses`)
        .set("Authorization", `Bearer ${token}`);

      logger.debug(response.body);
      expect(response.status).toBe(404);
      expect(response.body.errors).toBe("Contact not found");
    });

    it("Should reject list addresses if contactId is not an integer", async () => {
      const response = await supertest(app)
        .get("/api/contacts/abc/addresses")
        .set("Authorization", `Bearer ${token}`);

      logger.debug(response.body);
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it("Should return empty array when contact has no addresses", async () => {
      const response = await supertest(app)
        .get(`/api/contacts/${contact.id}/addresses`)
        .set("Authorization", `Bearer ${token}`);

      logger.debug(response.body);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Success get addresses");
      expect(response.body.data).toBeArray();
      expect(response.body.data.length).toBe(0);
    });

    it("Should list all addresses for contact successfully", async () => {
      await AddressTest.create(contact.id);
      await AddressTest.create(contact.id);

      const response = await supertest(app)
        .get(`/api/contacts/${contact.id}/addresses`)
        .set("Authorization", `Bearer ${token}`);

      logger.debug(response.body);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Success get addresses");
      expect(response.body.data).toBeArray();
      expect(response.body.data.length).toBe(2);
    });
  });
});
