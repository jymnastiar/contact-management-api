import { prisma } from "../src/lib/prisma";
import bcrypt from "bcrypt";

export class UserTest {
  static async delete() {
    await prisma.user.deleteMany({
      //? make deleteMany karena setiap testing gak kirim error
      where: {
        username: "tester",
      },
    });
  }

  static async create() {
    await prisma.user.create({
      data: {
        name: "tester",
        username: "tester",
        password: await bcrypt.hash("tester", 10),
      },
    });
  }

  static async find() {
    return await prisma.user.findUnique({
      where: {
        username: "tester",
      },
    });
  }
}

export class ContactTest {
  static async deleteAll() {
    await prisma.contact.deleteMany({
      where: {
        username: "tester",
      },
    });
  }

  static async create() {
    return await prisma.contact.create({
      data: {
        first_name: "tester",
        last_name: "tester",
        email: "tester@example.com",
        phone: "0812345678",
        username: "tester",
      },
    });
  }

  static async findById(id: number) {
    return await prisma.contact.findUnique({
      where: { id },
    });
  }
}

export class AddressTest {
  static async deleteAll() {
    await prisma.address.deleteMany({
      where: {
        contact: {
          username: "tester",
        },
      },
    });
  }

  static async create(contactId: number) {
    return await prisma.address.create({
      data: {
        contact_id: contactId,
        street: "Jalan Kenanga",
        city: "Jakarta",
        province: "DKI Jakarta",
        country: "Indonesia",
        postal_code: "12345",
      },
    });
  }

  static async findById(id: number) {
    return await prisma.address.findUnique({
      where: { id },
    });
  }

  static async count(contactId: number) {
    return await prisma.address.count({
      where: { contact_id: contactId },
    });
  }
}
