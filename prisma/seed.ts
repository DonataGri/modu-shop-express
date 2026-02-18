import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import bcrypt from "bcrypt";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function seed() {
  console.log("Clearing existing data...");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.skuAttributeOption.deleteMany();
  await prisma.sku.deleteMany();
  await prisma.attributeOption.deleteMany();
  await prisma.attribute.deleteMany();
  await prisma.product.deleteMany();
  await prisma.storeUsers.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seeding users...");
  const passwordHash = await bcrypt.hash("password123", 10);

  const alice = await prisma.user.create({
    data: {
      email: "alice@example.com",
      passwordHash,
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: "bob@example.com",
      passwordHash,
    },
  });

  const charlie = await prisma.user.create({
    data: {
      email: "charlie@example.com",
      passwordHash,
    },
  });

  console.log("Seeding stores...");
  const techStore = await prisma.store.create({
    data: {
      name: "TechZone",
      description: "Electronics and gadgets for everyday life",
      userStores: {
        create: [
          { userId: alice.id, role: "OWNER" },
          { userId: bob.id, role: "STAFF" },
        ],
      },
    },
  });

  const clothingStore = await prisma.store.create({
    data: {
      name: "Urban Threads",
      description: "Modern streetwear and casual clothing",
      userStores: {
        create: [
          { userId: bob.id, role: "OWNER" },
          { userId: charlie.id, role: "STAFF" },
        ],
      },
    },
  });

  console.log("Seeding attributes...");
  const color = await prisma.attribute.create({
    data: {
      storeId: clothingStore.id,
      name: "Color",
      options: {
        create: [
          { value: "Black" },
          { value: "White" },
          { value: "Navy" },
          { value: "Red" },
        ],
      },
    },
    include: { options: true },
  });

  const size = await prisma.attribute.create({
    data: {
      storeId: clothingStore.id,
      name: "Size",
      options: {
        create: [
          { value: "S" },
          { value: "M" },
          { value: "L" },
          { value: "XL" },
        ],
      },
    },
    include: { options: true },
  });

  const storage = await prisma.attribute.create({
    data: {
      storeId: techStore.id,
      name: "Storage",
      options: {
        create: [{ value: "128GB" }, { value: "256GB" }, { value: "512GB" }],
      },
    },
    include: { options: true },
  });

  const techColor = await prisma.attribute.create({
    data: {
      storeId: techStore.id,
      name: "Color",
      options: {
        create: [{ value: "Space Gray" }, { value: "Silver" }],
      },
    },
    include: { options: true },
  });

  console.log("Seeding products & SKUs...");

  // --- TechZone products ---
  const laptop = await prisma.product.create({
    data: {
      storeId: techStore.id,
      name: "ProBook Laptop 15",
      description: "15-inch laptop with Ryzen 7 processor",
      price: 999.99,
    },
  });

  await prisma.sku.create({
    data: {
      productId: laptop.id,
      code: "PB15-256-SG",
      price: 999.99,
      quantity: 25,
      skuAttributeOptions: {
        create: [
          {
            attributeOptionId: storage.options.find((o) => o.value === "256GB")!
              .id,
          },
          {
            attributeOptionId: techColor.options.find(
              (o) => o.value === "Space Gray",
            )!.id,
          },
        ],
      },
    },
  });

  await prisma.sku.create({
    data: {
      productId: laptop.id,
      code: "PB15-512-SV",
      price: 1199.99,
      quantity: 15,
      skuAttributeOptions: {
        create: [
          {
            attributeOptionId: storage.options.find((o) => o.value === "512GB")!
              .id,
          },
          {
            attributeOptionId: techColor.options.find(
              (o) => o.value === "Silver",
            )!.id,
          },
        ],
      },
    },
  });

  const headphones = await prisma.product.create({
    data: {
      storeId: techStore.id,
      name: "SoundWave Pro Headphones",
      description: "Wireless noise-cancelling over-ear headphones",
      price: 249.99,
    },
  });

  const hpSku = await prisma.sku.create({
    data: {
      productId: headphones.id,
      code: "SWP-BLK",
      price: 249.99,
      quantity: 50,
    },
  });

  const charger = await prisma.product.create({
    data: {
      storeId: techStore.id,
      name: "PowerDock USB-C Charger",
      description: "65W GaN USB-C fast charger",
      price: 39.99,
    },
  });

  const chargerSku = await prisma.sku.create({
    data: {
      productId: charger.id,
      code: "PDC-65W",
      price: 39.99,
      quantity: 120,
    },
  });

  // --- Urban Threads products ---
  const hoodie = await prisma.product.create({
    data: {
      storeId: clothingStore.id,
      name: "Classic Pullover Hoodie",
      description: "Heavyweight cotton blend hoodie",
      price: 59.99,
    },
  });

  for (const colorOpt of [color.options[0], color.options[2]]) {
    for (const sizeOpt of size.options) {
      await prisma.sku.create({
        data: {
          productId: hoodie.id,
          code: `CPH-${colorOpt.value.substring(0, 3).toUpperCase()}-${sizeOpt.value}`,
          price: 59.99,
          quantity: 30,
          skuAttributeOptions: {
            create: [
              { attributeOptionId: colorOpt.id },
              { attributeOptionId: sizeOpt.id },
            ],
          },
        },
      });
    }
  }

  const tee = await prisma.product.create({
    data: {
      storeId: clothingStore.id,
      name: "Essential Crew Tee",
      description: "100% organic cotton t-shirt",
      price: 24.99,
    },
  });

  for (const colorOpt of color.options) {
    for (const sizeOpt of [size.options[0], size.options[1], size.options[2]]) {
      await prisma.sku.create({
        data: {
          productId: tee.id,
          code: `ECT-${colorOpt.value.substring(0, 3).toUpperCase()}-${sizeOpt.value}`,
          price: 24.99,
          quantity: 50,
          skuAttributeOptions: {
            create: [
              { attributeOptionId: colorOpt.id },
              { attributeOptionId: sizeOpt.id },
            ],
          },
        },
      });
    }
  }

  console.log("Seeding orders...");

  // Charlie buys from TechZone
  await prisma.order.create({
    data: {
      userId: charlie.id,
      storeId: techStore.id,
      totalPrice: 289.98,
      status: "confirmed",
      orderItems: {
        create: [
          { skuId: hpSku.id, quantity: 1, price: 249.99 },
          { skuId: chargerSku.id, quantity: 1, price: 39.99 },
        ],
      },
    },
  });

  // Alice buys from Urban Threads
  const hoodieSku = await prisma.sku.findFirst({
    where: { code: "CPH-BLA-M" },
  });

  const teeSku = await prisma.sku.findFirst({
    where: { code: "ECT-WHI-L" },
  });

  if (hoodieSku && teeSku) {
    await prisma.order.create({
      data: {
        userId: alice.id,
        storeId: clothingStore.id,
        totalPrice: 109.97,
        status: "pending",
        orderItems: {
          create: [
            { skuId: hoodieSku.id, quantity: 1, price: 59.99 },
            { skuId: teeSku.id, quantity: 2, price: 24.99 },
          ],
        },
      },
    });
  }

  console.log("Seed complete!");
  console.log({
    users: ["alice@example.com", "bob@example.com", "charlie@example.com"],
    password: "password123",
    stores: [
      "TechZone (owner: alice, staff: bob)",
      "Urban Threads (owner: bob, staff: charlie)",
    ],
  });
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
