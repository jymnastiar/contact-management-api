import { prisma } from "../../src/lib/prisma";

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
        password: await Bun.password.hash("tester", {
          algorithm: "bcrypt",
          cost: 10,
        }),
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

export class CategoryTest {
  static async deleteAll() {
    await prisma.category.deleteMany();
  }

  static async createParentsAndChildren() {
    await prisma.category.createMany({
      data: [
        { id: "test-elektronik", name: "Elektronik & Gadget", parent_id: null },
        { id: "test-makanan", name: "Makanan & Camilan", parent_id: null },
        {
          id: "test-smartphone",
          name: "Smartphone & HP",
          parent_id: "test-elektronik",
        },
        {
          id: "test-laptop",
          name: "Laptop & Ultrabook",
          parent_id: "test-elektronik",
        },
        {
          id: "test-snack",
          name: "Makanan Ringan & Snack Keripik",
          parent_id: "test-makanan",
        },
      ],
    });
  }
}
